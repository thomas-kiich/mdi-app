import { useState, useEffect } from 'react';
import { AnalysisResult } from './useAudioAnalyzer';
import { TONES } from '@/lib/tones';

const STORAGE_KEY = 'mdi_longitudinal_data';

export interface DailyResult {
  date: string; // ISO date string
  result: AnalysisResult;
}

export interface LongitudinalState {
  daysCompleted: number;
  history: DailyResult[];
  isComplete: boolean;
  finalResult: AnalysisResult | null;
}

export function useLongitudinalStudy() {
  const [state, setState] = useState<LongitudinalState>({
    daysCompleted: 0,
    history: [],
    isComplete: false,
    finalResult: null,
  });

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Recalculate if complete, just in case
        if (parsed.history.length >= 7) {
             const final = calculateTrueMean(parsed.history);
             setState({
                 daysCompleted: parsed.history.length,
                 history: parsed.history,
                 isComplete: true,
                 finalResult: final
             });
        } else {
            setState({
                daysCompleted: parsed.history.length,
                history: parsed.history,
                isComplete: false,
                finalResult: null
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

    if (hasToday) {
        // Option: Overwrite today's result or ignore? 
        // For now, let's allow overwriting if the user re-does the test today.
        // We filter out the old "today" and append the new one.
        const newHistory = state.history.filter(entry => !entry.date.startsWith(today));
        newHistory.push({ date: new Date().toISOString(), result });
        
        updateState(newHistory);
    } else {
        // Append new result
        const newHistory = [...state.history, { date: new Date().toISOString(), result }];
        updateState(newHistory);
    }
  };

  const updateState = (history: DailyResult[]) => {
      let isComplete = false;
      let finalResult = null;

      if (history.length >= 7) {
          isComplete = true;
          finalResult = calculateTrueMean(history);
      }

      const newState = {
          daysCompleted: history.length,
          history,
          isComplete,
          finalResult
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
          finalResult: null
      });
  };

  // The Core Logic: Remove 2 outliers (most extreme) and average the rest
  const calculateTrueMean = (history: DailyResult[]): AnalysisResult => {
      // We need to find a metric for "outlier". 
      // A good metric is the deviation from the mean of all samples.
      // Or simply the highest and lowest fundamental frequency?
      // But fundamental frequency varies by octave.
      // Better: Convert everything to a standardized "Cent value relative to A440" or similar linear scale.
      // Or: Calculate the "Cent deviation" from the standard tone of each measurement.
      
      // Let's use the Tone Distribution as the fingerprint.
      // We want to find the 5 days that are most "consistent".
      
      // Simplified robust approach for MDI:
      // 1. Calculate the average distribution across all 7 days.
      // 2. For each day, calculate the "distance" (difference) from this average distribution.
      // 3. Remove the 2 days with the highest distance (the weirdest days).
      // 4. Re-calculate the average from the remaining 5 days.
      
      // Step 1: Global Average
      const globalDist: Record<string, number> = {};
      history.forEach(day => {
          if (!day.result.toneDistribution) return;
          Object.entries(day.result.toneDistribution).forEach(([tone, val]) => {
              globalDist[tone] = (globalDist[tone] || 0) + val;
          });
      });
      // Normalize
      Object.keys(globalDist).forEach(k => globalDist[k] /= history.length);
      
      // Step 2: Calculate Distance for each day
      const daysWithDistance = history.map(day => {
          let distance = 0;
          if (day.result.toneDistribution) {
              Object.entries(day.result.toneDistribution).forEach(([tone, val]) => {
                  const avg = globalDist[tone] || 0;
                  distance += Math.pow(val - avg, 2); // Squared Euclidean distance
              });
          }
          return { ...day, distance };
      });
      
      // Step 3: Sort by distance (descending) and remove top 2
      daysWithDistance.sort((a, b) => b.distance - a.distance);
      // The first 2 are the outliers. We keep the rest (index 2 to end).
      const validDays = daysWithDistance.slice(2); // Keeps 5 best days
      
      // Step 4: Calculate Final Mean from valid days
      const finalDist: Record<string, number> = {};
      validDays.forEach(day => {
          if (!day.result.toneDistribution) return;
          Object.entries(day.result.toneDistribution).forEach(([tone, val]) => {
              finalDist[tone] = (finalDist[tone] || 0) + val;
          });
      });
      Object.keys(finalDist).forEach(k => finalDist[k] /= validDays.length);
      
      // Determine Dominant Tone
      let maxScore = 0;
      let dominantToneName = "";
      Object.entries(finalDist).forEach(([tone, score]) => {
          if (score > maxScore) {
              maxScore = score;
              dominantToneName = tone;
          }
      });
      
      const toneData = TONES.find(t => t.name === dominantToneName);
      
      // Calculate average Cents/Hz from the valid days
      // We take the average cents deviation of the valid days to reconstruct a representative Hz
      let totalCents = 0;
      validDays.forEach(day => {
          totalCents += day.result.cents;
      });
      const avgCents = totalCents / validDays.length;
      
      // Reconstruct Hz
      const baseFreq = toneData?.frequency || 440;
      const finalHz = baseFreq * Math.pow(2, avgCents / 1200);
      
      return {
          fundamentalFreq: finalHz,
          noteName: dominantToneName,
          cents: avgCents,
          diffHz: finalHz - baseFreq,
          toneDistribution: finalDist,
          tone: toneData || TONES[0], // Fallback
          isSpeaking: false, // Calculated result is static
          spectrum: new Uint8Array(0), // No live spectrum
          volume: 0 // No live volume
      };
  };

  return {
    ...state,
    saveDailyResult,
    resetStudy
  };
}
