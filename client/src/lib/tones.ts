// TONES.ts - Frequency Data and Metadata for MDI System
// Updated with User's Specific Color Palette
// Order: Descending Chromatic Scale (E -> F)

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

export const TONES: ToneData[] = [
  {
    name: "E",
    frequency: 164.81, 
    color: "#8A2BE2", // Blauviolett (Blue-Violet)
    meaning: "Transformation, Geist",
    geometry: "spirale-innen",
    minFreq: 158.0,
    maxFreq: 168.0,
    planet: "-"
  },
  {
    name: "Dis",
    frequency: 153.00, 
    color: "#0a0a45", // Schwarzblau (Black-Blue / Midnight Blue - adjusted to be visible but very dark)
    meaning: "Klarheit, Vision",
    geometry: "stern-strahl",
    minFreq: 149.0,
    maxFreq: 158.0,
    planet: "-"
  },
  {
    name: "D",
    frequency: 144.72, // MARS
    color: "#4169E1", // Königsblau (Royal Blue)
    meaning: "Energie, Kommunikation",
    geometry: "dreieck-spitze",
    minFreq: 140.0,
    maxFreq: 149.0,
    planet: "Mars"
  },
  {
    name: "Cis",
    frequency: 136.10, // EARTH YEAR (OM)
    color: "#40E0D0", // Türkis (Turquoise)
    meaning: "Das Jahr, Om, Seele",
    geometry: "kreis-welle",
    minFreq: 132.0,
    maxFreq: 140.0,
    planet: "Erde (Jahr)"
  },
  {
    name: "C",
    frequency: 128.00, 
    color: "#008000", // Grün (Green)
    meaning: "Stabilität, Erdung, Herz-Zentrum",
    geometry: "quadrat-basis",
    minFreq: 124.0, 
    maxFreq: 132.0,
    planet: "Sedna (approx)"
  },
  {
    name: "H",
    frequency: 123.02, 
    color: "#808000", // Olive
    meaning: "Wachstum, Heilung",
    geometry: "baum-leben",
    minFreq: 118.0,
    maxFreq: 124.0,
    planet: "Sonne (Oktav)"
  },
  {
    name: "Ais",
    frequency: 229.22, 
    color: "#9ACD32", // Gelbgrün (Yellow-Green)
    meaning: "Kosmische Ordnung, Intellekt",
    geometry: "stern-acht",
    minFreq: 227.0, 
    maxFreq: 238.0,
    planet: "Mond (Meton)"
  },
  {
    name: "A",
    frequency: 221.23, // VENUS
    color: "#FFFF00", // Gelb (Yellow)
    meaning: "Liebe, Harmonie, Ästhetik",
    geometry: "pyramide-basis",
    minFreq: 215.0,
    maxFreq: 227.0,
    planet: "Venus"
  },
  {
    name: "Gis",
    frequency: 210.42, // MOON (Synodic)
    color: "#FFAE42", // Gelborange (Yellow-Orange)
    meaning: "Gefühl, Weiblichkeit",
    geometry: "wabe-struktur",
    minFreq: 200.0,
    maxFreq: 215.0,
    planet: "Mond (Synod.)"
  },
  {
    name: "G",
    frequency: 194.18, // EARTH DAY
    color: "#FF4500", // Rotorange (Red-Orange)
    meaning: "Dynamik, Kraft, Vitalität",
    geometry: "sonne-strahl",
    minFreq: 189.0,
    maxFreq: 200.0,
    planet: "Erde (Tag)"
  },
  {
    name: "Fis",
    frequency: 183.58, // JUPITER
    color: "#FF0000", // Rot (Red)
    meaning: "Wachstum, Erfolg",
    geometry: "feuer-flamme",
    minFreq: 178.0,
    maxFreq: 189.0,
    planet: "Jupiter"
  },
  {
    name: "F",
    frequency: 172.06, // PLATONIC YEAR
    color: "#FF00FF", // Magenta
    meaning: "Erleuchtung, Heiterkeit, Spirit",
    geometry: "blume-leben",
    minFreq: 168.0,
    maxFreq: 178.0,
    planet: "Platon. Jahr"
  }
];

// Helper to get tone from ANY frequency
export function getToneFromFrequency(freq: number): { tone: ToneData, cents: number, diffHz: number } {
  let normFreq = freq;
  while (normFreq < 120) normFreq *= 2;
  while (normFreq > 260) normFreq /= 2;

  let bestTone = TONES[0];
  let minDiff = Number.MAX_VALUE;

  for (const tone of TONES) {
      let toneFreq = tone.frequency;
      if (toneFreq > 200 && normFreq < 150) toneFreq /= 2;
      if (toneFreq < 140 && normFreq > 200) toneFreq *= 2;

      const diff = Math.abs(normFreq - toneFreq);
      if (diff < minDiff) {
          minDiff = diff;
          bestTone = tone;
      }
  }

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
