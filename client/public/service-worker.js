// DEAKTIVIERT: Dieser SW deregistriert sich selbst um Reload-Schleifen zu verhindern.
const CACHE_NAME = 'mdi-system-disabled';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', () => self.skipWaiting());

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.map(k => caches.delete(k))))
      .then(() => self.registration.unregister())
  );
});

// Kein fetch-Handler – SW ist deaktiviert
