#!/usr/bin/env node

/**
 * Backup Script für Podcast-Audio-Dateien
 */

import { getDb } from "../server/db";
import { podcastEpisodes } from "../drizzle/schema";
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKUP_DIR = path.join(__dirname, "../backups/audio");
const LOG_FILE = path.join(BACKUP_DIR, "backup.log");

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

function calculateHash(filePath: string): string {
  const hash = crypto.createHash("sha256");
  const content = fs.readFileSync(filePath);
  hash.update(content);
  return hash.digest("hex");
}

async function downloadFile(url: string, filePath: string): Promise<boolean> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const buffer = await response.arrayBuffer();
    fs.writeFileSync(filePath, Buffer.from(buffer));
    return true;
  } catch (error) {
    log(`✗ Download failed for ${url}: ${(error as Error).message}`);
    return false;
  }
}

async function backupAudioFiles() {
  log("=== Audio Backup Started ===");

  try {
    const db = await getDb();
    if (!db) {
      log("✗ Database connection failed");
      return;
    }

    const episodes = await db.select().from(podcastEpisodes);
    log(`Found ${episodes.length} episodes`);

    const backupResults: any[] = [];

    for (const episode of episodes) {
      if (!episode.audioUrl) {
        log(`⚠ EP${episode.episodeNumber}: No audio URL`);
        continue;
      }

      const fileName = `EP${episode.episodeNumber}-${episode.catchphrase
        .toLowerCase()
        .replace(/\s+/g, "-")}.mp3`;
      const backupPath = path.join(BACKUP_DIR, fileName);

      log(`Backing up EP${episode.episodeNumber}: ${fileName}`);

      const downloadSuccess = await downloadFile(episode.audioUrl, backupPath);

      if (!downloadSuccess) {
        backupResults.push({
          episode: episode.episodeNumber,
          status: "FAILED",
          reason: "Download failed",
        });
        continue;
      }

      const hash = calculateHash(backupPath);
      const fileSize = fs.statSync(backupPath).size;

      log(
        `✓ EP${episode.episodeNumber}: Backed up (${(fileSize / 1024 / 1024).toFixed(2)}MB, SHA256: ${hash.substring(0, 8)}...)`
      );

      backupResults.push({
        episode: episode.episodeNumber,
        status: "SUCCESS",
        fileName,
        hash,
        size: fileSize,
        backupPath,
      });
    }

    log("=== Backup Summary ===");
    const successful = backupResults.filter((r) => r.status === "SUCCESS");
    const failed = backupResults.filter((r) => r.status === "FAILED");

    log(`✓ Successful: ${successful.length}/${episodes.length}`);
    log(`✗ Failed: ${failed.length}/${episodes.length}`);

    const manifest = {
      timestamp: new Date().toISOString(),
      totalEpisodes: episodes.length,
      successful: successful.length,
      failed: failed.length,
      backups: backupResults,
    };

    const manifestPath = path.join(BACKUP_DIR, "manifest.json");
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    log(`✓ Manifest saved to ${manifestPath}`);

    log("=== Audio Backup Completed ===");
  } catch (error) {
    log(`✗ Backup failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

backupAudioFiles().catch((error) => {
  log(`✗ Fatal error: ${(error as Error).message}`);
  process.exit(1);
});
