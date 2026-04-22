import { ENV } from './server/_core/env.ts';
import fs from 'fs';

const VOXTRAL_API_URL = "https://api.mistral.ai/v1/audio/speech";
const VOXTRAL_MODEL = "voxtral-mini-tts-latest";
const MA_VOICE_ID = "89bc29eb-c96b-44bd-8a0b-712d89ede7e0";

const TEXT = `WIE, WANN und WARUM du trainieren solltest,

Das WIE,

Es gibt vier Grundregeln für das optimale Tun mit dem Befindlichkeitstraining,

Erstens: Sei für die wenigen Minuten des Trainierens voll im Tun, ohne Ablenkung,

Zweitens: Trage Sorge, dass du während der Trainingsession ungestört bist, an einem ruhigen Ort,

Drittens: Sei klar in der Entscheidung, welchen konkreten Persönlichkeitsbereich du trainierst, Kein Abweichen davon während des Trainings,

Viertens: Kein Training direkt nach einer Mahlzeit, Ideal ist eine Stunde Zwischenraum,

Fünftens: Höre dir die Gebrauchsanleitung im Trainingscenter an und setze die Vorgaben um,

Das WANN,

Generelle Empfehlung ist es, zumindest zu Beginn deiner Erfahrungen mit dem Befindlichkeitstraining, ein Lichtklangthema zu wählen und mindestens sieben Tage damit zu trainieren, So kannst du nachhaltige Wirkungen in deinem Verhaltenskonzept bewirken,

Es gibt vier Zeitfenster über den Tag verteilt, die für ein Befindlichkeitstraining empfohlen sind,

Als Morgen- und Abendritual: Entscheide dich zu Beginn für einen siebenminütigen Ablauf, Am besten schon auf deinem Schlafplatz, mit geschlossenen Augen, am Rücken liegend, Erinnere dich an den Lichtklang, überflieg kurz die essentiellen Textpassagen und visualisiere die Farbe vor deinem geistigen Auge,

Zu einer bestimmten Tageszeit, an der du das Training als regelmässiges Ritual einbaust,

Vor wichtigen Ereignissen: wie einem Vortrag, den du halten darfst, Einer wichtigen Besprechung, in der du besondere Konzentration und Durchsetzungskraft benötigst, Oder einer emotional herausfordernden Situation, in der du innere Unterstützung und Stabilität in kurzer Zeit brauchst, Für die jeweilige Situation wählst du den geeigneten Lichtklang, intuitiv, instinktiv oder verstandesmässig, so wie es im Moment für dich stimmig ist,

Das WARUM,

Die wesentlichsten Auswirkungen des Befindlichkeitstrainings,

Erstens: Über die von dir gewählte Lichtklangfrequenz aktivierst du den Sendekanal in deinem biologischen Kommunikationssystem, welcher dich direkt mit den angestrebten Qualitäten des beschriebenen Lichtklangs verbindet, Über Schwingungsfrequenzen steuert sich dein gesamtes Nervensystem aus, Es ist die grundlegende Art, wie Informationen in deinem Körper transportiert werden,

Zweitens: Die Produktion von Stickstoffmonoxid in den Nasenschleimhäuten ist eine hilfreiche Unterstützung für dein Immunsystem, Dieses Gas, das du mit dieser Atemtechnik intensiv produzierst, erweitert unter anderem deine Blutgefässe und ermöglicht so, dass der eingeatmete Sauerstoff leichter in die Zellen transportiert werden kann,

Drittens: Der Wirkungsgrad deines Stoffwechsels erhöht sich, da der Atemrhythmus, den du beim Training umsetzt, exakt darauf abgestimmt ist,

Viertens: Die Aktivierung des Vagusnervs bewirkt Entspannung im gesamten System, Deine Herzratenvariabilität wird reguliert, was wiederum unerwünschten Stress abbaut,

Fünftens: Durch die richtige Atemtechnik triggerst du das glymphatische System im Gehirn, wodurch eine Entschleunigung und Lockerung von Denkblockaden unterstützt wird,

Sechstens: Die sanften Vibrationen, die du durch das tiefe Summen erzeugst, massieren die inneren Organe und fördern tiefliegende feine Bewegungsabläufe,`;

const apiKey = ENV.mistralApiKey;
if (!apiKey) {
  console.error("FEHLER: MISTRAL_API_KEY nicht konfiguriert");
  process.exit(1);
}

console.log("Sende Anfrage an Voxtral API (MA-Stimme)...");
console.log("Text-Länge:", TEXT.length, "Zeichen");

const response = await fetch(VOXTRAL_API_URL, {
  method: "POST",
  headers: {
    "Authorization": `Bearer ${apiKey}`,
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    model: VOXTRAL_MODEL,
    input: TEXT,
    voice: MA_VOICE_ID,
    response_format: "mp3"
  })
});

if (!response.ok) {
  const errorText = await response.text();
  console.error(`API-Fehler ${response.status}: ${errorText.slice(0, 500)}`);
  process.exit(1);
}

const result = await response.json();
const audioB64 = result.audio_data;

if (!audioB64) {
  console.error("Kein audio_data in der Antwort:", JSON.stringify(result).slice(0, 200));
  process.exit(1);
}

const audioBuffer = Buffer.from(audioB64, "base64");
const outputPath = "/home/ubuntu/webdev-static-assets/bt-wie-wann-warum-ma-stimme.mp3";
fs.writeFileSync(outputPath, audioBuffer);
console.log(`✓ Audio gespeichert: ${outputPath} (${(audioBuffer.length / 1024).toFixed(0)} KB)`);
