import { TRPCError } from "@trpc/server";
import { and, eq, isNull } from "drizzle-orm";
import { z } from "zod";
import { randomBytes } from "crypto";
import { apiTokens } from "../../drizzle/schema";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";

// ─── Router ──────────────────────────────────────────────────────────────────

export const apiTokensRouter = router({

  /**
   * Alle aktiven API-Tokens des Nutzers auflisten.
   */
  list: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

    const tokens = await db
      .select({
        id: apiTokens.id,
        name: apiTokens.name,
        lastUsedAt: apiTokens.lastUsedAt,
        createdAt: apiTokens.createdAt,
        // Token-Wert wird NICHT zurückgegeben (nur einmalig bei Erstellung sichtbar)
      })
      .from(apiTokens)
      .where(
        and(
          eq(apiTokens.userId, ctx.user.id),
          isNull(apiTokens.revokedAt)
        )
      );

    return tokens;
  }),

  /**
   * Neuen API-Token generieren.
   * Der Token-Wert wird NUR einmalig zurückgegeben – danach nicht mehr abrufbar.
   */
  generate: protectedProcedure
    .input(z.object({ name: z.string().min(1).max(128) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      // Sicherer 32-Byte-Token (64 Hex-Zeichen)
      const tokenValue = "kiich_" + randomBytes(32).toString("hex");

      await db.insert(apiTokens).values({
        userId: ctx.user.id,
        token: tokenValue,
        name: input.name,
      });

      // Token-Wert einmalig zurückgeben
      return {
        token: tokenValue,
        name: input.name,
        createdAt: new Date(),
      };
    }),

  /**
   * API-Token widerrufen.
   */
  revoke: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar" });

      await db
        .update(apiTokens)
        .set({ revokedAt: new Date() })
        .where(
          and(
            eq(apiTokens.id, input.id),
            eq(apiTokens.userId, ctx.user.id),
            isNull(apiTokens.revokedAt)
          )
        );

      return { success: true };
    }),
});

/**
 * Hilfsfunktion: Token validieren und userId zurückgeben.
 * Wird von der Obsidian-Sync-Route verwendet.
 */
export async function validateApiToken(tokenValue: string): Promise<number | null> {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select({ userId: apiTokens.userId, id: apiTokens.id })
    .from(apiTokens)
    .where(
      and(
        eq(apiTokens.token, tokenValue),
        isNull(apiTokens.revokedAt)
      )
    )
    .limit(1);

  if (result.length === 0) return null;

  // lastUsedAt aktualisieren
  await db
    .update(apiTokens)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiTokens.id, result[0].id));

  return result[0].userId;
}
