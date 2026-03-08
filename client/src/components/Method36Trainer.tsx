import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Heart, Play, Square, Volume2, VolumeX, ArrowUpCircle, ArrowDownCircle, Clock } from "lucide-react";

interface Method36TrainerProps {
    frequency: number;
    toneName: string;
    color: string;
    duration?: number; // Duration in minutes
    onClose: () => void;
}

// 36 BPM = 1 Beat every 1.6666... seconds (60 / 36)
const BEAT_DURATION = 1.666666; 

type Phase = 'IN' | 'HOLD_FULL' | 'TONE' | 'HOLD_EMPTY';

export function Method36Trainer({ frequency, toneName, color, duration, onClose }: Method36TrainerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0); // 1 to 6
    const [phase, setPhase] = useState<Phase>('HOLD_EMPTY');
    const [cycleCount, setCycleCount] = useState(0);
    const [isHighOctave, setIsHighOctave] = useState(false); // Default to Low Octave (Base Frequency)
    const [timeLeft, setTimeLeft] = useState<number | null>(duration ? duration * 60 : null);
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const toneOscillatorsRef = useRef<OscillatorNode[]>([]);
    const toneGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number>(0);
    const lastBeatRef = useRef<number>(0); // Track last processed beat to prevent double counting
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate total cycles if duration is set
    // 1 cycle = 6 beats * 1.666s = 10 seconds
    const totalCycles = duration ? duration * 6 : null;

    // Initialize Audio
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass() as AudioContext;
        audioCtxRef.current = ctx;
        
        const master = ctx.createGain();
        master.connect(ctx.destination);
        // INCREASED MASTER VOLUME TO 30% (was 5%)
        master.gain.value = 0.3; 
        masterGainRef.current = master;

        // Create Low-Pass Filter for "Softness"
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 1200; // Increased slightly to 1200Hz for clarity
        filter.Q.value = 0.5; // Smooth rolloff
        filter.connect(master);
        filterRef.current = filter;

        return () => {
            stopTone();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            ctx.close();
        };
    }, []);

    const playGong = (pitch: 'low' | 'high' | 'end') => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        
        if (pitch === 'end') {
            osc.frequency.value = 220; // Deep gong for end
        } else {
            osc.frequency.value = pitch === 'low' ? 440 : 880; 
        }
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        
        if (pitch === 'end') {
            // Long decay for end gong
            gain.gain.linearRampToValueAtTime(0.8, ctx.currentTime + 0.1); 
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4.0); 
            osc.connect(gain).connect(masterGainRef.current);
            osc.start();
            osc.stop(ctx.currentTime + 4.5);
        } else {
            // INCREASED GONG VOLUME
            gain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.01); 
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); 
            osc.connect(gain).connect(masterGainRef.current);
            osc.start();
            osc.stop(ctx.currentTime + 0.6);
        }
    };

    const playClick = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 800;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        // INCREASED CLICK VOLUME
        gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.connect(gain).connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const startTone = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current || !filterRef.current) return;
        
        if (ctx.state === 'suspended') ctx.resume();
        
        stopTone(); 

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0, ctx.currentTime);
        // INCREASED TONE VOLUME
        toneGain.gain.linearRampToValueAtTime(0.6, ctx.currentTime + 0.5); 
        // Connect to Filter instead of Master directly
        toneGain.connect(filterRef.current); 
        toneGainRef.current = toneGain;

        // Frequency Selection: Base or Octave Up
        const baseFreq = isHighOctave ? frequency * 2 : frequency;

        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle'; 
        osc1.frequency.value = baseFreq;
        // Detune slightly to create warmth but avoid fast beating
        osc1.detune.value = -2; 
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'sine'; 
        osc2.frequency.value = baseFreq; 
        
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = baseFreq * 1.5; // Fifth (Dominant)
        // Detune fifth slightly for richness
        osc3.detune.value = 2;

        const g1 = ctx.createGain(); g1.gain.value = 0.3; // Reduced Triangle Body
        const g2 = ctx.createGain(); g2.gain.value = 0.6; // Increased Sine Fundamental
        const g3 = ctx.createGain(); g3.gain.value = 0.08; // Very subtle Fifth

        osc1.connect(g1).connect(toneGain);
        osc2.connect(g2).connect(toneGain);
        osc3.connect(g3).connect(toneGain);

        [osc1, osc2, osc3].forEach(osc => osc.start());
        toneOscillatorsRef.current.push(osc1, osc2, osc3);
    };

    const stopTone = () => {
        const ctx = audioCtxRef.current;
        if (toneGainRef.current && ctx) {
            // Longer release to avoid clicking
            toneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.8); 
        }
        const oldOscillators = [...toneOscillatorsRef.current];
        toneOscillatorsRef.current = []; 
        setTimeout(() => {
            oldOscillators.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
        }, 4000); 
    };

    const updateLoop = () => {
        if (!isPlaying) return;

        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000; 
        const totalCycleTime = BEAT_DURATION * 6; 
        
        // Calculate which beat we are in (1-6)
        // Cycle starts at 0. Beat 1 is 0-BEAT_DURATION.
        const cycleTime = elapsed % totalCycleTime;
        const beatIndex = Math.floor(cycleTime / BEAT_DURATION); 
        const beat = beatIndex + 1; 
        
        // Only trigger updates when the beat actually changes
        if (beat !== lastBeatRef.current) {
            lastBeatRef.current = beat;
            setCurrentBeat(beat);
            
            // Phase Logic
            // Beat 1: EIN (Inhale)
            // Beat 2: HALTEN (Hold Full)
            // Beat 3-5: TÖNEN (Tone - 3 beats)
            // Beat 6: HALTEN (Hold Empty)
            
            if (beat === 1) {
                setPhase('IN');
                setCycleCount(c => c + 1);
                playGong('high'); 
            } else if (beat === 2) {
                setPhase('HOLD_FULL');
                playGong('low'); 
            } else if (beat === 3) {
                setPhase('TONE');
                startTone(); 
            } else if (beat === 6) {
                setPhase('HOLD_EMPTY');
                stopTone(); 
                playGong('low'); 
            } else {
                // Beats 4 and 5 (during TONE)
                playClick(); 
            }
        }
        
        requestRef.current = requestAnimationFrame(updateLoop);
    };

    useEffect(() => {
        if (isPlaying) {
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            
            startTimeRef.current = Date.now();
            lastBeatRef.current = 0; 
            setCurrentBeat(0);
            setCycleCount(0); 
            requestRef.current = requestAnimationFrame(updateLoop);

            // Start Timer if duration is set
            if (duration) {
                setTimeLeft(duration * 60);
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                
                timerIntervalRef.current = setInterval(() => {
                    setTimeLeft(prev => {
                        if (prev === null || prev <= 0) {
                            // Timer finished
                            setIsPlaying(false);
                            playGong('end');
                            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                            return 0;
                        }
                        return prev - 1;
                    });
                }, 1000);
            }

        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            stopTone();
            setPhase('HOLD_EMPTY');
            setCurrentBeat(0);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [isPlaying, duration]);

    // Restart tone if octave changes while playing in TONE phase
    useEffect(() => {
        if (isPlaying && phase === 'TONE') {
            startTone();
        }
    }, [isHighOctave]);

    // Format time helper
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 text-white font-sans backdrop-blur-xl">
            
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <Heart className="text-red-500 animate-pulse" />
                    <h2 className="text-xl font-bold tracking-widest hidden md:block">METHODE 36 TRAINER</h2>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Timer Display */}
                    {timeLeft !== null && (
                        <div className={`font-mono text-xl md:text-2xl font-bold ${timeLeft < 60 ? 'text-red-500 animate-pulse' : 'text-orange-400'}`}>
                            {formatTime(timeLeft)}
                        </div>
                    )}

                    <Button 
                        variant="outline" 
                        onClick={onClose} 
                        className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white"
                    >
                        <X className="mr-2 h-4 w-4" /> Schließen
                    </Button>
                </div>
            </div>

            {/* Central Visual */}
            <div className="relative w-[300px] h-[300px] md:w-[500px] md:h-[500px] flex items-center justify-center">
                
                {/* Guide Circle (Static Outline) */}
                <div className="absolute inset-0 border border-white/10 rounded-full" />
                <div className="absolute inset-[35%] border border-white/10 rounded-full border-dashed" />

                {/* Animated Breath Circle */}
                <motion.div
                    animate={phase}
                    variants={{
                        IN: { scale: 1.0, opacity: 1, backgroundColor: color },
                        HOLD_FULL: { scale: 1.0, opacity: 0.9, backgroundColor: color },
                        TONE: { scale: 0.35, opacity: 0.8, backgroundColor: color }, // Shrink
                        HOLD_EMPTY: { scale: 0.35, opacity: 0.5, backgroundColor: color }
                    }}
                    transition={{ 
                        duration: phase === 'TONE' ? BEAT_DURATION * 3 : BEAT_DURATION, 
                        ease: "easeInOut" 
                    }}
                    className="w-full h-full rounded-full shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center text-center p-8"
                    style={{ backgroundColor: color }} 
                >
                    {/* Inner Text */}
                    <div className="flex flex-col items-center justify-center text-black font-bold pointer-events-none select-none">
                        <span className="text-2xl md:text-4xl tracking-tighter leading-tight">
                            {phase === 'IN' ? 'EIN' : phase === 'TONE' ? 'MANTRA YOHN TÖNEN' : 'HALTEN'}
                        </span>
                        <span className="text-xs md:text-sm mt-2 opacity-70 uppercase tracking-widest">
                            {phase === 'IN' ? 'Energie aufnehmen' : phase === 'TONE' ? 'Frequenz senden' : 'Stille'}
                        </span>
                    </div>
                </motion.div>

                {/* Beat Indicator Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                    {/* Render 6 segments for beats */}
                    {[...Array(6)].map((_, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const r = 260; // Radius slightly outside (adjust for mobile if needed, but keeping simple)
                        // Mobile adjustment logic handled by CSS scaling if needed, but SVG is relative to container
                        // Container is fixed size, so we might need responsive logic if we want perfect mobile fit
                        // For now, let's keep r relative to 500px container.
                        // Wait, r=260 is outside 500px (r=250). 
                        
                        // Let's use percentages for responsiveness if we can, or just stick to fixed since container is fixed.
                        // Actually container is responsive: w-[300px] md:w-[500px]
                        // We need to calculate based on container size.
                        // SVG viewBox approach is better.
                        
                        return null; // Rendered below with viewBox
                    })}
                </svg>
                
                {/* SVG Overlay for Indicators - using viewBox for responsiveness */}
                <svg className="absolute inset-[-10%] w-[120%] h-[120%] -rotate-90 pointer-events-none overflow-visible" viewBox="0 0 600 600">
                     {/* Progress Ring Background */}
                     {totalCycles && (
                         <circle 
                            cx="300" cy="300" r="290" 
                            fill="none" 
                            stroke="#333" 
                            strokeWidth="2"
                         />
                     )}
                     
                     {/* Progress Ring Active */}
                     {totalCycles && (
                         <circle 
                            cx="300" cy="300" r="290" 
                            fill="none" 
                            stroke={color} 
                            strokeWidth="4"
                            strokeDasharray={`${(cycleCount / totalCycles) * 1822} 1822`} // 2 * PI * 290 approx 1822
                            strokeLinecap="round"
                            className="transition-all duration-1000 ease-linear"
                         />
                     )}

                     {[...Array(6)].map((_, i) => {
                        const angle = (i * 60) * (Math.PI / 180);
                        const r = 280; // Relative to 600x600 viewBox (center 300,300)
                        const x = 300 + r * Math.cos(angle);
                        const y = 300 + r * Math.sin(angle);
                        const isActive = currentBeat === i + 1;
                        
                        return (
                             <circle 
                                key={i}
                                cx={x} cy={y} 
                                r={isActive ? 8 : 4}
                                fill={isActive ? "#fff" : "#333"}
                                className="transition-all duration-300"
                             />
                        );
                    })}
                </svg>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 flex flex-col items-center gap-6 w-full max-w-md px-6 z-20">
                
                {/* Octave Toggle */}
                <div className="flex items-center gap-4 bg-zinc-900/50 p-2 rounded-full border border-white/10 backdrop-blur-md">
                    <span className="text-xs text-zinc-500 pl-3 font-mono uppercase">Oktave</span>
                    <div className="flex gap-1">
                        <Button 
                            size="sm" 
                            variant={!isHighOctave ? "default" : "ghost"}
                            onClick={() => setIsHighOctave(false)}
                            className={!isHighOctave ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-400 hover:text-white"}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4" /> Tief
                        </Button>
                        <Button 
                            size="sm" 
                            variant={isHighOctave ? "default" : "ghost"}
                            onClick={() => setIsHighOctave(true)}
                            className={isHighOctave ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-400 hover:text-white"}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Hoch
                        </Button>
                    </div>
                </div>

                {/* Main Play Button */}
                <Button 
                    size="lg"
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`rounded-full px-12 py-8 text-xl font-bold transition-all shadow-xl ${
                        isPlaying 
                        ? 'bg-zinc-800 text-white hover:bg-zinc-700 border border-white/20' 
                        : 'bg-white text-black hover:bg-zinc-200 hover:scale-105'
                    }`}
                >
                    {isPlaying ? <Square className="mr-3 h-6 w-6 fill-current" /> : <Play className="mr-3 h-6 w-6 fill-current" />}
                    {isPlaying ? "PAUSE" : "START"}
                </Button>
                
                <div className="text-zinc-500 text-xs font-mono">
                    {totalCycles ? (
                        <span className={cycleCount >= totalCycles ? "text-green-500 font-bold" : ""}>
                            ZYKLUS: {cycleCount} / {totalCycles}
                        </span>
                    ) : (
                        cycleCount > 0 ? `ZYKLUS: ${cycleCount}` : "36 BPM RHYTHMUS"
                    )}
                </div>
            </div>
        </div>
    );
}
