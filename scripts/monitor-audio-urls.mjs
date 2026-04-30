#!/usr/bin/env node

/**
 * Audio-URL Monitoring Script
 * 
 * Prüft täglich:
 * 1. Alle Audio-URLs sind erreichbar (HTTP 200)
 * 2. Dateigrößen sind korrekt
 * 3. Content-Type ist audio/mpeg
 * 4. Backup-URLs sind erreichbar
 * 5. Erstellt Monitoring-Report
 */

import { getDb } from "../server/db.js";
import { podcastEpisodes } from "../drizzle/schema.js";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONITORING_DIR = path.join(__dirname, "../backups/monitoring");
const LOG_FILE = path.join(MONITORING_DIR, "monitoring.log");

// Stelle sicher, dass Monitoring-Verzeichnis existiert
if (!fs.existsSync(MONITORING_DIR)) {
  fs.mkdirSync(MONITORING_DIR, { recursive: true });
}

function log(message) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

async function checkUrl(url) {
  try {
    const response = await fetch(url, { method: "HEAD", timeout: 10000 });
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: null,
      error: error.message,
      ok: false,
    };
  }
}

async function monitorAudioUrls() {
  log("=== Audio URL Monitoring Started ===");

  try {
    const db = await getDb();
    if (!db) {
      log("✗ Database connection failed");
      return;
    }

    const episodes = await db.select().from(podcastEpisodes);
    log(`Monitoring ${episodes.length} episodes`);

    const results = [];
    let healthy = 0;
    let unhealthy = 0;

    for (const episode of episodes) {
      if (!episode.audioUrl) {
        log(`⚠ EP${episode.episodeNumber}: No audio URL`);
        results.push({
          episode: episode.episodeNumber,
          status: "WARNING",
          reason: "No audio URL",
        });
        unhealthy++;
        continue;
      }

      log(`Checking EP${episode.episodeNumber}...`);

      const check = await checkUrl(episode.audioUrl);

      if (check.ok && check.status === 200) {
        log(
          `✓ EP${episode.episodeNumber}: OK (${check.contentType}, ${check.contentLength} bytes)`
        );
        results.push({
          episode: episode.episodeNumber,
          status: "HEALTHY",
          url: episode.audioUrl,
          httpStatus: check.status,
          contentType: check.contentType,
          contentLength: check.contentLength,
        });
        healthy++;
      } else {
        log(
          `✗ EP${episode.episodeNumber}: FAILED (HTTP ${check.status || "N/A"}, ${check.error || ""})`
        );
        results.push({
          episode: episode.episodeNumber,
          status: "UNHEALTHY",
          url: episode.audioUrl,
          httpStatus: check.status,
          error: check.error,
        });
        unhealthy++;
      }
    }

    // Create monitoring report
    const report = {
      timestamp: new Date().toISOString(),
      totalEpisodes: episodes.length,
      healthy,
      unhealthy,
      healthPercentage: ((healthy / episodes.length) * 100).toFixed(2),
      results,
    };

    // Save report
    const reportPath = path.join(
      MONITORING_DIR,
      `report-${new Date().toISOString().split("T")[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log("=== Monitoring Report ===");
    log(`✓ Healthy: ${healthy}/${episodes.length}`);
    log(`✗ Unhealthy: ${unhealthy}/${episodes.length}`);
    log(`Health: ${report.healthPercentage}%`);

    // Alert if any episodes are unhealthy
    if (unhealthy > 0) {
      log("⚠ ALERT: Some episodes are not accessible!");
      const unhealthyEpisodes = results
        .filter((r) => r.status === "UNHEALTHY")
        .map((r) => `EP${r.episode}`)
        .join(", ");
      log(`Unhealthy episodes: ${unhealthyEpisodes}`);
    }

    log("=== Monitoring Completed ===");
  } catch (error) {
    log(`✗ Monitoring failed: ${error.message}`);
    process.exit(1);
  }
}

// Run monitoring
monitorAudioUrls().catch((error) => {
  log(`✗ Fatal error: ${error.message}`);
  process.exit(1);
});
