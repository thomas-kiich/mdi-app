#!/usr/bin/env bash
# =============================================================================
# KIICH Vault Sync Script
# Synchronisiert Manus-Skills → kiich-vault (GitHub)
# Pfad: /home/ubuntu/mdi-app/scripts/kiich-vault-sync.sh
# =============================================================================

set -euo pipefail

VAULT_DIR="/home/ubuntu/kiich-vault"
SKILLS_DIR="/home/ubuntu/skills"
VAULT_SKILLS_DIR="$VAULT_DIR/01_KIICH/MANUS-SKILLS"
VAULT_LOG="$VAULT_DIR/01_KIICH/QUELL/VAULT-SYNC-LOG.md"
TIMESTAMP=$(TZ=Europe/Vienna date '+%Y-%m-%d – %Y-%m-%d %H:%M:%S %Z')
DATE_ONLY=$(TZ=Europe/Vienna date '+%Y-%m-%d')

echo "=== KIICH Vault Sync gestartet: $(TZ=Europe/Vienna date) ==="

# --- 1. Vault-Repo aktuell halten ---
echo "→ Vault-Repo aktualisieren..."
cd "$VAULT_DIR"
git pull origin main --rebase 2>&1 || echo "⚠ git pull fehlgeschlagen (fahre fort)"

# --- 2. KIICH-Skills in den Vault kopieren ---
echo "→ Skills synchronisieren..."
mkdir -p "$VAULT_SKILLS_DIR"

KIICH_SKILLS=(
  "kiich-abo-monetarisierung"
  "kiich-agenten-team"
  "kiich-architektur"
  "kiich-audio-deployment"
  "kiich-content-stimme"
  "kiich-datenschutz"
  "kiich-datensicherung"
  "kiich-design-system"
  "kiich-hermes"
  "kiich-knowledge-export"
  "kiich-master"
  "kiich-newsletter-workflow"
  "kiich-projekte"
  "kiich-schreibstil"
  "kiich-session-abschluss"
  "kiich-system-integrität"
)

SYNCED_FILES=()
ERRORS=()

for skill in "${KIICH_SKILLS[@]}"; do
  src="$SKILLS_DIR/$skill/SKILL.md"
  dst="$VAULT_SKILLS_DIR/${skill}.md"
  if [ -f "$src" ]; then
    cp "$src" "$dst"
    SYNCED_FILES+=("MANUS-SKILLS/${skill}.md")
    echo "  ✓ $skill"
  else
    ERRORS+=("⚠ Skill nicht gefunden: $skill")
    echo "  ⚠ FEHLT: $skill"
  fi
done

# --- 3. KIICH-MASTER auch als KIICH-MASTER.md kopieren (Kompatibilität) ---
MASTER_SRC="$SKILLS_DIR/kiich-master/SKILL.md"
if [ -f "$MASTER_SRC" ]; then
  cp "$MASTER_SRC" "$VAULT_SKILLS_DIR/KIICH-MASTER.md"
  SYNCED_FILES+=("MANUS-SKILLS/KIICH-MASTER.md")
  echo "  ✓ KIICH-MASTER.md (Alias)"
fi

FILE_COUNT=${#SYNCED_FILES[@]}

# --- 4. Sync-Log aktualisieren ---
echo "→ Sync-Log aktualisieren..."
LOG_ENTRY="## Sync $DATE_ONLY – $(TZ=Europe/Vienna date '+%Y-%m-%d %H:%M:%S %Z')\n### Synchronisierte Dateien ($FILE_COUNT)\n"
for f in "${SYNCED_FILES[@]}"; do
  LOG_ENTRY+="- \`$f\`\n"
done
if [ ${#ERRORS[@]} -gt 0 ]; then
  LOG_ENTRY+="### Fehler\n"
  for e in "${ERRORS[@]}"; do
    LOG_ENTRY+="- $e\n"
  done
fi
LOG_ENTRY+="---\n"

# Neuen Eintrag am Anfang der Log-Datei einfügen
EXISTING_LOG=""
if [ -f "$VAULT_LOG" ]; then
  EXISTING_LOG=$(cat "$VAULT_LOG")
fi
printf "%b\n%s" "$LOG_ENTRY" "$EXISTING_LOG" > "$VAULT_LOG"

# --- 5. Git Commit & Push ---
echo "→ Git Commit & Push..."
cd "$VAULT_DIR"
git add -A

if git diff --cached --quiet; then
  echo "  ℹ Keine Änderungen – kein Commit nötig"
  COMMIT_HASH="(kein neuer Commit)"
  echo "=== Vault Sync abgeschlossen (keine Änderungen) ==="
  echo "SYNC_FILES=$FILE_COUNT"
  echo "SYNC_HASH=$COMMIT_HASH"
  exit 0
fi

COMMIT_MSG="Vault Sync $DATE_ONLY: $FILE_COUNT Dateien synchronisiert"
git commit -m "$COMMIT_MSG"
git push origin main 2>&1

COMMIT_HASH=$(git rev-parse --short HEAD)
BRANCH=$(git branch --show-current)

echo "=== Vault Sync abgeschlossen ==="
echo "SYNC_FILES=$FILE_COUNT"
echo "SYNC_HASH=$COMMIT_HASH"
echo "SYNC_BRANCH=$BRANCH"
