---
name: kiich-audio-deployment
description: "Vollständiger Workflow für das Austauschen und Deployen von Audio-Episoden auf kiich.manus.space / kiich.de. Verwenden wenn eine neue oder überarbeitete MP3-Datei für eine KIICH-Episode hochgeladen und in der App verfügbar gemacht werden soll. Enthält Konvertierungsparameter, Upload-Prozess, DB-Update und Diagnose-Befehle für Audio-Probleme."
---

# KIICH Audio Deployment

## Architektur (wichtig für Debugging)

Der `<audio>`-Tag lädt **direkt vom CDN** (kein Proxy). Der Proxy (`/api/audio-proxy`) wird nur für Range-Requests (Seeking) verwendet.

- CDN: `https://d2xsxph8kpxj0f.cloudfront.net/`
- CDN liefert `content-type: application/octet-stream` → `type="audio/mpeg"` muss im `<source>`-Tag gesetzt sein
- CDN hat `access-control-allow-origin: *` → kein CORS-Problem
- DB-Tabelle: `episodes`, Spalte `audio_url`

## Schritt-für-Schritt Workflow

### 1. Datei konvertieren

```bash
python3 /home/ubuntu/skills/kiich-audio-deployment/scripts/convert_audio.py \
  /pfad/zur/eingabe.mp3 \
  /home/ubuntu/upload/EP0X_128k.mp3
```

Oder manuell mit ffmpeg:

```bash
ffmpeg -y -i /pfad/zur/eingabe.mp3 \
  -codec:a libmp3lame -b:a 128k \
  -id3v2_version 3 -write_xing 1 \
  -map_metadata 0 \
  /home/ubuntu/upload/EP0X_128k.mp3
```

**Kritisch:** `-write_xing 1` erzeugt den Info-Header – ohne ihn zeigt der Browser 00:00.

### 2. Info-Header verifizieren

```bash
python3 -c "
with open('/home/ubuntu/upload/EP0X_128k.mp3', 'rb') as f:
    data = f.read(2000)
pos = data.find(b'Info')
print(f'Info-Header bei Byte: {pos}' if pos >= 0 else 'FEHLER: Kein Info-Header!')
"
```

Erwartet: `Info-Header bei Byte: ~366`

### 3. Auf CDN hochladen

```bash
cd /home/ubuntu/mdi-app && manus-upload-file --webdev /home/ubuntu/upload/EP0X_128k.mp3
```

Gibt eine URL zurück, z. B.: `https://d2xsxph8kpxj0f.cloudfront.net/EP0X_128k_XXXXXXXX.mp3`

### 4. DB-Eintrag aktualisieren

```bash
cd /home/ubuntu/mdi-app && node -e "
const mysql = require('mysql2/promise');
async function main() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  const [r] = await conn.execute(
    'UPDATE episodes SET audio_url = ? WHERE episode_number = ?',
    ['NEUE_CDN_URL', EPISODENNUMMER]
  );
  console.log('Updated:', r.affectedRows, 'rows');
  await conn.end();
}
main().catch(console.error);
"
```

### 5. Cache-Busting erhöhen

In `client/src/components/PodcastFeature.tsx` den `?v=X`-Parameter um 1 erhöhen:

```bash
grep -n "v=" /home/ubuntu/mdi-app/client/src/components/PodcastFeature.tsx | head -5
```

### 6. Build + Checkpoint + Publish

```bash
cd /home/ubuntu/mdi-app && pnpm build 2>&1 | tail -5
```

Dann `webdev_save_checkpoint` aufrufen, anschließend Publish-Button klicken.

## Diagnose-Befehle

| Problem | Befehl |
|---|---|
| 00:00 im Player | Info-Header prüfen (Schritt 2) |
| 500 auf Live-Server | `curl -s -D - -o /dev/null --max-time 10 "https://kiich.manus.space/api/audio-proxy?url=..."` |
| CDN erreichbar? | `curl -s -I "https://d2xsxph8kpxj0f.cloudfront.net/DATEINAME.mp3"` |
| HEAD-Request | `curl -s -I -X HEAD "https://kiich.manus.space/api/audio-proxy?url=..."` |
| DB-Eintrag prüfen | `node -e "... SELECT audio_url FROM episodes WHERE episode_number = X ..."` |

## Fehlerbilder

| Symptom | Ursache | Lösung |
|---|---|---|
| 00:00 im Player | Fehlender Info/Xing-Header | Neu konvertieren mit `-write_xing 1` |
| Funktioniert nur in Vorschau | `pnpm build` nicht ausgeführt | `pnpm build` vor Checkpoint |
| 500 ohne Range-Header | Proxy streamt ganze Datei | CDN-URL direkt im `<audio>`-Tag verwenden |
| Falscher Content-Type | CDN liefert `application/octet-stream` | `type="audio/mpeg"` im `<source>`-Tag |
| HEAD gibt 206 | Proxy-Fehler | HEAD-Handler im Proxy prüfen |

## MA-Stimme – Quelle und Generierung

**WICHTIG:** MA's Stimme wird ausschließlich mit **Mistral Voxtral** generiert – NICHT ElevenLabs oder andere TTS-Dienste.

- Dienst: Mistral Voxtral (API-Zugang über Mistral AI)
- API-Key: `MISTRAL_API_KEY` (bereits in den Projekt-Secrets hinterlegt)
- Verwendung: Alle gesprochenen Inhalte von MA (Episoden-Audio, Erkläraudio, zukünftige Clips)
- Stil: Klare, ruhige, leicht maschinell wirkende Stimme – passend zur Dualität von MA

## Konvertierungs-Referenz (EP04)

| | Original | Konvertiert |
|---|---|---|
| Größe | 110,7 MB | 54,9 MB |
| Bitrate | 258 kbps | 128 kbps |
| Format | ID3v2.3 | ID3v2.3 + Info-Header |
| Dauer | 60:00 | 59:58 (normal, MP3-Frame-Ungenauigkeit) |
