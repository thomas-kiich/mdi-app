# KIICH Incident Response & Remediation

## Incident-Klassifizierung

### Severity Level 1 (Kritisch - Sofort)
- System nicht verfügbar (Uptime < 99%)
- Datenverlust oder Datenbeschädigung
- Sicherheitslücke
- Mehrere `isLatest: true` in Datenbank

**Response-Zeit:** < 5 Min
**Eskalation:** Sofort an Owner + DevOps

### Severity Level 2 (Hoch - Dringend)
- Performance-Degradation (Response-Zeit > 500ms)
- Backup-Fehler (> 48h alt)
- Einzelne Feature nicht funktionsfähig
- Compliance-Verstoß erkannt

**Response-Zeit:** < 15 Min
**Eskalation:** Owner + Monitoring-Team

### Severity Level 3 (Mittel - Normal)
- Minor Performance-Issues (Response-Zeit 200-500ms)
- Einzelne Tests schlagen fehl
- Dokumentation veraltet
- Nicht-kritische Fehler in Logs

**Response-Zeit:** < 1 Stunde
**Eskalation:** Monitoring-Team

### Severity Level 4 (Niedrig - Geplant)
- Informationen für Audits
- Performance-Baselines aktualisieren
- Dokumentation verbessern
- Proaktive Optimierungen

**Response-Zeit:** < 1 Woche
**Eskalation:** Keine (Backlog)

## Incident-Response-Prozess

### Phase 1: Erkennung (Detection)

**Automatisch:**
- Monitoring-Job erkennt Fehler
- Alert-System sendet Benachrichtigung
- Logs werden gesammelt

**Manuell:**
- User meldet Problem
- Owner überprüft System
- Team entdeckt Issue

**Aktion:**
```bash
# Severity bestimmen
1. Überprüfe Symptome
2. Prüfe Logs: tail -100 .manus-logs/devserver.log
3. Führe Health-Check durch: curl https://kiich.de/api/health
4. Bestimme Severity Level (1-4)
```

### Phase 2: Triage (Assessment)

**Für Severity 1-2:**

```bash
# 1. Schnelle Diagnose
curl https://kiich.de/api/health
curl https://kiich.de/api/metrics
curl https://kiich.de/api/trpc/podcastEpisodes.validateIntegrity

# 2. Logs überprüfen
grep -i "error\|failed\|exception" .manus-logs/devserver.log | tail -50

# 3. Datenbank-Status
echo "SELECT COUNT(*) as latest FROM podcast_episodes WHERE isLatest=true;" | mysql ...

# 4. Backup-Status
ls -lh /backups/
```

**Dokumentation:**
```markdown
## Incident Report

**Time:** 2026-05-01 08:15 UTC
**Severity:** 1 (Kritisch)
**Status:** Investigating

### Symptoms
- Episode 04 nicht sichtbar
- Multiple isLatest=true in DB

### Root Cause
- Datenbank-Inkonsistenz

### Impact
- 1 Episode betroffen
- Users können EP04 nicht finden

### Actions Taken
- Backend-Validierung aktiviert
- Datenbank korrigiert
- Tests durchgeführt
```

### Phase 3: Mitigation (Sofortmaßnahmen)

**Für Severity 1:**

```bash
# 1. Sofort-Fix anwenden
# Beispiel: Mehrere isLatest=true
UPDATE podcast_episodes SET isLatest=false WHERE episodeNumber != '05';
UPDATE podcast_episodes SET isLatest=true WHERE episodeNumber = '05';

# 2. Validierung durchführen
pnpm test server/routers/podcastEpisodes.test.ts

# 3. Monitoring-Check
curl https://kiich.de/api/trpc/podcastEpisodes.validateIntegrity

# 4. User-Impact minimieren
# - Benachrichtige Users (falls nötig)
# - Starte Frontend-Refresh
# - Monitore für Regressions
```

**Kommunikation:**
```
TO: thomas@kiich.de
SUBJECT: Incident #001 - Episode 04 Missing [RESOLVED]

Status: RESOLVED

Issue: Episode 04 was missing from homepage due to database inconsistency.
Root Cause: Multiple episodes marked as isLatest=true.
Fix Applied: Backend validation corrected the data.
Validation: All 12 tests passed.

No user action required. The issue is now resolved.
```

