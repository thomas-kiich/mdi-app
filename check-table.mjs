import mysql from 'mysql2/promise';
const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});
try {
  const [tables] = await conn.execute("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME = 'podcast_episodes'", [url.pathname.slice(1)]);
  console.log('Table exists:', tables.length > 0);
  if (tables.length === 0) {
    console.log('podcast_episodes table does NOT exist');
  } else {
    console.log('podcast_episodes table EXISTS');
  }
} catch (e) {
  console.error('Error:', e.message);
}
await conn.end();
