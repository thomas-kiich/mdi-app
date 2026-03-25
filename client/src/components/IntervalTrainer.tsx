import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Pause, X, Music2, Info, User, Mic, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TONES, ToneData } from "@/lib/tones";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { saveTrainingSession } from "@/lib/training";

interface IntervalTrainerProps {
  baseTone: ToneData;
  onClose: () => void;
}

const INTERVALS = [
  { 
    name: "Reine Quinte", 
    ratio: 1.5, 
    description: "Verbindung Nabel (Ich-Kraft) zu Herz (Verbundenheit). Harmonisiert und öffnet.",
    infoText: "Die Quinte ist eine der mächtigsten Harmonien. Sie verbindet deine Willenskraft (Nabel-Chakra) mit deiner Herzöffnung. Ideal für: Selbstermächtigung, emotionale Heilung, innere Stabilität. Beste Zeit: Morgens oder mittags. Dauer: 7-10 Min täglich für tiefe Wirkung."
  },
  { 
    name: "Oktave", 
    ratio: 2.0, 
    description: "Die Vollendung. Der gleiche Ton auf einer höheren Ebene. Transformation.",
    infoText: "Die Oktave ist die Vollkommenheit. Derselbe Ton, aber auf einer höheren Frequenz-Ebene. Sie aktiviert Transformation und Bewusstseinserweiterung. Ideal für: Spirituelle Entwicklung, innere Klarheit, Übergang. Beste Zeit: Abends zur Reflexion. Dauer: 5-15 Min, je nach Empfindung."
  },
  { 
    name: "Große Terz", 
    ratio: 1.25, 
    description: "Helle, freudige Ausdehnung. Schafft Raum und Zuversicht.",
    infoText: "Die Große Terz strahlt Freude und Optimismus aus. Sie öffnet Raum für Kreativität und positive Emotionen. Ideal für: Motivation, Kreativität, emotionale Leichtigkeit. Beste Zeit: Tagsüber für Energie-Boost. Dauer: 5-7 Min, um die Stimmung zu heben."
  },
];

