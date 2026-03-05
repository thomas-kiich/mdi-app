// TONES.ts - Frequency Data and Metadata for MDI System
// Updated with User's Specific Color Palette
// Order: Descending Chromatic Scale (E -> F)
// TUNING REFERENCE: A4 = 432 Hz

export interface ToneData {
  name: string;
  frequency: number; // Ideal frequency in Hz (middle octave)
  color: string;     // Hex color code
  meaning: string;   // Short description/meaning
  geometry: string;  // Placeholder for generative art shape
  minFreq: number;   // Lower bound for detection
  maxFreq: number;   // Upper bound for detection
  planet?: string;   // Associated planet/cycle (Cousto)
}

// User Requirement:
// E-blauviolett / DIS Schwarzblau / D königsblau / CIS trükis / C grün / H olive / AIS gelbgrün / A gelb / Gis gelborange / G rotorange / FIS rot / F magenta

// Calculation Basis: A4 = 432 Hz
// C4 (Middle C) = 256.87 Hz (approx) in 432 tuning

export const TONES: ToneData[] = [
  {
    name: "E",
    frequency: 161.82, // A4=432 -> E3 approx 161.82 (E4=323.64)
    color: "#8A2BE2", // Blauviolett (Blue-Violet)
    meaning: "Transformation, Geist",
    geometry: "spirale-innen",
    minFreq: 155.0,
    maxFreq: 165.0,
    planet: "-"
  },
  {
    name: "Dis",
    frequency: 152.73, // A4=432 -> Dis3 approx 152.73 (Dis4=305.47)
    color: "#0a0a45", // Schwarzblau (Black-Blue / Midnight Blue)
    meaning: "Klarheit, Vision",
    geometry: "stern-strahl",
    minFreq: 146.0,
    maxFreq: 155.0,
    planet: "-"
  },
  {
    name: "D",
    frequency: 144.16, // A4=432 -> D3 approx 144.16 (D4=288.33)
    color: "#4169E1", // Königsblau (Royal Blue)
    meaning: "Energie, Kommunikation",
    geometry: "dreieck-spitze",
    minFreq: 138.0,
    maxFreq: 146.0,
    planet: "Mars"
  },
  {
    name: "Cis",
    frequency: 136.07, // A4=432 -> Cis3 approx 136.07 (Cis4=272.14)
    color: "#40E0D0", // Türkis (Turquoise)
    meaning: "Das Jahr, Om, Seele",
    geometry: "kreis-welle",
    minFreq: 130.0,
    maxFreq: 138.0,
    planet: "Erde (Jahr)"
  },
  {
    name: "C",
    frequency: 128.43, // A4=432 -> C3 approx 128.43 (C4=256.87)
    color: "#008000", // Grün (Green)
    meaning: "Stabilität, Erdung, Herz-Zentrum",
    geometry: "quadrat-basis",
    minFreq: 122.0, 
    maxFreq: 130.0,
    planet: "Sedna (approx)"
  },
  {
    name: "H",
    frequency: 121.23, // A4=432 -> H2 approx 121.23 (H3=242.45)
    color: "#808000", // Olive
    meaning: "Wachstum, Heilung",
    geometry: "baum-leben",
    minFreq: 116.0,
    maxFreq: 122.0,
    planet: "Sonne (Oktav)"
  },
  {
    name: "Ais",
    frequency: 228.94, // A4=432 -> Ais3 approx 228.94
    color: "#9ACD32", // Gelbgrün (Yellow-Green)
    meaning: "Kosmische Ordnung, Intellekt",
    geometry: "stern-acht",
    minFreq: 222.0, 
    maxFreq: 235.0,
    planet: "Mond (Meton)"
  },
  {
    name: "A",
    frequency: 216.00, // A4=432 -> A3 = 216.00
    color: "#FFFF00", // Gelb (Yellow)
    meaning: "Liebe, Harmonie, Ästhetik",
    geometry: "pyramide-basis",
    minFreq: 210.0,
    maxFreq: 222.0,
    planet: "Venus"
  },
  {
    name: "Gis",
    frequency: 203.88, // A4=432 -> Gis3 approx 203.88
    color: "#FFAE42", // Gelborange (Yellow-Orange)
    meaning: "Gefühl, Weiblichkeit",
    geometry: "wabe-struktur",
    minFreq: 198.0,
    maxFreq: 210.0,
    planet: "Mond (Synod.)"
  },
  {
    name: "G",
    frequency: 192.43, // A4=432 -> G3 approx 192.43
    color: "#FF4500", // Rotorange (Red-Orange)
    meaning: "Dynamik, Kraft, Vitalität",
    geometry: "sonne-strahl",
    minFreq: 187.0,
    maxFreq: 198.0,
    planet: "Erde (Tag)"
  },
  {
    name: "Fis",
    frequency: 181.63, // A4=432 -> Fis3 approx 181.63
    color: "#FF0000", // Rot (Red)
    meaning: "Wachstum, Erfolg",
    geometry: "feuer-flamme",
    minFreq: 176.0,
    maxFreq: 187.0,
    planet: "Jupiter"
  },
  {
    name: "F",
    frequency: 171.44, // A4=432 -> F3 approx 171.44
    color: "#FF00FF", // Magenta
    meaning: "Erleuchtung, Heiterkeit, Spirit",
    geometry: "blume-leben",
    minFreq: 165.0,
    maxFreq: 176.0,
    planet: "Platon. Jahr"
  }
];

// Helper to get tone from ANY frequency
export function getToneFromFrequency(freq: number): { tone: ToneData, cents: number, diffHz: number } {
  let normFreq = freq;
  // Normalize to range around 120-260 Hz for detection
  while (normFreq < 120) normFreq *= 2;
  while (normFreq > 260) normFreq /= 2;

  let bestTone = TONES[0];
  let minDiff = Number.MAX_VALUE;

  for (const tone of TONES) {
      let toneFreq = tone.frequency;
      // Adjust tone reference to be in same octave as normFreq
      if (toneFreq > 200 && normFreq < 150) toneFreq /= 2;
      if (toneFreq < 140 && normFreq > 200) toneFreq *= 2;

      const diff = Math.abs(normFreq - toneFreq);
      if (diff < minDiff) {
          minDiff = diff;
          bestTone = tone;
      }
  }

  // Calculate cents deviation based on A4=432
  // We use the bestTone's frequency as the reference point
  let refFreq = bestTone.frequency;
  if (refFreq > 200 && normFreq < 150) refFreq /= 2;
  if (refFreq < 140 && normFreq > 200) refFreq *= 2;

  const cents = 1200 * Math.log2(normFreq / refFreq);
  const diffHz = normFreq - refFreq;

  return {
    tone: bestTone,
    cents,
    diffHz
  };
}
