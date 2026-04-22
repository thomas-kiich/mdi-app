/**
 * Voxtral TTS Helper — MA's geklonte Stimme via Mistral API
 * Modell: voxtral-mini-tts-latest
 * Voice-ID: 89bc29eb-c96b-44bd-8a0b-712d89ede7e0 (MA - Meditativ)
 */

import { ENV } from "./env";

const VOXTRAL_API_URL = "https://api.mistral.ai/v1/audio/speech";
const VOXTRAL_MODEL = "voxtral-mini-tts-latest";
const MA_VOICE_ID = "89bc29eb-c96b-44bd-8a0b-712d89ede7e0";
const MAX_TEXT_LENGTH = 8000; // Erhöht für vollständige Einschlaf-Geschichten (vorher: 2500)
const TIMEOUT_MS = 180_000; // 3 Minuten für lange Texte

/**
 * Fügt nach Satzenden eine meditativ Pause ein.
 * Technik: Punkt/Ausrufe/Fragezeichen wird durch Komma ersetzt —
 * Voxtral macht bei Komma eine natürliche Atempause (wie bei Beistrichen
 * innerhalb der Sätze, die bereits gut funktionieren).
 * Das Satzzeichen wird durch ein Komma ersetzt, damit kein Sonderzeichen
 * vorgelesen wird.
 */
function fuegeSprechpausenEin(text: string): string {
  // Satzende (. ! ?) gefolgt von Leerzeichen + Großbuchstabe:
  // Satzzeichen durch Komma ersetzen — Voxtral pausiert bei Komma natürlich
  return text
    .replace(/([.!?])(\s+)([A-ZÄÖÜ\u00C0-\u00DC])/g, ', $3');
}

/**
 * Kürzt Text auf maximal MAX_TEXT_LENGTH Zeichen,
 * schneidet am letzten Satzende ab.
 */
function kuerzeText(text: string): string {
  if (text.length <= MAX_TEXT_LENGTH) return text;
  const gekuerzt = text.slice(0, MAX_TEXT_LENGTH);
  const letzterSatz = Math.max(
    gekuerzt.lastIndexOf(". "),
    gekuerzt.lastIndexOf("! "),
    gekuerzt.lastIndexOf("? "),
    gekuerzt.lastIndexOf(".\n"),
  );
  return letzterSatz > MAX_TEXT_LENGTH * 0.7
    ? gekuerzt.slice(0, letzterSatz + 1)
    : gekuerzt;
}

export interface VoxtralTtsOptions {
  text: string;
  onLog?: (zeichenAnzahl: number) => Promise<void>;
}

export async function generiereAudioMitVoxtral(
  options: VoxtralTtsOptions,
): Promise<Buffer> {
  const { text, onLog } = options;
  const apiKey = ENV.mistralApiKey;

  if (!apiKey) {
    throw new Error(
      "MISTRAL_API_KEY nicht konfiguriert. Bitte in den Secrets eintragen.",
    );
  }

  // Sprechpausen einfügen ("..." nach Satzenden) für meditativen Rhythmus
  const textMitPausen = fuegeSprechpausenEin(text);
  const gekuerzterText = kuerzeText(textMitPausen);
  const zeichenAnzahl = gekuerzterText.length;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(VOXTRAL_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: VOXTRAL_MODEL,
        input: gekuerzterText,
        voice: MA_VOICE_ID,
        response_format: "mp3",
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text();
      if (response.status === 401) {
        throw new Error(
          `Voxtral API-Fehler 401: Ungültiger API-Key. Bitte MISTRAL_API_KEY prüfen.`,
        );
      }
      throw new Error(
        `Voxtral API-Fehler ${response.status}: ${errorText.slice(0, 200)}`,
      );
    }

    const result = (await response.json()) as { audio_data?: string };
    const audioB64 = result.audio_data;

    if (!audioB64) {
      throw new Error("Voxtral API hat kein Audio zurückgegeben.");
    }

    const audioBuffer = Buffer.from(audioB64, "base64");

    // Logging (nicht-blockierend)
    if (onLog) {
      onLog(zeichenAnzahl).catch(() => {});
    }

    return audioBuffer;
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new Error(
        `Voxtral TTS Timeout nach ${TIMEOUT_MS / 1000}s. Text war ${zeichenAnzahl} Zeichen lang.`,
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}
