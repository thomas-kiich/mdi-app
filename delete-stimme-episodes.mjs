import { getDb } from "./server/db.ts";
import { podcastEpisodes } from "./drizzle/schema.ts";
import { like, or, eq, isNull } from "drizzle-orm";

const db = await getDb();
if (!db) {
  console.error("DB connection failed");
  process.exit(1);
}

// Finde Episoden mit "STIMME" im catchphrase
const stimmeEpisodes = await db
  .select()
  .from(podcastEpisodes)
  .where(like(podcastEpisodes.catchphrase, "%STIMME%"));

console.log("Episoden mit 'STIMME':", stimmeEpisodes.map(e => ({ id: e.id, catchphrase: e.catchphrase, audioUrl: e.audioUrl })));

// Lösche nur die ohne Audio
let deletedCount = 0;
for (const ep of stimmeEpisodes) {
  if (!ep.audioUrl || ep.audioUrl.trim() === "") {
    console.log(`Lösche Episode ID ${ep.id} (${ep.catchphrase}) - keine Audio`);
    await db.delete(podcastEpisodes).where(eq(podcastEpisodes.id, ep.id));
    deletedCount++;
  }
}

console.log(`✓ ${deletedCount} Episoden mit 'STIMME' und ohne Audio gelöscht`);
process.exit(0);
