import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { ritualeEinstellungen, ritualLogs, dankbarkeit } from "../../drizzle/schema";
import { eq, and, desc, gte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { storagePut } from "../storage";

// Hilfsfunktion: Zufalls-Suffix für S3-Keys
function randomSuffix(): string {
  return Math.random().toString(36).substring(2, 10);
}

// Hilfsfunktion: Streak aus Logs berechnen
function berechneStreak(logs: { datum: string }[], typ: string): number {
  const tage = Array.from(new Set(logs.map(l => l.datum))).sort().reverse();
  if (tage.length === 0) return 0;

  const heute = new Date().toISOString().slice(0, 10);
  const gestern = new Date(Date.now() - 86400000).toISOString().slice(0, 10);

  // Streak beginnt nur wenn heute oder gestern ein Eintrag vorhanden
  if (tage[0] !== heute && tage[0] !== gestern) return 0;

  let streak = 0;
  let pruefDatum = tage[0] === heute ? heute : gestern;

  for (const tag of tage) {
    if (tag === pruefDatum) {
      streak++;
      const d = new Date(pruefDatum);
      d.setDate(d.getDate() - 1);
      pruefDatum = d.toISOString().slice(0, 10);
    } else {
      break;
    }
  }
  return streak;
}

export const ritualeRouter = router({

  // ─── EINSTELLUNGEN ────────────────────────────────────────────────────────

  einstellungenLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;

    const [einstellungen] = await db.select()
      .from(ritualeEinstellungen)
      .where(eq(ritualeEinstellungen.userId, ctx.user.id))
      .limit(1);

    return einstellungen ?? null;
  }),

  einstellungenSpeichern: protectedProcedure
    .input(z.object({
      pausenTimerAktiv: z.boolean().optional(),
      arbeitsMinuten: z.number().min(5).max(120).optional(),
      pausenMinuten: z.number().min(1).max(30).optional(),
      pausenPushAktiv: z.boolean().optional(),
      pausenVon: z.string().regex(/^\d{2}:\d{2}$/).optional(),
      pausenBis: z.string().regex(/^\d{2}:\d{2}$/).optional(),
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

  // ─── MORGENTEXT & MUSIK ───────────────────────────────────────────────────

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

  // ─── WECKER ───────────────────────────────────────────────────────────────

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

    const jsTag = jetzt.getDay();
    const bitTag = jsTag === 0 ? 6 : jsTag - 1;
    const tagAktiv = (einstellungen.weckTage & (1 << bitTag)) !== 0;

    if (!tagAktiv) return { wecken: false };

    const diffMs = Math.abs(Date.now() - weckMs);
    const heuteGeweckt = einstellungen.letzterWeckMs
      ? einstellungen.letzterWeckMs >= weckMs && einstellungen.letzterWeckMs < weckMs + 5 * 60 * 1000
      : false;

    if (diffMs <= 2 * 60 * 1000 && !heuteGeweckt) {
      await db.update(ritualeEinstellungen)
        .set({ letzterWeckMs: Date.now() })
        .where(eq(ritualeEinstellungen.userId, ctx.user.id));

      // Morgenritual als Log eintragen
      const heute = new Date().toISOString().slice(0, 10);
      await db.insert(ritualLogs).values({
        userId: ctx.user.id,
        typ: "morgen",
        datum: heute,
        createdAtMs: Date.now(),
      });

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

  // ─── RITUAL-LOG (Pause, Atem etc. manuell protokollieren) ─────────────────

  ritualLoggen: protectedProcedure
    .input(z.object({
      typ: z.enum(["morgen", "pause", "atem", "dankbarkeit", "abend"]),
      datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      notiz: z.string().max(500).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      await db.insert(ritualLogs).values({
        userId: ctx.user.id,
        typ: input.typ,
        datum: input.datum,
        notiz: input.notiz,
        createdAtMs: Date.now(),
      });

      return { success: true };
    }),

  // ─── STREAK-STATISTIK ─────────────────────────────────────────────────────

  streakLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { morgen: 0, pause: 0, atem: 0, dankbarkeit: 0, abend: 0, gesamt: 0 };

    // Logs der letzten 60 Tage laden
    const vor60Tagen = new Date(Date.now() - 60 * 86400000).toISOString().slice(0, 10);

    const logs = await db.select()
      .from(ritualLogs)
      .where(
        and(
          eq(ritualLogs.userId, ctx.user.id),
          gte(ritualLogs.datum, vor60Tagen)
        )
      )
      .orderBy(desc(ritualLogs.createdAt));

    const typen = ["morgen", "pause", "atem", "dankbarkeit", "abend"] as const;
    const streaks: Record<string, number> = {};

    for (const typ of typen) {
      const typLogs = logs.filter(l => l.typ === typ);
      streaks[typ] = berechneStreak(typLogs, typ);
    }

    // Gesamt-Streak: Tage an denen mindestens 1 Ritual gemacht wurde
    const alleLogs = logs.map(l => ({ datum: l.datum }));
    streaks.gesamt = berechneStreak(alleLogs, "gesamt");

    // Heute abgeschlossene Rituale
    const heute = new Date().toISOString().slice(0, 10);
    const heuteTypen = Array.from(new Set(logs.filter(l => l.datum === heute).map(l => l.typ)));

    return { ...streaks, heuteTypen };
  }),

  // ─── DANKBARKEIT ──────────────────────────────────────────────────────────

  dankbarkeitLaden: protectedProcedure
    .input(z.object({ datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/) }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return null;

      const [eintrag] = await db.select()
        .from(dankbarkeit)
        .where(
          and(
            eq(dankbarkeit.userId, ctx.user.id),
            eq(dankbarkeit.datum, input.datum)
          )
        )
        .limit(1);

      return eintrag ?? null;
    }),

  dankbarkeitSpeichern: protectedProcedure
    .input(z.object({
      datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      eintrag1: z.string().max(500).optional(),
      eintrag2: z.string().max(500).optional(),
      eintrag3: z.string().max(500).optional(),
      stimmung: z.number().min(1).max(5).optional(),
      abendReflexion: z.string().max(2000).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      const [existing] = await db.select()
        .from(dankbarkeit)
        .where(
          and(
            eq(dankbarkeit.userId, ctx.user.id),
            eq(dankbarkeit.datum, input.datum)
          )
        )
        .limit(1);

      const updateData: Record<string, any> = {
        eintrag1: input.eintrag1 ?? null,
        eintrag2: input.eintrag2 ?? null,
        eintrag3: input.eintrag3 ?? null,
        stimmung: input.stimmung ?? null,
        abendReflexion: input.abendReflexion ?? null,
      };

      if (existing) {
        await db.update(dankbarkeit)
          .set(updateData)
          .where(and(eq(dankbarkeit.userId, ctx.user.id), eq(dankbarkeit.datum, input.datum)));
      } else {
        await db.insert(dankbarkeit).values({
          userId: ctx.user.id,
          datum: input.datum,
          createdAtMs: Date.now(),
          ...updateData,
        });
      }

      // Als Ritual-Log eintragen
      const bereitsGeloggt = await db.select()
        .from(ritualLogs)
        .where(
          and(
            eq(ritualLogs.userId, ctx.user.id),
            eq(ritualLogs.datum, input.datum),
            eq(ritualLogs.typ, "dankbarkeit")
          )
        )
        .limit(1);

      if (bereitsGeloggt.length === 0) {
        await db.insert(ritualLogs).values({
          userId: ctx.user.id,
          typ: "dankbarkeit",
          datum: input.datum,
          createdAtMs: Date.now(),
        });
      }

      return { success: true };
    }),

  // MA generiert einen meditativen Abschlusstext basierend auf Dankbarkeits-Einträgen
  abendTextGenerieren: protectedProcedure
    .input(z.object({
      vorname: z.string().optional(),
      eintrag1: z.string().optional(),
      eintrag2: z.string().optional(),
      eintrag3: z.string().optional(),
      stimmung: z.number().min(1).max(5).optional(),
      abendReflexion: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const name = input.vorname || ctx.user.name || "du";
      const stimmungsText = ["", "sehr schwer", "schwer", "neutral", "gut", "ausgezeichnet"][input.stimmung ?? 3];

      const dankbarkeitsEintraege = [input.eintrag1, input.eintrag2, input.eintrag3]
        .filter(Boolean)
        .map((e, i) => `${i + 1}. ${e}`)
        .join("\n");

      const systemPrompt = `Du bist MA – ein persönlicher KI-Assistent mit einer warmen, meditativen Stimme.
Du verfasst kurze, stimmungsvolle Abschluss-Texte für den Abend.
Der Text soll beim Einschlafen gehört werden – ruhig, dankbar, abschließend.
Maximal 80 Wörter. Deutsch. Beginne mit einer sanften Anerkennung des Tages.`;

      const userPrompt = `Schreibe einen meditativen Abschluss-Text für ${name}.
Heutige Stimmung: ${stimmungsText}
${dankbarkeitsEintraege ? `Dankbarkeit heute:\n${dankbarkeitsEintraege}` : ""}
${input.abendReflexion ? `Abend-Reflexion: ${input.abendReflexion}` : ""}

Der Text soll MA vorlesen – warm, abschließend, wie ein sanftes Loslassen des Tages.`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ]
      });

      const rawContent = response.choices[0]?.message?.content;
      const text = typeof rawContent === "string" ? rawContent : "Ein guter Tag geht zu Ende. Ruh dich aus.";

      // Abschlusstext in DB speichern
      const db = await getDb();
      if (db) {
        const heute = new Date().toISOString().slice(0, 10);
        await db.update(dankbarkeit)
          .set({ maAbschluss: text })
          .where(and(eq(dankbarkeit.userId, ctx.user.id), eq(dankbarkeit.datum, heute)));
      }

      return { text };
    }),

  // Letzte 7 Dankbarkeits-Einträge laden (für Rückblick)
  dankbarkeitVerlauf: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];

    const vor7Tagen = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

    const eintraege = await db.select()
      .from(dankbarkeit)
      .where(
        and(
          eq(dankbarkeit.userId, ctx.user.id),
          gte(dankbarkeit.datum, vor7Tagen)
        )
      )
      .orderBy(desc(dankbarkeit.createdAt))
      .limit(7);

    return eintraege;
  }),
});
