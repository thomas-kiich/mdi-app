// 12-Ton-Tabelle für MDI (Benutzerdefiniert V2)
// Quelle: tontabelle-frequenzbänder2.csv
// Umfasst explizit definierte Bereiche für Tiefe Oktave (A=54Hz) und Mittlere Oktave (A=108Hz)

export interface ToneData {
  name: string;
  frequency: number; // Mittenfrequenz
  range: [number, number]; // [min, max]
  color: string;
  lightColorNm: string;
  character: string;
  geometry: string;
  dimensions: {
    intuitive: number;
    intellectual: number;
    sensitive: number;
    spontaneous: number;
    abstract: number;
    structured: number;
    material: number;
    ideal: number;
    social: number;
    emotional: number;
    selfReference: number;
  };
  keywords: string[];
}

// Basis-Daten (Farben, Charakter etc.) bleiben gleich
const TONE_META = [
  {
    name: "A",
    color: "#FFFF00", // Gelb
    lightColorNm: "gelb",
    character: "freiheitsanspruch, strukturfordernd",
    geometry: "stern",
    dimensions: { intuitive: 1, intellectual: 8, sensitive: 1, spontaneous: 1, abstract: 2, structured: 10, material: 8, ideal: 6, social: 2, emotional: 4, selfReference: 8 },
    keywords: ["FREIHEIT", "STRUKTURGEBEND"],
  },
  {
    name: "A#", // AIS
    color: "#9ACD32", // Gelbgrün
    lightColorNm: "gelbgrün",
    character: "elitär intellektuell",
    geometry: "rechteck",
    dimensions: { intuitive: 1, intellectual: 10, sensitive: 2, spontaneous: 1, abstract: 1, structured: 9, material: 10, ideal: 7, social: 3, emotional: 5, selfReference: 9 },
    keywords: ["INTELLEKT", "ELITÄR"],
  },
  {
    name: "H",
    color: "#808000", // Olive
    lightColorNm: "olive",
    character: "extremer leistungsanspruch",
    geometry: "konzentrierter schwarzer punkt",
    dimensions: { intuitive: 3, intellectual: 9, sensitive: 5, spontaneous: 1, abstract: 2, structured: 9, material: 6, ideal: 9, social: 4, emotional: 5, selfReference: 9 },
    keywords: ["LEISTUNG", "FORDERUNG"],
  },
  {
    name: "C",
    color: "#228B22", // Grün
    lightColorNm: "grün",
    character: "fürsorglich",
    geometry: "kreis",
    dimensions: { intuitive: 5, intellectual: 2, sensitive: 10, spontaneous: 8, abstract: 5, structured: 5, material: 4, ideal: 8, social: 10, emotional: 10, selfReference: 2 },
    keywords: ["EMPATHIE", "SOZIAL"],
  },
  {
    name: "C#", // CIS
    color: "#40E0D0", // Türkis
    lightColorNm: "türkis",
    character: "religiös",
    geometry: "vertikale welle",
    dimensions: { intuitive: 5, intellectual: 3, sensitive: 9, spontaneous: 4, abstract: 7, structured: 7, material: 2, ideal: 10, social: 9, emotional: 3, selfReference: 5 },
    keywords: ["RELIGIÖS", "SENSIBEL"],
  },
  {
    name: "D",
    color: "#87CEEB", // Hellblau
    lightColorNm: "hellblau",
    character: "materiell",
    geometry: "horizontaler pfeil",
    dimensions: { intuitive: 4, intellectual: 5, sensitive: 7, spontaneous: 7, abstract: 1, structured: 8, material: 10, ideal: 2, social: 6, emotional: 5, selfReference: 5 },
    keywords: ["PRAGMATISCH", "WELTLICH"],
  },
  {
    name: "D#", // DIS
    color: "#00008B", // Tiefblau
    lightColorNm: "tiefblau",
    character: "forschend",
    geometry: "quadrat",
    dimensions: { intuitive: 3, intellectual: 7, sensitive: 1, spontaneous: 2, abstract: 1, structured: 10, material: 8, ideal: 8, social: 2, emotional: 1, selfReference: 2 },
    keywords: ["EMOTIONSFREI", "BESTÄNDIG"],
  },
  {
    name: "E",
    color: "#8A2BE2", // Blauviolett
    lightColorNm: "blauviolett",
    character: "gebundeheit",
    geometry: "wellige quallenform",
    dimensions: { intuitive: 8, intellectual: 2, sensitive: 4, spontaneous: 1, abstract: 5, structured: 9, material: 1, ideal: 9, social: 6, emotional: 8, selfReference: 2 },
    keywords: ["KONDITIONIERUNG", "VERGANGENHEIT"],
  },
  {
    name: "F",
    color: "#FF00FF", // Magenta
    lightColorNm: "magenta",
    character: "quelle",
    geometry: "fliessendes grenzenloses",
    dimensions: { intuitive: 10, intellectual: 1, sensitive: 6, spontaneous: 8, abstract: 10, structured: 1, material: 1, ideal: 8, social: 10, emotional: 4, selfReference: 1 },
    keywords: ["INTUITION", "LOSGELÖST"],
  },
  {
    name: "F#", // FIS
    color: "#FF0000", // Rot
    lightColorNm: "rot",
    character: "risikobereit",
    geometry: "wellige pfeile in alle richtungen",
    dimensions: { intuitive: 9, intellectual: 4, sensitive: 5, spontaneous: 9, abstract: 7, structured: 1, material: 1, ideal: 3, social: 7, emotional: 7, selfReference: 8 },
    keywords: ["INSTINKT", "AUTODIDAKT"],
  },
  {
    name: "G",
    color: "#FF4500", // Rotorange
    lightColorNm: "rotorange",
    character: "führungsanspruch",
    geometry: "pyramide",
    dimensions: { intuitive: 6, intellectual: 6, sensitive: 4, spontaneous: 3, abstract: 4, structured: 7, material: 6, ideal: 4, social: 5, emotional: 10, selfReference: 10 },
    keywords: ["FÜHRER", "CHARISMA"],
  },
  {
    name: "G#", // GIS
    color: "#FFA500", // Gelborange
    lightColorNm: "gelborange",
    character: "deatilfixiert",
    geometry: "feine linien",
    dimensions: { intuitive: 2, intellectual: 7, sensitive: 2, spontaneous: 2, abstract: 3, structured: 9, material: 7, ideal: 7, social: 1, emotional: 5, selfReference: 9 },
    keywords: ["DETAILFIXIERT", "GENAUIGKEITSANSPRUCH"],
  },
];

