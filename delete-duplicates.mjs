import { getDb } from "./server/db.ts";
import { podcastEpisodes } from "./drizzle/schema.ts";
import { eq } from "drizzle-orm";

const db = await getDb();
if (!db) {
  console.error("DB connection failed");
  process.exit(1);
}

// Finde alle Episoden
const allEpisodes = await db.select().from(podcastEpisodes);
console.log("Alle Episoden:", allEpisodes.map(e => ({ id: e.id, episodeNumber: e.episodeNumber, catchphrase: e.catchphrase })));

// Gruppiere nach episodeNumber
const grouped = {};
allEpisodes.forEach(ep => {
  if (!grouped[ep.episodeNumber]) grouped[ep.episodeNumber] = [];
  grouped[ep.episodeNumber].push(ep);
});

// Finde Duplikate und lösche die neueren
let deletedCount = 0;
for (const [epNum, episodes] of Object.entries(grouped)) {
  if (episodes.length > 1) {
    console.log(`Episode ${epNum} hat ${episodes.length} Einträge. Lösche die neueren...`);
    // Sortiere nach ID und behalte den ältesten
    episodes.sort((a, b) => a.id - b.id);
    for (let i = 1; i < episodes.length; i++) {
      console.log(`  Lösche ID ${episodes[i].id}`);
      await db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, episodes[i].id));
      deletedCount++;
    }
  }
}

console.log(`\n✓ ${deletedCount} doppelte Episoden gelöscht`);
process.exit(0);
