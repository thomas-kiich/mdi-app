/**
 * Generiert das Sprecher-Audio für das KIICH Befindlichkeitstraining
 * Stimme: MA (Voxtral Mini TTS – Voice ID: 89bc29eb-c96b-44bd-8a0b-712d89ede7e0)
 * Stil: ruhig, einladend, meditativ – wie eine Einführung in eine Übung
 *
 * Ablauf des Befindlichkeitstrainings:
 * 1. Nutzer wählt einen der 12 Lichtklangtypen (Farbkreise)
 * 2. Beim Berühren erklingt der Ton der Lichtfarbe
 * 3. Detailbeschreibung erscheint
 * 4. Nutzer klickt "Training starten" → Ton läuft für die gewählte Dauer
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

// Sprechertext für das Befindlichkeitstraining
// Ruhig und einladend – kurze Sätze für natürlichen Fluss ohne Blobs
// "kich" für korrekte Aussprache
const SPRECHERTEXT = `Willkommen beim Befindlichkeitstraining.

Du siehst zwölf Lichtklangtypen.

Jede Farbe trägt eine eigene Frequenz und eine eigene Qualität.

Nimm dir einen Moment.

Lass die Farben auf dich wirken.

Berühre einen Lichtkreis. Du hörst den Klang dieser Lichtfarbe.

Darunter erscheint eine Beschreibung der Wirkung dieses Lichtklangtyps.

Wähle den Lichtklang, der deiner momentanen Befindlichkeit am nächsten kommt.

Wenn du ihn gefunden hast, klicke auf Training starten.

Der Ton begleitet dich dann für die gesamte Übungsdauer.

Lass ihn in deinen Körper einwirken. Atme ruhig. Sei einfach da.

Viel Freude beim Training.`;

async function generateAudio() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("❌ MISTRAL_API_KEY nicht gefunden in .env");
    process.exit(1);
  }

  console.log("🎙️ Generiere Befindlichkeitstraining-Audio mit MA-Stimme (Voxtral)...");
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
  const outputPath = path.join(__dirname, "../befindlichkeit-anleitung-ma-stimme.mp3");
  fs.writeFileSync(outputPath, audioBuffer);

  console.log(`✅ Audio gespeichert: ${outputPath}`);
  console.log(`📦 Dateigröße: ${(audioBuffer.length / 1024).toFixed(1)} KB`);
}

generateAudio().catch(console.error);
