/**
 * Mapping between MDI IDs (1-24) and Musical Tone Names
 * This ensures consistent lookup between frequency data and tone definitions
 */

export const MDI_TO_TONE_NAME: Record<number, string> = {
  1: "E",      // Blauviolett
  2: "E+",     // Violett
  3: "Dis",    // Violettblau
  4: "Dis+",   // Dunkelblau
  5: "D",      // Signalblau
  6: "D+",     // Himmelblau
  7: "Cis",    // Cyan
  8: "Cis+",   // Türkisgrün
  9: "C",      // Smaragdgrün
  10: "C+",    // Laubgrün
  11: "H",     // Gelbgrün
  12: "H+",    // Zitronengelb
  13: "Ais",   // Signalgelb
  14: "Ais+",  // Goldgelb
  15: "A",     // Hellorange
  16: "A+",    // Reinorange
  17: "Gis",   // Leuchtorange
  18: "Gis+",  // Orangerot
  19: "G",     // Feuerrot
  20: "G+",    // Signalrot
  21: "Fis",   // Karminrot
  22: "Fis+",  // Purpur
  23: "F",     // Tiefrot
  24: "F+"     // Infrarotgrenze
};

/**
 * Get tone name from MDI ID
 */
export function getToneNameFromMdiId(mdiId: number | string): string {
  const id = typeof mdiId === 'string' ? parseInt(mdiId) : mdiId;
  return MDI_TO_TONE_NAME[id] || "";
}

/**
 * Convert MDI distribution (keyed by MDI ID) to tone distribution (keyed by tone name)
 * This aggregates multiple MDI IDs that map to the same tone name
 */
export function convertMdiDistributionToToneDistribution(
  mdiDistribution: Record<string, number>
): Record<string, number> {
  const toneDistribution: Record<string, number> = {};
  
  for (const [mdiIdStr, value] of Object.entries(mdiDistribution)) {
    const toneName = getToneNameFromMdiId(mdiIdStr);
    if (toneName) {
      if (!toneDistribution[toneName]) {
        toneDistribution[toneName] = 0;
      }
      toneDistribution[toneName] += value;
    }
  }
  
  return toneDistribution;
}
