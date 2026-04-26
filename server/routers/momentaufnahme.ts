import { TRPCError } from "@trpc/server";
import { desc, eq, and, gte } from "drizzle-orm";
import { z } from "zod";
import { momentaufnahmen, users, tagesSummaries } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import { generiereAudioMitVoxtral } from "../_core/voxtralTts";
import { ttsNutzungslog } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

// ─── Gravitationszentren ─────────────────────────────────────────────────────

const KATEGORIEN = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
type Kategorie = (typeof KATEGORIEN)[number];

const KATEGORIE_BESCHREIBUNGEN: Record<Kategorie, string> = {
  ICH: "Persönliche Identität, Biografie, Werte, Visionen, Selbstreflexion, Emotionen, Körper",
  QUELL: "Rohe Ideen, Blitzgedanken, unfertige Fragmente, spontane Einfälle, Beobachtungen",
  KONZEPT: "Ausgearbeitete Gedanken, Theorien, Erkenntnisse, philosophische Überlegungen, Definitionen",
  PROJEKT: "Aktive Vorhaben, Aufgaben, Pläne, nächste Schritte, Deadlines, Ziele",
  DIALOG: "Gespräche, Begegnungen, Austausch mit Menschen oder KI, Zitate, Reaktionen",
  WELT: "Externe Quellen, Nachrichten, Bücher, Inspirationen, Referenzen, Beobachtungen der Welt",
};

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

async function klassifiziereText(text: string): Promise<{ kategorie: Kategorie; zusammenfassung: string }> {
  const kategorienText = KATEGORIEN.map(k => `- ${k}: ${KATEGORIE_BESCHREIBUNGEN[k]}`).join("\n");

  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content: `Du bist ein intelligentes Klassifizierungssystem für ein persönliches Wissensmanagementsystem namens KIICH.
Du ordnest Sprachnotizen einem von 6 Gravitationszentren zu und erstellst eine kurze Zusammenfassung.

Die 6 Gravitationszentren:
${kategorienText}

Antworte IMMER im folgenden JSON-Format:
{
  "kategorie": "EINES_DER_6_ZENTREN",
  "zusammenfassung": "Ein prägnanter Satz der den Kerngedanken zusammenfasst (max. 120 Zeichen)"
}`,
      },
      {
        role: "user",
        content: `Klassifiziere diese Sprachnotiz:\n\n"${text}"`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "klassifizierung",
        strict: true,
        schema: {
          type: "object",
          properties: {
            kategorie: { type: "string", enum: KATEGORIEN as unknown as string[] },
            zusammenfassung: { type: "string" },
          },
          required: ["kategorie", "zusammenfassung"],
          additionalProperties: false,
        },
      },
    },
  });

  const rawContent = response.choices?.[0]?.message?.content;
  const content = typeof rawContent === "string" ? rawContent : null;
  if (!content) {
    return { kategorie: "QUELL", zusammenfassung: text.substring(0, 120) };
  }

  try {
    const parsed = JSON.parse(content);
    const kategorie = KATEGORIEN.includes(parsed.kategorie) ? parsed.kategorie : "QUELL";
    return { kategorie, zusammenfassung: parsed.zusammenfassung || text.substring(0, 120) };
  } catch {
    return { kategorie: "QUELL", zusammenfassung: text.substring(0, 120) };
  }
}

/**
 * Konvertiert ein strategisches Summary (Freitext) in eine Markdown-Checkliste.
 * Jede Zeile die mit einem Aufzählungszeichen oder Zahl beginnt wird zu einem Checkbox-Item.
 */
function konvertiereStrategieZuChecklist(strategieText: string): string {
  const zeilen = strategieText.split("\n");
  const result: string[] = [];
  for (const zeile of zeilen) {
    const trimmed = zeile.trim();
    if (!trimmed) {
      result.push("");
      continue;
    }
    // Aufgaben-Zeilen: beginnen mit -, *, •, oder Zahl+Punkt
    if (/^[-*•]\s+/.test(trimmed) || /^\d+\.\s+/.test(trimmed)) {
      // Entferne das Aufzählungszeichen und ersetze durch Checkbox
      const aufgabe = trimmed.replace(/^[-*•]\s+/, "").replace(/^\d+\.\s+/, "");
      result.push(`- [ ] ${aufgabe}`);
    } else {
      // Überschriften und Erklärungszeilen unverändert lassen
      result.push(zeile);
    }
  }
  return result.join("\n");
}

