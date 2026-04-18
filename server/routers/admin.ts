import { TRPCError } from "@trpc/server";
import { protectedProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { users, newsletterSubscribers } from "../../drizzle/schema";
import { sql, gte, count } from "drizzle-orm";

const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== "admin") {
    throw new TRPCError({ code: "FORBIDDEN", message: "Nur für Admins" });
  }
  return next({ ctx });
});

export const adminRouter = router({
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
