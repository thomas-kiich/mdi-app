/**
 * Admin-Router: Voxtral TTS Nutzungsstatistiken
 * Nur für Admins zugänglich (role = 'admin').
 * Zeigt Monatsverbrauch, Tagesverbrauch und Kostenübersicht.
 */

import { TRPCError } from "@trpc/server";
import { and, gte, lte, sql } from "drizzle-orm";
import { z } from "zod";
import { ttsNutzungslog } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

// Voxtral TTS: $0.016 pro 1.000 Zeichen (Stand März 2026)
const VOXTRAL_PREIS_PRO_1000_USD = 0.016;
// Referenzwert – kein offizielles Monatslimit bei Voxtral (pay-per-use)
const MONATLICHES_LIMIT = 1_000_000;

export const adminTtsRouter = router({
  /**
   * Monatsübersicht: Verbrauch des aktuellen Monats.
   * Gibt Gesamtzeichen, Kosten in USD, und Aufschlüsselung nach Kontext zurück.
   */
  monatsStats: protectedProcedure
    .input(z.object({
      monat: z.string().regex(/^\d{4}-\d{2}$/).optional(),
    }).optional())
    .query(async ({ ctx }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      // Aktuellen Monat bestimmen
      const jetzt = new Date();
      const monatStart = new Date(jetzt.getFullYear(), jetzt.getMonth(), 1);
      const monatEnde = new Date(jetzt.getFullYear(), jetzt.getMonth() + 1, 0, 23, 59, 59);

      // Gesamtzeichen diesen Monat
      const [gesamtRow] = await db
        .select({ gesamt: sql<number>`COALESCE(SUM(${ttsNutzungslog.zeichen}), 0)` })
        .from(ttsNutzungslog)
        .where(and(
          gte(ttsNutzungslog.createdAt, monatStart),
          lte(ttsNutzungslog.createdAt, monatEnde)
        ));

      const gesamtZeichen = Number(gesamtRow?.gesamt ?? 0);

      // Aufschlüsselung nach Kontext
      const nachKontext = await db
        .select({
          kontext: ttsNutzungslog.kontext,
          zeichen: sql<number>`COALESCE(SUM(${ttsNutzungslog.zeichen}), 0)`,
          aufrufe: sql<number>`COUNT(*)`,
        })
        .from(ttsNutzungslog)
        .where(and(
          gte(ttsNutzungslog.createdAt, monatStart),
          lte(ttsNutzungslog.createdAt, monatEnde)
        ))
        .groupBy(ttsNutzungslog.kontext);

      // Tagesverbrauch der letzten 30 Tage – Raw SQL wegen MySQL ONLY_FULL_GROUP_BY
      const vor30Tagen = new Date(jetzt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const [tagesVerlaufRows] = await db.execute(
        sql`SELECT DATE(createdAt) as datum, COALESCE(SUM(zeichen), 0) as zeichen, COUNT(*) as aufrufe
            FROM tts_nutzungslog
            WHERE createdAt >= ${vor30Tagen}
            GROUP BY DATE(createdAt)
            ORDER BY DATE(createdAt)`
      ) as any;
      const tagesVerlauf = (Array.isArray(tagesVerlaufRows) ? tagesVerlaufRows : []).map((r: any) => ({
        datum: typeof r.datum === 'object' && r.datum !== null
          ? (r.datum as Date).toISOString().slice(0, 10)
          : String(r.datum),
        zeichen: Number(r.zeichen),
        aufrufe: Number(r.aufrufe),
      }));

      // Gesamtstatistik (alle Zeit)
      const [alleZeitRow] = await db
        .select({
          gesamt: sql<number>`COALESCE(SUM(${ttsNutzungslog.zeichen}), 0)`,
          aufrufe: sql<number>`COUNT(*)`,
        })
        .from(ttsNutzungslog);

      // Anzahl eindeutiger User die TTS genutzt haben
      const [userCountRow] = await db
        .select({ anzahl: sql<number>`COUNT(DISTINCT ${ttsNutzungslog.userId})` })
        .from(ttsNutzungslog);

      const alleZeitZeichen = Number(alleZeitRow?.gesamt ?? 0);
      const monatKostenUsd = (gesamtZeichen / 1000) * VOXTRAL_PREIS_PRO_1000_USD;
      const gesamtKostenUsd = (alleZeitZeichen / 1000) * VOXTRAL_PREIS_PRO_1000_USD;

      return {
        monat: `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, "0")}`,
        monatStart: monatStart.toISOString(),
        monatEnde: monatEnde.toISOString(),
        gesamtZeichen,
        monatlichesLimit: MONATLICHES_LIMIT,
        prozentVerbraucht: Math.round((gesamtZeichen / MONATLICHES_LIMIT) * 100 * 10) / 10,
        verbleibendZeichen: Math.max(0, MONATLICHES_LIMIT - gesamtZeichen),
        monatKostenUsd: Math.round(monatKostenUsd * 10000) / 10000,
        gesamtKostenUsd: Math.round(gesamtKostenUsd * 10000) / 10000,
        preisProTausendUsd: VOXTRAL_PREIS_PRO_1000_USD,
        nachKontext: nachKontext.map(r => ({
          kontext: r.kontext,
          zeichen: Number(r.zeichen),
          aufrufe: Number(r.aufrufe),
          kostenUsd: Math.round((Number(r.zeichen) / 1000) * VOXTRAL_PREIS_PRO_1000_USD * 10000) / 10000,
        })),
        tagesVerlauf,
        alleZeit: {
          zeichen: alleZeitZeichen,
          aufrufe: Number(alleZeitRow?.aufrufe ?? 0),
          kostenUsd: Math.round(gesamtKostenUsd * 10000) / 10000,
        },
        eindeutigeUser: Number(userCountRow?.anzahl ?? 0),
        stimme: "voxtral-mini-tts-latest",
      };
    }),
});
