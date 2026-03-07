import { useState, useEffect } from 'react';
import { AnalysisResult } from './useAudioAnalyzer';
import { TONES } from '@/lib/tones';
import frequencyData from '@/lib/frequencyData.json';

const STORAGE_KEY = 'mdi_longitudinal_data';
const REQUIRED_DAYS = 5;
const OUTLIERS_TO_REMOVE = 2;

export interface DailyResult {
  date: string; // ISO date string
  result: AnalysisResult;
  distance?: number; // Calculated distance from mean
}

export interface LongitudinalState {
  daysCompleted: number;
  history: DailyResult[];
  isComplete: boolean;
  finalResult: AnalysisResult | null;
  mdiResult: typeof frequencyData[0] | null;
}

export function useLongitudinalStudy() {
  const [state, setState] = useState<LongitudinalState>({
    daysCompleted: 0,
    history: [],
    isComplete: false,
    finalResult: null,
    mdiResult: null
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recalculate if complete, just in case logic changed
        if (parsed.history.length >= REQUIRED_DAYS) {
             const { final, mdi } = calculateTrueMean(parsed.history);
             setState({
                 daysCompleted: parsed.history.length,
                 history: parsed.history,
                 isComplete: true,
                 finalResult: final,
                 mdiResult: mdi
             });
        } else {
            setState({
                daysCompleted: parsed.history.length,
                history: parsed.history,
                isComplete: false,
                finalResult: null,
                mdiResult: null
            });
        }
      } catch (e) {
        console.error("Failed to parse longitudinal data", e);
      }
    }
  }, []);

  const saveDailyResult = (result: AnalysisResult) => {
    // Check if we already have a result for today to prevent double counting
    const today = new Date().toISOString().split('T')[0];
    const hasToday = state.history.some(entry => entry.date.startsWith(today));

    let newHistory = [...state.history];

    if (hasToday) {
        // Allow overwriting today's result
        newHistory = newHistory.filter(entry => !entry.date.startsWith(today));
    }
    
    newHistory.push({ date: new Date().toISOString(), result });
    updateState(newHistory);
  };

  const updateState = (history: DailyResult[]) => {
      let isComplete = false;
      let finalResult = null;
      let mdiResult = null;

      if (history.length >= REQUIRED_DAYS) {
          isComplete = true;
          const calculation = calculateTrueMean(history);
          finalResult = calculation.final;
          mdiResult = calculation.mdi;
      }

      const newState = {
          daysCompleted: history.length,
          history,
          isComplete,
          finalResult,
          mdiResult
      };

      setState(newState);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
  };

  const resetStudy = () => {
      localStorage.removeItem(STORAGE_KEY);
      setState({
          daysCompleted: 0,
          history: [],
          isComplete: false,
          finalResult: null,
          mdiResult: null
      });
  };

  // The Core Logic: Remove 2 outliers (most extreme) and average the rest
  const calculateTrueMean = (history: DailyResult[]): { final: AnalysisResult, mdi: typeof frequencyData[0] } => {
      // Step 1: Calculate global average frequency to find outliers
      // We use Hz as the metric for outlier detection
      let sumHz = 0;
      history.forEach(day => sumHz += day.result.fundamentalFreq);
      const avgHz = sumHz / history.length;
      
      // Step 2: Calculate Distance for each day (absolute deviation from mean)
      const daysWithDistance = history.map(day => {
          const distance = Math.abs(day.result.fundamentalFreq - avgHz);
          return { ...day, distance };
      });
      
      // Step 3: Sort by distance (descending) and remove top 2 outliers
      // If we have exactly 5 days, we remove 2 and keep 3.
      // If we have more, we still remove the 2 worst.
      daysWithDistance.sort((a, b) => b.distance - a.distance);
      
      // Keep the best (n - 2) days
      const validDays = daysWithDistance.slice(OUTLIERS_TO_REMOVE); 
      
      // Step 4: Calculate Mean Hz from valid days
      let validSumHz = 0;
      validDays.forEach(day => validSumHz += day.result.fundamentalFreq);
      const finalHz = validSumHz / validDays.length;
      
      // Step 5: Quantize to 24-step MDI scale
      // Find the closest frequency in our data
      let closestMdi = frequencyData[0];
      let minDiff = Math.abs(finalHz - frequencyData[0].frequency);
      
      for (const item of frequencyData) {
          const diff = Math.abs(finalHz - item.frequency);
          if (diff < minDiff) {
              minDiff = diff;
              closestMdi = item;
          }
      }
      
      // Construct final result object
      // We use the closest MDI frequency as the "fundamentalFreq"
      // But we keep the note name from the standard scale for compatibility
      const toneData = TONES.find(t => Math.abs(t.frequency - closestMdi.frequency) < 10) || TONES[0];
      
      const finalResult: AnalysisResult = {
          fundamentalFreq: closestMdi.frequency, // Quantized Hz
          noteName: toneData.name,
          cents: 0, // Reset cents as we are now on a fixed grid
          diffHz: 0,
          toneDistribution: {}, // Not used in new logic
          tone: toneData,
          isSpeaking: false,
          spectrum: new Uint8Array(0),
          volume: 0
      };
      
      return { final: finalResult, mdi: closestMdi };
  };

  return {
    ...state,
    saveDailyResult,
    resetStudy
  };
}
