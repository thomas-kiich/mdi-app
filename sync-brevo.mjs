/**
 * sync-brevo.mjs
 * Synchronisiert alle aktiven Newsletter-Abonnenten aus der App-Datenbank nach Brevo.
 * Läuft einmalig manuell: node sync-brevo.mjs
 */

import mysql from 'mysql2/promise';

const BREVO_API_KEY = process.env.BREVO_API_KEY;
const DATABASE_URL = process.env.DATABASE_URL;

if (!BREVO_API_KEY) {
  console.error('BREVO_API_KEY nicht gefunden');
  process.exit(1);
}
if (!DATABASE_URL) {
  console.error('DATABASE_URL nicht gefunden');
  process.exit(1);
}

// Brevo: Kontakt erstellen oder aktualisieren
async function upsertBrevoContact(email, name) {
  const body = {
    email,
    updateEnabled: true,
    attributes: name ? { FIRSTNAME: name.split(' ')[0], LASTNAME: name.split(' ').slice(1).join(' ') || '' } : {},
    listIds: [], // wird in die Standard-Liste eingetragen
  };

  // Erst prüfen ob Liste existiert, dann Kontakt anlegen
  const res = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (res.ok || res.status === 400) {
    // 400 = already exists, das ist ok
    return { success: true, email, status: res.status };
  }
  return { success: false, email, status: res.status, error: data };
}

// Brevo: Alle Listen abrufen
async function getBrevoLists() {
  const res = await fetch('https://api.brevo.com/v3/contacts/lists?limit=50', {
    headers: { 'api-key': BREVO_API_KEY },
  });
  return res.json();
}

// Brevo: Kontakt zu Liste hinzufügen
async function addContactToList(email, listId) {
  const res = await fetch(`https://api.brevo.com/v3/contacts/lists/${listId}/contacts/add`, {
    method: 'POST',
    headers: {
      'api-key': BREVO_API_KEY,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ emails: [email] }),
  });
  return { status: res.status, data: await res.json() };
}

async function main() {
  console.log('🔄 Starte Brevo-Synchronisation...\n');

  // 1. Alle Listen in Brevo abrufen
  const listsData = await getBrevoLists();
  console.log('📋 Brevo-Listen:', JSON.stringify(listsData.lists?.map(l => ({ id: l.id, name: l.name })), null, 2));

  // Newsletter-Liste finden (erste Liste oder "Newsletter")
  const newsletterList = listsData.lists?.find(l =>
    l.name.toLowerCase().includes('newsletter') ||
    l.name.toLowerCase().includes('mdi') ||
    l.name.toLowerCase().includes('subscriber')
  ) || listsData.lists?.[0];

  if (!newsletterList) {
    console.error('❌ Keine Brevo-Liste gefunden!');
    process.exit(1);
  }
  console.log(`\n✅ Verwende Liste: "${newsletterList.name}" (ID: ${newsletterList.id})\n`);

  // 2. Alle aktiven Abonnenten aus DB holen
  const conn = await mysql.createConnection(DATABASE_URL);
  const [subscribers] = await conn.execute(
    'SELECT email, name FROM newsletter_subscribers WHERE active = 1 ORDER BY createdAt'
  );
  await conn.end();

  console.log(`📊 ${subscribers.length} aktive Abonnenten in der Datenbank gefunden.\n`);

  // 3. Jeden Abonnenten in Brevo anlegen und zur Liste hinzufügen
  let successCount = 0;
  let errorCount = 0;

  for (const sub of subscribers) {
    // Kontakt anlegen/aktualisieren
    const result = await upsertBrevoContact(sub.email, sub.name);

    // Zur Newsletter-Liste hinzufügen
    const listResult = await addContactToList(sub.email, newsletterList.id);

    if (result.success || result.status === 400) {
      console.log(`✅ ${sub.email} (${sub.name || '–'}) → Liste "${newsletterList.name}"`);
      successCount++;
    } else {
      console.log(`❌ ${sub.email} → Fehler: ${JSON.stringify(result.error)}`);
      errorCount++;
    }

    // Rate-Limiting: kurze Pause
    await new Promise(r => setTimeout(r, 200));
  }

  console.log(`\n🎉 Synchronisation abgeschlossen:`);
  console.log(`   ✅ Erfolgreich: ${successCount}`);
  console.log(`   ❌ Fehler: ${errorCount}`);
}

main().catch(console.error);
