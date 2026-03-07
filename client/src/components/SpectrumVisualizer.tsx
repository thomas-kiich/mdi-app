import React, { useEffect, useRef } from 'react';
import frequencyDataRaw from "@/lib/frequencyData.json";

// Define the type for frequency data items
interface FrequencyDataItem {
  id: string;
  frequency: number;
  colorName: string;
  hex: string;
  lightRange: string;
  toneRange: string;
  description: string;
  talent: string;
}

const frequencyData = frequencyDataRaw as FrequencyDataItem[];

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

    // Map Spectrum to 24 MDI Bars
    const numBars = 24;
    const gap = 2; // Small gap for wider bars
    const totalGap = gap * (numBars - 1);
    const barWidth = (canvas.width - totalGap) / numBars;

    // We need to map the FFT data (0-Nyquist) to our 24 MDI types.
    // MDI types are roughly 88Hz to 170Hz (plus octaves).
    // We will sum energy around each MDI frequency (including octaves).
    
    const energies = new Array(24).fill(0);
    const sampleRate = 44100; // Assumed, but good enough for visual
    const binSize = sampleRate / (data.length * 2); // approx resolution

    if (active && data.length > 0) {
        // For each FFT bin
        for (let i = 0; i < data.length; i++) {
            const binFreq = i * binSize;
            if (binFreq < 50 || binFreq > 1000) continue; // Voice range only
            
            const amplitude = data[i];
            if (amplitude < 10) continue; // Noise gate

            // Find which MDI type this freq belongs to (handling octaves)
            // We use the same logic as getMdiTypeFromFrequency but optimized for loop
            
            let normFreq = binFreq;
            while (normFreq < 85) normFreq *= 2;
            while (normFreq > 180) normFreq /= 2;

            let bestIdx = 0;
            let minDiff = Math.abs(normFreq - frequencyData[0].frequency);

            for (let j = 1; j < frequencyData.length; j++) {
                const diff = Math.abs(normFreq - frequencyData[j].frequency);
                if (diff < minDiff) {
                    minDiff = diff;
                    bestIdx = j;
                }
            }
            
            // Add energy
            energies[bestIdx] += amplitude;
        }
    }

    // Normalize energies
    const maxEnergy = Math.max(...energies, 1);
    
    // Draw Bars
    let x = 0;
    frequencyData.forEach((item, index) => {
        const energy = energies[index];
        const normalizedHeight = (energy / maxEnergy);
        
        // Base height 5%, max height 95%
        let barHeight = canvas.height * (0.05 + normalizedHeight * 0.9);
        
        // Opacity based on energy
        let opacity = 0.4 + (normalizedHeight * 0.6);
        
        // Highlight dominant
        const isDominant = energy === maxEnergy && energy > 0;
        if (isDominant) {
            ctx.shadowBlur = 15;
            ctx.shadowColor = item.hex;
            opacity = 1.0;
        } else {
            ctx.shadowBlur = 0;
        }

        ctx.fillStyle = item.hex;
        ctx.globalAlpha = opacity;
        
        // Draw bar
        ctx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);
        
        // Draw Number Label
        if (barWidth > 15) { // Only if wide enough
            ctx.fillStyle = "#ffffff";
            ctx.font = "10px monospace";
            ctx.textAlign = "center";
            ctx.globalAlpha = 0.8;
            ctx.fillText(item.id, x + barWidth/2, canvas.height - 5);
        }

        x += barWidth + gap;
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
                            if (freq <= 0) return "-";
                            let closest = frequencyData[0];
                            let minDiff = Math.abs(freq - closest.frequency);
                            for (const item of frequencyData) {
                                const diff = Math.abs(freq - item.frequency);
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
        
        {/* Optional: Add numbers 1-24 at the bottom if needed, but bars might be too thin on mobile */}
    </div>
  );
};
