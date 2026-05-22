/**
 * Admin-Router: MA-Stimmgenerierung
 * Generiert Audio mit der MA-Stimme (Voxtral TTS) und speichert auf S3
 */
import { z } from "zod";
import { adminProcedure, router } from "../_core/trpc";
import { generiereAudioMitVoxtral } from "../_core/voxtralTts";
import { storagePut } from "../storage";

export const adminMaStimmeRouter = router({
  generateAudio: adminProcedure
    .input(
      z.object({
        text: z.string().min(1).max(12000),
        titel: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const audioBuffer = await generiereAudioMitVoxtral({ text: input.text });
      const timestamp = Date.now();
      const safeTitel = (input.titel || "ma-stimme")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "-")
        .slice(0, 40);
      const fileKey = `ma-stimme/${timestamp}_${safeTitel}.mp3`;
      const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");
      return { url, fileKey };
    }),
});
