import { z } from "zod";
import { adminProcedure, publicProcedure } from "../_core/trpc";
import { getDb } from "../db";
import { kiichPraxisProjekte } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

export const praxisProjekteRouter = {
  // Public: Get all active projects
  getPraxisProjekte: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(kiichPraxisProjekte)
      .where(eq(kiichPraxisProjekte.aktiv, true))
      .orderBy(kiichPraxisProjekte.sortOrder);
  }),

  // Admin: Get all projects (including inactive)
  getPraxisProjekteAdmin: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];
    return await db
      .select()
      .from(kiichPraxisProjekte)
      .orderBy(kiichPraxisProjekte.sortOrder);
  }),

  // Admin: Create new project
  createPraxisProjekt: adminProcedure
    .input(
      z.object({
        titel: z.string().min(1, "Titel erforderlich"),
        beschreibung: z.string().min(1, "Beschreibung erforderlich"),
        detailbeschreibung: z.string().optional(),
        link: z.string().min(1, "Link erforderlich"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      const maxOrder = await db
        .select({ max: kiichPraxisProjekte.sortOrder })
        .from(kiichPraxisProjekte);
      const nextOrder = (maxOrder[0]?.max ?? 0) + 1;

      const result = await db.insert(kiichPraxisProjekte).values({
        titel: input.titel,
        beschreibung: input.beschreibung,
        detailbeschreibung: input.detailbeschreibung || null,
        link: input.link,
        sortOrder: nextOrder,
        aktiv: true,
      });

      return result;
    }),

  // Admin: Update project
  updatePraxisProjekt: adminProcedure
    .input(
      z.object({
        id: z.number(),
        titel: z.string().min(1, "Titel erforderlich"),
        beschreibung: z.string().min(1, "Beschreibung erforderlich"),
        detailbeschreibung: z.string().optional(),
        link: z.string().min(1, "Link erforderlich"),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .update(kiichPraxisProjekte)
        .set({
          titel: input.titel,
          beschreibung: input.beschreibung,
          detailbeschreibung: input.detailbeschreibung || null,
          link: input.link,
        })
        .where(eq(kiichPraxisProjekte.id, input.id));
    }),

  // Admin: Delete project
  deletePraxisProjekt: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      return await db
        .delete(kiichPraxisProjekte)
        .where(eq(kiichPraxisProjekte.id, input.id));
    }),

  // Admin: Reorder projects
  reorderPraxisProjekte: adminProcedure
    .input(z.object({ ids: z.array(z.number()) }))
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");
      for (let i = 0; i < input.ids.length; i++) {
        await db
          .update(kiichPraxisProjekte)
          .set({ sortOrder: i })
          .where(eq(kiichPraxisProjekte.id, input.ids[i]));
      }
      return { success: true };
    }),
};
