import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { notifyOwner } from "../_core/notification";
import {
  evaluateHealthScreening,
  saveHealthScreening,
  getLatestHealthScreening,
  isUserApprovedForRaum36,
  uploadAttestationAndApprove,
  type HealthScreeningInput,
} from "../_core/healthScreening";
import { TRPCError } from "@trpc/server";

/**
 * Health Screening Router – Sorgfaltspflichten § 630e BGB
 * 
 * Procedures für Anamnesebefragung vor RAUM 36 Aktivierung
 */

const healthScreeningInputSchema = z.object({
  hasHighBloodPressure: z.boolean(),
  hasAsthma: z.boolean(),
  hasHeartArrhythmia: z.boolean(),
  hasEpilepsy: z.boolean(),
  isPregnant: z.boolean(),
  hasRecentSurgery: z.boolean(),
  hasAnxietyDisorder: z.boolean(),
  hasDepression: z.boolean(),
  hasSleepDisorder: z.boolean(),
  hasMentalIllness: z.boolean(),
  hasSubstanceAbuse: z.boolean(),
  disclaimerAccepted: z.boolean(),
  notes: z.string().optional(),
});

export const healthScreeningRouter = router({
  /**
   * Startet Health Screening für RAUM 36
   * Gibt Evaluation zurück (approved, excluded, oder pending_attestation)
   */
  submitScreening: protectedProcedure
    .input(healthScreeningInputSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const screeningInput: HealthScreeningInput = {
          userId: ctx.user.id,
          ...input,
          ipAddress: ctx.req.ip,
        };

        // Evaluiere Screening
        const evaluation = evaluateHealthScreening(screeningInput);

        // Speichere Screening
        await saveHealthScreening(screeningInput, evaluation);

        return {
          success: true,
          evaluation,
        };
      } catch (error: any) {
        console.error("[HealthScreening] Error submitting screening:", error);
        // Fehler-Monitoring: Owner sofort benachrichtigen
        await notifyOwner({
          title: "🚨 Health Screening Fehler",
          content: `User ${ctx.user.id} konnte Health Screening nicht abschließen.\n\nFehler: ${error?.message ?? String(error)}\n\nZeitpunkt: ${new Date().toISOString()}`,
        }).catch(() => {});
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to submit health screening",
        });
      }
    }),

  /**
   * Ruft aktuelles Health Screening ab
   */
  getLatest: protectedProcedure.query(async ({ ctx }) => {
    try {
      const screening = await getLatestHealthScreening(ctx.user.id);
      return screening;
    } catch (error) {
      console.error("[HealthScreening] Error retrieving screening:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to retrieve health screening",
      });
    }
  }),

  /**
   * Prüft ob Nutzer für RAUM 36 freigegeben ist
   */
  isApprovedForRaum36: protectedProcedure.query(async ({ ctx }) => {
    try {
      const approved = await isUserApprovedForRaum36(ctx.user.id);
      return { approved };
    } catch (error) {
      console.error("[HealthScreening] Error checking approval:", error);
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to check RAUM 36 approval",
      });
    }
  }),

  /**
   * Lädt ärztliches Attest hoch und genehmigt Screening
   */
  uploadAttestation: protectedProcedure
    .input(
      z.object({
        attestationUrl: z.string().url(),
        physicianName: z.string(),
        attestationDate: z.string(), // YYYY-MM-DD
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validiere Datum
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(input.attestationDate)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Invalid date format. Use YYYY-MM-DD",
          });
        }

        await uploadAttestationAndApprove(
          ctx.user.id,
          input.attestationUrl,
          input.physicianName,
          input.attestationDate
        );

        return { success: true };
      } catch (error) {
        console.error("[HealthScreening] Error uploading attestation:", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to upload attestation",
        });
      }
    }),
});
