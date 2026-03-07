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
  spectrum?: Uint8Array;
  isActive?: boolean;
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

    // --- SINGLE OCTAVE SETUP (88Hz - 175Hz) ---
    // We display exactly one octave containing all 24 types.
    // Lowest Type: 24 (88Hz). Highest Type: 1 (170Hz).
    // We add a bit of padding for the bands.
    const minFreq = 86; // Slightly below 88
    const maxFreq = 174; // Slightly above 170
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

    // Helper to fold frequency into our single octave range
    const normalizeToOctave = (f: number) => {
        let norm = f;
        if (norm <= 0) return 0;
        // Fold into 87-173 range (approx)
        while (norm < 87 && norm > 0) norm *= 2;
        while (norm > 173) norm /= 2;
        return norm;
    };

    // Map MDI ID -> Energy
    // We sum energy for each MDI type across all octaves
    const mdiEnergy = new Map<number, number>();
    
    if (active && data.length > 0) {
        for (let i = 0; i < data.length; i++) {
            const binFreq = i * binSize;
            if (binFreq < 50 || binFreq > 1000) continue;
            
            const amplitude = data[i];
            if (amplitude < 10) continue;

            // Fold binFreq to our octave
            const normFreq = normalizeToOctave(binFreq);
            if (normFreq === 0) continue;

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
            // Use Max amplitude to represent the type strength
            mdiEnergy.set(bestId, Math.max(current, amplitude)); 
        }
    }

    // --- DRAW CONTIGUOUS BANDS ---
    // Sort MDI types by frequency (Low to High): 88, 91, ... 170
    const sortedMdi = [...frequencyData].sort((a, b) => a.frequency - b.frequency);

    // First pass: Draw all bands
    sortedMdi.forEach((item, index) => {
        // Determine Band Boundaries
        // Start: Midpoint between prev and current (or minFreq)
        // End: Midpoint between current and next (or maxFreq)
        
        const startFreq = index === 0 
            ? minFreq 
            : (sortedMdi[index - 1].frequency + item.frequency) / 2;

        const endFreq = index === sortedMdi.length - 1 
            ? maxFreq 
            : (item.frequency + sortedMdi[index + 1].frequency) / 2;

        const x1 = getX(startFreq);
        const x2 = getX(endFreq);
        const w = Math.max(1, x2 - x1);

        // Get Energy
        const amp = mdiEnergy.get(item.id) || 0;
        const isActive = amp > 20;

        // Check if this is the fundamental type
        const normFund = normalizeToOctave(freq);
        const isFundamental = freq > 0 && Math.abs(normFund - item.frequency) < 2; // Tight tolerance

        // Draw Rect
        ctx.fillStyle = item.hex;
        
        // Opacity Logic
        // Always visible but dim (0.2)
        // Light up on sound (up to 0.8)
        let opacity = 0.2; 
        if (isActive) {
            opacity = 0.4 + (amp / 255) * 0.6;
        }
        
        if (isFundamental) {
            opacity = 1.0;
            ctx.shadowBlur = 20;
            ctx.shadowColor = item.hex;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.globalAlpha = opacity;
        ctx.fillRect(x1, 0, w, canvas.height);
        
        // If fundamental, add a white overlay flash
        if (isFundamental) {
             ctx.fillStyle = '#ffffff';
             ctx.globalAlpha = 0.3;
             ctx.fillRect(x1, 0, w, canvas.height);
        }

        // Draw Label (Number)
        // Only if width is sufficient
        if (w > 12) {
            ctx.fillStyle = "rgba(255,255,255,0.9)";
            ctx.font = "bold 10px monospace";
            ctx.textAlign = "center";
            ctx.globalAlpha = 1.0;
            ctx.fillText(item.id.toString(), x1 + w/2, canvas.height - 10);
        }
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
                            while (norm < 87) norm *= 2;
                            while (norm > 173) norm /= 2;

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
                    {
                        (() => {
                            // Find closest MDI type again to show ITS frequency
                            let norm = freq;
                            while (norm < 87) norm *= 2;
                            while (norm > 173) norm /= 2;

                            let closest = frequencyData[0];
                            let minDiff = Math.abs(norm - closest.frequency);
                            
                            for (const item of frequencyData) {
                                const diff = Math.abs(norm - item.frequency);
                                if (diff < minDiff) {
                                    minDiff = diff;
                                    closest = item;
                                }
                            }
                            return closest.frequency; // Display MDI Frequency
                        })()
                    } Hz
                </div>
            </div>
        )}
    </div>
  );
};
