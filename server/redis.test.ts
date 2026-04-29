/**
 * REDIS CONNECTION TEST
 *
 * Validiert dass die Redis Cloud Verbindung funktioniert
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { createClient } from "redis";

describe("Redis Cloud Connection", () => {
  let client: ReturnType<typeof createClient> | null = null;

  beforeAll(async () => {
    const redisUrl = process.env.REDIS_URL;
    if (!redisUrl) {
      console.log("[Redis Test] REDIS_URL nicht gesetzt – Test übersprungen");
      return;
    }

    try {
      client = createClient({ url: redisUrl });
      client.on("error", (err) => console.error("[Redis Error]", err));
      await client.connect();
      console.log("[Redis Test] Verbindung erfolgreich");
    } catch (error) {
      console.error("[Redis Test] Verbindungsfehler:", error);
      throw error;
    }
  });

  afterAll(async () => {
    if (client) {
      await client.quit();
    }
  });

  it("sollte mit Redis Cloud verbunden sein", async () => {
    if (!client) {
      console.log("[Redis Test] Client nicht initialisiert – Test übersprungen");
      return;
    }

    const isConnected = client.isOpen;
    expect(isConnected).toBe(true);
  });

  it("sollte Daten speichern und abrufen können", async () => {
    if (!client) {
      console.log("[Redis Test] Client nicht initialisiert – Test übersprungen");
      return;
    }

    const testKey = "test:kiich:redis";
    const testValue = "hello-redis-cloud";

    // Speichere Wert
    await client.set(testKey, testValue);

    // Abrufen
    const result = await client.get(testKey);
    expect(result).toBe(testValue);

    // Cleanup
    await client.del(testKey);
  });

  it("sollte TTL setzen können", async () => {
    if (!client) {
      console.log("[Redis Test] Client nicht initialisiert – Test übersprungen");
      return;
    }

    const testKey = "test:kiich:ttl";
    const testValue = "expires-soon";

    // Speichere mit 10 Sekunden TTL
    await client.setEx(testKey, 10, testValue);

    // Prüfe TTL
    const ttl = await client.ttl(testKey);
    expect(ttl).toBeGreaterThan(0);
    expect(ttl).toBeLessThanOrEqual(10);

    // Cleanup
    await client.del(testKey);
  });

  it("sollte Cache-Pattern unterstützen", async () => {
    if (!client) {
      console.log("[Redis Test] Client nicht initialisiert – Test übersprungen");
      return;
    }

    const cacheKey = "admin:stats:einschlaf";
    const cacheValue = JSON.stringify({ total: 100, new: 5 });

    // Speichere mit 5 Minuten TTL (wie in cache.ts)
    await client.setEx(cacheKey, 300, cacheValue);

    // Abrufen und parsen
    const cached = await client.get(cacheKey);
    expect(cached).toBe(cacheValue);

    const parsed = JSON.parse(cached!);
    expect(parsed.total).toBe(100);
    expect(parsed.new).toBe(5);

    // Cleanup
    await client.del(cacheKey);
  });
});
