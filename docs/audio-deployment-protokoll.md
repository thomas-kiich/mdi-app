# Audio-Deployment-Protokoll

**Projekt:** kiich.manus.space (MDI – Multidimensionales Identitätssystem)  
**Datum:** 23.–24. April 2026  
**Autor:** Manus AI  
**Status:** Gelöst ✓

---

## Zusammenfassung

Dieses Protokoll dokumentiert alle Erkenntnisse aus der Debugging-Session rund um den Audio-Player auf kiich.manus.space. Es dient als Referenz für zukünftige Audio-Deployments und beschreibt die korrekte Vorgehensweise von der Datei-Vorbereitung bis zur Live-Schaltung.

---

## 1. Korrekte MP3-Vorbereitung

### Konvertierungsbefehl

```bash
ffmpeg -y -i INPUT.mp3 \
  -codec:a libmp3lame \
  -b:a 128k \
  -id3v2_version 3 \
  -write_xing 1 \
  OUTPUT_128k.mp3
```

### Warum diese Parameter?

| Parameter | Bedeutung | Warum wichtig |
|---|---|---|
| `-b:a 128k` | Bitrate 128 kbps | Gute Qualität bei halber Dateigröße |
| `-id3v2_version 3` | ID3-Tag-Version 3 | Maximale Browser-Kompatibilität |
| `-write_xing 1` | Xing/Info-Header einbetten | **Kritisch:** Browser liest Gesamtdauer daraus |

### Verifikation nach Konvertierung

```bash
# Info-Header prüfen (muss "Info" oder "Xing" bei Byte ~366 stehen)
python3 -c "
with open('OUTPUT_128k.mp3', 'rb') as f:
    data = f.read(600)
    for i in range(len(data)-4):
        if data[i:i+4] in [b'Info', b'Xing']:
            print(f'Header gefunden bei Byte {i}')
            break
"
```

**Erwartetes Ergebnis:** `Header gefunden bei Byte 366`

Wenn kein Header gefunden wird, zeigt der Browser **00:00** als Dauer – die Datei muss dann neu konvertiert werden.

---

## 2. Upload auf CDN

```bash
cd /home/ubuntu/mdi-app
manus-upload-file --webdev /pfad/zur/OUTPUT_128k.mp3
```

**Wichtig:** Der CDN liefert immer `content-type: application/octet-stream`, unabhängig vom Dateinamen. Das ist eine Einschränkung des S3-Buckets und **nicht** änderbar über den Upload-Befehl.

---

## 3. Datenbank aktualisieren

```javascript
// In Node.js (aus dem Projektverzeichnis ausführen)
const mysql = require('mysql2/promise');
// Verbindung über DATABASE_URL aus .env
const conn = await mysql.createConnection(process.env.DATABASE_URL);
await conn.execute(
  'UPDATE podcasts SET audio_url = ? WHERE episode_number = ?',
  ['https://d2xsxph8kpxj0f.cloudfront.net/...NEUE_URL.mp3', 4]
);
await conn.end();
```

---

## 4. Frontend: Audio-Tag korrekt einbinden

### Die richtige Lösung (direkt vom CDN)

```tsx
<audio controls preload="metadata">
  {/* CDN direkt – kein Proxy! Proxy verursacht 500 auf Live-Server */}
  <source
    src={`${audioUrl}?v=9`}  {/* v=X erhöhen bei jedem Update */}
    type="audio/mpeg"
  />
</audio>
```

### Warum NICHT den Proxy verwenden?

Der Manus-Live-Server hat ein **Request-Timeout** beim Streamen großer Dateien (>50 MB) ohne `Range`-Header. Der Browser sendet beim initialen Laden von `<audio preload="metadata">` einen GET-Request **ohne** Range-Header. Der Server versucht daraufhin die komplette Datei zu streamen – das dauert zu lang und der Server gibt **500** zurück.

Der CDN hat `access-control-allow-origin: *`, sodass der Browser direkt darauf zugreifen kann ohne CORS-Fehler.

### Cache-Busting

Der `?v=X`-Parameter zwingt den Browser, die neue Datei zu laden statt die gecachte Version. Bei jedem Audio-Update **muss** dieser Wert erhöht werden (v=8 → v=9 → v=10 usw.).

---

## 5. Build vor Publish