function generiereObsidianMarkdown(aufnahmen: Array<{
  id: number;
  text: string;
  kategorie: string;
  zusammenfassung: string | null;
  audioUrl?: string | null;
  dauerSekunden?: number | null;
  createdAt: Date;
}>, strategischesText?: string | null): string {
  const datum = new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
  const datumISO = new Date().toISOString().split("T")[0];

  const gruppiertNachKategorie = KATEGORIEN.reduce((acc, kat) => {
    acc[kat] = aufnahmen.filter(a => a.kategorie === kat);
    return acc;
  }, {} as Record<string, typeof aufnahmen>);

  const EMOJI: Record<string, string> = {
    ICH: "👤",
    QUELL: "⚡",
    KONZEPT: "🧠",
    PROJEKT: "🎯",
    DIALOG: "💬",
    WELT: "🌍",
  };

  // Gravitationszentrum-Statistik für Frontmatter berechnen
  const gzStats: Record<string, number> = {};
  for (const a of aufnahmen) {
    const k = a.kategorie || "UNBEKANNT";
    gzStats[k] = (gzStats[k] || 0) + 1;
  }
  const dominantGZ = Object.entries(gzStats).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
  const gzListe = Object.entries(gzStats).map(([k, n]) => `${k}: ${n}`).join(", ");

  let md = `---
tags: [momentaufnahme, tagebuch, ${datumISO}]
datum: ${datum}
datum_iso: ${datumISO}
anzahl: ${aufnahmen.length}
dominantes_zentrum: ${dominantGZ}
gravitationszentren: {${gzListe}}
quelle: KIICH-MOMENTAUFNAHME
typ: tagesaufnahme
---

# 📸 Momentaufnahmen – ${datum}

`;

  for (const kat of KATEGORIEN) {
    const gruppe = gruppiertNachKategorie[kat];
    if (gruppe.length === 0) continue;

    md += `## ${EMOJI[kat]} ${kat}\n\n`;
    for (const a of gruppe) {
      const zeit = a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
      md += `### ${zeit} Uhr\n`;
      if (a.zusammenfassung) {
        md += `> ${a.zusammenfassung}\n\n`;
      }
      md += `${a.text}\n\n`;
      // Audio-Einbettung für Obsidian (als externer Link, da S3-URL)
      if (a.audioUrl) {
        const dateiname = `aufnahme-${a.id}.webm`;
        md += `[🎙️ Audio-Aufnahme herunterladen](${a.audioUrl})\n\n`;
      }
    }
  }

  // Strategisches Summary als Checkliste anhängen (wenn vorhanden)
  if (strategischesText && strategischesText.trim()) {
    const checkliste = konvertiereStrategieZuChecklist(strategischesText);
    md += `\n## 🎯 Offene Aufgaben (Strategisches Summary)\n\n${checkliste}\n\n`;
  }

  md += `---\n*Exportiert aus KIICH MOMENTAUFNAHME*\n`;
  return md;
}

// ─── Router ──────────────────────────────────────────────────────────────────

