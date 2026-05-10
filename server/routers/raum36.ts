/**
 * RAUM 36 – tRPC-Router
 *
 * Procedures:
 * - getStatus: Abo-Status des aktuellen Nutzers
 * - createCheckoutRaum36: Stripe Checkout für RAUM 36 Abo
 * - createCheckoutStimmklang: Stripe Checkout für Stimmklanganalyse
 * - setPseudonym: Pseudonym setzen (einmalig beim ersten Eintritt)
 * - getFragen: Alle sichtbaren Fragen + Antworten
 * - stelleFrage: Neue Frage stellen (nur für aktive Mitglieder)
 * - getPosts: Wochenvideo-Posts abrufen
 * - getWissenspool: Wissenspool-Einträge abrufen
 * - admin.*: Admin-Procedures für Thomas
 */

import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { sendeVoranmeldungStimmklang } from "../_core/email";
import { notifyOwner } from "../_core/notification";
import { getDb } from "../db";
import { raum36Subscriptions, raum36Fragen, raum36Posts, raum36Wissenspool, stimmklanganalyseOrders, users } from "../../drizzle/schema";
import { eq, desc, and, sql } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { getStripe, getRaum36PriceId, getStimmklanganalysePriceId } from "../stripe/products";

// Hilfsfunktion: Prüft ob Nutzer aktives RAUM 36 Abo hat
async function hasActiveRaum36(userId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;
  const sub = await db
    .select()
    .from(raum36Subscriptions)
    .where(and(eq(raum36Subscriptions.userId, userId), eq(raum36Subscriptions.status, "active")))
    .limit(1);
  return sub.length > 0;
}

// Hilfsfunktion: Gibt Subscription zurück oder null
async function getRaum36Sub(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const subs = await db
    .select()
    .from(raum36Subscriptions)
    .where(eq(raum36Subscriptions.userId, userId))
    .limit(1);
  return subs[0] ?? null;
}

