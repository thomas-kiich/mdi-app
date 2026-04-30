# Disaster Recovery Plan – KIICH Projekt

**Version:** 1.0  
**Datum:** 30. April 2026  
**Status:** AKTIV

---

## 1. Übersicht

Dieses Dokument beschreibt die Disaster-Recovery-Strategie für das KIICH-Projekt. Es umfasst:

- **Automatische Backups** – Täglich für Datenbank und Audio-Dateien
- **Monitoring** – Stündlich für Audio-URL-Erreichbarkeit
- **Recovery-Prozesse** – Dokumentierte Schritte zur Wiederherstellung
- **Testing** – Regelmäßige Restore-Tests

---

## 2. Backup-Strategie

### 2.1 Audio-Dateien-Backup

**Häufigkeit:** Täglich um 02:00 UTC  
**Aufbewahrung:** 30 Tage  
**Speicherort:** `/home/ubuntu/mdi-app/backups/audio/`

**Prozess:**
```bash
pnpm tsx scripts/backup-audio-files.ts
```

**Was wird gesichert:**
- Alle Audio-Dateien aus den Podcast-Episoden
- SHA256-Hash für Integrität
- Manifest mit Metadaten

**Erfolgreiche Backups:**
- ✓ Dateien werden heruntergeladen
- ✓ SHA256-Hash wird berechnet
- ✓ Manifest wird erstellt
- ✓ Log wird geschrieben

**Fehlgeschlagene Backups:**
- ✗ Datei nicht erreichbar (HTTP 403/404)
- ✗ Timeout bei Download
- ✗ Speicherplatz voll

### 2.2 Datenbank-Backup

**Häufigkeit:** Täglich um 03:00 UTC  
**Aufbewahrung:** 30 Tage  
**Speicherort:** `/home/ubuntu/mdi-app/backups/database/`

**Prozess:**
```bash
pnpm tsx scripts/backup-database.ts
```

**Was wird gesichert:**
- Komplette MySQL-Datenbank
- Komprimiert mit gzip
- Backup-Manifest mit Metadaten

**Erfolgreiche Backups:**
- ✓ mysqldump wird erstellt
- ✓ Datei wird komprimiert
- ✓ Alte Backups werden gelöscht (>30 Tage)
- ✓ Manifest wird erstellt

---

## 3. Monitoring

### 3.1 Audio-URL Monitoring

**Häufigkeit:** Stündlich  
**Speicherort:** `/home/ubuntu/mdi-app/backups/monitoring/`

**Prozess:**
```bash
pnpm monitor:audio
```

**Was wird geprüft:**
- HTTP-Status (200 = OK, 403/404 = Fehler)
- Content-Type (audio/mpeg)
- Content-Length (Dateigröße)
- Erreichbarkeit

**Alerts:**
- ⚠️ ALERT wenn Health < 100%
- ⚠️ ALERT wenn Episode nicht erreichbar
- ⚠️ ALERT wenn URL fehlt

**Reports:**
- Täglich um 00:00 UTC
- Format: JSON
- Dateiname: `report-YYYY-MM-DD.json`

---

## 4. Recovery-Prozesse

### 4.1 Szenario: Audio-Datei beschädigt/gelöscht

**Symptom:** Episode spielt nicht ab (HTTP 403/404)

**Recovery-Schritte:**

1. **Backup prüfen:**
   ```bash
   ls -la /home/ubuntu/mdi-app/backups/audio/
   cat /home/ubuntu/mdi-app/backups/audio/manifest.json
   ```

2. **Backup-Integrität validieren:**
   ```bash
   sha256sum /home/ubuntu/mdi-app/backups/audio/EP02-extreme-zeiten.mp3
   # Vergleiche mit Manifest-Hash
   ```

3. **Audio-Datei neu hochladen:**
   ```bash
   manus-upload-file --webdev /home/ubuntu/mdi-app/backups/audio/EP02-extreme-zeiten.mp3
   ```

