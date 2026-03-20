'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, X, Volume2, VolumeX } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';
import { Slider } from '@/components/ui/slider';
import { TONES } from '@/lib/tones';

interface AmbientTrainerProps {
  trainingId: 'metabolic' | 'mayerwelle';
  duration: number; // in minutes
  audioUrl: string;
  baseTone?: { name: string; frequency: number };
  onClose: () => void;
}

export function AmbientTrainer({ trainingId, duration, audioUrl, baseTone, onClose }: AmbientTrainerProps) {
  const { toast } = useToast();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const [audioLevel, setAudioLevel] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Audio Analyzer Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const sourceNodeRef = useRef<MediaElementAudioSourceNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const totalSeconds = duration * 60;
  const progress = (timeElapsed / totalSeconds) * 100;

  // Get base color from tone, default to orange if not available
  const toneData = baseTone ? TONES.find(t => t.name === baseTone.name) : null;
  const baseColor = toneData ? toneData.color : '#f97316';
  
  // Create variations of the color for the waves (using opacity)
  const waveColors = [
    `${baseColor}33`, // 20% opacity
    `${baseColor}4D`, // 30% opacity
    `${baseColor}66`, // 40% opacity
  ];

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  // We will put the audio element directly in this component to be like Method36Trainer
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // Toggle playback
  const togglePlayback = () => {
    if (isPlaying) {
      // Pause
      setIsPlaying(false);
      if (timerRef.current) clearInterval(timerRef.current);
    } else {
      // Play
      setIsPlaying(true);

      // Start timer
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => {
          const newTime = prev + 1;
          if (newTime >= totalSeconds) {
            // Training complete
            setIsPlaying(false);
            if (timerRef.current) clearInterval(timerRef.current);
            return totalSeconds;
          }
          return newTime;
        });
      }, 1000);
    }
  };

  // Initialize Audio Context and Analyzer
  const initAudioAnalyzer = () => {
    if (!audioRef.current || audioContextRef.current) return;
    
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioContextRef.current = ctx;
      
      const analyzer = ctx.createAnalyser();
      analyzer.fftSize = 256;
      analyzer.smoothingTimeConstant = 0.8;
      analyzerRef.current = analyzer;
      
      const source = ctx.createMediaElementSource(audioRef.current);
      sourceNodeRef.current = source;
      
      source.connect(analyzer);
      analyzer.connect(ctx.destination);
    } catch (err) {
      console.error("Failed to initialize audio analyzer:", err);
    }
  };

  // Update audio level from analyzer
  const updateAudioLevel = () => {
    if (!analyzerRef.current || !isPlaying) return;
    
    const dataArray = new Uint8Array(analyzerRef.current.frequencyBinCount);
    analyzerRef.current.getByteFrequencyData(dataArray);
    
    // Calculate average volume level (0-1)
    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    const normalizedLevel = average / 255;
    
    // Smooth the level a bit for visual stability
    setAudioLevel(prev => {
      const smoothed = prev * 0.7 + normalizedLevel * 0.3;
      return smoothed;
    });
    
    animationFrameRef.current = requestAnimationFrame(updateAudioLevel);
  };

  // Sync volume with play state, exactly like Method36Trainer does for water sound
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // Initialize analyzer on first play
        if (!audioContextRef.current) {
          initAudioAnalyzer();
        } else if (audioContextRef.current.state === 'suspended') {
          audioContextRef.current.resume();
        }

        audioRef.current.volume = volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            // Start visualization loop
            if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
            updateAudioLevel();
          }).catch(error => {
            console.error("Audio playback failed:", error);
            toast({
              title: "Wiedergabe blockiert",
              description: "Bitte interagieren Sie zuerst mit der Seite (z.B. durch einen Klick), bevor das Audio gestartet werden kann.",
            });
            setIsPlaying(false);
          });
        }
      } else {
        audioRef.current.pause();
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        // Decay the audio level slowly when paused
        setAudioLevel(0);
      }
    }
  }, [isPlaying]);

  // Update volume when slider changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Setup and cleanup
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
      
      if (audioRef.current) {
        audioRef.current.pause();
      }
      
      // Cleanup audio context
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, []);

  const trainingNames = {
    metabolic: 'Stoffwechsel-Atmung',
    mayerwelle: 'MAYERWELLE 5.5'
  };

  const trainingDescriptions = {
    metabolic: 'Harmonisierende Hintergrundmusik für optimale Stoffwechselaktivierung',
    mayerwelle: 'Langform-Beschallung für tiefe Entspannung und Raumenergieaktivierung'
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden">
      
      {/* Full-Screen Visual Feedback: Pulsating Waves */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0" style={{ mixBlendMode: 'screen' }}>
        {isPlaying && (
          <>
            <motion.div
              className="absolute w-[800px] h-[800px] rounded-full blur-[120px] transition-all duration-300"
              style={{ 
                backgroundColor: waveColors[0],
                transform: `scale(${1 + audioLevel * 0.5})`,
                opacity: 0.2 + audioLevel * 0.4
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[100px] transition-all duration-200"
              style={{ 
                backgroundColor: waveColors[1],
                transform: `scale(${1 + audioLevel * 0.7})`,
                opacity: 0.3 + audioLevel * 0.5
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[80px] transition-all duration-150"
              style={{ 
                backgroundColor: waveColors[2],
                transform: `scale(${1 + audioLevel * 1.0})`,
                opacity: 0.4 + audioLevel * 0.6
              }}
              animate={{
                scale: [1, 1.3, 1],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 4
              }}
            />
          </>
        )}
      </div>

      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        preload="auto"
        style={{ display: 'none' }}
        onCanPlay={() => setIsReady(true)}
        onPlay={() => console.log('Audio started playing successfully')}
        onError={(e) => console.error('Audio element error:', e)}
      >
        <source src={audioUrl} />
      </audio>

      <Card className="w-full max-w-md bg-zinc-900/80 border-zinc-800 shadow-2xl relative z-10 backdrop-blur-md">
        <CardHeader className="relative pb-2 z-10">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white rounded-full hover:bg-white/10 transition-colors z-20"
          >
            <X size={20} />
          </button>

          <div className="relative z-10">
            <CardTitle className="text-2xl font-bold text-center bg-gradient-to-r from-orange-400 to-amber-600 bg-clip-text text-transparent">
              {trainingNames[trainingId]}
            </CardTitle>
            <p className="text-center text-zinc-400 mt-2 text-sm">
              {trainingDescriptions[trainingId]}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">

          {/* Timer Display */}
          <div className="text-center space-y-4">
            <div className="text-5xl font-bold text-white font-mono">
              {formatTime(timeElapsed)}
            </div>
            <p className="text-zinc-400 text-sm">
              von {duration} Minuten
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-orange-500 to-orange-400"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Volume Control */}
          <div className="flex items-center gap-4 mb-6 bg-black/20 p-4 rounded-xl border border-white/5">
            <button 
              onClick={() => setVolume(v => v === 0 ? 1 : 0)}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}
            </button>
            <Slider
              value={[volume * 100]}
              max={100}
              step={1}
              onValueChange={(val) => setVolume(val[0] / 100)}
              className="flex-1"
            />
            <span className="text-xs text-zinc-500 w-8 text-right">
              {Math.round(volume * 100)}%
            </span>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            <Button
              onClick={(e) => {
                e.stopPropagation();
                togglePlayback();
              }}
              className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold"
            >
              {!isReady && !isPlaying ? (
                <>
                  <Play size={20} className="mr-2" />
                  Starten
                </>
              ) : isPlaying ? (
                <>
                  <Pause size={20} className="mr-2" />
                  Pausieren
                </>
              ) : (
                <>
                  <Play size={20} className="mr-2" />
                  Starten
                </>
              )}
            </Button>
            <Button
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 border-zinc-700 text-zinc-400 hover:text-white"
            >
              Beenden
            </Button>
          </div>

          {/* Info Text */}
          <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-4">
            <p className="text-xs text-zinc-400">
              💡 Für beste Ergebnisse: Finde einen ruhigen Ort, entspanne dich und höre die Musik mit angenehmer Lautstärke.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
