/**
 * Abonnement-Logik für KIICH
 *
 * Vier Ebenen + Beta:
 * - free:      kostenlos | max. 10 Aufnahmen/Monat | kein TTS | kein Summary
 * - essential: € 9,90/Monat | unbegrenzt | Reflexions-Summary | TTS | Obsidian-Export
 * - complete:  € 19,90/Monat | alles + Strategisches Summary | YOHN | MDI | Archiv
 * - pro:       € 49,90/Monat | alles + MDI-Stimmklanganalyse | individuelle Empfehlungen
 * - beta:      kostenloser Vollzugang (= complete) für eingeladene Beta-Nutzer
 *
 * Trial: 7 Tage voller Zugang (= complete) für alle neuen Nutzer
 */

import { getDb } from "./db";
import { abonnements, betaInvites, nutzungsLimits } from "../drizzle/schema";
import { eq, and } from "drizzle-orm";
import { randomBytes } from "crypto";

// ─── Typen ────────────────────────────────────────────────────────────────────

export type AboEbene = "free" | "essential" | "complete" | "pro" | "beta";
export type AboStatus = "trial" | "active" | "cancelled" | "expired" | "beta";

export interface AboInfo {
  ebene: AboEbene;
  status: AboStatus;
  /** Effektive Ebene: während Trial = complete, beta = complete, sonst gespeicherte Ebene */
  effektiveEbene: AboEbene;
  /** Verbleibende Trial-Tage (nur wenn status === 'trial') */
  trialTageVerbleibend: number | null;
  /** Ist der Trial abgelaufen? */
  trialAbgelaufen: boolean;
  /** Hat der User vollen Zugang? */
  vollerZugang: boolean;
  /** Ablaufdatum des aktuellen Zeitraums */
  currentPeriodEnd: Date | null;
  trialEndsAt: Date | null;
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

// ─── Feature-Gate-Definitionen ────────────────────────────────────────────────

export const FEATURES = {
  aufnahmen_unbegrenzt:       ["essential", "complete", "pro", "beta"],
  reflexions_summary:         ["essential", "complete", "pro", "beta"],
  strategisches_summary:      ["complete", "pro", "beta"],
  tts_vorlesen:               ["essential", "complete", "pro", "beta"],
  obsidian_export:            ["essential", "complete", "pro", "beta"],
  einschlaf_bibliothek:       ["essential", "complete", "pro", "beta"],
  yohn_training:              ["complete", "pro", "beta"],
  mdi_analyse:                ["complete", "pro", "beta"],
  archiv:                     ["complete", "pro", "beta"],
  mdi_stimmklang_pro:         ["pro"],
} as const;

export type Feature = keyof typeof FEATURES;

/**
 * Prüft ob eine Ebene ein bestimmtes Feature hat.
 */
export function hatFeature(ebene: AboEbene, feature: Feature): boolean {
  return (FEATURES[feature] as readonly string[]).includes(ebene);
}

// ─── Limits pro Ebene ─────────────────────────────────────────────────────────

export const EBENEN_LIMITS: Record<AboEbene | "trial" | "expired", {
  aufnahmen: number;
  tts: number;
  geschichten: number;
}> = {
  trial:    { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  free:     { aufnahmen: 10,     tts: 0,      geschichten: 0 },
  essential:{ aufnahmen: 999999, tts: 50,     geschichten: 10 },
  complete: { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  pro:      { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  beta:     { aufnahmen: 999999, tts: 999999, geschichten: 999999 },
  expired:  { aufnahmen: 0,      tts: 0,      geschichten: 0 },
};

/** Preise in Euro-Cent (für Stripe) */
export const EBENEN_PREISE: Record<"essential" | "complete" | "pro", number> = {
  essential: 990,   // € 9,90
  complete:  1990,  // € 19,90
  pro:       4990,  // € 49,90
};

/** Pläne für die Preisseite */
export const PLAENE = [
  {
    id: "free" as AboEbene,
    name: "Free",
    preis: 0,
    preisText: "Kostenlos",
    beschreibung: "Zum Kennenlernen",
    features: [
      "10 Aufnahmen pro Monat",
      "Automatische Klassifizierung nach Gravitationszentren",
      "Tagesübersicht (ohne Summary)",
    ],
    highlight: false,
    cta: "Kostenlos starten",
  },
  {
    id: "essential" as AboEbene,
    name: "Essential",
    preis: 990,
    preisText: "€ 9,90 / Monat",
    beschreibung: "Für den täglichen Einsatz",
    features: [
      "Unbegrenzte Aufnahmen",
      "Reflexions-Summary (philosophisch-meditativ)",
      "MA-Vorlesen (Text-to-Speech)",
      "Obsidian-Export",
      "Einschlaf-Bibliothek",
    ],
    highlight: false,
    cta: "Essential wählen",
  },
  {
    id: "complete" as AboEbene,
    name: "Complete",
    preis: 1990,
    preisText: "€ 19,90 / Monat",
    beschreibung: "Das vollständige KIICH-Erlebnis",
    features: [
      "Alles aus Essential",
      "Strategisches Summary (Aufgaben nach GZ)",
      "YOHN-Befindlichkeitstraining",
      "MDI-Analyse & Archiv",
      "Gravitationszentrum-Filter",
    ],
    highlight: true,
    cta: "Complete wählen",
  },
  {
    id: "pro" as AboEbene,
    name: "Pro",
    preis: 4990,
    preisText: "€ 49,90 / Monat",
    beschreibung: "Für tiefe Identitätsarbeit",
    features: [
      "Alles aus Complete",
      "Persönliche MDI-Stimmklanganalyse",
      "Individuelle Trainingsempfehlungen",
      "Prioritäts-Support",
    ],
    highlight: false,
    cta: "Pro wählen",
  },
];

// ─── Kern-Logik ───────────────────────────────────────────────────────────────

/**
 * Berechnet die effektive Ebene eines Nutzers.
 * Während aktivem Trial: complete. Beta: complete. Danach: gespeicherte Ebene.
 */
export function getEffektiveEbene(abo: {
  ebene: string;
  status: string;
  trialEndsAt: Date;
}): AboEbene {
  if (abo.status === "beta") return "beta";
  if (abo.status === "trial" && new Date() < new Date(abo.trialEndsAt)) {
    return "complete";
  }
  return abo.ebene as AboEbene;
}

/**
 * Gibt den aktuellen Abo-Status eines Users zurück.
 * Erstellt automatisch einen Trial-Eintrag falls noch keiner existiert.
 */
export async function getAboInfo(userId: number): Promise<AboInfo> {
  const db = await getDb();
  if (!db) {
    return {
      ebene: "complete", status: "trial", effektiveEbene: "complete",
      trialTageVerbleibend: 7, trialAbgelaufen: false, vollerZugang: true,
      currentPeriodEnd: null, trialEndsAt: null,
    };
  }

  let abo = await db.select().from(abonnements).where(eq(abonnements.userId, userId)).then(r => r[0]);

  if (!abo) {
    const now = new Date();
    const trialEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(abonnements).values({
      userId,
      ebene: "free",
      status: "trial",
      trialStartedAt: now,
      trialEndsAt: trialEnd,
    });
    abo = await db.select().from(abonnements).where(eq(abonnements.userId, userId)).then(r => r[0]);
  }

  if (!abo) {
    return {
      ebene: "free", status: "expired", effektiveEbene: "free",
      trialTageVerbleibend: null, trialAbgelaufen: true, vollerZugang: false,
      currentPeriodEnd: null, trialEndsAt: null,
    };
  }

  const now = new Date();

  // Trial-Ablauf prüfen
  if (abo.status === "trial" && abo.trialEndsAt < now) {
    await db.update(abonnements).set({ status: "expired" }).where(eq(abonnements.userId, userId));
    abo.status = "expired";
  }

  // Abo-Ablauf prüfen
  if (abo.status === "active" && abo.currentPeriodEnd && abo.currentPeriodEnd < now) {
    await db.update(abonnements).set({ status: "expired" }).where(eq(abonnements.userId, userId));
    abo.status = "expired";
  }

  const effektiveEbene = getEffektiveEbene({
    ebene: abo.ebene,
    status: abo.status,
    trialEndsAt: abo.trialEndsAt,
  });

  const trialTageVerbleibend = abo.status === "trial"
    ? Math.max(0, Math.ceil((abo.trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  const trialAbgelaufen = abo.status === "expired" && !abo.stripeSubscriptionId;

  const vollerZugang =
    abo.status === "trial" ||
    abo.status === "beta" ||
    (abo.status === "active" && abo.ebene !== "free") ||
    (abo.status === "cancelled" && abo.currentPeriodEnd !== null && abo.currentPeriodEnd > now);

  return {
    ebene: abo.ebene as AboEbene,
    status: abo.status as AboStatus,
    effektiveEbene,
    trialTageVerbleibend,
    trialAbgelaufen,
    vollerZugang,
    currentPeriodEnd: abo.currentPeriodEnd ?? null,
    trialEndsAt: abo.trialEndsAt,
  };
}

/**
 * Gibt den aktuellen Nutzungsstand und die Limits für einen User zurück.
 */
export async function getLimitInfo(userId: number, aboInfo: AboInfo): Promise<LimitInfo> {
  const db = await getDb();
  const monat = new Date().toISOString().slice(0, 7);

  const effektiveEbene: AboEbene | "trial" | "expired" =
    aboInfo.status === "trial" ? "trial" :
    aboInfo.status === "expired" ? "expired" :
    aboInfo.effektiveEbene;

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
  if (!db) return true;

  const limitInfo = await getLimitInfo(userId, aboInfo);

  if (typ === "aufnahmen" && limitInfo.aufnahmenErreicht) return false;
  if (typ === "tts" && limitInfo.ttsErreicht) return false;
  if (typ === "geschichten" && limitInfo.geschichtenErreicht) return false;

  const monat = new Date().toISOString().slice(0, 7);

  const existing = await db
    .select()
    .from(nutzungsLimits)
    .where(and(eq(nutzungsLimits.userId, userId), eq(nutzungsLimits.monat, monat)))
    .then(r => r[0]);

  if (!existing) {
    await db.insert(nutzungsLimits).values({
      userId, monat,
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

// ─── Beta-Einladungen ─────────────────────────────────────────────────────────

/**
 * Generiert einen neuen Beta-Einladungscode.
 */
export function generiereBeataCode(): string {
  return `KIICH-BETA-${randomBytes(4).toString("hex").toUpperCase()}`;
}

/**
 * Löst einen Beta-Code ein und aktiviert den Beta-Zugang (60 Tage).
 * Gibt { erfolg: true, betaEndsAt } oder wirft einen Fehler.
 */
export async function betaCodeEinloesen(
  userId: number,
  code: string,
): Promise<{ erfolg: true; betaEndsAt: Date }> {
  const db = await getDb();
  if (!db) throw new Error("Datenbank nicht verfügbar.");

  const normalizedCode = code.trim().toUpperCase();

  const invite = await db
    .select()
    .from(betaInvites)
    .where(and(eq(betaInvites.code, normalizedCode), eq(betaInvites.aktiv, true)))
    .then(r => r[0]);

  if (!invite) throw new Error("Ungültiger oder inaktiver Beta-Code.");
  if (invite.usedByUserId !== null) throw new Error("Dieser Beta-Code wurde bereits eingelöst.");

  const betaEndsAt = new Date(Date.now() + 60 * 24 * 60 * 60 * 1000);

  await db
    .update(betaInvites)
    .set({ usedByUserId: userId, usedAt: new Date(), betaEndsAt })
    .where(eq(betaInvites.code, normalizedCode));

  const existing = await db
    .select()
    .from(abonnements)
    .where(eq(abonnements.userId, userId))
    .then(r => r[0]);

  if (existing) {
    await db
      .update(abonnements)
      .set({ ebene: "beta", status: "beta", currentPeriodEnd: betaEndsAt })
      .where(eq(abonnements.userId, userId));
  } else {
    const now = new Date();
    const trialEndsAt = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    await db.insert(abonnements).values({
      userId, ebene: "beta", status: "beta",
      trialStartedAt: now, trialEndsAt,
      currentPeriodEnd: betaEndsAt,
    });
  }

  return { erfolg: true, betaEndsAt };
}
