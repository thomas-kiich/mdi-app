/**
 * Hintergrund-Job: Prüft alle 30 Sekunden auf fällige Erinnerungen
 * und sendet Web Push Notifications an alle registrierten Geräte des Nutzers.
 *
 * Fehlerbehandlung:
 * - ECONNRESET / Verbindungsabbrüche: exponentielles Backoff (1s, 2s, 4s), max. 3 Versuche
 * - Nach 3 Fehlversuchen: nächster regulärer Zyklus in 30 Sekunden
 */
import { getDb } from "./db";
import { erinnerungen, pushSubscriptions } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { sendPushNotification } from "./pushNotifications";

const MAX_RETRIES = 3;
const RETRY_BASE_MS = 1_000; // 1s, 2s, 4s

/** Wartet `ms` Millisekunden */
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/** Führt eine Funktion mit exponentiellem Backoff aus */
async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = MAX_RETRIES
): Promise<T | null> {
  for (let versuch = 0; versuch <= maxRetries; versuch++) {
    try {
      return await fn();
    } catch (err: any) {
      const istLetzterVersuch = versuch === maxRetries;
      const istVerbindungsFehler =
        err?.code === "ECONNRESET" ||
        err?.code === "ECONNREFUSED" ||
        err?.code === "ETIMEDOUT" ||
        err?.cause?.code === "ECONNRESET" ||
        err?.cause?.code === "ECONNREFUSED" ||
        err?.message?.includes("ECONNRESET") ||
        err?.message?.includes("connection");

      if (istLetzterVersuch) {
        console.error(`[PushJob] ${label} – endgültig fehlgeschlagen nach ${maxRetries + 1} Versuchen:`, err?.message ?? err);
        return null;
      }

      if (istVerbindungsFehler) {
        const warteMs = RETRY_BASE_MS * Math.pow(2, versuch);
        console.warn(`[PushJob] ${label} – Verbindungsfehler (Versuch ${versuch + 1}/${maxRetries + 1}), warte ${warteMs}ms...`);
        await sleep(warteMs);
      } else {
        // Kein Verbindungsfehler – nicht wiederholen
        console.error(`[PushJob] ${label} – nicht-transienter Fehler:`, err?.message ?? err);
        return null;
      }
    }
  }
  return null;
}

export function startPushJob() {
  console.log("[PushJob] Hintergrund-Job gestartet – prüft alle 30 Sekunden");

  setInterval(async () => {
    // Gesamten Job-Zyklus mit Retry absichern
    await withRetry(async () => {
      const db = await getDb();
      if (!db) return;

      const jetztMs = Date.now();

      // Alle fälligen, noch nicht ausgelösten Erinnerungen laden
      const faellige = await db
        .select()
        .from(erinnerungen)
        .where(
          and(
            eq(erinnerungen.ausgeloest, false),
            eq(erinnerungen.bestaetigt, false),
            lte(erinnerungen.faelligkeitMs, jetztMs)
          )
        );

      if (faellige.length === 0) return;

      for (const erinnerung of faellige) {
        // Push-Subscriptions des Nutzers laden (mit eigenem Retry)
        const subs = await withRetry(
          () => db.select().from(pushSubscriptions).where(eq(pushSubscriptions.userId, erinnerung.userId)),
          `Subscriptions laden für Erinnerung #${erinnerung.id}`
        );
        if (!subs) continue;

        // Push an alle Geräte senden
        for (const sub of subs) {
          const ok = await sendPushNotification(
            { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
            "MA Erinnerung",
            erinnerung.text,
            erinnerung.id
          );

          // Ungültige Subscriptions löschen
          if (!ok) {
            await withRetry(
              () => db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id)),
              `Subscription #${sub.id} löschen`
            );
          }
        }

        // Erinnerung als ausgelöst markieren (mit Retry)
        await withRetry(
          () => db.update(erinnerungen).set({ ausgeloest: true }).where(eq(erinnerungen.id, erinnerung.id)),
          `Erinnerung #${erinnerung.id} als ausgelöst markieren`
        );
      }
    }, "Job-Zyklus");
  }, 30_000); // alle 30 Sekunden
}
