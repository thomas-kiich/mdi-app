#!/usr/bin/env bash
# =============================================================================
# KIICH Vault Cleanup Check Script
# Monatliche Prüfung auf verwaiste/veraltete Dateien im Vault
# Pfad: /home/ubuntu/mdi-app/scripts/kiich-vault-cleanup-check.sh
# =============================================================================

set -euo pipefail

VAULT_DIR="/home/ubuntu/kiich-vault"
SKILLS_DIR="/home/ubuntu/skills"
VAULT_SKILLS_DIR="$VAULT_DIR/01_KIICH/MANUS-SKILLS"
MANUS_DIR="$VAULT_DIR/01_KIICH"

echo "=== KIICH Vault Cleanup Check: $(TZ=Europe/Vienna date) ==="

# --- 1. Verwaiste Skills in MANUS-SKILLS/ ---
echo ""
echo "=== VERWAISTE SKILLS (in Vault, nicht mehr in Sandbox) ==="
ORPHANED_SKILLS=()
for vault_file in "$VAULT_SKILLS_DIR"/*.md; do
  [ -f "$vault_file" ] || continue
  filename=$(basename "$vault_file" .md)
  # Sonderfall: KIICH-MASTER, KIICH-SESSION-LOG, KIICH-TAGESLOG etc. überspringen
  if [[ "$filename" == KIICH-* ]] || [[ "$filename" == "SKILL – "* ]]; then
    continue
  fi
  skill_dir="$SKILLS_DIR/$filename"
  if [ ! -d "$skill_dir" ]; then
    ORPHANED_SKILLS+=("$filename")
    echo "  ⚠ VERWAIST: $filename.md (kein Skill in Sandbox)"
  fi
done

if [ ${#ORPHANED_SKILLS[@]} -eq 0 ]; then
  echo "  ✓ Keine verwaisten Skills gefunden"
fi

# --- 2. Veraltete/doppelte Dokumente in 🤖 MANUS/ ---
echo ""
echo "=== VERALTETE/DOPPELTE DOKUMENTE (🤖 MANUS/) ==="
MANUS_SUBDIR="$MANUS_DIR/🤖 MANUS"
OUTDATED_DOCS=()

if [ -d "$MANUS_SUBDIR" ]; then
  # Dateien älter als 90 Tage
  while IFS= read -r -d '' file; do
    rel_path="${file#$VAULT_DIR/}"
    OUTDATED_DOCS+=("$rel_path")
    echo "  ⚠ ALT (>90 Tage): $rel_path"
  done < <(find "$MANUS_SUBDIR" -name "*.md" -mtime +90 -print0 2>/dev/null)

  if [ ${#OUTDATED_DOCS[@]} -eq 0 ]; then
    echo "  ✓ Keine veralteten Dokumente gefunden (alle <90 Tage)"
  fi
else
  echo "  ℹ Verzeichnis '🤖 MANUS' nicht vorhanden"
fi

# --- 3. Zusammenfassung ausgeben ---
echo ""
echo "=== CLEANUP ZUSAMMENFASSUNG ==="
echo "ORPHANED_SKILLS_COUNT=${#ORPHANED_SKILLS[@]}"
echo "OUTDATED_DOCS_COUNT=${#OUTDATED_DOCS[@]}"

if [ ${#ORPHANED_SKILLS[@]} -gt 0 ]; then
  echo ""
  echo "--- Verwaiste Skills (Löschvorschläge) ---"
  for s in "${ORPHANED_SKILLS[@]}"; do
    echo "  DEL: 01_KIICH/MANUS-SKILLS/${s}.md"
  done
fi

if [ ${#OUTDATED_DOCS[@]} -gt 0 ]; then
  echo ""
  echo "--- Veraltete Dokumente (Löschvorschläge) ---"
  for d in "${OUTDATED_DOCS[@]}"; do
    echo "  DEL: $d"
  done
fi

echo ""
echo "=== Cleanup Check abgeschlossen ==="
