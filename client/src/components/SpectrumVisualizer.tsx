import React, { useEffect, useRef } from 'react';

// Define a simplified AnalysisResult interface locally to avoid circular dependencies or import issues
interface AnalysisResult {
  spectrum: Uint8Array;
  isSpeaking: boolean;
  fundamentalFreq: number;
}

interface SpectrumVisualizerProps {
  // New props used in Home.tsx
  frequencyData?: Uint8Array;
  isActive?: boolean;
  
  // Legacy props support
  result?: AnalysisResult | null;
  
  width?: number;
  height?: number;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ 
  frequencyData, 
  isActive, 
  result, 
  width = 600, 
  height = 200 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Normalize data source
  // If frequencyData is provided, use it. Otherwise try result.spectrum.
  const data = frequencyData || result?.spectrum || new Uint8Array(0);
  
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

    for (let i = 0; i < displayBins; i++) {
      const value = data[i]; // 0-255
      
      // Calculate height relative to canvas height
      const percent = value / 255;
      const barHeight = percent * canvas.height;

      // KIICH Orange: #FF6B00 -> rgb(255, 107, 0)
      // Dynamic color based on intensity
      const r = 255;
      const g = Math.floor(107 + (148 * (1 - percent))); // Shift towards yellow/white for louder sounds
      const b = Math.floor(255 * (1 - percent)); // Add blue for whiteness at high intensity
      
      // Simple orange gradient
      ctx.fillStyle = `rgb(255, ${Math.floor(107 * percent)}, 0)`;
      
      if (active) {
         // Add some glow effect
         ctx.shadowBlur = 10;
         ctx.shadowColor = "rgba(255, 107, 0, 0.5)";
      } else {
         ctx.shadowBlur = 0;
      }
      
      ctx.fillRect(x, canvas.height - barHeight, barWidth + 0.5, barHeight);

      x += barWidth;
    }
    
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, [data, active, width, height]);

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
