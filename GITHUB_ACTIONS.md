# GitHub Actions Workflows

Automatische Tests, Linting und Dokumentation laufen nach jedem Push zu GitHub.

## Workflows

### 1. CI Pipeline (ci.yml)

Läuft nach jedem Push zu `main` Branch.

**Was wird getestet:**

- ✅ **Dependencies** – pnpm install
- ✅ **Linting** – Code Formatierung überprüfen
- ✅ **Tests** – vitest Tests ausführen
- ✅ **Build** – Projekt kompilieren
- ✅ **Skills Validierung** – SKILL.md Dateien überprüfen
- ✅ **Required Files** – Wichtige Dateien vorhanden?
- ✅ **Security** – Hardcodierte Secrets überprüfen
- ✅ **Code Quality** – TODO/FIXME Kommentare zählen

**Ergebnis:**
- ✅ Grünes Häkchen = Alles OK
- ❌ Rotes X = Fehler vorhanden

### 2. Documentation Workflow (docs.yml)

Läuft nach jedem Push wenn Skills oder Dokumentation geändert wurde.

**Was wird generiert:**

- 📚 **SKILLS_OVERVIEW.md** – Übersicht aller Skills
- 📊 **PROJECT_STATS.md** – Projekt Statistiken (Code Zeilen, Dateien, etc.)

Diese Dateien werden automatisch aktualisiert und zu GitHub gepusht.

## Monitoring

### Überprüfe Workflow Status

1. Gehe zu: https://github.com/thomas-kiich/mdi-app/actions
2. Du siehst alle Workflow Runs
3. Klick auf einen Run um Details zu sehen

### Workflow Logs

```
GitHub → Actions → Wähle Workflow → Wähle Run → Logs anschauen
```

## Troubleshooting

### "Workflow fehlgeschlagen"

**Mögliche Ursachen:**

1. **Tests fehlgeschlagen**
   - Überprüfe die Test-Logs
   - Behebe die Fehler lokal
   - Pushe erneut

2. **Linting Fehler**
   - Führe lokal aus: `pnpm run format`
   - Oder: `pnpm run format --check`
   - Behebe die Formatierungsfehler

3. **Build Fehler**
   - Überprüfe TypeScript Fehler
   - Überprüfe Dependencies
   - Führe lokal aus: `pnpm build`

4. **Skills Validierung fehlgeschlagen**
   - Überprüfe ob alle SKILL.md Dateien existieren
   - Überprüfe ob keine doppelten Skills existieren

### Workflow wird nicht ausgeführt

```bash
# Überprüfe ob Workflows existieren
ls -la .github/workflows/

# Überprüfe YAML Syntax
cat .github/workflows/ci.yml | head -20
```

## Anpassungen

### Workflow deaktivieren

Benenne die Datei um oder lösche sie:
```bash
mv .github/workflows/ci.yml .github/workflows/ci.yml.disabled
```

### Workflow anpassen

Bearbeite die `.github/workflows/*.yml` Dateien nach deinen Anforderungen.

**Wichtig:** Nach Änderungen zu GitHub pushen damit die neuen Workflows verwendet werden.

## Best Practices

1. **Überprüfe Workflow Status** – Nach jedem Push
2. **Behebe Fehler schnell** – Verhindert dass fehlerhafte Code in main kommt
3. **Dokumentation aktualisieren** – Wird automatisch generiert
4. **Skills validieren** – Wird automatisch überprüft

## GitHub Actions Limits

- **Free Plan:** 2000 Minuten/Monat
- **Pro Plan:** 3000 Minuten/Monat

Unsere Workflows sind sehr schnell (< 1 Minute pro Run), daher sollte das kein Problem sein.

## Nächste Schritte

- [ ] Überprüfe GitHub Actions: https://github.com/thomas-kiich/mdi-app/actions
- [ ] Überprüfe ob Workflows grün sind (✅)
- [ ] Überprüfe ob SKILLS_OVERVIEW.md und PROJECT_STATS.md generiert wurden
- [ ] Optional: Weitere Workflows hinzufügen (z.B. Deployment)

---

Letztes Update: 2026-05-16
