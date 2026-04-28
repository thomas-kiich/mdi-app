export interface VitalEntry {
  id: string;
  date: string; // ISO string
  bolt: number; // seconds
  temperature: number; // celsius
  hrv: number; // ms – manuell oder via Polar H10
  hrvSource?: 'manual' | 'polar_h10'; // Quelle der HRV-Messung
  ruhepuls: number; // bpm – Morgenruhepuls
  apnoeAus: number; // Minuten – Apnoe im ausgeatmeten Zustand (Exspirationsapnoe)
  apnoeEin: number; // Minuten – Apnoe im eingeatmeten Zustand (Inspirationsapnoe)
  mood: number; // 1-10
  notes?: string;
}

// ─── Tagesplaner ───────────────────────────────────────────────────────────
export type TagesplanKategorie = 'atemtraining' | 'kiich_training' | 'bewegung' | 'schlaf' | 'coaching' | 'sonstiges';

export interface TagesplanItem {
  id: string;
  kategorie: TagesplanKategorie;
  label: string;         // z.B. "BT 3× 7 min"
  geplant: boolean;      // war es geplant?
  durchgefuehrt: boolean; // wurde es durchgeführt?
  notiz?: string;
}

export interface Tagesplan {
  datum: string; // YYYY-MM-DD
  items: TagesplanItem[];
}

const TAGESPLAN_STORAGE_KEY = 'mdi_tagesplan_data';

export const getTagesplan = (datum: string): Tagesplan => {
  const data = localStorage.getItem(TAGESPLAN_STORAGE_KEY);
  const all: Tagesplan[] = data ? JSON.parse(data) : [];
  return all.find(p => p.datum === datum) ?? { datum, items: [] };
};

export const saveTagesplan = (plan: Tagesplan): void => {
  const data = localStorage.getItem(TAGESPLAN_STORAGE_KEY);
  const all: Tagesplan[] = data ? JSON.parse(data) : [];
  const idx = all.findIndex(p => p.datum === plan.datum);
  if (idx >= 0) all[idx] = plan; else all.push(plan);
  localStorage.setItem(TAGESPLAN_STORAGE_KEY, JSON.stringify(all));
};

export const getAllTagesplaene = (): Tagesplan[] => {
  const data = localStorage.getItem(TAGESPLAN_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const VITALS_STORAGE_KEY = 'mdi_vitals_data';

export const getVitals = (): VitalEntry[] => {
  const data = localStorage.getItem(VITALS_STORAGE_KEY);
  if (!data) return [];
  // Rückwärtskompatibilität: fehlende Felder mit 0 befüllen
  const entries: VitalEntry[] = JSON.parse(data);
  return entries.map(e => ({
    ...e,
    ruhepuls: e.ruhepuls ?? 0,
    apnoeAus: e.apnoeAus ?? 0,
    apnoeEin: e.apnoeEin ?? 0,
    hrvSource: e.hrvSource ?? ('manual' as const),
  }));
};

export const saveVital = (entry: Omit<VitalEntry, 'id'>) => {
  const current = getVitals();
  const newEntry = { ...entry, id: crypto.randomUUID() };
  const updated = [...current, newEntry];
  localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(updated));
  return newEntry;
};

export const deleteVital = (id: string) => {
  const current = getVitals();
  const updated = current.filter(v => v.id !== id);
  localStorage.setItem(VITALS_STORAGE_KEY, JSON.stringify(updated));
};
