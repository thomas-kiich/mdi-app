import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  getOrCreateEinladungsCode,
  verarbeiteEinladungsCode,
  getReferralsVonUser,
} from "../db";
import { notifyOwner } from "../_core/notification";

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
