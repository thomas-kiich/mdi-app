// 12-Ton-Tabelle für MDI (Benutzerdefiniert)
// Quelle: tontabelle-frequenzbänder.csv (A=432Hz Basis, 9Hz Abstände)

export interface ToneData {
  name: string;
  frequency: number; // Mittenfrequenz aus CSV
  range: [number, number]; // [min, max] aus CSV
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

// Benutzerdefinierte Tabelle aus CSV
// A=108, AIS=117, H=126, C=135, CIS=144, D=153, DIS=162, E=171, F=180, FIS=189, G=198, GIS=207
// Bandbreite: +/- 4.5 Hz (9Hz Abstand)

export const TONES: ToneData[] = [
  {
    name: "A",
    frequency: 108.0,
    range: [103.5, 112.4],
    color: "#FFFF00", // Gelb
    lightColorNm: "gelb",
    character: "freiheitsanspruch, strukturfordernd",
    geometry: "stern",
    dimensions: { intuitive: 1, intellectual: 8, sensitive: 1, spontaneous: 1, abstract: 2, structured: 10, material: 8, ideal: 6, social: 2, emotional: 4, selfReference: 8 },
    keywords: ["FREIHEIT", "STRUKTURGEBEND"],
  },
  {
    name: "A#", // AIS
    frequency: 117.0,
    range: [112.5, 121.4],
    color: "#9ACD32", // Gelbgrün
    lightColorNm: "gelbgrün",
    character: "elitär intellektuell",
    geometry: "rechteck",
    dimensions: { intuitive: 1, intellectual: 10, sensitive: 2, spontaneous: 1, abstract: 1, structured: 9, material: 10, ideal: 7, social: 3, emotional: 5, selfReference: 9 },
    keywords: ["INTELLEKT", "ELITÄR"],
  },
  {
    name: "H",
    frequency: 126.0,
    range: [121.5, 130.4],
    color: "#808000", // Olive
    lightColorNm: "olive",
    character: "extremer leistungsanspruch",
    geometry: "konzentrierter schwarzer punkt",
    dimensions: { intuitive: 3, intellectual: 9, sensitive: 5, spontaneous: 1, abstract: 2, structured: 9, material: 6, ideal: 9, social: 4, emotional: 5, selfReference: 9 },
    keywords: ["LEISTUNG", "FORDERUNG"],
  },
  {
    name: "C",
    frequency: 135.0,
    range: [130.5, 139.4], // Korrigiert von 131.5 auf 130.5 für lückenlosen Anschluss an H (130.4)
    color: "#228B22", // Grün
    lightColorNm: "grün",
    character: "fürsorglich",
    geometry: "kreis",
    dimensions: { intuitive: 5, intellectual: 2, sensitive: 10, spontaneous: 8, abstract: 5, structured: 5, material: 4, ideal: 8, social: 10, emotional: 10, selfReference: 2 },
    keywords: ["EMPATHIE", "SOZIAL"],
  },
  {
    name: "C#", // CIS
    frequency: 144.0,
    range: [139.5, 148.4],
    color: "#40E0D0", // Türkis
    lightColorNm: "türkis",
    character: "religiös",
    geometry: "vertikale welle",
    dimensions: { intuitive: 5, intellectual: 3, sensitive: 9, spontaneous: 4, abstract: 7, structured: 7, material: 2, ideal: 10, social: 9, emotional: 3, selfReference: 5 },
    keywords: ["RELIGIÖS", "SENSIBEL"],
  },
  {
    name: "D",
    frequency: 153.0,
    range: [148.5, 157.4],
    color: "#87CEEB", // Hellblau
    lightColorNm: "hellblau",
    character: "materiell",
    geometry: "horizontaler pfeil",
    dimensions: { intuitive: 4, intellectual: 5, sensitive: 7, spontaneous: 7, abstract: 1, structured: 8, material: 10, ideal: 2, social: 6, emotional: 5, selfReference: 5 },
    keywords: ["PRAGMATISCH", "WELTLICH"],
  },
  {
    name: "D#", // DIS
    frequency: 162.0,
    range: [157.5, 166.4],
    color: "#00008B", // Tiefblau
    lightColorNm: "tiefblau",
    character: "forschend",
    geometry: "quadrat",
    dimensions: { intuitive: 3, intellectual: 7, sensitive: 1, spontaneous: 2, abstract: 1, structured: 10, material: 8, ideal: 8, social: 2, emotional: 1, selfReference: 2 },
    keywords: ["EMOTIONSFREI", "BESTÄNDIG"],
  },
  {
    name: "E",
    frequency: 171.0,
    range: [166.5, 175.4],
    color: "#8A2BE2", // Blauviolett
    lightColorNm: "blauviolett",
    character: "gebundeheit",
    geometry: "wellige quallenform",
    dimensions: { intuitive: 8, intellectual: 2, sensitive: 4, spontaneous: 1, abstract: 5, structured: 9, material: 1, ideal: 9, social: 6, emotional: 8, selfReference: 2 },
    keywords: ["KONDITIONIERUNG", "VERGANGENHEIT"],
  },
  {
    name: "F",
    frequency: 180.0,
    range: [175.5, 184.4],
    color: "#FF00FF", // Magenta
    lightColorNm: "magenta",
    character: "quelle",
    geometry: "fliessendes grenzenloses",
    dimensions: { intuitive: 10, intellectual: 1, sensitive: 6, spontaneous: 8, abstract: 10, structured: 1, material: 1, ideal: 8, social: 10, emotional: 4, selfReference: 1 },
    keywords: ["INTUITION", "LOSGELÖST"],
  },
  {
    name: "F#", // FIS
    frequency: 189.0,
    range: [184.5, 193.4],
    color: "#FF0000", // Rot
    lightColorNm: "rot",
    character: "risikobereit",
    geometry: "wellige pfeile in alle richtungen",
    dimensions: { intuitive: 9, intellectual: 4, sensitive: 5, spontaneous: 9, abstract: 7, structured: 1, material: 1, ideal: 3, social: 7, emotional: 7, selfReference: 8 },
    keywords: ["INSTINKT", "AUTODIDAKT"],
  },
  {
    name: "G",
    frequency: 198.0,
    range: [193.5, 202.4],
    color: "#FF4500", // Rotorange
    lightColorNm: "rotorange",
    character: "führungsanspruch",
    geometry: "pyramide",
    dimensions: { intuitive: 6, intellectual: 6, sensitive: 4, spontaneous: 3, abstract: 4, structured: 7, material: 6, ideal: 4, social: 5, emotional: 10, selfReference: 10 },
    keywords: ["FÜHRER", "CHARISMA"],
  },
  {
    name: "G#", // GIS
    frequency: 207.0,
    range: [202.5, 211.4],
    color: "#FFA500", // Gelborange
    lightColorNm: "gelborange",
    character: "deatilfixiert",
    geometry: "feine linien",
    dimensions: { intuitive: 2, intellectual: 7, sensitive: 2, spontaneous: 2, abstract: 3, structured: 9, material: 7, ideal: 7, social: 1, emotional: 5, selfReference: 9 },
    keywords: ["DETAILFIXIERT", "GENAUIGKEITSANSPRUCH"],
  },
];

// Hilfsfunktion: Frequenz zu Ton zuordnen basierend auf CUSTOM BANDS
export function getToneFromFrequency(freq: number): { tone: ToneData; cents: number; diffHz: number } {
  if (!freq || freq <= 0) {
      return { tone: TONES[0], cents: 0, diffHz: 0 };
  }

  // 1. Normalisiere Frequenz in den Bereich der Tabelle (ca. 103 - 212 Hz)
  // Die Tabelle deckt ca. eine Oktave ab (A2 bis G#3 bzw. A3 bis G#4 je nach Definition)
  // Wir nutzen 108 als Basis (A).
  
  let normalizedFreq = freq;
  const minFreq = 103.5; // Untergrenze A
  const maxFreq = 211.4; // Obergrenze G# (eigentlich bis zum nächsten A)

  // Solange Frequenz zu hoch, halbiere sie (Oktave runter)
  while (normalizedFreq > maxFreq) normalizedFreq /= 2;
  // Solange Frequenz zu tief, verdopple sie (Oktave hoch)
  while (normalizedFreq < minFreq) normalizedFreq *= 2;

  // 2. Finde den passenden Ton in der Tabelle
  let bestTone = TONES[0];
  
  for (const tone of TONES) {
    if (normalizedFreq >= tone.range[0] && normalizedFreq <= tone.range[1]) {
      bestTone = tone;
      break;
    }
  }

  // 3. Berechne Abweichung
  // Diff in Hz
  const diffHz = normalizedFreq - bestTone.frequency;
  
  // Diff in Cent
  // Formel: 1200 * log2(f_mess / f_ref)
  // Hier nehmen wir die normalisierte Frequenz vs. Tabellenfrequenz
  const cents = Math.round(1200 * Math.log2(normalizedFreq / bestTone.frequency));

  return {
    tone: bestTone,
    cents,
    diffHz
  };
}
