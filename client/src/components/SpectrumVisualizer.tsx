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
  // If spectrum is provided, use it. Otherwise try result.spectrum.
  const data = spectrum || result?.spectrum || new Uint8Array(0);
  
  // Determine active state
  const active = isActive !== undefined ? isActive : (result?.isSpeaking || false);
  
  // Frequency display only available if result object is passed or we could calculate it (but here we just use result)
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

    // If no data or empty, stop here (after clearing)
    if (data.length === 0) {
      return () => window.removeEventListener('resize', updateCanvasSize);
    }

    const bufferLength = data.length;
    
    // We draw only relevant frequencies (not up to Nyquist)
    // Most voice content is < 4000 Hz
    // At 44.1kHz SampleRate, Nyquist is 22kHz
    // bufferLength = 1024 (at FFT 2048) -> each bin approx 21.5 Hz
    // We want to see approx first 200 bins (up to ~4300 Hz)
    const displayBins = Math.min(bufferLength, 200); 
    
    const barWidth = canvas.width / displayBins;
    let x = 0;

    // Determine color based on 24-step MDI system ONCE per frame
    let colorHex = "#FF6B00"; // Default orange
    
    if (freq > 0) {
        // Find closest MDI frequency
        let closest = frequencyData[0];
        let minDiff = Math.abs(freq - closest.frequency);
        
        for (const item of frequencyData) {
            const diff = Math.abs(freq - item.frequency);
            if (diff < minDiff) {
                minDiff = diff;
                closest = item;
            }
        }
        colorHex = closest.hex;
    }

    if (active) {
         ctx.shadowBlur = 15;
         ctx.shadowColor = colorHex;
    } else {
         ctx.shadowBlur = 0;
    }

    for (let i = 0; i < displayBins; i++) {
      const value = data[i]; // 0-255
      
      // Calculate height relative to canvas height
      const percent = value / 255;
      const barHeight = percent * canvas.height;

      // Use the MDI color with opacity based on intensity
      ctx.fillStyle = colorHex;
      ctx.globalAlpha = 0.5 + (percent * 0.5); // Min 50% opacity, max 100%
      
      ctx.fillRect(x, canvas.height - barHeight, barWidth + 0.5, barHeight);

      x += barWidth;
    }
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [data, active, width, height, freq]); // Added freq to dependency array

  return (
    <div ref={containerRef} className="relative border border-orange-500/20 bg-black rounded-lg overflow-hidden shadow-[0_0_15px_rgba(255,107,0,0.1)] w-full h-full">
        <canvas 
            ref={canvasRef} 
            className="w-full h-full block" 
        />
        {active && freq > 0 && (
            <div className="absolute top-2 right-2 text-xs font-mono text-orange-500 animate-pulse bg-black/80 px-2 py-1 rounded border border-orange-500/30 shadow-[0_0_10px_rgba(255,107,0,0.3)]">
                {freq.toFixed(2)} Hz
            </div>
        )}
    </div>
  );
};
