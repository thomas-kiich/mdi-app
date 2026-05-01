/**
 * Podcast Integrity Validation Job
 * 
 * Führt täglich eine Validierung der Podcast-Episode-Datenbank durch.
 * Prüft:
 * - Genau 1 Episode mit isLatest=true
 * - Alle Episoden haben gültige Audio-URLs
 * - Alle Episoden haben gültige Cover-Bilder
 * - Keine Duplikate in Episode-Nummern
 * 
 * Bei Fehlern: Benachrichtigung an Owner
 */

import { getDb } from "../db";
import { podcastEpisodes } from "../../drizzle/schema";
import { eq, count } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

interface ValidationResult {
  ok: boolean;
  timestamp: string;
  checks: {
    latestCount: number;
    totalEpisodes: number;
    validAudioUrls: boolean;
    validCoverImages: boolean;
    uniqueEpisodeNumbers: boolean;
    errors: string[];
  };
}

export async function validatePodcastIntegrity(): Promise<ValidationResult> {
  const timestamp = new Date().toISOString();
  const errors: string[] = [];
  let latestCount = 0;
  let totalEpisodes = 0;
  let validAudioUrls = true;
  let validCoverImages = true;
  let uniqueEpisodeNumbers = true;

  try {
    const db = await getDb();
    if (!db) {
      errors.push("Database not available");
      return {
        ok: false,
        timestamp,
        checks: {
          latestCount: 0,
          totalEpisodes: 0,
          validAudioUrls: false,
          validCoverImages: false,
          uniqueEpisodeNumbers: false,
          errors,
        },
      };
    }

    // 1. Zähle Episoden mit isLatest=true
    const [latestResult] = await db
      .select({ count: count() })
      .from(podcastEpisodes)
      .where(eq(podcastEpisodes.isLatest, true));

    latestCount = latestResult?.count ?? 0;

    if (latestCount !== 1) {
      errors.push(
        `❌ Expected 1 episode with isLatest=true, found ${latestCount}`
      );
    }

    // 2. Zähle Gesamtepisoden
    const [totalResult] = await db
      .select({ count: count() })
      .from(podcastEpisodes);

    totalEpisodes = totalResult?.count ?? 0;

    if (totalEpisodes < 5) {
      errors.push(`⚠️ Expected at least 5 episodes, found ${totalEpisodes}`);
    }

    // 3. Validiere Audio-URLs
    const all = await db.select().from(podcastEpisodes);

    const invalidAudioUrls = all.filter(
      (ep: any) => !ep.audioUrl || !ep.audioUrl.match(/^https?:\/\//)
    );

    if (invalidAudioUrls.length > 0) {
      validAudioUrls = false;
      errors.push(
        `❌ ${invalidAudioUrls.length} episodes have invalid audio URLs`
      );
    }

    // 4. Validiere Cover-Bilder
    const invalidCoverImages = all.filter(
      (ep: any) => !ep.coverImageUrl || !ep.coverImageUrl.match(/^https?:\/\//)
    );

    if (invalidCoverImages.length > 0) {
      validCoverImages = false;
      errors.push(
        `❌ ${invalidCoverImages.length} episodes have invalid cover images`
      );
    }

    // 5. Validiere eindeutige Episode-Nummern
    const episodeNumbers = all.map((ep: any) => ep.episodeNumber);
    const uniqueNumbers = new Set(episodeNumbers);

    if (uniqueNumbers.size !== episodeNumbers.length) {
      uniqueEpisodeNumbers = false;
      errors.push(
        `❌ Duplicate episode numbers found (${episodeNumbers.length} episodes, ${uniqueNumbers.size} unique)`
      );
    }

    // 6. Sende Alert bei Fehlern
    if (errors.length > 0) {
      console.error("🚨 PODCAST INTEGRITY CHECK FAILED");
      console.error(errors.join("\n"));

      await notifyOwner({
        title: "🚨 Podcast Integrity Check Failed",
        content: `Validation errors:\n${errors.join("\n")}\n\nTimestamp: ${timestamp}`,
      }).catch((err) => {
        console.error("Failed to send notification:", err.message);
      });
    } else {
      console.log("✓ Podcast integrity check passed");
    }

    return {
      ok: errors.length === 0,
      timestamp,
      checks: {
        latestCount,
        totalEpisodes,
        validAudioUrls,
        validCoverImages,
        uniqueEpisodeNumbers,
        errors,
      },
    };
  } catch (err: any) {
    errors.push(`Exception: ${err.message}`);
    console.error("Podcast integrity check error:", err);

    await notifyOwner({
      title: "🚨 Podcast Integrity Check Exception",
      content: `Error: ${err.message}\n\nTimestamp: ${timestamp}`,
    }).catch((err) => {
      console.error("Failed to send notification:", err.message);
    });

    return {
      ok: false,
      timestamp,
      checks: {
        latestCount,
        totalEpisodes,
        validAudioUrls,
        validCoverImages,
        uniqueEpisodeNumbers,
        errors,
      },
    };
  }
}

// Exportiere für Cron-Jobs
export default validatePodcastIntegrity;