**Kritisch:** Der `Publish`-Button deployed das `dist/`-Verzeichnis. Dieses wird **nicht** automatisch aktualisiert wenn Quellcode geändert wird. Vor jedem Publish muss explizit gebaut werden:

```bash
cd /home/ubuntu/mdi-app
pnpm build
```

Danach erst Checkpoint speichern und Publish klicken.

**Verifikation:**
```bash
ls -la dist/index.js  # Datum muss aktuell sein
```

---

## 6. Vollständige Checkliste für Audio-Updates

```
[ ] 1. MP3 mit ffmpeg konvertieren (128k + write_xing 1)
[ ] 2. Info/Xing-Header in der Datei verifizieren
[ ] 3. Datei mit manus-upload-file --webdev hochladen
[ ] 4. CDN-URL in DB aktualisieren (UPDATE podcasts SET audio_url = ...)
[ ] 5. Cache-Busting-Parameter in PodcastFeature.tsx erhöhen (?v=X)
[ ] 6. pnpm build ausführen
[ ] 7. Checkpoint speichern (webdev_save_checkpoint)
[ ] 8. Publish klicken
[ ] 9. Auf Live-Domain testen: HEAD-Request → 200 + Content-Length
[ ] 10. Auf Handy (Android Chrome) + anderem Laptop testen
```

---

## 7. Diagnose-Befehle

Bei Problemen diese Befehle der Reihe nach ausführen:

```bash
# 1. HEAD-Request auf Live-Domain (muss 200 + audio/mpeg zurückgeben)
curl -s -I -X HEAD "https://kiich.manus.space/api/audio-proxy?url=ENCODED_URL"

# 2. GET ohne Range (muss 200 zurückgeben, NICHT 500)
curl -s -D - -o /dev/null --max-time 10 "https://kiich.manus.space/api/audio-proxy?url=ENCODED_URL"

# 3. GET mit Range (muss 206 zurückgeben)
curl -s -D - -o /dev/null -H "Range: bytes=0-1023" "https://kiich.manus.space/api/audio-proxy?url=ENCODED_URL"

# 4. CDN direkt testen
curl -s -I "https://d2xsxph8kpxj0f.cloudfront.net/...DATEI.mp3"

# 5. DB-Eintrag prüfen
node -e "
const mysql = require('mysql2/promise');
mysql.createConnection(process.env.DATABASE_URL).then(async c => {
  const [rows] = await c.execute('SELECT episode_number, audio_url FROM podcasts ORDER BY episode_number');
  console.table(rows);
  c.end();
});
"
```

---

## 8. Bekannte Fehlerbilder und Ursachen

| Symptom | Ursache | Lösung |
|---|---|---|
| Player zeigt **00:00** | Kein Xing/Info-Header in MP3 | Neu konvertieren mit `-write_xing 1` |
| Player zeigt **00:00** auf allen Geräten außer Vorschau | `dist/index.js` veraltet | `pnpm build` ausführen |
| Player zeigt **00:00** auf Handy/Laptop, Vorschau OK | Proxy liefert 500 auf Live-Server | CDN-URL direkt im `<audio>`-Tag verwenden |
| **500** auf Live-Domain bei GET ohne Range | Server-Timeout beim Streaming | Proxy umgehen, CDN direkt nutzen |
| **302** → CDN → **00:00** | CDN liefert `application/octet-stream` | `type="audio/mpeg"` im `<source>`-Tag setzen |
| Player funktioniert nicht nach Publish | Browser-Cache | Hard-Reload (Cmd+Shift+R) oder Inkognito |

---

## 9. Architektur-Entscheidung: Wann Proxy, wann CDN direkt?

| Anwendungsfall | Empfehlung |
|---|---|
| Audio-Streaming (`<audio>`-Tag) | **Direkt vom CDN** – kein Proxy |
| Seeking/Range-Requests | Automatisch vom Browser direkt zum CDN |
| Download-Links | Proxy kann genutzt werden (kleine Requests) |
| HEAD-Requests für Metadaten | Proxy funktioniert (200 ✓) |

Der Proxy bleibt im Code erhalten und ist für HEAD-Requests und Range-Requests funktionsfähig. Für den initialen Audio-Load ist der direkte CDN-Zugriff die einzig zuverlässige Lösung.

---

*Protokoll erstellt nach Debugging-Session vom 23.–24. April 2026.*
