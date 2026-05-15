---
name: kiich-architektur
description: "Technische Architektur des KIICH-Projekts (mdi-app). Verwenden bei Datenbankschema-Aenderungen, neuen Server-Routen, Audio-Proxy-Problemen, CDN-Fragen oder wenn die Projektstruktur relevant ist."
---

# KIICH Architektur

## Projekt-Grunddaten

- **Projektname:** mdi-app
- **Pfad:** /home/ubuntu/mdi-app
- **Stack:** React 19 + Tailwind 4 + Express 4 + tRPC 11 + MySQL (TiDB)
- **Live-Domains:** kiich.manus.space, www.kiich.de
- **Dev-URL:** https://3000-i0je4p2175rqkt4zsgfqn-60466b2f.us2.manus.computer

## Audio-Architektur (WICHTIG)

### CDN-Direktzugriff (aktuelle Loesung)
Der audio-Tag laedt MP3-Dateien DIREKT vom CDN (d2xsxph8kpxj0f.cloudfront.net).
KEIN Proxy-Umweg fuer den initialen Load.

Warum: Der Live-Server hat ein Timeout beim Streamen grosser Dateien (55 MB) ohne Range-Header.

### Proxy (nur fuer Range-Requests)
GET /api/audio-proxy?url={cdnUrl} - fuer Seeking/Skip (Range-Header vorhanden)
HEAD /api/audio-proxy?url={cdnUrl} - antwortet mit 200 + Content-Length

### CDN
- URL-Schema: https://d2xsxph8kpxj0f.cloudfront.net/{filename}
- Content-Type: application/octet-stream (CDN-seitig nicht aenderbar)
- CORS: access-control-allow-origin: * (kein Problem)
- accept-ranges: bytes (Seeking funktioniert direkt)

### MP3-Konvertierung (IMMER vor Upload)
ffmpeg -y -i input.mp3 -codec:a libmp3lame -b:a 128k -id3v2_version 3 -write_xing 1 output.mp3
Wichtig: -write_xing 1 erzeugt den Info-Header fuer Browser-Daueranzeige

## Datenbankschema (Wichtigste Tabellen)

### podcast_episodes
- id, episodeNumber (z.B. 01), catchphrase, subtitle
- audioUrl (CDN-URL der MP3)
- coverImageUrl (CDN-URL des Covers)
- description, isLatest, sortOrder
- youtubeUrl, spotifyUrl

### newsletter_subscribers
- id, email, name, active, deleteToken
- createdAt, updatedAt

### users
- id, openId, name, email, role (admin|user)

### ritual_logs, dankbarkeit, ritualeEinstellungen
- Fuer das Befindlichkeitstraining

### training_freigaben
- categoryId, itemId, enabled, label
- Steuert welche Trainings sichtbar sind

## Build-Prozess (KRITISCH)

Vor jedem Publish MUSS pnpm build ausgefuehrt werden:
cd /home/ubuntu/mdi-app && pnpm build

Ohne Build wird der alte dist/index.js deployed!

## Server-Routen

- /api/trpc/* - tRPC-Endpunkte
- /api/audio-proxy - Audio-Proxy (Range-Requests)
- /api/oauth/callback - Manus OAuth
- Alle anderen Routen: React SPA

## TTS / MA-Stimme

- **Dienst:** Mistral Voxtral (ausschließlich!)
- **Admin-URL:** `/admin/tts`
- **NIEMALS:** ElevenLabs oder andere TTS-Dienste für MA-Stimme verwenden
- Generierte Audiodateien: auf CDN hochladen, URL in DB speichern

## Secrets (Env-Variablen)

| Variable | Verwendung |
|---|---|
| `DATABASE_URL` | MySQL/TiDB Verbindung |
| `BREVO_API_KEY` | Newsletter-Versand |
| `MISTRAL_API_KEY` | LLM + TTS (MA-Stimme via Voxtral) |
| `JWT_SECRET` | Session-Cookies |
| `BUILT_IN_FORGE_API_KEY` | Manus Built-in APIs |
| `VITE_APP_ID` | OAuth App-ID |

## Wichtige Dateien

- server/_core/index.ts - Express-Server + Audio-Proxy
- server/routers.ts - tRPC-Router (importiert Sub-Router)
- server/routers/newsletter.ts - Newsletter-Prozeduren
- drizzle/schema.ts - Datenbankschema
- client/src/App.tsx - Routing
- client/src/components/PodcastFeature.tsx - Audio-Player
- client/src/pages/AdminNewsletter.tsx - Newsletter-Agent