export function IntervalTrainer({ baseTone, onClose }: IntervalTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(INTERVALS[0]);
  const [duration, setDuration] = useState<number[]>([10]); // Glissando duration
  const [octaveShift, setOctaveShift] = useState(0); // 0 = normal, -1 = lower octave (male), 1 = higher octave (female)
  const [phase, setPhase] = useState<'idle' | 'pre-hold' | 'glissando' | 'sustain'>('idle');
  
  // Microphone Analyzer Hook
  const { startRecording, stopRecording, result, isRecording } = useAudioAnalyzer();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);
  
  // Track session stats
  const sessionStartRef = useRef<number>(Date.now());
  const completedIntervalsRef = useRef<number>(0);

  useEffect(() => {
    // Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();

    return () => {
      stopSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
      
      // Save session on unmount if any intervals were completed
      if (completedIntervalsRef.current > 0) {
          const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
          saveTrainingSession({
              type: 'interval',
              duration: durationMinutes,
              tone: baseTone.name,
              frequency: baseTone.frequency,
              notes: `Intervall-Training: ${completedIntervalsRef.current} Durchgänge`
          });
      }
    };
  }, []);

  // Stop microphone when component unmounts or training stops
  useEffect(() => {
    if (!isPlaying && isRecording) {
      stopRecording();
    }
  }, [isPlaying, isRecording, stopRecording]);

  const startSequence = async () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    stopSound(); // Ensure clean slate
    startRecording(); // Start microphone

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const multiplier = Math.pow(2, octaveShift);
    const startFreq = baseTone.frequency * multiplier;
    const endFreq = (baseTone.frequency * selectedInterval.ratio) * multiplier;
    
    const preHoldDur = 3.0; // 3 seconds pre-hold
    const glissandoDur = duration[0];
    const sustainDur = 3.0; // 3 seconds sustain
    const totalDuration = preHoldDur + glissandoDur + sustainDur;

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    
    // Schedule Frequencies
    // 0 -> preHoldDur: Hold start frequency
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime + preHoldDur);
    // preHoldDur -> preHoldDur + glissandoDur: Glissando
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + preHoldDur + glissandoDur);
    // preHoldDur + glissandoDur -> totalDuration: Sustain end frequency
    osc.frequency.setValueAtTime(endFreq, ctx.currentTime + totalDuration);

    // Schedule Volume Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1); // Fade in start
    gain.gain.setValueAtTime(0.3, ctx.currentTime + totalDuration - 1); // Sustain volume
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + totalDuration); // Fade out end

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + totalDuration);

    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    // Animation Loop
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      
      // Determine Phase
      if (elapsed < preHoldDur) {
        setPhase('pre-hold');
        setProgress((elapsed / preHoldDur) * 100);
      } else if (elapsed < preHoldDur + glissandoDur) {
        setPhase('glissando');
        setProgress(((elapsed - preHoldDur) / glissandoDur) * 100);
      } else if (elapsed < totalDuration) {
        setPhase('sustain');
        setProgress(((elapsed - (preHoldDur + glissandoDur)) / sustainDur) * 100);
      } else {
        setPhase('idle');
        setIsPlaying(false);
        stopRecording(); // Stop mic when finished
        setProgress(0);
        completedIntervalsRef.current += 1; // Increment completed count
        return; // Stop animation
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
      } catch (e) {}
      oscillatorRef.current = null;
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
      gainNodeRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    setIsPlaying(false);
    setPhase('idle');
    setProgress(0);
    stopRecording();
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startSequence();
    }
  };

  // Intonation Check Logic
  const getIntonationStatus = () => {
    if (!result || !isPlaying) return null;

    const multiplier = Math.pow(2, octaveShift);
    let targetFreq = 0;

    if (phase === 'pre-hold') {
      targetFreq = baseTone.frequency * multiplier;
    } else if (phase === 'sustain') {
      targetFreq = (baseTone.frequency * selectedInterval.ratio) * multiplier;
    } else {
      return null; // Don't check during glissando
    }

    // Allow 5% deviation
    const deviation = Math.abs(result.fundamentalFreq - targetFreq);
    const tolerance = targetFreq * 0.05;

    if (deviation < tolerance) return 'match';
    if (result.fundamentalFreq < targetFreq) return 'low';
    return 'high';
  };

  const intonation = getIntonationStatus();

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Navigation Header */}
        <div className="absolute top-4 left-4 z-20">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            ZUR HAUPTSEITE
          </Button>
        </div>

        {/* Close Button (Redundant but good for UX) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10"
        >
          <X size={24} />
        </button>

          {/* Background Gradient Animation */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${baseTone.color}, transparent 70%)`,
            transform: `scale(${1 + (progress / 100) * 0.5})`,
            transition: 'transform 0.1s linear'
          }}
        />

        <CardHeader className="relative z-10 text-center pb-2 shrink-0 pt-12">
          <div className="mx-auto w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2" style={{ color: baseTone.color }}>
            <Music2 size={20} />
          </div>
          <CardTitle className="text-xl font-bold text-white">Intervall-Trainer</CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            Gleite von deinem Grundton (<span style={{ color: baseTone.color, textShadow: '0 0 10px rgba(0,0,0,0.5)' }} className="font-bold">{baseTone.name}</span>) zur Harmonie.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10 overflow-y-auto pb-6">
          
          {/* Body Visualization Area */}
          <div className="relative h-48 w-full bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden">
             {/* Simple Body Silhouette (Abstract) */}
             <svg viewBox="0 0 100 200" className="h-full opacity-40">
                <path d="M50 10 C 60 10 70 20 70 35 C 70 50 85 55 90 70 C 95 100 80 140 80 190 L 20 190 C 20 140 5 100 10 70 C 15 55 30 50 30 35 C 30 20 40 10 50 10" fill="currentColor" />
             </svg>
             
             {/* Energy Nodes */}
             {/* Nabel (Root/Start) */}
             <motion.div 
               className="absolute w-6 h-6 rounded-full border-2"
               style={{ 
                 bottom: '32%', 
                 backgroundColor: baseTone.color,
                 borderColor: baseTone.color,
                 boxShadow: phase === 'pre-hold' || phase === 'glissando' ? `0 0 25px ${baseTone.color}, inset 0 0 10px ${baseTone.color}` : `0 0 15px ${baseTone.color}`
               }}
               animate={{ scale: phase === 'pre-hold' ? [1, 1.5, 1] : 1 }}
               transition={{ repeat: Infinity, duration: 1.5 }}
             />
             
             {/* Herz (Heart/End) */}
             <motion.div 
               className="absolute w-4 h-4 rounded-full bg-white"
               style={{ 
                 bottom: '65%',
                 opacity: phase === 'sustain' || phase === 'glissando' ? 1 : 0.3,
                 boxShadow: phase === 'sustain' ? `0 0 30px white` : 'none'
               }}
               animate={{ scale: phase === 'sustain' ? [1, 1.3, 1] : 1 }}
               transition={{ repeat: Infinity, duration: 1.5 }}
             />

             {/* Connection Line */}
             {phase === 'glissando' && (
                <motion.div 
                  className="absolute w-1 bg-white/50"
                  style={{ bottom: '40%', height: '0%' }}
                  animate={{ height: '25%' }}
                  transition={{ duration: duration[0], ease: "linear" }}
                />
             )}
             
             {/* Status Text Overlay */}
             <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <AnimatePresence mode="wait">
                  {phase === 'pre-hold' && (
                    <motion.div 
                      key="pre-hold"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-zinc-700 text-orange-400 font-bold"
                    >
                      Einschwingen...
                    </motion.div>
                  )}
                  {phase === 'glissando' && (
                    <motion.div 
                      key="glissando"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-zinc-700 text-white font-bold"
                    >
                      Gleiten...
                    </motion.div>
                  )}
                  {phase === 'sustain' && (
                    <motion.div 
                      key="sustain"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="bg-black/60 px-4 py-2 rounded-full backdrop-blur-md border border-zinc-700 text-green-400 font-bold"
                    >
                      Halten & Spüren
                    </motion.div>
                  )}
                </AnimatePresence>
             </div>
             
             {/* Intonation Feedback Overlay */}
             {intonation && (
                <div className="absolute top-4 left-0 right-0 flex justify-center pointer-events-none">
                   <div className={`px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md border ${
                      intonation === 'match' ? 'bg-green-500/20 border-green-500 text-green-400' :
                      intonation === 'low' ? 'bg-red-500/20 border-red-500 text-red-400' :
                      'bg-red-500/20 border-red-500 text-red-400'
                   }`}>
                      {intonation === 'match' ? 'Perfekte Resonanz' :
                       intonation === 'low' ? 'Zu tief ↑' : 'Zu hoch ↓'}
                   </div>
                </div>
             )}
          </div>

          {/* Rhythm Bar (Reintroduced) */}
          <div className="relative w-full h-8 bg-zinc-800 rounded-lg overflow-hidden mx-auto flex items-center justify-center border border-zinc-700">
              {/* Background Progress */}
              <motion.div 
                className={`absolute left-0 top-0 bottom-0 ${
                  phase === 'pre-hold' ? 'bg-orange-500/50' :
                  phase === 'glissando' ? 'bg-white/30' :
                  phase === 'sustain' ? 'bg-green-500/50' : 'bg-transparent'
                }`}
                style={{ width: `${progress}%` }}
              />
              
              {/* Phase Labels */}
              <div className="relative z-10 flex w-full justify-between px-4 text-[10px] font-bold uppercase tracking-wider text-zinc-300">
                  <span className={phase === 'pre-hold' ? 'text-white' : ''}>1. Einschwingen</span>
                  <span className={phase === 'glissando' ? 'text-white' : ''}>2. Gleiten</span>
                  <span className={phase === 'sustain' ? 'text-white' : ''}>3. Halten</span>
              </div>
          </div>

          {/* Controls Row: Play Button + Octave Selection */}
          <div className="flex items-center justify-between gap-4 px-2">
             {/* Play Button */}
             <Button
              size="lg"
              onClick={togglePlay}
              className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-lg ${
                isPlaying 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 shadow-orange-500/20'
              }`}
            >
              {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
            </Button>

            {/* Octave Selection */}
            <div className="flex gap-1">
              <Button
                variant={octaveShift === -1 ? "default" : "outline"}
                onClick={() => setOctaveShift(-1)}
                className={`h-10 px-3 text-xs ${octaveShift === -1 ? "bg-orange-500 hover:bg-orange-600" : "border-zinc-700 text-zinc-400"}`}
                disabled={isPlaying}
              >
                Tief (M)
              </Button>
              <Button
                variant={octaveShift === 0 ? "default" : "outline"}
                onClick={() => setOctaveShift(0)}
                className={`h-10 px-3 text-xs ${octaveShift === 0 ? "bg-orange-500 hover:bg-orange-600" : "border-zinc-700 text-zinc-400"}`}
                disabled={isPlaying}
              >
                Normal
              </Button>
              <Button
                variant={octaveShift === 1 ? "default" : "outline"}
                onClick={() => setOctaveShift(1)}
                className={`h-10 px-3 text-xs ${octaveShift === 1 ? "bg-orange-500 hover:bg-orange-600" : "border-zinc-700 text-zinc-400"}`}
                disabled={isPlaying}
              >
                Hoch (W)
              </Button>
            </div>
          </div>

          {/* Interval Selection */}
          <div className="grid grid-cols-1 gap-2">
            {INTERVALS.map((interval) => {
               const multiplier = Math.pow(2, octaveShift);
               const startHz = Math.round(baseTone.frequency * multiplier);
               const endHz = Math.round((baseTone.frequency * interval.ratio) * multiplier);
               
               return (
                <button
                  key={interval.name}
                  onClick={() => !isPlaying && setSelectedInterval(interval)}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedInterval.name === interval.name
                      ? 'bg-zinc-800 border-orange-500/50 ring-1 ring-orange-500/20'
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 opacity-70'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                  disabled={isPlaying}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-semibold text-white">{interval.name}</span>
                    <span className="text-xs font-mono text-zinc-500">
                      {startHz} Hz → {endHz} Hz
                    </span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">
                    {interval.description}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Duration Slider */}
          <div className="space-y-2 pt-2 border-t border-zinc-800">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Dauer des Glissando</span>
              <span className="text-white font-mono">{duration[0]} Sek.</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={30}
              step={1}
              disabled={isPlaying}
              className="cursor-pointer"
            />
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
