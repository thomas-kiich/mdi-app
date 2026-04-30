#!/bin/bash

# Setup Cron Jobs für automatische Backups
# Verwendung: bash scripts/setup-cron-backups.sh

set -e

PROJECT_DIR="/home/ubuntu/mdi-app"
CRON_FILE="/etc/cron.d/kiich-backups"

echo "Setting up cron jobs for KIICH backups..."

# Stelle sicher, dass Backup-Verzeichnisse existieren
mkdir -p "$PROJECT_DIR/backups/audio"
mkdir -p "$PROJECT_DIR/backups/database"
mkdir -p "$PROJECT_DIR/backups/monitoring"

# Erstelle Cron-Datei
cat > /tmp/kiich-cron << 'EOF'
# KIICH Backup & Monitoring Cron Jobs
# Generated: $(date)

# Audio-Backup täglich um 02:00 UTC
0 2 * * * cd /home/ubuntu/mdi-app && /usr/bin/pnpm tsx scripts/backup-audio-files.ts >> /home/ubuntu/mdi-app/backups/audio/cron.log 2>&1

# Datenbank-Backup täglich um 03:00 UTC  
0 3 * * * cd /home/ubuntu/mdi-app && /usr/bin/pnpm tsx scripts/backup-database.ts >> /home/ubuntu/mdi-app/backups/database/cron.log 2>&1

# Monitoring stündlich um :00
0 * * * * cd /home/ubuntu/mdi-app && /usr/bin/pnpm tsx scripts/monitor-audio-urls.ts >> /home/ubuntu/mdi-app/backups/monitoring/cron.log 2>&1

# Wöchentliche Backup-Validierung (Montag um 09:00 UTC)
0 9 * * 1 cd /home/ubuntu/mdi-app && /usr/bin/pnpm tsx scripts/validate-backups.ts >> /home/ubuntu/mdi-app/backups/validation.log 2>&1
EOF

# Installiere Cron-Datei
echo "Installing cron jobs..."
sudo tee "$CRON_FILE" > /dev/null < /tmp/kiich-cron
rm /tmp/kiich-cron

# Verifiziere Installation
echo "Verifying cron installation..."
sudo systemctl restart cron

if sudo crontab -l | grep -q "kiich-backups"; then
  echo "✓ Cron jobs installed successfully"
else
  echo "✗ Cron jobs not found - please check manually"
  exit 1
fi

echo ""
echo "=== Cron Jobs Setup Complete ==="
echo ""
echo "Installed cron jobs:"
echo "  - Audio-Backup: täglich um 02:00 UTC"
echo "  - Datenbank-Backup: täglich um 03:00 UTC"
echo "  - Monitoring: stündlich"
echo "  - Validierung: Montag um 09:00 UTC"
echo ""
echo "Log-Dateien:"
echo "  - Audio: /home/ubuntu/mdi-app/backups/audio/cron.log"
echo "  - Datenbank: /home/ubuntu/mdi-app/backups/database/cron.log"
echo "  - Monitoring: /home/ubuntu/mdi-app/backups/monitoring/cron.log"
echo ""
echo "Überprüfe die Logs mit:"
echo "  tail -f /home/ubuntu/mdi-app/backups/audio/cron.log"
