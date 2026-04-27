import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { trainingFreigaben, userTrainingFreigaben } from "../../drizzle/schema";
import { eq, and, isNull } from "drizzle-orm";

// Alle bekannten Kategorien und Items
const ALLE_KATEGORIEN = ["befindlichkeit", "breathing", "voice", "movement", "ambient"] as const;
const ALLE_ITEMS: Record<string, string[]> = {
  ambient: ["metabolic", "mayerwelle"],
  voice: ["yohn", "interval"],
};

/**
 * Gibt zurück welche Kategorien und Items freigeschaltet sind.
 * Priorität: nutzer-spezifisch > global. Admins erhalten immer vollen Zugang.
 */
export const trainingRouter = router({
  /**
   * Öffentlich: Gibt den Freigabe-Status aller Kategorien/Items zurück.
   * Admins erhalten immer alles als freigeschaltet.
   * Nutzer-spezifische Freigaben überschreiben globale.
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

    // Globale Freigaben laden
    const globalRows = await db.select().from(trainingFreigaben);

    // Nutzer-spezifische Freigaben laden (falls eingeloggt)
    const userRows = ctx.user
      ? await db
          .select()
          .from(userTrainingFreigaben)
          .where(eq(userTrainingFreigaben.userId, ctx.user.id))
      : [];

    // Globale Freigaben als Basis
    const result: Record<string, boolean | Record<string, boolean>> = {};

    for (const row of globalRows) {
      if (!row.enabled) continue;
      if (row.itemId) {
        if (!result[row.categoryId] || typeof result[row.categoryId] === "boolean") {
          result[row.categoryId] = {};
        }
        (result[row.categoryId] as Record<string, boolean>)[row.itemId] = true;
      } else {
        result[row.categoryId] = true;
      }
    }

    // Nutzer-spezifische Freigaben überschreiben globale
    for (const row of userRows) {
      if (row.itemId) {
        // Item-spezifische Freigabe
        if (row.enabled) {
          if (!result[row.categoryId] || typeof result[row.categoryId] === "boolean") {
            result[row.categoryId] = {};
          }
          (result[row.categoryId] as Record<string, boolean>)[row.itemId] = true;
        } else {
          // Explizit sperren
          if (result[row.categoryId] && typeof result[row.categoryId] === "object") {
            delete (result[row.categoryId] as Record<string, boolean>)[row.itemId];
          }
        }
      } else {
        // Kategorie-Freigabe
        if (row.enabled) {
          result[row.categoryId] = true;
        } else {
          delete result[row.categoryId];
        }
      }
    }

    return { isAdmin: false, freigaben: result };
  }),

  /**
   * Admin-only: Schaltet eine globale Kategorie oder einzelne Einheit frei/sperrt sie.
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
   * Admin-only: Gibt alle globalen Freigaben für das Admin-Panel zurück.
   */
  getAllFreigaben: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN" });
    }
    const db = await getDb();
    if (!db) return [];
    return await db.select().from(trainingFreigaben);
  }),

  /**
   * Gibt die Dashboard-Freigaben des eingeloggten Nutzers zurück.
   * Wird im Dashboard verwendet um individuelle Bereiche freizuschalten.
   */
  getMyDashboardFreigaben: protectedProcedure
    .query(async ({ ctx }) => {
      const db = await getDb();
      if (!db) return {} as Record<string, boolean>;
      const rows = await db
        .select()
        .from(userTrainingFreigaben)
        .where(eq(userTrainingFreigaben.userId, ctx.user.id));
      const result: Record<string, boolean> = {};
      for (const row of rows) {
        // Dashboard-Bereiche haben categoryId ohne itemId
        if (!row.itemId) {
          result[row.categoryId] = row.enabled;
        }
      }
      return result;
    }),

  /**
   * Admin-only: Gibt alle nutzer-spezifischen Freigaben für einen bestimmten Nutzer zurück.
   */
  getUserFreigaben: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) return [];
      return await db
        .select()
        .from(userTrainingFreigaben)
        .where(eq(userTrainingFreigaben.userId, input.userId));
    }),

  /**
   * Admin-only: Setzt oder entfernt eine nutzer-spezifische Freigabe.
   */
  setUserFreigabe: protectedProcedure
    .input(z.object({
      userId: z.number(),
      categoryId: z.string(),
      itemId: z.string().optional(),
      enabled: z.boolean(),
      label: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur Admins können Nutzer-Freigaben steuern." });
      }

      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      // Prüfen ob Eintrag bereits existiert
      const existing = await db
        .select()
        .from(userTrainingFreigaben)
        .where(
          and(
            eq(userTrainingFreigaben.userId, input.userId),
            eq(userTrainingFreigaben.categoryId, input.categoryId),
            input.itemId
              ? eq(userTrainingFreigaben.itemId, input.itemId)
              : isNull(userTrainingFreigaben.itemId)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        await db
          .update(userTrainingFreigaben)
          .set({ enabled: input.enabled, label: input.label ?? null })
          .where(eq(userTrainingFreigaben.id, existing[0].id));
      } else {
        await db.insert(userTrainingFreigaben).values({
          userId: input.userId,
          categoryId: input.categoryId,
          itemId: input.itemId ?? null,
          enabled: input.enabled,
          label: input.label ?? null,
        });
      }

      return { success: true };
    }),

  /**
   * Admin-only: Entfernt alle nutzer-spezifischen Freigaben für einen Nutzer
   * (setzt ihn zurück auf globale Einstellungen).
   */
  resetUserFreigaben: protectedProcedure
    .input(z.object({ userId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN" });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });

      const { eq } = await import("drizzle-orm");
      await db
        .delete(userTrainingFreigaben)
        .where(eq(userTrainingFreigaben.userId, input.userId));

      return { success: true };
    }),
});
