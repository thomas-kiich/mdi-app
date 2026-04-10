import { eq } from "drizzle-orm";
import { z } from "zod";
import { users } from "../../drizzle/schema";
import { getDb } from "../db";
import { protectedProcedure, router } from "../_core/trpc";

export const profilRouter = router({
  /**
   * Vorname des eingeloggten Nutzers abrufen.
   */
  getVorname: protectedProcedure.query(async ({ ctx }) => {
    const db = await getDb();
    if (!db) return { vorname: null };

    const result = await db
      .select({ vorname: users.vorname })
      .from(users)
      .where(eq(users.id, ctx.user.id))
      .limit(1);

    return { vorname: result[0]?.vorname ?? null };
  }),

  /**
   * Vorname des eingeloggten Nutzers setzen oder aktualisieren.
   */
  setVorname: protectedProcedure
    .input(z.object({ vorname: z.string().min(1).max(64).trim() }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new Error("Datenbank nicht verfügbar");

      await db
        .update(users)
        .set({ vorname: input.vorname })
        .where(eq(users.id, ctx.user.id));

      return { vorname: input.vorname };
    }),
});
