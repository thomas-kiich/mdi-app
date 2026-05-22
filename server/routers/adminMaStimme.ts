/**
 * Admin-Router: MA-Stimmgenerierung
 * Ermöglicht Thomas, beliebige Texte mit der MA-Stimme (Voxtral TTS) zu generieren,
 * als MP3 herunterzuladen und optional auf S3 zu speichern.
 */

import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { generiereAudioMitVoxtral } from "../_core/voxtralTts";
import { storagePut } from "../storage";
import { getDb } from "../db";
import { ttsNutzungslog } from "../../drizzle/schema";

// Maximale Textlänge für Admin-Generierung (großzügiger als User-Limit)
const MAX_ADMIN_TEXT = 12000;

export const adminMaStimmeRouter = router({
  /**
   * Text mit MA-Stimme generieren und als Base64-MP3 zurückgeben.
   * Das Audio wird direkt im Browser abgespielt / heruntergeladen.
   */
  generiere: protectedProcedure
    .input(z.object({
      text: z.string().min(1, "Text darf nicht leer sein").max(MAX_ADMIN_TEXT, `Text darf maximal ${MAX_ADMIN_TEXT} Zeichen haben`),
      titel: z.string().max(200).optional(), // Optionaler Titel für Logging
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
      }

      const db = await getDb();

      const audioBuffer = await generiereAudioMitVoxtral({
        text: input.text,
        onLog: async (zeichenAnzahl) => {
          if (!db) return;
          await db.insert(ttsNutzungslog).values({
            userId: ctx.user.id,
            kontext: "admin-ma-stimme",
            zeichen: zeichenAnzahl,
            createdAt: new Date(),
          }).catch(() => {}); // Logging-Fehler nicht weiterwerfen
        },
      });

      // Als Base64 zurückgeben (direkt im Browser abspielbar)
      const base64Audio = audioBuffer.toString("base64");
      const zeichenAnzahl = input.text.length;

      return {
        audioBase64: base64Audio,
        mimeType: "audio/mpeg",
        zeichenAnzahl,
        textVorschau: input.text.slice(0, 100) + (input.text.length > 100 ? "…" : ""),
      };
    }),

  /**
   * Generierten Audio-Buffer auf S3 speichern und permanente URL zurückgeben.
   * Nützlich um Audio für Episoden, Trainings oder Newsletter-Anhänge zu speichern.
   */
  speichereAufS3: protectedProcedure
    .input(z.object({
      audioBase64: z.string(),
      dateiname: z.string().max(200).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
      }

      const audioBuffer = Buffer.from(input.audioBase64, "base64");
      const zeitstempel = Date.now();
      const dateiname = input.dateiname
        ? input.dateiname.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß]/g, "_").slice(0, 80)
        : `ma-stimme-${zeitstempel}`;
      const fileKey = `admin-ma-stimme/${dateiname}_${zeitstempel}.mp3`;

      const { url } = await storagePut(fileKey, audioBuffer, "audio/mpeg");

      return {
        url,
        fileKey,
        dateiname: `${dateiname}.mp3`,
      };
    }),
});
