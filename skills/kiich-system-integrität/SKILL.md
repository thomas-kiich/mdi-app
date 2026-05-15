---
name: kiich-system-integrität
description: Übergeordnete Architektur für Integrität, Funktionsfähigkeit und Stabilität des KIICH-Systems. Verwenden bei System-Problemen, Dateninkonsistenzen, Performance-Issues, Sicherheitslücken oder wenn die Gesamtstabilität überprüft werden muss. Koordiniert Backups, Monitoring, Validierung und Disaster Recovery.
license: Complete terms in LICENSE.txt
---

# KIICH System-Integrität & Stabilität

Übergeordnete Architektur für die Gewährleistung von Funktionsfähigkeit, Datenintegrität und Stabilität des KIICH-Systems. Koordiniert alle Sicherheits-, Backup- und Monitoring-Prozesse.

## System-Architektur

```
┌─────────────────────────────────────────────────────────────┐
│           KIICH System-Integrität (Überordner)              │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Datenintegrität │  │  Verfügbarkeit   │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ • Podcast-Eps    │  │ • Monitoring     │                │
│  │ • Nutzer-Daten   │  │ • Health-Checks  │                │
│  │ • Validierung    │  │ • Alerts         │                │
│  └──────────────────┘  └──────────────────┘                │
│           ↓                      ↓                          │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │  Datensicherung  │  │  Stabilität      │                │
│  ├──────────────────┤  ├──────────────────┤                │
│  │ • Backups        │  │ • Performance    │                │
│  │ • Recovery       │  │ • Governance     │                │
│  │ • Audit-Logs     │  │ • Compliance     │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Komponenten & Zuständigkeiten

### 1. Datenintegrität (kiich-podcast-integrität)

**Fokus:** Konsistenz und Korrektheit der Podcast-Episode-Datenbank

**Komponenten:**
- Backend-Validierung: Verhindert mehrere `isLatest: true`
- Monitoring-Job: Tägliche Integrität-Checks
- Frontend-Fehlerbehandlung: Defensive Programmierung
- Test-Suite: 12 Tests für Datenbank-Konsistenz

**Metriken:**
- isLatest-Count: Expected 1
- Total Episodes: Expected >= 5
- Valid Audio URLs: Expected 100%
- Unique Episode Numbers: Expected 1:1 mapping

**Trigger:** Wenn neue Episodes hinzugefügt werden, Fehler auftreten oder Dateninkonsistenzen verdächtigt werden.

### 2. Datensicherung (kiich-datensicherung)

**Fokus:** Backup, Recovery und Disaster-Management

**Komponenten:**
- Audio-Backup-Script: Sichert alle Episode-Audio-Dateien
- Datenbank-Backup: Tägliche SQL-Dumps
- Monitoring: Überprüft Backup-Integrität
- Recovery-Plan: Dokumentierte Wiederherstellungsschritte

**Metriken:**
- Backup-Erfolgsrate: Expected 100%
- Backup-Alter: Expected < 24h
- Recovery-Zeit (RTO): < 2h
- Recovery-Punkt (RPO): < 1h

**Trigger:** Wenn Backups konfiguriert werden, Disaster-Szenarien getestet werden oder Daten verloren gehen.

### 3. Verfügbarkeit & Monitoring (kiich-stabilitaets-governance)

**Fokus:** System-Uptime, Performance und Health-Checks

**Komponenten:**
- Health-Check-Endpunkte: `/health`, `/api/health`
- Monitoring-Dashboard: Real-time Metriken
- Alert-System: Benachrichtigungen bei Problemen
- Incident-Response: Eskalation und Remediation

**Metriken:**
- Uptime: Expected > 99.5%
- Response-Zeit: Expected < 200ms
- Error-Rate: Expected < 0.1%
- CPU/Memory: Expected < 80%

**Trigger:** Bei Performance-Problemen, Ausfällen oder wenn die Systemstabilität überprüft werden muss.

### 4. Stabilität & Governance (kiich-stabilitaets-governance)

**Fokus:** Langfristige Systemstabilität und Compliance

**Komponenten:**
- Change-Management: Kontrollierte Deployments
- Version-Control: Git-basierte Versionierung
- Compliance-Checks: DSGVO, Sicherheitsstandards
- Performance-Baselines: Historische Metriken

**Metriken:**
- Deployment-Häufigkeit: Expected 1-2x pro Woche
- Change-Failure-Rate: Expected < 10%
- MTTR (Mean Time To Recover): Expected < 30min
- Compliance-Score: Expected 100%

**Trigger:** Bei größeren Änderungen, Deployments oder regelmäßigen Compliance-Audits.

## Integrations-Matrix

| Komponente | Abhängigkeiten | Outputs | Frequenz |
|------------|-----------------|---------|----------|
| **Podcast-Integrität** | DB, Monitoring | Alerts, Logs | Täglich |
| **Datensicherung** | DB, Storage | Backups, Reports | Täglich |
| **Monitoring** | Alle Services | Metriken, Alerts | Real-time |
| **Governance** | Git, Logs | Reports, Compliance | Wöchentlich |

## Workflow: System-Health überprüfen

### 1. Schnelle Diagnose (5 Min)

```bash
# Health-Check
curl https://kiich.de/api/health

