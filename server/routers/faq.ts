/**
 * FAQ-Router
 * - frageEinreichen: öffentlich, jeder kann eine Frage stellen
 * - getOeffentlicheFaqs: öffentlich, nur beantwortete + als öffentlich markierte Fragen
 * - getAlleFragen: Admin-only, alle Fragen
 * - frageBeantwortenUndVeroeffentlichen: Admin-only, Antwort setzen + veröffentlichen
 * - frageArchivieren: Admin-only
 */

import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { faqFragen } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

export const faqRouter = router({
  /**
   * Öffentlich: Frage einreichen
   */
  frageEinreichen: publicProcedure
    .input(
      z.object({
        frage: z.string().min(10, "Bitte mindestens 10 Zeichen eingeben.").max(1000),
        name: z.string().max(128).optional(),
        email: z.string().email("Ungültige E-Mail-Adresse.").max(320).optional().or(z.literal("")),
      }),
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar." });

      const { frage, name, email } = input;

      await db.insert(faqFragen).values({
        frage,
        name: name || null,
        email: email || null,
        status: "offen",
        oeffentlich: false,
      });

      // Admin benachrichtigen
      await notifyOwner({
        title: "Neue FAQ-Frage eingegangen",
        content: `Von: ${name || "Anonym"}${email ? ` (${email})` : ""}\n\nFrage: ${frage.slice(0, 300)}${frage.length > 300 ? "..." : ""}`,
      }).catch(() => {});

      return { success: true };
    }),

  /**
   * Öffentlich: Nur beantwortete & als öffentlich markierte Fragen
   */
  getOeffentlicheFaqs: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) return [];

    return db
      .select({
        id: faqFragen.id,
        frage: faqFragen.frage,
        antwort: faqFragen.antwort,
        name: faqFragen.name,
        createdAt: faqFragen.createdAt,
      })
      .from(faqFragen)
      .where(and(eq(faqFragen.status, "beantwortet"), eq(faqFragen.oeffentlich, true)))
      .orderBy(desc(faqFragen.createdAt));
  }),

  /**
   * Admin: Alle Fragen (offen + beantwortet + archiviert)
   */
  getAlleFragen: protectedProcedure.query(async ({ ctx }) => {
    if (ctx.user.role !== "admin") {
      throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
    }
    const db = await getDb();
    if (!db) return [];

    return db
      .select()
      .from(faqFragen)
      .orderBy(desc(faqFragen.createdAt));
  }),

  /**
   * Admin: Frage beantworten und optional veröffentlichen
   */
  frageBeantwortenUndVeroeffentlichen: protectedProcedure
    .input(
      z.object({
        id: z.number(),
        antwort: z.string().min(5).max(5000),
        oeffentlich: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar." });

      await db
        .update(faqFragen)
        .set({
          antwort: input.antwort,
          status: "beantwortet",
          oeffentlich: input.oeffentlich,
        })
        .where(eq(faqFragen.id, input.id));

      return { success: true };
    }),

  /**
   * Admin: Frage archivieren (aus öffentlicher FAQ entfernen)
   */
  frageArchivieren: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      if (ctx.user.role !== "admin") {
        throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
      }
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "Datenbank nicht verfügbar." });

      await db
        .update(faqFragen)
        .set({ status: "archiviert", oeffentlich: false })
        .where(eq(faqFragen.id, input.id));

      return { success: true };
    }),
});
