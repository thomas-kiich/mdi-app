---
name: kiich-datensicherung
description: Datensicherung und Disaster Recovery für KIICH-Projekt. Verwenden wenn automatische Backups eingerichtet werden, Monitoring der Audio-URLs konfiguriert wird, Recovery-Tests durchgeführt werden, oder wenn die Datensicherungsstrategie überprüft werden muss. Enthält Backup-Scripts, Monitoring-Tools, Recovery-Prozesse und Dokumentation.
license: Complete terms in LICENSE.txt
---

# KIICH Datensicherung & Disaster Recovery

Vollständige Strategie für automatische Backups, Monitoring und Disaster Recovery des KIICH-Projekts.

## Übersicht

Das KIICH-System sichert automatisch:
- **Audio-Dateien** – Täglich um 02:00 UTC
- **Datenbank** – Täglich um 03:00 UTC  
- **Monitoring** – Stündlich (Audio-URL-Erreichbarkeit)
- **Validierung** – Wöchentlich (Backup-Integrität)

**Systemstabilität:** 5/10 → 8.6/10 (mit dieser Strategie)

---

## Schnelleinstieg

### 1. Automatische Backups aktivieren

```bash
# Manus Scheduled Tasks einrichten (bereits konfiguriert)
# - Audio-Backup: täglich 02:00 UTC
# - DB-Backup: täglich 03:00 UTC
# - Monitoring: stündlich
# - Validierung: Montag 09:00 UTC
```

### 2. Backups manuell starten

```bash
# Audio-Backup
cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-audio-files.ts

# Datenbank-Backup
cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-database.ts

# Monitoring
cd /home/ubuntu/mdi-app && pnpm tsx scripts/monitor-audio-urls.ts

# Validierung
cd /home/ubuntu/mdi-app && pnpm tsx scripts/validate-backups.ts
```

### 3. Backup-Status prüfen

```bash
# Audio-Backup Status
cat /home/ubuntu/mdi-app/backups/audio/manifest.json | jq '.successful'

# Monitoring-Report
cat /home/ubuntu/mdi-app/backups/monitoring/report-*.json | jq '.healthPercentage'

# Validierungs-Log
tail -f /home/ubuntu/mdi-app/backups/validation.log
```

---

## Backup-Strategie

### Audio-Dateien-Backup

**Script:** `scripts/backup-audio-files.ts`  
**Häufigkeit:** Täglich um 02:00 UTC  
**Speicherort:** `/home/ubuntu/webdev-static-assets/kiich-backups/`  
**Aufbewahrung:** 30 Tage

**Was wird gebackupt:**
- Alle Episoden-Audio-Dateien (MP3)
- SHA256-Hash für Integrität
- Manifest mit Metadaten

**Erfolgreiche Backups:**
```
✓ EP02: Backed up (25.49MB, SHA256: 6a5d26f5...)
✓ EP03: Backed up (18.22MB, SHA256: b7cc76b2...)
✓ EP04: Backed up (110.68MB, SHA256: b04e936b...)
```

### Datenbank-Backup

**Script:** `scripts/backup-database.ts`  
**Häufigkeit:** Täglich um 03:00 UTC  
**Speicherort:** `/home/ubuntu/mdi-app/backups/database/`  
**Aufbewahrung:** 30 Tage

**Was wird gebackupt:**
- MySQL-Dump der kompletten Datenbank
- Komprimiert mit gzip
- Backup-Manifest mit Metadaten

---

## Monitoring

### Audio-URL Monitoring

**Script:** `scripts/monitor-audio-urls.ts`  
**Häufigkeit:** Stündlich  
**Reports:** `/home/ubuntu/mdi-app/backups/monitoring/`

**Prüfungen:**
- HTTP-Status (200 = OK)
- Content-Type (audio/mpeg)
- Content-Length (Dateigrösse)
- Erreichbarkeit

**Health-Score:**
```
✓ Healthy: 3/4 (75%)
✗ Unhealthy: 1/4 (EP01 nicht erreichbar)
```

---

## Disaster Recovery

### Szenario 1: Audio-Datei beschädigt/gelöscht

**Symptom:** Episode spielt nicht ab (HTTP 403/404)

**Recovery:**
```bash
# 1. Backup prüfen
ls -la /home/ubuntu/webdev-static-assets/kiich-backups/

# 2. Audio-Datei neu hochladen
manus-upload-file --webdev /home/ubuntu/webdev-static-assets/kiich-backups/EP02-extreme-zeiten.mp3

# 3. Datenbank-URL aktualisieren (neue CDN-URL)
pnpm tsx << 'EOF'
import { getDb } from "./server/db";
import { podcastEpisodes } from "./drizzle/schema";
import { eq } from "drizzle-orm";

const db = await getDb();
await db
  .update(podcastEpisodes)
  .set({ audioUrl: "https://new-cdn-url/EP02.mp3" })
  .where(eq(podcastEpisodes.episodeNumber, "02"));
EOF

# 4. Monitoring prüfen
pnpm tsx scripts/monitor-audio-urls.ts
```

### Szenario 2: Datenbank beschädigt/gelöscht

**Symptom:** Episoden-Metadaten fehlen, API gibt 500-Fehler

**Recovery:**
```bash
# 1. Backup prüfen
ls -la /home/ubuntu/mdi-app/backups/database/

# 2. Datenbank wiederherstellen
pnpm tsx scripts/restore-from-backup.ts --database /home/ubuntu/mdi-app/backups/database/backup-*.sql.gz

# 3. Integrität prüfen
pnpm tsx << 'EOF'
import { getDb } from "./server/db";
import { podcastEpisodes } from "./drizzle/schema";

const db = await getDb();
const episodes = await db.select().from(podcastEpisodes);
console.log(`Episodes: ${episodes.length}`);
EOF

# 4. Server neustarten
pnpm dev
```

