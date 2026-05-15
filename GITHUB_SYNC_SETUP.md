# GitHub Synchronisation Setup

Dieses Projekt ist mit GitHub verbunden für automatische Versionskontrolle und Backup.

## Konfiguration

### Git Remotes
- **origin** (Manus S3): Primärer Speicher für Manus Checkpoints
- **github** (GitHub): Sekundärer Speicher für Versionskontrolle und Backup

### GitHub Account
- **Username:** thomas-kiich
- **Repository:** mdi-app
- **Visibility:** Private
- **Token:** Gespeichert in Manus Secrets (GITHUB_TOKEN)

## Automatische Synchronisation

Nach jedem Manus Checkpoint wird der Code automatisch zu GitHub synchronisiert.

### Manuelles Pushen zu GitHub

```bash
# Verwende das Sync-Script
node scripts/sync-to-github.mjs "Deine Commit Message"

# Oder manuell mit Git
git push github main
```

### Commit Message Format

Commit Messages werden automatisch aus den Manus Checkpoint-Beschreibungen generiert:

```
[YYYY-MM-DD HH:MM] Checkpoint-Beschreibung
```

Beispiel:
```
[2026-05-15 10:36] Raum36.tsx aktualisiert: Button-Text geändert zu BOLTWERTTABELLE anzeigen
```

## GitHub Token Verwaltung

Der GitHub Personal Access Token (PAT) ist in Manus Secrets gespeichert:
- **Key:** `GITHUB_TOKEN`
- **Ablaufdatum:** 90 Tage
- **Scopes:** repo (vollständiger Repository-Zugriff)

### Token erneuern (vor Ablauf)

1. Gehe zu https://github.com/settings/tokens
2. Generiere einen neuen Token mit den gleichen Einstellungen
3. Löschen den alten Token
4. Aktualisiere den Token in Manus Secrets via `webdev_request_secrets`

**Wichtig:** Nicht vergessen! Der Token läuft nach 90 Tagen ab.

## Workflow

1. **Entwicklung** → Änderungen in Manus
2. **Checkpoint** → `webdev_save_checkpoint` in Manus
3. **Sync** → Automatisch zu GitHub gepusht
4. **Versionskontrolle** → Alle Versionen auf GitHub verfügbar

## Troubleshooting

### "Authentication failed"
- Token ist abgelaufen → Neuen Token generieren
- Token ist falsch → In Manus Secrets überprüfen

### "Repository not found"
- Repository existiert nicht auf GitHub
- Username oder Repository-Name ist falsch
- Token hat nicht die richtigen Scopes

### "Nothing to commit"
- Keine Änderungen seit letztem Checkpoint
- Das ist normal und kein Fehler

## Sicherheit

⚠️ **Wichtig:** 
- Token niemals im Chat oder in Code posten
- Token nur via Manus Secrets eingeben
- Token regelmäßig erneuern (90 Tage)
- Repository ist Private (nur du hast Zugriff)

## Links

- GitHub Repository: https://github.com/thomas-kiich/mdi-app
- GitHub Settings: https://github.com/settings/tokens
- Manus Secrets: Konfiguriert in webdev_request_secrets

---

Letztes Update: 2026-05-15
