import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Heart, ToggleLeft, ToggleRight, Play, Square } from "lucide-react";

interface Method36TrainerProps {
    frequency: number;
    toneName: string;
    color: string;
    onClose: () => void;
}

// 36 BPM = 1 Beat every 1.6666... seconds (60 / 36)
const BEAT_DURATION = 1.666666; 

type Phase = 'IN' | 'HOLD_FULL' | 'TONE' | 'HOLD_EMPTY';

export function Method36Trainer({ frequency, toneName, color, onClose }: Method36TrainerProps) {
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0); // 1 to 6
    const [phase, setPhase] = useState<Phase>('HOLD_EMPTY');
    const [cycleCount, setCycleCount] = useState(0);
    const [isHighOctave, setIsHighOctave] = useState(false); // Default to Low Octave (Base Frequency)
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const toneOscillatorsRef = useRef<OscillatorNode[]>([]);
    const toneGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number>(0);
    const lastBeatRef = useRef<number>(0); // Track last processed beat to prevent double counting

    // Initialize Audio
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass() as AudioContext;
        audioCtxRef.current = ctx;
        
        const master = ctx.createGain();
        master.connect(ctx.destination);
        // REDUCED GAIN TO 5% TO PREVENT CLIPPING AND ENSURE SOFTNESS
        master.gain.value = 0.05; 
        masterGainRef.current = master;

        // Create Low-Pass Filter for "Softness"
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 800; // Cutoff at 800Hz to remove harsh digital highs
        filter.Q.value = 0.5; // Smooth rolloff
        filter.connect(master);
        filterRef.current = filter;

        return () => {
            stopTone();
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            ctx.close();
        };
    }, []);

    const playGong = (pitch: 'low' | 'high') => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = pitch === 'low' ? 440 : 880; 
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01); 
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5); 
        
        osc.connect(gain).connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 0.6);
    };

    const playClick = () => {
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
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
        if (!ctx || !masterGainRef.current || !filterRef.current) return;
        
        if (ctx.state === 'suspended') ctx.resume();
        
        stopTone(); 

        const toneGain = ctx.createGain();
        toneGain.gain.setValueAtTime(0, ctx.currentTime);
        toneGain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.5); 
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
        const cycleTime = elapsed % totalCycleTime;
        
        const beatIndex = Math.floor(cycleTime / BEAT_DURATION); 
        const beat = beatIndex + 1; 
        
        // Only trigger updates when the beat actually changes
        if (beat !== lastBeatRef.current) {
            lastBeatRef.current = beat;
            setCurrentBeat(beat);
            
            if (beat === 1) {
                setPhase('IN');
                // Increment cycle count ONLY on beat 1
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
                playClick(); 
            }
        }
        
        requestRef.current = requestAnimationFrame(updateLoop);
    };

    // Fix: Explicitly restart the loop when isPlaying changes
    useEffect(() => {
        if (isPlaying) {
            if (audioCtxRef.current?.state === 'suspended') {
                audioCtxRef.current.resume();
            }
            
            startTimeRef.current = Date.now();
            lastBeatRef.current = 0; // Reset beat tracker
            setCurrentBeat(0);
            setCycleCount(0); // Reset cycles on start
            requestRef.current = requestAnimationFrame(updateLoop);
        } else {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            stopTone();
            setPhase('HOLD_EMPTY');
            setCurrentBeat(0);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [isPlaying]);

    // Restart tone if octave changes while playing in TONE phase
    useEffect(() => {
        if (isPlaying && phase === 'TONE') {
            startTone();
        }
    }, [isHighOctave]);

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
                    style={{ backgroundColor: color }} 
                >
                    {/* Inner Text */}
                    <div className="flex flex-col items-center justify-center text-black font-bold pointer-events-none select-none">
                        <span className="text-4xl tracking-tighter leading-tight">
                            {phase === 'IN' ? 'EIN' : phase === 'TONE' ? 'MANTRA YOHN TÖNEN' : 'HALTEN'}
                        </span>
                        <span className="text-sm font-mono opacity-50 mt-2">
                            {toneName} • {(isHighOctave ? frequency * 2 : frequency).toFixed(1)} Hz
                        </span>
                    </div>
                </motion.div>

                {/* Beat Indicator Ring */}
                <svg className="absolute inset-0 w-full h-full -rotate-90 pointer-events-none overflow-visible">
                    <circle cx="250" cy="250" r="260" fill="none" stroke="white" strokeWidth="2" strokeOpacity="0.1" />
                    {isPlaying && (
                        <circle
                            cx="250" cy="250" r="260"
                            fill="none"
                            stroke={color}
                            strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray="1633.6" // 2 * PI * 260
                            strokeDashoffset="1633.6"
                            className="transition-all ease-linear"
                            style={{ 
                                animation: `ringProgress 10s linear infinite`,
                            }}
                        />
                    )}
                </svg>
                
                {/* CSS Keyframes for Hard Sync */}
                <style>{`
                    @keyframes ringProgress {
                        from { stroke-dashoffset: 1633.6; }
                        to { stroke-dashoffset: 0; }
                    }
                `}</style>
            </div>

            {/* Octave Toggle (Bottom Left) */}
            <div className="absolute bottom-8 left-8 flex flex-col items-start gap-2 z-50">
                <span className="text-xs uppercase tracking-widest text-white/40 ml-1">Oktave</span>
                <div className="flex items-center gap-3 bg-black/40 px-4 py-2 rounded-lg backdrop-blur-md border border-white/10 hover:border-white/30 transition-colors">
                    <span className={`text-xs font-medium ${!isHighOctave ? 'text-white' : 'text-white/40'}`}>Tief (M)</span>
                    <button 
                        onClick={() => setIsHighOctave(!isHighOctave)}
                        className="text-orange-500 hover:text-orange-400 transition-colors focus:outline-none"
                    >
                        {isHighOctave ? <ToggleRight className="w-8 h-8" /> : <ToggleLeft className="w-8 h-8" />}
                    </button>
                    <span className={`text-xs font-medium ${isHighOctave ? 'text-white' : 'text-white/40'}`}>Hoch (W)</span>
                </div>
            </div>

            {/* Controls (Center Bottom) */}
            <div className="absolute bottom-12 flex flex-col items-center gap-6">
                <div className="flex items-center gap-8">
                    <div className="text-center">
                        <div className="text-4xl font-mono font-bold tabular-nums">{cycleCount}</div>
                        <div className="text-xs uppercase tracking-widest opacity-50">Zyklen</div>
                    </div>

                    <Button 
                        size="lg" 
                        className="h-20 w-20 rounded-full text-xl shadow-[0_0_50px_rgba(255,165,0,0.3)] hover:scale-105 transition-transform"
                        style={{ backgroundColor: isPlaying ? '#333' : '#ff6b00' }}
                        onClick={() => setIsPlaying(!isPlaying)}
                    >
                        {isPlaying ? <Square className="fill-current" /> : <Play className="fill-current ml-1" />}
                    </Button>
                </div>
            </div>

        </div>
    );
}
