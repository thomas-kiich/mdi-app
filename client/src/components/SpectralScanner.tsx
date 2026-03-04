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
  
  // Settings Refs (for access in loop)
  const sensitivityRef = useRef(2.5); // Higher default sensitivity
  const speedRef = useRef(1); // Slow Motion Default (1px per frame)
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
      analyser.fftSize = 4096; // Higher resolution for better low-end detail
      analyser.smoothingTimeConstant = 0.15; // Slightly smoother
      analyserRef.current = analyser;
      
      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);
      
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
    cancelAnimationFrame(animationRef.current);
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
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Set internal resolution matches window
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Fill black initially
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const bufferLength = analyserRef.current.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    
    const draw = () => {
      if (!analyserRef.current) return;
      
      analyserRef.current.getByteFrequencyData(dataArray);
      
      const speed = speedRef.current;
      const sensitivity = sensitivityRef.current;
      const zoomed = isZoomedRef.current;

      // Frequency Range Configuration
      // Zoomed: C2 (65Hz) to C5 (523Hz) - Focus on fundamental vocal range
      // Full: C2 (65Hz) to C6 (1046Hz) - Wider range
      const minFreq = 65.41; // C2
      const maxFreq = zoomed ? 600 : 1200; // C5 vs C6 approx
      const minLog = Math.log(minFreq);
      const maxLog = Math.log(maxFreq);
      
      // 1. Shift existing image to the left
      try {
          const w = canvas.width;
          const h = canvas.height;
          
          if (w > speed) {
            const imageData = ctx.getImageData(speed, 0, w - speed, h);
            ctx.putImageData(imageData, 0, 0);
          }
          
          // Clear the new strip on the right
          ctx.fillStyle = 'black';
          ctx.fillRect(w - speed, 0, speed, h);
          
          // 2. Draw new frequency column
          // Iterate Y-axis pixels (Bottom=Low, Top=High)
          // Optimization: Step by 2px to create organic blur and save perf
          for (let y = 0; y < h; y += 1) {
            // Normalized Y (0 at top, 1 at bottom)
            // We want High Freq at Top (y=0)
            const normY = y / h;
            const invertedNormY = 1 - normY;
            
            const freq = Math.exp(minLog + invertedNormY * (maxLog - minLog));
            
            // Get Amplitude from FFT
            const sampleRate = audioContextRef.current?.sampleRate || 44100;
            const nyquist = sampleRate / 2;
            const fftIndex = Math.floor((freq / nyquist) * bufferLength);
            
            if (fftIndex < dataArray.length) {
                let amplitude = dataArray[fftIndex];
                
                // HIGH FREQUENCY BOOST (Spectral Tilt Correction)
                // Boost higher frequencies to make them visible
                // Simple linear boost starting from 200Hz
                if (freq > 200) {
                    const boostFactor = 1 + (freq - 200) / 400; // Linear boost
                    amplitude = Math.min(255, amplitude * boostFactor);
                }

                if (amplitude > 10) { // Noise gate
                    // Get Color
                    const colorHex = getToneColor(freq);
                    
                    // Parse Hex
                    const r = parseInt(colorHex.slice(1, 3), 16);
                    const g = parseInt(colorHex.slice(3, 5), 16);
                    const b = parseInt(colorHex.slice(5, 7), 16);
                    
                    // Alpha based on amplitude
                    // Non-linear alpha for more contrast
                    const normalizedAmp = amplitude / 255;
                    const alpha = Math.min(1, Math.pow(normalizedAmp, 1.5) * sensitivity);
                    
                    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
                    // Draw slightly larger rect for blur effect
                    ctx.fillRect(w - speed, y, speed, 2); 
                }
            }
          }
      } catch (e) {
          console.error("Canvas error:", e);
      }
      
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
        className="absolute inset-0 w-full h-full filter blur-[1px]" // CSS Blur for organic feel
      />
      
      {/* Overlay UI */}
      <div className="absolute inset-0 pointer-events-none flex flex-col justify-between p-6">
        
        {/* Header */}
        <div className="flex justify-between items-start pointer-events-auto">
            <div>
                <h2 className="text-2xl font-light tracking-widest uppercase text-white drop-shadow-md">Spektral-Scanner</h2>
                <p className="text-sm text-gray-400 drop-shadow-md">Echtzeit-Visualisierung der energetischen Signatur</p>
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
                    onClick={toggleAudio}
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
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Helligkeit</span>
                <input 
                    type="range" 
                    min="1" 
                    max="10" 
                    step="0.5" 
                    defaultValue="2.5"
                    onChange={(e) => sensitivityRef.current = parseFloat(e.target.value)}
                    className="w-32 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-white"
                />
             </div>
             <div className="flex flex-col items-center gap-1">
                <span className="text-[10px] text-gray-400 uppercase tracking-wider">Fluss</span>
                <input 
                    type="range" 
                    min="1" 
                    max="5" 
                    step="1" 
                    defaultValue="1"
                    onChange={(e) => speedRef.current = parseInt(e.target.value)}
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
