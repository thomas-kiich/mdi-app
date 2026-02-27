import { useState, useRef, useEffect } from 'react';
import { getToneFromFrequency, TONES, ToneData } from '@/lib/tones';

// Konfiguration für FFT
const FFT_SIZE = 2048; // Hohe Auflösung für genaue Frequenzen
const MIN_DECIBELS = -90;
const MAX_DECIBELS = -10;
const SMOOTHING_TIME_CONSTANT = 0.85;

export interface AnalysisResult {
  fundamentalFreq: number; // Hz
  dominantTone: ToneData;
  cents: number;
  spectrum: Float32Array; // Rohe FFT-Daten
  volume: number; // Lautstärke (RMS)
  isSpeaking: boolean; // Spracherkennung
}

export function useAudioAnalyzer() {
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Refs für Audio Context
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafRef = useRef<number | null>(null);

  // Einfache Pitch Detection (Autokorrelation)
  const autoCorrelate = (buf: Float32Array, sampleRate: number) => {
    let size = buf.length;
    let rms = 0;

    for (let i = 0; i < size; i++) {
      const val = buf[i];
      rms += val * val;
    }
    rms = Math.sqrt(rms / size);

    if (rms < 0.01) // not enough signal
      return -1;

    let r1 = 0, r2 = size - 1, thres = 0.2;
    for (let i = 0; i < size / 2; i++)
      if (Math.abs(buf[i]) < thres) { r1 = i; break; }
    for (let i = 1; i < size / 2; i++)
      if (Math.abs(buf[size - i]) < thres) { r2 = size - i; break; }

    const buf2 = buf.slice(r1, r2);
    const size2 = buf2.length;

    const c = new Array(size2).fill(0);
    for (let i = 0; i < size2; i++)
      for (let j = 0; j < size2 - i; j++)
        c[i] = c[i] + buf2[j] * buf2[j + i];

    let d = 0; while (c[d] > c[d + 1]) d++;
    let maxval = -1, maxpos = -1;
    for (let i = d; i < size2; i++) {
      if (c[i] > maxval) {
        maxval = c[i];
        maxpos = i;
      }
    }
    let T0 = maxpos;

    const x1 = c[T0 - 1], x2 = c[T0], x3 = c[T0 + 1];
    const a = (x1 + x3 - 2 * x2) / 2;
    const b = (x3 - x1) / 2;
    if (a) T0 = T0 - b / (2 * a);

    return sampleRate / T0;
  };

  const startRecording = async () => {
    try {
      setError(null);
      
      // Audio Context erstellen
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      // Mikrofon-Zugriff
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // Analyser Node
      const analyser = ctx.createAnalyser();
      analyser.fftSize = FFT_SIZE;
      analyser.minDecibels = MIN_DECIBELS;
      analyser.maxDecibels = MAX_DECIBELS;
      analyser.smoothingTimeConstant = SMOOTHING_TIME_CONSTANT;
      analyserRef.current = analyser;
      
      // Quelle verbinden
      const source = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      sourceRef.current = source;
      
      setIsRecording(true);
      
      // Analyse Loop starten
      const loop = () => {
        analyzeStep();
        rafRef.current = requestAnimationFrame(loop);
      };
      loop();
      
    } catch (err) {
      console.error("Fehler beim Starten der Aufnahme:", err);
      setError("Mikrofon-Zugriff verweigert oder nicht verfügbar.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    
    if (sourceRef.current) sourceRef.current.disconnect();
    if (analyserRef.current) analyserRef.current.disconnect();
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    
    setIsRecording(false);
    setResult(null);
  };

  const analyzeStep = () => {
    if (!analyserRef.current || !audioContextRef.current) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Float32Array(bufferLength); // Frequenz-Daten (dB)
    const timeDomainArray = new Float32Array(FFT_SIZE); // Zeit-Daten (Waveform)
    
    analyserRef.current.getFloatFrequencyData(dataArray);
    analyserRef.current.getFloatTimeDomainData(timeDomainArray);
    
    // Lautstärke berechnen (RMS)
    let sum = 0;
    for (let i = 0; i < timeDomainArray.length; i++) {
      sum += timeDomainArray[i] * timeDomainArray[i];
    }
    const rms = Math.sqrt(sum / timeDomainArray.length);
    const volume = Math.max(0, Math.min(1, rms * 5)); // Normalisieren
    const isSpeaking = volume > 0.05; // Schwellenwert für Sprache
    
    // Nur analysieren wenn gesprochen wird
    if (isSpeaking) {
      const pitch = autoCorrelate(timeDomainArray, audioContextRef.current.sampleRate);
      
      // Validieren: Menschliche Stimme ca. 80-500 Hz (Grundton)
      if (pitch !== -1 && pitch > 70 && pitch < 600) {
        const fundamentalFreq = pitch;
        const toneInfo = getToneFromFrequency(fundamentalFreq);
        const dominantTone = toneInfo.tone;
        const cents = toneInfo.cents;
        
        setResult({
          fundamentalFreq,
          dominantTone,
          cents,
          spectrum: dataArray,
          volume,
          isSpeaking
        });
      }
    }
  };

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      // Nur stoppen, wenn noch aktiv
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
         audioContextRef.current.close();
      }
    };
  }, []);

  return {
    isRecording,
    startRecording,
    stopRecording,
    result,
    error
  };
}
