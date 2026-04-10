import { TRPCError } from "@trpc/server";
import { and, desc, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb } from "../db";
import { einschlafBibliothek, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { invokeLLM } from "../_core/llm";
import { ENV } from "../_core/env";
import { storagePut } from "../storage";

// ─── Themen-Katalog ───────────────────────────────────────────────────────────

export const BEFINDLICHKEITS_THEMEN = [
  "Angst vor der Zukunft",
  "Beziehungssorgen",
  "Erschöpfung & Burnout",
  "Trauer & Verlust",
  "Prüfungsangst",
  "Einsamkeit",
  "Selbstzweifel",
  "Beruflicher Druck",
  "Familienkonflikte",
  "Körperliche Beschwerden",
  "Ungewissheit & Kontrollverlust",
  "Scham & Schuld",
] as const;

export const MAERCHEN_THEMEN = [
  "Mut finden",
  "Freundschaft & Vertrauen",
  "Angst überwinden",
  "Anderssein als Stärke",
  "Verlust & Trost",
  "Neugier & Entdecken",
  "Streit & Versöhnung",
  "Einschlafen & Träumen",
] as const;

// ─── Router ───────────────────────────────────────────────────────────────────

export const einschlafBibliothekRouter = router({
  /**
   * Verfügbare Themen-Kataloge abrufen.
   */
  themen: protectedProcedure.query(() => {
    return {
      befindlichkeit: BEFINDLICHKEITS_THEMEN,
      maerchen: MAERCHEN_THEMEN,
    };
  }),

  /**
   * Gespeicherte Geschichten des Users abrufen.
   */
  liste: protectedProcedure
    .input(z.object({
      kategorie: z.enum(["MAERCHEN", "ABENTEUER", "BEFINDLICHKEIT"]).optional(),
    }).optional())
    .query(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      const bedingungen = [eq(einschlafBibliothek.userId, ctx.user.id)];
      if (input?.kategorie) {
        bedingungen.push(eq(einschlafBibliothek.kategorie, input.kategorie));
      }

      return db
        .select()
        .from(einschlafBibliothek)
        .where(and(...bedingungen))
        .orderBy(desc(einschlafBibliothek.createdAt));
    }),

  /**
   * Eine neue Einschlaf-Geschichte KI-generieren und speichern.
   */
  generieren: protectedProcedure
    .input(z.object({
      kategorie: z.enum(["MAERCHEN", "ABENTEUER", "BEFINDLICHKEIT"]),
      zielgruppe: z.enum(["KIND", "JUGENDLICHER", "ERWACHSENER"]).default("ERWACHSENER"),
      thema: z.string().min(1).max(128),
      personalisierung: z.string().max(500).optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      // Vorname des Users laden für Personalisierung
      const userRows = await db.select({ vorname: users.vorname }).from(users).where(eq(users.id, ctx.user.id));
      const vorname = userRows[0]?.vorname ?? null;
      const anrede = vorname ? vorname : "du";

      // Prompt je nach Kategorie aufbauen
      let systemPrompt = "";
      let userPrompt = "";

      if (input.kategorie === "MAERCHEN") {
        const altersgruppeText = input.zielgruppe === "KIND"
          ? "für ein Kind (5–10 Jahre), mit einfacher Sprache, lebhaften Bildern und einem beruhigenden Ende"
          : "für einen Jugendlichen (11–17 Jahre), mit etwas komplexerer Sprache und nachvollziehbaren Gefühlen";

        systemPrompt = `Du bist MA, eine einfühlsame Erzählerin, die Kinder und Jugendliche mit liebevollen Gutenacht-Märchen begleitet. 
Deine Geschichten sind warm, bildreich und sanft – sie laden ein einzuschlafen, nicht aufzuwachen.
Schreibe ein Einschlaf-Märchen ${altersgruppeText}.
Das Märchen soll 3–5 Minuten Lesezeit haben (ca. 400–600 Wörter).
Beginne direkt mit dem Märchen, ohne Einleitung.
Gib am Anfang einen poetischen Titel in einer eigenen Zeile aus (Format: "Titel: [Titel]"), dann eine Leerzeile, dann den Text.`;

        userPrompt = `Thema: "${input.thema}"
${vorname ? `Das Kind/der Jugendliche heißt ${vorname}.` : ""}
${input.personalisierung ? `Besonderer Wunsch: ${input.personalisierung}` : ""}

Schreibe jetzt das Einschlaf-Märchen.`;

      } else if (input.kategorie === "ABENTEUER") {
        systemPrompt = `Du bist MA, eine weise Begleiterin auf inneren Reisen.
Du erzählst Erwachsenen eine Heldenreise als Einschlaf-Metapher – der Held ist der Zuhörer selbst.
Die Herausforderung des Alltags wird zur Aufgabe des Helden, und die Lösung liegt im Inneren.
Schreibe eine traumhafte, bildreiche Abenteuer-Metapher für Erwachsene.
Die Geschichte soll 4–6 Minuten Lesezeit haben (ca. 500–700 Wörter).
Verwende die zweite Person ("du"), damit der Zuhörer sich direkt angesprochen fühlt.
Beginne direkt mit der Geschichte, ohne Einleitung.
Gib am Anfang einen poetischen Titel in einer eigenen Zeile aus (Format: "Titel: [Titel]"), dann eine Leerzeile, dann den Text.`;

        userPrompt = `${vorname ? `Der Held heißt ${anrede}.` : ""}
Thema der Heldenreise: "${input.thema}"
${input.personalisierung ? `Konkrete Herausforderung des Helden: ${input.personalisierung}` : ""}

Schreibe jetzt die Abenteuer-Metapher.`;

      } else {
        // BEFINDLICHKEIT
        systemPrompt = `Du bist MA, eine einfühlsame Begleiterin in schwierigen Momenten.
Du sprichst Menschen direkt an, die mit einer bestimmten Befindlichkeit ins Bett gehen.
Deine Einschlaf-Metaphern sind keine Ratschläge – sie sind poetische Bilder, die das Gefühl sanft auflösen.
Schreibe eine Einschlaf-Metapher für Erwachsene zu einer konkreten Befindlichkeit.
Die Metapher soll 3–5 Minuten Lesezeit haben (ca. 350–500 Wörter).
Verwende die zweite Person ("du"), sanfte Bilder aus der Natur oder dem Traum.
Beginne direkt mit der Metapher, ohne Einleitung.
Gib am Anfang einen poetischen Titel in einer eigenen Zeile aus (Format: "Titel: [Titel]"), dann eine Leerzeile, dann den Text.`;

        userPrompt = `${vorname ? `Die Person heißt ${anrede}.` : ""}
Befindlichkeit: "${input.thema}"
${input.personalisierung ? `Persönliche Situation: ${input.personalisierung}` : ""}

Schreibe jetzt die Einschlaf-Metapher.`;
      }

      // KI aufrufen
      const llmResponse = await invokeLLM({
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
      });

      const rawContent = llmResponse.choices?.[0]?.message?.content ?? "";
      const rawText = typeof rawContent === "string" ? rawContent : "";
      if (!rawText) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "KI-Generierung fehlgeschlagen" });
      }

      // Titel extrahieren
      let titel = input.thema;
      let text = rawText.trim();
      const titelMatch = rawText.match(/^Titel:\s*(.+)/m);
      if (titelMatch) {
        titel = titelMatch[1].trim();
        text = rawText.replace(/^Titel:\s*.+\n?/m, "").trim();
      }

      // In DB speichern
      const [inserted] = await db.insert(einschlafBibliothek).values({
        userId: ctx.user.id,
        kategorie: input.kategorie,
        zielgruppe: input.zielgruppe,
        thema: input.thema,
        personalisierung: input.personalisierung ?? null,
        titel,
        text,
        audioUrl: null,
        favorit: false,
      });

      // Neu gespeicherte Geschichte zurückgeben
      const [neu] = await db
        .select()
        .from(einschlafBibliothek)
        .where(eq(einschlafBibliothek.userId, ctx.user.id))
        .orderBy(desc(einschlafBibliothek.createdAt))
        .limit(1);

      return neu;
    }),

  /**
   * ElevenLabs Audio für eine Geschichte generieren und in S3 speichern.
   * Das Audio wird beim ersten Abspielen generiert und gecacht.
   */
  audioGenerieren: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      // Geschichte laden und Eigentümerschaft prüfen
      const [geschichte] = await db
        .select()
        .from(einschlafBibliothek)
        .where(and(eq(einschlafBibliothek.id, input.id), eq(einschlafBibliothek.userId, ctx.user.id)));

      if (!geschichte) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Geschichte nicht gefunden" });
      }

      // Falls bereits Audio vorhanden, direkt zurückgeben
      if (geschichte.audioUrl) {
        return { audioUrl: geschichte.audioUrl, cached: true };
      }

      // ElevenLabs prüfen
      if (!ENV.elevenLabsApiKey || !ENV.elevenLabsVoiceId) {
        throw new TRPCError({ code: "PRECONDITION_FAILED", message: "ElevenLabs nicht konfiguriert" });
      }

      // TTS generieren
      const ttsResponse = await fetch(
        `https://api.elevenlabs.io/v1/text-to-speech/${ENV.elevenLabsVoiceId}`,
        {
          method: "POST",
          headers: {
            "xi-api-key": ENV.elevenLabsApiKey,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            text: geschichte.text,
            model_id: "eleven_multilingual_v2",
            voice_settings: {
              stability: 0.55,
              similarity_boost: 0.80,
              style: 0.15,
              use_speaker_boost: true,
            },
          }),
        }
      );

      if (!ttsResponse.ok) {
        throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: `ElevenLabs Fehler: ${ttsResponse.status}` });
      }

      // In S3 speichern
      const audioBuffer = await ttsResponse.arrayBuffer();
      const fileKey = `einschlaf-audio/${ctx.user.id}/${input.id}-${Date.now()}.mp3`;
      const { url } = await storagePut(fileKey, Buffer.from(audioBuffer), "audio/mpeg");

      // URL in DB speichern
      await db
        .update(einschlafBibliothek)
        .set({ audioUrl: url })
        .where(eq(einschlafBibliothek.id, input.id));

      return { audioUrl: url, cached: false };
    }),

  /**
   * Favorit togglen.
   */
  favoritToggle: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      const [geschichte] = await db
        .select()
        .from(einschlafBibliothek)
        .where(and(eq(einschlafBibliothek.id, input.id), eq(einschlafBibliothek.userId, ctx.user.id)));

      if (!geschichte) throw new TRPCError({ code: "NOT_FOUND" });

      await db
        .update(einschlafBibliothek)
        .set({ favorit: !geschichte.favorit })
        .where(eq(einschlafBibliothek.id, input.id));

      return { favorit: !geschichte.favorit };
    }),

  /**
   * Geschichte löschen.
   */
  loeschen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      await db
        .delete(einschlafBibliothek)
        .where(and(eq(einschlafBibliothek.id, input.id), eq(einschlafBibliothek.userId, ctx.user.id)));

      return { success: true };
    }),
});
