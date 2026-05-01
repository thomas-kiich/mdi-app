import { getDb } from './server/db.ts';
import { podcastEpisodes } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

async function fixEpisode04() {
  try {
    const db = await getDb();
    if (!db) {
      console.error('Datenbank nicht verfügbar');
      process.exit(1);
    }

    // Finde EP04
    const ep04 = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.episodeNumber, '04'));
    console.log('EP04 gefunden:', ep04);

    if (!ep04 || ep04.length === 0) {
      console.error('EP04 nicht gefunden');
      process.exit(1);
    }

    const ep04Id = ep04[0].id;
    console.log('EP04 ID:', ep04Id);

    // Update EP04: setze isLatest auf false
    await db.update(podcastEpisodes).set({ isLatest: false }).where(eq(podcastEpisodes.id, ep04Id));
    console.log('✓ EP04 isLatest auf false gesetzt');

    // Verifiziere
    const updated = await db.select().from(podcastEpisodes).where(eq(podcastEpisodes.id, ep04Id));
    console.log('Verifizierung:', updated);
    process.exit(0);
  } catch (err) {
    console.error('Fehler:', err);
    process.exit(1);
  }
}

fixEpisode04();
