// 12-Ton-Tabelle für MDI
// Quelle: Google Sheets (CSV)

export interface ToneData {
  name: string;
  frequency: number; // Hz (Grundfrequenz bei ~128-242 Hz)
  color: string; // CSS-Farbwert oder Name
  lightColorNm: string; // Wellenlänge in nm (ungefähr)
  character: string;
  geometry: string;
  // Dimensionen (0-10)
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

export const TONES: ToneData[] = [
  {
    name: "C",
    frequency: 128.43,
    color: "#228B22", // Grün (ForestGreen)
    lightColorNm: "grün",
    character: "fürsorglich",
    geometry: "kreis",
    dimensions: {
      intuitive: 5,
      intellectual: 2,
      sensitive: 10,
      spontaneous: 8,
      abstract: 5,
      structured: 5,
      material: 4,
      ideal: 8,
      social: 10,
      emotional: 10,
      selfReference: 2,
    },
    keywords: ["EMPATHIE", "SOZIAL"],
  },
  {
    name: "C#",
    frequency: 136.07,
    color: "#40E0D0", // Türkis (Turquoise)
    lightColorNm: "türkis",
    character: "religiös",
    geometry: "vertikale welle",
    dimensions: {
      intuitive: 5,
      intellectual: 3,
      sensitive: 9,
      spontaneous: 4,
      abstract: 7,
      structured: 7,
      material: 2,
      ideal: 10,
      social: 9,
      emotional: 3,
      selfReference: 5,
    },
    keywords: ["RELIGIÖS", "SENSIBEL"],
  },
  {
    name: "D",
    frequency: 144.16,
    color: "#87CEEB", // Hellblau (SkyBlue)
    lightColorNm: "hellblau",
    character: "materiell",
    geometry: "horizontaler pfeil",
    dimensions: {
      intuitive: 4,
      intellectual: 5,
      sensitive: 7,
      spontaneous: 7,
      abstract: 1,
      structured: 8,
      material: 10,
      ideal: 2,
      social: 6,
      emotional: 5,
      selfReference: 5,
    },
    keywords: ["PRAGMATISCH", "WELTLICH"],
  },
  {
    name: "D#",
    frequency: 152.74,
    color: "#00008B", // Tiefblau (DarkBlue)
    lightColorNm: "tiefblau",
    character: "forschend",
    geometry: "quadrat",
    dimensions: {
      intuitive: 3,
      intellectual: 7,
      sensitive: 1,
      spontaneous: 2,
      abstract: 1,
      structured: 10,
      material: 8,
      ideal: 8,
      social: 2,
      emotional: 1,
      selfReference: 2,
    },
    keywords: ["EMOTIONSFREI", "BESTÄNDIG"],
  },
  {
    name: "E",
    frequency: 161.82,
    color: "#8A2BE2", // Blauviolett (BlueViolet)
    lightColorNm: "blauviolett",
    character: "gebundeheit",
    geometry: "wellige quallenform",
    dimensions: {
      intuitive: 8,
      intellectual: 2,
      sensitive: 4,
      spontaneous: 1,
      abstract: 5,
      structured: 9,
      material: 1,
      ideal: 9,
      social: 6,
      emotional: 8,
      selfReference: 2,
    },
    keywords: ["KONDITIONIERUNG", "VERGANGENHEIT"],
  },
  {
    name: "F",
    frequency: 171.44,
    color: "#FF00FF", // Magenta
    lightColorNm: "magenta",
    character: "quelle",
    geometry: "fliessendes grenzenloses",
    dimensions: {
      intuitive: 10,
      intellectual: 1,
      sensitive: 6,
      spontaneous: 8,
      abstract: 10,
      structured: 1,
      material: 1,
      ideal: 8,
      social: 10,
      emotional: 4,
      selfReference: 1,
    },
    keywords: ["INTUITION", "LOSGELÖST"],
  },
  {
    name: "F#",
    frequency: 181.63,
    color: "#FF0000", // Rot
    lightColorNm: "rot",
    character: "risikobereit",
    geometry: "wellige pfeile in alle richtungen",
    dimensions: {
      intuitive: 9,
      intellectual: 4,
      sensitive: 5,
      spontaneous: 9,
      abstract: 7,
      structured: 1,
      material: 1,
      ideal: 3,
      social: 7,
      emotional: 7,
      selfReference: 8,
    },
    keywords: ["INSTINKT", "AUTODIDAKT"],
  },
  {
    name: "G",
    frequency: 192.43,
    color: "#FF4500", // Rotorange (OrangeRed)
    lightColorNm: "rotorange",
    character: "führungsanspruch",
    geometry: "pyramide",
    dimensions: {
      intuitive: 6,
      intellectual: 6,
      sensitive: 4,
      spontaneous: 3,
      abstract: 4,
      structured: 7,
      material: 6,
      ideal: 4,
      social: 5,
      emotional: 10,
      selfReference: 10,
    },
    keywords: ["FÜHRER", "CHARISMA"],
  },
  {
    name: "G#",
    frequency: 203.88,
    color: "#FFA500", // Gelborange (Orange)
    lightColorNm: "gelborange",
    character: "deatilfixiert",
    geometry: "feine linien",
    dimensions: {
      intuitive: 2,
      intellectual: 7,
      sensitive: 2,
      spontaneous: 2,
      abstract: 3,
      structured: 9,
      material: 7,
      ideal: 7,
      social: 1,
      emotional: 5,
      selfReference: 9,
    },
    keywords: ["DETAILFIXIERT", "GENAUIGKEITSANSPRUCH"],
  },
  {
    name: "A",
    frequency: 216.00,
    color: "#FFFF00", // Gelb
    lightColorNm: "gelb",
    character: "freiheitsanspruch, strukturfordernd",
    geometry: "stern",
    dimensions: {
      intuitive: 1,
      intellectual: 8,
      sensitive: 1,
      spontaneous: 1,
      abstract: 2,
      structured: 10,
      material: 8,
      ideal: 6,
      social: 2,
      emotional: 4,
      selfReference: 8,
    },
    keywords: ["FREIHEIT", "STRUKTURGEBEND"],
  },
  {
    name: "A#",
    frequency: 228.84,
    color: "#9ACD32", // Gelbgrün (YellowGreen)
    lightColorNm: "gelbgrün",
    character: "elitär intellektuell",
    geometry: "rechteck",
    dimensions: {
      intuitive: 1,
      intellectual: 10,
      sensitive: 2,
      spontaneous: 1,
      abstract: 1,
      structured: 9,
      material: 10,
      ideal: 7,
      social: 3,
      emotional: 5,
      selfReference: 9,
    },
    keywords: ["INTELLEKT", "ELITÄR"],
  },
  {
    name: "H",
    frequency: 242.45,
    color: "#808000", // Olive
    lightColorNm: "olive",
    character: "extremer leistungsanspruch",
    geometry: "konzentrierter schwarzer punkt",
    dimensions: {
      intuitive: 3,
      intellectual: 9,
      sensitive: 5,
      spontaneous: 1,
      abstract: 2,
      structured: 9,
      material: 6,
      ideal: 9,
      social: 4,
      emotional: 5,
      selfReference: 9,
    },
    keywords: ["LEISTUNG", "FORDERUNG"],
  },
];

// Hilfsfunktion: Frequenz zu Ton zuordnen
export function getToneFromFrequency(freq: number): { tone: ToneData; cents: number; diffHz: number } {
  if (!freq || freq <= 0) {
      return { tone: TONES[0], cents: 0, diffHz: 0 };
  }

  // Frequenz in den Bereich der Tabelle oktavieren (ca. 125-250 Hz)
  // TONES[0].frequency ist ~128 Hz
  // Wir nutzen 125 als untere Grenze, um C (128) sicher zu erwischen
  let normalizedFreq = freq;
  while (normalizedFreq < 125) normalizedFreq *= 2;
  while (normalizedFreq > 250) normalizedFreq /= 2;

  // Nächsten Ton finden
  let bestTone = TONES[0];
  let minDiff = Math.abs(normalizedFreq - TONES[0].frequency);

  for (const tone of TONES) {
    const diff = Math.abs(normalizedFreq - tone.frequency);
    if (diff < minDiff) {
      minDiff = diff;
      bestTone = tone;
    }
  }

  // Cent-Abweichung berechnen: 1200 * log2(f1 / f2)
  // Hier nehmen wir die normalisierte Frequenz im Vergleich zur Tonfrequenz
  const cents = 1200 * Math.log2(normalizedFreq / bestTone.frequency);

  return {
    tone: bestTone,
    cents: Math.round(cents),
    diffHz: normalizedFreq - bestTone.frequency
  };
}
