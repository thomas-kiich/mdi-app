import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Wind, Play, Square, Volume2, VolumeX, Activity, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface MetabolicBreathingTrainerProps {
    frequency: number;
    toneName: string;
    color: string;
    audioModule?: '7min' | '21min' | '21min-loop';
    onClose: () => void;
}

// 36 BPM = 1 Beat every 1.6666... seconds (60 / 36)
const BEAT_DURATION = 1.666666; 

type Phase = 'IN' | 'OUT';

export function MetabolicBreathingTrainer({ frequency, toneName, color, audioModule = '7min', onClose }: MetabolicBreathingTrainerProps) {
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [phase, setPhase] = useState<Phase>('OUT');
    const [cycleCount, setCycleCount] = useState(0);
    const [isMuted, setIsMuted] = useState(false);
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const requestRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0);
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Initialize Audio
    useEffect(() => {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContextClass() as AudioContext;
        audioCtxRef.current = ctx;
        
        const master = ctx.createGain();
        master.connect(ctx.destination);
        master.gain.value = 0.3; 
        masterGainRef.current = master;

        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            ctx.close();
        };
    }, []);

    const playGong = (pitch: 'low' | 'high') => {
        if (isMuted) return;
        const ctx = audioCtxRef.current;
        if (!ctx || !masterGainRef.current) return;
        
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        
        // High gong for Inhale (Start), Low gong for Exhale
        // We use harmonics of the user's fundamental frequency if possible, or standard A4/A3
        // For simplicity and clarity in this passive mode, let's use a clear 5th interval or Octave
        // Let's use the user's frequency!
        
        const baseFreq = frequency;
        
        if (pitch === 'high') {
            // High Gong: Octave up
            osc.frequency.value = baseFreq * 2; 
        } else {
            // Low Gong: Fundamental
            osc.frequency.value = baseFreq; 
        }
        
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0, ctx.currentTime);
        
        // Soft attack, long release
        gain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.05); 
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2.0); 
        
        osc.connect(gain).connect(masterGainRef.current);
        osc.start();
        osc.stop(ctx.currentTime + 2.5);
    };

    const startTraining = () => {
        const ctx = audioCtxRef.current;
        if (!ctx) return;
        if (ctx.state === 'suspended') ctx.resume();
        
        setIsPlaying(true);
        setCycleCount(0);
        setPhase('OUT'); // Reset to start
        
        // The cycle is 6 beats total: 2 IN, 4 OUT
        // Total duration = 6 * 1.666s = 10s
        const CYCLE_DURATION = 6 * BEAT_DURATION * 1000;
        const IN_DURATION = 2 * BEAT_DURATION * 1000;
        
        let cycleStart = Date.now();
        
        // Initial Gong (High for Inhale)
        playGong('high');
        setPhase('IN');

        // Better approach: Main Loop Function
        // We need to keep track of the LAST phase to detect transitions
        // Initialize lastPhase to 'IN' because we manually start with IN
        let lastPhase: Phase = 'IN'; 

        const loop = () => {
            const now = Date.now();
            const elapsed = now - cycleStart;
            const cycleTime = elapsed % CYCLE_DURATION;
            
            // Determine Phase based on time
            let currentPhase: Phase = 'OUT';
            if (cycleTime < IN_DURATION) {
                currentPhase = 'IN';
            } else {
                currentPhase = 'OUT';
            }

            // Detect Edge
            if (currentPhase !== lastPhase) {
                // Update React State
                setPhase(currentPhase);
                
                // Trigger Audio
                if (currentPhase === 'IN') {
                    playGong('high');
                    setCycleCount(c => c + 1);
                } else {
                    playGong('low');
                }
                
                // Update tracker
                lastPhase = currentPhase;
            }
            
            requestRef.current = requestAnimationFrame(loop);
        };
        
        // Reset state for loop
        cycleStart = Date.now();
        setPhase('IN');
        playGong('high');
        
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(loop);
    };

    const stopTraining = () => {
        setIsPlaying(false);
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setPhase('OUT');
    };

    const toggleMute = () => {
        setIsMuted(!isMuted);
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            
            {/* Background Ambient Animation */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute inset-0 bg-gradient-to-b from-blue-900/20 to-black transition-opacity duration-1000 ${phase === 'IN' ? 'opacity-100' : 'opacity-50'}`} />
            </div>

            <div className="relative z-10 w-full max-w-md flex flex-col items-center">
                
                {/* Header */}
                <div className="w-full flex justify-between items-center mb-12">
                    <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-blue-500" />
                        <span className="text-blue-500 font-mono text-sm tracking-widest uppercase">Stoffwechsel-Atmung</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={onClose}
                        className="text-zinc-500 hover:text-white hover:bg-white/10 rounded-full"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Main Visualizer */}
                <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
                    {/* Breathing Circle */}
                    <motion.div 
                        className="absolute inset-0 rounded-full bg-blue-500/20 blur-xl"
                        animate={{
                            scale: phase === 'IN' ? 1.5 : 1.0,
                            opacity: phase === 'IN' ? 0.6 : 0.2,
                        }}
                        transition={{
                            duration: phase === 'IN' ? 2 * BEAT_DURATION : 4 * BEAT_DURATION,
                            ease: "easeInOut"
                        }}
                    />
                    
                    <motion.div 
                        className="w-32 h-32 rounded-full border-2 border-blue-500 flex items-center justify-center relative bg-black/50 backdrop-blur-sm"
                        animate={{
                            scale: phase === 'IN' ? 1.2 : 1.0,
                            borderColor: phase === 'IN' ? 'rgba(59, 130, 246, 1)' : 'rgba(59, 130, 246, 0.3)',
                        }}
                        transition={{
                            duration: phase === 'IN' ? 2 * BEAT_DURATION : 4 * BEAT_DURATION,
                            ease: "easeInOut"
                        }}
                    >
                        <span className="text-2xl font-bold text-white font-mono">
                            {phase === 'IN' ? 'EIN' : 'AUS'}
                        </span>
                    </motion.div>

                    {/* Ripple Effects */}
                    {isPlaying && (
                        <>
                             <motion.div
                                className="absolute inset-0 rounded-full border border-blue-500/30"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                            />
                             <motion.div
                                className="absolute inset-0 rounded-full border border-blue-500/20"
                                initial={{ scale: 1, opacity: 0 }}
                                animate={{ scale: 2, opacity: 0 }}
                                transition={{ duration: 4, delay: 2, repeat: Infinity, ease: "linear" }}
                            />
                        </>
                    )}
                </div>

                {/* Controls */}
                <div className="flex flex-col items-center gap-8 w-full">
                    
                    <div className="flex items-center gap-8">
                        <Button
                            size="icon"
                            variant="ghost"
                            onClick={toggleMute}
                            className={`rounded-full w-12 h-12 ${isMuted ? 'text-zinc-600' : 'text-blue-400'}`}
                        >
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </Button>

                        <Button
                            size="lg"
                            onClick={isPlaying ? stopTraining : startTraining}
                            className={`rounded-full w-20 h-20 flex items-center justify-center transition-all duration-500 ${
                                isPlaying 
                                    ? 'bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700' 
                                    : 'bg-white text-black hover:scale-105 shadow-[0_0_30px_rgba(59,130,246,0.3)]'
                            }`}
                        >
                            {isPlaying ? <Square className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </Button>
                        
                        <div className="w-12 h-12 flex items-center justify-center">
                            {/* Placeholder for symmetry */}
                        </div>
                    </div>

                    <div className="text-center space-y-2">
                        <p className="text-zinc-500 text-sm uppercase tracking-widest">Rhythmus 2:4</p>
                        <p className="text-zinc-600 text-xs">
                            {isPlaying ? `${cycleCount} Atemzüge` : 'Bereit zum Start'}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
