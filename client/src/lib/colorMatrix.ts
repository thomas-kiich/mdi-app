/**
 * Color Matrix: 24 MDI Types × 4 Intensity Levels (25%, 50%, 75%, 100%)
 * Extracted from the official FARBLICHTFELD_96 color field
 * 
 * Structure: colorMatrix[type][intensity] = hexColor
 * - type: 1-24 (MDI types)
 * - intensity: 25, 50, 75, 100 (saturation levels)
 */

export const colorMatrix: Record<number, Record<number, string>> = {
  // Type 1 (Violett - Edge/White)
  1: {
    25: "#ffffff",
    50: "#ffffff",
    75: "#ffffff",
    100: "#ffffff",
  },
  // Type 2 (Violett)
  2: {
    25: "#d6cde9",
    50: "#ad9bd3",
    75: "#8468bd",
    100: "#5c35a9",
  },
  // Type 3 (Violett-Blau)
  3: {
    25: "#d9ccf0",
    50: "#b49ae2",
    75: "#8e69d3",
    100: "#6937c5",
  },
  // Type 4 (Blau)
  4: {
    25: "#c5d0f1",
    50: "#8da1e6",
    75: "#5475da",
    100: "#1b47cc",
  },
  // Type 5 (Blau-Cyan)
  5: {
    25: "#c7d6ea",
    50: "#89aada",
    75: "#5b89c7",
    100: "#4680cf",
  },
  // Type 6 (Blau-Cyan heller)
  6: {
    25: "#d4dcfe",
    50: "#a7b7ff",
    75: "#7c94fd",
    100: "#4f71fe",
  },
  // Type 7 (Cyan-Blau)
  7: {
    25: "#c8dff9",
    50: "#92c0f2",
    75: "#5ca1f0",
    100: "#2782ee",
  },
  // Type 8 (Cyan)
  8: {
    25: "#bfe4ea",
    50: "#7fcbd8",
    75: "#40b1c6",
    100: "#0197b2",
  },
  // Type 9 (Cyan-Grün)
  9: {
    25: "#c2f6f7",
    50: "#86eef0",
    75: "#48e7ea",
    100: "#0bdfde",
  },
  // Type 10 (Grün-Cyan)
  10: {
    25: "#cdf3e9",
    50: "#9be7d2",
    75: "#69dcba",
    100: "#38d1a4",
  },
  // Type 11 (Grün)
  11: {
    25: "#bfeed7",
    50: "#7edfb1",
    75: "#3fcf8a",
    100: "#01bf63",
  },
  // Type 12 (Grün-Gelb)
  12: {
    25: "#d9e7cb",
    50: "#b5d099",
    75: "#90b964",
    100: "#6da038",
  },
  // Type 13 (Gelb-Grün)
  13: {
    25: "#e2eec1",
    50: "#c5dd83",
    75: "#aacd46",
    100: "#8ebe0a",
  },
  // Type 14 (Gelb)
  14: {
    25: "#eaeabf",
    50: "#d4d57e",
    75: "#bfc241",
    100: "#aaad00",
  },
  // Type 15 (Gelb-Orange)
  15: {
    25: "#fef6d4",
    50: "#feeeab",
    75: "#ffe681",
    100: "#ffde59",
  },
  // Type 16 (Orange-Gelb)
  16: {
    25: "#feeed6",
    50: "#ffdeab",
    75: "#ffce83",
    100: "#ffbe59",
  },
  // Type 17 (Orange)
  17: {
    25: "#ffe4d2",
    50: "#ffc7a6",
    75: "#ffac78",
    100: "#ff914d",
  },
  // Type 18 (Orange-Rot)
  18: {
    25: "#ffdcc6",
    50: "#feba8d",
    75: "#fe9756",
    100: "#ff761e",
  },
  // Type 19 (Rot)
  19: {
    25: "#ffd4d5",
    50: "#ffaba9",
    75: "#fe8180",
    100: "#ff5759",
  },
  // Type 20 (Rot-Magenta)
  20: {
    25: "#f4c0bf",
    50: "#f0837d",
    75: "#e64948",
    100: "#e90603",
  },
  // Type 21 (Magenta-Rot)
  21: {
    25: "#f1c1c1",
    50: "#e58080",
    75: "#d94343",
    100: "#cb0506",
  },
  // Type 22 (Magenta)
  22: {
    25: "#edc1d4",
    50: "#de83ab",
    75: "#cf4584",
    100: "#bf0a5c",
  },
  // Type 23 (Magenta-Violett)
  23: {
    25: "#edc0e4",
    50: "#da84c8",
    75: "#c849ad",
    100: "#b70b93",
  },
  // Type 24 (Violett - Edge/White)
  24: {
    25: "#ffffff",
    50: "#ffffff",
    75: "#ffffff",
    100: "#ffffff",
  },
};

/**
 * Get color for a specific MDI type and intensity level
 * @param type MDI type (1-24)
 * @param intensity Intensity level (25, 50, 75, 100)
 * @returns Hex color string
 */
export function getColorForTypeAndIntensity(type: number, intensity: number): string {
  const validIntensities = [25, 50, 75, 100];
  const normalizedIntensity = validIntensities.reduce((prev, curr) =>
    Math.abs(curr - intensity) < Math.abs(prev - intensity) ? curr : prev
  );

  return colorMatrix[type]?.[normalizedIntensity as keyof typeof colorMatrix[typeof type]] || "#cccccc";
}

/**
 * Get all colors for a specific MDI type across all intensity levels
 * @param type MDI type (1-24)
 * @returns Object with intensity levels as keys and hex colors as values
 */
export function getColorsForType(type: number): Record<number, string> {
  return colorMatrix[type] || {};
}