// Frequenzdaten für die tiefe Oktave (Zeile 5 & 6 aus CSV)
// A=54, AIS=58.5, H=63, C=67.5, CIS=72, D=76.5, DIS=81, E=85.5, F=90, FIS=94.5, G=99, GIS=103.5
const LOWER_OCTAVE_FREQS = [
  { freq: 54.0, range: [51.75, 56.24] }, // A
  { freq: 58.5, range: [56.25, 60.74] }, // A#
  { freq: 63.0, range: [60.75, 65.24] }, // H
  { freq: 67.5, range: [65.25, 69.74] }, // C
  { freq: 72.0, range: [69.75, 74.24] }, // C#
  { freq: 76.5, range: [74.25, 78.74] }, // D
  { freq: 81.0, range: [78.75, 83.24] }, // D#
  { freq: 85.5, range: [83.25, 87.74] }, // E
  { freq: 90.0, range: [87.75, 92.24] }, // F
  { freq: 94.5, range: [92.25, 96.74] }, // F#
  { freq: 99.0, range: [96.75, 101.24] }, // G
  { freq: 103.5, range: [101.25, 105.74] }, // G#
];

// Frequenzdaten für die mittlere Oktave (Zeile 2 & 3 aus CSV)
// A=108, AIS=117, H=126, C=135, CIS=144, D=153, DIS=162, E=171, F=180, FIS=189, G=198, GIS=207
const MIDDLE_OCTAVE_FREQS = [
  { freq: 108.0, range: [103.5, 112.4] }, // A
  { freq: 117.0, range: [112.5, 121.4] }, // A#
  { freq: 126.0, range: [121.5, 130.4] }, // H
  { freq: 135.0, range: [130.5, 139.4] }, // C (Achtung: CSV sagt 131,5 Start, aber wir müssen lückenlos anschließen an H 130.4)
                                          // CSV sagt: 131,5-139,4. H geht bis 130.4. Lücke von 1.1 Hz?
                                          // Wir interpretieren "lückenlos" basierend auf der Logik: 130.5 Start.
  { freq: 144.0, range: [139.5, 148.4] }, // C#
  { freq: 153.0, range: [148.5, 157.4] }, // D
  { freq: 162.0, range: [157.5, 166.4] }, // D#
  { freq: 171.0, range: [166.5, 175.4] }, // E
  { freq: 180.0, range: [175.5, 184.4] }, // F
  { freq: 189.0, range: [184.5, 193.4] }, // F#
  { freq: 198.0, range: [193.5, 202.4] }, // G
  { freq: 207.0, range: [202.5, 211.4] }, // G#
];

