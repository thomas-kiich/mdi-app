/**
 * Generiert das Einführungs-Audio für das KIICH Methode-36-Training
 * Stimme: MA (Voxtral Mini TTS – Voice ID: 89bc29eb-c96b-44bd-8a0b-712d89ede7e0)
 * Stil: klar, freundlich, anleitend – wie eine Einführung in eine Übung
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

// Sprechertext für das Methode-36-Training (Version 3 – Yohn/Yohntraining)
const SPRECHERTEXT = `Hallo.
Willkommen im Trainingscenter.
Ich gebe dir hier eine kurze Einführung, wie du optimal mit Methode sechsunddreissig agieren kannst.

Eins. Du siehst auf dem Display das Pulsmodul. Es ist wie ein Uhrzeigerblatt aufgebaut und markiert sechs Abschnitte mit jeweils einer Länge von zehn Sekunden. Ein vollständiger Durchlauf benötigt somit eine Minute.

Zwei. Das Uhrzeigerblatt ist in der Lichtfarbe gestaltet, die du davor bewusst ausgewählt hast. Die Charakterbeschreibung hast du daher schon nachgelesen. Erinnere dich bitte nochmal an die Befindlichkeit und das Potential, das du nun durch das Training aktiv schalten möchtest.

Drei. Den Klang den du bei diesem Training hörst, solltest du in der Phase des Tönens mit deiner Stimme mitsummen. Da Männerstimmen naturgemäss tiefer klingen als Frauenstimmen, hast du die Möglichkeit deine Stimmlage entsprechend vorher einzustellen. Du findest den Stimmbalken dazu am unteren Ende des Kreissymbols. Klicke einfach an, ob du die männliche oder die weibliche Stimmlage bevorzugst.

Vier. Unter dem Stimmbalken findest du den Bereich zum Einstellen der gewünschten Trainingsdauer. Du kannst wählen zwischen sieben, zwölf und einundzwanzig Minuten. Zum Einstieg und für Aktivierungen zwischendurch während deines Alltags empfehle ich dir den Sieben-Minuten-Button zu wählen. Dieser ist auch voreingestellt.

Fünf. Bevor du startest kannst du noch wählen, ob du ein natürliches Wasserplätschern im Hintergrund hören möchtest. Du findest den Einstellknopf oben links. Er ist mit einem Wellensymbol in blauer Farbe dargestellt. Wenn du ihn anklickst, kannst du die Lautstärke justieren und ihn generell aktivieren oder eben nicht.

Sechs. Du hast die Wahl, das Training im Liegen oder in sitzender Haltung auszuführen. Wenn du als Fortgeschrittener das Yohntraining aufnimmst, erhältst du zu den jeweiligen Intensitätsstufen konkrete Anweisungen der Körperposition.

Sieben. Wenn du nun bereit bist, kannst du den Startbutton aktivieren und mit dem Training beginnen. Du hast in jedem Moment einen Überblick des Zeitablaufs. Einerseits siehst du oben rechts einen Timer rückwärts ablaufen, anderseits siehst du unter dem Start-Pausebutton den Zykluszähler.

Acht. Mit dem Starten beginnt der Ablauf des optimalen Atemzyklus von sechs Atemzügen pro Minute. Die Aufteilung ist wie folgt vorgegeben: Ein Impuls Einatmen. Ein Impuls Atem halten. Drei Impulse Summen. Ein Impuls halten. Du kannst diesen Rhythmus sowohl optisch einsehen wie auch akustisch wahrnehmen.

Neun. Wenn du Sicherheit im rhythmischen Tun erlangt hast, kannst du deine Augen schliessen. Erinnere dich an die Intention des Lichtklangs, also warum du dieses Training absolvierst. Nimm vor dem Schliessen der Augen bewusst und intensiv die Lichtfarbe in dein Bewusstsein auf und versuche sie vor deinem geistigen Auge zu visualisieren. Du kannst während des Trainings kurz die Augen öffnen um die Lichtfarbe wieder wahrzunehmen, wenn sie vor deinem geistigen Auge verblassen sollte.

Zehn. Wenn du noch kein Yohntraining absolvierst, reicht es zunächst, den Klang möglichst genau in der vorgegebenen Tonhöhe mitzusummen. Das Mantra Yohn verwende erst, wenn du mit dem Yohntraining starten solltest. Du erhältst dann genaue Instruktionen wie du damit hochwertig arbeiten kannst.

Elf. Nun viel Erfrischung, Spass und Gewinn für dein Training. Leg los.`;

async function generateAudio() {
  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    console.error("❌ MISTRAL_API_KEY nicht gefunden in .env");
    process.exit(1);
  }

  console.log("🎙️ Generiere Methode-36-Einführungsaudio mit MA-Stimme (Voxtral)...");
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

  const contentType = response.headers.get('content-type') || '';
  let buffer;
  if (contentType.includes('application/json')) {
    // Voxtral gibt JSON mit Base64-kodiertem Audio zurück
    const json = await response.json();
    const base64 = json.audio_data || json.data || json.audio;
    buffer = Buffer.from(base64, 'base64');
  } else {
    const arrayBuffer = await response.arrayBuffer();
    buffer = Buffer.from(arrayBuffer);
  }

  const outputPath = "/home/ubuntu/webdev-static-assets/methode36-intro.mp3";
  fs.writeFileSync(outputPath, buffer);

  console.log(`✅ Audio gespeichert: ${outputPath}`);
  console.log(`📦 Dateigrösse: ${(buffer.length / 1024).toFixed(1)} KB`);
}

generateAudio().catch(console.error);
