/**
 * Mapping between MDI IDs (1-24) and Musical Tone Names
 * This ensures consistent lookup between frequency data and tone definitions
 */

export const MDI_TO_TONE_NAME: Record<number, string> = {
  1: "E",      // Blauviolett
  2: "Dis",    // Violett
  3: "D",      // Violettblau
  4: "Cis",    // Dunkelblau
  5: "C",      // Signalblau
  6: "H",      // Himmelblau
  7: "Ais",    // Cyan
  8: "A",      // Türkisgrün
  9: "Gis",    // Smaragdgrün
  10: "G",     // Laubgrün
  11: "Fis",   // Gelbgrün
  12: "F",     // Zitronengelb
  13: "E",     // Signalgelb (repeats E in higher octave)
  14: "Dis",   // Goldgelb (repeats Dis)
  15: "D",     // Hellorange (repeats D)
  16: "Cis",   // Reinorange (repeats Cis)
  17: "C",     // Leuchtorange (repeats C)
  18: "H",     // Orangerot (repeats H)
  19: "Ais",   // Feuerrot (repeats Ais)
  20: "A",     // Signalrot (repeats A)
  21: "Gis",   // Karminrot (repeats Gis)
  22: "G",     // Purpur (repeats G)
  23: "Fis",   // Tiefrot (repeats Fis)
  24: "F"      // Infrarotgrenze (repeats F)
};

/**
 * Get tone name from MDI ID
 */
export function getToneNameFromMdiId(mdiId: number | string): string {
  const id = typeof mdiId === 'string' ? parseInt(mdiId) : mdiId;
  return MDI_TO_TONE_NAME[id] || "";
}
