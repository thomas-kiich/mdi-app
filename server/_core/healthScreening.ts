import { getDb } from "../db";
import { healthScreenings } from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { encryptField, decryptField } from "./encryption";
import { logAudit } from "./auditLog";

/**
 * Health Screening Service – Sorgfaltspflichten § 630e BGB
 * 
 * Implementiert die Anamnesebefragung vor RAUM 36 Aktivierung.
 * Dokumentiert Kontraindikationen und ärztliche Freigaben.
 * 
 * Kontraindikationen-Kategorien:
 * 1. Physische Kontraindikationen → Automatischer Ausschluss
 * 2. Befindlichkeitsstörungen → Ärztliches Attest erforderlich
 */

export interface HealthScreeningInput {
  userId: number;
  hasHighBloodPressure: boolean;
  hasAsthma: boolean;
  hasHeartArrhythmia: boolean;
  hasEpilepsy: boolean;
  isPregnant: boolean;
  hasRecentSurgery: boolean;
  hasAnxietyDisorder: boolean;
  hasDepression: boolean;
  hasSleepDisorder: boolean;
  hasMentalIllness: boolean;
  hasSubstanceAbuse: boolean;
  disclaimerAccepted: boolean;
  ipAddress?: string;
  notes?: string;
}

export interface HealthScreeningResult {
  approved: boolean;
  status: "approved" | "excluded_physical" | "pending_attestation";
  reason?: string;
  excludedReasons?: string[];
  requiresAttestation?: boolean;
}

/**
 * Prüft ob Nutzer physische Kontraindikationen hat
 */
function hasPhysicalContraindications(screening: HealthScreeningInput): boolean {
  return (
    screening.hasHighBloodPressure ||
    screening.hasAsthma ||
    screening.hasHeartArrhythmia ||
    screening.hasEpilepsy ||
    screening.isPregnant ||
    screening.hasRecentSurgery
  );
}

/**
 * Prüft ob Nutzer Befindlichkeitsstörungen hat
 */
function hasMentalHealthConditions(screening: HealthScreeningInput): boolean {
  return (
    screening.hasAnxietyDisorder ||
    screening.hasDepression ||
    screening.hasSleepDisorder ||
    screening.hasMentalIllness ||
    screening.hasSubstanceAbuse
  );
}

/**
 * Sammelt alle Ausschlussgründe
 */
function getExclusionReasons(screening: HealthScreeningInput): string[] {
  const reasons: string[] = [];
  
  if (screening.hasHighBloodPressure) reasons.push("Bluthochdruck");
  if (screening.hasAsthma) reasons.push("Asthma");
  if (screening.hasHeartArrhythmia) reasons.push("Herzrhythmusstörungen");
  if (screening.hasEpilepsy) reasons.push("Epilepsie");
  if (screening.isPregnant) reasons.push("Schwangerschaft");
  if (screening.hasRecentSurgery) reasons.push("Kürzliche Operation");
  
  return reasons;
}

/**
 * Wertet Health Screening aus und bestimmt Status
 */
export function evaluateHealthScreening(screening: HealthScreeningInput): HealthScreeningResult {
  if (!screening.disclaimerAccepted) {
    return {
      approved: false,
      status: "excluded_physical",
      reason: "Haftungsausschluss nicht akzeptiert",
    };
  }

  const hasPhysical = hasPhysicalContraindications(screening);
  const hasMental = hasMentalHealthConditions(screening);

  if (hasPhysical) {
    return {
      approved: false,
      status: "excluded_physical",
      reason: "Physische Kontraindikationen vorhanden",
      excludedReasons: getExclusionReasons(screening),
    };
  }

  if (hasMental) {
    return {
      approved: false,
      status: "pending_attestation",
      reason: "Ärztliches Attest erforderlich",
      requiresAttestation: true,
    };
  }

  return {
    approved: true,
    status: "approved",
    reason: "Keine Kontraindikationen",
  };
}

/**
 * Speichert Health Screening ab
 */
