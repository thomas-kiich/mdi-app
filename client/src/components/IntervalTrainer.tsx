import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Play, Pause, X, Music2, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { saveTrainingSession } from "@/lib/training";
import frequencyData from "@/lib/frequencyData.json";
import { useSoundGenerator } from "@/hooks/useSoundGenerator";

// 12 Grundtypen (ungerade 1-23)
const BASIC_TYPES = (frequencyData as Array<{
  id: number; hex: string; colorName: string; metaphor: string;
  description: string; talent: string; frequency: number; tone: string; nutzung: string[];
}>).filter(item => item.id % 2 !== 0 && item.id <= 23);

// MDI-Intervalle
const MDI_INTERVALS = [
  {
    id: "quarte-down",
    name: "Reine Quarte ↓",
    label: "WURZELKLANG",
    ratio: 3 / 4,
    direction: "down" as const,
    color: "text-amber-400",
    borderColor: "border-amber-500/40",
    bgColor: "bg-amber-500/10",
    description: "Gleite nach unten zum Wurzelklang. Verankert und erdet die tiefsten Schichten deines Systems.",
    bodyTarget: "12%", // Unterhalb Grundton (Wurzel/Erde)
  },
  {
    id: "quinte-up",
    name: "Reine Quinte ↑",
    label: "HERZKLANG",
    ratio: 3 / 2,
    direction: "up" as const,
    color: "text-rose-400",
    borderColor: "border-rose-500/40",
    bgColor: "bg-rose-500/10",
    description: "Gleite nach oben zum Herzklang. Verbindet Willenskraft mit Herzöffnung und Verbundenheit.",
    bodyTarget: "65%", // Herz
  },
  {
    id: "oktave-up",
    name: "Oktave ↑",
    label: "ZIRBELDRÜSENAKTIVIERUNG",
    ratio: 2.0,
    direction: "up" as const,
    color: "text-violet-400",
    borderColor: "border-violet-500/40",
    bgColor: "bg-violet-500/10",
    description: "Gleite zur Oktave. Aktiviert Transformation und Bewusstseinserweiterung – Zirbeldrüse.",
    bodyTarget: "85%", // Kopf
  },
];

interface IntervalTrainerProps {
  baseTone?: { name: string; frequency: number; color: string };
  onClose: () => void;
}

