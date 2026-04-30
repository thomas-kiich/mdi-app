import mysql from 'mysql2/promise';
const url = new URL(process.env.DATABASE_URL);
const conn = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  ssl: { rejectUnauthorized: false }
});

const episodes = [
  {
    title: 'Episode 01: Maschinen atmen nicht',
    description: 'Die erste Episode der Hörbuchserie "Maschinen atmen nicht"',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP01_128k.mp3',
    episodeNumber: 1,
    isLatest: false
  },
  {
    title: 'Episode 02: Maschinen atmen nicht',
    description: 'Die zweite Episode der Hörbuchserie "Maschinen atmen nicht"',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP02_128k.mp3',
    episodeNumber: 2,
    isLatest: false
  },
  {
    title: 'Episode 03: Maschinen atmen nicht',
    description: 'Die dritte Episode der Hörbuchserie "Maschinen atmen nicht"',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP03_128k.mp3',
    episodeNumber: 3,
    isLatest: false
  },
  {
    title: 'Episode 04: Maschinen atmen nicht',
    description: 'Die vierte Episode der Hörbuchserie "Maschinen atmen nicht"',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP04_128k_v2_271b782e.mp3',
    episodeNumber: 4,
    isLatest: true
  }
];

for (const ep of episodes) {
  try {
    const [result] = await conn.execute(
      'INSERT INTO podcast_episodes (title, description, audioUrl, episodeNumber, isLatest, createdAt) VALUES (?, ?, ?, ?, ?, NOW())',
      [ep.title, ep.description, ep.audioUrl, ep.episodeNumber, ep.isLatest ? 1 : 0]
    );
    console.log(`✓ Episode ${ep.episodeNumber} eingefügt`);
  } catch (e) {
    console.error(`✗ Episode ${ep.episodeNumber} Fehler:`, e.message);
  }
}

await conn.end();
console.log('Fertig!');
