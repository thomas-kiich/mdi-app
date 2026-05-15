# Skills Synchronisation Setup

Alle KIICH Skills werden automatisch zu GitHub synchronisiert für Versionskontrolle und Backup.

## Struktur

```
mdi-app/
├── skills/                          # Alle KIICH Skills (synchronisiert)
│   ├── kiich-abo-monetarisierung/
│   ├── kiich-agenten-team/
│   ├── kiich-architektur/
│   ├── kiich-audio-deployment/
│   ├── kiich-content-stimme/
│   ├── kiich-datenschutz/
│   ├── kiich-datensicherung/
│   ├── kiich-design-system/
│   ├── kiich-newsletter-workflow/
│   ├── kiich-projekte/
│   ├── kiich-schreibstil/
│   ├── kiich-system-integrität/
│   ├── automation-and-scheduling/
│   ├── manus-api/
│   ├── manus-config/
│   ├── music-prompter/
│   └── persistent-computing/
└── scripts/
    ├── sync-to-github.mjs           # Allgemeines Sync-Script
    └── sync-skills-to-github.mjs    # Skills-spezifisches Sync-Script
```

## Skills

Insgesamt **18 KIICH Skills** werden synchronisiert:

### KIICH-Spezifische Skills
- **kiich-abo-monetarisierung** – Abo-Modell, Preise, Feature-Gates
- **kiich-agenten-team** – Agenten-Team Strategie für Automatisierung
- **kiich-architektur** – Technische Architektur des KIICH-Projekts
- **kiich-audio-deployment** – Audio-Episode Deployment Workflow
- **kiich-content-stimme** – Content-Strategie und Tonalität
- **kiich-datenschutz** – Datenschutz- und Cookie-Dokumentation
- **kiich-datensicherung** – Backup und Disaster Recovery
- **kiich-design-system** – Design-System und visuelle Identität
- **kiich-newsletter-workflow** – Newsletter Workflow und Integration
- **kiich-projekte** – Alle KIICH-Projekte und Status
- **kiich-schreibstil** – Schreib-DNA von Thomas Chochola
- **kiich-system-integrität** – Übergeordnete System-Architektur

### Allgemeine Skills
- **automation-and-scheduling** – Automatisierung und Scheduling
- **manus-api** – Manus API Integration
- **manus-config** – Manus Konfiguration
- **music-prompter** – Music Generation Framework
- **persistent-computing** – Persistent Computing Solutions
- **skill-creator** – Guide für Skill-Erstellung

## Automatische Synchronisation

### Trigger
Skills werden automatisch synchronisiert wenn:
1. Ein Skill manuell bearbeitet wird
2. Ein neuer Skill erstellt wird
3. Ein Skill gelöscht wird

### Manuelles Pushen

```bash
# Alle Skills synchronisieren
node scripts/sync-skills-to-github.mjs

# Oder über das allgemeine Sync-Script
node scripts/sync-to-github.mjs "chore(skills): Skill-Änderungen"
```

### Commit Message Format

Skills-Commits folgen diesem Format:
```
chore(skills): Automatische Synchronisation aller Skills [YYYY-MM-DDTHH:MM:SSZ]
```

Beispiel:
```
chore(skills): Automatische Synchronisation aller Skills [2026-05-15T14:08:00Z]
```

## Workflow

1. **Skill bearbeiten** – In `/home/ubuntu/skills/` oder via Manus
2. **Sync triggern** – Automatisch oder manuell via Script
3. **GitHub Update** – Skills werden zu GitHub gepusht
4. **Versionskontrolle** – Alle Versionen auf GitHub verfügbar

## GitHub Repository

- **Repository:** https://github.com/thomas-kiich/mdi-app
- **Skills Ordner:** `/skills`
- **Commits:** Automatisch generiert mit Timestamps

## Sicherheit

⚠️ **Wichtig:**
- Skills sind im **Private Repository** gespeichert
- Nur du hast Zugriff auf die Skills
- Token wird in Manus Secrets gespeichert (nicht im Code)
- Keine sensiblen Daten in Skills speichern

## Monitoring

### Überprüfe letzten Sync
```bash
cd /home/ubuntu/mdi-app
git log --oneline skills/ | head -10
```

### Überprüfe Unterschiede
```bash
# Unterschiede zwischen lokal und GitHub
git diff origin/main skills/

# Unterschiede zwischen Quelle und Kopie
diff -r /home/ubuntu/skills /home/ubuntu/mdi-app/skills/
```

## Troubleshooting

### "Skills nicht synchronisiert"
- Überprüfe ob `/home/ubuntu/skills/` existiert
- Überprüfe GitHub Token in Manus Secrets
- Überprüfe Git Remote: `git remote -v`

### "Authentifizierung fehlgeschlagen"
- Token ist abgelaufen → Neuen Token generieren
- Token hat nicht die richtigen Scopes → Token erneuern

### "Merge Conflicts"
- Sollte nicht vorkommen da Skills nur von dir bearbeitet werden
- Falls trotzdem: `git merge --abort` und manuell auflösen

## Nächste Schritte

- [ ] Regelmäßig Skills überprüfen auf Konsistenz
- [ ] GitHub Actions Workflow für automatische Tests einrichten
- [ ] Dokumentation für neue Skills aktualisieren
- [ ] Backup-Strategie für Skills überprüfen

---

Letztes Update: 2026-05-15
