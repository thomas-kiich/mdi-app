export interface VitalEntry {
  id: string;
  date: string; // ISO string
  bolt: number; // seconds
  temperature: number; // celsius
  hrv: number; // ms
  mood: number; // 1-10
  notes?: string;
}

const VITALS_STORAGE_KEY = 'mdi_vitals_data';

export const getVitals = (): VitalEntry[] => {
  const data = localStorage.getItem(VITALS_STORAGE_KEY);
  return data ? JSON.parse(data) : [];
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
