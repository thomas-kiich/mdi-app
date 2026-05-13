/**
 * VITAL ROUTER
 *
 * Verwaltet Vitalwerte (DSGVO Art. 9 – Gesundheitsdaten) und Coaching-Einwilligungen.
 *
 * Sicherheitsregeln:
 * - Jeder Nutzer kann nur seine eigenen Vitalwerte lesen/schreiben.
 * - Coach-Zugriff (Thomas) nur nach expliziter Einwilligung des Nutzers.
 * - Widerruf ist jederzeit möglich (widerrufenAtMs wird gesetzt).
 */

import { z } from "zod";
import { protectedProcedure, adminProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { vitalEintraege, coachingEinwilligungen, users } from "../../drizzle/schema";
import { eq, and, isNull, desc, gte, lte } from "drizzle-orm";
import { TRPCError } from "@trpc/server";
import { ENV } from "../_core/env";

export const COACHING_EINWILLIGUNGSTEXT_V1 = `Ich willige hiermit ausdrücklich ein, dass meine im KIICH Vitalmonitor erfassten Gesundheitsdaten (Ruhepuls, HRV, Apnoe-Werte, BOLT-Score, Körpertemperatur, Gewicht, Tagesplan und Befindlichkeitsnotizen) an meinen Coach Thomas Chochola übermittelt und von ihm im Rahmen des persönlichen Einzelcoachings eingesehen werden dürfen.

Diese Einwilligung erfolgt freiwillig auf Basis von Art. 9 Abs. 2 lit. a DSGVO. Ich kann diese Einwilligung jederzeit ohne Angabe von Gründen widerrufen. Ein Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.

Die Daten werden ausschließlich für Coaching-Zwecke verwendet und nicht an Dritte weitergegeben.`.trim();

/**
 * Löst coachId=-1 auf die userId des Owners (Thomas) auf.
 * Wird verwendet wenn das Frontend keinen expliziten Coach kennt.
 */
async function resolveCoachId(inputCoachId: number): Promise<number> {
  if (inputCoachId !== -1) return inputCoachId;
  const db = await getDb();
  if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
  const ownerUser = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.openId, ENV.ownerOpenId))
    .limit(1);
  if (ownerUser.length === 0) throw new TRPCError({ code: "NOT_FOUND", message: "Coach nicht gefunden" });
  return ownerUser[0].id;
}

