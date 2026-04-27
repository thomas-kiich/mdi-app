import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, newsletterSubscribers, einschlafBibliothek, momentaufnahmen } from "../../drizzle/schema";
import { sql, gte, count, like, or, eq, desc } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
  }
  return next({ ctx });
});

export const adminRouter = router({
  // Benutzersuche nach Name oder E-Mail
  searchUsers: adminProcedure
    .input(z.object({ query: z.string().min(1).max(100) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

      const q = `%${input.query}%`;
      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          vorname: users.vorname,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .where(
          or(
            like(users.name, q),
            like(users.email, q),
            like(users.vorname, q)
          )
        )
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(50);

      return results;
    }),

  // Alle Benutzer auflisten (paginiert)
  listUsers: adminProcedure
    .input(z.object({ page: z.number().min(0).default(0) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

      const pageSize = 20;
      const offset = input.page * pageSize;

      const results = await db
        .select({
          id: users.id,
          name: users.name,
          email: users.email,
          vorname: users.vorname,
          role: users.role,
          createdAt: users.createdAt,
          lastSignedIn: users.lastSignedIn,
        })
        .from(users)
        .orderBy(sql`${users.createdAt} DESC`)
        .limit(pageSize)
        .offset(offset);

      const [totalResult] = await db.select({ count: count() }).from(users);
      return { users: results, total: totalResult?.count ?? 0, pageSize };
    }),

  // Benutzer löschen (DSGVO: alle Daten)
  deleteUser: adminProcedure
    .input(z.object({ userId: z.number(), confirm: z.literal(true) }))
    .mutation(async ({ input, ctx }) => {
      const db = await getDb();
      if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

      // Sicherheit: Owner kann nicht gelöscht werden
      const [target] = await db.select({ id: users.id, openId: users.openId }).from(users).where(eq(users.id, input.userId));
      if (!target) throw new TRPCError({ code: "NOT_FOUND", message: "Benutzer nicht gefunden" });
      if (target.openId === ctx.user.openId) throw new TRPCError({ code: "FORBIDDEN", message: "Du kannst dich nicht selbst löschen" });

      // Newsletter-Eintrag ebenfalls löschen (DSGVO)
      const [userEmail] = await db.select({ email: users.email }).from(users).where(eq(users.id, input.userId));
      if (userEmail?.email) {
        await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.email, userEmail.email));
      }

      await db.delete(users).where(eq(users.id, input.userId));
      return { success: true, deletedId: input.userId };
    }),

  // Nutzungsstatistiken: Einschlafbibliothek
  getEinschlafStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

    // Gesamtzahl Geschichten
    const [totalResult] = await db.select({ count: count() }).from(einschlafBibliothek);
    const total = totalResult?.count ?? 0;

    // Aufschlüsselung nach Kategorie
    const byKategorie = await db
      .select({ kategorie: einschlafBibliothek.kategorie, count: count() })
      .from(einschlafBibliothek)
      .groupBy(einschlafBibliothek.kategorie);

    // Top-Themen (Befindlichkeit)
    const topThemen = await db
      .select({ thema: einschlafBibliothek.thema, count: count() })
      .from(einschlafBibliothek)
      .where(eq(einschlafBibliothek.kategorie, "BEFINDLICHKEIT"))
      .groupBy(einschlafBibliothek.thema)
      .orderBy(desc(count()))
      .limit(15);

    // Aktivste Nutzer (nach Anzahl generierter Geschichten)
    const aktivsteNutzer = await db
      .select({
        userId: einschlafBibliothek.userId,
        name: users.name,
        vorname: users.vorname,
        count: count(),
      })
      .from(einschlafBibliothek)
      .leftJoin(users, eq(einschlafBibliothek.userId, users.id))
      .groupBy(einschlafBibliothek.userId, users.name, users.vorname)
      .orderBy(desc(count()))
      .limit(10);

    // Letzte 30 Tage
    const dreissigTageAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [letzteMonatResult] = await db
      .select({ count: count() })
      .from(einschlafBibliothek)
      .where(gte(einschlafBibliothek.createdAt, dreissigTageAgo));
    const letzterMonat = letzteMonatResult?.count ?? 0;

    // Letzte 7 Tage
    const siebenTageAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [letzteWocheResult] = await db
      .select({ count: count() })
      .from(einschlafBibliothek)
      .where(gte(einschlafBibliothek.createdAt, siebenTageAgo));
    const letzteWoche = letzteWocheResult?.count ?? 0;

    // Mit Audio (wurden abgehört)
    const [mitAudioResult] = await db
      .select({ count: count() })
      .from(einschlafBibliothek)
      .where(sql`${einschlafBibliothek.audioUrl} IS NOT NULL`);
    const mitAudio = mitAudioResult?.count ?? 0;

    return { total, byKategorie, topThemen, aktivsteNutzer, letzterMonat, letzteWoche, mitAudio };
  }),

  // Nutzungsstatistiken: Momentaufnahmen (YOHN-Training)
  getMomentaufnahmenStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

    // Gesamtzahl
    const [totalResult] = await db.select({ count: count() }).from(momentaufnahmen);
    const total = totalResult?.count ?? 0;

    // Aufschlüsselung nach Kategorie (Gravitationszentrum)
    const byKategorie = await db
      .select({ kategorie: momentaufnahmen.kategorie, count: count() })
      .from(momentaufnahmen)
      .groupBy(momentaufnahmen.kategorie)
      .orderBy(desc(count()));

    // Aktivste Nutzer
    const aktivsteNutzer = await db
      .select({
        userId: momentaufnahmen.userId,
        name: users.name,
        vorname: users.vorname,
        count: count(),
      })
      .from(momentaufnahmen)
      .leftJoin(users, eq(momentaufnahmen.userId, users.id))
      .groupBy(momentaufnahmen.userId, users.name, users.vorname)
      .orderBy(desc(count()))
      .limit(10);

    // Letzte 30 Tage
    const dreissigTageAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [letzteMonatResult] = await db
      .select({ count: count() })
      .from(momentaufnahmen)
      .where(gte(momentaufnahmen.createdAt, dreissigTageAgo));
    const letzterMonat = letzteMonatResult?.count ?? 0;

    // Letzte 7 Tage
    const siebenTageAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [letzteWocheResult] = await db
      .select({ count: count() })
      .from(momentaufnahmen)
      .where(gte(momentaufnahmen.createdAt, siebenTageAgo));
    const letzteWoche = letzteWocheResult?.count ?? 0;

    // Durchschnittliche Aufnahmedauer
    const [avgResult] = await db
      .select({ avg: sql<number>`AVG(${momentaufnahmen.dauerSekunden})` })
      .from(momentaufnahmen)
      .where(sql`${momentaufnahmen.dauerSekunden} IS NOT NULL`);
    const avgDauer = Math.round(avgResult?.avg ?? 0);

    return { total, byKategorie, aktivsteNutzer, letzterMonat, letzteWoche, avgDauer };
  }),

  getUserStats: adminProcedure.query(async () => {
    const db = await getDb();
    if (!db) throw new TRPCError({ code: "INTERNAL_SERVER_ERROR", message: "DB nicht verfügbar" });

    // Gesamtzahl der User
    const [totalResult] = await db.select({ count: count() }).from(users);
    const totalUsers = totalResult?.count ?? 0;

    // Neue User diese Woche (letzte 7 Tage)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [weekResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneWeekAgo));
    const newThisWeek = weekResult?.count ?? 0;

    // Neue User diesen Monat (letzte 30 Tage)
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const [monthResult] = await db
      .select({ count: count() })
      .from(users)
      .where(gte(users.createdAt, oneMonthAgo));
    const newThisMonth = monthResult?.count ?? 0;

    // Letzte 10 Registrierungen
    const recentUsers = await db
      .select({
        id: users.id,
        name: users.name,
        createdAt: users.createdAt,
        lastSignedIn: users.lastSignedIn,
        role: users.role,
      })
      .from(users)
      .orderBy(sql`${users.createdAt} DESC`)
      .limit(10);

    // Newsletter-Abonnenten (aktiv)
    const [nlTotalResult] = await db
      .select({ count: count() })
      .from(newsletterSubscribers)
      .where(sql`${newsletterSubscribers.active} = true`);
    const totalNewsletterSubscribers = nlTotalResult?.count ?? 0;

    return {
      totalUsers,
      newThisWeek,
      newThisMonth,
      totalNewsletterSubscribers,
      recentUsers,
    };
  }),
});
