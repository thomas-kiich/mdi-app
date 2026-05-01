import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { podcastEpisodes } from "../../drizzle/schema";
import { eq, desc, count, ne, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/** Nur Admin darf schreiben */
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin")
    throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins erlaubt" });
  return next({ ctx });
});

export const podcastEpisodesRouter = router({
  /** Alle Episoden, sortiert nach sortOrder absteigend (neueste zuerst) */
  list: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return db
      .select()
      .from(podcastEpisodes)
      .orderBy(desc(podcastEpisodes.sortOrder));
  }),

  /** Neueste Episode (isLatest = true) */
  latest: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return null;
    const rows = await db
      .select()
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, true))
      .limit(1);
    return rows[0] ?? null;
  }),

  /** Episode anlegen */
  create: adminProcedure
    .input(
      z.object({
        episodeNumber: z.string().max(10),
        catchphrase: z.string().max(100),
        subtitle: z.string(),
        audioUrl: z.string().url(),
        coverImageUrl: z.string().url(),
        description: z.string().optional(),
        isLatest: z.boolean().default(false),
        sortOrder: z.number().int().default(0),
        youtubeUrl: z.string().url().optional(),
        spotifyUrl: z.string().url().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      // ✓ VALIDIERUNG: Wenn isLatest=true, setze alle anderen auf false
      if (input.isLatest) {
        const [existing] = await db
          .select({ count: count() })
          .from(podcastEpisodes)
          .where(eq(podcastEpisodes.isLatest, true));
        
        if (existing?.count > 0) {
          await db
            .update(podcastEpisodes)
            .set({ isLatest: false })
            .where(eq(podcastEpisodes.isLatest, true));
        }
      }
      
      const [result] = await db.insert(podcastEpisodes).values(input);
      return { id: (result as any).insertId };
    }),

  /** Episode aktualisieren */
  update: adminProcedure
    .input(
      z.object({
        id: z.number().int(),
        episodeNumber: z.string().max(10).optional(),
        catchphrase: z.string().max(100).optional(),
        subtitle: z.string().optional(),
        audioUrl: z.string().url().optional(),
        coverImageUrl: z.string().url().optional(),
        description: z.string().optional(),
        isLatest: z.boolean().optional(),
        sortOrder: z.number().int().optional(),
        youtubeUrl: z.string().url().nullish(),
        spotifyUrl: z.string().url().nullish(),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      
      const { id, ...data } = input;
      
      // ✓ VALIDIERUNG: Wenn isLatest=true, setze alle anderen (außer diese) auf false
      if (data.isLatest === true) {
        const [existing] = await db
          .select({ count: count() })
          .from(podcastEpisodes)
          .where(and(
            eq(podcastEpisodes.isLatest, true),
            ne(podcastEpisodes.id, id)
          ));
        
        if (existing?.count > 0) {
          await db
            .update(podcastEpisodes)
            .set({ isLatest: false })
            .where(and(
              eq(podcastEpisodes.isLatest, true),
              ne(podcastEpisodes.id, id)
            ));
        }
      }
      
      await db
        .update(podcastEpisodes)
        .set(data as any)
        .where(eq(podcastEpisodes.id, id));
      
      return { ok: true };
    }),

  /** Episode löschen */
  delete: adminProcedure
    .input(z.object({ id: z.number().int() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db
        .delete(podcastEpisodes)
        .where(eq(podcastEpisodes.id, input.id));
      return { ok: true };
    }),

  /** ✓ MONITORING: Validiere Podcast-Datenbank-Integrität */
  validateIntegrity: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return { ok: false, error: "DB nicht verfügbar" };
    
    try {
      // Zähle Episoden mit isLatest=true
      const [result] = await db
        .select({ count: count() })
        .from(podcastEpisodes)
        .where(eq(podcastEpisodes.isLatest, true));
      
      const latestCount = result?.count ?? 0;
      
      if (latestCount !== 1) {
        console.error(`❌ PODCAST INTEGRITY CHECK FAILED: ${latestCount} episodes marked as latest`);
        
        // Sende Alert an Owner
        await notifyOwner({
          title: "🚨 Podcast Datenbank-Fehler",
          content: `${latestCount} Episoden sind als 'latest' markiert. Bitte überprüfen.`
        }).catch(() => {});
        
        return { ok: false, error: `${latestCount} episodes with isLatest=true (expected 1)` };
      }
      
      return { ok: true, latestCount };
    } catch (err: any) {
      console.error("Integrity check error:", err.message);
      return { ok: false, error: err.message };
    }
  }),

});
