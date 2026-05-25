/**
 * STIMMKLANG-ROUTER
 * - Tages-Messungen serverseitig speichern (geräteübergreifend)
 * - 3-Tage-Status abfragen
 * - Beratungsanfrage an yohn@kiich.de senden
 */
import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { stimmklangMessungen, stimmklangBeratungsanfragen } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { sendEmail } from "../_core/email";

export const stimmklangRouter = router({
  /**
   * Tages-Messung speichern.
   * Wird nach Abschluss der Analyse aufgerufen.
   * Pro Tag wird nur eine Messung gespeichert (Überschreiben erlaubt).
   */
  messungSpeichern: protectedProcedure
    .input(
      z.object({
        dominanteMdiId: z.number().int().min(1).max(24),
        dominanteFrequenz: z.number(),
        metapher: z.string().optional(),
        farbHex: z.string().optional(),
        wurzelklangMdiId: z.number().int().optional(),
        mdiVerteilung: z.record(z.string(), z.number()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const heute = new Date().toISOString().split("T")[0];

      // Bestehende Messungen laden um Tag-Nummer zu ermitteln
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      const vorhandene = await db
        .select()
        .from(stimmklangMessungen)
        .where(eq(stimmklangMessungen.userId, userId));

      // Prüfen ob heute schon eine Messung existiert
      const heutigeMessung = vorhandene.find((m) => m.datumISO === heute);

      // Eindeutige Tage zählen (ohne heute)
      const andereTageSet = new Set(vorhandene.filter((m) => m.datumISO !== heute).map((m) => m.datumISO));
      const andereTage = Array.from(andereTageSet);
      const tagNummer = andereTage.length + 1;

      if (heutigeMessung) {
        // Heutige Messung überschreiben
        await (db)
          .update(stimmklangMessungen)
          .set({
            dominanteMdiId: input.dominanteMdiId,
            dominanteFrequenz: input.dominanteFrequenz,
            metapher: input.metapher,
            farbHex: input.farbHex,
            wurzelklangMdiId: input.wurzelklangMdiId,
            mdiVerteilung: input.mdiVerteilung ? JSON.stringify(input.mdiVerteilung) : null,
            tagNummer,
          })
          .where(eq(stimmklangMessungen.id, heutigeMessung.id));
      } else {
        // Neue Messung anlegen
        await (db).insert(stimmklangMessungen).values({
          userId,
          datumISO: heute,
          dominanteMdiId: input.dominanteMdiId,
          dominanteFrequenz: input.dominanteFrequenz,
          metapher: input.metapher,
          farbHex: input.farbHex,
          wurzelklangMdiId: input.wurzelklangMdiId,
          mdiVerteilung: input.mdiVerteilung ? JSON.stringify(input.mdiVerteilung) : null,
          tagNummer,
        });
      }

      // Aktuellen Stand zurückgeben
      const alle = await (db)
        .select()
        .from(stimmklangMessungen)
        .where(eq(stimmklangMessungen.userId, userId));

      const eindeutigeTage = Array.from(new Set(alle.map((m) => m.datumISO)));

      return {
        tagNummer,
        gesamtTage: eindeutigeTage.length,
        istVollstaendig: eindeutigeTage.length >= 3,
      };
    }),

  /**
   * 3-Tage-Status abfragen.
   * Gibt zurück wie viele verschiedene Tage bereits gemessen wurden.
   */
  status: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;

      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      const messungen = await db
        .select()
        .from(stimmklangMessungen)
        .where(eq(stimmklangMessungen.userId, userId));

    const eindeutigeTage = Array.from(new Set(messungen.map((m) => m.datumISO)));
    const istVollstaendig = eindeutigeTage.length >= 3;

    // Letzte Messung
    const letzteMessung = messungen.length > 0 ? messungen[messungen.length - 1] : null;

    return {
      gesamtTage: eindeutigeTage.length,
      istVollstaendig,
      tage: eindeutigeTage,
      letzteMessung: letzteMessung
        ? {
            datumISO: letzteMessung.datumISO,
            dominanteMdiId: letzteMessung.dominanteMdiId,
            metapher: letzteMessung.metapher,
            farbHex: letzteMessung.farbHex,
          }
        : null,
    };
  }),

  /**
   * Beratungsanfrage senden.
   * Speichert die Anfrage in der DB und sendet eine E-Mail an yohn@kiich.de.
   */
  beratungsanfrage: protectedProcedure
    .input(
      z.object({
        nachricht: z.string().max(1000).optional(),
        dominanteMdiId: z.number().int().optional(),
        metapher: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const userName = ctx.user.name ?? "Unbekannt";
      const userEmail = ctx.user.email ?? "";

      // Anfrage in DB speichern
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");

      await db.insert(stimmklangBeratungsanfragen).values({
        userId,
        name: userName,
        email: userEmail,
        nachricht: input.nachricht,
        dominanteMdiId: input.dominanteMdiId,
        metapher: input.metapher,
        emailVersendet: false,
      });

      // E-Mail an Thomas senden
      const htmlContent = `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #fff; padding: 32px; border-radius: 12px;">
          <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="color: #f97316; font-size: 24px; margin: 0;">Neue Beratungsanfrage</h1>
            <p style="color: #71717a; margin: 8px 0 0;">Stimmklanganalyse – Persönliches Gespräch</p>
          </div>
          
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h3 style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Anfragender</h3>
            <p style="color: #fff; font-size: 18px; margin: 0 0 4px;"><strong>${userName}</strong></p>
            <p style="color: #f97316; margin: 0;"><a href="mailto:${userEmail}" style="color: #f97316;">${userEmail}</a></p>
          </div>

          ${input.metapher ? `
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h3 style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Lichtklangcharakter</h3>
            <p style="color: #fff; font-size: 20px; font-weight: bold; margin: 0;">${input.metapher}</p>
            ${input.dominanteMdiId ? `<p style="color: #71717a; margin: 4px 0 0;">MDI-Typ ${input.dominanteMdiId}</p>` : ""}
          </div>
          ` : ""}

          ${input.nachricht ? `
          <div style="background: #18181b; border: 1px solid #27272a; border-radius: 8px; padding: 20px; margin-bottom: 16px;">
            <h3 style="color: #a1a1aa; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin: 0 0 12px;">Persönliche Nachricht</h3>
            <p style="color: #d4d4d8; line-height: 1.6; margin: 0;">${input.nachricht.replace(/\n/g, "<br>")}</p>
          </div>
          ` : ""}

          <div style="text-align: center; margin-top: 24px; padding-top: 24px; border-top: 1px solid #27272a;">
            <a href="mailto:${userEmail}" style="display: inline-block; background: #f97316; color: #fff; padding: 12px 32px; border-radius: 8px; text-decoration: none; font-weight: bold;">Antworten an ${userName}</a>
          </div>
        </div>
      `;

      const emailOk = await sendEmail({
        to: [{ name: "Thomas", email: "yohn@kiich.de" }],
        subject: `Beratungsanfrage: ${userName}${input.metapher ? ` – ${input.metapher}` : ""}`,
        htmlContent,
      });

      // emailVersendet-Flag aktualisieren
      if (emailOk) {
        await (db)
          .update(stimmklangBeratungsanfragen)
          .set({ emailVersendet: true })
          .where(
            and(
              eq(stimmklangBeratungsanfragen.userId, userId),
              eq(stimmklangBeratungsanfragen.emailVersendet, false)
            )
          );
      }

      return { success: true, emailVersendet: emailOk };
    }),

  /**
   * Admin: Alle Beratungsanfragen abrufen.
   */
  adminBeratungsanfragen: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB nicht verfügbar");

    const anfragen = await db
      .select()
      .from(stimmklangBeratungsanfragen);

    // Sortiert nach Datum absteigend
    anfragen.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return anfragen;
  }),

  /**
   * Admin: Alle Stimmklang-Messungen abrufen (für Übersicht).
   */
  adminMessungen: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB nicht verfügbar");

    const messungen = await db
      .select()
      .from(stimmklangMessungen);

    messungen.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return messungen;
  }),
});
