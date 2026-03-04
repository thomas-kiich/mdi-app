import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from "@/components/ui/button";
import { X, Mic, MicOff, Maximize, Minimize } from "lucide-react";
import { TONES } from "@/lib/tones";

export function SpectralScanner({ onClose }: { onClose: () => void }) {
  const [isListening, setIsListening] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  // History Buffer: Stores columns of frequency data
  // Each column is an array of { y: number, color: string, alpha: number }
  const historyRef = useRef<any[]>([]); 
  
  // Settings Refs (for access in loop)
  const sensitivityRef = useRef(5.0); // Default sensitivity
  const speedRef = useRef(1); // Scroll speed
  const [isZoomed, setIsZoomed] = useState(true); // Vocal Zoom Default
  const isZoomedRef = useRef(true);

  // Helper to get tone color
  const getToneColor = (freq: number) => {
    // Normalize to one octave range (approx C4-B4: 261-523Hz) for comparison
    let normFreq = freq;
    // Avoid infinite loop for very low freqs
    if (normFreq < 10) return "#000000";
    
    while (normFreq < 261.63) normFreq *= 2;
    while (normFreq > 523.25) normFreq /= 2;
    
    let minDiff = Infinity;
    let closestColor = "#ffffff";
    
    for (const t of TONES) {
        let tFreq = t.frequency;
        while (tFreq < 261.63) tFreq *= 2;
        while (tFreq > 523.25) tFreq /= 2;
        
        const diff = Math.abs(normFreq - tFreq);
        if (diff < minDiff) {
            minDiff = diff;
            closestColor = t.color;
        }
    }
    return closestColor;
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
  };

  const toggleAudio = () => {
    if (isListening) stopAudio();
    else startAudio();
  };

  const toggleZoom = () => {
      setIsZoomed(!isZoomed);
      isZoomedRef.current = !isZoomed;
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
      const w = canvas.width;
      const h = canvas.height;

      // 1. Process New Column
      const newColumn: { y: number, color: string, alpha: number }[] = [];
      
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

                const colorHex = getToneColor(freq);
                const alpha = Math.min(1, sharpenedAmp * sensitivity);
                
                if (alpha > 0.05) { // Only draw if visible
                    newColumn.push({ y, color: colorHex, alpha });
                }
            }
        }
      }
      
      // Add to history (unshift adds to beginning)
      historyRef.current.unshift(newColumn);
      
      // Trim history to screen width
      if (historyRef.current.length > w) {
          historyRef.current.length = w;
      }
      
      // 2. Redraw Full Canvas from History
      // Clear with Black
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, w, h);
      
      // Draw all columns
      // We want history[0] (newest) at the RIGHT edge (x=w)
      // history[1] at w-1, etc.
      
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
      ctx.globalAlpha = 1.0;
      
      animationRef.current = requestAnimationFrame(draw);
    };
    
    draw();
  };
  
  // Cleanup
  useEffect(() => {
    return () => stopAudio();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-black text-white font-sans overflow-hidden">
      
      {/* Canvas Layer */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 w-full h-full" 
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div>
                <h2 className="text-2xl font-bold tracking-widest uppercase text-white/80 drop-shadow-md">Live Spektrum</h2>
                <p className="text-sm text-white/50 drop-shadow-md">MDI Sharpened Mode (Peaks Only)</p>
            </div>
            <div className="flex gap-4">
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
        
        {/* Frequency Labels (Left) */}
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
    </div>
  );
}
