import { TRPCError } from "@trpc/server";
import { desc, eq, and, gte } from "drizzle-orm";
import { z } from "zod";
import { momentaufnahmen } from "../../drizzle/schema";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
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

function generiereObsidianMarkdown(aufnahmen: Array<{
  id: number;
  text: string;
  kategorie: string;
  zusammenfassung: string | null;
  audioUrl?: string | null;
  dauerSekunden?: number | null;
  createdAt: Date;
}>): string {
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

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(eq(momentaufnahmen.userId, ctx.user.id), gte(momentaufnahmen.createdAt, heute)))
      .orderBy(desc(momentaufnahmen.createdAt));

    const markdown = generiereObsidianMarkdown(aufnahmen);
    const datumISO = new Date().toISOString().split("T")[0];
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

    const aufnahmenText = aufnahmen
      .map(a => `[${a.kategorie}] ${a.text}`)
      .join("\n\n");

    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Du bist ein einfühlsamer Begleiter der einem Menschen hilft, seinen Tag zu reflektieren.
Erstelle eine warme, persönliche Tages-Zusammenfassung im Stil eines Tagebuchs.
Sprich die Person direkt an (Du-Form). Fasse die wichtigsten Gedanken und Themen zusammen.
Schreibe in einem ruhigen, meditativen Ton. Maximal 5-7 Sätze. Auf Deutsch.`,
        },
        {
          role: "user",
          content: `Das waren meine Gedanken heute:\n\n${aufnahmenText}\n\nSchreibe eine Zusammenfassung "Das war mein Tag".`,
        },
      ],
    });

    const rawSummary = response.choices?.[0]?.message?.content;
    const summaryText = typeof rawSummary === "string" ? rawSummary : "Heute war ein besonderer Tag.";

    return {
      text: summaryText,
      anzahl: aufnahmen.length,
      datum: new Date().toLocaleDateString("de-DE", { weekday: "long", day: "numeric", month: "long", year: "numeric" }),
    };
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
});
