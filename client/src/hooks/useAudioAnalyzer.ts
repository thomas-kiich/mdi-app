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
      
      if (accumulatedTonesRef.current[toneData.tone.name]) {
          accumulatedTonesRef.current[toneData.tone.name]++;
          accumulatedFreqsRef.current[toneData.tone.name].push(fundamentalFreq);
      } else {
          accumulatedTonesRef.current[toneData.tone.name] = 1;
          accumulatedFreqsRef.current[toneData.tone.name] = [fundamentalFreq];
      }
      totalFramesRef.current++;
    } else {
         // Update visualizer even if not speaking
         setResult(prev => prev ? { ...prev, isSpeaking: false, spectrum: dataArray, volume } : { 
             fundamentalFreq: 0, 
             tone: TONES[0], 
             cents: 0, 
             diffHz: 0, 
             noteName: "-", 
             isSpeaking: false, 
             spectrum: dataArray, 
             volume 
         });
    }
    
    rafIdRef.current = requestAnimationFrame(analyze);
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
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    
    setIsRecording(false);
    
    // Process final result logic
    if (totalFramesRef.current > 0) {
        let maxCount = 0;
        let dominantToneName = "";
        
        for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
            if (count > maxCount) {
                maxCount = count;
                dominantToneName = name;
            }
        }
        
        if (dominantToneName && lastValidResultRef.current) {
            const distribution: Record<string, number> = {};
            for (const [name, count] of Object.entries(accumulatedTonesRef.current)) {
                distribution[name] = (count / totalFramesRef.current) * 100;
            }
            
            const measuredFreqs = accumulatedFreqsRef.current[dominantToneName] || [];
            const avgMeasuredFreq = measuredFreqs.length > 0 
                ? measuredFreqs.reduce((a, b) => a + b, 0) / measuredFreqs.length 
                : (lastValidResultRef.current.fundamentalFreq);

            let finalFreq = avgMeasuredFreq;
            let finalTone = TONES.find(t => t.name === dominantToneName) || lastValidResultRef.current.tone;
            let correctionNote = undefined;

            // Simple correction logic (e.g. quint check) can be added here if needed
            // For now, trust the distribution

            const idealFreq = finalTone.frequency; 
            // Calculate cents based on average measured frequency vs ideal frequency
            const finalCents = 1200 * Math.log2(finalFreq / idealFreq);

            const finalResult = {
                ...lastValidResultRef.current,
                tone: finalTone,
                fundamentalFreq: finalFreq,
                cents: finalCents,
                noteName: finalTone.name,
                toneDistribution: distribution,
                correctionNote
            };
            setResult(finalResult);
        } else if (lastValidResultRef.current) {
            setResult(lastValidResultRef.current);
        }
    } else if (lastValidResultRef.current) {
        setResult(lastValidResultRef.current);
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
