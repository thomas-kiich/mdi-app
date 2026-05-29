/**
 * STIMMKLANG-ROUTER
 * - Tages-Messungen serverseitig speichern (geräteübergreifend)
 * - 3-Tage-Status abfragen
 * - Beratungsanfrage an yohn@kiich.de senden
 */
import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { stimmklangMessungen, stimmklangBeratungsanfragen, users, coachNotizen } from "../../drizzle/schema";
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
   * Finales 3-Tage-MDI-Profil berechnen.
   * Lädt alle Messungen des Users, mittelt die mdiVerteilung über alle Tage
   * und gibt die 24 Typen nach Prozentwert absteigend sortiert zurück.
   */
  finalesMdiProfil: protectedProcedure.query(async ({ ctx }) => {
    const userId = ctx.user.id;
    const db = await getDb();
    if (!db) throw new Error("DB nicht verfügbar");

    const messungen = await db
      .select()
      .from(stimmklangMessungen)
      .where(eq(stimmklangMessungen.userId, userId));

    // Eindeutige Tage ermitteln (neueste 3)
    const tageMap = new Map<string, typeof messungen[0]>();
    for (const m of messungen) {
      // Pro Tag die neueste Messung verwenden
      const existing = tageMap.get(m.datumISO);
      if (!existing || (m.createdAt && existing.createdAt && new Date(m.createdAt) > new Date(existing.createdAt))) {
        tageMap.set(m.datumISO, m);
      }
    }

    const eindeutigeTage = Array.from(tageMap.values())
      .sort((a, b) => a.datumISO.localeCompare(b.datumISO));

    if (eindeutigeTage.length < 3) {
      return { istVollstaendig: false, gesamtTage: eindeutigeTage.length, profil: null };
    }

    // Die letzten 3 Tage nehmen
    const letzte3 = eindeutigeTage.slice(-3);

    // mdiVerteilung über alle 3 Tage mitteln
    const summen: Record<string, number> = {};
    let anzahlMitVerteilung = 0;

    for (const messung of letzte3) {
      if (!messung.mdiVerteilung) continue;
      try {
        const verteilung: Record<string, number> = JSON.parse(messung.mdiVerteilung);
        anzahlMitVerteilung++;
        for (const [id, prozent] of Object.entries(verteilung)) {
          summen[id] = (summen[id] || 0) + prozent;
        }
      } catch {
        // Ungueltige JSON-Daten ignorieren
      }
    }

    if (anzahlMitVerteilung === 0) {
      // Fallback: dominanteMdiId aus den 3 Tagen verwenden
      const fallbackVerteilung: Record<string, number> = {};
      for (const messung of letzte3) {
        const id = messung.dominanteMdiId.toString();
        fallbackVerteilung[id] = (fallbackVerteilung[id] || 0) + (100 / letzte3.length);
      }
      const sortiert = Object.entries(fallbackVerteilung)
        .map(([id, prozent]) => ({ mdiId: parseInt(id), prozent: Math.round(prozent * 10) / 10 }))
        .sort((a, b) => b.prozent - a.prozent);
      const grundton = sortiert[0];
      return {
        istVollstaendig: true,
        gesamtTage: eindeutigeTage.length,
        profil: {
          grundtonMdiId: grundton.mdiId,
          rangliste: sortiert,
          tage: letzte3.map((m) => ({ datum: m.datumISO, mdiId: m.dominanteMdiId, metapher: m.metapher })),
        },
      };
    }

    // Durchschnitt berechnen und normalisieren
    const gemittelt: Record<string, number> = {};
    for (const [id, summe] of Object.entries(summen)) {
      gemittelt[id] = summe / anzahlMitVerteilung;
    }

    // Normalisieren auf 100%
    const gesamtProzent = Object.values(gemittelt).reduce((s, v) => s + v, 0);
    if (gesamtProzent > 0) {
      for (const id in gemittelt) {
        gemittelt[id] = (gemittelt[id] / gesamtProzent) * 100;
      }
    }

    // Absteigend sortieren
    const rangliste = Object.entries(gemittelt)
      .map(([id, prozent]) => ({ mdiId: parseInt(id), prozent: Math.round(prozent * 10) / 10 }))
      .sort((a, b) => b.prozent - a.prozent);

    const grundton = rangliste[0];

    return {
      istVollstaendig: true,
      gesamtTage: eindeutigeTage.length,
      profil: {
        grundtonMdiId: grundton?.mdiId ?? letzte3[0].dominanteMdiId,
        rangliste,
        tage: letzte3.map((m) => ({ datum: m.datumISO, mdiId: m.dominanteMdiId, metapher: m.metapher })),
      },
    };
  }),

  /**
   * Admin: Finales Profil pro User berechnen (für Admin-Übersicht).
   * Gibt für jeden User der >= 3 Messungen hat das gemittelte Profil zurück.
   */
  adminFinaleProfile: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new Error("DB nicht verfügbar");

    const alleMessungen = await db
      .select({
        id: stimmklangMessungen.id,
        userId: stimmklangMessungen.userId,
        dominanteMdiId: stimmklangMessungen.dominanteMdiId,
        dominanteFrequenz: stimmklangMessungen.dominanteFrequenz,
        metapher: stimmklangMessungen.metapher,
        farbHex: stimmklangMessungen.farbHex,
        wurzelklangMdiId: stimmklangMessungen.wurzelklangMdiId,
        mdiVerteilung: stimmklangMessungen.mdiVerteilung,
        datumISO: stimmklangMessungen.datumISO,
        createdAt: stimmklangMessungen.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(stimmklangMessungen)
      .leftJoin(users, eq(stimmklangMessungen.userId, users.id));

    // Messungen nach User gruppieren
    const userMap = new Map<number, typeof alleMessungen>();
    for (const m of alleMessungen) {
      if (!userMap.has(m.userId)) userMap.set(m.userId, []);
      userMap.get(m.userId)!.push(m);
    }

    const ergebnisse: Array<{
      userId: number;
      userName: string | null;
      userEmail: string | null;
      gesamtTage: number;
      grundtonMdiId: number;
      grundtonMetapher: string | null;
      top5: Array<{ mdiId: number; prozent: number }>;
      tage: Array<{ datum: string; mdiId: number; metapher: string | null }>;
    }> = [];

    for (const [userId, messungen] of Array.from(userMap.entries())) {
      // Pro Tag neueste Messung
      const tageMap = new Map<string, typeof messungen[0]>();
      for (const m of messungen) {
        const ex = tageMap.get(m.datumISO);
        if (!ex || (m.createdAt && ex.createdAt && new Date(m.createdAt) > new Date(ex.createdAt))) {
          tageMap.set(m.datumISO, m);
        }
      }
      const eindeutigeTage = Array.from(tageMap.values()).sort((a, b) => a.datumISO.localeCompare(b.datumISO));

      if (eindeutigeTage.length < 3) continue;

      const letzte3 = eindeutigeTage.slice(-3);
      const summen: Record<string, number> = {};
      let anzahl = 0;

      for (const m of letzte3) {
        if (!m.mdiVerteilung) continue;
        try {
          const v: Record<string, number> = JSON.parse(m.mdiVerteilung);
          anzahl++;
          for (const [id, pct] of Object.entries(v)) {
            summen[id] = (summen[id] || 0) + pct;
          }
        } catch { /* ignorieren */ }
      }

      let rangliste: Array<{ mdiId: number; prozent: number }>;

      if (anzahl === 0) {
        // Fallback auf dominanteMdiId
        const fb: Record<string, number> = {};
        for (const m of letzte3) {
          const id = m.dominanteMdiId.toString();
          fb[id] = (fb[id] || 0) + (100 / letzte3.length);
        }
        rangliste = Object.entries(fb)
          .map(([id, pct]) => ({ mdiId: parseInt(id), prozent: Math.round(pct * 10) / 10 }))
          .sort((a, b) => b.prozent - a.prozent);
      } else {
        const gemittelt: Record<string, number> = {};
        for (const [id, s] of Object.entries(summen)) gemittelt[id] = s / anzahl;
        const gesamt = Object.values(gemittelt).reduce((a, b) => a + b, 0);
        if (gesamt > 0) for (const id in gemittelt) gemittelt[id] = (gemittelt[id] / gesamt) * 100;
        rangliste = Object.entries(gemittelt)
          .map(([id, pct]) => ({ mdiId: parseInt(id), prozent: Math.round(pct * 10) / 10 }))
          .sort((a, b) => b.prozent - a.prozent);
      }

      const grundton = rangliste[0];
      const grundtonMessung = letzte3.find((m) => m.dominanteMdiId === grundton.mdiId);

      ergebnisse.push({
        userId,
        userName: eindeutigeTage[0]?.userName ?? null,
        userEmail: eindeutigeTage[0]?.userEmail ?? null,
        gesamtTage: eindeutigeTage.length,
        grundtonMdiId: grundton.mdiId,
        grundtonMetapher: grundtonMessung?.metapher ?? null,
        top5: rangliste.slice(0, 5),
        tage: letzte3.map((m) => ({ datum: m.datumISO, mdiId: m.dominanteMdiId, metapher: m.metapher ?? null })),
      });
    }

    return ergebnisse;
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
      .select({
        id: stimmklangMessungen.id,
        userId: stimmklangMessungen.userId,
        dominanteMdiId: stimmklangMessungen.dominanteMdiId,
        dominanteFrequenz: stimmklangMessungen.dominanteFrequenz,
        metapher: stimmklangMessungen.metapher,
        farbHex: stimmklangMessungen.farbHex,
        wurzelklangMdiId: stimmklangMessungen.wurzelklangMdiId,
        mdiVerteilung: stimmklangMessungen.mdiVerteilung,
        datumISO: stimmklangMessungen.datumISO,
        tagNummer: stimmklangMessungen.tagNummer,
        createdAt: stimmklangMessungen.createdAt,
        userName: users.name,
        userEmail: users.email,
      })
      .from(stimmklangMessungen)
      .leftJoin(users, eq(stimmklangMessungen.userId, users.id));

    messungen.sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    });

    return messungen;
  }),

  /**
   * Admin: Coach-Notiz für einen User lesen.
   */
  adminGetCoachNotiz: adminProcedure
    .input(z.object({ userId: z.number().int() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      const rows = await db
        .select()
        .from(coachNotizen)
        .where(eq(coachNotizen.userId, input.userId))
        .limit(1);
      return rows[0] ?? null;
    }),

  /**
   * Admin: Coach-Notiz für einen User speichern (upsert).
   */
  adminSaveCoachNotiz: adminProcedure
    .input(z.object({ userId: z.number().int(), notiz: z.string() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("DB nicht verfügbar");
      // Prüfen ob bereits vorhanden
      const existing = await db
        .select({ id: coachNotizen.id })
        .from(coachNotizen)
        .where(eq(coachNotizen.userId, input.userId))
        .limit(1);
      if (existing.length > 0) {
        await db
          .update(coachNotizen)
          .set({ notiz: input.notiz })
          .where(eq(coachNotizen.userId, input.userId));
      } else {
        await db.insert(coachNotizen).values({
          userId: input.userId,
          notiz: input.notiz,
        });
      }
      return { success: true };
    }),
});
