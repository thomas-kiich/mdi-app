import { v4 as uuidv4 } from 'uuid';

export type TrainingType = 'methode36' | 'interval' | 'breath';

export interface TrainingSession {
  id: string;
  date: string; // ISO string
  type: TrainingType;
  duration: number; // in minutes
  tone?: string; // e.g., "C#"
  frequency?: number; // e.g., 136.1
  notes?: string;
}

const STORAGE_KEY = 'mdi_training_history';

export const getTrainingHistory = (): TrainingSession[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];
  try {
    return JSON.parse(stored);
  } catch (e) {
    console.error("Failed to parse training history", e);
    return [];
  }
};

export const saveTrainingSession = (session: Omit<TrainingSession, 'id' | 'date'>) => {
  const history = getTrainingHistory();
  const newSession: TrainingSession = {
    ...session,
    id: uuidv4(),
    date: new Date().toISOString()
  };
  
  const updatedHistory = [newSession, ...history];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedHistory));
  return newSession;
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const deleteSession = (id: string) => {
    const history = getTrainingHistory();
    const updated = history.filter(s => s.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
};