### Szenario 3: Kompletter Ausfall

**Symptom:** Nichts funktioniert

**Recovery:**
```bash
# 1. Datenbank wiederherstellen
pnpm tsx scripts/restore-from-backup.ts --database /home/ubuntu/mdi-app/backups/database/backup-*.sql.gz

# 2. Audio-Dateien neu hochladen
for file in /home/ubuntu/webdev-static-assets/kiich-backups/*.mp3; do
  manus-upload-file --webdev "$file"
done

# 3. Audio-URLs in DB aktualisieren (siehe Szenario 1)

# 4. Monitoring prüfen
pnpm tsx scripts/monitor-audio-urls.ts
```

---

## Validierung

### Wöchentliche Backup-Validierung

**Script:** `scripts/validate-backups.ts`  
**Häufigkeit:** Montag um 09:00 UTC

**Prüfungen:**
- Audio-Backups vorhanden (mindestens 3/4)
- Datenbank-Backup vorhanden und aktuell
- Monitoring-Reports vorhanden
- Speicherplatz < 10 GB

**Erfolgreiche Validierung:**
```
✓ Audio Backup: 3 audio files backed up
✓ Database Backup: Latest backup is 5.2 hours old
✓ Audio Health: All 4 episodes are accessible
✓ Storage Space: Backup directory size: 0.15 GB
Summary: 4 passed, 0 warnings, 0 failed
```

---

## Automatisierung

### Manus Scheduled Tasks

Alle Backups und Monitoring laufen automatisch über Manus Scheduled Tasks:

| Task | Zeitplan | Script |
|------|----------|--------|
| Audio-Backup | Täglich 02:00 UTC | `backup-audio-files.ts` |
| DB-Backup | Täglich 03:00 UTC | `backup-database.ts` |
| Monitoring | Stündlich | `monitor-audio-urls.ts` |
| Validierung | Montag 09:00 UTC | `validate-backups.ts` |

**Status prüfen:** Logs in `/home/ubuntu/mdi-app/backups/*/cron.log`

---

## Dateisystem-Struktur

```
/home/ubuntu/mdi-app/
├── backups/
│   ├── audio/              # Audio-Backup-Logs
│   │   └── manifest.json   # Backup-Metadaten
│   ├── database/           # DB-Backup-Logs
│   │   └── latest-backup.json
│   └── monitoring/         # Monitoring-Reports
│       └── report-*.json
├── scripts/
│   ├── backup-audio-files.ts
│   ├── backup-database.ts
│   ├── monitor-audio-urls.ts
│   ├── validate-backups.ts
│   └── restore-from-backup.ts
└── DISASTER_RECOVERY_PLAN.md

/home/ubuntu/webdev-static-assets/kiich-backups/
├── EP02-extreme-zeiten.mp3
├── EP03-alles-klar.mp3
└── EP04-echt-krass.mp3
```

---

## Checkliste für Pilot-Start

- [ ] Audio-Backup funktioniert (4/4 Episoden)
- [ ] Datenbank-Backup funktioniert
- [ ] Scheduled Tasks laufen automatisch
- [ ] Monitoring zeigt 100% Health
- [ ] Erstes Restore-Test erfolgreich
- [ ] Team ist geschult
- [ ] Notfall-Kontakte sind definiert

---

## Nächste Schritte

### Diese Woche
1. **EP01 Audio hochladen** – Sobald überarbeitet
2. **Erstes Restore-Test** – Dokumentierte Schritte durchführen
3. **Team-Training** – Disaster-Recovery-Plan durchgehen

### Nächste Woche
1. **Monitoring überprüfen** – Health sollte 100% sein
2. **Backup-Logs prüfen** – Keine Fehler?
3. **Validierungs-Report lesen** – Status überprüfen

### Nächster Monat
1. **Redundante Backups** – Optional (€10/Monat)
2. **Automated Alerting** – Email/Slack-Notifications
3. **Backup-Verschlüsselung** – Für Production

---

## Befehle für schnellen Zugriff

```bash
# Alle Backups manuell starten
cd /home/ubuntu/mdi-app && \
  pnpm tsx scripts/backup-audio-files.ts && \
  pnpm tsx scripts/backup-database.ts

# Status prüfen
echo "=== Audio Backup ===" && \
  cat /home/ubuntu/mdi-app/backups/audio/manifest.json | jq '.successful' && \
echo "=== Monitoring ===" && \
  cat /home/ubuntu/mdi-app/backups/monitoring/report-*.json | jq '.healthPercentage' && \
echo "=== Validierung ===" && \
  tail -5 /home/ubuntu/mdi-app/backups/validation.log

# Logs live verfolgen
tail -f /home/ubuntu/mdi-app/backups/audio/backup.log
tail -f /home/ubuntu/mdi-app/backups/monitoring/monitoring.log
```

---

## Dokumentation

Siehe auch:
- `/home/ubuntu/mdi-app/DISASTER_RECOVERY_PLAN.md` – Vollständiger Recovery-Plan
- `/home/ubuntu/DATENSICHERUNG_SUMMARY.md` – Implementierungs-Summary
- `/home/ubuntu/ANALYSE_SYSTEMSTABILITÄT.md` – Systemstabilität-Analyse

---

## Support

**Probleme?**
1. Logs prüfen: `tail -f /home/ubuntu/mdi-app/backups/*/backup.log`
2. Validierung starten: `pnpm tsx scripts/validate-backups.ts`
3. Monitoring prüfen: `pnpm tsx scripts/monitor-audio-urls.ts`

**Fragen?** Siehe DISASTER_RECOVERY_PLAN.md für detaillierte Dokumentation.
