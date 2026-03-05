import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff, Maximize, Minimize, Camera, Box, Layers, Info, Play, Square, Sparkles } from "lucide-react";
import { TONES } from "@/lib/tones";
import { useLocation } from 'wouter';

export function SpectralScanner({ onClose }: { onClose: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [location, setLocation] = useLocation();
  
  // Audio Synthesis Refs
  const synthContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlayingTone, setIsPlayingTone] = useState(false);

  // History Buffer: Stores columns of frequency data
  // Each column is an array of { y: number, color: string, alpha: number, freq: number, tone: string }
  const historyRef = useRef<any[]>([]); 
  
  // Settings Refs (for access in loop)
  const sensitivityRef = useRef(5.0); // Default sensitivity
  const speedRef = useRef(1); // Scroll speed
  const [isZoomed, setIsZoomed] = useState(true); // Vocal Zoom Default
  const isZoomedRef = useRef(true);
  const [is3DMode, setIs3DMode] = useState(false);
  const is3DModeRef = useRef(false);

  // Interaction State
  const [hoverInfo, setHoverInfo] = useState<{ x: number, y: number, freq: number, tone: string, note: string } | null>(null);

  // Helper to get tone color
  const getToneColor = (freq: number) => {
    // Normalize to one octave range (approx C4-B4: 261-523Hz) for comparison
    let normFreq = freq;
    // Avoid infinite loop for very low freqs
    if (normFreq < 10) return { color: "#000000", tone: "" };
    
    while (normFreq < 261.63) normFreq *= 2;
    while (normFreq > 523.25) normFreq /= 2;
    
    let minDiff = Infinity;
    let closestColor = "#ffffff";
    let closestTone = "";
    
    for (const t of TONES) {
        let tFreq = t.frequency;
        while (tFreq < 261.63) tFreq *= 2;
        while (tFreq > 523.25) tFreq /= 2;
        
        const diff = Math.abs(normFreq - tFreq);
        if (diff < minDiff) {
            minDiff = diff;
            closestColor = t.color;
            closestTone = t.name;
        }
    }
    return { color: closestColor, tone: closestTone };
  };

  // --- AUDIO SYNTHESIS ---
  const playHarmonicTone = (frequency: number) => {
      // Initialize AudioContext if needed
      if (!synthContextRef.current) {
          synthContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = synthContextRef.current;
      if (!ctx) return;

      // Stop previous if any
      stopHarmonicTone();
      setIsPlayingTone(true);

      const now = ctx.currentTime;
      const duration = 12; // 12 seconds total
      const attack = 2; // 2s fade in
      const release = 8; // 8s fade out

      // Create Master Gain for Envelope
      const masterGain = ctx.createGain();
      masterGain.connect(ctx.destination);
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.3, now + attack); // Max volume 0.3 to avoid clipping
      masterGain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      activeGainNodesRef.current.push(masterGain);

      // Create Oscillators for Warm Drone
      // 1. Fundamental (Sine) - The core
      // 2. Octave Lower (Triangle) - Body/Warmth
      // 3. Fifth Above (Sine) - Harmony/Shimmer
      // 4. Detuned Fundamental (Sawtooth, low pass) - Texture

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
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioCtx;
      
      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 4096; // Higher resolution for better peak detection
      analyser.smoothingTimeConstant = 0.0; // No smoothing for raw data
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Initialize History Buffer
      historyRef.current = [];
      
      setIsListening(true);
      startVisualization();
    } catch (err) {
      console.error("Error accessing microphone:", err);
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
      
      // Invert Y logic from draw loop
      const normY = y / h;
      const invertedNormY = 1 - normY;
      const freq = Math.exp(minLog + invertedNormY * (maxLog - minLog));
      
      const { tone } = getToneColor(freq);
      
      setHoverInfo({
          x: e.clientX,
          y: e.clientY,
          freq: freq,
          tone: tone,
          note: tone // Simplified
      });
      
      // Auto-hide after 5 seconds (longer to allow clicking Play)
      // Or remove auto-hide if user interacts?
      // For now, let's keep it simple.
  };

  // Visualization Loop
  const startVisualization = () => {
    const canvas = canvasRef.current;
    if (!canvas || !analyserRef.current) return;
    
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency
    if (!ctx) return;
    
    // Set internal resolution matches window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const sensitivity = sensitivityRef.current;
      const zoomed = isZoomedRef.current;
      const is3D = is3DModeRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Process New Column
      const newColumn: { y: number, color: string, alpha: number, freq: number }[] = [];
      
      const minFreq = 65.41; // C2
      const maxFreq = zoomed ? 600 : 1200; // C5 vs C6 approx
      const minLog = Math.log(minFreq);
      const maxLog = Math.log(maxFreq);
      
      // Sample height pixels to create the column
      for (let y = 0; y < h; y += 2) { // Step 2 for higher resolution
        // Normalized Y (0 at top, 1 at bottom)
        const normY = y / h;
        // Invert so 1 is at top (high freq)
        const invertedNormY = 1 - normY;
        
        const freq = Math.exp(minLog + invertedNormY * (maxLog - minLog));
        
        // Get Amplitude from FFT
        const sampleRate = audioContextRef.current?.sampleRate || 44100;
        const nyquist = sampleRate / 2;
        const fftIndex = Math.floor((freq / nyquist) * bufferLength);
        
        if (fftIndex > 1 && fftIndex < dataArray.length - 2) {
            let amplitude = dataArray[fftIndex];
            
            // Peak Detection: Check neighbors
            const prev = dataArray[fftIndex - 1];
            const next = dataArray[fftIndex + 1];
            const isPeak = amplitude > prev && amplitude > next;

            // Hard Cut Threshold
            if (amplitude > 40) { 
                
                // Exponential Contrast: Sharpen the difference between loud and quiet
                // Map 0-255 to 0-1
                let normAmp = amplitude / 255;
                
                // Apply Power Curve (Contrast)
                // pow(x, 3) makes 0.5 -> 0.125, but 0.9 -> 0.729
                // This suppresses noise heavily
                let sharpenedAmp = Math.pow(normAmp, 3);
                
                // Additional suppression for non-peaks (make them dimmer)
                if (!isPeak) {
                    sharpenedAmp *= 0.3; 
                }

                const { color } = getToneColor(freq);
                const alpha = Math.min(1, sharpenedAmp * sensitivity);
                
                if (alpha > 0.05) { // Only draw if visible
                    newColumn.push({ y, color, alpha, freq });
                }
            }
        }
      }
      
      // Add to history (unshift adds to beginning)
      historyRef.current.unshift(newColumn);
      
      // Trim history to screen width (or depth for 3D)
      if (historyRef.current.length > w) {
          historyRef.current.length = w;
      }
      
      // 2. Redraw Full Canvas from History
      // Clear with Black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      
      if (is3D) {
          // 3D TUNNEL MODE
          const cx = w / 2;
          const cy = h / 2;
          
          // Draw from back (oldest) to front (newest)
          // Limit depth to avoid infinite density at center
          const maxDepth = Math.min(historyRef.current.length, 200); 
          
          for (let i = maxDepth - 1; i >= 0; i--) {
              const col = historyRef.current[i];
              
              // Progress 0 (newest) to 1 (oldest)
              const progress = i / maxDepth; // 0 to 1
              
              // Exponential scale for speed sensation
              const scale = Math.pow(progress, 2) * 5; // *5 to go beyond screen
              
              if (scale < 0.01) continue;
              
              const depthAlpha = 1.0; // Keep full brightness for now
              
              for (const pixel of col) {
                  // Map Frequency Y (0-1) to Angle (0-2PI)
                  // Star Wars Hyperspace style
                  
                  // Map freq range to 0-360 degrees
                  const minF = 65.41;
                  const maxF = zoomed ? 600 : 1200;
                  const logF = Math.log(pixel.freq);
                  const logMin = Math.log(minF);
                  const logMax = Math.log(maxF);
                  const normF = (logF - logMin) / (logMax - logMin); // 0 to 1
                  
                  const angle = normF * Math.PI * 2 - Math.PI / 2; // Start at top
                  
                  const r = scale * (Math.min(w, h) / 2);
                  
                  const px = cx + Math.cos(angle) * r;
                  const py = cy + Math.sin(angle) * r;
                  
                  // Size grows with proximity
                  const size = Math.max(2, scale * 10);
                  
                  ctx.fillStyle = pixel.color;
                  ctx.globalAlpha = pixel.alpha * depthAlpha;
                  ctx.beginPath();
                  ctx.arc(px, py, size / 2, 0, Math.PI * 2);
                  ctx.fill();
              }
          }
      } else {
          // 2D CLASSIC MODE
          for (let i = 0; i < historyRef.current.length; i++) {
              const col = historyRef.current[i];
              const x = w - 1 - i; // Newest at right edge
              
              if (x < 0) break;
              
              for (const pixel of col) {
                 ctx.fillStyle = pixel.color;
                 ctx.globalAlpha = pixel.alpha;
                 // Draw smaller pixels for sharper look
                 ctx.fillRect(x, pixel.y, 2, 2); 
              }
          }
      }
      
      ctx.globalAlpha = 1.0;
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };
  
  // Cleanup
  useEffect(() => {
    return () => {
        stopAudio();
        stopHarmonicTone();
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white font-sans overflow-hidden">
      
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full cursor-crosshair" 
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-widest uppercase text-white/80 drop-shadow-md">Live Spektrum</h2>
                <p className="text-sm text-white/50 drop-shadow-md">
                    {is3DMode ? "MDI Hyper-Tunnel Mode" : "MDI Sharpened Mode (Peaks Only)"}
                </p>
            </div>
            <div className="flex gap-4">
                 <Button 
                    onClick={toggle3D}
                    variant="outline"
                    className="rounded-full px-4 border-white/20 text-white hover:bg-white/10"
                    title={is3DMode ? "Switch to 2D View" : "Switch to 3D Tunnel"}
                >
                    {is3DMode ? <Layers className="h-4 w-4 mr-2" /> : <Box className="h-4 w-4 mr-2" />}
                    {is3DMode ? "2D View" : "3D Tunnel"}
                </Button>
                 <Button 
                    onClick={toggleZoom}
                    variant="outline"
                    className="rounded-full px-4 border-white/20 text-white hover:bg-white/10"
                    title={isZoomed ? "Zoom Out (Full Range)" : "Zoom In (Vocal Range)"}
                >
                    {isZoomed ? <Minimize className="h-4 w-4 mr-2" /> : <Maximize className="h-4 w-4 mr-2" />}
                    {isZoomed ? "Vocal Zoom" : "Full Range"}
                </Button>
                <Button 
                    onClick={takeSnapshot}
                    variant="outline"
                    className="rounded-full px-4 border-white/20 text-white hover:bg-white/10"
                    title="Take Snapshot"
                >
                    <Camera className="h-4 w-4 mr-2" />
                    Snapshot
                </Button>
                 <Button 
                    onClick={() => {
                        if (isListening) stopAudio();
                        else startAudio();
                    }}
                    variant={isListening ? "destructive" : "secondary"}
                    className="rounded-full px-6 shadow-lg backdrop-blur-md bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                >
                    {isListening ? <><MicOff className="mr-2 h-4 w-4" /> Stop</> : <><Mic className="mr-2 h-4 w-4" /> Start</>}
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="text-white/70 hover:text-white hover:bg-white/10 rounded-full">
                    <X className="h-8 w-8" />
                </Button>
            </div>
        </div>
        
        {/* Frequency Labels (Left) - Only in 2D */}
        {!is3DMode && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col justify-between h-3/4 text-xs text-white/40 font-mono select-none pointer-events-none">
                {isZoomed ? (
                    <>
                        <span>C5 (High)</span>
                        <span>G4</span>
                        <span>C4 (Mid)</span>
                        <span>G3</span>
                        <span>C3 (Low)</span>
                        <span>C2 (Deep)</span>
                    </>
                ) : (
                    <>
                        <span>C6 (High)</span>
                        <span>C5</span>
                        <span>C4 (Mid)</span>
                        <span>C3</span>
                        <span>C2 (Deep)</span>
                    </>
                )}
            </div>
        )}

        {/* Controls (Bottom Center) */}
        <div className="pointer-events-auto self-center bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/10 flex gap-8 transition-opacity duration-300 hover:opacity-100 opacity-50 mb-8">
             <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Kontrast</span>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    defaultValue="5.0"
                    onChange={(e) => sensitivityRef.current = parseFloat(e.target.value)}
                    className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
             </div>
        </div>
      </div>
      
      {/* Start Prompt */}
      {!isListening && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="text-center text-white/30"
            >
                <Mic className="h-24 w-24 mx-auto mb-6 opacity-50" />
                <p className="text-2xl font-light tracking-wide">Drücken Sie Start</p>
            </motion.div>
        </div>
      )}

      {/* Hover Info Tooltip with Audio Playback */}
      <AnimatePresence>
        {hoverInfo && (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="absolute z-50 pointer-events-auto bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl p-4 text-white shadow-2xl flex flex-col gap-3 min-w-[200px]"
                style={{ 
                    left: Math.min(window.innerWidth - 220, hoverInfo.x + 20), 
                    top: Math.min(window.innerHeight - 150, hoverInfo.y - 20) 
                }}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Info className="h-4 w-4 text-orange-500" />
                        <span className="font-bold text-lg">{hoverInfo.tone}</span>
                    </div>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6 rounded-full hover:bg-white/10"
                        onClick={() => setHoverInfo(null)}
                    >
                        <X className="h-3 w-3" />
                    </Button>
                </div>
                
                <div className="text-xs text-gray-300 font-mono border-b border-white/10 pb-2 mb-1">
                    {hoverInfo.freq.toFixed(2)} Hz
                </div>

                <Button 
                    className={`w-full transition-all duration-500 ${isPlayingTone ? "bg-orange-500/20 text-orange-500 border-orange-500/50" : "bg-white/10 hover:bg-white/20"}`}
                    variant="outline"
                    onClick={() => {
                        if (isPlayingTone) stopHarmonicTone();
                        else playHarmonicTone(hoverInfo.freq);
                    }}
                >
                    {isPlayingTone ? (
                        <>
                            <Square className="mr-2 h-4 w-4 fill-current animate-pulse" /> Stop
                        </>
                    ) : (
                        <>
                            <Play className="mr-2 h-4 w-4 fill-current" /> Tönen (12s)
                        </>
                    )}
                </Button>
                
                <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
                    onClick={() => setLocation('/animation')}
                >
                    <Sparkles className="mr-2 h-4 w-4" /> Zur Animation
                </Button>
            </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
