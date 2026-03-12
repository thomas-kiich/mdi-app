import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Heart, Play, Square, Volume2, VolumeX, ArrowUpCircle, ArrowDownCircle, Clock, Waves, History } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// import { WaterSound } from "@/lib/WaterSound"; // Deprecated in favor of user WAV

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

interface SessionLog {
    date: string;
    duration: number;
    toneName: string;
}

export function Method36Trainer({ frequency, toneName, color, duration, onClose }: Method36TrainerProps) {
    const { toast } = useToast();
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentBeat, setCurrentBeat] = useState(0); // 1 to 6
    const [phase, setPhase] = useState<Phase>('HOLD_EMPTY');
    const [cycleCount, setCycleCount] = useState(0);
    const [isHighOctave, setIsHighOctave] = useState(false); // Default to Low Octave (Base Frequency)
    const [timeLeft, setTimeLeft] = useState<number | null>(duration ? duration * 60 : null);
    const [showLog, setShowLog] = useState(false);
    const [sessionLogs, setSessionLogs] = useState<SessionLog[]>([]);
    const [isStreamSoundEnabled, setIsStreamSoundEnabled] = useState(true);
    const [showCongrats, setShowCongrats] = useState(false); // New state for congratulation screen
    
    const audioCtxRef = useRef<AudioContext | null>(null);
    const masterGainRef = useRef<GainNode | null>(null);
    const toneOscillatorsRef = useRef<OscillatorNode[]>([]);
    const toneGainRef = useRef<GainNode | null>(null);
    const filterRef = useRef<BiquadFilterNode | null>(null);
    // Define a simple interface for our water sound wrapper
    interface WaterSoundWrapper {
        start: () => void;
        stop: () => void;
        setVolume: (vol: number) => void;
    }
    const waterSoundRef = useRef<WaterSoundWrapper | null>(null);
    
    const startTimeRef = useRef<number>(0);
    const requestRef = useRef<number>(0);
    const lastBeatRef = useRef<number>(0); // Track last processed beat to prevent double counting
    const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

    // Calculate total cycles if duration is set
    // 1 cycle = 6 beats * 1.666s = 10 seconds
    const totalCycles = duration ? duration * 6 : null;

    // Load logs from localStorage
    useEffect(() => {
        const storedLogs = localStorage.getItem('method36_logs');
        if (storedLogs) {
            setSessionLogs(JSON.parse(storedLogs));
        }
    }, []);

    // Save log when session completes
    const saveSessionLog = () => {
        if (!duration) return;
        
        const newLog: SessionLog = {
            date: new Date().toISOString(),
            duration: duration,
            toneName: toneName
        };
        
        const updatedLogs = [newLog, ...sessionLogs].slice(0, 50); // Keep last 50 logs
        setSessionLogs(updatedLogs);
        localStorage.setItem('method36_logs', JSON.stringify(updatedLogs));
        
        toast({
            title: "Training abgeschlossen",
            description: `${duration} Min. Session im Logbuch gespeichert.`,
        });
    };

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

            // Initialize Water Sound based on duration
            let soundUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/user_water_sound_eac86237.wav'; // Default fallback
            
            // Select specific file based on duration (7, 12, or 21)
            if (duration === 7) {
                soundUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/training_07min_2729a1ac.wav';
            } else if (duration === 12) {
                soundUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/training_12min_5fc2d93b.wav';
            } else if (duration === 21) {
                soundUrl = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/training_21min_37862f3d.wav';
            }

            const audio = new Audio(soundUrl);
            audio.loop = true; // Loop just in case, though files should be length-matched
            audio.crossOrigin = "anonymous";
            
            const waterSoundWrapper = {
                start: () => {
                    audio.play().catch(e => console.error("Water sound play failed", e));
                },
                stop: () => {
                    // Fade out logic for stop
                    const fadeOut = setInterval(() => {
                        if (audio.volume > 0.05) {
                            audio.volume -= 0.05;
                        } else {
                            audio.pause();
                            audio.currentTime = 0;
                            clearInterval(fadeOut);
                        }
                    }, 100);
                },
                setVolume: (vol: number) => {
                    // Only set volume if not fading out/in (simplified)
                    audio.volume = vol;
                    if (vol > 0 && audio.paused) audio.play().catch(e => console.error("Water sound play failed", e));
                    if (vol === 0 && !audio.paused) audio.pause();
                }
            };

            // @ts-ignore
            waterSoundRef.current = waterSoundWrapper;
            
            // Set initial volume
            waterSoundWrapper.setVolume(isStreamSoundEnabled && isPlaying ? 0.5 : 0);

        return () => {
            stopTone();
            if (waterSoundRef.current) {
                waterSoundRef.current.stop();
            }
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            ctx.close();
        };
    }, []);

    const toggleStreamSound = () => {
        const newState = !isStreamSoundEnabled;
        setIsStreamSoundEnabled(newState);
        if (waterSoundRef.current) {
            waterSoundRef.current.setVolume(newState && isPlaying ? 0.15 : 0);
        }
    };

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
        // INCREASED TONE VOLUME (from 0.6 to 0.75 to cut through water sound)
        toneGain.gain.linearRampToValueAtTime(0.75, ctx.currentTime + 0.5); 
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

            // Start Stream Sound if enabled
            if (isStreamSoundEnabled && waterSoundRef.current) {
                waterSoundRef.current.setVolume(0.5); // Increased volume for better ambience
            }

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
                            saveSessionLog(); 
                            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
                            
                            // Show Congratulation Screen
                            setShowCongrats(true);

                            // Fade out water sound
                            if (waterSoundRef.current) {
                                waterSoundRef.current.stop(); // Uses our new fade-out logic
                            }
                            
                            // Play Outro Voice
                            setTimeout(() => {
                                const audio = new Audio('https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/outro_congrats_535f6028.wav');
                                audio.play().catch(e => console.error("Audio play failed", e));
                            }, 2000); 

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
            
            // Stop Stream Sound
            if (waterSoundRef.current) {
                waterSoundRef.current.setVolume(0);
            }

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

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit'
        });
    };

    return (
        <div className="fixed inset-0 z-[60] flex flex-col items-center justify-center bg-black/95 text-white font-sans backdrop-blur-xl">
            
            {/* Congratulation Overlay */}
            {showCongrats && (
                <div className="absolute inset-0 z-[70] flex flex-col items-center justify-center bg-black/90 animate-in fade-in duration-1000">
                    <div className="text-center space-y-8 p-8 max-w-2xl">
                        <motion.div 
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 1, delay: 0.2 }}
                            className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-[0_0_50px_rgba(255,100,0,0.3)]"
                        >
                            <Heart className="w-16 h-16 text-white fill-white animate-pulse" />
                        </motion.div>
                        
                        <div className="space-y-4">
                            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
                                Gratuliere!
                            </h2>
                            <p className="text-xl text-zinc-300 leading-relaxed">
                                Super trainiert – bis bald.
                            </p>
                        </div>

                        <div className="flex flex-col gap-4 mt-8">
                            <Button 
                                size="lg" 
                                className="bg-white text-black hover:bg-zinc-200 rounded-full px-8 py-6 text-lg w-full"
                                onClick={onClose}
                            >
                                Zurück zur Übersicht
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
                <div className="flex items-center gap-3">
                    <Heart className="text-red-500 animate-pulse" />
                    <h2 className="text-xl font-bold tracking-widest hidden md:block">METHODE 36 TRAINER</h2>
                </div>
                <div className="flex gap-4 items-center">
                    {/* Logbook Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowLog(!showLog)}
                        className={`rounded-full ${showLog ? 'bg-white/20' : 'hover:bg-white/10'}`}
                        title="Session Logbuch"
                    >
                        <History className="h-5 w-5" />
                    </Button>

                    {/* Stream Sound Toggle */}
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={toggleStreamSound}
                        className={`rounded-full ${isStreamSoundEnabled ? 'text-blue-400' : 'text-zinc-600'}`}
                        title="Hintergrundgeräusch (Bach)"
                    >
                        {isStreamSoundEnabled ? <Waves className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                    </Button>

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

            {/* Logbook Overlay */}
            {showLog && (
                <div className="absolute top-20 right-6 w-80 bg-zinc-900/95 border border-white/10 rounded-xl p-4 z-50 shadow-2xl backdrop-blur-md max-h-[60vh] overflow-y-auto">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <History className="h-4 w-4 text-orange-400" /> Meine Trainings
                    </h3>
                    {sessionLogs.length === 0 ? (
                        <p className="text-zinc-500 text-sm">Noch keine Trainings aufgezeichnet.</p>
                    ) : (
                        <div className="space-y-2">
                            {sessionLogs.map((log, i) => (
                                <div key={i} className="flex justify-between items-center text-sm p-2 bg-white/5 rounded hover:bg-white/10 transition-colors">
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white">{log.toneName}</span>
                                        <span className="text-zinc-500 text-xs">{formatDate(log.date)}</span>
                                    </div>
                                    <div className="text-orange-400 font-mono font-bold">
                                        {log.duration} min
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

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
                    <span className="text-xs text-zinc-500 pl-3 font-mono uppercase">Stimme</span>
                    <div className="flex gap-1">
                        <Button 
                            size="sm" 
                            variant={!isHighOctave ? "default" : "ghost"}
                            onClick={() => setIsHighOctave(false)}
                            className={!isHighOctave ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-400 hover:text-white"}
                        >
                            <ArrowDownCircle className="mr-2 h-4 w-4" /> Männlich
                        </Button>
                        <Button 
                            size="sm" 
                            variant={isHighOctave ? "default" : "ghost"}
                            onClick={() => setIsHighOctave(true)}
                            className={isHighOctave ? "bg-white text-black hover:bg-zinc-200" : "text-zinc-400 hover:text-white"}
                        >
                            <ArrowUpCircle className="mr-2 h-4 w-4" /> Weiblich
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
