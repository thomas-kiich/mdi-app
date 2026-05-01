import { createConnection } from 'mysql2/promise';
import * as dotenv from 'dotenv';
dotenv.config();

const conn = await createConnection(process.env.DATABASE_URL);

// Prüfe ob Tabelle existiert
const [rows] = await conn.execute("SHOW TABLES LIKE 'backlog_items'");
console.log('Tabelle vorhanden:', rows.length > 0);

if (rows.length === 0) {
  console.log('Erstelle backlog_items Tabelle...');
  await conn.execute(`
    CREATE TABLE backlog_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      titel VARCHAR(255) NOT NULL,
      beschreibung TEXT,
      kategorie ENUM('feature','content','marketing','technik','strategie','sonstiges') NOT NULL DEFAULT 'sonstiges',
      prioritaet ENUM('hoch','mittel','niedrig') NOT NULL DEFAULT 'mittel',
      status ENUM('offen','in_arbeit','erledigt','verworfen') NOT NULL DEFAULT 'offen',
      zieldatum VARCHAR(64),
      erstelltVon VARCHAR(128),
      createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )
  `);
  console.log('✓ Tabelle erstellt!');
} else {
  console.log('✓ Tabelle bereits vorhanden.');
}

await conn.end();
process.exit(0);
