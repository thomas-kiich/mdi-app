/**
 * Generiert 20 KIICH Beta-Einladungscodes in der Datenbank.
 * Ausführen mit: node generate-beta-codes.mjs
 */
import { createConnection } from "mysql2/promise";
import { randomBytes } from "crypto";
import { config } from "dotenv";

config({ path: ".env" });

const DB_URL = process.env.DATABASE_URL;
if (!DB_URL) {
  console.error("❌ DATABASE_URL nicht gesetzt");
  process.exit(1);
}

function generateCode() {
  // Format: KIICH-BETA-XXXX (4 zufällige Großbuchstaben/Ziffern)
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // ohne I, O, 0, 1
  let suffix = "";
  const bytes = randomBytes(4);
  for (let i = 0; i < 4; i++) {
    suffix += chars[bytes[i] % chars.length];
  }
  return `KIICH-BETA-${suffix}`;
}

async function main() {
  const conn = await createConnection(DB_URL);
  
  const codes = [];
  const usedCodes = new Set();
  
  // Bestehende Codes laden
  const [existing] = await conn.execute("SELECT code FROM beta_invites");
  for (const row of existing) usedCodes.add(row.code);
  
  // 20 neue Codes generieren
  let generated = 0;
  while (generated < 20) {
    const code = generateCode();
    if (!usedCodes.has(code)) {
      usedCodes.add(code);
      codes.push(code);
      generated++;
    }
  }
  
  // In DB einfügen
  const now = Date.now();
  for (const code of codes) {
    await conn.execute(
      "INSERT INTO beta_invites (code) VALUES (?)",
      [code]
    );
  }
  
  await conn.end();
  
  console.log("\n✅ 20 Beta-Codes generiert:\n");
  codes.forEach((c, i) => console.log(`  ${String(i + 1).padStart(2, "0")}. ${c}`));
  console.log("\nDiese Codes können an Beta-Nutzer per E-Mail verschickt werden.");
  console.log("Jeder Code gewährt 60 Tage Complete-Zugang.\n");
}

main().catch((err) => {
  console.error("❌ Fehler:", err.message);
  process.exit(1);
});
