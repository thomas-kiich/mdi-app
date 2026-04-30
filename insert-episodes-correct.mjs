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
    episodeNumber: '01',
    catchphrase: 'DIE ERSTE STIMME',
    subtitle: 'Einführung in die Hörbuchserie "Maschinen atmen nicht"',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP01_128k.mp3',
    coverImageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/cover_ep01.jpg',
    description: 'Die erste Episode der Hörbuchserie "Maschinen atmen nicht" stellt die Welt und die Charaktere vor.',
    isLatest: false,
    sortOrder: 1
  },
  {
    episodeNumber: '02',
    catchphrase: 'DIE ZWEITE STIMME',
    subtitle: 'Vertiefung in die Geschichte',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP02_128k.mp3',
    coverImageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/cover_ep02.jpg',
    description: 'Die zweite Episode vertieft die Handlung und stellt neue Perspektiven vor.',
    isLatest: false,
    sortOrder: 2
  },
  {
    episodeNumber: '03',
    catchphrase: 'DIE DRITTE STIMME',
    subtitle: 'Wendepunkt der Geschichte',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP03_128k.mp3',
    coverImageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/cover_ep03.jpg',
    description: 'Die dritte Episode bringt einen Wendepunkt in der Geschichte.',
    isLatest: false,
    sortOrder: 3
  },
  {
    episodeNumber: '04',
    catchphrase: 'DIE VIERTE STIMME',
    subtitle: 'Finale und Auflösung',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/EP04_128k_v2_271b782e.mp3',
    coverImageUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/cover_ep04.jpg',
    description: 'Die vierte Episode bringt die Geschichte zu ihrem Finale.',
    isLatest: true,
    sortOrder: 4
  }
];

for (const ep of episodes) {
  try {
    const [result] = await conn.execute(
      'INSERT INTO podcast_episodes (episodeNumber, catchphrase, subtitle, audioUrl, coverImageUrl, description, isLatest, sortOrder, createdAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())',
      [ep.episodeNumber, ep.catchphrase, ep.subtitle, ep.audioUrl, ep.coverImageUrl, ep.description, ep.isLatest ? 1 : 0, ep.sortOrder]
    );
    console.log(`✓ Episode ${ep.episodeNumber} eingefügt`);
  } catch (e) {
    console.error(`✗ Episode ${ep.episodeNumber} Fehler:`, e.message);
  }
}

await conn.end();
console.log('Fertig!');
