import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Play, Square, Volume2, VolumeX, Heart } from "lucide-react";

interface Method36TrainerProps {
    frequency: number;
    toneName: string;
    color: string;
    onClose: () => void;
}

// 36 BPM = 1 Beat every 1.6666... seconds (60 / 36)
const BEAT_DURATION = 1.666666; 
// Cycle: 
// 1. IN (1 Beat) -> Grow
// 2. HOLD (1 Beat) -> Stay
// 3. OUT/TONE (3 Beats) -> Shrink
// 4. HOLD (1 Beat) -> Stay
// Total: 6 Beats = 10 Seconds per Cycle

type Phase = 'IN' | 'HOLD_FULL' | 'TONE' | 'HOLD_EMPTY';

export function Method36Trainer({ frequency, toneName, color, onClose }: Method36TrainerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0); // 1 to 6
    const [phase, setPhase] = useState<Phase>('HOLD_EMPTY');
    const [cycleCount, setCycleCount] = useState(0);
    const [ringProgress, setRingProgress] = useState(0); // 0 to 1, hard synced
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const toneOscillatorsRef = useRef<OscillatorNode[]>([]);
    const toneGainRef = useRef<GainNode | null>(null);
    
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number>();

    // Initialize Audio
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        // Fix TS error by casting or passing undefined if constructor allows, but casting is safer here
        const ctx = new AudioContextClass() as AudioContext;
        audioCtxRef.current = ctx;
        const master = ctx.createGain();
        master.connect(ctx.destination);
        master.gain.value = 0.5;
        masterGainRef.current = master;

        return () => {
            stopTone();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            ctx.close();
        };
    }, []);

    const playGong = (pitch: 'low' | 'high') => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        // Short, crisp Gong/Ping
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        // Low gong for "Hold", High gong for "Inhale"
        osc.frequency.value = pitch === 'low' ? 440 : 880; // Higher pitch for clarity
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); // Fast Attack
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); // Short Decay (0.5s)
        
        osc.connect(gain).connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    };

    const playClick = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        // Soft metronome click
        const osc = ctx.createOscillator();
        osc.type = 'triangle';
        osc.frequency.value = 800;
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.05, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
        
        osc.connect(gain).connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
    };

    const startTone = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        if (ctx.state === 'suspended') ctx.resume();
        
        stopTone(); // Clear previous

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0, ctx.currentTime);
        // Fade in over 0.5s
        toneGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.5); 
        toneGain.connect(masterGainRef.current);
        toneGainRef.current = toneGain;

        // Rich Drone Synthesis - ONE OCTAVE HIGHER
        const baseFreq = frequency * 2; // Octave Shift Up

        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.value = baseFreq;
        
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.value = baseFreq / 2; // Sub (now original freq)
        
        const osc3 = ctx.createOscillator();
        osc3.type = 'sine';
        osc3.frequency.value = baseFreq * 1.5; // Fifth

        [osc1, osc2, osc3].forEach(osc => {
            osc.connect(toneGain);
            osc.start();
            toneOscillatorsRef.current.push(osc);
        });
    };

    const stopTone = () => {
        const ctx = audioCtxRef.current;
        if (toneGainRef.current && ctx) {
            // Long release: Fade out over 2 seconds (spilling into the next beat)
            toneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5); 
        }
        // Cleanup oscillators later
        const oldOscillators = [...toneOscillatorsRef.current];
        toneOscillatorsRef.current = []; // Clear ref immediately
        setTimeout(() => {
            oldOscillators.forEach(osc => {
                try { osc.stop(); } catch(e) {}
            });
        }, 3000); // Wait for fade out
    };

    const updateLoop = () => {
        if (!isPlaying) return;

        const now = Date.now();
        const elapsed = (now - startTimeRef.current) / 1000; // Seconds
        const totalCycleTime = BEAT_DURATION * 6; // 10 seconds
        const cycleTime = elapsed % totalCycleTime;
        
        // Hard Sync Ring Progress (0 to 1)
        // Ensure it loops perfectly from 0 to 1 every 10 seconds
        setRingProgress(cycleTime / totalCycleTime);

        // Determine Beat (1-6)
        const beatIndex = Math.floor(cycleTime / BEAT_DURATION); // 0 to 5
        const beat = beatIndex + 1; // 1 to 6
        
        if (beat !== currentBeat) {
            setCurrentBeat(beat);
            
            // Logic for Phases & Sounds
            if (beat === 1) {
                setPhase('IN');
                setCycleCount(c => c + 1);
                playGong('high'); // Signal IN
            } else if (beat === 2) {
                setPhase('HOLD_FULL');
                playGong('low'); // Signal HOLD
            } else if (beat === 3) {
                setPhase('TONE');
                startTone(); // Start Drone (lasts 3,4,5)
            } else if (beat === 6) {
                setPhase('HOLD_EMPTY');
                stopTone(); // Start release
                playGong('low'); // Signal HOLD
            } else {
                playClick(); // Just a click for intermediate beats (4, 5)
            }
        }
        
        requestRef.current = requestAnimationFrame(updateLoop);
    };

    // Effect to start/stop loop
    useEffect(() => {
        if (isPlaying) {
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            
            startTimeRef.current = Date.now();
            setCurrentBeat(0);
            setRingProgress(0);
            requestRef.current = requestAnimationFrame(updateLoop);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            stopTone();
            setPhase('HOLD_EMPTY');
            setCurrentBeat(0);
            setRingProgress(0);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 text-white font-sans backdrop-blur-xl">
            
            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <Heart className="text-red-500 animate-pulse" />
                    <h2 className="text-xl font-bold tracking-widest">METHODE 36 TRAINER</h2>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full hover:bg-white/10">
                    <X className="h-6 w-6" />
                </Button>
            </div>

            {/* Central Visual */}
            <div className="relative w-[500px] h-[500px] flex items-center justify-center">
                
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
                    style={{ backgroundColor: color }} // Fallback
                >
                    {/* Inner Text */}
                    <div className="flex flex-col items-center justify-center text-black font-bold pointer-events-none select-none">
                        <span className="text-4xl tracking-tighter leading-tight">
                            {phase === 'IN' ? 'EIN' : phase === 'TONE' ? 'MANTRA YOHN TÖNEN' : 'HALTEN'}
                        </span>
                        <span className="text-sm font-mono opacity-50 mt-2">{toneName} • {(frequency * 2).toFixed(1)} Hz</span>
                    </div>
                </motion.div>

                {/* Beat Indicator Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                    {/* Background track */}
                    <circle
                        cx="250" cy="250" r="260"
                        fill="none"
                        stroke="white"
                        strokeWidth="2"
                        strokeOpacity="0.1"
                    />
                    
                    {/* Progress Segment - Hard Synced via React State */}
                    {isPlaying && (
                        <circle
                            cx="250" cy="250" r="260"
                            fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 260}
                            strokeDashoffset={2 * Math.PI * 260 * (1 - ringProgress)} // Direct mapping
                            className="origin-center transition-all duration-75 ease-linear" // Smooth micro-steps
                        />
                    )}
                    
                    {/* 12 o'clock marker */}
                    <circle cx="250" cy="-10" r="4" fill="white" fillOpacity="0.5" />
                </svg>
            </div>

            {/* Controls */}
            <div className="absolute bottom-12 flex flex-col items-center gap-6">
                <div className="flex items-center gap-8 text-white/50 font-mono text-sm">
                    <div className={currentBeat === 1 ? "text-white font-bold scale-110 transition-all" : ""}>1 • EIN</div>
                    <div className={currentBeat === 2 ? "text-white font-bold scale-110 transition-all" : ""}>2 • HALTEN</div>
                    <div className={currentBeat >= 3 && currentBeat <= 5 ? "text-white font-bold scale-110 transition-all" : ""}>3-5 • MANTRA YOHN TÖNEN</div>
                    <div className={currentBeat === 6 ? "text-white font-bold scale-110 transition-all" : ""}>6 • HALTEN</div>
                </div>

                <Button 
                    size="lg"
                    className="rounded-full px-12 py-8 text-xl font-bold tracking-widest bg-white text-black hover:bg-gray-200 transition-all scale-100 hover:scale-105"
                    onClick={() => setIsPlaying(!isPlaying)}
                >
                    {isPlaying ? (
                        <><Square className="mr-3 fill-current" /> STOP</>
                    ) : (
                        <><Play className="mr-3 fill-current" /> START TRAINING</>
                    )}
                </Button>
            </div>

        </div>
    );
}