# Podcast-Integrität
curl https://kiich.de/api/trpc/podcastEpisodes.validateIntegrity

# Datenbank-Status
pnpm test server/routers/podcastEpisodes.test.ts
```

### 2. Detaillierte Analyse (15 Min)

```bash
# Logs überprüfen
tail -100 .manus-logs/devserver.log

# Monitoring-Metriken
curl https://kiich.de/api/metrics

# Backup-Status
ls -lh /home/ubuntu/webdev-static-assets/kiich-backups/
```

### 3. Vollständige Validierung (30 Min)

```bash
# Alle Tests ausführen
pnpm test

# Backup-Integrität prüfen
bash server/jobs/validateBackups.sh

# Recovery-Test durchführen
bash server/jobs/testRecovery.sh
```

## Häufige Szenarien & Lösungen

### Szenario 1: Episode verschwindet

**Symptome:** Episode ist in Datenbank, aber nicht auf Homepage sichtbar

**Diagnose:**
1. Prüfe `isLatest`-Count: `curl https://kiich.de/api/trpc/podcastEpisodes.validateIntegrity`
2. Überprüfe Frontend-Logik: `usePodcastValidation()`
3. Schaue Logs an: `grep -i podcast .manus-logs/devserver.log`

**Lösung:**
- Backend-Validierung korrigiert automatisch mehrere `isLatest: true`
- Frontend zeigt Fehler-Toast
- Monitoring sendet Alert

**Referenz:** `kiich-podcast-integrität`

### Szenario 2: Datenbank-Fehler

**Symptome:** Fehler beim Zugriff auf Episodes oder Nutzer-Daten

**Diagnose:**
1. Überprüfe DB-Verbindung: `echo "SELECT 1" | mysql ...`
2. Prüfe Backup-Status: `ls -lh /backups/`
3. Überprüfe Logs: `grep ERROR .manus-logs/`

**Lösung:**
- Starte DB-Verbindung neu
- Stelle aus Backup wieder her (falls nötig)
- Führe Validierung durch

**Referenz:** `kiich-datensicherung`

### Szenario 3: System langsam

**Symptome:** Hohe Response-Zeiten, CPU-Auslastung

**Diagnose:**
1. Überprüfe Metriken: `curl https://kiich.de/api/metrics`
2. Prüfe Logs auf Errors: `grep -i error .manus-logs/`
3. Überprüfe Datenbank-Queries: `SHOW PROCESSLIST`

**Lösung:**
- Optimiere Queries
- Skaliere Ressourcen
- Implementiere Caching

**Referenz:** `kiich-stabilitaets-governance`

### Szenario 4: Sicherheitslücke

**Symptome:** Unbefugter Zugriff, Datenleck, Compliance-Verstoß

**Diagnose:**
1. Überprüfe Audit-Logs
2. Prüfe Zugriffs-Kontrollen
3. Überprüfe Daten-Verschlüsselung

**Lösung:**
- Aktiviere Sicherheits-Patches
- Rotiere Credentials
- Überprüfe DSGVO-Compliance

**Referenz:** `kiich-datensicherung`, `kiich-stabilitaets-governance`

## Checkliste: System-Audit (Monatlich)

- [ ] Alle Tests ausführen: `pnpm test`
- [ ] Podcast-Integrität prüfen: `validateIntegrity`
- [ ] Backup-Integrität validieren: `validateBackups.sh`
- [ ] Recovery-Test durchführen: `testRecovery.sh`
- [ ] Logs überprüfen auf Fehler
- [ ] Performance-Metriken überprüfen
- [ ] Compliance-Audit durchführen
- [ ] Dokumentation aktualisieren
- [ ] Team-Schulung durchführen (falls nötig)

## Deployment-Checkliste

- [x] Podcast-Integrität implementiert
- [x] Datensicherung konfiguriert
- [x] Monitoring-System aufgebaut
- [x] Governance-Prozesse dokumentiert
- [ ] Cron-Jobs für automatisierte Checks
- [ ] Alert-System mit Slack/Email
- [ ] Dashboard für Metriken
- [ ] Team-Dokumentation & Training

## Weitere Ressourcen

Siehe `references/` für:
- **integration-matrix.md** - Detaillierte Abhängigkeiten zwischen Komponenten
- **incident-response.md** - Eskalations- und Remediation-Prozesse
- **compliance-checklist.md** - DSGVO und Sicherheitsstandards
- **performance-baselines.md** - Historische Metriken und Benchmarks

## Verwandte Skills

- **kiich-podcast-integrität** - Datenbank-Konsistenz für Episodes
- **kiich-datensicherung** - Backup & Disaster Recovery
- **kiich-stabilitaets-governance** - Performance & Compliance
- **kiich-architektur** - Technische Systemarchitektur
- **kiich-agenten-team** - Automatisierte Überwachung durch Agenten

## Support & Kontakt

Bei System-Problemen:
1. Führe Quick-Diagnose durch (siehe oben)
2. Konsultiere relevanten Sub-Skill
3. Überprüfe Logs und Metriken
4. Kontaktiere DevOps-Team bei kritischen Issues
