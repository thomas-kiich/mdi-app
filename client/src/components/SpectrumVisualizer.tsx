import React, { useEffect, useRef } from 'react';
import frequencyDataRaw from "@/lib/frequencyData.json";

// Define the type for frequency data items
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

// Define a simplified AnalysisResult interface locally to avoid circular dependencies or import issues
interface AnalysisResult {
  spectrum: Uint8Array;
  isSpeaking: boolean;
  fundamentalFreq: number;
}

interface SpectrumVisualizerProps {
  // New props used in Home.tsx
  spectrum?: Uint8Array;
  isActive?: boolean;
  
  // Legacy props support
  result?: AnalysisResult | null;
  
  width?: number;
  height?: number;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ 
  spectrum, 
  isActive, 
  result, 
  width = 600, 
  height = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize data source
  const data = spectrum || result?.spectrum || new Uint8Array(0);
  
  // Determine active state
  const active = isActive !== undefined ? isActive : (result?.isSpeaking || false);
  
  // Frequency display
  const freq = result?.fundamentalFreq || 0;

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle resizing
    const updateCanvasSize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    // Clear background with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // --- LOGARITHMIC SCALE SETUP ---
    // Visible Range: 80Hz to 800Hz (approx 3.3 octaves)
    const minFreq = 80;
    const maxFreq = 800;
    const minLog = Math.log(minFreq);
    const maxLog = Math.log(maxFreq);
    const logRange = maxLog - minLog;

    // Helper to map Hz to X pixel
    const getX = (f: number) => {
        const logF = Math.log(Math.max(f, minFreq));
        const norm = (logF - minLog) / logRange;
        return norm * canvas.width;
    };

    // --- FFT ANALYSIS ---
    const sampleRate = 44100; 
    const binSize = sampleRate / (data.length * 2);

    const getAmplitude = (f: number) => {
        if (data.length === 0) return 0;
        const binIndex = Math.floor(f / binSize);
        if (binIndex < 0 || binIndex >= data.length) return 0;
        return data[binIndex];
    };

    // --- DRAW BANDS ---
    // We iterate through octaves: 1 (Base), 2, 4
    const octaves = [1, 2, 4]; // Multipliers: 1x, 2x, 4x

    // Sort MDI types by frequency (Low to High)
    const sortedMdi = [...frequencyData].sort((a, b) => a.frequency - b.frequency);

    octaves.forEach((multiplier, octaveIndex) => {
        sortedMdi.forEach((item) => {
            const baseFreq = item.frequency; // e.g. 88 (Type 24)
            const f = baseFreq * multiplier; // e.g. 88, 176, 352...

            if (f < minFreq || f > maxFreq) return;

            const x = getX(f);
            
            // Calculate Variable Width based on Frequency (Inverse Relationship)
            // Low Freq (80Hz) -> Wide. High Freq (800Hz) -> Narrow.
            // This creates the "denser at top" visual effect.
            
            // Base width at minFreq
            const baseWidth = 40; 
            // Scaling factor: width scales with 1 / sqrt(f) to be less aggressive than 1/f
            const widthScale = Math.sqrt(minFreq / f);
            const w = Math.max(2, baseWidth * widthScale);

            // Get Amplitude
            const amp = getAmplitude(f);
            const isActive = amp > 20; // Threshold
            
            // Highlight if this is the detected fundamental
            const isFundamental = Math.abs(freq - f) < 5; // within 5Hz
            
            // Draw Band
            ctx.fillStyle = item.hex;
            
            // Opacity
            let opacity = 0.3; // Base visibility
            if (isActive) opacity = 0.6 + (amp / 255) * 0.4;
            if (isFundamental) {
                opacity = 1.0;
                ctx.shadowBlur = 15;
                ctx.shadowColor = item.hex;
            } else {
                ctx.shadowBlur = 0;
            }
            
            ctx.globalAlpha = opacity;
            
            // Draw full height band
            ctx.fillRect(x - w/2, 0, w, canvas.height);
            
            // Draw Label (Number) at bottom
            if (octaveIndex === 0) { // Only label base octave
                ctx.fillStyle = "#ffffff";
                ctx.font = "10px monospace";
                ctx.textAlign = "center";
                ctx.globalAlpha = 0.8;
                ctx.fillText(item.id.toString(), x, canvas.height - 5);
            }
        });
    });
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [data, active, width, height, freq]);

  return (
    <div ref={containerRef} className="relative border border-zinc-800 bg-black rounded-lg overflow-hidden shadow-2xl w-full h-full">
        <canvas 
            ref={canvasRef} 
            className="w-full h-full block" 
        />
        {active && freq > 0 && (
            <div className="absolute top-2 right-2 flex flex-col items-end gap-1 animate-pulse z-10">
                <div 
                    className="text-lg font-bold px-3 py-1 rounded border shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                    style={{ 
                        color: '#fff',
                        borderColor: '#fff',
                        backgroundColor: 'rgba(0,0,0,0.8)'
                    }}
                >
                    TYPE {
                        (() => {
                            // Find closest MDI type (handling octaves)
                            let norm = freq;
                            while (norm < 85) norm *= 2;
                            while (norm > 180) norm /= 2;

                            let closest = frequencyData[0];
                            let minDiff = Math.abs(norm - closest.frequency);
                            
                            for (const item of frequencyData) {
                                const diff = Math.abs(norm - item.frequency);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closest = item;
                                }
                            }
                            return closest.id;
                        })()
                    }
                </div>
                <div className="text-[10px] font-mono text-zinc-500 bg-black/80 px-1 rounded">
                    {freq.toFixed(1)} Hz
                </div>
            </div>
        )}
    </div>
  );
};
