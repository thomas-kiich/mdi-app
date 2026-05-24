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
import { sendeVoranmeldungStimmklang, sendeRaum36Neuigkeit, Raum36NeuigkeitTyp } from "../_core/email";
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
      try {
      const stripe = getStripe();
      const priceId = await getRaum36PriceId();

      const session = await stripe.checkout.sessions.create({
        mode: "subscription",
        payment_method_types: ["card", "paypal"],
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
      } catch (error: any) {
        // Fehler-Monitoring: Owner sofort benachrichtigen
        await notifyOwner({
          title: "🚨 RAUM 36 Checkout Fehler",
          content: `User ${ctx.user.id} (${ctx.user.email}) konnte nicht zu Stripe weitergeleitet werden.\n\nFehler: ${error?.message ?? String(error)}\n\nZeitpunkt: ${new Date().toISOString()}`,
        }).catch(() => {}); // Notification-Fehler nicht weiterwerfen
        throw error;
      }
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
        payment_method_types: ["card", "paypal"],
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

      // Frage + User-E-Mail holen
      const [frage] = await db
        .select({
          id: raum36Fragen.id,
          frage: raum36Fragen.frage,
          pseudonym: raum36Fragen.pseudonym,
          userId: raum36Fragen.userId,
          userEmail: users.email,
          userName: users.name,
        })
        .from(raum36Fragen)
        .leftJoin(users, eq(raum36Fragen.userId, users.id))
        .where(eq(raum36Fragen.id, input.frageId));

      // Antwort speichern
      await db
        .update(raum36Fragen)
        .set({ antwort: input.antwort, beantwortetAt: new Date() })
        .where(eq(raum36Fragen.id, input.frageId));

      // E-Mail an Fragesteller senden
      if (frage?.userEmail) {
        const { sendEmail } = await import("../_core/email");
        const frageKurz = frage.frage.length > 120 ? frage.frage.slice(0, 120) + "…" : frage.frage;
        await sendEmail({
          to: [{ name: frage.userName ?? frage.pseudonym ?? undefined, email: frage.userEmail }],
          subject: "Thomas hat deine Frage im RAUM 36 beantwortet",
          htmlContent: `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#0a0a0a;color:#e5e5e5;padding:32px;">
              <div style="border-bottom:1px solid #333;padding-bottom:16px;margin-bottom:24px;">
                <span style="color:#f97316;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:monospace;">RAUM 36</span>
              </div>
              <h2 style="font-size:20px;font-weight:600;margin:0 0 16px;">Thomas hat deine Frage beantwortet</h2>
              <div style="background:#1a1a1a;border-left:3px solid #555;padding:12px 16px;margin-bottom:20px;">
                <p style="color:#999;font-size:12px;margin:0 0 6px;font-family:monospace;">${frage.pseudonym ?? "Du"} fragte:</p>
                <p style="margin:0;color:#ccc;">${frageKurz}</p>
              </div>
              <div style="background:#1a1a1a;border-left:3px solid #f97316;padding:12px 16px;margin-bottom:28px;">
                <p style="color:#f97316;font-size:12px;margin:0 0 6px;font-family:monospace;">Thomas antwortet:</p>
                <p style="margin:0;color:#e5e5e5;white-space:pre-line;">${input.antwort}</p>
              </div>
              <a href="https://kiich.de/raum36" style="display:inline-block;background:#f97316;color:#fff;text-decoration:none;padding:12px 24px;font-weight:bold;font-size:14px;letter-spacing:1px;">ZUM RAUM 36</a>
              <p style="color:#555;font-size:12px;margin-top:32px;">Du erhältst diese E-Mail weil du Mitglied im RAUM 36 bist.</p>
            </div>
          `,
          textContent: `Thomas hat deine Frage beantwortet:\n\nDeine Frage: ${frage.frage}\n\nAntwort von Thomas:\n${input.antwort}\n\nZum RAUM 36: https://kiich.de/raum36`,
        }).catch((e) => console.error("[Raum36] Benachrichtigungs-E-Mail fehlgeschlagen:", e));
      }

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
        typ: z.enum(["podcast", "artikel", "fakt", "video", "tool", "audio", "sonstiges"]),
        url: z.string().url().optional().or(z.literal("")),
        audioUrl: z.string().url().optional().or(z.literal("")),
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
        url: input.url || undefined,
        audioUrl: input.audioUrl || undefined,
        published: input.published,
      });
      return { success: true };
    }),

  /**
   * Admin: Wissenspool-Eintrag aktualisieren
   */
  adminUpdateWissenspool: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titel: z.string().min(1).max(255),
        beschreibung: z.string().optional(),
        typ: z.enum(["podcast", "artikel", "fakt", "video", "tool", "audio", "sonstiges"]),
        url: z.string().url().optional().or(z.literal("")),
        audioUrl: z.string().url().optional().or(z.literal("")),
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(raum36Wissenspool).set({
        titel: input.titel,
        beschreibung: input.beschreibung,
        typ: input.typ,
        url: input.url || null,
        audioUrl: input.audioUrl || null,
        published: input.published,
      }).where(eq(raum36Wissenspool.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: Wissenspool-Eintrag löschen
   */
  adminDeleteWissenspool: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(raum36Wissenspool).where(eq(raum36Wissenspool.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: Alle Wissenspool-Einträge (auch unpublished)
   */
  adminGetWissenspool: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(raum36Wissenspool).orderBy(desc(raum36Wissenspool.createdAt));
  }),

  /**
   * Admin: Post (Wochenvideo) aktualisieren
   */
  adminUpdatePost: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        titel: z.string().min(1).max(255),
        beschreibung: z.string().optional(),
        videoUrl: z.string().url().optional().or(z.literal("")),
        thumbnailUrl: z.string().url().optional().or(z.literal("")),
        published: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(raum36Posts).set({
        titel: input.titel,
        beschreibung: input.beschreibung,
        videoUrl: input.videoUrl || null,
        thumbnailUrl: input.thumbnailUrl || null,
        published: input.published,
      }).where(eq(raum36Posts.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: Post (Wochenvideo) löschen
   */
  adminDeletePost: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(raum36Posts).where(eq(raum36Posts.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: Alle Posts (auch unpublished)
   */
  adminGetPosts: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db.select().from(raum36Posts).orderBy(desc(raum36Posts.createdAt));
  }),

  /**
   * Admin: Frage löschen
   */
  adminDeleteFrage: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(raum36Fragen).where(eq(raum36Fragen.id, input.id));
      return { success: true };
    }),

  /**
   * Admin: Audio-Datei auf S3 hochladen und CDN-URL zurückgeben
   */
  adminGetAudioUploadUrl: protectedProcedure
    .input(z.object({ filename: z.string(), contentType: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const { storagePut } = await import("../storage");
      const suffix = Math.random().toString(36).substring(2, 10);
      const ext = input.filename.split(".").pop() ?? "mp3";
      const key = `raum36/wissenspool/${Date.now()}-${suffix}.${ext}`;
      // Platzhalter-Upload mit leerem Buffer um die URL zu generieren
      // Der eigentliche Upload erfolgt direkt vom Frontend via presigned URL
      // Hier geben wir nur den Key zurück – Frontend uploaded direkt
      return { key, uploadPath: `/api/raum36/upload-audio?key=${encodeURIComponent(key)}` };
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
   * Admin: Neuigkeit an alle aktiven RAUM 36-Mitglieder senden
   */
  adminSendeNeuigkeit: protectedProcedure
    .input(
      z.object({
        typ: z.enum(["training", "wissenspool", "technik", "allgemein"]),
        titel: z.string().min(3).max(120),
        text: z.string().min(10).max(2000),
        linkUrl: z.string().url().optional(),
        linkLabel: z.string().max(60).optional(),
        nurTest: z.boolean().default(false), // true = nur an Thomas senden
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      let empfaenger: Array<{ name: string | null; email: string }>;

      if (input.nurTest) {
        // Nur Test-Versand an Thomas
        empfaenger = [{ name: "Thomas Chochola", email: "lkrforschung@gmail.com" }];
      } else {
        // Alle aktiven RAUM 36-Mitglieder mit E-Mail
        const rows = await db
          .select({
            name: users.name,
            email: users.email,
          })
          .from(raum36Subscriptions)
          .leftJoin(users, eq(raum36Subscriptions.userId, users.id))
          .where(eq(raum36Subscriptions.status, "active"));

        empfaenger = rows
          .filter((r) => r.email != null)
          .map((r) => ({ name: r.name ?? null, email: r.email! }));
      }

      if (empfaenger.length === 0) {
        return { gesendet: 0, fehlgeschlagen: 0, empfaengerAnzahl: 0 };
      }

      const result = await sendeRaum36Neuigkeit({
        empfaenger,
        typ: input.typ as Raum36NeuigkeitTyp,
        titel: input.titel,
        text: input.text,
        linkUrl: input.linkUrl,
        linkLabel: input.linkLabel,
      });

      return { ...result, empfaengerAnzahl: empfaenger.length };
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
