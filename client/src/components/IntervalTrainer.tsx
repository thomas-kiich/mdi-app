import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Pause, X, Music2, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { TONES, ToneData } from "@/lib/tones";

interface IntervalTrainerProps {
  baseTone: ToneData;
  onClose: () => void;
}

const INTERVALS = [
  { name: "Reine Quinte", ratio: 1.5, description: "Verbindung Nabel (Ich-Kraft) zu Herz (Verbundenheit). Harmonisiert und öffnet." },
  { name: "Oktave", ratio: 2.0, description: "Die Vollendung. Der gleiche Ton auf einer höheren Ebene. Transformation." },
  { name: "Große Terz", ratio: 1.25, description: "Helle, freudige Ausdehnung. Schafft Raum und Zuversicht." },
];

export function IntervalTrainer({ baseTone, onClose }: IntervalTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedInterval, setSelectedInterval] = useState(INTERVALS[0]);
  const [duration, setDuration] = useState<number[]>([10]); // Seconds
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Initialize Audio Context
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();

    return () => {
      stopSound();
      if (audioCtxRef.current) {
        audioCtxRef.current.close();
      }
    };
  }, []);

  const startGlissando = async () => {
    if (!audioCtxRef.current) return;
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }

    stopSound(); // Ensure clean slate

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const startFreq = baseTone.frequency;
    const endFreq = baseTone.frequency * selectedInterval.ratio;
    const dur = duration[0];

    osc.type = 'sine';
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    
    // Smooth Glissando
    osc.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + dur);

    // Envelope
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 1); // Fade in
    gain.gain.setValueAtTime(0.3, ctx.currentTime + dur - 1); // Sustain
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + dur); // Fade out

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + dur);

    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    // Animation Loop for Progress Bar
    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      const p = Math.min((elapsed / dur) * 100, 100);
      setProgress(p);

      if (p < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsPlaying(false);
        setProgress(0);
      }
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
    setProgress(0);
  };

  const togglePlay = () => {
    if (isPlaying) {
      stopSound();
    } else {
      startGlissando();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl relative overflow-hidden">
        {/* Close Button */}
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

        <CardHeader className="relative z-10 text-center pb-2">
          <div className="mx-auto w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center mb-4 text-orange-500">
            <Music2 size={24} />
          </div>
          <CardTitle className="text-2xl font-bold text-white">Intervall-Trainer</CardTitle>
          <CardDescription className="text-zinc-400">
            Gleite von deinem Grundton ({baseTone.name}) zur Harmonie.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          
          {/* Interval Selection */}
          <div className="grid grid-cols-1 gap-3">
            {INTERVALS.map((interval) => (
              <button
                key={interval.name}
                onClick={() => !isPlaying && setSelectedInterval(interval)}
                className={`p-4 rounded-xl border text-left transition-all ${
                  selectedInterval.name === interval.name
                    ? 'bg-zinc-800 border-orange-500/50 ring-1 ring-orange-500/20'
                    : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 opacity-70'
                } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={isPlaying}
              >
                <div className="flex justify-between items-center mb-1">
                  <span className="font-semibold text-white">{interval.name}</span>
                  <span className="text-xs font-mono text-zinc-500">
                    {Math.round(baseTone.frequency)} Hz → {Math.round(baseTone.frequency * interval.ratio)} Hz
                  </span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {interval.description}
                </p>
              </button>
            ))}
          </div>

          {/* Duration Slider */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
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

          {/* Play Button & Visualization */}
          <div className="flex flex-col items-center gap-6 pt-4">
            <div className="relative w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-orange-500"
                style={{ width: `${progress}%` }}
              />
            </div>

            <Button
              size="lg"
              onClick={togglePlay}
              className={`w-20 h-20 rounded-full flex items-center justify-center transition-all shadow-lg ${
                isPlaying 
                  ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700' 
                  : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105 shadow-orange-500/20'
              }`}
            >
              {isPlaying ? <Pause size={32} /> : <Play size={32} className="ml-1" />}
            </Button>
            
            <p className="text-sm text-zinc-500 text-center animate-pulse">
              {isPlaying ? "Töne mit dem Klang nach oben..." : "Bereit zum Starten"}
            </p>
          </div>

        </CardContent>
      </Card>
    </div>
  );
}
