#!/usr/bin/env node

/**
 * Wöchentliche Backup-Validierung
 * Prüft, ob alle Backups vorhanden und gültig sind
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "../backups");
const VALIDATION_LOG = path.join(BACKUP_DIR, "validation.log");

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(VALIDATION_LOG, logMessage + "\n");
}

interface ValidationResult {
  category: string;
  status: "PASS" | "FAIL" | "WARNING";
  message: string;
  details?: string;
}

async function validateBackups() {
  log("=== Weekly Backup Validation Started ===");

  const results: ValidationResult[] = [];

  // 1. Audio-Backup Validierung
  log("Validating audio backups...");
  const audioDir = path.join(BACKUP_DIR, "audio");
  if (!fs.existsSync(audioDir)) {
    results.push({
      category: "Audio Backup",
      status: "FAIL",
      message: "Audio backup directory not found",
    });
  } else {
    const audioFiles = fs
      .readdirSync(audioDir)
      .filter((f) => f.endsWith(".mp3"));
    const manifestPath = path.join(audioDir, "manifest.json");

    if (audioFiles.length === 0) {
      results.push({
        category: "Audio Backup",
        status: "FAIL",
        message: "No audio files found in backup",
      });
    } else {
      results.push({
        category: "Audio Backup",
        status: "PASS",
        message: `${audioFiles.length} audio files backed up`,
      });
    }

    if (fs.existsSync(manifestPath)) {
      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      if (manifest.successful === manifest.totalEpisodes) {
        results.push({
          category: "Audio Manifest",
          status: "PASS",
          message: `All ${manifest.successful} episodes backed up successfully`,
        });
      } else {
        results.push({
          category: "Audio Manifest",
          status: "WARNING",
          message: `${manifest.successful}/${manifest.totalEpisodes} episodes backed up`,
          details: `Failed: ${manifest.failed}`,
        });
      }
    }
  }

  // 2. Datenbank-Backup Validierung
  log("Validating database backups...");
  const dbDir = path.join(BACKUP_DIR, "database");
  if (!fs.existsSync(dbDir)) {
    results.push({
      category: "Database Backup",
      status: "FAIL",
      message: "Database backup directory not found",
    });
  } else {
    const dbFiles = fs
      .readdirSync(dbDir)
      .filter((f) => f.startsWith("backup-") && f.endsWith(".gz"));

    if (dbFiles.length === 0) {
      results.push({
        category: "Database Backup",
        status: "FAIL",
        message: "No database backups found",
      });
    } else {
      // Get the most recent backup
      const latestBackup = dbFiles.sort().reverse()[0];
      const latestPath = path.join(dbDir, latestBackup);
      const stats = fs.statSync(latestPath);
      const ageHours = (Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60);

      if (ageHours < 26) {
        results.push({
          category: "Database Backup",
          status: "PASS",
          message: `Latest backup: ${latestBackup} (${ageHours.toFixed(1)} hours old)`,
        });
      } else {
        results.push({
          category: "Database Backup",
          status: "WARNING",
          message: `Latest backup is ${ageHours.toFixed(1)} hours old`,
          details: "Backup may be overdue",
        });
      }

      // Check backup size
      const sizeGB = stats.size / (1024 * 1024 * 1024);
      if (sizeGB > 0.1) {
        results.push({
          category: "Database Backup Size",
          status: "PASS",
          message: `Backup size: ${sizeGB.toFixed(3)} GB`,
        });
      } else {
        results.push({
          category: "Database Backup Size",
          status: "WARNING",
          message: `Backup size is small: ${(stats.size / 1024).toFixed(2)} KB`,
        });
      }
    }
  }

  // 3. Monitoring-Reports Validierung
  log("Validating monitoring reports...");
  const monitoringDir = path.join(BACKUP_DIR, "monitoring");
  if (!fs.existsSync(monitoringDir)) {
    results.push({
      category: "Monitoring Reports",
      status: "FAIL",
      message: "Monitoring directory not found",
    });
  } else {
    const reportFiles = fs
      .readdirSync(monitoringDir)
      .filter((f) => f.startsWith("report-") && f.endsWith(".json"));

    if (reportFiles.length === 0) {
      results.push({
        category: "Monitoring Reports",
        status: "FAIL",
        message: "No monitoring reports found",
      });
    } else {
      // Get the most recent report
      const latestReport = reportFiles.sort().reverse()[0];
      const latestPath = path.join(monitoringDir, latestReport);
      const report = JSON.parse(fs.readFileSync(latestPath, "utf-8"));

      if (report.healthPercentage === "100.00") {
        results.push({
          category: "Audio Health",
          status: "PASS",
          message: `All ${report.totalEpisodes} episodes are accessible`,
        });
      } else {
        results.push({
          category: "Audio Health",
          status: "WARNING",
          message: `Health: ${report.healthPercentage}% (${report.unhealthy} episodes not accessible)`,
        });
      }
    }
  }

  // 4. Speicherplatz-Validierung
  log("Validating storage space...");
  const backupSize = getDirectorySize(BACKUP_DIR);
  const backupSizeGB = backupSize / (1024 * 1024 * 1024);

  if (backupSizeGB < 10) {
    results.push({
      category: "Storage Space",
      status: "PASS",
      message: `Backup directory size: ${backupSizeGB.toFixed(2)} GB`,
    });
  } else {
    results.push({
      category: "Storage Space",
      status: "WARNING",
      message: `Backup directory size: ${backupSizeGB.toFixed(2)} GB (consider cleanup)`,
    });
  }

  // Ausgabe der Ergebnisse
  log("=== Validation Results ===");

  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  const warnings = results.filter((r) => r.status === "WARNING").length;

  for (const result of results) {
    const icon =
      result.status === "PASS" ? "✓" : result.status === "FAIL" ? "✗" : "⚠";
    log(`${icon} ${result.category}: ${result.message}`);
    if (result.details) {
      log(`  Details: ${result.details}`);
    }
  }

  log("");
  log(`Summary: ${passed} passed, ${warnings} warnings, ${failed} failed`);

  if (failed > 0) {
    log("⚠ ALERT: Some validations failed!");
    process.exit(1);
  } else {
    log("✓ All validations passed");
  }

  log("=== Validation Completed ===");
}

function getDirectorySize(dirPath: string): number {
  let size = 0;

  const files = fs.readdirSync(dirPath);
  for (const file of files) {
    const filePath = path.join(dirPath, file);
    const stats = fs.statSync(filePath);

    if (stats.isDirectory()) {
      size += getDirectorySize(filePath);
    } else {
      size += stats.size;
    }
  }

  return size;
}

validateBackups().catch((error) => {
  log(`✗ Fatal error: ${(error as Error).message}`);
  process.exit(1);
});
