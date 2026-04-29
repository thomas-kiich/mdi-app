/**
 * REDIS CACHE UTILITY
 *
 * Verwaltet Caching für häufig abgerufene Daten:
 * - Befindlichkeits-Kategorien
 * - Nutzer-Freigaben
 * - Admin-Statistiken
 *
 * Cache-Strategie:
 * - TTL (Time-To-Live): 5 Minuten für Statistiken, 1 Stunde für Kategorien
 * - Invalidation: Manuell nach Datenbankänderungen
 */

import { createClient, RedisClientType } from "redis";

let redisClient: RedisClientType | null = null;
let isConnected = false;

/**
 * Initialisiere Redis-Verbindung (optional)
 * Falls Redis nicht verfügbar, funktioniert das System ohne Cache
 */
export async function initRedis(): Promise<void> {
  try {
    // Redis ist optional – nur wenn REDIS_URL gesetzt
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log("[Cache] Redis nicht konfiguriert – Cache deaktiviert");
      return;
    }

    redisClient = createClient({ url: redisUrl });
    redisClient.on("error", (err) => console.error("[Redis Error]", err));
    await redisClient.connect();
    isConnected = true;
    console.log("[Cache] Redis verbunden");
  } catch (error) {
    console.warn("[Cache] Redis-Verbindung fehlgeschlagen – Cache deaktiviert", error);
    isConnected = false;
  }
}

/**
 * Schließe Redis-Verbindung
 */
export async function closeRedis(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.quit();
    isConnected = false;
  }
}

/**
 * Cache-Schlüssel-Generatoren
 */
const cacheKeys = {
  adminStats: (feature: string) => `admin:stats:${feature}`,
  userFreigaben: (userId: number) => `user:freigaben:${userId}`,
  kategorien: (type: string) => `kategorien:${type}`,
};

/**
 * Generisches Cache-Get mit Fallback
 */
export async function getCached<T>(
  key: string,
  fallback: () => Promise<T>,
  ttlSeconds: number = 300
): Promise<T> {
  // Wenn Redis nicht verfügbar, direkt fallback
  if (!isConnected || !redisClient) {
    return fallback();
  }

  try {
    // Versuche aus Cache zu lesen
    const cached = await redisClient.get(key);
    if (cached) {
      return JSON.parse(cached) as T;
    }

    // Cache-Miss: Fallback-Funktion aufrufen
    const result = await fallback();

    // Speichere im Cache
    await redisClient.setEx(key, ttlSeconds, JSON.stringify(result));
    return result;
  } catch (error) {
    console.warn(`[Cache] Fehler bei ${key}:`, error);
    // Bei Fehler: fallback ohne Cache
    return fallback();
  }
}

/**
 * Cache invalidieren
 */
export async function invalidateCache(pattern: string): Promise<void> {
  if (!isConnected || !redisClient) return;

  try {
    const keys = await redisClient.keys(pattern);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Cache] Invalidiert: ${keys.length} Keys für ${pattern}`);
    }
  } catch (error) {
    console.warn(`[Cache] Fehler beim Invalidieren von ${pattern}:`, error);
  }
}

/**
 * Cache-Helper für Admin-Statistiken
 */
export async function cacheAdminStats<T>(
  feature: string,
  fallback: () => Promise<T>
): Promise<T> {
  return getCached(cacheKeys.adminStats(feature), fallback, 300); // 5 Minuten
}

/**
 * Cache-Helper für Nutzer-Freigaben
 */
export async function cacheUserFreigaben<T>(
  userId: number,
  fallback: () => Promise<T>
): Promise<T> {
  return getCached(cacheKeys.userFreigaben(userId), fallback, 3600); // 1 Stunde
}

/**
 * Cache-Helper für Kategorien
 */
export async function cacheKategorien<T>(
  type: string,
  fallback: () => Promise<T>
): Promise<T> {
  return getCached(cacheKeys.kategorien(type), fallback, 3600); // 1 Stunde
}

/**
 * Invalidiere Admin-Statistiken
 */
export async function invalidateAdminStats(): Promise<void> {
  await invalidateCache("admin:stats:*");
}

/**
 * Invalidiere Nutzer-Freigaben
 */
export async function invalidateUserFreigaben(userId?: number): Promise<void> {
  if (userId) {
    await invalidateCache(`user:freigaben:${userId}`);
  } else {
    await invalidateCache("user:freigaben:*");
  }
}

/**
 * Invalidiere Kategorien
 */
export async function invalidateKategorien(): Promise<void> {
  await invalidateCache("kategorien:*");
}
