import mysql from 'mysql2/promise';

const conn = await mysql.createConnection(process.env.DATABASE_URL);

// Abonnement auf Ebene III / active setzen, Ablaufdatum weit in die Zukunft
await conn.query(`UPDATE abonnements SET ebene = 'III', status = 'active', trialEndsAt = '2099-12-31 23:59:59', currentPeriodEnd = '2099-12-31 23:59:59' WHERE userId = 1`);
console.log('✅ Abonnement: Ebene III / active bis 2099');

// Alle Premium-Features aktivieren
await conn.execute(`UPDATE premium_settings SET enabled = 1`);
console.log('✅ Alle Premium-Features aktiviert');

// Ergebnis anzeigen
const [abo] = await conn.execute(`SELECT ebene, status, trialEndsAt FROM abonnements WHERE userId = 1`);
console.log('Abonnement:', JSON.stringify(abo[0]));

const [ps] = await conn.execute(`SELECT feature, enabled FROM premium_settings`);
ps.forEach(p => console.log(` - ${p.feature}: ${p.enabled ? '✅ aktiv' : '❌ inaktiv'}`));

await conn.end();
