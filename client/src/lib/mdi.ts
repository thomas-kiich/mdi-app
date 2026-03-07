import frequencyData from './frequencyData.json';

export interface MdiType {
  id: number;
  colorName: string;
  lightRange: string;
  toneRange: string;
  frequency: number;
  description: string;
  talent: string;
  hex: string;
}

// Helper to normalize frequency to the base octave of the MDI system (88-170 Hz range roughly)
// Actually, MDI frequencies are 88, 91, ..., 170.
// We should normalize input frequency to this range to find the closest match.
// But wait, 88 Hz is F2. 170 Hz is F3. So it spans one octave.
// So we can normalize any frequency to this octave range.
function normalizeToMdiRange(freq: number): number {
  const minFreq = 88;
  const maxFreq = 176; // 88 * 2
  
  let f = freq;
  while (f < minFreq) f *= 2;
  while (f >= maxFreq) f /= 2;
  return f;
}

export function getMdiTypeFromFrequency(frequency: number): MdiType {
  // 1. Normalize frequency to the MDI octave range
  const normalizedFreq = normalizeToMdiRange(frequency);
  
  // 2. Find the closest match in frequencyData
  let closestType = frequencyData[0];
  let minDiff = Math.abs(normalizedFreq - closestType.frequency);
  
  for (const type of frequencyData) {
    const diff = Math.abs(normalizedFreq - type.frequency);
    if (diff < minDiff) {
      minDiff = diff;
      closestType = type;
    }
  }
  
  return closestType;
}

export function getMdiTypeById(id: number): MdiType | undefined {
  return frequencyData.find(t => t.id === id);
}