### Phase 4: Recovery (Wiederherstellung)

**Für Severity 1 (Datenverlust):**

```bash
# 1. Backup identifizieren
ls -lh /backups/podcast_episodes_*.sql | tail -5

# 2. Backup-Integrität prüfen
md5sum /backups/podcast_episodes_20260501_020000.sql

# 3. Datenbank wiederherstellen
mysql -h $DB_HOST -u $DB_USER -p$DB_PASS mdi_app < /backups/podcast_episodes_20260501_020000.sql

# 4. Validierung durchführen
pnpm test server/routers/podcastEpisodes.test.ts

# 5. Monitoring-Check
curl https://kiich.de/api/trpc/podcastEpisodes.validateIntegrity

# 6. Frontend-Refresh
# - Cache clearen
# - Page reload
# - Verify data
```

**Dokumentation:**
```markdown
## Recovery Report

**Incident:** #001 - Episode 04 Missing
**Recovery Time:** 15 minutes
**Data Loss:** None
**Backup Used:** podcast_episodes_20260501_020000.sql

### Steps Taken
1. Identified backup from 02:00 UTC
2. Verified backup integrity (MD5 checksum)
3. Restored database
4. Ran validation tests (12/12 passed)
5. Monitored for 30 minutes (no issues)

### Verification
- ✓ All episodes present
- ✓ isLatest-count = 1
- ✓ Audio URLs valid
- ✓ Tests passed

### Follow-up
- [ ] Root cause analysis
- [ ] Process improvement
- [ ] Team debrief
```

### Phase 5: Post-Incident (Nachbereitung)

**Für alle Severity Levels:**

```bash
# 1. Root Cause Analysis (RCA)
# - Warum ist das passiert?
# - Hätte es verhindert werden können?
# - Welche Prozesse müssen verbessert werden?

# 2. Lessons Learned
# - Was haben wir gelernt?
# - Wie können wir es besser machen?
# - Welche Trainings sind nötig?

# 3. Preventive Measures
# - Implementiere Verbesserungen
# - Aktualisiere Dokumentation
# - Schule Team

# 4. Monitoring Improvement
# - Verbessere Alerts
# - Erhöhe Test-Coverage
# - Optimiere Detection-Zeit
```

**RCA-Template:**

```markdown
## Root Cause Analysis - Incident #001

### What Happened?
Episode 04 disappeared from homepage because both EP04 and EP05 were marked as isLatest=true.

### Why Did It Happen?
1. No database constraint on isLatest column
2. Backend validation was missing
3. Manual database update bypassed validation

### Contributing Factors
- No automated integrity checks
- Limited test coverage
- No monitoring for this scenario

### Root Cause
Lack of data integrity validation at database and application level.

### Preventive Measures
1. ✓ Implemented backend validation (create/update)
2. ✓ Added monitoring job (daily)
3. ✓ Added frontend error handling
4. ✓ Added test suite (12 tests)
5. [ ] Add database constraints (TiDB limitation)
6. [ ] Implement cron job for daily checks
7. [ ] Add admin UI for episode management

### Timeline
- 08:00 UTC: EP05 created with isLatest=true
- 08:15 UTC: User reports EP04 missing
- 08:20 UTC: Issue identified
- 08:25 UTC: Fix applied
- 08:30 UTC: Validation passed
- 08:45 UTC: RCA completed

### Lessons Learned
- Always validate data integrity at multiple levels
- Implement monitoring for critical data
- Document and test recovery procedures
- Regular audits catch issues early
```

## Remediation Playbooks

### Playbook 1: Episode Missing

**Symptoms:**
- Episode not visible on homepage
- Episode exists in database
- isLatest-count != 1

