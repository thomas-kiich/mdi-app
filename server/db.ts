import { and, desc, eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2";
import { randomBytes } from "crypto";
import { InsertNewsletterSubscriber, InsertUser, newsletterSubscribers, users, einladungsCodes, referrals } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;
let _pool: mysql.Pool | null = null;

// Create connection pool with optimized settings
function createPool() {
  if (_pool) return _pool;
  
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL not set");
  }
  
  try {
    const dbUrl = new URL(process.env.DATABASE_URL);
    
    _pool = mysql.createPool({
      host: dbUrl.hostname,
      user: dbUrl.username,
      password: dbUrl.password,
      database: dbUrl.pathname.slice(1),
      waitForConnections: true,
      connectionLimit: 50,  // Erhöht von default 10
      queueLimit: 0,        // Unbegrenzte Queue
      idleTimeout: 60000,   // 1 Minute statt 8 Stunden
      enableKeepAlive: true,
      keepAliveInitialDelay: 0,
      ssl: { rejectUnauthorized: false },  // TiDB Cloud erfordert SSL
    });
    
    console.log("[Database] Connection pool created with limit=50");
    return _pool;
  } catch (error) {
    console.error("[Database] Failed to create pool:", error);
    throw error;
  }
}

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      const pool = createPool();
      _db = drizzle(pool);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
      _pool = null;
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

// ─── Premium Settings ─────────────────────────────────────────────────────────

const PREMIUM_FEATURES = ["momentaufnahme", "befindlichkeitstraining", "trainingscenter"] as const;
export type PremiumFeature = typeof PREMIUM_FEATURES[number];

/**
 * Alle Premium-Einstellungen laden. Initialisiert fehlende Einträge mit enabled=false.
 */
export async function getPremiumSettings(): Promise<Record<PremiumFeature, boolean>> {
  const db = await getDb();
  const defaults: Record<PremiumFeature, boolean> = {
    momentaufnahme: false,
    befindlichkeitstraining: false,
    trainingscenter: false,
  };
  if (!db) return defaults;

  const { premiumSettings } = await import("../drizzle/schema");

  // Sicherstellen dass alle Features in der DB vorhanden sind
  for (const feature of PREMIUM_FEATURES) {
    await db
      .insert(premiumSettings)
      .values({ feature, enabled: false })
      .onDuplicateKeyUpdate({ set: { feature } });
  }

  const rows = await db.select().from(premiumSettings);
  for (const row of rows) {
    if (PREMIUM_FEATURES.includes(row.feature as PremiumFeature)) {
      defaults[row.feature as PremiumFeature] = row.enabled;
    }
  }
  return defaults;
}

/**
 * Einen Premium-Bereich ein- oder ausschalten.
 */
export async function setPremiumFeature(feature: PremiumFeature, enabled: boolean): Promise<void> {
  const db = await getDb();
  if (!db) return;
  const { premiumSettings } = await import("../drizzle/schema");
  await db
    .insert(premiumSettings)
    .values({ feature, enabled })
    .onDuplicateKeyUpdate({ set: { enabled } });
}

// ─── Empfehlungssystem (Referral) ────────────────────────────────────────────

/**
 * Generiert einen kurzen alphanumerischen Einladungscode (8 Zeichen).
 */
function generiereEinladungsCode(): string {
  const zeichen = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne 0/O/1/I (Verwechslungsgefahr)
  return Array.from({ length: 8 }, () =>
    zeichen[Math.floor(Math.random() * zeichen.length)]
  ).join("");
}

/**
 * Gibt den Einladungscode eines Users zurück.
 * Falls noch keiner existiert, wird einer erstellt.
 */
export async function getOrCreateEinladungsCode(userId: number): Promise<string> {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const existing = await db
    .select()
    .from(einladungsCodes)
    .where(eq(einladungsCodes.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0].code;

  // Neuen Code generieren (Kollisions-sicher: bis zu 5 Versuche)
  for (let i = 0; i < 5; i++) {
    const code = generiereEinladungsCode();
    try {
      await db.insert(einladungsCodes).values({ userId, code });
      return code;
    } catch {
      // Kollision → nächster Versuch
    }
  }
  throw new Error("Konnte keinen eindeutigen Einladungscode generieren");
}

/**
 * Verarbeitet einen Einladungscode beim ersten Login eines neuen Users.
 * Gibt den Einladenden zurück (für Benachrichtigung), oder null wenn Code ungültig.
 */
export async function verarbeiteEinladungsCode(params: {
  code: string;
  neuenUserId: number;
}): Promise<{ referrerId: number; referrerName: string | null } | null> {
  const db = await getDb();
  if (!db) return null;

  // Code nachschlagen
  const codeEintrag = await db
    .select()
    .from(einladungsCodes)
    .where(eq(einladungsCodes.code, params.code.toUpperCase()))
    .limit(1);

  if (codeEintrag.length === 0) return null;
  const referrerId = codeEintrag[0].userId;

  // Nicht sich selbst einladen
  if (referrerId === params.neuenUserId) return null;

  // Prüfen ob neuer User bereits eingeladen wurde
  const bereitsEingeladen = await db
    .select()
    .from(referrals)
    .where(eq(referrals.referredUserId, params.neuenUserId))
    .limit(1);

  if (bereitsEingeladen.length > 0) return null;

  // Referral speichern
  await db.insert(referrals).values({
    referrerId,
    referredUserId: params.neuenUserId,
  });

  // Zähler erhöhen
  await db
    .update(einladungsCodes)
    .set({ anzahlEinladungen: codeEintrag[0].anzahlEinladungen + 1 })
    .where(eq(einladungsCodes.userId, referrerId));

  // Einladenden-Name für Benachrichtigung holen
  const referrer = await db
    .select({ name: users.name })
    .from(users)
    .where(eq(users.id, referrerId))
    .limit(1);

  return {
    referrerId,
    referrerName: referrer[0]?.name ?? null,
  };
}

/**
 * Gibt alle Referrals eines Users zurück (wer wurde eingeladen).
 */
export async function getReferralsVonUser(userId: number) {
  const db = await getDb();
  if (!db) return [];

  return db
    .select({
      id: referrals.id,
      referredUserId: referrals.referredUserId,
      createdAt: referrals.createdAt,
      name: users.name,
    })
    .from(referrals)
    .leftJoin(users, eq(referrals.referredUserId, users.id))
    .where(eq(referrals.referrerId, userId))
    .orderBy(desc(referrals.createdAt));
}
