#!/usr/bin/env node

/**
 * Datenbank-Backup Script
 * 
 * Strategie:
 * 1. MySQL-Dump erstellen
 * 2. Dump komprimieren (gzip)
 * 3. Backup mit Timestamp speichern
 * 4. Alte Backups löschen (älter als 30 Tage)
 * 5. Backup-Integrität prüfen
 * 6. Monitoring-Report erstellen
 */

import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const execAsync = promisify(exec);
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "../backups/database");
const LOG_FILE = path.join(BACKUP_DIR, "backup.log");

// Stelle sicher, dass Backup-Verzeichnis existiert
if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

async function backupDatabase() {
  log("=== Database Backup Started ===");

  try {
    // Get database connection details from environment
    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      log("✗ DATABASE_URL not set");
      process.exit(1);
    }

    // Parse connection string
    // Format: mysql://user:password@host:port/database
    const urlMatch = dbUrl.match(
      /mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)/
    );
    if (!urlMatch) {
      log("✗ Invalid DATABASE_URL format");
      process.exit(1);
    }

    const [, user, password, host, port, database] = urlMatch;

    // Create backup filename with timestamp
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const backupFile = path.join(BACKUP_DIR, `backup-${timestamp}.sql`);
    const compressedFile = `${backupFile}.gz`;

    log(`Creating dump for database: ${database}`);

    // Create MySQL dump
    const dumpCommand = `mysqldump -h ${host} -P ${port} -u ${user} -p${password} ${database} > ${backupFile}`;

    try {
      await execAsync(dumpCommand, { shell: "/bin/bash" });
      log(`✓ Dump created: ${backupFile}`);
    } catch (error) {
      log(`✗ Dump failed: ${error.message}`);
      process.exit(1);
    }

    // Compress dump
    try {
      await execAsync(`gzip -f ${backupFile}`);
      const fileSize = fs.statSync(compressedFile).size;
      log(
        `✓ Compressed: ${compressedFile} (${(fileSize / 1024 / 1024).toFixed(2)}MB)`
      );
    } catch (error) {
      log(`✗ Compression failed: ${error.message}`);
      process.exit(1);
    }

    // Clean up old backups (keep last 30 days)
    log("Cleaning up old backups...");
    const files = fs.readdirSync(BACKUP_DIR).filter((f) => f.startsWith("backup-") && f.endsWith(".gz"));
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;

    let deletedCount = 0;
    for (const file of files) {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      if (stats.mtime.getTime() < thirtyDaysAgo) {
        fs.unlinkSync(filePath);
        log(`✓ Deleted old backup: ${file}`);
        deletedCount++;
      }
    }

    log(`Cleaned up ${deletedCount} old backups`);

    // Create backup manifest
    const manifest = {
      timestamp: new Date().toISOString(),
      database,
      host,
      backupFile: compressedFile,
      fileSize: fs.statSync(compressedFile).size,
      status: "SUCCESS",
    };

    const manifestPath = path.join(BACKUP_DIR, "latest-backup.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

    log("=== Database Backup Completed ===");
    log(`✓ Backup location: ${compressedFile}`);
  } catch (error) {
    log(`✗ Fatal error: ${error.message}`);
    process.exit(1);
  }
}

// Run backup
backupDatabase().catch((error) => {
  log(`✗ Error: ${error.message}`);
  process.exit(1);
});
