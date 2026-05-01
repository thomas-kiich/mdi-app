/**
 * Hook für Podcast-Datenbank-Validierung
 * 
 * Überprüft auf der Client-Seite:
 * - Mehrere Episoden mit isLatest=true (Fehler)
 * - Fehlende Episoden
 * - Ungültige Audio-URLs
 * 
 * Bei Fehlern: Warnung in Console + optionale Benachrichtigung
 */

import { useEffect } from "react";
import { useToast } from "./use-toast";

export interface PodcastEpisode {
  id: number;
  episodeNumber: string;
  catchphrase: string;
  subtitle: string;
  audioUrl: string;
  coverImageUrl: string;
  description?: string;
  isLatest: boolean;
  sortOrder: number;
  youtubeUrl?: string;
  spotifyUrl?: string;
}

export interface ValidationError {
  type: "critical" | "warning" | "info";
  message: string;
  episodes?: PodcastEpisode[];
}

export function usePodcastValidation(episodes: PodcastEpisode[] | undefined) {
  const { toast } = useToast();

  useEffect(() => {
    if (!episodes || episodes.length === 0) {
      return;
    }

    const errors: ValidationError[] = [];

    // 1. Überprüfe mehrere isLatest=true
    const latestEpisodes = episodes.filter((ep) => ep.isLatest);
    if (latestEpisodes.length > 1) {
      const error: ValidationError = {
        type: "critical",
        message: `⚠️ Datenbank-Fehler: ${latestEpisodes.length} Episoden sind als 'latest' markiert (erwartet: 1)`,
        episodes: latestEpisodes,
      };
      errors.push(error);
      console.error(error.message, latestEpisodes);
    }

    // 2. Überprüfe fehlende isLatest
    if (latestEpisodes.length === 0) {
      const error: ValidationError = {
        type: "warning",
        message: "⚠️ Keine Episode als 'latest' markiert",
      };
      errors.push(error);
      console.warn(error.message);
    }

    // 3. Überprüfe ungültige Audio-URLs
    const invalidAudioUrls = episodes.filter(
      (ep) => !ep.audioUrl || !ep.audioUrl.match(/^https?:\/\//)
    );
    if (invalidAudioUrls.length > 0) {
      const error: ValidationError = {
        type: "warning",
        message: `⚠️ ${invalidAudioUrls.length} Episode(n) haben ungültige Audio-URLs`,
        episodes: invalidAudioUrls,
      };
      errors.push(error);
      console.warn(error.message, invalidAudioUrls);
    }

    // 4. Überprüfe ungültige Cover-Bilder
    const invalidCoverImages = episodes.filter(
      (ep) => !ep.coverImageUrl || !ep.coverImageUrl.match(/^https?:\/\//)
    );
    if (invalidCoverImages.length > 0) {
      const error: ValidationError = {
        type: "warning",
        message: `⚠️ ${invalidCoverImages.length} Episode(n) haben ungültige Cover-Bilder`,
        episodes: invalidCoverImages,
      };
      errors.push(error);
      console.warn(error.message, invalidCoverImages);
    }

    // 5. Überprüfe Duplikate in Episode-Nummern
    const episodeNumbers = episodes.map((ep) => ep.episodeNumber);
    const uniqueNumbers = new Set(episodeNumbers);
    if (uniqueNumbers.size !== episodeNumbers.length) {
      const error: ValidationError = {
        type: "warning",
        message: `⚠️ Duplikate in Episode-Nummern gefunden`,
      };
      errors.push(error);
      console.warn(error.message);
    }

    // 6. Zeige kritische Fehler als Toast
    const criticalErrors = errors.filter((e) => e.type === "critical");
    if (criticalErrors.length > 0) {
      toast({
        title: "🚨 Podcast Datenbank-Fehler",
        description: criticalErrors[0].message,
      });
    }

    // 7. Logge alle Fehler
    if (errors.length > 0) {
      console.group("🔍 Podcast Validation Errors");
      errors.forEach((error) => {
        console.log(`[${error.type.toUpperCase()}] ${error.message}`);
      });
      console.groupEnd();
    }
  }, [episodes, toast]);

  return {
    isValid: true, // Placeholder für zukünftige Erweiterungen
  };
}
