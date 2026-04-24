import { db } from "./server/db";
import { users } from "./drizzle/schema";
import { like, or } from "drizzle-orm";

async function main() {
  const results = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    createdAt: users.createdAt,
  }).from(users).where(
    or(
      like(users.name, '%gisela%'),
      like(users.name, '%Gisela%'),
      like(users.name, '%strafer%'),
      like(users.name, '%Strafer%'),
      like(users.email, '%gisela%'),
      like(users.email, '%strafer%')
    )
  );
  console.log("Gefundene Einträge:", results.length);
  console.log(JSON.stringify(results, null, 2));
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
