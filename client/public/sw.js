// MA Service Worker – Web Push Notifications

// Sofort übernehmen wenn UpdateBanner "Jetzt" geklickt wird
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('push', (event) => {
  if (!event.data) return;

  let payload;
  try {
    payload = event.data.json();
  } catch {
    payload = { title: 'MA Erinnerung', body: event.data.text(), erinnerungId: null };
  }

  const options = {
    body: payload.body || '',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `erinnerung-${payload.erinnerungId || Date.now()}`,
    renotify: true,
    requireInteraction: true,
    data: {
      erinnerungId: payload.erinnerungId,
      text: payload.body,
      url: '/momentaufnahme/app?erinnerung=' + encodeURIComponent(payload.body || ''),
    },
  };

  event.waitUntil(
    self.registration.showNotification(payload.title || 'MA Erinnerung', options)
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const url = event.notification.data?.url || '/momentaufnahme/app';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Wenn App bereits offen – fokussieren und navigieren
      for (const client of clientList) {
        if (client.url.includes('/momentaufnahme') && 'focus' in client) {
          client.focus();
          client.postMessage({ type: 'ERINNERUNG_OEFFNEN', text: event.notification.data?.text });
          return;
        }
      }
      // Sonst neues Fenster öffnen
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
