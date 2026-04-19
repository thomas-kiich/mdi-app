/**
 * Generiert das Sprecher-Audio für das KIICH Registrierungs-Video
 * Stimme: MA (Voxtral Mini TTS – Voice ID: 89bc29eb-c96b-44bd-8a0b-712d89ede7e0)
 * Sprechtempo: etwas schneller als Momentaufnahme (keine Sprechpausen-Umwandlung)
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const VOXTRAL_API_URL = "https://api.mistral.ai/v1/audio/speech";
const VOXTRAL_MODEL = "voxtral-mini-tts-latest";
const MA_VOICE_ID = "89bc29eb-c96b-44bd-8a0b-712d89ede7e0";

// Sprechertext für das Registrierungs-Video
// Etwas schneller als Momentaufnahme – daher keine künstlichen Pausen
const SPRECHERTEXT = `Willkommen bei KIICH. Die Plattform für deine Persönlichkeitsentfaltung im KI-Zeitalter.

So erstellst du deinen kostenlosen Account in weniger als einer Minute.

Schritt eins. Lies die Datenschutzerklärung und setze das Häkchen bei der Einwilligung.

Schritt zwei. Klicke auf den Button "Jetzt kostenlos bei KIICH starten".

Schritt drei. Gib deine E-Mail-Adresse ein. Keine Kreditkarte, kein Abo.

Schritt vier. Öffne die Bestätigungs-E-Mail in deinem Postfach und klicke auf den Link.

Du wirst automatisch zurück zu KIICH geleitet und kannst sofort loslegen.

Willkommen in deiner Reise.`;

async function generateAudio() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("❌ MISTRAL_API_KEY nicht gefunden in .env");
    process.exit(1);
  }

  console.log("🎙️ Generiere Audio mit MA-Stimme (Voxtral)...");
  console.log(`📝 Text: ${SPRECHERTEXT.length} Zeichen`);

  const response = await fetch(VOXTRAL_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: VOXTRAL_MODEL,
      input: SPRECHERTEXT,
      voice: MA_VOICE_ID,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error(`❌ Voxtral API-Fehler ${response.status}: ${errorText}`);
    process.exit(1);
  }

  const result = await response.json();
  const audioB64 = result.audio_data;

  if (!audioB64) {
    console.error("❌ Voxtral hat kein Audio zurückgegeben:", JSON.stringify(result));
    process.exit(1);
  }

  const audioBuffer = Buffer.from(audioB64, "base64");
  const outputPath = path.join(__dirname, "../registrierung-anleitung-ma-stimme.mp3");
  fs.writeFileSync(outputPath, audioBuffer);

  console.log(`✅ Audio gespeichert: ${outputPath}`);
  console.log(`📦 Dateigröße: ${(audioBuffer.length / 1024).toFixed(1)} KB`);
}

generateAudio().catch(console.error);