**Steps:**
```bash
1. Identify affected episodes
   SELECT * FROM podcast_episodes WHERE isLatest=true;

2. Determine which should be latest
   SELECT * FROM podcast_episodes ORDER BY sortOrder DESC LIMIT 1;

3. Fix data
   UPDATE podcast_episodes SET isLatest=false WHERE isLatest=true;
   UPDATE podcast_episodes SET isLatest=true WHERE episodeNumber='05';

4. Validate
   pnpm test server/routers/podcastEpisodes.test.ts

5. Verify frontend
   curl https://kiich.de/api/trpc/podcastEpisodes.list
```

### Playbook 2: Backup Failed

**Symptoms:**
- Backup-Fehler in Logs
- Backup-Alter > 48h
- Alert von Monitoring-Job

**Steps:**
```bash
1. Check backup status
   ls -lh /backups/

2. Check logs
   grep -i backup .manus-logs/devserver.log | tail -20

3. Verify database
   mysql -h $DB_HOST -u $DB_USER -p$DB_PASS -e "SELECT COUNT(*) FROM podcast_episodes;"

4. Manual backup
   mysqldump -h $DB_HOST -u $DB_USER -p$DB_PASS mdi_app podcast_episodes > /backups/manual_backup_$(date +%s).sql

5. Verify backup
   md5sum /backups/manual_backup_*.sql
```

### Playbook 3: Performance Degradation

**Symptoms:**
- API Response-Zeit > 500ms
- High CPU/Memory usage
- Slow database queries

**Steps:**
```bash
1. Check metrics
   curl https://kiich.de/api/metrics

2. Check database
   SHOW PROCESSLIST;
   SHOW ENGINE INNODB STATUS;

3. Identify slow queries
   SELECT * FROM mysql.slow_log ORDER BY query_time DESC LIMIT 10;

4. Optimize queries
   - Add indexes
   - Optimize query logic
   - Implement caching

5. Monitor improvement
   curl https://kiich.de/api/metrics (repeat)
```

### Playbook 4: Security Issue

**Symptoms:**
- Unauthorized access detected
- Data leak suspected
- Compliance violation

**Steps:**
```bash
1. Isolate system
   - Stop public access (if critical)
   - Enable read-only mode

2. Investigate
   - Check audit logs
   - Review access patterns
   - Identify compromised data

3. Remediate
   - Rotate credentials
   - Patch vulnerability
   - Reset affected data

4. Verify
   - Run security tests
   - Verify compliance
   - Monitor for recurrence
```

## Escalation Matrix

| Severity | Response Time | Owner | DevOps | Team | Action |
|----------|---------------|-------|--------|------|--------|
| 1 | < 5 min | ✓ | ✓ | ✓ | Immediate fix + RCA |
| 2 | < 15 min | ✓ | ✓ | - | Fix + monitoring |
| 3 | < 1 hour | ✓ | - | - | Investigate + plan |
| 4 | < 1 week | - | - | - | Backlog item |

## Communication Templates

### Critical Incident (Severity 1)

```
SUBJECT: CRITICAL - KIICH System Issue [Incident #XXX]

Status: INVESTIGATING / IN PROGRESS / RESOLVED

Issue: [Brief description]
Impact: [Who/what is affected]
ETA: [Estimated time to resolution]

Updates:
- 08:15 UTC: Issue detected
- 08:20 UTC: Investigating
- 08:30 UTC: Fix in progress
- 08:45 UTC: RESOLVED

No action required from users. We're working on it.
```

### Post-Incident (All Levels)

```
SUBJECT: Incident #XXX - Post-Mortem Report

Incident: [Description]
Duration: [Start - End time]
Impact: [Affected users/systems]

Root Cause: [What caused the issue]
Resolution: [How it was fixed]
Prevention: [How we prevent it next time]

Lessons Learned:
- [Learning 1]
- [Learning 2]

Follow-up Actions:
- [ ] Action 1 (Owner: X, Due: Date)
- [ ] Action 2 (Owner: Y, Due: Date)
```

## Tools & Resources

- **Logs:** `.manus-logs/devserver.log`
- **Backups:** `/backups/`
- **Monitoring:** `https://kiich.de/api/metrics`
- **Health Check:** `https://kiich.de/api/health`
- **Validation:** `/api/trpc/podcastEpisodes.validateIntegrity`
- **Tests:** `pnpm test server/routers/podcastEpisodes.test.ts`
