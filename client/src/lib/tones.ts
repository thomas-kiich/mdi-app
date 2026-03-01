// TONES.ts - Frequency Data and Metadata for MDI System
// Updated Color Logic: C = Green (Center of Spectrum)

export interface ToneData {
  name: string;
  frequency: number; // Ideal frequency in Hz (middle octave)
  color: string;     // Hex color code
  meaning: string;   // Short description/meaning
  geometry: string;  // Placeholder for generative art shape
  minFreq: number;   // Lower bound for detection
  maxFreq: number;   // Upper bound for detection
}

// Color Mapping Logic (Based on User Request: C = Green)
// We map the chromatic scale to the color wheel, anchoring C at Green.
// The user specified a range from Red-Violet to Blue-Violet.
// This implies a full spectral circle.

// Mapping (Approximate Physics/Synesthesia):
// C  = Green       (#22c55e) - The Center/Heart
// C# = Blue-Green  (#06b6d4)
// D  = Blue        (#3b82f6)
// D# = Indigo      (#6366f1)
// E  = Violet      (#8b5cf6) - "Blauviolett"
// F  = Red-Violet  (#d946ef) - "Rotviolett" (Magenta)
// F# = Red         (#ef4444)
// G  = Red-Orange  (#f97316)
// G# = Orange      (#fb923c)
// A  = Yellow-Orange (#eab308)
// A# = Yellow      (#facc15)
// H  = Yellow-Green (#84cc16)

export const TONES: ToneData[] = [
  {
    name: "C",
    frequency: 130.81, // C3
    color: "#22c55e", // Green
    meaning: "Stabilität, Erdung, Urvertrauen",
    geometry: "quadrat-basis",
    minFreq: 127.0, 
    maxFreq: 134.7
  },
  {
    name: "Cis",
    frequency: 138.59, // C#3
    color: "#06b6d4", // Cyan/Blue-Green
    meaning: "Verbindung, Fluss, Integration",
    geometry: "kreis-welle",
    minFreq: 134.7,
    maxFreq: 142.6
  },
  {
    name: "D",
    frequency: 146.83, // D3
    color: "#3b82f6", // Blue
    meaning: "Kreativität, Ausdruck, Kommunikation",
    geometry: "dreieck-spitze",
    minFreq: 142.6,
    maxFreq: 151.0
  },
  {
    name: "Dis",
    frequency: 155.56, // D#3
    color: "#6366f1", // Indigo/Blue-Violet
    meaning: "Klarheit, Vision, Intuition",
    geometry: "stern-strahl",
    minFreq: 151.0,
    maxFreq: 160.0
  },
  {
    name: "E",
    frequency: 164.81, // E3
    color: "#8b5cf6", // Violet (Blauviolett)
    meaning: "Transformation, Geist, Bewusstsein",
    geometry: "spirale-innen",
    minFreq: 160.0,
    maxFreq: 169.6
  },
  {
    name: "F",
    frequency: 174.61, // F3
    color: "#d946ef", // Fuchsia/Red-Violet (Rotviolett)
    meaning: "Liebe, Herzöffnung, Balance",
    geometry: "blume-leben",
    minFreq: 169.6,
    maxFreq: 179.8
  },
  {
    name: "Fis",
    frequency: 185.00, // F#3
    color: "#ef4444", // Red
    meaning: "Energie, Leidenschaft, Wille",
    geometry: "feuer-flamme",
    minFreq: 179.8,
    maxFreq: 190.5
  },
  {
    name: "G",
    frequency: 196.00, // G3
    color: "#f97316", // Orange-Red
    meaning: "Freude, Schöpferkraft, Sexualität",
    geometry: "sonne-strahl",
    minFreq: 190.5,
    maxFreq: 201.7
  },
  {
    name: "Gis",
    frequency: 207.65, // G#3
    color: "#fb923c", // Orange
    meaning: "Gemeinschaft, Zugehörigkeit, Wärme",
    geometry: "wabe-struktur",
    minFreq: 201.7,
    maxFreq: 213.6
  },
  {
    name: "A",
    frequency: 220.00, // A3
    color: "#eab308", // Yellow-Orange/Gold
    meaning: "Wissen, Intellekt, Macht",
    geometry: "pyramide-basis",
    minFreq: 213.6,
    maxFreq: 226.3
  },
  {
    name: "Ais",
    frequency: 233.08, // A#3
    color: "#facc15", // Yellow
    meaning: "Weisheit, Erleuchtung, Licht",
    geometry: "stern-acht",
    minFreq: 226.3,
    maxFreq: 239.7
  },
  {
    name: "H",
    frequency: 246.94, // B3
    color: "#84cc16", // Lime/Yellow-Green
    meaning: "Wachstum, Heilung, Harmonie",
    geometry: "baum-leben",
    minFreq: 239.7,
    maxFreq: 254.0
  }
];

// Helper to get tone from ANY frequency (mapping to nearest tone in any octave)
export function getToneFromFrequency(freq: number): { tone: ToneData, cents: number, diffHz: number } {
  const A4 = 440;
  const semitonesFromA4 = 12 * Math.log2(freq / A4);
  const noteIndex = Math.round(semitonesFromA4);
  const centsOff = (semitonesFromA4 - noteIndex) * 100;
  
  // Map noteIndex to our TONES array
  // TONES array starts at C.
  // A is index 9 in our array (if C=0).
  // A4 (index 0 relative to A4) is A.
  
  // Normalize noteIndex to 0-11 range where 0 = C
  // A is 9 semitones above C. So A should be index 9.
  // noteIndex is relative to A.
  // If noteIndex = 0 (A), we want index 9.
  // If noteIndex = 3 (C), we want index 0.
  // Formula: (noteIndex + 9) % 12
  
  let toneIndex = (noteIndex + 9) % 12;
  if (toneIndex < 0) toneIndex += 12;
  
  const tone = TONES[toneIndex];
  
  // Calculate the ideal frequency for this specific octave
  // Ideal freq = A4 * 2^(noteIndex/12)
  const idealFreq = A4 * Math.pow(2, noteIndex / 12);
  const diffHz = freq - idealFreq;
  
  return {
    tone,
    cents: centsOff,
    diffHz
  };
}
