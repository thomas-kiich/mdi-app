// TONES.ts - Frequency Data and Metadata for MDI System
// Updated with Hans Cousto's Cosmic Octave Frequencies & Natural Rainbow Color Mapping
// Order: Descending Chromatic Scale (E -> F) = Rainbow (Violet -> Red)

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
// "Der natürliche Farbverlauf des Regenbogens: VIOLETT-INDIGO-BLAU-GRÜN-GELB-ORANGE-ROT
// ... entspricht exakt der Tonfolge von E-DIS-D-CIS-C-H-AIS-A-GIS-G-FIS-F"

// Implementation Strategy:
// 1. We keep Cousto's frequencies for accuracy.
// 2. We apply the User's Color Mapping strictly.

export const TONES: ToneData[] = [
  {
    name: "E",
    frequency: 164.81, 
    color: "#8b5cf6", // VIOLET (Start)
    meaning: "Transformation, Geist, Scheitel-Chakra",
    geometry: "spirale-innen",
    minFreq: 158.0,
    maxFreq: 168.0,
    planet: "-"
  },
  {
    name: "Dis",
    frequency: 153.00, 
    color: "#6366f1", // INDIGO
    meaning: "Klarheit, Vision, Stirn-Chakra",
    geometry: "stern-strahl",
    minFreq: 149.0,
    maxFreq: 158.0,
    planet: "-"
  },
  {
    name: "D",
    frequency: 144.72, // MARS
    color: "#3b82f6", // BLUE
    meaning: "Energie, Kommunikation, Hals-Chakra",
    geometry: "dreieck-spitze",
    minFreq: 140.0,
    maxFreq: 149.0,
    planet: "Mars"
  },
  {
    name: "Cis",
    frequency: 136.10, // EARTH YEAR (OM)
    color: "#0d9488", // BLUE-GREEN (Turquoise)
    meaning: "Das Jahr, Om, Seele",
    geometry: "kreis-welle",
    minFreq: 132.0,
    maxFreq: 140.0,
    planet: "Erde (Jahr)"
  },
  {
    name: "C",
    frequency: 128.00, 
    color: "#22c55e", // GREEN (Heart Center)
    meaning: "Stabilität, Erdung, Herz-Chakra",
    geometry: "quadrat-basis",
    minFreq: 124.0, 
    maxFreq: 132.0,
    planet: "Sedna (approx)"
  },
  {
    name: "H",
    frequency: 123.02, // Using B (H) just below C
    color: "#84cc16", // YELLOW-GREEN
    meaning: "Wachstum, Heilung",
    geometry: "baum-leben",
    minFreq: 118.0,
    maxFreq: 124.0,
    planet: "Sonne (Oktav)"
  },
  {
    name: "Ais",
    frequency: 229.22, // Metonic Cycle (Moon) - Scaled down would be ~114.6
    color: "#facc15", // YELLOW
    meaning: "Kosmische Ordnung, Intellekt, Solarplexus",
    geometry: "stern-acht",
    minFreq: 227.0, // Keeping high octave definitions for detection logic
    maxFreq: 238.0,
    planet: "Mond (Meton)"
  },
  {
    name: "A",
    frequency: 221.23, // VENUS
    color: "#eab308", // YELLOW-ORANGE
    meaning: "Liebe, Harmonie, Ästhetik",
    geometry: "pyramide-basis",
    minFreq: 215.0,
    maxFreq: 227.0,
    planet: "Venus"
  },
  {
    name: "Gis",
    frequency: 210.42, // MOON (Synodic)
    color: "#fb923c", // ORANGE
    meaning: "Gefühl, Weiblichkeit, Sakral-Chakra",
    geometry: "wabe-struktur",
    minFreq: 200.0,
    maxFreq: 215.0,
    planet: "Mond (Synod.)"
  },
  {
    name: "G",
    frequency: 194.18, // EARTH DAY
    color: "#f97316", // RED-ORANGE
    meaning: "Dynamik, Kraft, Vitalität",
    geometry: "sonne-strahl",
    minFreq: 189.0,
    maxFreq: 200.0,
    planet: "Erde (Tag)"
  },
  {
    name: "Fis",
    frequency: 183.58, // JUPITER
    color: "#ef4444", // RED
    meaning: "Wachstum, Erfolg, Wurzel-Chakra",
    geometry: "feuer-flamme",
    minFreq: 178.0,
    maxFreq: 189.0,
    planet: "Jupiter"
  },
  {
    name: "F",
    frequency: 172.06, // PLATONIC YEAR
    color: "#9f1239", // DEEP RED (End of visible spectrum)
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
      // Handle the octave jump for low notes (F, F#, G) defined in higher octaves in the list
      // We need a robust way to compare. Let's compare against the tone.frequency AND tone.frequency/2 if needed.
      
      let toneFreq = tone.frequency;
      // If tone is defined in 200+ range (G, G#, A, A#, B) but normFreq is low (120-130), check half
      if (toneFreq > 200 && normFreq < 150) toneFreq /= 2;
      // If tone is defined in 120-190 range but normFreq is high, check double
      if (toneFreq < 140 && normFreq > 200) toneFreq *= 2;

      const diff = Math.abs(normFreq - toneFreq);
      if (diff < minDiff) {
          minDiff = diff;
          bestTone = tone;
      }
  }

  // Calculate cents relative to the specific planetary frequency
  // Need to use the specific octave matched above for accurate cents
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
