import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { TONES } from '@/lib/tones';

interface SpectralMatrixProps {
  distribution: Record<string, number>; // Tone name -> Percentage (0-100)
  className?: string;
}

// User specified order: "beginnend mit dem rotviolett ... ins blauviolett"
// Based on our color mapping in TONES.ts:
// F  = Red-Violet (Magenta)
// Fis = Red
// G  = Red-Orange
// Gis = Orange
// A  = Yellow-Orange
// Ais = Yellow
// H  = Yellow-Green
// C  = Green (Center)
// Cis = Blue-Green
// D  = Blue
// Dis = Indigo (Blue-Violet ish)
// E  = Violet (Blue-Violet)

// So the spectral order (Long wavelength -> Short wavelength) is roughly:
// F (Red-Violet/Magenta start) -> Fis -> G -> Gis -> A -> Ais -> H -> C -> Cis -> D -> Dis -> E (Violet end)

const SPECTRAL_ORDER = [
    "F", "Fis", "G", "Gis", "A", "Ais", "H", "C", "Cis", "D", "Dis", "E"
];

export function SpectralMatrix({ distribution, className }: SpectralMatrixProps) {
  // Normalize distribution to ensure full height usage
  const maxVal = Math.max(...Object.values(distribution), 1);
  
  // Prepare data sorted by SPECTRAL_ORDER
  const spectrumData = useMemo(() => {
    return SPECTRAL_ORDER.map(toneName => {
      const tone = TONES.find(t => t.name === toneName);
      if (!tone) return null;

      const rawVal = distribution[tone.name] || 0;
      // Boost low values slightly for visibility, but keep contrast high
      const intensity = Math.pow(rawVal / maxVal, 0.7); 
      
      return {
        ...tone,
        intensity,
        rawVal
      };
    }).filter(Boolean) as (typeof TONES[0] & { intensity: number, rawVal: number })[];
  }, [distribution, maxVal]);

  return (
    <div className={cn("w-full space-y-4", className)}>
      <div className="flex justify-between items-end h-4">
        <span className="text-xs font-mono text-zinc-500">SPEKTRALE RESONANZ-MATRIX</span>
        <span className="text-xs font-mono text-orange-500">SPEKTRUM: ROTVIOLETT - BLAUVIOLETT (C=GRÜN)</span>
      </div>
      
      {/* The Matrix Container */}
      <div className="relative w-full h-48 rounded-xl overflow-hidden border border-zinc-800 bg-black shadow-2xl">
        {/* 1. Background Layer: The Full Potential (Gradient of all colors in spectral order) */}
        <div className="absolute inset-0 flex">
          {spectrumData.map((data) => (
            <div 
              key={data.name} 
              className="flex-1 h-full"
              style={{ backgroundColor: data.color }}
            />
          ))}
        </div>
        
        {/* 2. Mask Layer: The Reality (Black overlay with varying opacity) */}
        <div className="absolute inset-0 flex items-end">
           {spectrumData.map((data, i) => (
             <div 
               key={data.name} 
               className="flex-1 h-full bg-black transition-all duration-1000 ease-out flex flex-col justify-end items-center group relative"
               style={{ 
                 // Opacity is INVERSE of intensity. High intensity = Low black opacity (Color shines through).
                 backgroundColor: `rgba(0,0,0,${1 - data.intensity})` 
               }}
             >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-zinc-900 text-xs text-white px-2 py-1 rounded border border-zinc-700 pointer-events-none whitespace-nowrap z-20">
                    {data.name}: {Math.round(data.rawVal)}%
                </div>
             </div>
           ))}
        </div>
        
        {/* 3. Overlay Grid/Scanlines for tech feel */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-20 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/20 pointer-events-none" />
        
        {/* 4. Peak Curve Overlay (Optional aesthetic touch) */}
        {/* We could draw an SVG curve here connecting the tops of the visible areas, but the color bars are clearer for now. */}
      </div>

      {/* X-Axis Labels */}
      <div className="flex w-full justify-between px-1">
        {spectrumData.map((data) => (
          <div key={data.name} className="flex-1 text-center">
            <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-tighter">{data.name}</div>
            {/* Percentage Bar below label */}
            <div className="h-1 w-full bg-zinc-900 mt-1 rounded-full overflow-hidden">
                <div 
                    className="h-full transition-all duration-1000"
                    style={{ 
                        width: `${data.rawVal}%`,
                        backgroundColor: data.color
                    }}
                />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
