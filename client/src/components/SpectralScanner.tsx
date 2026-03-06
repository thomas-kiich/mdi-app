import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff, Maximize, Minimize, Camera, Box, Layers, Play, Square, Sparkles, Heart, Activity } from "lucide-react";
import { getToneFromFrequency } from "@/lib/tones";
import { useLocation } from 'wouter';
import { Method36Trainer } from "@/components/Method36Trainer";

interface SpectralScannerProps {
    onClose: () => void;
    forcedFrequency?: number; // Optional prop to force a specific frequency for training
}

export function SpectralScanner({ onClose, forcedFrequency }: SpectralScannerProps) {
  const [isListening, setIsListening] = useState(false);
  const isListeningRef = useRef(false); // Ref for sync access in loop
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [, setLocation] = useLocation();
  
  // Audio Synthesis Refs
  const synthContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  // History Buffer: Stores columns of frequency data
  const historyRef = useRef<any[]>([]); 
  
  // Settings Refs (for access in loop)
  const sensitivityRef = useRef(5.0); // Default sensitivity
  const speedRef = useRef(2); // Scroll speed increased for better flow
  const [isZoomed, setIsZoomed] = useState(true); // Vocal Zoom Default
  const isZoomedRef = useRef(true);
  const [is3DMode, setIs3DMode] = useState(false);
  const is3DModeRef = useRef(false);

  // Interaction State
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, freq: number, tone: string, note: string, color: string } | null>(null);
  const [trainingMode, setTrainingMode] = useState<{ freq: number, tone: string, color: string } | null>(null);

  // Helper to get tone color
  const getToneColor = (freq: number) => {
    const { tone } = getToneFromFrequency(freq);
    return { color: tone.color, tone: tone.name };
  };

  // --- AUDIO SYNTHESIS ---
  const playHarmonicTone = (frequency: number) => {
      // Initialize AudioContext if needed
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!synthContextRef.current) {
          synthContextRef.current = new AudioContextClass();
      }
      const ctx = synthContextRef.current;
      if (!ctx) return;
      
      // Resume if suspended
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Stop previous if any
      stopHarmonicTone();
      setIsPlayingTone(true);

      const now = ctx.currentTime;
      const duration = 12; // 12 seconds total
      const attack = 2; // 2s fade in

      // Create Master Gain for Envelope
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.3, now + attack); // Max volume 0.3 to avoid clipping
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      activeGainNodesRef.current.push(masterGain);

      // Create Oscillators for Warm Drone
      const oscs = [];

      // Fundamental
      const osc1 = ctx.createOscillator();
      osc1.type = 'sine';
      osc1.frequency.value = frequency;
      const gain1 = ctx.createGain();
      gain1.gain.value = 0.6;
      osc1.connect(gain1).connect(masterGain);
      oscs.push(osc1);

      // Sub Octave (Triangle for warmth)
      const osc2 = ctx.createOscillator();
      osc2.type = 'triangle';
      osc2.frequency.value = frequency / 2;
      const gain2 = ctx.createGain();
      gain2.gain.value = 0.3;
      // Lowpass filter for the sub to make it deep
      const filter2 = ctx.createBiquadFilter();
      filter2.type = 'lowpass';
      filter2.frequency.value = 200;
      osc2.connect(filter2).connect(gain2).connect(masterGain);
      oscs.push(osc2);

      // Fifth Above (Sine for purity)
      const osc3 = ctx.createOscillator();
      osc3.type = 'sine';
      osc3.frequency.value = frequency * 1.5;
      const gain3 = ctx.createGain();
      gain3.gain.value = 0.2;
      osc3.connect(gain3).connect(masterGain);
      oscs.push(osc3);

      // Detuned Texture (Sawtooth with heavy filtering)
      const osc4 = ctx.createOscillator();
      osc4.type = 'sawtooth';
      osc4.frequency.value = frequency * 1.01; // Slightly detuned
      const gain4 = ctx.createGain();
      gain4.gain.value = 0.05; // Very subtle
      const filter4 = ctx.createBiquadFilter();
      filter4.type = 'lowpass';
      filter4.frequency.value = 400;
      osc4.connect(filter4).connect(gain4).connect(masterGain);
      oscs.push(osc4);

      // Start all
      oscs.forEach(osc => {
          osc.start(now);
          osc.stop(now + duration);
          activeOscillatorsRef.current.push(osc);
      });

      // Auto cleanup state
      setTimeout(() => {
          setIsPlayingTone(false);
      }, duration * 1000);
  };

  const stopHarmonicTone = () => {
      activeOscillatorsRef.current.forEach(osc => {
          try { osc.stop(); } catch (e) {}
      });
      activeOscillatorsRef.current = [];
      activeGainNodesRef.current.forEach(gain => {
          try { gain.disconnect(); } catch (e) {}
      });
      activeGainNodesRef.current = [];
      setIsPlayingTone(false);
  };

  const startAudio = async () => {
    try {
      // 1. Get Stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      // 2. Create Context
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const audioCtx = new AudioContextClass();
      audioContextRef.current = audioCtx;

      // 3. Create Analyser
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048; // Reduced from 4096 for better performance
      analyser.smoothingTimeConstant = 0.8; // Increased smoothing for smoother visuals
      analyserRef.current = analyser;
      
      // 4. Connect Source
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // 5. Resume if suspended (must be after creation)
      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }
      
      // 6. Reset History & Start
      historyRef.current = [];
      setIsListening(true);
      isListeningRef.current = true;
      
      // Ensure canvas is ready before starting loop
      requestAnimationFrame(() => {
          startVisualization();
      });
      
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
    stopHarmonicTone(); // Also stop any playing tone
  };

  const toggleAudio = () => {
    if (isListening) stopAudio();
    else startAudio();
  };

  const toggleZoom = () => {
      setIsZoomed(!isZoomed);
      isZoomedRef.current = !isZoomed;
  };

  const toggle3D = () => {
      setIs3DMode(!is3DMode);
      is3DModeRef.current = !is3DMode;
  };

  const takeSnapshot = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      // Create a temporary link
      const link = document.createElement('a');
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      link.download = `MDI-Spektrum-${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
  };

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
      // Allow inspection even while running
      
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const h = canvas.height;
      
      // Calculate Frequency from Y
      const zoomed = isZoomed; // Use state, as click is in React cycle
      const minFreq = 65.41; 
      const maxFreq = zoomed ? 600 : 1200;
      const minLog = Math.log(minFreq);
      const maxLog = Math.log(maxFreq);
      const logRange = maxLog - minLog;
      
      let freq = 0;

      if (is3DMode) {
          // 3D Mode: Angle = Frequency
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const dx = e.clientX - rect.left - centerX;
          const dy = e.clientY - rect.top - centerY;
          
          // Calculate angle (0 to 2PI)
          // Math.atan2 returns -PI to PI. We map it to 0 to 1 range.
          let angle = Math.atan2(dy, dx); 
          if (angle < 0) angle += Math.PI * 2; // Normalize to 0-2PI
          
          const angleNorm = angle / (Math.PI * 2);
          
          // Map angle back to frequency
          // logPos = angleNorm
          freq = Math.exp(minLog + angleNorm * logRange);

      } else {
          // 2D Mode: Y-Axis = Frequency
          const normY = y / h;
          const invertedNormY = 1 - normY;
          freq = Math.exp(minLog + invertedNormY * logRange);
      }
      
      const { tone, color } = getToneColor(freq);
      
      // Ensure color is valid hex
      const safeColor = color && color.startsWith('#') ? color : '#ffffff';
      
      setHoverInfo({
          x: e.clientX,
          y: e.clientY,
          freq: freq,
          tone: tone,
          note: tone, // Simplified
          color: safeColor
      });
  };

  // Visualization Loop
  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    const sampleRate = audioContextRef.current?.sampleRate || 44100;
    
    // Config
    const width = canvas.width;
    const height = canvas.height;
    
    // Logarithmic Scale Config
    const minFreq = 65.41; // C2
    const maxFreq = isZoomedRef.current ? 600 : 1200; // Zoomed: D5, Full: D6
    const minLog = Math.log(minFreq);
    const maxLog = Math.log(maxFreq);
    const logRange = maxLog - minLog;

    const render = () => {
      // Safety check: if audio stopped, exit loop
      if (!analyserRef.current || !isListeningRef.current) {
          // One last clear
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);
          return;
      }

      analyserRef.current.getByteFrequencyData(dataArray);
      
      // --- 3D Tunnel Mode ---
      if (is3DModeRef.current) {
          // Clear with fade effect for trails
          ctx.fillStyle = "rgba(0, 0, 0, 0.2)";
          ctx.fillRect(0, 0, width, height);

          // Tunnel Logic
          const centerX = width / 2;
          const centerY = height / 2;
          const maxRadius = Math.min(width, height) * 0.8;
          
          // Add current frame data to history for depth
          // We only store peaks to save performance
          const peaks = [];
          const threshold = 255 - (sensitivityRef.current * 25); // Adjusted threshold
          
          for (let i = 0; i < bufferLength; i++) {
              const value = dataArray[i];
              if (value > threshold) {
                  const freq = i * sampleRate / (bufferLength * 2);
                  if (freq >= minFreq && freq <= maxFreq) {
                      const logPos = (Math.log(freq) - minLog) / logRange;
                      // Map frequency to angle (0 to 2PI)
                      const angle = logPos * Math.PI * 2;
                      const { color } = getToneColor(freq);
                      peaks.push({ angle, color, alpha: value / 255 });
                  }
              }
          }
          historyRef.current.unshift(peaks);
          if (historyRef.current.length > 50) historyRef.current.pop(); // Depth limit

          // Draw Tunnel
          historyRef.current.forEach((framePeaks, depthIndex) => {
              const depthFactor = 1 - (depthIndex / 50); // 1 (near) to 0 (far)
              const radius = maxRadius * Math.pow(depthFactor, 2); // Exponential depth
              
              framePeaks.forEach((peak: any) => {
                  const x = centerX + Math.cos(peak.angle) * radius;
                  const y = centerY + Math.sin(peak.angle) * radius;
                  const size = (peak.alpha * 10 * depthFactor) + 1;
                  
                  ctx.beginPath();
                  ctx.arc(x, y, size, 0, Math.PI * 2);
                  ctx.fillStyle = peak.color;
                  ctx.globalAlpha = peak.alpha * depthFactor;
                  ctx.fill();
                  ctx.globalAlpha = 1.0;
              });
          });

      } else {
          // --- 2D Spectral Scroll Mode (Standard) ---
          
          // 1. Shift existing image to the left
          // We use drawImage to move the canvas content
          // IMPORTANT: Capture current state before clearing
          const tempCanvas = document.createElement('canvas');
          tempCanvas.width = width;
          tempCanvas.height = height;
          const tempCtx = tempCanvas.getContext('2d');
          if (tempCtx) {
             tempCtx.drawImage(canvas, 0, 0);
          }

          // Clear the canvas
          ctx.fillStyle = "#000000";
          ctx.fillRect(0, 0, width, height);

          // Draw shifted image
          if (tempCtx) {
             ctx.drawImage(tempCanvas, -speedRef.current, 0);
          }
          
          // 2. Draw new column on the right edge
          const x = width - speedRef.current;
          
          // Peak Detection & Sharpening
          const threshold = 255 - (sensitivityRef.current * 25); // Adjusted threshold logic
          
          for (let i = 0; i < bufferLength; i++) {
              const value = dataArray[i];
              
              if (value > threshold) { // Only draw if loud enough
                  const freq = i * sampleRate / (bufferLength * 2);
                  
                  if (freq >= minFreq && freq <= maxFreq) {
                      // Map Freq to Y Position (Logarithmic)
                      // High freq = Top (y=0), Low freq = Bottom (y=height)
                      const logPos = (Math.log(freq) - minLog) / logRange;
                      const y = height - (logPos * height);
                      
                      const { color } = getToneColor(freq);
                      const alpha = (value - threshold) / (255 - threshold); // Normalize alpha
                      
                      ctx.fillStyle = color;
                      ctx.globalAlpha = alpha;
                      // Draw a sharp line/rect
                      ctx.fillRect(x, y, speedRef.current, 4); // Thicker lines for visibility
                      ctx.globalAlpha = 1.0;
                  }
              }
          }
      }

      animationRef.current = requestAnimationFrame(render);
    };
    
    render();
  };

  useEffect(() => {
    // Auto-start on mount
    startAudio();
    return () => {
      stopAudio();
    };
  }, []);

  // Handle Training Start
  const handleStartTraining = () => {
      if (forcedFrequency) {
          // PRIORITY 1: Use Forced Frequency from Analysis
          const { tone } = getToneFromFrequency(forcedFrequency);
          setTrainingMode({
              freq: forcedFrequency,
              tone: tone.name,
              color: tone.color
          });
      } else if (hoverInfo) {
          // PRIORITY 2: Use Clicked Frequency from Scanner
          setTrainingMode({
              freq: hoverInfo.freq,
              tone: hoverInfo.tone,
              color: hoverInfo.color
          });
      }
      // If neither, button should be disabled or handle error
  };

  return (
    <div className="fixed inset-0 z-50 bg-black text-white font-sans flex flex-col">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 p-4 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent z-10 pointer-events-none">
          <div className="flex items-center gap-4 pointer-events-auto">
              <div className="bg-orange-500/20 p-2 rounded-full backdrop-blur-md border border-orange-500/30">
                <Activity className="h-5 w-5 text-orange-500 animate-pulse" />
              </div>
              <div>
                  <h2 className="text-lg font-bold tracking-tight">LIVE SPEKTRAL-SCANNER</h2>
                  <p className="text-xs text-zinc-400 font-mono">
                      {isListening ? "MESSUNG AKTIV" : "PAUSIERT"} • {isZoomed ? "VOCAL ZOOM" : "FULL RANGE"} • {is3DMode ? "3D TUNNEL" : "2D SCROLL"}
                  </p>
              </div>
          </div>
          <div className="flex items-center gap-2 pointer-events-auto">
              <Button variant="ghost" size="icon" onClick={toggle3D} className="text-zinc-400 hover:text-white" title="3D Tunnel Mode">
                 {is3DMode ? <Layers className="h-5 w-5 text-orange-500" /> : <Box className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={toggleZoom} className="text-zinc-400 hover:text-white" title="Toggle Zoom">
                 {isZoomed ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </Button>
              <Button variant="ghost" size="icon" onClick={takeSnapshot} className="text-zinc-400 hover:text-white" title="Snapshot">
                 <Camera className="h-5 w-5" />
              </Button>
              <Button 
                variant="outline" 
                onClick={onClose} 
                className="rounded-full border-white/20 text-white hover:bg-white/10 hover:text-white ml-2"
              >
                  <X className="mr-2 h-4 w-4" /> Zur Übersicht
              </Button>
          </div>
      </div>

      {/* Main Canvas Area */}
      <div className="flex-1 relative bg-black cursor-crosshair overflow-hidden">
          <canvas 
            ref={canvasRef} 
            width={window.innerWidth} 
            height={window.innerHeight}
            className="absolute inset-0 w-full h-full block"
            onClick={handleCanvasClick}
          />
          
          {/* Overlay Grid/Labels */}
          <div className="absolute left-4 top-20 bottom-20 flex flex-col justify-between text-xs font-mono text-zinc-600 pointer-events-none select-none">
              <span>{isZoomed ? "600 Hz" : "1200 Hz"}</span>
              <span>{isZoomed ? "300 Hz" : "600 Hz"}</span>
              <span>{isZoomed ? "150 Hz" : "300 Hz"}</span>
              <span>65 Hz</span>
          </div>

          {/* Hover/Click Info Popover */}
          <AnimatePresence>
              {hoverInfo && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="absolute z-20 bg-black/80 backdrop-blur-xl border border-zinc-700 rounded-xl p-4 shadow-2xl min-w-[280px]"
                    style={{ 
                        left: Math.min(hoverInfo.x + 20, window.innerWidth - 300), 
                        top: Math.min(hoverInfo.y - 50, window.innerHeight - 200) 
                    }}
                  >
                      <div className="flex items-start justify-between mb-2">
                          <div>
                              <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-1">Frequenz-Analyse</div>
                              <div className="text-3xl font-bold text-white flex items-baseline gap-2">
                                  {hoverInfo.note} 
                                  <span className="text-sm font-mono font-normal text-zinc-500">{hoverInfo.freq.toFixed(2)} Hz</span>
                              </div>
                          </div>
                          <div 
                            className="w-8 h-8 rounded-full shadow-inner" 
                            style={{ backgroundColor: hoverInfo.color, boxShadow: `0 0 20px ${hoverInfo.color}40` }} 
                          />
                      </div>
                      
                      <div className="h-px bg-zinc-800 my-3" />
                      
                      <div className="grid grid-cols-1 gap-2">
                          <Button 
                            size="sm" 
                            className="w-full justify-start bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                            onClick={() => isPlayingTone ? stopHarmonicTone() : playHarmonicTone(hoverInfo.freq)}
                          >
                              {isPlayingTone ? <Square className="mr-2 h-4 w-4 fill-current text-red-500" /> : <Play className="mr-2 h-4 w-4 fill-current text-green-500" />}
                              {isPlayingTone ? "Stop" : "Tönen (12s)"}
                          </Button>

                          <Button 
                            size="sm" 
                            className="w-full justify-start bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border-none shadow-lg shadow-orange-900/20"
                            onClick={handleStartTraining}
                          >
                              <Heart className="mr-2 h-4 w-4 fill-current animate-pulse" />
                              Methode 36 Training
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-zinc-400 hover:text-white"
                            onClick={() => {
                                setLocation("/story"); // Or trigger animation overlay
                            }}
                          >
                             <Sparkles className="mr-2 h-4 w-4" />
                             Zur Animation
                          </Button>
                      </div>
                      
                      <button 
                        className="absolute top-2 right-2 text-zinc-500 hover:text-white"
                        onClick={() => setHoverInfo(null)}
                      >
                          <X className="h-4 w-4" />
                      </button>
                  </motion.div>
              )}
          </AnimatePresence>
          
          {/* Persistent Training Button if Forced Frequency is present */}
          {forcedFrequency && !hoverInfo && (
              <div className="absolute bottom-8 right-8 z-20">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                  >
                      <Button 
                        size="lg" 
                        className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white border-none shadow-lg shadow-orange-900/20 h-16 px-8 rounded-full text-lg font-bold tracking-wide"
                        onClick={handleStartTraining}
                      >
                          <Heart className="mr-3 h-6 w-6 fill-current animate-pulse" />
                          Training Starten ({getToneFromFrequency(forcedFrequency).tone.name})
                      </Button>
                  </motion.div>
              </div>
          )}

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
      
      {/* Controls Footer */}
      <div className="h-16 bg-zinc-950 border-t border-zinc-900 flex items-center px-6 justify-between z-10">
          <div className="flex items-center gap-4 w-1/3">
             <span className="text-xs font-mono text-zinc-500">SENSITIVITÄT</span>
             <input 
                type="range" 
                min="1" max="10" step="0.1" 
                defaultValue="5"
                className="w-32 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                onChange={(e) => sensitivityRef.current = parseFloat(e.target.value)}
             />
          </div>
          
          <div className="flex items-center justify-center gap-2 w-1/3">
             <Button 
                variant="outline" 
                size="sm" 
                onClick={toggleAudio}
                className={`rounded-full border-zinc-800 ${isListening ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20' : 'bg-zinc-900 text-zinc-400'}`}
             >
                 {isListening ? <Mic className="mr-2 h-4 w-4" /> : <MicOff className="mr-2 h-4 w-4" />}
                 {isListening ? "Stop" : "Start"}
             </Button>
          </div>

          <div className="flex items-center justify-end gap-4 w-1/3">
             <span className="text-xs font-mono text-zinc-500">GESCHWINDIGKEIT</span>
             <input 
                type="range" 
                min="0.5" max="5" step="0.5" 
                defaultValue="2"
                className="w-32 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-orange-500"
                onChange={(e) => speedRef.current = parseFloat(e.target.value)}
             />
          </div>
      </div>
    </div>
  );
}