// Zusammenbauen der TONES Liste (Erst Tief, dann Mittel)
export const TONES: ToneData[] = [
  // Tiefe Oktave
  ...TONE_META.map((tone, i) => ({
    ...tone,
    frequency: LOWER_OCTAVE_FREQS[i].freq,
    range: LOWER_OCTAVE_FREQS[i].range as [number, number],
    name: tone.name
  })),
  // Mittlere Oktave
  ...TONE_META.map((tone, i) => ({
    ...tone,
    frequency: MIDDLE_OCTAVE_FREQS[i].freq,
    range: MIDDLE_OCTAVE_FREQS[i].range as [number, number],
    name: tone.name
  }))
];

// Hilfsfunktion: Frequenz zu Ton zuordnen basierend auf CUSTOM BANDS
export function getToneFromFrequency(freq: number): { tone: ToneData; cents: number; diffHz: number } {
  if (!freq || freq <= 0) {
      return { tone: TONES[0], cents: 0, diffHz: 0 };
  }

  // 1. Normalisiere Frequenz in den Bereich der Tabelle (ca. 51.75 - 211.4 Hz)
  
  let normalizedFreq = freq;
  const minFreq = 51.75; 
  const maxFreq = 211.4;

  // Wenn die Frequenz sehr klein ist (z.B. 0), Abbruch
  if (normalizedFreq < 1) return { tone: TONES[0], cents: 0, diffHz: 0 };

  // Iterativ oktavieren
  // Toleranz für Rundungsfehler (0.01 Hz)
  const epsilon = 0.01;
  
  while (normalizedFreq > maxFreq + epsilon) {
    normalizedFreq /= 2;
  }
  
  while (normalizedFreq < minFreq - epsilon) {
    normalizedFreq *= 2;
  }

  // 2. Finde den passenden Ton in der Tabelle
  let bestTone = TONES[0]; // Fallback
  let found = false;
  
  for (const tone of TONES) {
    // Strikte Prüfung mit Epsilon für Floating Point Sicherheit
    // range[0] <= freq <= range[1]
    if (normalizedFreq >= tone.range[0] - epsilon && normalizedFreq <= tone.range[1] + epsilon) {
      bestTone = tone;
      found = true;
      break;
    }
  }

  // Fallback, falls knapp an der Grenze
  if (!found) {
    let minDiff = Number.MAX_VALUE;
    for (const tone of TONES) {
      const diff = Math.abs(normalizedFreq - tone.frequency);
      if (diff < minDiff) {
        minDiff = diff;
        bestTone = tone;
      }
    }
  }

  // 3. Berechne Abweichung
  const diffHz = normalizedFreq - bestTone.frequency;
  const cents = Math.round(1200 * Math.log2(normalizedFreq / bestTone.frequency));

  return {
    tone: bestTone,
    cents,
    diffHz
  };
}
