# Automatisches GitHub Push nach Checkpoints

Dein Code wird **vollständig automatisch** zu GitHub gepusht. Du musst nichts manuell machen!

## Workflow

```
1. Du machst Änderungen in Manus
   ↓
2. Du rufst webdev_save_checkpoint auf
   ↓
3. Manus erstellt automatisch einen Git Commit
   ↓
4. Git Post-Commit Hook wird getriggert
   ↓
5. Code wird automatisch zu GitHub gepusht
   ↓
✅ Fertig – Kein manueller Schritt nötig!
```

## Technische Details

### Git Post-Commit Hook
- **Datei:** `.git/hooks/post-commit`
- **Trigger:** Nach jedem `git commit`
- **Aktion:** Pusht zu GitHub Remote `github` auf Branch `main`
- **Authentifizierung:** Nutzt `GITHUB_TOKEN` aus Manus Secrets

### Automatische Commit Messages
Manus generiert automatisch Commit Messages aus deinen Checkpoint-Beschreibungen:

```
Checkpoint-Beschreibung: "Raum36.tsx aktualisiert: Button-Text geändert"
  ↓
Git Commit Message: "Checkpoint: Raum36.tsx aktualisiert: Button-Text geändert"
```

### GitHub Remote
- **Name:** `github`
- **URL:** `https://github.com/thomas-kiich/mdi-app.git`
- **Branch:** `main`

## Monitoring

### Überprüfe ob Push erfolgreich war

```bash
# Zeige letzte Commits
git log --oneline | head -5

# Überprüfe ob lokal und GitHub synchron sind
git status
# Output sollte sein: "Your branch is up to date with 'origin/main'"

# Überprüfe GitHub Remote
git log github/main --oneline | head -5
```

### Überprüfe GitHub Repository

Gehe zu: https://github.com/thomas-kiich/mdi-app

Dort solltest du alle deine Commits sehen mit:
- Commit Message (aus Checkpoint-Beschreibung)
- Timestamp
- Alle Dateien und Änderungen

## Troubleshooting

### "Push fehlgeschlagen"

**Mögliche Ursachen:**
1. GitHub Token ist abgelaufen
   - Lösung: Neuen Token generieren und in Manus Secrets aktualisieren
   
2. GitHub Token hat nicht die richtigen Scopes
   - Lösung: Token mit `repo` Scope erneuern

3. GitHub Remote nicht konfiguriert
   - Lösung: `git remote add github https://github.com/thomas-kiich/mdi-app.git`

### "Commits sind nicht auf GitHub"

```bash
# Überprüfe ob unpushed Commits existieren
git log origin/main..main

# Manuell pushen wenn Hook fehlgeschlagen ist
git push github main
```

### "Hook wird nicht ausgeführt"

```bash
# Überprüfe ob Hook ausführbar ist
ls -la .git/hooks/post-commit
# Output sollte: -rwxr-xr-x (executable)

# Mache Hook ausführbar
chmod +x .git/hooks/post-commit

# Teste Hook manuell
.git/hooks/post-commit
```

## Sicherheit

⚠️ **Wichtig:**
- GitHub Token ist in Manus Secrets gespeichert (nicht im Code)
- Token wird nur in Git Hooks verwendet (nicht sichtbar)
- Repository ist Private (nur du hast Zugriff)
- Token läuft nach 90 Tagen ab (Reminder einrichten!)

## Nächste Schritte

- [ ] Überprüfe GitHub Repository: https://github.com/thomas-kiich/mdi-app
- [ ] Überprüfe dass alle Commits dort sichtbar sind
- [ ] Setze einen Reminder für Token-Erneuerung (Tag 85)
- [ ] Optional: GitHub Actions Workflow für Tests einrichten

---

Letztes Update: 2026-05-16