export const vitalRouter = router({

  saveEintrag: protectedProcedure
    .input(z.object({
      datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
      ruhepuls: z.number().min(20).max(300).nullable().optional(),
      hrv: z.number().min(0).max(500).nullable().optional(),
      apnoeAus: z.string().max(10).nullable().optional(),
      apnoeEin: z.string().max(10).nullable().optional(),
      bolt: z.number().min(0).max(600).nullable().optional(),
      boltMcp: z.number().min(0).max(600).nullable().optional(),
      boltCp: z.number().min(0).max(600).nullable().optional(),
      temperatur: z.string().max(10).nullable().optional(),
      gewicht: z.string().max(10).nullable().optional(),
      anmerkungen: z.string().max(5000).nullable().optional(),
      tagesplan: z.string().max(20000).nullable().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;
      const now = Date.now();

      const existing = await db
        .select({ id: vitalEintraege.id })
        .from(vitalEintraege)
        .where(and(
          eq(vitalEintraege.userId, userId),
          eq(vitalEintraege.datum, input.datum)
        ))
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(vitalEintraege)
          .set({
            ruhepuls: input.ruhepuls ?? null,
            hrv: input.hrv ?? null,
            apnoeAus: input.apnoeAus ?? null,
            apnoeEin: input.apnoeEin ?? null,
            bolt: input.bolt ?? null,
            boltMcp: input.boltMcp ?? null,
            boltCp: input.boltCp ?? null,
            temperatur: input.temperatur ?? null,
            gewicht: input.gewicht ?? null,
            anmerkungen: input.anmerkungen ?? null,
            tagesplan: input.tagesplan ?? null,
          })
          .where(and(
            eq(vitalEintraege.userId, userId),
            eq(vitalEintraege.datum, input.datum)
          ));
        return { success: true, action: "updated" as const };
      } else {
        await db.insert(vitalEintraege).values({
          userId,
          datum: input.datum,
          ruhepuls: input.ruhepuls ?? null,
          hrv: input.hrv ?? null,
          apnoeAus: input.apnoeAus ?? null,
          apnoeEin: input.apnoeEin ?? null,
          bolt: input.bolt ?? null,
          boltMcp: input.boltMcp ?? null,
          boltCp: input.boltCp ?? null,
          temperatur: input.temperatur ?? null,
          gewicht: input.gewicht ?? null,
          anmerkungen: input.anmerkungen ?? null,
          tagesplan: input.tagesplan ?? null,
          createdAtMs: now,
        });
        return { success: true, action: "created" as const };
      }
    }),

  getMyEintraege: protectedProcedure
    .input(z.object({
      vonDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      bisDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      limit: z.number().int().min(1).max(365).default(90),
    }).optional())
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;

      const conditions: any[] = [eq(vitalEintraege.userId, userId)];
      if (input?.vonDatum) conditions.push(gte(vitalEintraege.datum, input.vonDatum));
      if (input?.bisDatum) conditions.push(lte(vitalEintraege.datum, input.bisDatum));

      return await db
        .select()
        .from(vitalEintraege)
        .where(and(...conditions))
        .orderBy(desc(vitalEintraege.datum))
        .limit(input?.limit ?? 90);
    }),

  getEintragByDatum: protectedProcedure
    .input(z.object({
      datum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;

      const result = await db
        .select()
        .from(vitalEintraege)
        .where(and(
          eq(vitalEintraege.userId, userId),
          eq(vitalEintraege.datum, input.datum)
        ))
        .limit(1);

      return result[0] ?? null;
    }),

  activateCoachingMode: protectedProcedure
    .input(z.object({
      coachId: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;
      const now = Date.now();
      const coachId = await resolveCoachId(input.coachId);

      const existing = await db
        .select({ id: coachingEinwilligungen.id })
        .from(coachingEinwilligungen)
        .where(and(
          eq(coachingEinwilligungen.userId, userId),
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ))
        .limit(1);

      if (existing.length > 0) {
        return { success: true, alreadyActive: true };
      }

      const reqCtx = ctx as any;
      const rawIp = reqCtx.req?.ip ?? reqCtx.req?.headers?.["x-forwarded-for"] ?? null;
      const ipAdresse = typeof rawIp === "string" ? rawIp.split(",")[0].trim() : null;

      await db.insert(coachingEinwilligungen).values({
        userId,
        coachId,
        eingewilligtAtMs: now,
        widerrufenAtMs: null,
        einwilligungsText: COACHING_EINWILLIGUNGSTEXT_V1,
        ipAdresse,
      });

      return { success: true, alreadyActive: false };
    }),

  revokeCoachingMode: protectedProcedure
    .input(z.object({
      coachId: z.number().int(),
    }))
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;
      const now = Date.now();
      const coachId = await resolveCoachId(input.coachId);

      await db
        .update(coachingEinwilligungen)
        .set({ widerrufenAtMs: now })
        .where(and(
          eq(coachingEinwilligungen.userId, userId),
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ));

      return { success: true };
    }),

  getMyCoachingStatus: protectedProcedure
    .input(z.object({
      coachId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const userId = ctx.user.id;
      const coachId = await resolveCoachId(input.coachId);

      const active = await db
        .select()
        .from(coachingEinwilligungen)
        .where(and(
          eq(coachingEinwilligungen.userId, userId),
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ))
        .limit(1);

      return {
        isActive: active.length > 0,
        einwilligung: active[0] ?? null,
      };
    }),

  getCoachingClients: adminProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const coachId = ctx.user.id;

      return await db
        .select({
          einwilligungId: coachingEinwilligungen.id,
          userId: coachingEinwilligungen.userId,
          eingewilligtAtMs: coachingEinwilligungen.eingewilligtAtMs,
          userName: users.name,
          userVorname: users.vorname,
          userEmail: users.email,
        })
        .from(coachingEinwilligungen)
        .innerJoin(users, eq(users.id, coachingEinwilligungen.userId))
        .where(and(
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ))
        .orderBy(desc(coachingEinwilligungen.eingewilligtAtMs));
    }),

  getClientEintraege: adminProcedure
    .input(z.object({
      clientUserId: z.number().int(),
      vonDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      bisDatum: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
      limit: z.number().int().min(1).max(365).default(90),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const coachId = ctx.user.id;

      const einwilligung = await db
        .select({ id: coachingEinwilligungen.id })
        .from(coachingEinwilligungen)
        .where(and(
          eq(coachingEinwilligungen.userId, input.clientUserId),
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ))
        .limit(1);

      if (einwilligung.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine aktive Einwilligung für diesen Client vorhanden.",
        });
      }

      const conditions: any[] = [eq(vitalEintraege.userId, input.clientUserId)];
      if (input.vonDatum) conditions.push(gte(vitalEintraege.datum, input.vonDatum));
      if (input.bisDatum) conditions.push(lte(vitalEintraege.datum, input.bisDatum));

      return await db
        .select()
        .from(vitalEintraege)
        .where(and(...conditions))
        .orderBy(desc(vitalEintraege.datum))
        .limit(input.limit);
    }),

  getClientProfile: adminProcedure
    .input(z.object({
      clientUserId: z.number().int(),
    }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });
      const coachId = ctx.user.id;

      const einwilligung = await db
        .select()
        .from(coachingEinwilligungen)
        .where(and(
          eq(coachingEinwilligungen.userId, input.clientUserId),
          eq(coachingEinwilligungen.coachId, coachId),
          isNull(coachingEinwilligungen.widerrufenAtMs)
        ))
        .limit(1);

      if (einwilligung.length === 0) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Keine aktive Einwilligung für diesen Client vorhanden.",
        });
      }

      const userProfile = await db
        .select({
          id: users.id,
          name: users.name,
          vorname: users.vorname,
          email: users.email,
          createdAt: users.createdAt,
        })
        .from(users)
        .where(eq(users.id, input.clientUserId))
        .limit(1);

      return {
        user: userProfile[0] ?? null,
        einwilligung: einwilligung[0],
      };
    }),
});
