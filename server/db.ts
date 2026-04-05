import { and, desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertNewsletterSubscriber, InsertUser, newsletterSubscribers, users } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ─── Newsletter Subscriber Helpers ───────────────────────────────────────────

/**
 * Subscribe an email address to the newsletter.
 * Returns the subscriber record. Throws if the email is already subscribed.
 */
export async function subscribeToNewsletter(data: { email: string; name?: string; source?: string }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const email = data.email.toLowerCase().trim();

  // Check if already subscribed
  const existing = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  if (existing.length > 0) {
    const sub = existing[0];
    if (sub.active) {
      throw new Error("ALREADY_SUBSCRIBED");
    }
    // Re-activate if previously unsubscribed
    await db
      .update(newsletterSubscribers)
      .set({ active: true, updatedAt: new Date() })
      .where(eq(newsletterSubscribers.id, sub.id));
    return { ...sub, active: true, reactivated: true };
  }

  const insert: InsertNewsletterSubscriber = {
    email,
    name: data.name ?? null,
    source: data.source ?? "website",
    active: true,
    welcomeEmailSent: false,
  };

  await db.insert(newsletterSubscribers).values(insert);

  const created = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email))
    .limit(1);

  return created[0];
}

/**
 * Unsubscribe an email address from the newsletter.
 */
export async function unsubscribeFromNewsletter(email: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const normalized = email.toLowerCase().trim();
  await db
    .update(newsletterSubscribers)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(newsletterSubscribers.email, normalized));
}

/**
 * List all active newsletter subscribers (admin only).
 */
export async function listNewsletterSubscribers(opts?: { activeOnly?: boolean }) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const conditions = opts?.activeOnly !== false
    ? [eq(newsletterSubscribers.active, true)]
    : [];

  return db
    .select()
    .from(newsletterSubscribers)
    .where(conditions.length > 0 ? and(...conditions) : undefined)
    .orderBy(desc(newsletterSubscribers.createdAt));
}

/**
 * Get newsletter subscriber count.
 */
export async function getNewsletterSubscriberCount() {
  const db = await getDb();
  if (!db) return { active: 0, total: 0 };

  const all = await db.select().from(newsletterSubscribers);
  const active = all.filter(s => s.active).length;
  return { active, total: all.length };
}
