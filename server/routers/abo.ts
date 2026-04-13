/**
 * Abo-Router – tRPC-Prozeduren für das Abonnement-System
 *
 * Öffentliche Prozeduren:
 * - getAboInfo: Gibt den aktuellen Abo-Status und Trial-Countdown zurück
 * - getLimitInfo: Gibt Nutzungsstand und Limits zurück
 *
 * Admin-Prozeduren:
 * - setEbene: Setzt die Ebene eines Users manuell (für Tests und Sonderregelungen)
 * - alleAbos: Übersicht aller Abonnements
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getAboInfo, getLimitInfo, PLAENE, generiereBeataCode, betaCodeEinloesen, hatFeature, FEATURES } from "../abo";
import type { Feature } from "../abo";
import { getDb } from "../db";
import { abonnements, betaInvites } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const aboRouter = router({
  /**
   * Gibt den aktuellen Abo-Status des eingeloggten Users zurück.
   * Erstellt automatisch einen Trial-Eintrag für neue User.
   */
  getAboInfo: protectedProcedure.query(async ({ ctx }) => {
    return await getAboInfo(ctx.user.id);
  }),

  /**
   * Gibt den Nutzungsstand und die Limits für den aktuellen Monat zurück.
   */
  getLimitInfo: protectedProcedure.query(async ({ ctx }) => {
    const aboInfo = await getAboInfo(ctx.user.id);
    const limitInfo = await getLimitInfo(ctx.user.id, aboInfo);
    return { aboInfo, limitInfo };
  }),

  /**
   * Gibt alle verfügbaren Pläne zurück (für Preisseite).
   */
  plaene: protectedProcedure.query(async () => {
    return PLAENE;
  }),

  /**
   * Prüft ob der aktuelle Nutzer ein bestimmtes Feature nutzen darf.
   */
  hatFeature: protectedProcedure
    .input(z.object({ feature: z.string() }))
    .query(async ({ ctx, input }) => {
      const aboInfo = await getAboInfo(ctx.user.id);
      const feature = input.feature as Feature;
      if (!(feature in FEATURES)) return { erlaubt: false };
      return { erlaubt: hatFeature(aboInfo.effektiveEbene, feature) };
    }),

  /**
   * Admin: Setzt die Ebene eines Users manuell.
   */
  setEbene: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        ebene: z.enum(["free", "essential", "complete", "pro", "beta"]),
        status: z.enum(["trial", "active", "cancelled", "expired", "beta"]).default("active"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar." });

      const existing = await db
        .select()
        .from(abonnements)
        .where(eq(abonnements.userId, input.userId))
        .then(r => r[0]);

      if (existing) {
        await db
          .update(abonnements)
          .set({ ebene: input.ebene, status: input.status })
          .where(eq(abonnements.userId, input.userId));
      } else {
        const now = new Date();
        const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        await db.insert(abonnements).values({
          userId: input.userId,
          ebene: input.ebene,
          status: input.status,
          trialStartedAt: now,
          trialEndsAt: trialEnd,
        });
      }

      return { success: true };
    }),

  /**
   * Admin: Übersicht aller Abonnements.
   */
  alleAbos: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
    }
    const db = await getDb();
    if (!db) return [];
    return db.select().from(abonnements);
  }),

  // ─── Beta-Einladungen ────────────────────────────────────────────────────

  /**
   * Admin: Erstellt einen oder mehrere Beta-Einladungscodes.
   */
  betaCodeErstellen: protectedProcedure
    .input(
      z.object({
        email: z.string().email().optional(),
        notiz: z.string().max(256).optional(),
        anzahl: z.number().min(1).max(50).default(1),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins können Beta-Codes erstellen." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const codes: string[] = [];
      for (let i = 0; i < input.anzahl; i++) {
        const code = generiereBeataCode();
        await db.insert(betaInvites).values({
          code,
          email: input.email,
          notiz: input.notiz,
          aktiv: true,
        });
        codes.push(code);
      }
      return { codes };
    }),

  /**
   * Admin: Listet alle Beta-Codes auf.
   */
  betaCodesListe: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return [];
    return db.select().from(betaInvites).orderBy(betaInvites.createdAt);
  }),

  /**
   * Nutzer: Löst einen Beta-Code ein.
   */
  betaCodeEinloesen: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(32) }))
    .mutation(async ({ ctx, input }) => {
      try {
        return await betaCodeEinloesen(ctx.user.id, input.code);
      } catch (err: any) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: err.message ?? "Beta-Code konnte nicht eingelöst werden.",
        });
      }
    }),
});
