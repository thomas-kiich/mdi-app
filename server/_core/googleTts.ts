/**
 * Google Cloud Text-to-Speech Helper
 * Stimme: de-DE-Chirp3-HD-Leda (weiblich, weich, meditativ)
 * Free Tier: 1 Million Zeichen/Monat gratis (Chirp3 HD)
 *
 * Authentifizierung über Dienstkonto (Service Account JWT)
 */

import { ENV } from "./env";

const TTS_API_URL = "https://texttospeech.googleapis.com/v1/text:synthesize";
export const TTS_VOICE_NAME = "de-DE-Chirp3-HD-Leda";
const LANGUAGE_CODE = "de-DE";

// ─── JWT-Token für Google API erstellen ──────────────────────────────────────

async function getAccessToken(): Promise<string> {
  const { googleTtsClientEmail, googleTtsPrivateKey, googleTtsPrivateKeyId } = ENV;

  if (!googleTtsClientEmail || !googleTtsPrivateKey) {
    throw new Error("Google TTS Credentials fehlen (GOOGLE_TTS_CLIENT_EMAIL / GOOGLE_TTS_PRIVATE_KEY)");
  }

  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT", kid: googleTtsPrivateKeyId };
  const payload = {
    iss: googleTtsClientEmail,
    scope: "https://www.googleapis.com/auth/cloud-platform",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };

  const encode = (obj: object) =>
    Buffer.from(JSON.stringify(obj)).toString("base64url");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload);
  const signingInput = `${headerB64}.${payloadB64}`;

  // Private Key importieren
  const pemKey = googleTtsPrivateKey.replace(/\\n/g, "\n");
  const keyData = pemKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");

  const binaryKey = Buffer.from(keyData, "base64");
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    Buffer.from(signingInput)
  );

  const signatureB64 = Buffer.from(signature).toString("base64url");
  const jwt = `${signingInput}.${signatureB64}`;

  // JWT gegen Access Token tauschen
  const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenResponse.ok) {
    const errBody = await tokenResponse.text();
    throw new Error(`Google OAuth Fehler ${tokenResponse.status}: ${errBody}`);
  }

  const tokenData = await tokenResponse.json() as { access_token: string };
  return tokenData.access_token;
}

// ─── TTS-Aufruf ──────────────────────────────────────────────────────────────

export interface SynthesizeOptions {
  /** Optionaler Callback zum Loggen der Nutzung (userId, Zeichenanzahl, Kontext) */
  onSuccess?: (zeichen: number) => void;
}

/**
 * Text in Sprache umwandeln mit MA-Stimme (Leda).
 * Gibt einen Buffer mit MP3-Audio zurück.
 */
export async function synthesizeSpeech(text: string, opts?: SynthesizeOptions): Promise<Buffer> {
  // Text auf max. 4500 Zeichen kürzen (Chirp3 HD Limit: 5000)
  const MAX_CHARS = 4500;
  let ttsText = text;
  if (ttsText.length > MAX_CHARS) {
    const cutoff = ttsText.lastIndexOf(".", MAX_CHARS);
    const cutoffAlt = Math.max(
      ttsText.lastIndexOf("!", MAX_CHARS),
      ttsText.lastIndexOf("?", MAX_CHARS)
    );
    const bestCut = Math.max(cutoff, cutoffAlt);
    ttsText = bestCut > 1000 ? ttsText.slice(0, bestCut + 1) : ttsText.slice(0, MAX_CHARS);
    console.log(`[GoogleTTS] Text von ${text.length} auf ${ttsText.length} Zeichen gekürzt`);
  }

  const accessToken = await getAccessToken();

  const abortController = new AbortController();
  const timeoutId = setTimeout(() => abortController.abort(), 60_000);

  let response: Response;
  try {
    response = await fetch(TTS_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        input: { text: ttsText },
        voice: {
          languageCode: LANGUAGE_CODE,
          name: TTS_VOICE_NAME,
        },
        audioConfig: {
          audioEncoding: "MP3",
          speakingRate: 0.65,   // Deutlich reduziert für trance-artige, meditative Wirkung (vorher: 0.75)
          // Hinweis: Chirp3 HD unterstützt keinen pitch-Parameter
          volumeGainDb: 0.0,
        },
      }),
      signal: abortController.signal,
    });
  } catch (fetchErr: unknown) {
    clearTimeout(timeoutId);
    const isTimeout = fetchErr instanceof Error && fetchErr.name === "AbortError";
    throw new Error(
      isTimeout
        ? "Google TTS Timeout – bitte erneut versuchen"
        : `Google TTS Verbindungsfehler: ${fetchErr instanceof Error ? fetchErr.message : String(fetchErr)}`
    );
  } finally {
    clearTimeout(timeoutId);
  }

  if (!response.ok) {
    let detail = "";
    try {
      const errBody = await response.json() as { error?: { message?: string } };
      detail = errBody?.error?.message ?? JSON.stringify(errBody);
    } catch {}
    throw new Error(`Google TTS API-Fehler ${response.status}${detail ? ": " + detail : ""}`);
  }

  const data = await response.json() as { audioContent: string };
  if (!data.audioContent) {
    throw new Error("Google TTS hat keinen Audio-Inhalt zurückgegeben");
  }

  // Logging-Callback aufrufen (fire-and-forget, Fehler werden nur geloggt)
  if (opts?.onSuccess) {
    try {
      opts.onSuccess(ttsText.length);
    } catch (logErr) {
      console.error("[GoogleTTS] Logging-Fehler (nicht kritisch):", logErr);
    }
  }

  console.log(`[GoogleTTS] Erfolgreich: ${ttsText.length} Zeichen, Stimme: ${TTS_VOICE_NAME}`);
  return Buffer.from(data.audioContent, "base64");
}
