import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';

// Load env
const envFile = readFileSync('/home/ubuntu/mdi-app/.env', 'utf8');
const envVars = Object.fromEntries(
  envFile.split('\n')
    .filter(line => line.includes('=') && !line.startsWith('#'))
    .map(line => {
      const idx = line.indexOf('=');
      return [line.slice(0, idx).trim(), line.slice(idx + 1).trim().replace(/^["']|["']$/g, '')];
    })
);

const conn = await createConnection(envVars.DATABASE_URL);

try {
  await conn.execute(`ALTER TABLE vital_eintraege ADD COLUMN IF NOT EXISTS mahlzeiten INT NULL`);
  console.log('✅ Spalte mahlzeiten hinzugefügt');
} catch (e) {
  if (e.message.includes('Duplicate column')) {
    console.log('ℹ️ Spalte mahlzeiten existiert bereits');
  } else {
    throw e;
  }
}

await conn.end();
