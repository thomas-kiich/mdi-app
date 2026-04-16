import mysql from 'mysql2/promise';
const conn = await mysql.createConnection(process.env.DATABASE_URL);

const [cols] = await conn.query("SHOW COLUMNS FROM abonnements LIKE 'status'");
console.log('status ENUM aktuell:', cols[0].Type);

if (!cols[0].Type.includes('beta')) {
  await conn.query("ALTER TABLE abonnements MODIFY COLUMN status ENUM('trial','active','cancelled','expired','beta') NOT NULL DEFAULT 'trial'");
  console.log('✅ status ENUM erweitert um beta');
} else {
  console.log('ℹ️ beta bereits vorhanden');
}

// Finaler Stand
const [all] = await conn.query('SELECT userId, ebene, status FROM abonnements');
console.log('Alle Abos:', JSON.stringify(all, null, 2));

await conn.end();
