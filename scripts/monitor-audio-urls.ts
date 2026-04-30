#!/usr/bin/env node

/**
 * Audio-URL Monitoring Script
 */

import { getDb } from "../server/db";
import { podcastEpisodes } from "../drizzle/schema";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MONITORING_DIR = path.join(__dirname, "../backups/monitoring");
const LOG_FILE = path.join(MONITORING_DIR, "monitoring.log");

if (!fs.existsSync(MONITORING_DIR)) {
  fs.mkdirSync(MONITORING_DIR, { recursive: true });
}

function log(message: string) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;
  console.log(logMessage);
  fs.appendFileSync(LOG_FILE, logMessage + "\n");
}

interface UrlCheckResult {
  status: number | null;
  contentType: string | null;
  contentLength: string | null;
  ok: boolean;
  error?: string;
}

async function checkUrl(url: string): Promise<UrlCheckResult> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return {
      status: response.status,
      contentType: response.headers.get("content-type"),
      contentLength: response.headers.get("content-length"),
      ok: response.ok,
    };
  } catch (error) {
    return {
      status: null,
      contentType: null,
      contentLength: null,
      ok: false,
      error: (error as Error).message,
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

    const results: any[] = [];
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

    const report = {
      timestamp: new Date().toISOString(),
      totalEpisodes: episodes.length,
      healthy,
      unhealthy,
      healthPercentage: ((healthy / episodes.length) * 100).toFixed(2),
      results,
    };

    const reportPath = path.join(
      MONITORING_DIR,
      `report-${new Date().toISOString().split("T")[0]}.json`
    );
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    log("=== Monitoring Report ===");
    log(`✓ Healthy: ${healthy}/${episodes.length}`);
    log(`✗ Unhealthy: ${unhealthy}/${episodes.length}`);
    log(`Health: ${report.healthPercentage}%`);

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
    log(`✗ Monitoring failed: ${(error as Error).message}`);
    process.exit(1);
  }
}

monitorAudioUrls().catch((error) => {
  log(`✗ Fatal error: ${(error as Error).message}`);
  process.exit(1);
});
