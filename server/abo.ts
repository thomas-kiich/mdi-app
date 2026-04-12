/**
 * Abonnement-Logik für MOMENTAUFNAHME
 *
 * Ebenen-Übersicht:
 * - Trial:    7 Tage voller Zugang (wie Ebene III)
 * - Ebene I:  kostenlos | max. 3 Aufnahmen/Monat | kein TTS | kein Schlaf-Modus
 * - Ebene II: 9 €/Monat | max. 9 Aufnahmen/Monat | 20 TTS/Monat | Schlaf-Modus
 * - Ebene III: 17 €/Monat | unbegrenzt | alle Features
 * - Expired:  Trial abgelaufen, kein Abo → nur Lesezugriff auf bestehende Daten
 */

import { getDb } from "./db";
import { abonnements, nutzungsLimits } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";

export type AboEbene = "I" | "II" | "III";
export type AboStatus = "trial" | "active" | "cancelled" | "expired";

export interface AboInfo {
  ebene: AboEbene;
  status: AboStatus;
  /** Verbleibende Trial-Tage (nur wenn status === 'trial') */
  trialTageVerbleibend: number | null;
  /** Ist der Trial abgelaufen? */
  trialAbgelaufen: boolean;
  /** Hat der User vollen Zugang (Trial oder aktives Abo Ebene II/III)? */
  vollerZugang: boolean;
}

export interface LimitInfo {
  aufnahmenCount: number;
  ttsCount: number;
  geschichtenCount: number;
  aufnahmenLimit: number;
  ttsLimit: number;
  geschichtenLimit: number;
  aufnahmenErreicht: boolean;
  ttsErreicht: boolean;
  geschichtenErreicht: boolean;
}