export async function saveHealthScreening(
  input: HealthScreeningInput,
  evaluation: HealthScreeningResult
): Promise<any> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verschlüssele sensible Felder
    const encryptedNotes = input.notes ? encryptField(input.notes) : null;

    // Berechne Ablaufdatum (1 Jahr)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    const screening = await db.insert(healthScreenings).values({
      userId: input.userId,
      hasHighBloodPressure: input.hasHighBloodPressure,
      hasAsthma: input.hasAsthma,
      hasHeartArrhythmia: input.hasHeartArrhythmia,
      hasEpilepsy: input.hasEpilepsy,
      isPregnant: input.isPregnant,
      hasRecentSurgery: input.hasRecentSurgery,
      hasAnxietyDisorder: input.hasAnxietyDisorder,
      hasDepression: input.hasDepression,
      hasSleepDisorder: input.hasSleepDisorder,
      hasMentalIllness: input.hasMentalIllness,
      hasSubstanceAbuse: input.hasSubstanceAbuse,
      status: evaluation.status,
      disclaimerAccepted: input.disclaimerAccepted,
      notes: encryptedNotes,
      ipAddress: input.ipAddress,
      approvedAt: evaluation.approved ? new Date() : null,
      expiresAt: evaluation.approved ? expiresAt : null,
    });

    // Protokolliere Screening
    await logAudit({
      userId: input.userId,
      action: "access",
      dataType: "health_screening",
      reason: "user_self_access",
      ipAddress: input.ipAddress,
      details: {
        status: evaluation.status,
        approved: evaluation.approved,
        excludedReasons: evaluation.excludedReasons,
      },
    });

    console.log(`[HealthScreening] Screening saved for user ${input.userId}: ${evaluation.status}`);
    return screening;
  } catch (error) {
    console.error("[HealthScreening] Error saving screening:", error);
    throw error;
  }
}

/**
 * Ruft aktuelles Health Screening für Nutzer ab
 */
export async function getLatestHealthScreening(userId: number): Promise<any> {
  const db = await getDb();
  if (!db) {
    return null;
  }

  try {
    const screenings = await db
      .select()
      .from(healthScreenings)
      .where(eq(healthScreenings.userId, userId))
      .orderBy((table: any) => table.createdAt)
      .limit(1);

    if (screenings.length === 0) {
      return null;
    }

    const screening = screenings[0];

    // Entschlüssele sensible Felder
    if (screening.notes) {
      try {
        screening.notes = decryptField(screening.notes);
      } catch (error) {
        console.warn("[HealthScreening] Could not decrypt notes");
      }
    }

    return screening;
  } catch (error) {
    console.error("[HealthScreening] Error retrieving screening:", error);
    return null;
  }
}

/**
 * Prüft ob Nutzer für RAUM 36 freigegeben ist
 */
export async function isUserApprovedForRaum36(userId: number): Promise<boolean> {
  const screening = await getLatestHealthScreening(userId);

  if (!screening) {
    // Kein Screening durchgeführt
    return false;
  }

  // Prüfe ob Screening noch gültig ist (nicht abgelaufen)
  if (screening.expiresAt && new Date(screening.expiresAt) < new Date()) {
    console.log(`[HealthScreening] Screening for user ${userId} has expired`);
    return false;
  }

  // Genehmigt (mit oder ohne Attest)
  return screening.status === "approved" || screening.status === "approved_with_attestation";
}

/**
 * Lädt ärztliches Attest hoch und genehmigt Screening
 */
export async function uploadAttestationAndApprove(
  userId: number,
  attestationUrl: string,
  physicianName: string,
  attestationDate: string
): Promise<void> {
  const db = await getDb();
  if (!db) {
    throw new Error("Database not available");
  }

  try {
    // Verschlüssele Arzt-Informationen
    const encryptedPhysicianName = encryptField(physicianName);
    const encryptedAttestationDate = encryptField(attestationDate);

    // Berechne Ablaufdatum (1 Jahr)
    const expiresAt = new Date();
    expiresAt.setFullYear(expiresAt.getFullYear() + 1);

    // Finde aktuelles Screening
    const screenings = await db
      .select()
      .from(healthScreenings)
      .where(eq(healthScreenings.userId, userId))
      .orderBy((table: any) => table.createdAt)
      .limit(1);

    if (screenings.length === 0) {
      throw new Error("No health screening found for user");
    }

    // Aktualisiere mit Attest
    await db
      .update(healthScreenings)
      .set({
        status: "approved_with_attestation",
        attestationUrl,
        physicianName: encryptedPhysicianName,
        attestationDate: encryptedAttestationDate,
        approvedAt: new Date(),
        expiresAt,
      })
      .where(eq(healthScreenings.id, screenings[0].id));

    // Protokolliere Freigabe
    await logAudit({
      userId,
      action: "update",
      dataType: "health_screening",
      reason: "compliance_check",
      details: {
        status: "approved_with_attestation",
        physicianName,
        attestationDate,
      },
    });

    console.log(`[HealthScreening] Attestation approved for user ${userId}`);
  } catch (error) {
    console.error("[HealthScreening] Error uploading attestation:", error);
    throw error;
  }
}
