import { AnalysisResult } from '@/hooks/useAudioAnalyzer';
import React, { useEffect, useRef } from 'react';

interface SpectrumVisualizerProps {
  result: AnalysisResult | null;
  width?: number;
  height?: number;
}

export const SpectrumVisualizer: React.FC<SpectrumVisualizerProps> = ({ result, width = 600, height = 200 }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear background with black
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    if (!result || !result.spectrum) return;

    const { spectrum } = result;
    const bufferLength = spectrum.length;
    
    // Wir zeichnen nur die relevanten Frequenzen (nicht bis Nyquist)
    // Die meisten Sprachanteile sind < 4000 Hz
    // Bei 44.1kHz SampleRate ist Nyquist 22kHz
    // bufferLength = 1024 (bei FFT 2048) -> jeder Bin ca. 21.5 Hz
    // Wir wollen ca. die ersten 200 Bins sehen (bis ~4300 Hz)
    const displayBins = Math.min(bufferLength, 200); 
    
    const barWidth = width / displayBins;
    let x = 0;

    for (let i = 0; i < displayBins; i++) {
      const db = spectrum[i];
      let value = (db + 90) / 80; 
      if (value < 0) value = 0;
      if (value > 1) value = 1;
      
      const barHeight = value * height;

      // KIICH Orange: #FF6B00 -> rgb(255, 107, 0)
      const r = Math.floor(255 * value);
      const g = Math.floor(107 * value);
      const b = Math.floor(0 * value);
      
      ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
      ctx.fillRect(x, height - barHeight, barWidth - 1, barHeight);

      x += barWidth;
    }
  }, [result, width, height]);

  return (
    <div className="relative border border-primary/20 bg-black rounded-lg overflow-hidden shadow-[0_0_15px_rgba(255,107,0,0.1)] w-full h-full">
        <canvas 
            ref={canvasRef} 
            width={width} 
            height={height} 
            className="w-full h-full block" 
        />
        {result && result.isSpeaking && (
            <div className="absolute top-2 right-2 text-xs font-mono text-primary animate-pulse bg-black/80 px-2 py-1 rounded border border-primary/30 shadow-[0_0_10px_rgba(255,107,0,0.3)]">
                {result.fundamentalFreq.toFixed(2)} Hz
            </div>
        )}
    </div>
  );
};
