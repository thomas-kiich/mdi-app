import { getDb } from "./server/db.ts";
import { podcastEpisodes } from "./drizzle/schema.ts";
import { isNull, or, eq } from "drizzle-orm";

const db = await getDb();
if (!db) {
  console.error("DB connection failed");
  process.exit(1);
}

// Finde Episoden ohne Audio-URL
const episodesWithoutAudio = await db
  .select()
  .from(podcastEpisodes)
  .where(isNull(podcastEpisodes.audioUrl));

console.log("Episoden ohne Audio:", episodesWithoutAudio.map(e => ({ id: e.id, episodeNumber: e.episodeNumber, catchphrase: e.catchphrase })));

// Lösche sie
for (const ep of episodesWithoutAudio) {
  console.log(`Lösche Episode ID ${ep.id} (${ep.episodeNumber})`);
  await db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, ep.id));
}

console.log(`✓ ${episodesWithoutAudio.length} Episoden ohne Audio gelöscht`);
process.exit(0);
