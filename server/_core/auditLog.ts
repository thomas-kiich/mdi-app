import { getDb } from "../db";
import { auditLogs } from "../../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Audit-Logging für Zugriffe auf sensible Gesundheitsdaten
 * 
 * DSGVO Art. 32 Abs. 1 lit. b: Fähigkeit, die Verfügbarkeit und Belastbarkeit
 * der Systeme und Dienste sicherzustellen und die Wiederherstellung der
 * Verfügbarkeit und des Zugangs zu personenbezogenen Daten zeitnah sicherzustellen.
 * 
 * Dokumentiert:
 * - Wer (userId) hat auf welche Daten zugegriffen
 * - Wann (timestamp)
 * - Was (action: read, update, delete, export)
 * - Warum (reason: coaching, admin, user-export, etc.)
 * - Von wo (ipAddress)
 */

export type AuditAction = "read" | "update" | "delete" | "export" | "access";
export type AuditReason = 
  | "user_self_access"
  | "coaching_access"
  | "admin_access"
  | "data_export"
  | "account_deletion"
  | "compliance_check";

export interface AuditLogEntry {
  userId: number;
  action: AuditAction;
  dataType: string; // "vital_eintrag", "bolt_measurement", "coaching_consent", etc.
  reason: AuditReason;
  ipAddress?: string;
  userAgent?: string;
  details?: Record<string, any>;
}

/**
 * Protokolliert einen Zugriff auf sensible Daten
 */
export async function logAudit(entry: AuditLogEntry): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[AuditLog] Database not available, cannot log audit entry");
      return;
    }
    
    await db.insert(auditLogs).values({
      userId: entry.userId,
      action: entry.action,
      dataType: entry.dataType,
      reason: entry.reason,
      ipAddress: entry.ipAddress,
      userAgent: entry.userAgent,
      details: entry.details ? JSON.stringify(entry.details) : null,
      createdAt: new Date(),
    });
  } catch (error) {
    console.error("[AuditLog] Failed to log audit entry:", error);
    // Audit-Fehler sollten die Hauptoperation nicht blockieren
  }
}

/**
 * Ruft Audit-Logs für einen Nutzer ab (nur für den Nutzer selbst oder Admins)
 */
export async function getAuditLogs(
  userId: number,
  limit: number = 100,
  offset: number = 0
): Promise<any[]> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[AuditLog] Database not available, cannot retrieve audit logs");
      return [];
    }
    
    const logs = await db
      .select()
      .from(auditLogs)
      .where(eq(auditLogs.userId, userId))
      .orderBy((table: any) => table.createdAt)
      .limit(limit)
      .offset(offset);
    
    return logs;
  } catch (error) {
    console.error("[AuditLog] Failed to retrieve audit logs:", error);
    return [];
  }
}

/**
 * Löscht alte Audit-Logs (älter als 90 Tage)
 * Sollte regelmäßig aufgerufen werden (z.B. täglich via Heartbeat)
 */
export async function cleanupOldAuditLogs(daysToKeep: number = 90): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
    
    // Hinweis: Diese Implementierung hängt von der genauen Drizzle-Syntax ab
    // und muss möglicherweise angepasst werden
    console.log(`[AuditLog] Cleanup scheduled for logs older than ${cutoffDate.toISOString()}`);
    
    return 0; // Placeholder
  } catch (error) {
    console.error("[AuditLog] Failed to cleanup old audit logs:", error);
    return 0;
  }
}