export function IntervalTrainer({ baseTone, onClose }: IntervalTrainerProps) {
  // Schritt 1: Lichtfarbe wählen (wenn kein baseTone übergeben)
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(
    baseTone ? -1 : null // -1 = extern übergeben
  );
  const [selectedInterval, setSelectedInterval] = useState(MDI_INTERVALS[0]);
  const [duration, setDuration] = useState<number[]>([10]);
  const [octaveShift, setOctaveShift] = useState(0);
  const [phase, setPhase] = useState<'idle' | 'preview' | 'pre-hold' | 'glissando' | 'sustain'>('idle');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const { playTone, stopAllSounds } = useSoundGenerator();
  const { startRecording, stopRecording, result, isRecording } = useAudioAnalyzer();

  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const animationFrameRef = useRef<number | undefined>(undefined);
  const startTimeRef = useRef<number>(0);
  const sessionStartRef = useRef<number>(Date.now());
  const completedIntervalsRef = useRef<number>(0);

  // Aktiver Grundton: extern übergeben oder aus Lichtfarben-Auswahl
  const activeType = selectedTypeId === -1
    ? null
    : BASIC_TYPES.find(t => t.id === selectedTypeId) ?? null;

  const activeTone = baseTone ?? (activeType ? {
    name: activeType.tone,
    frequency: activeType.frequency,
    color: activeType.hex,
  } : null);

  const isReady = activeTone !== null;

  useEffect(() => {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtxRef.current = new AudioContextClass();
    return () => {
      stopSound();
      audioCtxRef.current?.close();
      if (completedIntervalsRef.current > 0 && activeTone) {
        const durationMinutes = Math.max(1, Math.round((Date.now() - sessionStartRef.current) / 60000));
        saveTrainingSession({
          type: 'interval',
          duration: durationMinutes,
          tone: activeTone.name,
          frequency: activeTone.frequency,
          notes: `Intervall-Training: ${completedIntervalsRef.current} Durchgänge`,
        });
      }
    };
  }, []);

  useEffect(() => {
    if (!isPlaying && isRecording) stopRecording();
  }, [isPlaying, isRecording, stopRecording]);

  const startSequence = async () => {
    if (!audioCtxRef.current || !activeTone) return;
    if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

    stopSound();
    startRecording();

    const ctx = audioCtxRef.current;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    const multiplier = Math.pow(2, octaveShift);
    const startFreq = activeTone.frequency * multiplier;
    const endFreq = activeTone.frequency * selectedInterval.ratio * multiplier;

    const previewDur = 1.5;  // Zielton-Vorschau
    const preHoldDur = 3.0;  // Einschwingen Grundton
    const glissandoDur = duration[0];
    const sustainDur = 3.0;
    const totalDuration = previewDur + preHoldDur + glissandoDur + sustainDur;

    // --- Zielton-Vorschau: kurz den Zielton anspielen ---
    const previewOsc = ctx.createOscillator();
    const previewGain = ctx.createGain();
    previewOsc.type = 'sine';
    previewOsc.frequency.setValueAtTime(endFreq, ctx.currentTime);
    previewGain.gain.setValueAtTime(0, ctx.currentTime);
    previewGain.gain.linearRampToValueAtTime(0.25, ctx.currentTime + 0.2);
    previewGain.gain.setValueAtTime(0.25, ctx.currentTime + previewDur - 0.3);
    previewGain.gain.linearRampToValueAtTime(0, ctx.currentTime + previewDur);
    previewOsc.connect(previewGain);
    previewGain.connect(ctx.destination);
    previewOsc.start(ctx.currentTime);
    previewOsc.stop(ctx.currentTime + previewDur);

    osc.type = 'sine';
    // Einschwingen: Grundton halten (nach Vorschau)
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime + previewDur);
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime + previewDur + preHoldDur);

    // Glissando: gleichmäßige logarithmische Interpolation (perceptuell linear)
    const steps = Math.ceil(glissandoDur * 20); // alle 50ms ein Schritt
    const logStart = Math.log(startFreq);
    const logEnd = Math.log(endFreq);
    const glissStart = ctx.currentTime + previewDur + preHoldDur;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const freq = Math.exp(logStart + (logEnd - logStart) * t);
      osc.frequency.setValueAtTime(freq, glissStart + (glissandoDur * i / steps));
    }

    // Zielton halten
    osc.frequency.setValueAtTime(endFreq, glissStart + glissandoDur);

    // Hauptoszillator: startet nach Vorschau
    gain.gain.setValueAtTime(0, ctx.currentTime + previewDur);
    gain.gain.linearRampToValueAtTime(0.3, ctx.currentTime + previewDur + 1);
    gain.gain.setValueAtTime(0.3, ctx.currentTime + totalDuration - 1);
    gain.gain.linearRampToValueAtTime(0, ctx.currentTime + totalDuration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(ctx.currentTime + previewDur);
    osc.stop(ctx.currentTime + totalDuration);

    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
    setIsPlaying(true);
    startTimeRef.current = Date.now();

    const animate = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000;
      if (elapsed < previewDur) {
        setPhase('preview');
        setProgress((elapsed / previewDur) * 100);
      } else if (elapsed < previewDur + preHoldDur) {
        setPhase('pre-hold');
        setProgress(((elapsed - previewDur) / preHoldDur) * 100);
      } else if (elapsed < previewDur + preHoldDur + glissandoDur) {
        setPhase('glissando');
        setProgress(((elapsed - previewDur - preHoldDur) / glissandoDur) * 100);
      } else if (elapsed < totalDuration) {
        setPhase('sustain');
        setProgress(((elapsed - previewDur - preHoldDur - glissandoDur) / sustainDur) * 100);
      } else {
        setPhase('idle');
        setIsPlaying(false);
        stopRecording();
        setProgress(0);
        completedIntervalsRef.current += 1;
        return;
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animationFrameRef.current = requestAnimationFrame(animate);
  };

  const stopSound = () => {
    if (oscillatorRef.current) {
      try { oscillatorRef.current.stop(); oscillatorRef.current.disconnect(); } catch (e) {}
      oscillatorRef.current = null;
    }
    gainNodeRef.current?.disconnect();
    gainNodeRef.current = null;
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setIsPlaying(false);
    setPhase('idle');
    setProgress(0);
    stopRecording();
  };

  const togglePlay = () => isPlaying ? stopSound() : startSequence();

  // Intonation Check
  const getIntonationStatus = () => {
    if (!result || !isPlaying || !activeTone) return null;
    const multiplier = Math.pow(2, octaveShift);
    let targetFreq = 0;
    if (phase === 'pre-hold') targetFreq = activeTone.frequency * multiplier;
    else if (phase === 'sustain') targetFreq = activeTone.frequency * selectedInterval.ratio * multiplier;
    else return null;
    const deviation = Math.abs(result.fundamentalFreq - targetFreq);
    const tolerance = targetFreq * 0.05;
    if (deviation < tolerance) return 'match';
    if (result.fundamentalFreq < targetFreq) return 'low';
    return 'high';
  };

  const intonation = getIntonationStatus();

  // Zielton-Beschriftung
  const getTargetLabel = () => {
    if (!activeTone) return '';
    const multiplier = Math.pow(2, octaveShift);
    const endHz = Math.round(activeTone.frequency * selectedInterval.ratio * multiplier);
    return `${selectedInterval.label} – ${endHz} Hz`;
  };

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-zinc-900 border-zinc-800 text-white shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]">

        {/* Navigation Header */}
        <div className="absolute top-4 left-4 z-20">
          <Button variant="ghost" size="sm" onClick={onClose}
            className="text-zinc-400 hover:text-white p-0 hover:bg-transparent">
            <ArrowLeft className="mr-1 h-5 w-5" />
            ZUR HAUPTSEITE
          </Button>
        </div>
        <button onClick={onClose} className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors z-10">
          <X size={24} />
        </button>

        {/* Background Gradient */}
        <div
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            background: `radial-gradient(circle at 50% 50%, ${activeTone?.color ?? '#888'}, transparent 70%)`,
            transform: `scale(${1 + (progress / 100) * 0.5})`,
            transition: 'transform 0.1s linear',
          }}
        />

        <CardHeader className="relative z-10 text-center pb-2 shrink-0 pt-12">
          <div className="mx-auto w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-2"
            style={{ color: activeTone?.color ?? '#888' }}>
            <Music2 size={20} />
          </div>
          <CardTitle className="text-xl font-bold text-white">Intervall-Trainer</CardTitle>
          <CardDescription className="text-zinc-400 text-xs">
            {isReady
              ? <>Grundton: <span style={{ color: activeTone!.color }} className="font-bold">{activeTone!.name} ({Math.round(activeTone!.frequency)} Hz)</span></>
              : "Wähle zuerst deine Lichtfarbe (Grundton)"}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 relative z-10 overflow-y-auto pb-6">

          {/* SCHRITT 1: Lichtfarben-Auswahl (nur wenn kein externer baseTone) */}
          {!baseTone && (
            <div className="space-y-3 bg-zinc-900/60 rounded-xl p-4 border border-zinc-700">
              <p className="text-xs font-bold text-zinc-400 tracking-widest">LICHTFARBE WÄHLEN (GRUNDTON)</p>
              <div className="grid grid-cols-6 gap-3">
                {BASIC_TYPES.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => { setSelectedTypeId(item.id); playTone(item.frequency * Math.pow(2, octaveShift)); }}
                    onMouseEnter={() => playTone(item.frequency * Math.pow(2, octaveShift))}
                    onMouseLeave={() => stopAllSounds()}
                    className={`aspect-square rounded-full transition-all ${
                      selectedTypeId === item.id
                        ? 'ring-4 ring-white ring-offset-2 ring-offset-zinc-900 scale-110'
                        : 'hover:ring-2 hover:ring-white/50 hover:ring-offset-1 hover:ring-offset-zinc-900'
                    }`}
                    style={{ backgroundColor: item.hex }}
                    title={`${item.colorName} – ${item.tone} (${Math.round(item.frequency)} Hz)`}
                  />
                ))}
              </div>
              {activeType && (
                <div className="text-center pt-1">
                  <span className="text-sm font-bold" style={{ color: activeType.hex }}>{activeType.metaphor}</span>
                  <span className="text-zinc-500 text-xs ml-2">{activeType.tone} · {Math.round(activeType.frequency)} Hz</span>
                </div>
              )}
            </div>
          )}

          {/* SCHRITT 2: Stimmebene wählen */}
          <div className="space-y-2 bg-zinc-900/60 rounded-xl p-4 border border-zinc-700">
            <p className="text-xs font-bold text-zinc-400 tracking-widest">STIMMEBENE</p>
            <div className="flex gap-2">
              {([[-1, 'Männlich', '♂'], [0, 'Normal', '◎'], [1, 'Weiblich', '♀']] as [number, string, string][]).map(([shift, label, icon]) => (
                <button
                  key={shift}
                  onClick={() => setOctaveShift(shift)}
                  disabled={isPlaying}
                  className={`flex-1 py-2 px-3 rounded-lg border text-sm font-semibold transition-all flex items-center justify-center gap-1 ${
                    octaveShift === shift
                      ? 'bg-orange-500/20 border-orange-500/60 text-orange-400'
                      : 'bg-zinc-900/50 border-zinc-700 text-zinc-400 hover:border-zinc-500'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span>{icon}</span>
                  <span>{label}</span>
                </button>
              ))}
            </div>
            {activeTone && (
              <p className="text-[10px] text-zinc-500 text-center">
                Grundton: {Math.round(activeTone.frequency * Math.pow(2, octaveShift))} Hz
                {octaveShift === -1 ? ' (eine Oktave tiefer)' : octaveShift === 1 ? ' (eine Oktave höher)' : ''}
              </p>
            )}
          </div>

          {/* SCHRITT 3: Intervall-Auswahl */}
          <div className="grid grid-cols-1 gap-2">
            <p className="text-xs font-bold text-zinc-400 tracking-widest">INTERVALL WÄHLEN</p>
            {MDI_INTERVALS.map((interval) => {
              const multiplier = Math.pow(2, octaveShift);
              const startHz = activeTone ? Math.round(activeTone.frequency * multiplier) : '–';
              const endHz = activeTone ? Math.round(activeTone.frequency * interval.ratio * multiplier) : '–';
              return (
                <button
                  key={interval.id}
                  onClick={() => !isPlaying && setSelectedInterval(interval)}
                  disabled={isPlaying}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    selectedInterval.id === interval.id
                      ? `${interval.bgColor} ${interval.borderColor} ring-1 ring-white/10`
                      : 'bg-zinc-900/50 border-zinc-800 hover:border-zinc-700 opacity-70'
                  } ${isPlaying ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <div>
                      <span className={`font-semibold text-sm ${interval.color}`}>{interval.label}</span>
                      <span className="text-zinc-500 text-xs ml-2">{interval.name}</span>
                    </div>
                    <span className="text-xs font-mono text-zinc-500">{startHz} → {endHz} Hz</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 leading-relaxed">{interval.description}</p>
                </button>
              );
            })}
          </div>

          {/* Glissando-Visualisierung (nur wenn bereit) */}
          {isReady && (
            <>
              <div className="relative h-44 w-full bg-zinc-950/50 rounded-xl border border-zinc-800 flex items-center justify-center overflow-hidden">
                <svg viewBox="0 0 100 200" className="h-full opacity-30">
                  <path d="M50 10 C 60 10 70 20 70 35 C 70 50 85 55 90 70 C 95 100 80 140 80 190 L 20 190 C 20 140 5 100 10 70 C 15 55 30 50 30 35 C 30 20 40 10 50 10" fill="currentColor" />
                </svg>

                {/* Grundton-Punkt */}
                <motion.div
                  className="absolute w-5 h-5 rounded-full border-2"
                  style={{
                    bottom: '32%',
                    backgroundColor: activeTone!.color,
                    borderColor: activeTone!.color,
                    boxShadow: phase === 'pre-hold' || phase === 'glissando' ? `0 0 20px ${activeTone!.color}` : `0 0 10px ${activeTone!.color}`,
                  }}
                  animate={{ scale: phase === 'pre-hold' ? [1, 1.5, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Zielton-Punkt */}
                <motion.div
                  className="absolute w-4 h-4 rounded-full"
                  style={{
                    bottom: selectedInterval.bodyTarget,
                    backgroundColor: selectedInterval.id === 'quarte-down' ? '#f59e0b' :
                      selectedInterval.id === 'quinte-up' ? '#f43f5e' : '#8b5cf6',
                    opacity: phase === 'sustain' || phase === 'glissando' ? 1 : 0.3,
                    boxShadow: phase === 'sustain' ? `0 0 25px currentColor` : 'none',
                  }}
                  animate={{ scale: phase === 'sustain' ? [1, 1.3, 1] : 1 }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Verbindungslinie */}
                {phase === 'glissando' && (
                  selectedInterval.direction === 'down' ? (
                    // Wurzelklang: Linie nach unten (von Grundton zu 12%)
                    <motion.div
                      className="absolute w-0.5 bg-amber-400/40"
                      style={{ bottom: '32%', height: '0%', transformOrigin: 'top' }}
                      animate={{ height: '20%', bottom: '12%' }}
                      transition={{ duration: duration[0], ease: "linear" }}
                    />
                  ) : (
                    // Herzklang / Zirbeldrüse: Linie nach oben
                    <motion.div
                      className="absolute w-0.5 bg-white/40"
                      style={{ bottom: '37%', height: '0%' }}
                      animate={{ height: selectedInterval.id === 'oktave-up' ? '48%' : '28%' }}
                      transition={{ duration: duration[0], ease: "linear" }}
                    />
                  )
                )}

                {/* Status-Text */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <AnimatePresence mode="wait">
                  {phase === 'preview' && (
                    <motion.div key="preview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className={`bg-black/60 px-4 py-2 rounded-full border font-bold text-sm ${selectedInterval.borderColor} ${selectedInterval.color}`}>
                      Zielton: {selectedInterval.label}
                    </motion.div>
                  )}
                  {phase === 'pre-hold' && (
                    <motion.div key="pre" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                      className="bg-black/60 px-4 py-2 rounded-full border border-zinc-700 text-orange-400 font-bold text-sm">
                      Einschwingen...
                    </motion.div>
                  )}
                    {phase === 'glissando' && (
                      <motion.div key="gli" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className="bg-black/60 px-4 py-2 rounded-full border border-zinc-700 text-white font-bold text-sm">
                        Gleiten {selectedInterval.direction === 'down' ? '↓' : '↑'}
                      </motion.div>
                    )}
                    {phase === 'sustain' && (
                      <motion.div key="sus" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                        className={`bg-black/60 px-4 py-2 rounded-full border font-bold text-sm ${selectedInterval.borderColor} ${selectedInterval.color}`}>
                        {selectedInterval.label} – Halten
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Intonation-Feedback */}
                {intonation && (
                  <div className="absolute top-3 left-0 right-0 flex justify-center pointer-events-none">
                    <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                      intonation === 'match' ? 'bg-green-500/20 border-green-500 text-green-400' :
                      'bg-red-500/20 border-red-500 text-red-400'
                    }`}>
                      {intonation === 'match' ? 'Perfekte Resonanz' : intonation === 'low' ? 'Zu tief ↑' : 'Zu hoch ↓'}
                    </div>
                  </div>
                )}
              </div>

              {/* Fortschrittsbalken */}
              <div className="relative w-full h-7 bg-zinc-800 rounded-lg overflow-hidden border border-zinc-700">
                <motion.div
                  className={`absolute left-0 top-0 bottom-0 ${
                    phase === 'preview' ? `${selectedInterval.bgColor}` :
                    phase === 'pre-hold' ? 'bg-orange-500/50' :
                    phase === 'glissando' ? 'bg-white/30' :
                    phase === 'sustain' ? `${selectedInterval.bgColor}` : 'bg-transparent'
                  }`}
                  style={{ width: `${progress}%` }}
                />
                <div className="relative z-10 flex w-full justify-between px-3 h-full items-center text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                  <span className={phase === 'preview' ? 'text-white' : ''}>Zielton</span>
                  <span className={phase === 'pre-hold' ? 'text-white' : ''}>Einschwingen</span>
                  <span className={phase === 'glissando' ? 'text-white' : ''}>Gleiten</span>
                  <span className={phase === 'sustain' ? 'text-white' : ''}>Halten</span>
                </div>
              </div>

              {/* Steuerung: Play + Oktave */}
              <div className="flex items-center justify-between gap-4 px-1">
                <Button
                  size="lg"
                  onClick={togglePlay}
                  className={`w-14 h-14 rounded-full flex-shrink-0 flex items-center justify-center transition-all shadow-lg ${
                    isPlaying
                      ? 'bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700'
                      : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105'
                  }`}
                >
                  {isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                </Button>

              </div>

              {/* Tempo-Slider */}
              <div className="space-y-2 pt-2 border-t border-zinc-800">
                <div className="flex justify-between text-xs">
                  <span className="text-zinc-400">Glissando-Tempo</span>
                  <span className="text-white font-mono">{duration[0]} Sek.</span>
                </div>
                <Slider
                  value={duration}
                  onValueChange={setDuration}
                  min={3} max={30} step={1}
                  disabled={isPlaying}
                  className="cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-600">
                  <span>Schnell (3s)</span>
                  <span>Langsam (30s)</span>
                </div>
              </div>
            </>
          )}

          {/* Hinweis wenn noch keine Farbe gewählt */}
          {!isReady && (
            <p className="text-center text-zinc-500 text-sm py-4">
              Wähle eine Lichtfarbe um das Training zu starten
            </p>
          )}

        </CardContent>
      </Card>
    </div>
  );
}
