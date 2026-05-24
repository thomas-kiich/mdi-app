/**
 * TRAINING EINHEITEN – tRPC Router
 * Admin-CRUD für vom Admin verwaltete Trainings-Inhalte.
 * Nutzer können aktive Einheiten lesen; Schreiben nur für Admins.
 */
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { trainingEinheiten } from "../../drizzle/schema";
import { eq, asc } from "drizzle-orm";

const KATEGORIEN = [
  "befindlichkeit",
  "atemtraining",
  "stimmklangtraining",
  "bewegungstraining",
  "umfeldaktivierung",
  "kiichpraxis",
] as const;

const einheitInput = z.object({
  kategorie: z.enum(KATEGORIEN),
  titel: z.string().min(1).max(200),
  kurzbeschreibung: z.string().min(1),
  beschreibung: z.string().optional().or(z.literal("")),
  dauern: z.string().min(1).max(50).default("7,12,21"),
  audioUrl: z.string().url().optional().or(z.literal("")),
  videoUrl: z.string().url().optional().or(z.literal("")),
  infografikUrl: z.string().url().optional().or(z.literal("")),
  infografik2Url: z.string().url().optional().or(z.literal("")),
  slideshowUrls: z.array(z.string().url()).optional().default([]),
  audioBeschreibungUrl: z.string().url().optional().or(z.literal("")),
  sortOrder: z.number().int().default(0),
  aktiv: z.boolean().default(false),
});

export const trainingEinheitenRouter = router({
  /** Alle aktiven Einheiten – für Nutzer (öffentlich nach Login) */
  getAll: protectedProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db
      .select()
      .from(trainingEinheiten)
      .where(eq(trainingEinheiten.aktiv, true))
      .orderBy(asc(trainingEinheiten.sortOrder), asc(trainingEinheiten.createdAt));
  }),

  /** Alle Einheiten (aktiv + inaktiv) – nur Admin */
  getAllAdmin: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
    return db
      .select()
      .from(trainingEinheiten)
      .orderBy(asc(trainingEinheiten.kategorie), asc(trainingEinheiten.sortOrder));
  }),

  /** Einzelne Einheit – für Nutzer (nur aktive) */
  getById: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const [einheit] = await db
        .select()
        .from(trainingEinheiten)
        .where(eq(trainingEinheiten.id, input.id));
      if (!einheit) throw new TRPCError({ code: "NOT_FOUND" });
      // Nicht-Admins dürfen nur aktive Einheiten sehen
      if (!einheit.aktiv && ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      return einheit;
    }),

  /** Neue Einheit anlegen – nur Admin */
  create: protectedProcedure
    .input(einheitInput)
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const result = await db.insert(trainingEinheiten).values({
        kategorie: input.kategorie,
        titel: input.titel,
        kurzbeschreibung: input.kurzbeschreibung,
        beschreibung: input.beschreibung || null,
        dauern: input.dauern,
        audioUrl: input.audioUrl || null,
        videoUrl: input.videoUrl || null,
        infografikUrl: input.infografikUrl || null,
        infografik2Url: input.infografik2Url || null,
        slideshowUrls: input.slideshowUrls && input.slideshowUrls.length > 0 ? JSON.stringify(input.slideshowUrls) : null,
        audioBeschreibungUrl: input.audioBeschreibungUrl || null,
        sortOrder: input.sortOrder,
        aktiv: input.aktiv,
      });
      return { success: true, id: Number((result as any).insertId) };
    }),

  /** Einheit aktualisieren – nur Admin */
  update: protectedProcedure
    .input(einheitInput.extend({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(trainingEinheiten)
        .set({
          kategorie: input.kategorie,
          titel: input.titel,
          kurzbeschreibung: input.kurzbeschreibung,
          beschreibung: input.beschreibung || null,
          dauern: input.dauern,
          audioUrl: input.audioUrl || null,
          videoUrl: input.videoUrl || null,
          infografikUrl: input.infografikUrl || null,
          infografik2Url: input.infografik2Url || null,
          slideshowUrls: input.slideshowUrls && input.slideshowUrls.length > 0 ? JSON.stringify(input.slideshowUrls) : null,
          audioBeschreibungUrl: input.audioBeschreibungUrl || null,
          sortOrder: input.sortOrder,
          aktiv: input.aktiv,
        })
        .where(eq(trainingEinheiten.id, input.id));
      return { success: true };
    }),

  /** Einheit löschen – nur Admin */
  delete: protectedProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .delete(trainingEinheiten)
        .where(eq(trainingEinheiten.id, input.id));
      return { success: true };
    }),

  /** Aktiv/Inaktiv umschalten – nur Admin */
  toggleAktiv: protectedProcedure
    .input(z.object({ id: z.number().int(), aktiv: z.boolean() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") throw new TRPCError({ code: "FORBIDDEN" });
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .update(trainingEinheiten)
        .set({ aktiv: input.aktiv })
        .where(eq(trainingEinheiten.id, input.id));
      return { success: true };
    }),
});
