import { getDb } from "../db";
import { 
  users, 
  vitalEintraege, 
  momentaufnahmen, 
  coachingEinwilligungen,
  auditLogs,
  einladungsCodes,
  referrals,
  tagesSummaries,
  erinnerungen,
  erledigungen,
  dankbarkeit,
  einkaufsliste,
  einschlafBibliothek,
  apiTokens,
  pushSubscriptions,
  raum36Subscriptions,
  stimmklanganalyseOrders,
} from "../../drizzle/schema";
import { eq } from "drizzle-orm";
import { logAudit } from "./auditLog";

/**
 * DSGVO Art. 17 – Recht auf Vergessenwerden (Right to be Forgotten)
 * 
 * Löscht einen Nutzer und alle damit verbundenen personenbezogenen Daten
 * aus der Datenbank. Dies ist ein irreversibler Prozess.
 * 
 * Ausnahmen (werden NICHT gelöscht):
 * - Audit-Logs (für Compliance und Nachverfolgung)
 * - Anonymisierte Daten (z.B. Referral-Statistiken ohne User-Bezug)
 */

export interface DeleteUserResult {
  success: boolean;
  deletedRecords: Record<string, number>;
  error?: string;
}

export async function deleteUserAndAllData(userId: number): Promise<DeleteUserResult> {
  const db = await getDb();
  if (!db) {
    return {
      success: false,
      deletedRecords: {},
      error: "Database not available",
    };
  }

  const result: Record<string, number> = {};

  try {
    console.log(`[DataDelete] Starting deletion of user ${userId} and all associated data...`);

    // 1. Lösche Vital-Einträge (BOLT, Vitalmonitor)
    const vitalDeleted = await db
      .delete(vitalEintraege)
      .where(eq(vitalEintraege.userId, userId));
    result.vitalEintraege = (vitalDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.vitalEintraege} vital entries`);

    // 2. Lösche Momentaufnahmen (Sprachnotizen)
    const momentDeleted = await db
      .delete(momentaufnahmen)
      .where(eq(momentaufnahmen.userId, userId));
    result.momentaufnahmen = (momentDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.momentaufnahmen} momentaufnahmen`);

    // 3. Lösche Coaching-Einwilligungen
    const coachingDeleted = await db
      .delete(coachingEinwilligungen)
      .where(eq(coachingEinwilligungen.userId, userId));
    result.coachingEinwilligungen = (coachingDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.coachingEinwilligungen} coaching consents`);

    // 4. Lösche Einladungscodes
    const inviteDeleted = await db
      .delete(einladungsCodes)
      .where(eq(einladungsCodes.userId, userId));
    result.einladungsCodes = (inviteDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.einladungsCodes} invitation codes`);

    // 5. Lösche Tages-Summaries
    const summaryDeleted = await db
      .delete(tagesSummaries)
      .where(eq(tagesSummaries.userId, userId));
    result.tagesSummaries = (summaryDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.tagesSummaries} daily summaries`);

    // 6. Lösche Erinnerungen
    const reminderDeleted = await db
      .delete(erinnerungen)
      .where(eq(erinnerungen.userId, userId));
    result.erinnerungen = (reminderDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.erinnerungen} reminders`);

    // 7. Lösche Erledigungen
    const taskDeleted = await db
      .delete(erledigungen)
      .where(eq(erledigungen.userId, userId));
    result.erledigungen = (taskDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.erledigungen} tasks`);

    // 8. Lösche Dankbarkeits-Einträge
    const gratitudeDeleted = await db
      .delete(dankbarkeit)
      .where(eq(dankbarkeit.userId, userId));
    result.dankbarkeit = (gratitudeDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.dankbarkeit} gratitude entries`);

    // 9. Lösche Einkaufsliste
    const shoppingDeleted = await db
      .delete(einkaufsliste)
      .where(eq(einkaufsliste.userId, userId));
    result.einkaufsliste = (shoppingDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.einkaufsliste} shopping list items`);

    // 10. Lösche Einschlaf-Bibliothek
    const sleepDeleted = await db
      .delete(einschlafBibliothek)
      .where(eq(einschlafBibliothek.userId, userId));
    result.einschlafBibliothek = (sleepDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.einschlafBibliothek} sleep stories`);

    // 11. Lösche API-Tokens
    const tokenDeleted = await db
      .delete(apiTokens)
      .where(eq(apiTokens.userId, userId));
    result.apiTokens = (tokenDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.apiTokens} API tokens`);

    // 12. Lösche Push-Subscriptions
    const pushDeleted = await db
      .delete(pushSubscriptions)
      .where(eq(pushSubscriptions.userId, userId));
    result.pushSubscriptions = (pushDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.pushSubscriptions} push subscriptions`);

    // 13. Lösche RAUM 36 Subscriptions
    const raum36Deleted = await db
      .delete(raum36Subscriptions)
      .where(eq(raum36Subscriptions.userId, userId));
    result.raum36Subscriptions = (raum36Deleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.raum36Subscriptions} RAUM 36 subscriptions`);

    // 14. Lösche Stimmklanganalyse Orders
    const orderDeleted = await db
      .delete(stimmklanganalyseOrders)
      .where(eq(stimmklanganalyseOrders.userId, userId));
    result.stimmklanganalyseOrders = (orderDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.stimmklanganalyseOrders} orders`);

    // 15. Lösche Referrals (als Referrer)
    const referralDeleted = await db
      .delete(referrals)
      .where(eq(referrals.referrerId, userId));
    result.referrals = (referralDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted ${result.referrals} referrals`);

    // 16. Lösche den Nutzer selbst
    const userDeleted = await db
      .delete(users)
      .where(eq(users.id, userId));
    result.users = (userDeleted as any).affectedRows || 0;
    console.log(`[DataDelete] Deleted user record`);

    // 17. Protokolliere die Löschung (Audit-Log wird NICHT gelöscht)
    await logAudit({
      userId,
      action: "delete",
      dataType: "user_account",
      reason: "account_deletion",
      details: {
        deletedRecords: result,
        timestamp: new Date().toISOString(),
      },
    });

    console.log(`[DataDelete] Successfully deleted user ${userId} and all associated data`);

    return {
      success: true,
      deletedRecords: result,
    };
  } catch (error) {
    console.error(`[DataDelete] Error deleting user ${userId}:`, error);
    return {
      success: false,
      deletedRecords: result,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Exportiert alle Daten eines Nutzers (Art. 20 DSGVO - Datenportabilität)
 * Gibt ein JSON-Objekt mit allen persönlichen Daten zurück
 */
export async function exportUserData(userId: number): Promise<Record<string, any> | null> {
  const db = await getDb();
  if (!db) {
    console.error("[DataExport] Database not available");
    return null;
  }

  try {
    console.log(`[DataExport] Exporting all data for user ${userId}...`);

    const userData = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userData.length === 0) {
      console.warn(`[DataExport] User ${userId} not found`);
      return null;
    }

    const exportData = {
      user: userData[0],
      vitalEintraege: await db.select().from(vitalEintraege).where(eq(vitalEintraege.userId, userId)),
      momentaufnahmen: await db.select().from(momentaufnahmen).where(eq(momentaufnahmen.userId, userId)),
      coachingEinwilligungen: await db.select().from(coachingEinwilligungen).where(eq(coachingEinwilligungen.userId, userId)),
      tagesSummaries: await db.select().from(tagesSummaries).where(eq(tagesSummaries.userId, userId)),
      erinnerungen: await db.select().from(erinnerungen).where(eq(erinnerungen.userId, userId)),
      erledigungen: await db.select().from(erledigungen).where(eq(erledigungen.userId, userId)),
      dankbarkeit: await db.select().from(dankbarkeit).where(eq(dankbarkeit.userId, userId)),
      einkaufsliste: await db.select().from(einkaufsliste).where(eq(einkaufsliste.userId, userId)),
      einschlafBibliothek: await db.select().from(einschlafBibliothek).where(eq(einschlafBibliothek.userId, userId)),
      raum36Subscriptions: await db.select().from(raum36Subscriptions).where(eq(raum36Subscriptions.userId, userId)),
      stimmklanganalyseOrders: await db.select().from(stimmklanganalyseOrders).where(eq(stimmklanganalyseOrders.userId, userId)),
      exportedAt: new Date().toISOString(),
    };

    // Protokolliere den Export
    await logAudit({
      userId,
      action: "export",
      dataType: "user_account",
      reason: "data_export",
      details: {
        exportedAt: new Date().toISOString(),
      },
    });

    console.log(`[DataExport] Successfully exported data for user ${userId}`);
    return exportData;
  } catch (error) {
    console.error(`[DataExport] Error exporting data for user ${userId}:`, error);
    return null;
  }
}
