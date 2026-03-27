const CACHE_NAME = 'mdi-system-v2'; // Bumped version for auto-update
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Take control of all clients immediately
  );
});

self.addEventListener('fetch', event => {
  // Use Network First strategy for HTML documents to ensure the latest version is loaded
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  // Stale-While-Revalidate or Cache First strategy for other assets
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          // Fetch the latest version in the background to keep cache fresh
          fetch(event.request).then(res => {
            if (res && res.status === 200) {
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, res));
            }
          }).catch(() => {});
          return response;
        }
        return fetch(event.request);
      })
  );
});
