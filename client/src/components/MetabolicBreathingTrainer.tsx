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

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Get audio URL based on selected module
    const getAudioUrl = () => {
        const urls: Record<'7min' | '21min' | '21min-loop', string> = {
            '7min': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/M36-platonischesJAHR-07min_1a759185.wav',
            '21min': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/M36-platonischesJAHR-21min_0665d0c7.wav',
            '21min-loop': 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/M36-platonischesJAHR-21min_0665d0c7.wav'
        };
        return urls[audioModule];
    };

    const startTraining = () => {
        setIsPlaying(true);
        setCycleCount(0);
        setPhase('OUT');
        
        // Play the selected music module
        if (audioRef.current) {
            audioRef.current.src = getAudioUrl();
            audioRef.current.loop = audioModule === '21min-loop';
            audioRef.current.volume = isMuted ? 0 : 0.7;
            audioRef.current.play().catch(err => console.error('Audio playback error:', err));
        }
        
        // Breathing animation loop (visual only, no sound)
        const CYCLE_DURATION = 6 * BEAT_DURATION * 1000;
        const IN_DURATION = 2 * BEAT_DURATION * 1000;
        let cycleStart = Date.now();
        let lastPhase: Phase = 'IN';
        
        const loop = () => {
            const now = Date.now();
            const elapsed = now - cycleStart;
            const cycleTime = elapsed % CYCLE_DURATION;
            
            let currentPhase: Phase = 'OUT';
            if (cycleTime < IN_DURATION) {
                currentPhase = 'IN';
            } else {
                currentPhase = 'OUT';
            }

            if (currentPhase !== lastPhase) {
                setPhase(currentPhase);
                if (currentPhase === 'IN') {
                    setCycleCount(c => c + 1);
                }
                lastPhase = currentPhase;
            }
            
            requestRef.current = requestAnimationFrame(loop);
        };
        
        cycleStart = Date.now();
        setPhase('IN');
        
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        requestRef.current = requestAnimationFrame(loop);
    };

    const stopTraining = () => {
        setIsPlaying(false);
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        setPhase('OUT');
    };

    const toggleMute = () => {
        const newMutedState = !isMuted;
        setIsMuted(newMutedState);
        if (audioRef.current) {
            audioRef.current.volume = newMutedState ? 0 : 0.7;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-500">
            {/* Hidden audio element for music playback */}
            <audio ref={audioRef} crossOrigin="anonymous" />
            
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
