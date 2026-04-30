import mysql from 'mysql2/promise';
const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});
const [rows] = await conn.execute('SELECT COUNT(*) as count FROM podcast_episodes');
console.log('Podcast Episodes Count:', rows[0].count);
const [episodes] = await conn.execute('SELECT id, title, isLatest FROM podcast_episodes LIMIT 5');
console.log('Episodes:', episodes);
await conn.end();
