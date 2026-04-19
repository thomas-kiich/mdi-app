import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getOrCreateEinladungsCode,
  verarbeiteEinladungsCode,
  getReferralsVonUser,
} from "../db";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { referrals, einladungsCodes, users } from "../../drizzle/schema";
import { eq, desc, count } from "drizzle-orm";

export const referralRouter = router({
  /**
   * Gibt den persönlichen Einladungscode des eingeloggten Users zurück.
   * Erstellt einen neuen Code falls noch keiner existiert.
   */
  meinCode: protectedProcedure.query(async ({ ctx }) => {
    const code = await getOrCreateEinladungsCode(ctx.user.id);
    return { code };
  }),

  /**
   * Gibt alle erfolgreichen Einladungen des eingeloggten Users zurück.
   */
  meineEinladungen: protectedProcedure.query(async ({ ctx }) => {
    const einladungen = await getReferralsVonUser(ctx.user.id);
    return { einladungen };
  }),

  /**
   * Admin-only: Gibt vollständige Referral-Statistik zurück.
   */
  adminStats: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return { einladungsCode: null, gesamtEinladungen: 0, einladungen: [] };

    // Einladungscode des Admins
    const codeRow = await db
      .select()
      .from(einladungsCodes)
      .where(eq(einladungsCodes.userId, ctx.user.id))
      .limit(1);
    const einladungsCode = codeRow[0]?.code ?? null;
    const anzahl = codeRow[0]?.anzahlEinladungen ?? 0;

    // Liste aller geworbenen User
    const einladungenRows = await db
      .select({
        id: referrals.id,
        referredUserId: referrals.referredUserId,
        createdAt: referrals.createdAt,
        name: users.name,
        email: users.email,
      })
      .from(referrals)
      .leftJoin(users, eq(referrals.referredUserId, users.id))
      .where(eq(referrals.referrerId, ctx.user.id))
      .orderBy(desc(referrals.createdAt))
      .limit(50);

    return {
      einladungsCode,
      gesamtEinladungen: anzahl,
      einladungen: einladungenRows,
    };
  }),

  /**
   * Verarbeitet einen Einladungscode beim ersten Login.
   * Wird vom Frontend aufgerufen wenn ein ?ref=CODE Parameter in der URL ist.
   */
  codeEinloesen: protectedProcedure
    .input(z.object({ code: z.string().min(1).max(16) }))
    .mutation(async ({ ctx, input }) => {
      const ergebnis = await verarbeiteEinladungsCode({
        code: input.code,
        neuenUserId: ctx.user.id,
      });

      if (!ergebnis) {
        return { erfolg: false };
      }

      // Einladenden benachrichtigen
      const neuerName = ctx.user.name ?? "Jemand";
      await notifyOwner({
        title: `🎉 Neue Einladung erfolgreich!`,
        content: `${neuerName} ist über deinen Einladungslink beigetreten. Du hast eine neue Verbindung geknüpft!`,
      });

      return { erfolg: true, referrerId: ergebnis.referrerId };
    }),
});
