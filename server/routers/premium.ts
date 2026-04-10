import { z } from "zod";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getPremiumSettings, setPremiumFeature } from "../db";
import { TRPCError } from "@trpc/server";

const premiumFeatureSchema = z.enum(["momentaufnahme", "befindlichkeitstraining", "trainingscenter"]);

export const premiumRouter = router({
  /**
   * Öffentlich: Gibt den aktuellen Status aller Premium-Features zurück.
   * Wird von der Startseite abgefragt um Sperren dynamisch zu steuern.
   */
  getSettings: publicProcedure.query(async () => {
    return await getPremiumSettings();
  }),

  /**
   * Admin-only: Schaltet einen Premium-Bereich ein oder aus.
   */
  toggleFeature: protectedProcedure
    .input(
      z.object({
        feature: premiumFeatureSchema,
        enabled: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins können Premium-Bereiche steuern." });
      }
      await setPremiumFeature(input.feature, input.enabled);
      return { success: true };
    }),
});
