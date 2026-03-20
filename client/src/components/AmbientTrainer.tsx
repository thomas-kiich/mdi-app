'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface AmbientTrainerProps {
  trainingId: 'metabolic' | 'mayerwelle';
  duration: number; // in minutes
  audioUrl: string;
  onClose: () => void;
}

export function AmbientTrainer({ trainingId, duration, audioUrl, onClose }: AmbientTrainerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = duration * 60;
  const progress = (timeElapsed / totalSeconds) * 100;

  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Toggle playback - simple and direct
  const togglePlayback = async () => {
    if (!audioRef.current) return;

    try {
      if (isPlaying) {
        // Stop playback
        audioRef.current.pause();
        setIsPlaying(false);
        if (timerRef.current) clearInterval(timerRef.current);
      } else {
        // Start playback
        audioRef.current.volume = 1.0;
        await audioRef.current.play();
        setIsPlaying(true);

        // Start timer
        timerRef.current = setInterval(() => {
          setTimeElapsed((prev) => {
            const newTime = prev + 1;
            if (newTime >= totalSeconds) {
              // Training complete
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }
              setIsPlaying(false);
              if (timerRef.current) clearInterval(timerRef.current);
              return totalSeconds;
            }
            return newTime;
          });
        }, 1000);
      }
    } catch (error) {
      console.error('Playback error:', error);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
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
    <>
      {/* Audio Element */}
      <audio
        ref={audioRef}
        loop
        style={{ display: 'none' }}
        onEnded={() => {
          setIsPlaying(false);
          if (timerRef.current) clearInterval(timerRef.current);
        }}
      >
        <source src={audioUrl} type="audio/wav" />
      </audio>

      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
        <Card className="w-full max-w-md bg-zinc-900 border-zinc-800">
          <CardHeader className="relative pb-2">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <CardTitle className="text-2xl font-bold text-white">
              {trainingNames[trainingId]}
            </CardTitle>
            <p className="text-sm text-zinc-400 mt-2">
              {trainingDescriptions[trainingId]}
            </p>
          </CardHeader>

          <CardContent className="space-y-6">
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

            {/* Controls */}
            <div className="flex gap-3">
              <Button
                onClick={() => togglePlayback()}
                className="flex-1 h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold"
              >
                {isPlaying ? (
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
    </>
  );
}
