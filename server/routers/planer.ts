import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { erledigungen, visionen, erinnerungen, pushSubscriptions, einkaufsliste } from "../../drizzle/schema";
import { sendPushNotification } from "../pushNotifications";
import { ENV } from "../_core/env";
import { eq, and, desc, lte } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";

export const planerRouter = router({
  // ─── ERLEDIGUNGEN ──────────────────────────────────────────────────────────

  erledigungenLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(erledigungen)
      .where(and(eq(erledigungen.userId, ctx.user.id), eq(erledigungen.erledigt, false)))
      .orderBy(desc(erledigungen.createdAt));
  }),

  erledigungHinzufuegen: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(1000),
      kategorie: z.enum(["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const [result] = await db.insert(erledigungen).values({
        userId: ctx.user.id,
        text: input.text,
        kategorie: input.kategorie ?? "PROJEKT",
        erledigt: false,
      });
      return { id: (result as any).insertId };
    }),

  erledigungLoeschen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .delete(erledigungen)
        .where(and(eq(erledigungen.id, input.id), eq(erledigungen.userId, ctx.user.id)));
      return { ok: true };
    }),

  // ─── VISIONEN ──────────────────────────────────────────────────────────────

  visionenLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(visionen)
      .where(eq(visionen.userId, ctx.user.id))
      .orderBy(desc(visionen.createdAt));
  }),

  visionHinzufuegen: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(2000),
      kategorie: z.enum(["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const [result] = await db.insert(visionen).values({
        userId: ctx.user.id,
        text: input.text,
        kategorie: input.kategorie ?? "QUELL",
      });
      return { id: (result as any).insertId };
    }),

  visionLoeschen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .delete(visionen)
        .where(and(eq(visionen.id, input.id), eq(visionen.userId, ctx.user.id)));
      return { ok: true };
    }),

  // ─── ERINNERUNGEN ──────────────────────────────────────────────────────────

  erinnerungenLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(erinnerungen)
      .where(and(eq(erinnerungen.userId, ctx.user.id), eq(erinnerungen.bestaetigt, false)))
      .orderBy(erinnerungen.faelligkeitMs);
  }),

  // Erinnerung per Sprachbefehl – LLM extrahiert Zeit + Inhalt
  erinnerungHinzufuegen: protectedProcedure
    .input(z.object({
      sprachbefehl: z.string().min(1).max(2000),
      jetzt: z.string(), // ISO-String der aktuellen Client-Zeit
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Du bist ein Assistent der Erinnerungen aus natürlicher Sprache extrahiert.
Aktuelle Zeit: ${input.jetzt}
Extrahiere aus dem Sprachbefehl:
1. Den Inhalt der Erinnerung (kurz, prägnant, max 100 Zeichen)
2. Den Fälligkeitszeitpunkt als ISO-8601-String (z.B. "2026-04-14T10:00:00")
Wenn keine Uhrzeit angegeben ist, setze die Erinnerung auf in 1 Stunde.
Wenn kein Datum angegeben ist, nehme heute.
Antworte NUR mit JSON: {"text": "...", "faelligkeitISO": "..."}`,
          },
          { role: "user", content: input.sprachbefehl },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "erinnerung_extraktion",
            strict: true,
            schema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Inhalt der Erinnerung" },
                faelligkeitISO: { type: "string", description: "Fälligkeitszeitpunkt als ISO-8601" },
              },
              required: ["text", "faelligkeitISO"],
              additionalProperties: false,
            },
          },
        },
      });

      let text = input.sprachbefehl;
      let faelligkeitMs = Date.now() + 60 * 60 * 1000;

      try {
        const parsed = JSON.parse(llmResponse.choices[0].message.content as string);
        if (parsed.text) text = parsed.text;
        const d = new Date(parsed.faelligkeitISO);
        if (!isNaN(d.getTime())) faelligkeitMs = d.getTime();
      } catch {
        // Fallback: Originaltext
      }

      const [result] = await db.insert(erinnerungen).values({
        userId: ctx.user.id,
        text,
        originalText: input.sprachbefehl,
        faelligkeitMs,
        ausgeloest: false,
        bestaetigt: false,
      });

      return { id: (result as any).insertId, text, faelligkeitMs };
    }),

  // Erinnerung per Sprach-Upload (Audio-URL → Transkription → LLM-Parsing)
  erinnerungPerSprache: protectedProcedure
    .input(z.object({
      audioUrl: z.string().url(),
      jetzt: z.string(), // ISO-String der aktuellen Client-Zeit
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      // Schritt 1: Transkription
      const transkription = await transcribeAudio({
        audioUrl: input.audioUrl,
        language: "de",
        prompt: "Erinnerung setzen",
      });
      if ("error" in transkription) {
        throw new Error(`Transkription fehlgeschlagen: ${transkription.error}`);
      }
      const sprachbefehl = transkription.text.trim();
      if (!sprachbefehl) throw new Error("Keine Sprache erkannt");

      // Schritt 2: LLM extrahiert Zeit + Inhalt
      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content: `Du bist ein Assistent der Erinnerungen aus natürlicher Sprache extrahiert.
Aktuelle Zeit: ${input.jetzt}
Extrahiere aus dem Sprachbefehl:
1. Den Inhalt der Erinnerung (kurz, prägnant, max 100 Zeichen)
2. Den Fälligkeitszeitpunkt als ISO-8601-String (z.B. "2026-04-14T10:00:00")
Wenn keine Uhrzeit angegeben ist, setze die Erinnerung auf in 1 Stunde.
Wenn kein Datum angegeben ist, nehme heute.
Antworte NUR mit JSON: {"text": "...", "faelligkeitISO": "..."}`,
          },
          { role: "user", content: sprachbefehl },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "erinnerung_extraktion",
            strict: true,
            schema: {
              type: "object",
              properties: {
                text: { type: "string", description: "Inhalt der Erinnerung" },
                faelligkeitISO: { type: "string", description: "Fälligkeitszeitpunkt als ISO-8601" },
              },
              required: ["text", "faelligkeitISO"],
              additionalProperties: false,
            },
          },
        },
      });

      let text = sprachbefehl;
      let faelligkeitMs = Date.now() + 60 * 60 * 1000;
      try {
        const parsed = JSON.parse(llmResponse.choices[0].message.content as string);
        if (parsed.text) text = parsed.text;
        const d = new Date(parsed.faelligkeitISO);
        if (!isNaN(d.getTime())) faelligkeitMs = d.getTime();
      } catch { /* Fallback */ }

      const [result] = await db.insert(erinnerungen).values({
        userId: ctx.user.id,
        text,
        originalText: sprachbefehl,
        faelligkeitMs,
        ausgeloest: false,
        bestaetigt: false,
      });

      return { id: (result as any).insertId, text, faelligkeitMs, originalText: sprachbefehl };
    }),

  // Erinnerung direkt (ohne LLM) hinzufügen
  erinnerungDirektHinzufuegen: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(1000),
      faelligkeitMs: z.number(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const [result] = await db.insert(erinnerungen).values({
        userId: ctx.user.id,
        text: input.text,
        faelligkeitMs: input.faelligkeitMs,
        ausgeloest: false,
        bestaetigt: false,
      });
      return { id: (result as any).insertId };
    }),

  // Erinnerung als ausgelöst markieren
  erinnerungAusgeloest: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .update(erinnerungen)
        .set({ ausgeloest: true })
        .where(and(eq(erinnerungen.id, input.id), eq(erinnerungen.userId, ctx.user.id)));
      return { ok: true };
    }),

  // Erinnerung bestätigen (= aus der Liste entfernen)
  erinnerungBestaetigen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .update(erinnerungen)
        .set({ bestaetigt: true })
        .where(and(eq(erinnerungen.id, input.id), eq(erinnerungen.userId, ctx.user.id)));
      return { ok: true };
    }),

  // Fällige Erinnerungen abrufen (für Polling)
  faelligeErinnerungen: protectedProcedure
    .input(z.object({ jetztMs: z.number() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return [];
      return db
        .select()
        .from(erinnerungen)
        .where(
          and(
            eq(erinnerungen.userId, ctx.user.id),
            eq(erinnerungen.ausgeloest, false),
            eq(erinnerungen.bestaetigt, false),
            lte(erinnerungen.faelligkeitMs, input.jetztMs)
          )
        );
    }),

  // ─── EINKAUFSLISTE ────────────────────────────────────────────────────────

  einkaufslisteLaden: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(einkaufsliste)
      .where(eq(einkaufsliste.userId, ctx.user.id))
      .orderBy(einkaufsliste.gekauft, desc(einkaufsliste.createdAt));
  }),

  einkaufsartikelHinzufuegen: protectedProcedure
    .input(z.object({
      artikel: z.string().min(1).max(200),
      menge: z.string().max(64).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const [result] = await db.insert(einkaufsliste).values({
        userId: ctx.user.id,
        artikel: input.artikel,
        menge: input.menge,
        gekauft: false,
      });
      return { id: (result as any).insertId };
    }),

  einkaufsartikelToggle: protectedProcedure
    .input(z.object({ id: z.number(), gekauft: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .update(einkaufsliste)
        .set({ gekauft: input.gekauft })
        .where(and(eq(einkaufsliste.id, input.id), eq(einkaufsliste.userId, ctx.user.id)));
      return { ok: true };
    }),

  einkaufsartikelLoeschen: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .delete(einkaufsliste)
        .where(and(eq(einkaufsliste.id, input.id), eq(einkaufsliste.userId, ctx.user.id)));
      return { ok: true };
    }),

  // Alle gekauften Artikel auf einmal löschen
  einkaufslisteGekauftLoeschen: protectedProcedure
    .mutation(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      await db
        .delete(einkaufsliste)
        .where(and(eq(einkaufsliste.userId, ctx.user.id), eq(einkaufsliste.gekauft, true)));
      return { ok: true };
    }),

  // ─── WEB PUSH ──────────────────────────────────────────────────────────────

  // VAPID Public Key für Frontend (public, kein Auth nötig)
  vapidPublicKey: protectedProcedure.query(() => {
    return { publicKey: ENV.vapidPublicKey };
  }),

  // Push-Subscription speichern
  pushSubscriptionSpeichern: protectedProcedure
    .input(z.object({
      endpoint: z.string().url(),
      p256dh: z.string(),
      auth: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      // Vorhandene Subscription für diesen Endpoint aktualisieren oder neu anlegen
      const existing = await db
        .select()
        .from(pushSubscriptions)
        .where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint)))
        .limit(1);
      if (existing.length > 0) {
        await db.update(pushSubscriptions)
          .set({ p256dh: input.p256dh, auth: input.auth })
          .where(eq(pushSubscriptions.id, existing[0].id));
      } else {
        await db.insert(pushSubscriptions).values({
          userId: ctx.user.id,
          endpoint: input.endpoint,
          p256dh: input.p256dh,
          auth: input.auth,
        });
      }
      return { ok: true };
    }),

  // Push-Subscription löschen (Abmelden)
  pushSubscriptionLoeschen: protectedProcedure
    .input(z.object({ endpoint: z.string() }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) return { ok: false };
      await db.delete(pushSubscriptions)
        .where(and(eq(pushSubscriptions.userId, ctx.user.id), eq(pushSubscriptions.endpoint, input.endpoint)));
      return { ok: true };
    }),
});
