import { getToneFromFrequency, ToneData, TONES } from '@/lib/tones';
import { useCallback, useRef, useState } from 'react';

export interface AnalysisResult {
  fundamentalFreq: number;
  tone: ToneData;
  cents: number;
  diffHz: number;
  noteName: string;
  isSpeaking: boolean;
  spectrum: Uint8Array;
  volume: number;
  toneDistribution?: Record<string, number>;
  correctionNote?: string;
}

export function useAudioAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  
  const accumulatedTonesRef = useRef<Record<string, number>>({});
  const accumulatedFreqsRef = useRef<Record<string, number[]>>({});
  const totalFramesRef = useRef(0);
  const lastValidResultRef = useRef<AnalysisResult | null>(null);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const volume = sum / bufferLength;
    
    // Find peak frequency
    let maxVal = -1;
    let maxIndex = -1;
    const searchLimit = Math.min(bufferLength, 50); // Limit search range for voice fundamental

    for (let i = 2; i < searchLimit; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIndex = i;
      }
    }
    
    // Simple interpolation for better frequency resolution
    const sampleRate = audioContextRef.current.sampleRate;
    let fundamentalFreq = 0;
    
    if (maxIndex > 0 && maxIndex < bufferLength - 1) {
        const prev = dataArray[maxIndex - 1];
        const next = dataArray[maxIndex + 1];
        // Parabolic interpolation
        const pixel = maxIndex + (next - prev) / (2 * (2 * dataArray[maxIndex] - next - prev));
        fundamentalFreq = pixel * sampleRate / analyserRef.current.fftSize;
    } else {
        fundamentalFreq = maxIndex * sampleRate / analyserRef.current.fftSize;
    }

    const isSpeaking = volume > 10 && fundamentalFreq > 50 && fundamentalFreq < 800;
    
    // Always update visualizer state, regardless of speaking
    // This ensures the UI gets live feedback (volume/spectrum)
    
    let currentResult = null;

    if (isSpeaking) {
      const toneData = getToneFromFrequency(fundamentalFreq);
      
      currentResult = {
        fundamentalFreq,
        tone: toneData.tone,
        cents: toneData.cents,
        diffHz: toneData.diffHz,
        noteName: toneData.tone.name,
        isSpeaking,
        spectrum: dataArray,
        volume
      };
      
      lastValidResultRef.current = currentResult;
      
      // Accumulate data for final result
      const toneName = toneData.tone.name;
      if (!accumulatedTonesRef.current[toneName]) {
          accumulatedTonesRef.current[toneName] = 0;
          accumulatedFreqsRef.current[toneName] = [];
      }
      accumulatedTonesRef.current[toneName]++;
      accumulatedFreqsRef.current[toneName].push(fundamentalFreq);
      
      totalFramesRef.current++;
    } else {
         // Not speaking, but still need to pass visual data
         currentResult = { 
             fundamentalFreq: 0, 
             tone: TONES[0], 
             cents: 0, 
             diffHz: 0, 
             noteName: "-", 
             isSpeaking: false, 
             spectrum: dataArray, 
             volume 
         };
    }

    setResult(currentResult);
    
    rafIdRef.current = requestAnimationFrame(analyze);
  }, []);

  const stopRecording = useCallback(() => {
    // 1. Cancel animation frame first to stop the loop
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    // 2. Disconnect audio nodes
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    // 3. Stop all tracks in the stream
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // 4. Close context
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    
    // 5. Calculate Final Result
    let calculatedResult = null;

    if (totalFramesRef.current > 0) {
        // Find dominant tone
        let maxCount = 0;
        let dominantToneName = "";
        
        for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
            if (count > maxCount) {
                maxCount = count;
                dominantToneName = name;
            }
        }
        
        if (dominantToneName) {
            // Calculate distribution
            const distribution: Record<string, number> = {};
            for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
                distribution[name] = (count / totalFramesRef.current) * 100;
            }
            
            // Calculate average frequency for dominant tone
            const measuredFreqs = accumulatedFreqsRef.current[dominantToneName] || [];
            const avgMeasuredFreq = measuredFreqs.length > 0 
                ? measuredFreqs.reduce((a, b) => a + b, 0) / measuredFreqs.length 
                : 0;

            const finalTone = TONES.find(t => t.name === dominantToneName) || TONES[0];
            const idealFreq = finalTone.frequency; 
            const finalCents = idealFreq > 0 ? 1200 * Math.log2(avgMeasuredFreq / idealFreq) : 0;

            // Construct result object
            // We use the last valid result for spectrum/volume, but override the analysis data
            const base = lastValidResultRef.current || { spectrum: new Uint8Array(0), volume: 0, isSpeaking: false };
            
            calculatedResult = {
                ...base,
                tone: finalTone,
                fundamentalFreq: avgMeasuredFreq,
                cents: finalCents,
                diffHz: avgMeasuredFreq - idealFreq,
                noteName: finalTone.name,
                toneDistribution: distribution,
                correctionNote: undefined
            };
        }
    } 
    
    // Fallback if no frames were valid but we have a last result
    if (!calculatedResult && lastValidResultRef.current) {
        calculatedResult = lastValidResultRef.current;
    }

    setResult(calculatedResult);
    // Important: lastValidResultRef will be used by the consumer to get the final state
    if (calculatedResult) {
        lastValidResultRef.current = calculatedResult;
    }
  }, []);

  const startRecording = useCallback(async () => {
    try {
      if (isRecording) {
        stopRecording();
        return;
      }
      
      setError(null);
      accumulatedTonesRef.current = {};
      accumulatedFreqsRef.current = {};
      totalFramesRef.current = 0;
      lastValidResultRef.current = null;
      setResult(null);
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioContext = new AudioContextClass();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.8; // Smoother visualization
      analyserRef.current = analyser;
      
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      setIsRecording(true);
      analyze();
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setError("Mikrofonzugriff verweigert oder nicht verfügbar.");
    }
  }, [isRecording, stopRecording, analyze]);

  return {
    isRecording,
    startRecording,
    stopRecording,
    result,
    error
  };
}
