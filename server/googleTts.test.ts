/**
 * Google Cloud TTS Credentials Test
 * Prüft ob die Dienstkonto-Credentials korrekt konfiguriert sind
 * und ein Access Token abgerufen werden kann.
 */
import { describe, it, expect } from "vitest";

describe("Google TTS Credentials", () => {
  it("sollte GOOGLE_TTS_CLIENT_EMAIL gesetzt haben", () => {
    const email = process.env.GOOGLE_TTS_CLIENT_EMAIL;
    expect(email).toBeTruthy();
    expect(email).toContain("@");
    expect(email).toContain("iam.gserviceaccount.com");
  });

  it("sollte GOOGLE_TTS_PRIVATE_KEY gesetzt haben", () => {
    const key = process.env.GOOGLE_TTS_PRIVATE_KEY;
    expect(key).toBeTruthy();
    // Prüfe ob es ein gültiger PEM-Key ist (mit oder ohne escaped \n)
    const normalized = key!.replace(/\\n/g, "\n");
    expect(normalized).toContain("BEGIN PRIVATE KEY");
    expect(normalized).toContain("END PRIVATE KEY");
  });

  it("sollte GOOGLE_TTS_PROJECT_ID gesetzt haben", () => {
    const projectId = process.env.GOOGLE_TTS_PROJECT_ID;
    expect(projectId).toBeTruthy();
    expect(projectId).toContain("gen-lang-client");
  });

  it("sollte einen gültigen Access Token von Google OAuth abrufen können", async () => {
    const clientEmail = process.env.GOOGLE_TTS_CLIENT_EMAIL!;
    const privateKeyRaw = process.env.GOOGLE_TTS_PRIVATE_KEY!;
    const privateKeyId = process.env.GOOGLE_TTS_PRIVATE_KEY_ID ?? "";

    expect(clientEmail).toBeTruthy();
    expect(privateKeyRaw).toBeTruthy();

    const now = Math.floor(Date.now() / 1000);
    const header = { alg: "RS256", typ: "JWT", kid: privateKeyId };
    const payload = {
      iss: clientEmail,
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

    const pemKey = privateKeyRaw.replace(/\\n/g, "\n");
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

    const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });

    expect(tokenResponse.ok).toBe(true);
    const tokenData = await tokenResponse.json() as { access_token?: string; error?: string };
    expect(tokenData.error).toBeUndefined();
    expect(tokenData.access_token).toBeTruthy();
    console.log("[Test] Google OAuth Access Token erfolgreich abgerufen ✓");
  }, 15_000); // 15s Timeout für Netzwerkanfrage
});
