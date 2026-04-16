import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { trainingFreigaben } from "../../drizzle/schema";
import { eq, and } from "drizzle-orm";

// Alle bekannten Kategorien und Items
const ALLE_KATEGORIEN = ["befindlichkeit", "breathing", "voice", "movement", "ambient"] as const;
const ALLE_ITEMS: Record<string, string[]> = {
  ambient: ["metabolic", "mayerwelle"],
  voice: ["yohn", "interval"],
};

/**
 * Gibt zurück welche Kategorien und Items freigeschaltet sind.
 * Admins erhalten immer vollen Zugang (isAdmin=true).
 */
export const trainingRouter = router({
  /**
   * Öffentlich: Gibt den Freigabe-Status aller Kategorien/Items zurück.
   * Admins erhalten immer alles als freigeschaltet.
   */
  getFreigaben: publicProcedure.query(async ({ ctx }) => {
    // Admin-Bypass: Admins sehen immer alles
    if (ctx.user?.role === "admin") {
      const result: Record<string, boolean | Record<string, boolean>> = {};
      for (const cat of ALLE_KATEGORIEN) {
        if (ALLE_ITEMS[cat]) {
          const items: Record<string, boolean> = {};
          for (const item of ALLE_ITEMS[cat]) {
            items[item] = true;
          }
          result[cat] = items;
        } else {
          result[cat] = true;
        }
      }
      return { isAdmin: true, freigaben: result };
    }

    const db = await getDb();
    if (!db) return { isAdmin: false, freigaben: {} };

    const rows = await db.select().from(trainingFreigaben);

    const result: Record<string, boolean | Record<string, boolean>> = {};

    for (const row of rows) {
      if (!row.enabled) continue;

      if (row.itemId) {
        // Einzelne Einheit freigeschaltet
        if (!result[row.categoryId] || typeof result[row.categoryId] === "boolean") {
          result[row.categoryId] = {};
        }
        (result[row.categoryId] as Record<string, boolean>)[row.itemId] = true;
      } else {
        // Gesamte Kategorie freigeschaltet
        result[row.categoryId] = true;
      }
    }

    return { isAdmin: false, freigaben: result };
  }),

  /**
   * Admin-only: Schaltet eine Kategorie oder einzelne Einheit frei/sperrt sie.
   */
  setFreigabe: protectedProcedure
    .input(z.object({
      categoryId: z.string(),
      itemId: z.string().optional(),
      enabled: z.boolean(),
      label: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins können Freigaben steuern." });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      await db
        .insert(trainingFreigaben)
        .values({
          categoryId: input.categoryId,
          itemId: input.itemId ?? null,
          enabled: input.enabled,
          label: input.label ?? null,
        })
        .onDuplicateKeyUpdate({
          set: {
            enabled: input.enabled,
            label: input.label ?? null,
          },
        });

      return { success: true };
    }),

  /**
   * Admin-only: Gibt alle Freigaben für das Admin-Panel zurück.
   */
  getAllFreigaben: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(trainingFreigaben);
  }),
});