export const raum36Router = router({
  /**
   * Gibt den Abo-Status und Pseudonym des aktuellen Nutzers zurück.
   */
  getStatus: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getRaum36Sub(ctx.user.id);
    // Stimmklanganalyse: bezahlte Bestellung vorhanden?
    const db = await getDb();
    const stimmklangOrder = db ? await db
      .select({ id: stimmklanganalyseOrders.id })
      .from(stimmklanganalyseOrders)
      .where(
        and(
          eq(stimmklanganalyseOrders.userId, ctx.user.id),
          eq(stimmklanganalyseOrders.status, "paid")
        )
      )
      .limit(1) : [];
    const isAdmin = ctx.user.role === "admin";
    return {
      isActive: isAdmin || sub?.status === "active",
      status: isAdmin ? "active" : (sub?.status ?? "inactive"),
      pseudonym: sub?.pseudonym ?? null,
      activatedAt: sub?.activatedAt ?? null,
      hasStimmklangAccess: isAdmin || stimmklangOrder.length > 0,
    };
  }),

  /**
   * Erstellt eine Stripe Checkout Session für das RAUM 36 Abo.
   */
  createCheckoutRaum36: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const priceId = await getRaum36PriceId();

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "sepa_debit"],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          product: "raum36_abo",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/raum36?checkout=success`,
        cancel_url: `${input.origin}/raum36?checkout=cancelled`,
      });

      return { url: session.url };
    }),

  /**
   * Erstellt eine Stripe Checkout Session für die Stimmklanganalyse.
   */
  createCheckoutStimmklang: protectedProcedure
    .input(z.object({ origin: z.string().url() }))
    .mutation(async ({ ctx, input }) => {
      const stripe = getStripe();
      const priceId = await getStimmklanganalysePriceId();

      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card", "sepa_debit", "klarna"],
        line_items: [{ price: priceId, quantity: 1 }],
        customer_email: ctx.user.email ?? undefined,
        client_reference_id: ctx.user.id.toString(),
        metadata: {
          user_id: ctx.user.id.toString(),
          customer_email: ctx.user.email ?? "",
          customer_name: ctx.user.name ?? "",
          product: "stimmklanganalyse",
        },
        allow_promotion_codes: true,
        success_url: `${input.origin}/stimmklanganalyse?checkout=success`,
        cancel_url: `${input.origin}/stimmklanganalyse?checkout=cancelled`,
      });

      return { url: session.url };
    }),

  /**
   * Setzt das Pseudonym für den RAUM 36 (einmalig oder änderbar).
   */
  setPseudonym: protectedProcedure
    .input(z.object({ pseudonym: z.string().min(2).max(64) }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "admin";
      const sub = await getRaum36Sub(ctx.user.id);
      if (!isAdmin && (!sub || sub.status !== "active")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Kein aktives RAUM 36 Abo" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(raum36Subscriptions)
        .set({ pseudonym: input.pseudonym })
        .where(eq(raum36Subscriptions.userId, ctx.user.id));

      return { success: true };
    }),

  /**
   * Gibt alle sichtbaren Fragen + Antworten zurück (für Mitglieder).
   */
  getFragen: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.user.role === "admin";
    const isActive = isAdmin || await hasActiveRaum36(ctx.user.id);
    if (!isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Kein aktives RAUM 36 Abo" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db
      .select()
      .from(raum36Fragen)
      .where(eq(raum36Fragen.sichtbar, true))
      .orderBy(desc(raum36Fragen.createdAt));
  }),

  /**
   * Stellt eine neue Frage im RAUM 36.
   */
  stelleFrage: protectedProcedure
    .input(z.object({ frage: z.string().min(10).max(2000) }))
    .mutation(async ({ ctx, input }) => {
      const isAdmin = ctx.user.role === "admin";
      const sub = await getRaum36Sub(ctx.user.id);
      if (!isAdmin && (!sub || sub.status !== "active")) {
        throw new TRPCError({ code: "FORBIDDEN", message: "Kein aktives RAUM 36 Abo" });
      }
      // Pseudonym: Admin verwendet "Thomas" als Fallback
      const pseudonym = sub?.pseudonym ?? (isAdmin ? "Thomas" : null);
      if (!pseudonym) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Bitte zuerst ein Pseudonym wählen" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(raum36Fragen).values({
        userId: ctx.user.id,
        pseudonym,
        frage: input.frage,
        sichtbar: true,
      });

      // Owner-Benachrichtigung bei neuer Frage (nicht wenn Admin selbst fragt)
      if (!isAdmin) {
        await notifyOwner({
          title: `Neue Frage im RAUM 36 von "${pseudonym}"`,
          content: `${input.frage.substring(0, 200)}${input.frage.length > 200 ? "..." : ""}`,
        }).catch(() => {}); // Fehler ignorieren – Frage wurde bereits gespeichert
      }

      return { success: true };
    }),

  /**
   * Gibt alle veröffentlichten Wochenvideo-Posts zurück.
   */
  getPosts: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.user.role === "admin";
    const isActive = isAdmin || await hasActiveRaum36(ctx.user.id);
    if (!isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Kein aktives RAUM 36 Abo" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db
      .select()
      .from(raum36Posts)
      .where(eq(raum36Posts.published, true))
      .orderBy(desc(raum36Posts.createdAt));
  }),

  /**
   * Gibt alle veröffentlichten Wissenspool-Einträge zurück.
   */
  getWissenspool: protectedProcedure.query(async ({ ctx }) => {
    const isAdmin = ctx.user.role === "admin";
    const isActive = isAdmin || await hasActiveRaum36(ctx.user.id);
    if (!isActive) {
      throw new TRPCError({ code: "FORBIDDEN", message: "Kein aktives RAUM 36 Abo" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db
      .select()
      .from(raum36Wissenspool)
      .where(eq(raum36Wissenspool.published, true))
      .orderBy(desc(raum36Wissenspool.createdAt));
  }),

  /**
   * Voranmeldung zur Stimmklanganalyse (öffentlich, kein Login nötig)
   */
  voranmeldungStimmklang: publicProcedure
    .input(
      z.object({
        name: z.string().min(2).max(100),
        email: z.string().email(),
        nachricht: z.string().min(5).max(1000),
      })
    )
    .mutation(async ({ input }) => {
      await sendeVoranmeldungStimmklang({
        name: input.name,
        email: input.email,
        nachricht: input.nachricht,
      });
      return { success: true };
    }),

  /**
   * Admin: Beantwortet eine Frage (nur Thomas/Admin)
   */
  adminAntworte: protectedProcedure
    .input(z.object({ frageId: z.number(), antwort: z.string().min(1).max(5000) }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .update(raum36Fragen)
        .set({ antwort: input.antwort, beantwortetAt: new Date() })
        .where(eq(raum36Fragen.id, input.frageId));

      return { success: true };
    }),

  /**
   * Admin: Erstellt einen neuen Wochenvideo-Post
   */
  adminCreatePost: protectedProcedure
    .input(
      z.object({
        titel: z.string().min(1).max(255),
        beschreibung: z.string().optional(),
        videoUrl: z.string().url().optional(),
        thumbnailUrl: z.string().url().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(raum36Posts).values({
        titel: input.titel,
        beschreibung: input.beschreibung,
        videoUrl: input.videoUrl,
        thumbnailUrl: input.thumbnailUrl,
        published: input.published,
      });

      return { success: true };
    }),

  /**
   * Admin: Erstellt einen Wissenspool-Eintrag
   */
  adminCreateWissenspool: protectedProcedure
    .input(
      z.object({
        titel: z.string().min(1).max(255),
        beschreibung: z.string().optional(),
        typ: z.enum(["podcast", "artikel", "fakt", "video", "tool", "sonstiges"]),
        url: z.string().url().optional(),
        published: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db.insert(raum36Wissenspool).values({
        titel: input.titel,
        beschreibung: input.beschreibung,
        typ: input.typ,
        url: input.url,
        published: input.published,
      });

      return { success: true };
    }),

  /**
   * Admin: Alle Fragen (auch unbeantwortete) anzeigen
   */
  adminGetFragen: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    return db
      .select()
      .from(raum36Fragen)
      .orderBy(desc(raum36Fragen.createdAt));
  }),

  /**
   * Admin: Alle Subscriptions anzeigen (mit User-Daten)
   */
  adminGetSubscriptions: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .select({
        id: raum36Subscriptions.id,
        userId: raum36Subscriptions.userId,
        status: raum36Subscriptions.status,
        pseudonym: raum36Subscriptions.pseudonym,
        stripeSubscriptionId: raum36Subscriptions.stripeSubscriptionId,
        stripeCustomerId: raum36Subscriptions.stripeCustomerId,
        activatedAt: raum36Subscriptions.activatedAt,
        createdAt: raum36Subscriptions.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(raum36Subscriptions)
      .leftJoin(users, eq(raum36Subscriptions.userId, users.id))
      .orderBy(desc(raum36Subscriptions.createdAt));

    return rows;
  }),

  /**
   * Admin: Alle Stimmklanganalyse-Bestellungen anzeigen (mit User-Daten)
   */
  adminGetStimmklangOrders: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const rows = await db
      .select({
        id: stimmklanganalyseOrders.id,
        userId: stimmklanganalyseOrders.userId,
        status: stimmklanganalyseOrders.status,
        stripePaymentIntentId: stimmklanganalyseOrders.stripePaymentIntentId,
        stripeCustomerId: stimmklanganalyseOrders.stripeCustomerId,
        paidAt: stimmklanganalyseOrders.paidAt,
        createdAt: stimmklanganalyseOrders.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(stimmklanganalyseOrders)
      .leftJoin(users, eq(stimmklanganalyseOrders.userId, users.id))
      .orderBy(desc(stimmklanganalyseOrders.createdAt));

    return rows;
  }),

  /**
   * Admin: Zusammenfassung aller Zahlungen (Summen + Anzahlen)
   */
  adminGetZahlungsStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }

    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

    const [raum36Active] = await db
      .select({ count: sql<number>`count(*)` })
      .from(raum36Subscriptions)
      .where(eq(raum36Subscriptions.status, "active"));

    const [raum36Total] = await db
      .select({ count: sql<number>`count(*)` })
      .from(raum36Subscriptions);

    const [stimmklangPaid] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stimmklanganalyseOrders)
      .where(eq(stimmklanganalyseOrders.status, "paid"));

    const [stimmklangTotal] = await db
      .select({ count: sql<number>`count(*)` })
      .from(stimmklanganalyseOrders);

    return {
      raum36ActiveCount: Number(raum36Active?.count ?? 0),
      raum36TotalCount: Number(raum36Total?.count ?? 0),
      raum36MonthlyRevenue: Number(raum36Active?.count ?? 0) * 4.9,
      stimmklangPaidCount: Number(stimmklangPaid?.count ?? 0),
      stimmklangTotalCount: Number(stimmklangTotal?.count ?? 0),
      stimmklangRevenue: Number(stimmklangPaid?.count ?? 0) * 150,
    };
  }),
});
