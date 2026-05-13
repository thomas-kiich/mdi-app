import 'dotenv/config';
import mysql from 'mysql2/promise';
import crypto from 'crypto';
import fs from 'fs';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

const sql = fs.readFileSync('./drizzle/0033_fluffy_thing.sql', 'utf8');
const hash = crypto.createHash('sha256').update(sql).digest('hex');
console.log('Hash:', hash);

// Prüfen ob bereits eingetragen
const [existing] = await conn.execute('SELECT id FROM __drizzle_migrations WHERE hash = ?', [hash]);
if (existing.length > 0) {
  console.log('Migration already registered.');
} else {
  const now = Date.now();
  await conn.execute('INSERT INTO __drizzle_migrations (hash, created_at) VALUES (?, ?)', [hash, now]);
  console.log('Migration registered successfully at', now);
}

await conn.end();