4. **Datenbank-URL aktualisieren:**
   ```bash
   pnpm tsx << 'EOF'
   import { getDb } from "./server/db";
   import { podcastEpisodes } from "./drizzle/schema";
   import { eq } from "drizzle-orm";
   
   const db = await getDb();
   await db
     .update(podcastEpisodes)
     .set({ audioUrl: "https://new-cdn-url/EP02.mp3" })
     .where(eq(podcastEpisodes.episodeNumber, "02"));
   
   console.log("Updated!");
   EOF
   ```

5. **Monitoring prüfen:**
   ```bash
   pnpm monitor:audio
   ```

**Erwartetes Ergebnis:** Episode spielt wieder ab, Health = 100%

---

### 4.2 Szenario: Datenbank beschädigt/gelöscht

**Symptom:** Episoden-Metadaten fehlen, API gibt 500-Fehler

**Recovery-Schritte:**

1. **Backup prüfen:**
   ```bash
   ls -la /home/ubuntu/mdi-app/backups/database/
   cat /home/ubuntu/mdi-app/backups/database/latest-backup.json
   ```

2. **Backup dekomprimieren (optional):**
   ```bash
   gunzip -c /home/ubuntu/mdi-app/backups/database/backup-2026-04-30T*.sql.gz > /tmp/restore.sql
   ```

3. **Datenbank wiederherstellen:**
   ```bash
   pnpm tsx scripts/restore-from-backup.ts --database /home/ubuntu/mdi-app/backups/database/backup-2026-04-30T*.sql.gz
   ```

4. **Integrität prüfen:**
   ```bash
   pnpm tsx << 'EOF'
   import { getDb } from "./server/db";
   import { podcastEpisodes } from "./drizzle/schema";
   
   const db = await getDb();
   const episodes = await db.select().from(podcastEpisodes);
   console.log(`Episodes in DB: ${episodes.length}`);
   episodes.forEach(ep => {
     console.log(`EP${ep.episodeNumber}: ${ep.catchphrase}`);
   });
   EOF
   ```

5. **Server neustarten:**
   ```bash
   pnpm dev
   ```

**Erwartetes Ergebnis:** Alle Episoden sind wieder in der Datenbank, API funktioniert

---

### 4.3 Szenario: Kompletter Systemausfall

**Symptom:** Nichts funktioniert, Datenbank und Audio-Dateien weg

**Recovery-Schritte:**

1. **Backups prüfen:**
   ```bash
   ls -la /home/ubuntu/mdi-app/backups/
   ```

2. **Datenbank wiederherstellen:**
   ```bash
   pnpm tsx scripts/restore-from-backup.ts --database /home/ubuntu/mdi-app/backups/database/backup-*.sql.gz
   ```

3. **Audio-Dateien wiederherstellen:**
   ```bash
   pnpm tsx scripts/restore-from-backup.ts --audio /home/ubuntu/mdi-app/backups/audio/
   ```

4. **Alle Audio-Dateien neu hochladen:**
   ```bash
   for file in /home/ubuntu/mdi-app/backups/audio/EP*.mp3; do
     manus-upload-file --webdev "$file"
   done
   ```

5. **Audio-URLs in DB aktualisieren** (siehe 4.1)

6. **Monitoring prüfen:**
   ```bash
   pnpm monitor:audio
   ```

**Erwartetes Ergebnis:** System ist vollständig wiederhergestellt

---

## 5. Testing & Validierung

### 5.1 Monatlicher Restore-Test

**Zeitplan:** Jeden ersten Sonntag des Monats um 10:00 UTC

**Prozess:**

1. **Test-Datenbank erstellen:**
   ```bash
   mysql -h localhost -u root -p -e "CREATE DATABASE kiich_test_restore;"
   ```

2. **Backup wiederherstellen:**
   ```bash
   pnpm tsx scripts/restore-from-backup.ts --database /home/ubuntu/mdi-app/backups/database/backup-*.sql.gz
   ```

3. **Daten validieren:**
   - [ ] Alle 4 Episoden sind in der DB
   - [ ] Alle Audio-URLs sind gespeichert
   - [ ] Keine Fehler in den Logs

