import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ritualeEinstellungen } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";

// Hilfsfunktion: Zufalls-Suffix für S3-Keys
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

export const ritualeRouter = router({

  // Einstellungen laden (oder Defaults zurückgeben)
  einstellungenLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [einstellungen] = await db.select()
      .from(ritualeEinstellungen)
      .where(eq(ritualeEinstellungen.userId, ctx.user.id))
      .limit(1);

    return einstellungen ?? null;
  }),

  // Einstellungen speichern (upsert)
  einstellungenSpeichern: protectedProcedure
    .input(z.object({
      // Bewegungspausen
      pausenTimerAktiv: z.boolean().optional(),
      arbeitsMinuten: z.number().min(5).max(120).optional(),
      pausenMinuten: z.number().min(1).max(30).optional(),
      pausenPushAktiv: z.boolean().optional(),
      pausenVon: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      pausenBis: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      // Morgenerwachen
      weckerAktiv: z.boolean().optional(),
      weckzeit: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      weckTage: z.number().min(0).max(127).optional(),
      morgentext: z.string().max(2000).optional(),
      morgenMusikUrl: z.string().url().optional().or(z.literal("")),
      morgenMusikTitel: z.string().max(255).optional(),
      musikLautstaerke: z.number().min(0).max(100).optional(),
      maStimmeAktiv: z.boolean().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      const [existing] = await db.select()
        .from(ritualeEinstellungen)
        .where(eq(ritualeEinstellungen.userId, ctx.user.id))
        .limit(1);

      const updateData: Record<string, any> = {};
      if (input.pausenTimerAktiv !== undefined) updateData.pausenTimerAktiv = input.pausenTimerAktiv;
      if (input.arbeitsMinuten !== undefined) updateData.arbeitsMinuten = input.arbeitsMinuten;
      if (input.pausenMinuten !== undefined) updateData.pausenMinuten = input.pausenMinuten;
      if (input.pausenPushAktiv !== undefined) updateData.pausenPushAktiv = input.pausenPushAktiv;
      if (input.pausenVon !== undefined) updateData.pausenVon = input.pausenVon;
      if (input.pausenBis !== undefined) updateData.pausenBis = input.pausenBis;
      if (input.weckerAktiv !== undefined) updateData.weckerAktiv = input.weckerAktiv;
      if (input.weckzeit !== undefined) updateData.weckzeit = input.weckzeit;
      if (input.weckTage !== undefined) updateData.weckTage = input.weckTage;
      if (input.morgentext !== undefined) updateData.morgentext = input.morgentext;
      if (input.morgenMusikUrl !== undefined) updateData.morgenMusikUrl = input.morgenMusikUrl || null;
      if (input.morgenMusikTitel !== undefined) updateData.morgenMusikTitel = input.morgenMusikTitel;
      if (input.musikLautstaerke !== undefined) updateData.musikLautstaerke = input.musikLautstaerke;
      if (input.maStimmeAktiv !== undefined) updateData.maStimmeAktiv = input.maStimmeAktiv;

      if (existing) {
        await db.update(ritualeEinstellungen)
          .set(updateData)
          .where(eq(ritualeEinstellungen.userId, ctx.user.id));
      } else {
        await db.insert(ritualeEinstellungen).values({
          userId: ctx.user.id,
          ...updateData,
        });
      }

      return { success: true };
    }),

  // MA generiert personalisierten Morgentext
  morgenTextGenerieren: protectedProcedure
    .input(z.object({
      vorname: z.string().optional(),
      stimmung: z.string().optional(),
      intention: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const name = input.vorname || ctx.user.name || "du";

      const systemPrompt = `Du bist MA – ein persönlicher KI-Assistent mit einer warmen, poetischen Stimme.
Du verfasst kurze, stimmungsvolle Morgenbegrüßungen für ${name}.
Der Text soll beim Erwachen gesprochen werden – ruhig, einladend, motivierend.
Maximal 80 Wörter. Deutsch. Kein "Guten Morgen" am Anfang – beginne direkt mit einer Metapher oder einem Bild.`;

      const userPrompt = `Schreibe einen Morgenerwachen-Text für ${name}.
${input.stimmung ? `Aktuelle Stimmung/Energie: ${input.stimmung}` : ""}
${input.intention ? `Intention für heute: ${input.intention}` : ""}

Der Text soll MA vorlesen – warm, persönlich, wie ein guter Freund der einen sanft weckt.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      const rawContent = response.choices[0]?.message?.content;
      const text = typeof rawContent === "string" ? rawContent : "Guten Morgen. Ein neuer Tag beginnt.";

      return { text };
    }),

  // Musik-Upload: Datei als Base64 empfangen und in S3 speichern
  musikHochladen: protectedProcedure
    .input(z.object({
      dateiname: z.string(),
      mimeType: z.string(),
      base64: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const erlaubteMimeTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/ogg", "audio/m4a", "audio/aac"];
      if (!erlaubteMimeTypes.includes(input.mimeType)) {
        throw new Error("Nicht unterstütztes Audioformat. Erlaubt: MP3, WAV, OGG, M4A, AAC");
      }

      const buffer = Buffer.from(input.base64, "base64");
      if (buffer.length > 20 * 1024 * 1024) {
        throw new Error("Datei zu groß. Maximum: 20 MB");
      }

      const ext = input.dateiname.split(".").pop() ?? "mp3";
      const key = `rituale/${ctx.user.id}/morgenmusik-${randomSuffix()}.${ext}`;
      const { url } = await storagePut(key, buffer, input.mimeType);

      return { url, titel: input.dateiname.replace(/\.[^.]+$/, "") };
    }),

  // Wecker-Check: Soll heute geweckt werden? (wird vom Frontend periodisch aufgerufen)
  weckerPruefen: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { wecken: false };

    const [einstellungen] = await db.select()
      .from(ritualeEinstellungen)
      .where(eq(ritualeEinstellungen.userId, ctx.user.id))
      .limit(1);

    if (!einstellungen || !einstellungen.weckerAktiv || !einstellungen.weckzeit) {
      return { wecken: false };
    }

    const jetzt = new Date();
    const [stunden, minuten] = einstellungen.weckzeit.split(":").map(Number);
    const weckMs = new Date(jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate(), stunden, minuten, 0).getTime();

    // Wochentag-Bitmask prüfen (0=Mo, 6=So; JS: 0=So, 1=Mo, ...)
    const jsTag = jetzt.getDay(); // 0=So
    const bitTag = jsTag === 0 ? 6 : jsTag - 1; // 0=Mo, 6=So
    const tagAktiv = (einstellungen.weckTage & (1 << bitTag)) !== 0;

    if (!tagAktiv) return { wecken: false };

    // Nur wecken wenn innerhalb 2-Minuten-Fenster und heute noch nicht geweckt
    const diffMs = Math.abs(Date.now() - weckMs);
    const heuteGeweckt = einstellungen.letzterWeckMs
      ? einstellungen.letzterWeckMs >= weckMs && einstellungen.letzterWeckMs < weckMs + 5 * 60 * 1000
      : false;

    if (diffMs <= 2 * 60 * 1000 && !heuteGeweckt) {
      // Letzten Weckzeitpunkt speichern
      await db.update(ritualeEinstellungen)
        .set({ letzterWeckMs: Date.now() })
        .where(eq(ritualeEinstellungen.userId, ctx.user.id));

      return {
        wecken: true,
        morgentext: einstellungen.morgentext,
        morgenMusikUrl: einstellungen.morgenMusikUrl,
        morgenMusikTitel: einstellungen.morgenMusikTitel,
        musikLautstaerke: einstellungen.musikLautstaerke,
        maStimmeAktiv: einstellungen.maStimmeAktiv,
      };
    }

    return { wecken: false };
  }),
});
