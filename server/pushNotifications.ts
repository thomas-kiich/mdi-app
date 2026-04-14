import webpush from "web-push";
import { ENV } from "./_core/env";

// VAPID konfigurieren
if (ENV.vapidPublicKey && ENV.vapidPrivateKey) {
  webpush.setVapidDetails(
    "mailto:thomas@kiich.de",
    ENV.vapidPublicKey,
    ENV.vapidPrivateKey
  );
}

export interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export async function sendPushNotification(
  subscription: PushSubscriptionData,
  title: string,
  body: string,
  erinnerungId?: number
): Promise<boolean> {
  if (!ENV.vapidPublicKey || !ENV.vapidPrivateKey) {
    console.warn("[Push] VAPID keys not configured");
    return false;
  }

  try {
    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, erinnerungId: erinnerungId ?? null })
    );
    return true;
  } catch (err: any) {
    // 410 = subscription abgelaufen/ungültig
    if (err.statusCode === 410 || err.statusCode === 404) {
      return false; // Caller soll Subscription löschen
    }
    console.error("[Push] sendPushNotification error:", err.message);
    return false;
  }
}
