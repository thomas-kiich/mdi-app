// TONES.ts - Frequency Data and Metadata for MDI System
// Updated with Hans Cousto's Cosmic Octave Frequencies & Colors
// Source: Planetware / Hans Cousto

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

// Cousto Mapping Analysis:
// 1. Earth Day (Sonnentag) = 194.18 Hz (G) -> Red-Orange
// 2. Earth Year (Trop. Jahr) = 136.10 Hz (C#) -> Blue-Green (Türkis)
// 3. Platonic Year = 172.06 Hz (F) -> Red-Violet
// 4. Sun Tone = 126.22 Hz (H/C border, usually H) -> Yellow-Green
// 5. Moon (Synod.) = 210.42 Hz (G#) -> Orange

// User Requirement: C = Green.
// In Cousto's system:
// C# (136.10 Hz) is Blue-Green (Türkis).
// H (126.22 Hz, Sun) is Yellow-Green.
// So C (approx 128-130 Hz) sits exactly between Yellow-Green and Blue-Green -> GREEN.
// This confirms the user's intuition: C = Green is harmonically consistent with the Cosmic Octave.

// We will use Cousto's precise Hz values where they align with notes, and interpolate for the rest based on A=440 (or rather A derived from Cousto's C#=136.10).
// Actually, Cousto's tuning is A=432.10 Hz (derived from C#=136.10).
// Let's stick to the user's desire for the "Color Music" mapping.

export const TONES: ToneData[] = [
  {
    name: "C",
    frequency: 128.00, // Derived approx from Cousto gap between Sun(H) and Earth Year(C#)
    color: "#22c55e", // Green (Cousto: Gap between Yellow-Green and Blue-Green)
    meaning: "Stabilität, Erdung, Urvertrauen",
    geometry: "quadrat-basis",
    minFreq: 124.0, 
    maxFreq: 132.0,
    planet: "Sedna (approx)"
  },
  {
    name: "Cis",
    frequency: 136.10, // EARTH YEAR (OM)
    color: "#0d9488", // Blue-Green (Türkis)
    meaning: "Das Jahr, Om, Entspannung, Seele",
    geometry: "kreis-welle",
    minFreq: 132.0,
    maxFreq: 140.0,
    planet: "Erde (Jahr)"
  },
  {
    name: "D",
    frequency: 144.72, // MARS
    color: "#3b82f6", // Blue
    meaning: "Energie, Durchsetzung, Willenskraft",
    geometry: "dreieck-spitze",
    minFreq: 140.0,
    maxFreq: 149.0,
    planet: "Mars"
  },
  {
    name: "Dis",
    frequency: 153.00, // Approx (Saturn is 147.85 D, Jupiter 183.58 F#)
    color: "#6366f1", // Indigo
    meaning: "Klarheit, Vision, Intuition",
    geometry: "stern-strahl",
    minFreq: 149.0,
    maxFreq: 158.0,
    planet: "-"
  },
  {
    name: "E",
    frequency: 164.81, // Standard E (No direct planet match in this octave)
    color: "#8b5cf6", // Violet
    meaning: "Transformation, Geist",
    geometry: "spirale-innen",
    minFreq: 158.0,
    maxFreq: 168.0,
    planet: "-"
  },
  {
    name: "F",
    frequency: 172.06, // PLATONIC YEAR
    color: "#d946ef", // Red-Violet (Magenta)
    meaning: "Erleuchtung, Heiterkeit, Spirit",
    geometry: "blume-leben",
    minFreq: 168.0,
    maxFreq: 178.0,
    planet: "Platon. Jahr"
  },
  {
    name: "Fis",
    frequency: 183.58, // JUPITER (actually F# - 13 cent)
    color: "#ef4444", // Red
    meaning: "Wachstum, Erfolg, Gerechtigkeit",
    geometry: "feuer-flamme",
    minFreq: 178.0,
    maxFreq: 189.0,
    planet: "Jupiter"
  },
  {
    name: "G",
    frequency: 194.18, // EARTH DAY
    color: "#f97316", // Red-Orange
    meaning: "Dynamik, Kraft, Vitalität",
    geometry: "sonne-strahl",
    minFreq: 189.0,
    maxFreq: 200.0,
    planet: "Erde (Tag)"
  },
  {
    name: "Gis",
    frequency: 210.42, // MOON (Synodic)
    color: "#fb923c", // Orange
    meaning: "Gefühl, Weiblichkeit, Zyklus",
    geometry: "wabe-struktur",
    minFreq: 200.0,
    maxFreq: 215.0,
    planet: "Mond (Synod.)"
  },
  {
    name: "A",
    frequency: 221.23, // VENUS
    color: "#eab308", // Yellow-Orange
    meaning: "Liebe, Harmonie, Ästhetik",
    geometry: "pyramide-basis",
    minFreq: 215.0,
    maxFreq: 227.0,
    planet: "Venus"
  },
  {
    name: "Ais",
    frequency: 229.22, // Metonic Cycle (Moon)
    color: "#facc15", // Yellow
    meaning: "Kosmische Ordnung, Intellekt",
    geometry: "stern-acht",
    minFreq: 227.0,
    maxFreq: 238.0,
    planet: "Mond (Meton)"
  },
  {
    name: "H",
    frequency: 246.04, // Apsiden (Moon) approx, or Sun 126.22 (Low H)
    color: "#84cc16", // Yellow-Green
    meaning: "Wachstum, Heilung",
    geometry: "baum-leben",
    minFreq: 238.0,
    maxFreq: 254.0,
    planet: "Sonne (Oktav)"
  }
];

// Helper to get tone from ANY frequency
export function getToneFromFrequency(freq: number): { tone: ToneData, cents: number, diffHz: number } {
  // Simple closest match logic for now, as the intervals are irregular (Planetary)
  // We normalize input freq to the target octave range (approx 128 - 250 Hz)
  
  let normFreq = freq;
  while (normFreq < 120) normFreq *= 2;
  while (normFreq > 260) normFreq /= 2;

  let bestTone = TONES[0];
  let minDiff = Number.MAX_VALUE;

  for (const tone of TONES) {
      const diff = Math.abs(normFreq - tone.frequency);
      if (diff < minDiff) {
          minDiff = diff;
          bestTone = tone;
      }
  }

  // Calculate cents relative to the specific planetary frequency
  const cents = 1200 * Math.log2(normFreq / bestTone.frequency);
  const diffHz = normFreq - bestTone.frequency;

  return {
    tone: bestTone,
    cents,
    diffHz
  };
}
