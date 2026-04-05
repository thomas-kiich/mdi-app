import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { randomBytes } from "crypto";
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

// ─── Newsletter Subscriber Helpers (DSGVO-konform) ───────────────────────────

function generateToken(): string {
  return randomBytes(48).toString("hex");
}

/**
 * DSGVO: Schritt 1 – Anmeldung mit Double-Opt-In.
 * Erstellt einen inaktiven Eintrag mit Bestätigungs-Token.
 * Der Nutzer wird erst nach Klick auf den Bestätigungslink aktiviert.
 */
export async function subscribeToNewsletter(data: {
  email: string;
  name?: string;
  source?: string;
  signupIp?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const email = data.email.toLowerCase().trim();
  const confirmToken = generateToken();
  const deleteToken = generateToken();

  // Check if already exists
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
    // Pending confirmation or previously unsubscribed → reset tokens and resend
    await db
      .update(newsletterSubscribers)
      .set({
        confirmToken,
        deleteToken,
        active: false,
        confirmedAt: null,
        updatedAt: new Date(),
      })
      .where(eq(newsletterSubscribers.id, sub.id));
    return { ...sub, confirmToken, deleteToken, resent: true };
  }

  const insert: InsertNewsletterSubscriber = {
    email,
    name: data.name ?? null,
    source: data.source ?? "website",
    active: false, // DSGVO: erst nach Bestätigung aktiv
    confirmToken,
    deleteToken,
    signupIp: data.signupIp ?? null,
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
 * DSGVO: Schritt 2 – Bestätigung per Token (Double-Opt-In).
 * Aktiviert den Abonnenten und löscht den Bestätigungs-Token.
 */
export async function confirmNewsletterSubscription(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.confirmToken, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("INVALID_TOKEN");
  }

  const sub = result[0];

  if (sub.active) {
    throw new Error("ALREADY_CONFIRMED");
  }

  await db
    .update(newsletterSubscribers)
    .set({
      active: true,
      confirmedAt: new Date(),
      confirmToken: null, // Token nach Bestätigung löschen
      updatedAt: new Date(),
    })
    .where(eq(newsletterSubscribers.id, sub.id));

  return { ...sub, active: true, confirmedAt: new Date() };
}

/**
 * DSGVO: Abmeldung per Token (aus E-Mail-Link).
 */
export async function unsubscribeFromNewsletter(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.deleteToken, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("INVALID_TOKEN");
  }

  await db
    .update(newsletterSubscribers)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(newsletterSubscribers.id, result[0].id));

  return { email: result[0].email };
}

/**
 * DSGVO Art. 17: Vollständige Datenlöschung per Token.
 */
export async function deleteNewsletterData(token: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db
    .select()
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.deleteToken, token))
    .limit(1);

  if (result.length === 0) {
    throw new Error("INVALID_TOKEN");
  }

  await db
    .delete(newsletterSubscribers)
    .where(eq(newsletterSubscribers.id, result[0].id));

  return { email: result[0].email };
}

/**
 * Admin: Alle Abonnenten auflisten.
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
 * Abonnenten-Zähler für Social Proof.
 */
export async function getNewsletterSubscriberCount() {
  const db = await getDb();
  if (!db) return { active: 0, total: 0 };

  const all = await db.select().from(newsletterSubscribers);
  const active = all.filter(s => s.active).length;
  return { active, total: all.length };
}
