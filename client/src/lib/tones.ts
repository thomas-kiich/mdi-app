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

export interface ColorSegment {
  id: string;
  x: number;
  y: number;
  color: string;
  rgb: [number, number, number];
}

// 96 Color Segments from FARBLICHTFELD_96
export const COLOR_SEGMENTS: ColorSegment[] = [
  { id: "1_25", x: 1, y: 25, color: "#dacef1", rgb: [218, 206, 241] },
  { id: "2_25", x: 2, y: 25, color: "#d7ceea", rgb: [215, 206, 234] },
  { id: "3_25", x: 3, y: 25, color: "#d2d4eb", rgb: [210, 212, 235] },
  { id: "4_25", x: 4, y: 25, color: "#c9d8ec", rgb: [201, 216, 236] },
  { id: "5_25", x: 5, y: 25, color: "#c8d8f6", rgb: [200, 216, 246] },
  { id: "6_25", x: 6, y: 25, color: "#cae0fb", rgb: [202, 224, 251] },
  { id: "7_25", x: 7, y: 25, color: "#c1e6ec", rgb: [193, 230, 236] },
  { id: "8_25", x: 8, y: 25, color: "#c4eeea", rgb: [196, 238, 234] },
  { id: "9_25", x: 9, y: 25, color: "#cce9d9", rgb: [204, 233, 217] },
  { id: "10_25", x: 10, y: 25, color: "#e0ecc2", rgb: [224, 236, 194] },
  { id: "11_25", x: 11, y: 25, color: "#dee6d6", rgb: [222, 230, 214] },
  { id: "12_25", x: 12, y: 25, color: "#dbe8cd", rgb: [219, 232, 205] },
  { id: "13_25", x: 13, y: 25, color: "#e5eccb", rgb: [229, 236, 203] },
  { id: "14_25", x: 14, y: 25, color: "#f1eec6", rgb: [241, 238, 198] },
  { id: "15_25", x: 15, y: 25, color: "#fff7d6", rgb: [255, 247, 214] },
  { id: "16_25", x: 16, y: 25, color: "#ffefd6", rgb: [255, 239, 214] },
  { id: "17_25", x: 17, y: 25, color: "#ffe4d3", rgb: [255, 228, 211] },
  { id: "18_25", x: 18, y: 25, color: "#ffddc8", rgb: [255, 221, 200] },
  { id: "19_25", x: 19, y: 25, color: "#ffd6d6", rgb: [255, 214, 214] },
  { id: "20_25", x: 20, y: 25, color: "#ffcdcd", rgb: [255, 205, 205] },
  { id: "21_25", x: 21, y: 25, color: "#f9c2c2", rgb: [249, 194, 194] },
  { id: "22_25", x: 22, y: 25, color: "#f2c2c2", rgb: [242, 194, 194] },
  { id: "23_25", x: 23, y: 25, color: "#f0c3d7", rgb: [240, 195, 215] },
  { id: "24_25", x: 24, y: 25, color: "#eec3e4", rgb: [238, 195, 228] },
  { id: "1_50", x: 1, y: 50, color: "#b59ce2", rgb: [181, 156, 226] },
  { id: "2_50", x: 2, y: 50, color: "#ae9bd4", rgb: [174, 155, 212] },
  { id: "3_50", x: 3, y: 50, color: "#a5a8d6", rgb: [165, 168, 214] },
  { id: "4_50", x: 4, y: 50, color: "#91afd7", rgb: [145, 175, 215] },
  { id: "5_50", x: 5, y: 50, color: "#90b0ed", rgb: [144, 176, 237] },
  { id: "6_50", x: 6, y: 50, color: "#93c1f6", rgb: [147, 193, 246] },
  { id: "7_50", x: 7, y: 50, color: "#81cbd9", rgb: [129, 203, 217] },
  { id: "8_50", x: 8, y: 50, color: "#88dcd4", rgb: [136, 220, 212] },
  { id: "9_50", x: 9, y: 50, color: "#97d3b1", rgb: [151, 211, 177] },
  { id: "10_50", x: 10, y: 50, color: "#bfd784", rgb: [191, 215, 132] },
  { id: "11_50", x: 11, y: 50, color: "#bdccad", rgb: [189, 204, 173] },
  { id: "12_50", x: 12, y: 50, color: "#b5d199", rgb: [181, 209, 153] },
  { id: "13_50", x: 13, y: 50, color: "#cad796", rgb: [202, 215, 150] },
  { id: "14_50", x: 14, y: 50, color: "#e2db8b", rgb: [226, 219, 139] },
  { id: "15_50", x: 15, y: 50, color: "#ffefad", rgb: [255, 239, 173] },
  { id: "16_50", x: 16, y: 50, color: "#ffdead", rgb: [255, 222, 173] },
  { id: "17_50", x: 17, y: 50, color: "#ffc8a7", rgb: [255, 200, 167] },
  { id: "18_50", x: 18, y: 50, color: "#ffbb90", rgb: [255, 187, 144] },
  { id: "19_50", x: 19, y: 50, color: "#ffacac", rgb: [255, 172, 172] },
  { id: "20_50", x: 20, y: 50, color: "#ff9999", rgb: [255, 153, 153] },
  { id: "21_50", x: 21, y: 50, color: "#f38484", rgb: [243, 132, 132] },
  { id: "22_50", x: 22, y: 50, color: "#e58383", rgb: [229, 131, 131] },
  { id: "23_50", x: 23, y: 50, color: "#df85ae", rgb: [223, 133, 174] },
  { id: "24_50", x: 24, y: 50, color: "#dc86c9", rgb: [220, 134, 201] },
  { id: "1_75", x: 1, y: 75, color: "#8d68d2", rgb: [141, 104, 210] },
  { id: "2_75", x: 2, y: 75, color: "#8467bd", rgb: [132, 103, 189] },
  { id: "3_75", x: 3, y: 75, color: "#757bc0", rgb: [117, 123, 192] },
  { id: "4_75", x: 4, y: 75, color: "#5885c2", rgb: [88, 133, 194] },
  { id: "5_75", x: 5, y: 75, color: "#5787e3", rgb: [87, 135, 227] },
  { id: "6_75", x: 6, y: 75, color: "#5ba0f0", rgb: [91, 160, 240] },
  { id: "7_75", x: 7, y: 75, color: "#3fb0c4", rgb: [63, 176, 196] },
  { id: "8_75", x: 8, y: 75, color: "#4ac9bd", rgb: [74, 201, 189] },
  { id: "9_75", x: 9, y: 75, color: "#61bb88", rgb: [97, 187, 136] },
  { id: "10_75", x: 10, y: 75, color: "#9dc243", rgb: [157, 194, 67] },
  { id: "11_75", x: 11, y: 75, color: "#99b181", rgb: [153, 177, 129] },
  { id: "12_75", x: 12, y: 75, color: "#8eb864", rgb: [142, 184, 100] },
  { id: "13_75", x: 13, y: 75, color: "#aec25f", rgb: [174, 194, 95] },
  { id: "14_75", x: 14, y: 75, color: "#d2c94f", rgb: [210, 201, 79] },
  { id: "15_75", x: 15, y: 75, color: "#fee581", rgb: [254, 229, 129] },
  { id: "16_75", x: 16, y: 75, color: "#fecc81", rgb: [254, 204, 129] },
  { id: "17_75", x: 17, y: 75, color: "#feab78", rgb: [254, 171, 120] },
  { id: "18_75", x: 18, y: 75, color: "#fe9656", rgb: [254, 150, 86] },
  { id: "19_75", x: 19, y: 75, color: "#fe8080", rgb: [254, 128, 128] },
  { id: "20_75", x: 20, y: 75, color: "#fe6363", rgb: [254, 99, 99] },
  { id: "21_75", x: 21, y: 75, color: "#eb4444", rgb: [235, 68, 68] },
  { id: "22_75", x: 22, y: 75, color: "#d74242", rgb: [215, 66, 66] },
  { id: "23_75", x: 23, y: 75, color: "#ce4583", rgb: [206, 69, 131] },
  { id: "24_75", x: 24, y: 75, color: "#c947ac", rgb: [201, 71, 172] },
  { id: "1_100", x: 1, y: 100, color: "#6937c4", rgb: [105, 55, 196] },
  { id: "2_100", x: 2, y: 100, color: "#5c36a8", rgb: [92, 54, 168] },
  { id: "3_100", x: 3, y: 100, color: "#4950ad", rgb: [73, 80, 173] },
  { id: "4_100", x: 4, y: 100, color: "#225eaf", rgb: [34, 94, 175] },
  { id: "5_100", x: 5, y: 100, color: "#2362db", rgb: [35, 98, 219] },
  { id: "6_100", x: 6, y: 100, color: "#2883ed", rgb: [40, 131, 237] },
  { id: "7_100", x: 7, y: 100, color: "#0599b3", rgb: [5, 153, 179] },
  { id: "8_100", x: 8, y: 100, color: "#12b8aa", rgb: [18, 184, 170] },
  { id: "9_100", x: 9, y: 100, color: "#32a765", rgb: [50, 167, 101] },
  { id: "10_100", x: 10, y: 100, color: "#7fb00a", rgb: [127, 176, 10] },
  { id: "11_100", x: 11, y: 100, color: "#79995a", rgb: [121, 153, 90] },
  { id: "12_100", x: 12, y: 100, color: "#69a131", rgb: [105, 161, 49] },
  { id: "13_100", x: 13, y: 100, color: "#96b02e", rgb: [150, 176, 46] },
  { id: "14_100", x: 14, y: 100, color: "#c5b919", rgb: [197, 185, 25] },
  { id: "15_100", x: 15, y: 100, color: "#ffdd59", rgb: [255, 221, 89] },
  { id: "16_100", x: 16, y: 100, color: "#ffbd59", rgb: [255, 189, 89] },
  { id: "17_100", x: 17, y: 100, color: "#ff924e", rgb: [255, 146, 78] },
  { id: "18_100", x: 18, y: 100, color: "#ff7723", rgb: [255, 119, 35] },
  { id: "19_100", x: 19, y: 100, color: "#ff5757", rgb: [255, 87, 87] },
  { id: "20_100", x: 20, y: 100, color: "#ff3131", rgb: [255, 49, 49] },
  { id: "21_100", x: 21, y: 100, color: "#e50707", rgb: [229, 7, 7] },
  { id: "22_100", x: 22, y: 100, color: "#cb0505", rgb: [203, 5, 5] },
  { id: "23_100", x: 23, y: 100, color: "#bf095b", rgb: [191, 9, 91] },
  { id: "24_100", x: 24, y: 100, color: "#b80b92", rgb: [184, 11, 146] },
];

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
