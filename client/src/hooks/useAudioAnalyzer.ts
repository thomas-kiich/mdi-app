import { getToneFromFrequency, ToneData } from '@/lib/tones';
import { useCallback, useEffect, useRef, useState } from 'react';

export interface AnalysisResult {
  fundamentalFreq: number;
  tone: ToneData;
  cents: number;
  diffHz: number;
  noteName: string;
  isSpeaking: boolean;
  spectrum: Uint8Array;
  volume: number;
  // New: Accumulated tone data for final result
  toneDistribution?: Record<string, number>;
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
  
  // Store accumulated data for the final result
  const accumulatedTonesRef = useRef<Record<string, number>>({});
  const totalFramesRef = useRef(0);
  const lastValidResultRef = useRef<AnalysisResult | null>(null);

  const startRecording = useCallback(async () => {
    try {
      setError(null);
      accumulatedTonesRef.current = {};
      totalFramesRef.current = 0;
      lastValidResultRef.current = null;
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 2048;
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
  }, []);

  const stopRecording = useCallback(() => {
    if (rafIdRef.current) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }
    
    if (sourceRef.current) {
      sourceRef.current.disconnect();
      sourceRef.current = null;
    }
    
    if (analyserRef.current) {
      analyserRef.current.disconnect();
      analyserRef.current = null;
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    
    // Finalize result based on accumulated data or last valid result
    if (totalFramesRef.current > 0) {
        // Calculate dominant tone from accumulation
        let maxCount = 0;
        let dominantToneName = "";
        
        for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
            if (count > maxCount) {
                maxCount = count;
                dominantToneName = name;
            }
        }
        
        if (dominantToneName && lastValidResultRef.current) {
            // We have data! Update result with distribution
            // Calculate percentages
            const distribution: Record<string, number> = {};
            for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
                distribution[name] = (count / totalFramesRef.current) * 100;
            }
            
            // If the last frame was silent (likely), use the last VALID result
            // but update it with the distribution data
            const finalResult = {
                ...lastValidResultRef.current,
                toneDistribution: distribution
            };
            setResult(finalResult);
        } else if (lastValidResultRef.current) {
            // Fallback to last valid result if accumulation failed
            setResult(lastValidResultRef.current);
        } else {
             setError("Keine Stimme erkannt. Bitte versuchen Sie es erneut und sprechen Sie deutlich.");
        }
    } else if (lastValidResultRef.current) {
        setResult(lastValidResultRef.current);
    } else {
        setError("Keine Stimme erkannt. Bitte versuchen Sie es erneut und sprechen Sie deutlich.");
    }
  }, []);

  const analyze = useCallback(() => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyserRef.current.getByteFrequencyData(dataArray);
    
    // Calculate volume
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      sum += dataArray[i];
    }
    const volume = sum / bufferLength;
    
    // Simple Pitch Detection (Autocorrelation or Max Frequency Bin)
    // For simplicity and performance in this demo, we use Max Frequency Bin with interpolation
    // In a production app, we would use YIN or CREPE algorithm
    
    let maxVal = -1;
    let maxIndex = -1;
    
    // Ignore low frequencies (DC offset and rumble) < 80Hz
    // SampleRate usually 44100 or 48000
    // Bin size = SampleRate / FFTSize = 44100 / 2048 ≈ 21.5 Hz
    // Start at index 4 (~86Hz)
    for (let i = 4; i < bufferLength; i++) {
      if (dataArray[i] > maxVal) {
        maxVal = dataArray[i];
        maxIndex = i;
      }
    }
    
    const sampleRate = audioContextRef.current.sampleRate;
    let fundamentalFreq = 0;
    
    // Interpolation for better precision
    if (maxIndex > 0 && maxIndex < bufferLength - 1) {
        const prev = dataArray[maxIndex - 1];
        const next = dataArray[maxIndex + 1];
        const pixel = maxIndex + (next - prev) / (2 * (2 * dataArray[maxIndex] - next - prev));
        fundamentalFreq = pixel * sampleRate / analyserRef.current.fftSize;
    } else {
        fundamentalFreq = maxIndex * sampleRate / analyserRef.current.fftSize;
    }

    // Filter out noise
    const isSpeaking = volume > 10 && fundamentalFreq > 80 && fundamentalFreq < 1000;
    
    if (isSpeaking) {
      const toneData = getToneFromFrequency(fundamentalFreq);
      
      const newResult: AnalysisResult = {
        fundamentalFreq,
        tone: toneData.tone,
        cents: toneData.cents,
        diffHz: toneData.diffHz,
        noteName: toneData.tone.name,
        isSpeaking,
        spectrum: dataArray,
        volume
      };
      
      setResult(newResult);
      lastValidResultRef.current = newResult;
      
      // Accumulate data
      if (accumulatedTonesRef.current[toneData.tone.name]) {
          accumulatedTonesRef.current[toneData.tone.name]++;
      } else {
          accumulatedTonesRef.current[toneData.tone.name] = 1;
      }
      totalFramesRef.current++;
    } else {
        // Just update spectrum for visualization even if silence
         setResult(prev => prev ? { ...prev, isSpeaking: false, spectrum: dataArray, volume } : null);
    }
    
    rafIdRef.current = requestAnimationFrame(analyze);
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    result,
    error
  };
}
