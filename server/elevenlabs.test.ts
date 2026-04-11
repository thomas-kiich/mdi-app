import { describe, it, expect } from "vitest";

/**
 * ElevenLabs wurde durch Google Cloud TTS (de-DE-Chirp3-HD-Zephyr) ersetzt.
 * Diese Tests sind deaktiviert (ElevenLabs Free Tier ist auf Cloud-Servern gesperrt).
 * Siehe: server/googleTts.test.ts für die aktiven TTS-Tests.
 */
describe.skip("ElevenLabs API-Key Validierung (deaktiviert – Google TTS wird verwendet)", () => {
  it("sollte TTS mit dem API-Key und der Voice-ID aufrufen können", async () => {
    const apiKey = process.env.ELEVENLABS_API_KEY;
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    expect(apiKey, "ELEVENLABS_API_KEY muss gesetzt sein").toBeTruthy();
    expect(voiceId, "ELEVENLABS_VOICE_ID muss gesetzt sein").toBeTruthy();

    const res = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        text: "Test",
        model_id: "eleven_multilingual_v2",
        voice_settings: { stability: 0.5, similarity_boost: 0.75 },
      }),
    });

    expect(res.status, `TTS API antwortete mit ${res.status} — Key oder Voice-ID ungültig`).toBe(200);
    const contentType = res.headers.get("content-type") ?? "";
    expect(contentType, "Antwort sollte Audio-Daten enthalten").toContain("audio");
    console.log(`✓ ElevenLabs TTS funktioniert — Content-Type: ${contentType}`);
  });

  it("sollte die Voice-ID als gesetzten String haben", () => {
    const voiceId = process.env.ELEVENLABS_VOICE_ID;
    expect(voiceId, "ELEVENLABS_VOICE_ID muss gesetzt sein").toBeTruthy();
    expect(voiceId!.length, "Voice-ID sollte mindestens 10 Zeichen lang sein").toBeGreaterThanOrEqual(10);
    console.log(`✓ Voice-ID gesetzt: ${voiceId}`);
  });
});
