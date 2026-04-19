/**
 * Schaltet befindlichkeitstraining für alle User frei
 */
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL fehlt!");
  process.exit(1);
}

const conn = await mysql.createConnection(DATABASE_URL);

// Spalten prüfen
const [cols] = await conn.execute("DESCRIBE premium_settings");
console.log("Tabellen-Spalten:", cols.map(r => r.Field).join(", "));

// Upsert ohne updated_at
await conn.execute(
  `INSERT INTO premium_settings (feature, enabled)
   VALUES ('befindlichkeitstraining', 1)
   ON DUPLICATE KEY UPDATE enabled = 1`
);

// Aktuellen Stand anzeigen
const [rows] = await conn.execute(`SELECT feature, enabled FROM premium_settings`);
console.log("\n✅ Premium-Einstellungen aktuell:");
for (const row of rows) {
  console.log(`   ${row.feature}: ${row.enabled ? "OFFEN ✓" : "gesperrt ✗"}`);
}

await conn.end();
