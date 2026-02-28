// 12-Ton-Tabelle für MDI
// Quelle: Google Sheets (CSV)

export interface ToneData {
  name: string;
  frequency: number; // Hz (Grundfrequenz bei ~128-242 Hz) - Referenz für Dimensionen/Farben
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
    frequency: 130.81, // C3 (Standard 440Hz tuning)
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
    frequency: 138.59, // C#3
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
    frequency: 146.83, // D3
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
    frequency: 155.56, // D#3
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
    frequency: 164.81, // E3
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
    frequency: 174.61, // F3
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
    frequency: 185.00, // F#3
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
    frequency: 196.00, // G3
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
    frequency: 207.65, // G#3
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
    frequency: 220.00, // A3
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
    frequency: 233.08, // A#3
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
    frequency: 246.94, // B3
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

  // A4 = 440Hz standard reference
  // Formula for MIDI note number: n = 69 + 12 * log2(freq / 440)
  const midiNote = 69 + 12 * Math.log2(freq / 440);
  const roundedMidiNote = Math.round(midiNote);
  
  // Calculate cents deviation from the nearest semitone
  // cents = 100 * (midiNote - roundedMidiNote)
  const cents = Math.round(100 * (midiNote - roundedMidiNote));

  // Determine note name index (0-11)
  // MIDI note 69 is A4. 69 % 12 = 9. So index 9 is A.
  // Our TONES array starts with C (index 0).
  // C is index 0, C# is 1... A is 9.
  // We need to map MIDI note to 0-11 range where 0 is C.
  
  const noteIndex = (roundedMidiNote % 12 + 12) % 12; // Ensure positive result
  
  // Mapping MIDI index to our TONES array
  // 0=C, 1=C#, 2=D, 3=D#, 4=E, 5=F, 6=F#, 7=G, 8=G#, 9=A, 10=A#, 11=B(H)
  const tone = TONES[noteIndex];

  // Calculate difference in Hz from the ideal frequency of that note in that octave
  // Ideal freq = 440 * 2^((roundedMidiNote - 69) / 12)
  const idealFreq = 440 * Math.pow(2, (roundedMidiNote - 69) / 12);
  const diffHz = freq - idealFreq;

  return {
    tone,
    cents,
    diffHz
  };
}
