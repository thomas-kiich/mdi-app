import mysql from "mysql2/promise";

const conn = await mysql.createConnection({
  host: process.env.DATABASE_URL.split("@")[1].split(":")[0],
  user: process.env.DATABASE_URL.split("://")[1].split(":")[0],
  password: process.env.DATABASE_URL.split(":")[1].split("@")[0],
  database: process.env.DATABASE_URL.split("/").pop(),
  ssl: { rejectUnauthorized: false },
});

const [rows] = await conn.query("SELECT id, episodeNumber, catchphrase, sortOrder, isLatest FROM podcast_episodes ORDER BY sortOrder DESC");
console.log(JSON.stringify(rows, null, 2));
await conn.end();
