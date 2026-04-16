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
  audioUrls: Record<number, string>;
  baseTone?: { name: string; frequency: number };
  onClose: () => void;
}

export function AmbientTrainer({ trainingId, duration: initialDuration, audioUrls, baseTone, onClose }: AmbientTrainerProps) {
  const { toast } = useToast();
  const availableDurations = trainingId === 'metabolic' ? [7, 21] : [45];
  const [activeDuration, setActiveDuration] = useState<number>(initialDuration || 0);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [volume, setVolume] = useState(1.0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const totalSeconds = activeDuration * 60;
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

  // Sync volume with play state, exactly like Method36Trainer does for water sound
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.volume = volume;
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
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
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  const trainingNames = {
    metabolic: 'RESONANZ AUS DEM RAUM',
    mayerwelle: 'MAYERWELLE 5,5 / MW'
  };

  const trainingDetails = {
    metabolic: {
      optimaleNutzung: 'Lass die Komposition als Klangraum wirken – im Hintergrund beim Arbeiten, in der Pause oder zur bewussten Einstimmung. Sie ist so komponiert, dass sie deinen inneren Resonanzraum aktiviert.',
      wirkung: 'Die Klangschichten dieser Komposition sprechen direkt das Nervensystem an und unterstützen einen Zustand tiefer Wachheit bei gleichzeitiger Entspannung. Ideal für kreative Arbeit, Reflexion oder als Übergang in eine Meditationsphase.',
      anwendung: 'Wähle eine Zeitdauer / Reguliere die Lautstärke so, dass der Sound angenehm wahrnehmbar ist / Schließe die Augen für einige Atemzüge und lass den Klang in dich einwirken.',
      wichtig: 'Keine Kopfhörer erforderlich – der Raumklang entfaltet seine Wirkung auch über Lautsprecher.'
    },
    mayerwelle: {
      optimaleNutzung: 'Verwende die MW als Hintergrundsound um ein regenerierendes Umfeld zu unterstützen und deinen Atemzyklus auf eine optimale Atemrhythmik einzuschwingen (Detailinfo dazu unter METHODE 36).',
      wirkung: 'Dein Unterbewusstsein beginnt, einen förderlichen Atemrhythmus aufzunehmen und dadurch deinen Stresspegel zu regulieren. Du bleibst entspannter und gleichzeitig erfrischt (Wasserrauschen) während deiner aktiven Tätigkeiten.',
      anwendung: 'Wähle eine Zeitdauer / Reguliere die Lautstärke so, dass der Sound im Hintergrund wahrnehmbar ist / Stimme dich zu Beginn für einige Atemzyklen auf die Gongsignale hinter dem Wasser rauschen ein / erster Gong = EINatmen / zweiter Gong = HALTEN / dritter Gong = AUSatmen.',
      wichtig: 'Versuche stets durch die Nase zu atmen / SOWOHL EIN- WIE AUS !'
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/95 backdrop-blur-xl p-4 overflow-hidden">
      
      {/* Full-Screen Visual Feedback: Pulsating Waves */}
      <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-0" style={{ mixBlendMode: 'screen' }}>
        {isPlaying && (
          <>
            <motion.div
              className="absolute w-[800px] h-[800px] rounded-full blur-[120px]"
              style={{ backgroundColor: waveColors[0] }}
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.2, 0.6, 0.2],
              }}
              transition={{
                duration: 8,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
            <motion.div
              className="absolute w-[600px] h-[600px] rounded-full blur-[100px]"
              style={{ backgroundColor: waveColors[1] }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2
              }}
            />
            <motion.div
              className="absolute w-[400px] h-[400px] rounded-full blur-[80px]"
              style={{ backgroundColor: waveColors[2] }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.4, 0.8, 0.4],
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
        <source src={audioUrls[activeDuration] || ""} />
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
          </div>
        </CardHeader>

        <CardContent className="space-y-6 relative z-10">

          {activeDuration === 0 ? (
            <div className="space-y-6 py-4">
              <div className="text-center mb-6">
                <h3 className="text-xl font-medium text-white mb-2">Dauer auswählen</h3>
                <p className="text-zinc-400 text-sm">Bitte wähle die gewünschte Trainingsdauer</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {availableDurations.map((dur) => (
                  <Button
                    key={dur}
                    variant="outline"
                    className="h-16 text-lg border-zinc-700 hover:border-orange-500 hover:text-orange-500 transition-all"
                    onClick={() => setActiveDuration(dur)}
                  >
                    {dur} Min
                  </Button>
                ))}
              </div>
              {availableDurations.length === 1 && (
                <div className="text-center mt-4">
                  <Button 
                    className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold"
                    onClick={() => setActiveDuration(availableDurations[0])}
                  >
                    Weiter mit {availableDurations[0]} Min
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Timer Display */}
              <div className="text-center space-y-4">
                <div className="text-5xl font-bold text-white font-mono">
                  {formatTime(timeElapsed)}
                </div>
                <p className="text-zinc-400 text-sm">
                  von {activeDuration} Minuten
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

          {/* Detailed Info */}
          <div className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-4 space-y-3 text-left max-h-48 overflow-y-auto custom-scrollbar">
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-orange-400">OPTIMALE NUTZUNG:</strong> {trainingDetails[trainingId].optimaleNutzung}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-orange-400">WIRKUNG:</strong> {trainingDetails[trainingId].wirkung}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-orange-400">ANWENDUNG:</strong> {trainingDetails[trainingId].anwendung}
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">
              <strong className="text-orange-400">WICHTIG:</strong> {trainingDetails[trainingId].wichtig}
            </p>
          </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
