import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { TRPCError } from "@trpc/server";
import { getDb } from "../db";
import { backlogItems } from "../../drizzle/schema";
import { eq, desc, and } from "drizzle-orm";

const isAdmin = (role: string) => {
  if (role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins." });
  }
};

export const backlogRouter = router({
  // Alle Items abrufen (Admin only)
  list: protectedProcedure
    .input(z.object({
      status: z.enum(["offen", "in_arbeit", "erledigt", "verworfen", "alle"]).optional().default("alle"),
      kategorie: z.enum(["feature", "content", "marketing", "technik", "strategie", "sonstiges", "alle"]).optional().default("alle"),
    }))
    .query(async ({ ctx, input }) => {
      isAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const conditions = [];
      if (input.status !== "alle") {
        conditions.push(eq(backlogItems.status, input.status));
      }
      if (input.kategorie !== "alle") {
        conditions.push(eq(backlogItems.kategorie, input.kategorie));
      }
      const items = conditions.length > 0
        ? await db.select().from(backlogItems).where(and(...conditions)).orderBy(desc(backlogItems.createdAt))
        : await db.select().from(backlogItems).orderBy(desc(backlogItems.createdAt));
      return items;
    }),

  // Neues Item erstellen
  create: protectedProcedure
    .input(z.object({
      titel: z.string().min(1).max(255),
      beschreibung: z.string().optional(),
      kategorie: z.enum(["feature", "content", "marketing", "technik", "strategie", "sonstiges"]).default("sonstiges"),
      prioritaet: z.enum(["hoch", "mittel", "niedrig"]).default("mittel"),
      zieldatum: z.string().max(64).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.insert(backlogItems).values({
        titel: input.titel,
        beschreibung: input.beschreibung ?? null,
        kategorie: input.kategorie,
        prioritaet: input.prioritaet,
        status: "offen",
        zieldatum: input.zieldatum ?? null,
        erstelltVon: ctx.user.name ?? ctx.user.openId,
      });
      return { success: true };
    }),

  // Status aktualisieren
  updateStatus: protectedProcedure
    .input(z.object({
      id: z.number(),
      status: z.enum(["offen", "in_arbeit", "erledigt", "verworfen"]),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.update(backlogItems)
        .set({ status: input.status })
        .where(eq(backlogItems.id, input.id));
      return { success: true };
    }),

  // Item bearbeiten
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      titel: z.string().min(1).max(255).optional(),
      beschreibung: z.string().optional(),
      kategorie: z.enum(["feature", "content", "marketing", "technik", "strategie", "sonstiges"]).optional(),
      prioritaet: z.enum(["hoch", "mittel", "niedrig"]).optional(),
      zieldatum: z.string().max(64).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      const { id, ...fields } = input;
      await db.update(backlogItems)
        .set(fields)
        .where(eq(backlogItems.id, id));
      return { success: true };
    }),

  // Item löschen
  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      isAdmin(ctx.user.role);
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR" });
      await db.delete(backlogItems).where(eq(backlogItems.id, input.id));
      return { success: true };
    }),
});
