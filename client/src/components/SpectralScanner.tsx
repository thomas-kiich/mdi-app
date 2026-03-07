import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff, Camera, Box, Play, Square, Sparkles, Heart } from "lucide-react";
import { getToneFromFrequency } from "@/lib/tones";
import { getMdiTypeFromFrequency } from "@/lib/mdi";
import { useLocation } from 'wouter';
import { Method36Trainer } from "@/components/Method36Trainer";
import frequencyDataRaw from "@/lib/frequencyData.json";

// Define FrequencyDataItem locally to avoid import issues
interface FrequencyDataItem {
  id: number;
  frequency: number;
  colorName: string;
  hex: string;
  lightRange: string;
  toneRange: string;
  description: string;
  talent: string;
}

const frequencyData = frequencyDataRaw as unknown as FrequencyDataItem[];

interface SpectralScannerProps {
    onClose: () => void;
    forcedFrequency?: number;
}

export function SpectralScanner({ onClose, forcedFrequency }: SpectralScannerProps) {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [, setLocation] = useLocation();
  
  // Audio Synthesis
  const synthContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  // Settings
  const sensitivityRef = useRef(5.0); 

  // Interaction State
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, freq: number, tone: string, note: string, color: string } | null>(null);
  const [trainingMode, setTrainingMode] = useState<{ freq: number, tone: string, color: string } | null>(null);
  const [currentFreq, setCurrentFreq] = useState<number>(0);

  // --- AUDIO SYNTHESIS HELPERS ---
  const playHarmonicTone = (frequency: number) => {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!synthContextRef.current) {
          synthContextRef.current = new AudioContextClass();
      }
      const ctx = synthContextRef.current;
      if (!ctx) return;
      if (ctx.state === 'suspended') ctx.resume();

      stopHarmonicTone();
      setIsPlayingTone(true);

      const now = ctx.currentTime;
      const duration = 12;
      const attack = 2;

      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.3, now + attack);
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);
      activeGainNodesRef.current.push(masterGain);

      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = frequency;
      osc1.connect(masterGain);
      osc1.start(now);
      osc1.stop(now + duration);
      activeOscillatorsRef.current.push(osc1);

      setTimeout(() => setIsPlayingTone(false), duration * 1000);
  };

  const stopHarmonicTone = () => {
      activeOscillatorsRef.current.forEach(osc => { try { osc.stop(); } catch(e){} });
      activeOscillatorsRef.current = [];
      activeGainNodesRef.current.forEach(gain => { try { gain.disconnect(); } catch(e){} });
      activeGainNodesRef.current = [];
      setIsPlayingTone(false);
  };

  // --- AUDIO INPUT SETUP ---
  const startAudio = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096; // High resolution
      analyser.smoothingTimeConstant = 0.8;
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      if (audioCtx.state === 'suspended') await audioCtx.resume();
      
      setIsListening(true);
      isListeningRef.current = true;
      
      requestAnimationFrame(startVisualization);
      
    } catch (err) {
      console.error("Error accessing microphone:", err);
      setIsListening(false);
    }
  };

  const stopAudio = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    setIsListening(false);
    isListeningRef.current = false;
    stopHarmonicTone();
  };

  const toggleAudio = () => {
    if (isListening) stopAudio();
    else startAudio();
  };

  const takeSnapshot = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement('a');
      link.download = `MDI-Scanner-${new Date().toISOString()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  const handleStartTraining = () => {
      if (hoverInfo) {
          setTrainingMode({
              freq: hoverInfo.freq,
              tone: hoverInfo.tone,
              color: hoverInfo.color
          });
          setHoverInfo(null);
      } else if (forcedFrequency) {
           const { tone, color, mdiFreq } = getToneColor(forcedFrequency);
           // getToneColor returns MDI tone string ID, but we need tone name?
           // Actually Method36Trainer expects toneName.
           // getToneColor returns { tone: string(id), color: hex, mdiFreq: number }
           // So tone is ID.
           setTrainingMode({
              freq: mdiFreq,
              tone: tone,
              color: color
          });
      }
  };

  // Helper to get tone color (reused for forcedFrequency logic)
  const getToneColor = (freq: number) => {
    const mdi = getMdiTypeFromFrequency(freq);
    return { color: mdi.hex, tone: mdi.id.toString(), mdiFreq: mdi.frequency };
  };

  // --- VISUALIZATION LOOP ---
  const startVisualization = () => {
      const canvas = canvasRef.current;
      const analyser = analyserRef.current;
      if (!canvas || !analyser) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      const sampleRate = audioContextRef.current?.sampleRate || 44100;
      const binSize = sampleRate / analyser.fftSize;

      // Single Octave Range: 88Hz - 170Hz
      // We add padding: 86Hz - 174Hz
      const minFreq = 86;
      const maxFreq = 174;
      const minLog = Math.log(minFreq);
      const maxLog = Math.log(maxFreq);
      const logRange = maxLog - minLog;

      const getX = (f: number) => {
          const logF = Math.log(Math.max(f, minFreq));
          const norm = (logF - minLog) / logRange;
          return norm * canvas.width;
      };

      const normalizeToOctave = (f: number) => {
          let norm = f;
          if (norm <= 0) return 0;
          while (norm < 87 && norm > 0) norm *= 2;
          while (norm > 173) norm /= 2;
          return norm;
      };

      const draw = () => {
          if (!isListeningRef.current) return;
          animationRef.current = requestAnimationFrame(draw);
          
          analyser.getByteFrequencyData(dataArray);
          
          // 1. Clear Canvas
          ctx.fillStyle = '#000000';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          // 2. Analyze Audio
          const mdiEnergy = new Map<number, number>();
          let maxAmp = 0;
          let domFreq = 0;

          for (let i = 0; i < bufferLength; i++) {
              const binFreq = i * binSize;
              if (binFreq < 50 || binFreq > 1000) continue; // Voice range
              
              const amplitude = dataArray[i];
              if (amplitude > maxAmp) {
                  maxAmp = amplitude;
                  domFreq = binFreq;
              }

              if (amplitude < 10) continue;

              const normFreq = normalizeToOctave(binFreq);
              
              // Find closest MDI type
              let bestId = frequencyData[0].id;
              let minDiff = Math.abs(normFreq - frequencyData[0].frequency);
              for (let j = 1; j < frequencyData.length; j++) {
                  const diff = Math.abs(normFreq - frequencyData[j].frequency);
                  if (diff < minDiff) {
                      minDiff = diff;
                      bestId = frequencyData[j].id;
                  }
              }
              const current = mdiEnergy.get(bestId) || 0;
              mdiEnergy.set(bestId, Math.max(current, amplitude));
          }

          // Update current frequency state
          if (maxAmp > 30) {
             setCurrentFreq(domFreq);
          } else {
             setCurrentFreq(0);
          }

          // 3. Draw Contiguous Bands
          const sortedMdi = [...frequencyData].sort((a, b) => a.frequency - b.frequency);

          sortedMdi.forEach((item, index) => {
              const startFreq = index === 0 
                  ? minFreq 
                  : (sortedMdi[index - 1].frequency + item.frequency) / 2;
              const endFreq = index === sortedMdi.length - 1 
                  ? maxFreq 
                  : (item.frequency + sortedMdi[index + 1].frequency) / 2;

              const x1 = getX(startFreq);
              const x2 = getX(endFreq);
              const w = Math.max(1, x2 - x1);

              const amp = mdiEnergy.get(item.id) || 0;
              const isActive = amp > 20;

              // Opacity logic
              let opacity = 0.2; // Base visibility
              if (isActive) {
                  opacity = 0.4 + (amp / 255) * 0.6;
              }

              // Highlight if fundamental
              const normFund = normalizeToOctave(domFreq);
              const isFundamental = domFreq > 0 && Math.abs(normFund - item.frequency) < 2;
              
              if (isFundamental) {
                  opacity = 1.0;
                  ctx.shadowBlur = 30;
                  ctx.shadowColor = item.hex;
              } else {
                  ctx.shadowBlur = 0;
              }

              ctx.fillStyle = item.hex;
              ctx.globalAlpha = opacity;
              ctx.fillRect(x1, 0, w, canvas.height);

              // Flash white overlay
              if (isFundamental) {
                  ctx.fillStyle = '#ffffff';
                  ctx.globalAlpha = 0.2;
                  ctx.fillRect(x1, 0, w, canvas.height);
              }

              // Label
              if (w > 20) {
                  ctx.fillStyle = "rgba(255,255,255,0.9)";
                  ctx.font = "bold 14px monospace";
                  ctx.textAlign = "center";
                  ctx.globalAlpha = 1.0;
                  ctx.fillText(item.id.toString(), x1 + w/2, canvas.height - 30);
                  
                  // Freq Label
                  ctx.font = "10px monospace";
                  ctx.fillStyle = "rgba(255,255,255,0.6)";
                  ctx.fillText(`${item.frequency} Hz`, x1 + w/2, canvas.height - 15);
              }
          });
      };
      draw();
  };

  // Handle Click for Interaction
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Calculate Frequency from X position
      const minFreq = 86;
      const maxFreq = 174;
      const minLog = Math.log(minFreq);
      const maxLog = Math.log(maxFreq);
      const logRange = maxLog - minLog;

      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const normX = x / canvas.width;
      
      // Log Scale Inverse
      const freq = Math.exp(minLog + normX * logRange);

      // Find Closest MDI Type
      let bestItem = frequencyData[0];
      let minDiff = Math.abs(freq - frequencyData[0].frequency);
      for (const item of frequencyData) {
          const diff = Math.abs(freq - item.frequency);
          if (diff < minDiff) {
              minDiff = diff;
              bestItem = item;
          }
      }

      setHoverInfo({
          x: e.clientX,
          y: e.clientY,
          freq: bestItem.frequency,
          tone: bestItem.id.toString(),
          note: `Typ ${bestItem.id}`,
          color: bestItem.hex
      });
  };

  useEffect(() => {
      const handleResize = () => {
          if (canvasRef.current) {
              canvasRef.current.width = window.innerWidth;
              canvasRef.current.height = window.innerHeight;
          }
      };
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black">
      {/* Header */}
      <div className="h-16 border-b border-zinc-800 flex items-center px-6 justify-between bg-zinc-950/80 backdrop-blur-md z-10">
          <div className="flex items-center gap-4">
              <div className="text-orange-500 font-bold tracking-widest text-lg">MDI <span className="text-white">SCANNER</span></div>
          </div>
          <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={takeSnapshot} className="border-zinc-700 text-zinc-400 hover:text-white">
                  <Camera className="mr-2 h-4 w-4" /> Snapshot
              </Button>
              <Button variant="outline" onClick={onClose} className="rounded-full border-white/20 text-white hover:bg-white/10 ml-2">
                  <X className="mr-2 h-4 w-4" /> Zur Übersicht
              </Button>
          </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 relative bg-black cursor-crosshair overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={window.innerWidth} 
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full block"
            onClick={handleCanvasClick}
          />
          
          {/* Current Frequency Display */}
          {currentFreq > 0 && (
              <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/80 border border-white/20 px-4 py-2 rounded-full backdrop-blur text-white font-mono shadow-xl z-20">
                   {(() => {
                        let norm = currentFreq;
                        while (norm < 87) norm *= 2;
                        while (norm > 173) norm /= 2;
                        
                        let bestItem = frequencyData[0];
                        let minDiff = Math.abs(norm - frequencyData[0].frequency);
                        for (const item of frequencyData) {
                            const diff = Math.abs(norm - item.frequency);
                            if (diff < minDiff) {
                                minDiff = diff;
                                bestItem = item;
                            }
                        }
                        return `${bestItem.frequency} Hz (Typ ${bestItem.id})`;
                   })()}
              </div>
          )}

          {/* Hover Info */}
          <AnimatePresence>
              {hoverInfo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-20 bg-black/90 border border-zinc-700 rounded-xl p-4 shadow-2xl min-w-[280px]"
                    style={{ 
                        left: Math.min(hoverInfo.x + 20, window.innerWidth - 300), 
                        top: Math.min(hoverInfo.y - 50, window.innerHeight - 200) 
                    }}
                  >
                      <div className="flex items-start justify-between mb-2">
                          <div>
                              <div className="text-xs text-zinc-400 uppercase font-bold">MDI TYP</div>
                              <div className="text-3xl font-bold text-white">{hoverInfo.tone}</div>
                              <div className="text-sm font-mono text-zinc-500">{hoverInfo.freq} Hz</div>
                          </div>
                          <div className="w-8 h-8 rounded-full shadow-[0_0_15px_rgba(255,255,255,0.3)]" style={{ backgroundColor: hoverInfo.color }} />
                      </div>
                      <div className="h-px bg-zinc-800 my-3" />
                      <div className="grid gap-2">
                          <Button 
                            size="sm" 
                            className="w-full justify-start bg-zinc-800 hover:bg-zinc-700"
                            onClick={() => isPlayingTone ? stopHarmonicTone() : playHarmonicTone(hoverInfo.freq)}
                          >
                              {isPlayingTone ? <Square className="mr-2 h-4 w-4 text-red-500 fill-current" /> : <Play className="mr-2 h-4 w-4 text-green-500 fill-current" />}
                              {isPlayingTone ? "Stop" : "Ton abspielen"}
                          </Button>
                          <Button 
                            size="sm" 
                            className="w-full justify-start bg-orange-600 hover:bg-orange-500"
                            onClick={handleStartTraining}
                          >
                              <Heart className="mr-2 h-4 w-4 fill-current" />
                              Training starten
                          </Button>
                      </div>
                      <button className="absolute top-2 right-2 text-zinc-500 hover:text-white" onClick={() => setHoverInfo(null)}><X className="h-4 w-4" /></button>
                  </motion.div>
              )}
          </AnimatePresence>
          
           {/* Training Overlay */}
          <AnimatePresence>
              {trainingMode && (
                  <Method36Trainer 
                    frequency={trainingMode.freq}
                    toneName={trainingMode.tone}
                    color={trainingMode.color}
                    onClose={() => setTrainingMode(null)}
                  />
              )}
          </AnimatePresence>
      </div>

      {/* Footer Controls */}
      <div className="h-20 bg-zinc-950 border-t border-zinc-900 flex items-center justify-center px-6 z-10">
         <Button 
            size="lg"
            onClick={toggleAudio}
            className={`rounded-full px-8 text-lg font-bold transition-all ${isListening ? 'bg-red-500 hover:bg-red-600 shadow-[0_0_30px_rgba(239,68,68,0.4)]' : 'bg-white text-black hover:bg-zinc-200'}`}
         >
             {isListening ? <Mic className="mr-2 h-5 w-5 animate-pulse" /> : <MicOff className="mr-2 h-5 w-5" />}
             {isListening ? "STOP SCANNER" : "START SCANNER"}
         </Button>
      </div>
    </div>
  );
}
