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
import { getAboInfo, getLimitInfo } from "../abo";
import { getDb } from "../db";
import { abonnements } from "../../drizzle/schema";
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
   * Admin: Setzt die Ebene eines Users manuell.
   * Nützlich für Testzwecke, Sonderregelungen und manuelle Upgrades.
   */
  setEbene: protectedProcedure
    .input(
      z.object({
        userId: z.number(),
        ebene: z.enum(["I", "II", "III"]),
        status: z.enum(["trial", "active", "cancelled", "expired"]).default("active"),
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
});
