/**
 * Hintergrund-Job: Prüft alle 30 Sekunden auf fällige Erinnerungen
 * und sendet Web Push Notifications an alle registrierten Geräte des Nutzers.
 */
import { getDb } from "./db";
import { erinnerungen, pushSubscriptions } from "../drizzle/schema";
import { eq, and, lte } from "drizzle-orm";
import { sendPushNotification } from "./pushNotifications";

export function startPushJob() {
  console.log("[PushJob] Hintergrund-Job gestartet – prüft alle 30 Sekunden");

  setInterval(async () => {
    try {
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
        // Push-Subscriptions des Nutzers laden
        const subs = await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.userId, erinnerung.userId));

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
            await db.delete(pushSubscriptions).where(eq(pushSubscriptions.id, sub.id));
          }
        }

        // Erinnerung als ausgelöst markieren
        await db
          .update(erinnerungen)
          .set({ ausgeloest: true })
          .where(eq(erinnerungen.id, erinnerung.id));
      }
    } catch (err) {
      console.error("[PushJob] Fehler:", err);
    }
  }, 30_000); // alle 30 Sekunden
}
