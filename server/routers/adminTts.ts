/**
 * Admin-Router: Google TTS Nutzungsstatistiken
 * Nur für Admins zugänglich (role = 'admin').
 * Zeigt Monatsverbrauch, Tagesverbrauch und Top-User.
 */

import { TRPCError } from "@trpc/server";
import { and, desc, gte, lte, sql, sum } from "drizzle-orm";
import { z } from "zod";
import { ttsNutzungslog, users } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { TTS_VOICE_NAME } from "../_core/googleTts";

// Google Chirp3 HD: 1 Million Zeichen/Monat gratis
const MONATLICHES_LIMIT = 1_000_000;

export const adminTtsRouter = router({
  /**
   * Monatsübersicht: Verbrauch des aktuellen Monats.
   * Gibt Gesamtzeichen, Prozent des Limits, und Aufschlüsselung nach Kontext zurück.
   */
  monatsStats: protectedProcedure
    .input(z.object({
      // Optional: anderer Monat (YYYY-MM), Standard = aktueller Monat
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

      // Tagesverbrauch der letzten 30 Tage für Balkendiagramm
      const vor30Tagen = new Date(jetzt.getTime() - 30 * 24 * 60 * 60 * 1000);
      const tagesVerlauf = await db
        .select({
          datum: sql<string>`DATE(${ttsNutzungslog.createdAt})`,
          zeichen: sql<number>`COALESCE(SUM(${ttsNutzungslog.zeichen}), 0)`,
          aufrufe: sql<number>`COUNT(*)`,
        })
        .from(ttsNutzungslog)
        .where(gte(ttsNutzungslog.createdAt, vor30Tagen))
        .groupBy(sql`DATE(${ttsNutzungslog.createdAt})`)
        .orderBy(sql`DATE(${ttsNutzungslog.createdAt})`);

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

      return {
        monat: `${jetzt.getFullYear()}-${String(jetzt.getMonth() + 1).padStart(2, "0")}`,
        monatStart: monatStart.toISOString(),
        monatEnde: monatEnde.toISOString(),
        gesamtZeichen,
        monatlichesLimit: MONATLICHES_LIMIT,
        prozentVerbraucht: Math.round((gesamtZeichen / MONATLICHES_LIMIT) * 100 * 10) / 10,
        verbleibendZeichen: Math.max(0, MONATLICHES_LIMIT - gesamtZeichen),
        nachKontext: nachKontext.map(r => ({
          kontext: r.kontext,
          zeichen: Number(r.zeichen),
          aufrufe: Number(r.aufrufe),
        })),
        tagesVerlauf: tagesVerlauf.map(r => ({
          datum: r.datum,
          zeichen: Number(r.zeichen),
          aufrufe: Number(r.aufrufe),
        })),
        alleZeit: {
          zeichen: Number(alleZeitRow?.gesamt ?? 0),
          aufrufe: Number(alleZeitRow?.aufrufe ?? 0),
        },
        eindeutigeUser: Number(userCountRow?.anzahl ?? 0),
        stimme: TTS_VOICE_NAME,
      };
    }),
});