/** Limits pro Ebene */
export const EBENEN_LIMITS: Record<AboEbene | "trial" | "expired", { aufnahmen: number; tts: number; geschichten: number }> = {
  trial:   { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  I:       { aufnahmen: 3,      tts: 0,      geschichten: 0 },
  II:      { aufnahmen: 9,      tts: 20,     geschichten: 5 },
  III:     { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  expired: { aufnahmen: 0,      tts: 0,      geschichten: 0 },
};

/** Preise in Euro-Cent (für Stripe) */
export const EBENEN_PREISE: Record<"II" | "III", number> = {
  II:  900,   // 9,00 €
  III: 1700,  // 17,00 €
};

/**
 * Gibt den aktuellen Abo-Status eines Users zurück.
 * Erstellt automatisch einen Trial-Eintrag falls noch keiner existiert.
 */
export async function getAboInfo(userId: number): Promise<AboInfo> {
  const db = await getDb();
  if (!db) {
    // Fallback: voller Zugang wenn DB nicht verfügbar
    return { ebene: "III", status: "trial", trialTageVerbleibend: 7, trialAbgelaufen: false, vollerZugang: true };
  }

  // Abo-Eintrag laden oder erstellen
  let abo = await db.select().from(abonnements).where(eq(abonnements.userId, userId)).then(r => r[0]);

  if (!abo) {
    // Neuer User: Trial starten (7 Tage)
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(abonnements).values({
      userId,
      ebene: "I",
      status: "trial",
      trialStartedAt: now,
      trialEndsAt: trialEnd,
    });
    abo = await db.select().from(abonnements).where(eq(abonnements.userId, userId)).then(r => r[0]);
  }

  if (!abo) {
    return { ebene: "I", status: "expired", trialTageVerbleibend: null, trialAbgelaufen: true, vollerZugang: false };
  }

  const now = new Date();

  // Trial-Status prüfen und ggf. aktualisieren
  if (abo.status === "trial" && abo.trialEndsAt < now) {
    await db.update(abonnements).set({ status: "expired" }).where(eq(abonnements.userId, userId));
    abo.status = "expired";
  }

  // Abo-Ablauf prüfen
  if (abo.status === "active" && abo.currentPeriodEnd && abo.currentPeriodEnd < now) {
    await db.update(abonnements).set({ status: "expired" }).where(eq(abonnements.userId, userId));
    abo.status = "expired";
  }

  const trialTageVerbleibend = abo.status === "trial"
    ? Math.max(0, Math.ceil((abo.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const trialAbgelaufen = abo.status === "expired" && !abo.stripeSubscriptionId;

  const vollerZugang =
    abo.status === "trial" ||
    (abo.status === "active" && (abo.ebene === "II" || abo.ebene === "III")) ||
    (abo.status === "cancelled" && abo.currentPeriodEnd !== null && abo.currentPeriodEnd > now);

  return {
    ebene: abo.ebene,
    status: abo.status as AboStatus,
    trialTageVerbleibend,
    trialAbgelaufen,
    vollerZugang,
  };
}

/**
 * Gibt den aktuellen Nutzungsstand und die Limits für einen User zurück.
 */
export async function getLimitInfo(userId: number, aboInfo: AboInfo): Promise<LimitInfo> {
  const db = await getDb();
  const monat = new Date().toISOString().slice(0, 7); // YYYY-MM

  // Effektive Ebene für Limits bestimmen
  const effektiveEbene: AboEbene | "trial" | "expired" =
    aboInfo.status === "trial" ? "trial" :
    aboInfo.status === "expired" ? "expired" :
    aboInfo.ebene;

  const limits = EBENEN_LIMITS[effektiveEbene];

  if (!db) {
    return {
      aufnahmenCount: 0, ttsCount: 0, geschichtenCount: 0,
      aufnahmenLimit: limits.aufnahmen, ttsLimit: limits.tts, geschichtenLimit: limits.geschichten,
      aufnahmenErreicht: false, ttsErreicht: false, geschichtenErreicht: false,
    };
  }

  let nutzung = await db
    .select()
    .from(nutzungsLimits)
    .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)))
    .then(r => r[0]);

  if (!nutzung) {
    nutzung = { id: 0, userId, monat, aufnahmenCount: 0, ttsCount: 0, geschichtenCount: 0, createdAt: new Date(), updatedAt: new Date() };
  }

  return {
    aufnahmenCount: nutzung.aufnahmenCount,
    ttsCount: nutzung.ttsCount,
    geschichtenCount: nutzung.geschichtenCount,
    aufnahmenLimit: limits.aufnahmen,
    ttsLimit: limits.tts,
    geschichtenLimit: limits.geschichten,
    aufnahmenErreicht: nutzung.aufnahmenCount >= limits.aufnahmen,
    ttsErreicht: nutzung.ttsCount >= limits.tts,
    geschichtenErreicht: nutzung.geschichtenCount >= limits.geschichten,
  };
}

/**
 * Inkrementiert einen Nutzungszähler für den aktuellen Monat.
 * Gibt false zurück wenn das Limit bereits erreicht ist.
 */
export async function inkrementierNutzung(
  userId: number,
  typ: "aufnahmen" | "tts" | "geschichten",
  aboInfo: AboInfo,
): Promise<boolean> {
  const db = await getDb();
  if (!db) return true; // Fallback: erlauben

  const limitInfo = await getLimitInfo(userId, aboInfo);

  // Limit-Prüfung
  if (typ === "aufnahmen" && limitInfo.aufnahmenErreicht) return false;
  if (typ === "tts" && limitInfo.ttsErreicht) return false;
  if (typ === "geschichten" && limitInfo.geschichtenErreicht) return false;

  const monat = new Date().toISOString().slice(0, 7);

  // Upsert: Zähler erhöhen
  const existing = await db
    .select()
    .from(nutzungsLimits)
    .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)))
    .then(r => r[0]);

  if (!existing) {
    await db.insert(nutzungsLimits).values({
      userId,
      monat,
      aufnahmenCount: typ === "aufnahmen" ? 1 : 0,
      ttsCount: typ === "tts" ? 1 : 0,
      geschichtenCount: typ === "geschichten" ? 1 : 0,
    });
  } else {
    if (typ === "aufnahmen") {
      await db.update(nutzungsLimits)
        .set({ aufnahmenCount: existing.aufnahmenCount + 1 })
        .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)));
    } else if (typ === "tts") {
      await db.update(nutzungsLimits)
        .set({ ttsCount: existing.ttsCount + 1 })
        .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)));
    } else {
      await db.update(nutzungsLimits)
        .set({ geschichtenCount: existing.geschichtenCount + 1 })
        .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)));
    }
  }

  return true;
}