4. **Test-Datenbank löschen:**
   ```bash
   mysql -h localhost -u root -p -e "DROP DATABASE kiich_test_restore;"
   ```

5. **Report erstellen:**
   - Datum: [YYYY-MM-DD]
   - Status: [PASSED/FAILED]
   - Notizen: [...]

---

### 5.2 Wöchentliche Backup-Validierung

**Zeitplan:** Jeden Montag um 09:00 UTC

**Prüfungen:**

```bash
# 1. Audio-Backup prüfen
ls -la /home/ubuntu/mdi-app/backups/audio/
cat /home/ubuntu/mdi-app/backups/audio/manifest.json | jq '.successful'

# 2. Datenbank-Backup prüfen
ls -la /home/ubuntu/mdi-app/backups/database/
cat /home/ubuntu/mdi-app/backups/database/latest-backup.json | jq '.fileSize'

# 3. Monitoring-Report prüfen
ls -la /home/ubuntu/mdi-app/backups/monitoring/
cat /home/ubuntu/mdi-app/backups/monitoring/report-*.json | jq '.healthPercentage'
```

---

## 6. Automatisierung

### 6.1 Cron-Jobs einrichten

**Datei:** `/etc/cron.d/kiich-backups`

```cron
# Audio-Backup täglich um 02:00 UTC
0 2 * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-audio-files.ts >> /home/ubuntu/mdi-app/backups/audio/cron.log 2>&1

# Datenbank-Backup täglich um 03:00 UTC
0 3 * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-database.ts >> /home/ubuntu/mdi-app/backups/database/cron.log 2>&1

# Monitoring stündlich
0 * * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/monitor-audio-urls.ts >> /home/ubuntu/mdi-app/backups/monitoring/cron.log 2>&1

# Monatlicher Restore-Test (1. Sonntag um 10:00 UTC)
0 10 * * 0 cd /home/ubuntu/mdi-app && pnpm tsx scripts/test-restore.ts >> /home/ubuntu/mdi-app/backups/restore-test.log 2>&1
```

### 6.2 Cron-Jobs installieren

```bash
sudo tee /etc/cron.d/kiich-backups > /dev/null << 'EOF'
0 2 * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-audio-files.ts
0 3 * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/backup-database.ts
0 * * * * cd /home/ubuntu/mdi-app && pnpm tsx scripts/monitor-audio-urls.ts
EOF

sudo systemctl restart cron
```

---

## 7. Kontakt & Eskalation

### 7.1 Notfall-Kontakt

- **Primär:** Thomas Chochola
- **Backup:** [TBD]
- **Notfall-Hotline:** [TBD]

### 7.2 Eskalations-Matrix

| Problem | Schweregrad | Reaktionszeit | Kontakt |
|---------|-------------|---------------|---------|
| Audio-URL nicht erreichbar | HOCH | 1 Stunde | Thomas |
| Datenbank-Fehler | KRITISCH | 15 Min | Thomas + Backup |
| Kompletter Ausfall | KRITISCH | 5 Min | Sofort eskalieren |

---

## 8. Checkliste für Go-Live

Vor der Markteinführung müssen folgende Punkte erfüllt sein:

- [ ] Audio-Backup-Script funktioniert (3/4 Episoden erfolgreich)
- [ ] Datenbank-Backup-Script funktioniert
- [ ] Monitoring-Script funktioniert
- [ ] Restore-Script funktioniert
- [ ] Cron-Jobs sind installiert
- [ ] Wöchentliche Validierung läuft
- [ ] Monatlicher Restore-Test läuft
- [ ] Dokumentation ist vollständig
- [ ] Team ist geschult
- [ ] Notfall-Kontakte sind definiert

---

## 9. Kontakt & Support

**Fragen?** Siehe `/home/ubuntu/mdi-app/DATENSICHERUNG_FAQ.md`

**Probleme?** Siehe `/home/ubuntu/mdi-app/TROUBLESHOOTING.md`
