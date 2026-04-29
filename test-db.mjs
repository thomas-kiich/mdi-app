import mysql from 'mysql2/promise.js';

const url = new URL(process.env.DATABASE_URL);
const connection = await mysql.createConnection({
  host: url.hostname,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
});

try {
  const [result] = await connection.execute('SELECT 1 as test');
  console.log('✓ Verbindung erfolgreich:', result);
  
  const [tables] = await connection.execute('SHOW TABLES');
  console.log('✓ Tabellen vorhanden:', tables.length);
  
  const [usersCheck] = await connection.execute('SELECT COUNT(*) as count FROM users');
  console.log('✓ Users Tabelle:', usersCheck);
} catch (error) {
  console.error('✗ Fehler:', error.message);
} finally {
  await connection.end();
}
