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

export const calculateStreak = (): number => {
    const history = getTrainingHistory();
    if (history.length === 0) return 0;

    // Sort by date descending
    const sortedDates = history
        .map(s => new Date(s.date).setHours(0, 0, 0, 0))
        .sort((a, b) => b - a);

    // Remove duplicates
    const uniqueDates = Array.from(new Set(sortedDates));

    if (uniqueDates.length === 0) return 0;

    const today = new Date().setHours(0, 0, 0, 0);
    const yesterday = new Date(today - 86400000).setHours(0, 0, 0, 0);

    // Check if streak is active (trained today or yesterday)
    if (uniqueDates[0] !== today && uniqueDates[0] !== yesterday) {
        return 0;
    }

    let streak = 1;
    let currentDate = uniqueDates[0];

    for (let i = 1; i < uniqueDates.length; i++) {
        const prevDate = uniqueDates[i];
        const diff = (currentDate - prevDate) / 86400000; // Difference in days

        if (diff === 1) {
            streak++;
            currentDate = prevDate;
        } else {
            break;
        }
    }

    return streak;
};

export interface TrainingStats {
    totalSessions: number;
    totalMinutes: number;
    favoriteTone: string;
    thisWeekSessions: number;
}

export const getTrainingStats = (): TrainingStats => {
    const history = getTrainingHistory();
    if (history.length === 0) {
        return { totalSessions: 0, totalMinutes: 0, favoriteTone: '-', thisWeekSessions: 0 };
    }

    const totalSessions = history.length;
    const totalMinutes = history.reduce((acc, curr) => acc + curr.duration, 0);

    // Calculate favorite tone
    const toneCounts: Record<string, number> = {};
    history.forEach(s => {
        if (s.tone) {
            toneCounts[s.tone] = (toneCounts[s.tone] || 0) + 1;
        }
    });
    
    let favoriteTone = '-';
    let maxCount = 0;
    Object.entries(toneCounts).forEach(([tone, count]) => {
        if (count > maxCount) {
            maxCount = count;
            favoriteTone = tone;
        }
    });

    // Calculate sessions this week (Monday start)
    const now = new Date();
    const day = now.getDay() || 7; // 1 (Mon) to 7 (Sun)
    const startOfWeek = new Date(now);
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(now.getDate() - day + 1);
    
    const thisWeekSessions = history.filter(s => new Date(s.date) >= startOfWeek).length;

    return {
        totalSessions,
        totalMinutes,
        favoriteTone,
        thisWeekSessions
    };
};
