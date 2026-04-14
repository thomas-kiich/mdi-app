/**
 * Wecker Service Worker – MA Morgenritual
 * Prüft periodisch ob der Wecker ausgelöst werden soll und
 * sendet eine Push-ähnliche Nachricht an den Haupt-Thread.
 *
 * Registrierung: navigator.serviceWorker.register('/wecker-sw.js')
 * Kommunikation: postMessage({ type: 'WECKER_AUSLOESEN', ... })
 */

const WECKER_CHECK_INTERVAL = 60 * 1000; // jede Minute prüfen
let weckerInterval = null;

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
  startWeckerCheck();
});

self.addEventListener('message', (event) => {
  if (event.data?.type === 'WECKER_KONFIGURIEREN') {
    // Wecker-Einstellungen aus dem Haupt-Thread empfangen
    const { weckzeit, weckTage, aktiv } = event.data;
    if (aktiv) {
      // In IndexedDB speichern für Persistenz
      speichereWeckerConfig({ weckzeit, weckTage });
    }
  }

  if (event.data?.type === 'WECKER_DEAKTIVIEREN') {
    loesche WeckerConfig();
  }
});

async function startWeckerCheck() {
  if (weckerInterval) clearInterval(weckerInterval);
  weckerInterval = setInterval(pruefeWecker, WECKER_CHECK_INTERVAL);
  // Sofort einmal prüfen
  await pruefeWecker();
}

async function pruefeWecker() {
  try {
    const config = await ladeWeckerConfig();
    if (!config || !config.aktiv || !config.weckzeit) return;

    const jetzt = new Date();
    const [stunden, minuten] = config.weckzeit.split(':').map(Number);
    const weckMs = new Date(
      jetzt.getFullYear(), jetzt.getMonth(), jetzt.getDate(),
      stunden, minuten, 0
    ).getTime();

    // Wochentag prüfen
    const jsTag = jetzt.getDay();
    const bitTag = jsTag === 0 ? 6 : jsTag - 1;
    const tagAktiv = (config.weckTage & (1 << bitTag)) !== 0;
    if (!tagAktiv) return;

    // Innerhalb 90-Sekunden-Fenster und heute noch nicht ausgelöst
    const diffMs = Math.abs(Date.now() - weckMs);
    const heute = jetzt.toISOString().slice(0, 10);

    if (diffMs <= 90 * 1000 && config.letzterAusloeser !== heute) {
      // Letzten Auslöser speichern
      await speichereWeckerConfig({ ...config, letzterAusloeser: heute });

      // Alle Clients benachrichtigen
      const alleClients = await clients.matchAll({ type: 'window', includeUncontrolled: true });
      if (alleClients.length > 0) {
        alleClients.forEach(client => {
          client.postMessage({
            type: 'WECKER_AUSLOESEN',
            zeit: config.weckzeit,
          });
        });
      } else {
        // App ist nicht offen – Browser-Notification senden
        await self.registration.showNotification('🌅 Morgenritual', {
          body: `Guten Morgen! Dein Wecker um ${config.weckzeit} klingelt.`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
          tag: 'wecker',
          requireInteraction: true,
          actions: [
            { action: 'oeffnen', title: '✨ Ritual starten' },
            { action: 'snoooze', title: '⏰ 5 Min. später' }
          ]
        });
      }
    }
  } catch (err) {
    console.error('[Wecker-SW] Fehler:', err);
  }
}

// ─── IndexedDB Helpers ────────────────────────────────────────────────────────

function oeffneDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('wecker-db', 1);
    req.onupgradeneeded = (e) => {
      e.target.result.createObjectStore('config', { keyPath: 'id' });
    };
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e.target.error);
  });
}

async function speichereWeckerConfig(config) {
  const db = await oeffneDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readwrite');
    tx.objectStore('config').put({ id: 'wecker', ...config });
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

async function ladeWeckerConfig() {
  const db = await oeffneDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readonly');
    const req = tx.objectStore('config').get('wecker');
    req.onsuccess = (e) => resolve(e.target.result ?? null);
    req.onerror = reject;
  });
}

async function loescheWeckerConfig() {
  const db = await oeffneDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('config', 'readwrite');
    tx.objectStore('config').delete('wecker');
    tx.oncomplete = resolve;
    tx.onerror = reject;
  });
}

// Notification-Klick: App öffnen
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'snoooze') {
    // Snooze: 5 Minuten warten, dann erneut auslösen
    setTimeout(() => {
      self.registration.showNotification('🌅 Morgenritual (Snooze)', {
        body: 'Dein Wecker klingelt erneut.',
        icon: '/icon-192.png',
        tag: 'wecker-snooze',
        requireInteraction: true,
      });
    }, 5 * 60 * 1000);
    return;
  }

  // App öffnen oder fokussieren
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if ('focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