export const momentaufnahmeRouter = router({

  /**
   * Audio hochladen, transkribieren, klassifizieren und speichern.
   * Input: base64-kodiertes Audio + MIME-Type
   */
  aufnehmen: protectedProcedure
    .input(
      z.object({
        audioUrl: z.string(), // S3-URL nach Upload via /api/audio/upload
        dauerSekunden: z.number().optional(),
      })
    )
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      const audioUrl = input.audioUrl;

      // 1. Transkribieren (Audio bereits in S3)

      const transkription = await transcribeAudio({
        audioUrl,
        language: "de",
        prompt: "Persönliche Sprachnotiz auf Deutsch. Transkribiere genau.",
      });

      if ("error" in transkription) {
        throw new TRPCError({ code: "BAD_REQUEST", message: transkription.error });
      }

      const text = transkription.text.trim();
      if (!text) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Keine Sprache erkannt" });
      }

      // 3. KI-Klassifizierung
      const { kategorie, zusammenfassung } = await klassifiziereText(text);

      // 4. In DB speichern
      await db.insert(momentaufnahmen).values({
        userId: ctx.user.id,
        text,
        kategorie,
        zusammenfassung,
        audioUrl,
        dauerSekunden: input.dauerSekunden ?? null,
      });

      const saved = await db
        .select()
        .from(momentaufnahmen)
        .where(eq(momentaufnahmen.userId, ctx.user.id))
        .orderBy(desc(momentaufnahmen.createdAt))
        .limit(1);

      return {
        id: saved[0].id,
        text,
        kategorie,
        zusammenfassung,
        audioUrl,
        createdAt: saved[0].createdAt,
      };
    }),

  /**
   * Alle Aufnahmen des heutigen Tages abrufen.
   */
  heuteAbrufen: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const heute = new Date();
    heute.setHours(0, 0, 0, 0);

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(eq(momentaufnahmen.userId, ctx.user.id), gte(momentaufnahmen.createdAt, heute)))
      .orderBy(desc(momentaufnahmen.createdAt));

    return aufnahmen;
  }),

  /**
   * Obsidian-Markdown für den heutigen Tag generieren.
   */
  obsidianExport: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const heute = new Date();
    heute.setHours(0, 0, 0, 0);
    const datumISO = new Date().toISOString().split("T")[0];

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(eq(momentaufnahmen.userId, ctx.user.id), gte(momentaufnahmen.createdAt, heute)))
      .orderBy(desc(momentaufnahmen.createdAt));

    // Strategisches Summary für heute aus DB laden
    const summaryRow = await db.select({ strategischesText: tagesSummaries.strategischesText })
      .from(tagesSummaries)
      .where(and(eq(tagesSummaries.userId, ctx.user.id), eq(tagesSummaries.datumISO, datumISO)))
      .limit(1);
    const strategischesText = summaryRow[0]?.strategischesText ?? null;

    const markdown = generiereObsidianMarkdown(aufnahmen, strategischesText);
    const filename = `${datumISO} – Momentaufnahmen.md`;

    return { markdown, filename, anzahl: aufnahmen.length };
  }),

  /**
   * Tages-Zusammenfassung "Das war mein Tag" als Text generieren.
   */
  tagesSummary: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const heute = new Date();
    heute.setHours(0, 0, 0, 0);

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(eq(momentaufnahmen.userId, ctx.user.id), gte(momentaufnahmen.createdAt, heute)))
      .orderBy(desc(momentaufnahmen.createdAt));

    if (aufnahmen.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Keine Aufnahmen für heute gefunden" });
    }

    // Vorname des Nutzers abrufen für persönliche Anrede
    const userRow = await db.select({ vorname: users.vorname }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const vorname = userRow[0]?.vorname ?? null;
    const anrede = vorname ? vorname : "du";
    const anredeZeile = vorname ? `Der Name der Person ist ${vorname}. Sprich sie direkt mit ihrem Vornamen an, aber nicht in jedem Satz – natürlich dosiert.` : `Sprich die Person in der Du-Form an.`;

    const aufnahmenText = aufnahmen
      .map(a => `[${a.kategorie}] ${a.text}`)
      .join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist MA – eine weise, einfühlsame Begleiterin. ${anredeZeile}

Deine Aufgabe: Erstelle ein tiefes, fließendes Tages-Summary aus den heutigen Sprachaufnahmen.

Das Summary soll:
- Die wesentlichen Themen und Muster des Tages erkennen und benennen
- Verbindungen zwischen scheinbar getrennten Gedanken aufzeigen
- In einem ruhigen, meditativen, poetischen Ton geschrieben sein – wie ein Brief an sich selbst
- Lösungsorientiert und ermutigend enden – mit einem sanften Impuls für die Nacht
- Sprachlich fließend und klar sein – keine Aufzählungen, keine Stichpunkte, keine Klammern
- Genau 6–8 Sätze lang sein
- Auf Deutsch

Wichtig: Beginne DIREKT mit dem Inhalt. Kein Einleitungssatz wie "Hier ist dein Summary" oder "Das war dein Tag:".`,
        },
        {
          role: "user",
          content: `Meine heutigen Gedanken und Momente:\n\n${aufnahmenText}\n\nSchreibe mein Tages-Summary.`,
        },
      ],
    });

    const rawSummary = response.choices?.[0]?.message?.content;
    const summaryText = typeof rawSummary === "string" ? rawSummary : "Heute war ein besonderer Tag.";
    const datum = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });

    // Summary in DB speichern (upsert: pro Tag ein Eintrag)
    const datumISO = new Date().toISOString().split("T")[0];
    try {
      const existing = await db.select({ id: tagesSummaries.id }).from(tagesSummaries)
        .where(and(eq(tagesSummaries.userId, ctx.user.id), eq(tagesSummaries.datumISO, datumISO)))
        .limit(1);
      if (existing.length > 0) {
        await db.update(tagesSummaries).set({ text: summaryText, datum, anzahlAufnahmen: aufnahmen.length })
          .where(and(eq(tagesSummaries.userId, ctx.user.id), eq(tagesSummaries.datumISO, datumISO)));
      } else {
        await db.insert(tagesSummaries).values({ userId: ctx.user.id, text: summaryText, datum, datumISO, anzahlAufnahmen: aufnahmen.length });
      }
    } catch {
      // Speicherfehler ignorieren — Summary trotzdem zurückgeben
    }

    return {
      text: summaryText,
      anzahl: aufnahmen.length,
      datum,
    };
  }),

  /**
   * Letztes gespeichertes Summary abrufen — für sofortige Anzeige beim Öffnen der Seite.
   */
  letztesSummary: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db.select().from(tagesSummaries)
      .where(eq(tagesSummaries.userId, ctx.user.id))
      .orderBy(desc(tagesSummaries.createdAt))
      .limit(1);
    if (rows.length === 0) return null;
    // Gibt text (Reflexion) + strategischesText (Strategie) zurück
    return {
      id: rows[0].id,
      text: rows[0].text,
      datum: rows[0].datum,
      datumISO: rows[0].datumISO,
      anzahlAufnahmen: rows[0].anzahlAufnahmen,
      strategischesText: rows[0].strategischesText ?? null,
    };
  }),

  /**
   * Archiv der letzten 7 Summaries — für Rückblick und Langzeitmotivation.
   */
  summaryArchiv: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    const rows = await db.select().from(tagesSummaries)
      .where(eq(tagesSummaries.userId, ctx.user.id))
      .orderBy(desc(tagesSummaries.createdAt))
      .limit(7);
    return rows;
  }),

  /**
   * Schlaf-Metapher: Verwandelt das Tages-Summary in eine traumhafte Einschlaf-Botschaft.
   */
  schlafMetapher: protectedProcedure
    .input(z.object({ summaryText: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Vorname für persönliche Anrede
      const db = await getDb();
      let vorname: string | null = null;
      if (db) {
        const userRow = await db.select({ vorname: users.vorname }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
        vorname = userRow[0]?.vorname ?? null;
      }
      const anredeZeile = vorname
        ? `Der Name der Person ist ${vorname}. Beginne die Botschaft mit ihrem Namen, z.B. "${vorname}, lass los..." oder "Über dir, ${vorname}, ..." – einmal, am Anfang, natürlich.`
        : `Sprich die Person in der Du-Form an.`;

      const response = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Du bist MA – die stille Hüterin des Schlafs. Du verwandelst eine Tages-Reflexion in eine sanfte Einschlaf-Botschaft. ${anredeZeile}

Deine Aufgabe: Schreibe eine traumhafte, lösungsorientierte Einschlaf-Botschaft basierend auf dem Tages-Summary.

Die Botschaft soll:
- In einer weichen, traumhaften, metaphorischen Sprache geschrieben sein
- Die Kernthemen des Tages als Bilder und Symbole aufgreifen (z.B. Wasser, Licht, Atem, Wald, Stille)
- Dem Geist erlauben loszulassen – keine offenen Fragen, keine Aufgaben, nur Ankommen
- Mit einer sanften Einladung in den Schlaf enden
- GENAU 4–5 vollständige Sätze lang sein – nicht mehr, nicht weniger
- Jeden Satz nur EINMAL schreiben – keine Wiederholungen
- Auf Deutsch
- Wie ein Gutenacht-Gedicht klingen, nicht wie eine Analyse

Wichtig: Beginne DIREKT mit der Botschaft. Kein Einleitungssatz.`,
          },
          {
            role: "user",
            content: `Mein heutiges Tages-Summary:\n\n${input.summaryText}\n\nSchreibe meine Einschlaf-Botschaft.`,
          },
        ],
      });

      const rawText = response.choices?.[0]?.message?.content;
      const metapherText = typeof rawText === "string" ? rawText : input.summaryText;

      return { text: metapherText };
    }),

  /**
   * Alle Tage mit Aufnahmen abrufen (für Archiv-Kalender).
   */
  archivTage: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const alle = await db
      .select({ createdAt: momentaufnahmen.createdAt })
      .from(momentaufnahmen)
      .where(eq(momentaufnahmen.userId, ctx.user.id))
      .orderBy(desc(momentaufnahmen.createdAt));

    // Eindeutige Tage als ISO-Datum-Strings (YYYY-MM-DD)
    const tageSet = new Set<string>();
    for (const a of alle) {
      const tag = a.createdAt.toISOString().split("T")[0];
      tageSet.add(tag);
    }

    return Array.from(tageSet).sort().reverse();
  }),

  /**
   * Aufnahmen eines bestimmten Tages abrufen.
   */
  tagAbrufen: protectedProcedure
    .input(z.object({ datum: z.string() })) // YYYY-MM-DD
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      const von = new Date(input.datum + "T00:00:00.000Z");
      const bis = new Date(input.datum + "T23:59:59.999Z");

      const aufnahmen = await db
        .select()
        .from(momentaufnahmen)
        .where(
          and(
            eq(momentaufnahmen.userId, ctx.user.id),
            gte(momentaufnahmen.createdAt, von),
          )
        )
        .orderBy(desc(momentaufnahmen.createdAt));

      // Client-seitig auf den Tag filtern (Timezone-sicher)
      const filtered = aufnahmen.filter(a => {
        const d = a.createdAt.toISOString().split("T")[0];
        return d === input.datum;
      });

      return filtered;
    }),

  /**
   * Obsidian-Export für einen bestimmten Tag.
   */
  obsidianExportTag: protectedProcedure
    .input(z.object({ datum: z.string() })) // YYYY-MM-DD
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      const von = new Date(input.datum + "T00:00:00.000Z");

      const aufnahmen = await db
        .select()
        .from(momentaufnahmen)
        .where(
          and(
            eq(momentaufnahmen.userId, ctx.user.id),
            gte(momentaufnahmen.createdAt, von),
          )
        )
        .orderBy(desc(momentaufnahmen.createdAt));

      const filtered = aufnahmen.filter(a => {
        const d = a.createdAt.toISOString().split("T")[0];
        return d === input.datum;
      });

      const markdown = generiereObsidianMarkdown(filtered);
      const datumFormatiert = new Date(input.datum).toLocaleDateString("de-DE", {
        day: "2-digit", month: "2-digit", year: "numeric"
      });
      const filename = `${input.datum} – Momentaufnahmen.md`;

      return { markdown, filename, anzahl: filtered.length, datum: datumFormatiert };
    }),

  /**
   * Eine Aufnahme löschen.
   */
  loeschen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      await db
        .delete(momentaufnahmen)
        .where(and(eq(momentaufnahmen.id, input.id), eq(momentaufnahmen.userId, ctx.user.id)));

      return { success: true };
    }),

  /**
   * Voxtral TTS: Text in Audio umwandeln und als Base64 zurückgeben.
   * Stimme: MA - Meditativ (geklonte Stimme via Voxtral Mini TTS)
   * Fallback: gibt null zurück wenn Voxtral nicht verfügbar ist.
   */
  /**
   * Alias: vorlesen — identisch mit elevenLabsTTS, für neue Frontend-Aufrufe
   */
  vorlesen: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(12000),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log(`[VoxtralTTS/vorlesen] User ${ctx.user.id}, ${input.text.length} Zeichen`);
      const db = await getDb();
      try {
        const audioBuffer = await generiereAudioMitVoxtral({
          text: input.text,
          onLog: async (zeichen) => {
            if (db) {
              await db.insert(ttsNutzungslog).values({
                userId: ctx.user.id,
                zeichen,
                kontext: "momentaufnahme-vorlesen",
              }).catch(e => console.error("[TTS-Log] Fehler:", e));
            }
          },
        });
        return { audioBase64: audioBuffer.toString("base64"), mimeType: "audio/mpeg" };
      } catch (err) {
        console.error("[VoxtralTTS/vorlesen] Fehler:", err);
        return { audioBase64: null, mimeType: null };
      }
    }),

  /**
   * Strategisches Summary: Analysiert Aufnahmen auf Aufgaben, To-Dos und offene Punkte,
   * ordnet sie nach Gravitationszentren und gibt eine strukturierte Übersicht zurück.
   */
  strategischesSummary: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const heute = new Date();
    heute.setHours(0, 0, 0, 0);

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(eq(momentaufnahmen.userId, ctx.user.id), gte(momentaufnahmen.createdAt, heute)))
      .orderBy(desc(momentaufnahmen.createdAt));

    if (aufnahmen.length === 0) {
      throw new TRPCError({ code: "BAD_REQUEST", message: "Keine Aufnahmen für heute gefunden" });
    }

    // Vorname für persönliche Anrede
    const userRow = await db.select({ vorname: users.vorname }).from(users).where(eq(users.id, ctx.user.id)).limit(1);
    const vorname = userRow[0]?.vorname ?? null;
    const anredeZeile = vorname
      ? `Der Name der Person ist ${vorname}. Sprich sie direkt mit ihrem Vornamen an.`
      : `Sprich die Person in der Du-Form an.`;

    const aufnahmenText = aufnahmen
      .map(a => `[${a.kategorie}] ${a.text}`)
      .join("\n\n");

    const kategorienBeschreibung = Object.entries(KATEGORIE_BESCHREIBUNGEN)
      .map(([k, v]) => `- **${k}**: ${v}`)
      .join("\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist MA – eine strategisch denkende, klare Begleiterin. ${anredeZeile}

Deine Aufgabe: Analysiere die heutigen Sprachaufnahmen und extrahiere alle offenen Aufgaben, To-Dos, Vorhaben und nächsten Schritte.
Ordne sie nach den 6 Gravitationszentren:
${kategorienBeschreibung}

Regeln:
- Nur echte Aufgaben und Handlungspunkte aufnehmen – keine allgemeinen Reflexionen
- Pro Gravitationszentrum: kurze Einleitung (1 Satz) + Aufzählung der Aufgaben
- Wenn ein Gravitationszentrum keine Aufgaben enthält, weglassen
- Sprache: direkt, klar, handlungsorientiert – kein poetischer Ton
- Am Ende: ein kurzer "Fokus für heute/morgen" (max. 2 Sätze) – die 1–2 wichtigsten nächsten Schritte
- Auf Deutsch
- Beginne DIREKT mit dem Inhalt. Kein Einleitungssatz.`,
        },
        {
          role: "user",
          content: `Meine heutigen Aufnahmen:\n\n${aufnahmenText}\n\nErstelle meine strategische Aufgaben-Übersicht.`,
        },
      ],
    });

    const rawText = response.choices?.[0]?.message?.content;
    const summaryText = typeof rawText === "string" ? rawText : "Keine Aufgaben gefunden.";
    const datum = new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
    const datumISO = new Date().toISOString().split("T")[0];

    // Strategisches Summary in DB speichern (upsert auf heutigen Tag)
    try {
      const existing = await db.select({ id: tagesSummaries.id }).from(tagesSummaries)
        .where(and(eq(tagesSummaries.userId, ctx.user.id), eq(tagesSummaries.datumISO, datumISO)))
        .limit(1);
      if (existing.length > 0) {
        await db.update(tagesSummaries)
          .set({ strategischesText: summaryText })
          .where(and(eq(tagesSummaries.userId, ctx.user.id), eq(tagesSummaries.datumISO, datumISO)));
      } else {
        // Kein Reflexions-Summary für heute vorhanden: neuen Eintrag mit Platzhalter anlegen
        await db.insert(tagesSummaries).values({
          userId: ctx.user.id,
          text: "",
          datum,
          datumISO,
          anzahlAufnahmen: aufnahmen.length,
          strategischesText: summaryText,
        });
      }
    } catch {
      // Speicherfehler ignorieren
    }

    return {
      text: summaryText,
      anzahl: aufnahmen.length,
      datum,
    };
  }),

  elevenLabsTTS: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(12000),
      voiceId: z.string().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      console.log(`[VoxtralTTS] User ${ctx.user.id} TTS-Aufruf, ${input.text.length} Zeichen`);

      const db = await getDb();
      try {
        const audioBuffer = await generiereAudioMitVoxtral({
          text: input.text,
          onLog: async (zeichen) => {
            if (db) {
              await db.insert(ttsNutzungslog).values({
                userId: ctx.user.id,
                zeichen,
                kontext: "momentaufnahme",
              }).catch(e => console.error("[TTS-Log] Fehler:", e));
            }
          },
        });
        const audioBase64 = audioBuffer.toString("base64");
        return { audioBase64, mimeType: "audio/mpeg", fallback: false };
      } catch (err) {
        console.error("[VoxtralTTS] Fehler:", err);
        // Graceful Fallback: Frontend nutzt Web Speech API
        return { audioBase64: null, mimeType: null, fallback: true };
      }
    }),
});
