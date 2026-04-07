import { Router } from "express";
import { and, desc, eq, gte, isNull } from "drizzle-orm";
import { momentaufnahmen } from "../../drizzle/schema";
import { getDb } from "../db";
import { validateApiToken } from "../routers/apiTokens";

const router = Router();

/**
 * GET /api/obsidian/sync
 *
 * Obsidian-Plugin-Endpunkt: Liefert alle Momentaufnahmen des Nutzers
 * seit einem optionalen `since`-Timestamp (Unix ms).
 *
 * Authentifizierung: Bearer-Token im Authorization-Header
 *   Authorization: Bearer kiich_<token>
 *
 * Query-Parameter:
 *   since  – Unix-Timestamp in Millisekunden (optional, für inkrementellen Sync)
 *   limit  – Maximale Anzahl Aufnahmen (optional, default 500)
 *
 * Response:
 *   { aufnahmen: [...], syncedAt: <ISO-String>, count: number }
 */
router.get("/api/obsidian/sync", async (req, res) => {
  try {
    // 1. Token aus Authorization-Header extrahieren
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Authorization-Header fehlt. Erwartet: Bearer <token>" });
    }

    const tokenValue = authHeader.slice(7).trim();
    if (!tokenValue) {
      return res.status(401).json({ error: "Token ist leer" });
    }

    // 2. Token validieren
    const userId = await validateApiToken(tokenValue);
    if (!userId) {
      return res.status(401).json({ error: "Ungültiger oder widerrufener Token" });
    }

    // 3. Query-Parameter parsen
    const sinceParam = req.query.since as string | undefined;
    const limitParam = req.query.limit as string | undefined;

    const since = sinceParam ? new Date(parseInt(sinceParam)) : null;
    const limit = limitParam ? Math.min(parseInt(limitParam), 1000) : 500;

    // 4. Aufnahmen aus DB laden
    const db = await getDb();
    if (!db) {
      return res.status(500).json({ error: "Datenbank nicht verfügbar" });
    }

    const conditions = [eq(momentaufnahmen.userId, userId)];
    if (since && !isNaN(since.getTime())) {
      conditions.push(gte(momentaufnahmen.createdAt, since));
    }

    const aufnahmen = await db
      .select()
      .from(momentaufnahmen)
      .where(and(...conditions))
      .orderBy(desc(momentaufnahmen.createdAt))
      .limit(limit);

    // 5. Antwort formatieren (Plugin-freundliches Format)
    const response = {
      syncedAt: new Date().toISOString(),
      count: aufnahmen.length,
      aufnahmen: aufnahmen.map(a => ({
        id: a.id,
        text: a.text,
        kategorie: a.kategorie,
        zusammenfassung: a.zusammenfassung,
        audioUrl: a.audioUrl,
        dauerSekunden: a.dauerSekunden,
        createdAt: a.createdAt.toISOString(),
        // Datum als YYYY-MM-DD für Dateinamen
        datum: a.createdAt.toISOString().split("T")[0],
        // Uhrzeit für Obsidian-Notiz
        zeit: a.createdAt.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" }),
      })),
    };

    return res.json(response);

  } catch (err) {
    console.error("[Obsidian Sync] Fehler:", err);
    return res.status(500).json({ error: "Interner Serverfehler" });
  }
});

/**
 * GET /api/obsidian/ping
 * Einfacher Health-Check für das Plugin (Token-Validierung ohne Datenabruf)
 */
router.get("/api/obsidian/ping", async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ ok: false, error: "Kein Token" });
  }

  const tokenValue = authHeader.slice(7).trim();
  const userId = await validateApiToken(tokenValue);

  if (!userId) {
    return res.status(401).json({ ok: false, error: "Ungültiger Token" });
  }

  return res.json({ ok: true, userId });
});

export default router;
