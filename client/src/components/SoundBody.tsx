import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TONES } from '@/lib/tones';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface SoundBodyProps {
  toneDistribution: Record<string, number>;
  dominantToneName: string;
}

// User Requirement:
// E-blauviolett / DIS Schwarzblau / D königsblau / CIS trükis / C grün / H olive / AIS gelbgrün / A gelb / Gis gelborange / G rotorange / FIS rot / F magenta
const SPECTRAL_ORDER = [
  "E",   // Blauviolett
  "Dis", // Schwarzblau
  "D",   // Königsblau
  "Cis", // Türkis
  "C",   // Grün
  "H",   // Olive
  "Ais", // Gelbgrün
  "A",   // Gelb
  "Gis", // Gelborange
  "G",   // Rotorange
  "Fis", // Rot
  "F"    // Magenta
];

export function SoundBody({ toneDistribution, dominantToneName }: SoundBodyProps) {
  const [viewMode, setViewMode] = useState<'inner' | 'outer'>('inner');
  
  // Prepare data sorted by SPECTRAL_ORDER
  const sortedData = useMemo(() => {
    return SPECTRAL_ORDER.map(toneName => {
      const toneInfo = TONES.find(t => t.name === toneName);
      const percentage = toneDistribution[toneName] || 0;
      
      return {
        name: toneName,
        percentage,
        color: toneInfo?.color || "#666",
      };
    });
  }, [toneDistribution]);

  // Generate SVG path for the "Wave Diagram" - VERTICAL
  // The path must go through the center of each bar column at the correct width
  // height is total height (e.g. 600), width is max width (e.g. 200)
  const generateVerticalPath = (width: number, height: number, invert: boolean = false) => {
    if (sortedData.length === 0) return { path: "", points: [] };

    const numPoints = sortedData.length;
    
    // Find index of dominant tone
    const domIndex = sortedData.findIndex(d => d.name === dominantToneName);
    if (domIndex === -1) return { path: "", points: [] };

    // Rotate the array so dominant tone is first (at Navel)
    const rotatedData = [
      ...sortedData.slice(domIndex),
      ...sortedData.slice(0, domIndex)
    ];

    // Now map this rotated spectrum from Navel (y=0 relative) to Head (y=max relative)
    // We need points for the path.
    const points = rotatedData.map((d, i) => {
      // Linear interpolation for y: 0 (Navel) to height (Head/Feet)
      const y = (i / (numPoints - 1)) * height;
      
      let val = d.percentage;
      if (invert) {
          // Outer Field: 100 - val
          val = Math.max(0, 100 - val);
      }
      
      // Scale factor:
      // Inner: val * 3 (so 33% fills the width)
      // Outer: val is large, so we scale it differently to fit nicely
      let normalizedW = 0;
      if (!invert) {
          normalizedW = Math.min(val * 4, 100); 
      } else {
          // For outer field, we visualize the GAP.
          // Scale it so it doesn't look like a solid block
          // Let's say max width is 100% gap.
          // But visually we want it to look like the "complementary" wave.
          // Let's scale it similarly but maybe cap it.
          normalizedW = Math.min(val, 100); 
      }
      
      const x = (normalizedW / 100) * width;
      return { x, y, color: d.color, tone: d.name };
    });

    // Start path at Navel (0,0)
    let path = `M 0 0`;

    if (points.length > 0) {
        // Line to first point
        path += ` L ${points[0].x} ${points[0].y}`;

        // Cubic Bezier interpolation
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            
            const cp1y = p0.y + (p1.y - p0.y) * 0.5;
            const cp1x = p0.x;
            const cp2y = p0.y + (p1.y - p0.y) * 0.5;
            const cp2x = p1.x;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        
        // Return to center axis at the end
        path += ` L 0 ${height}`;
        // Close back to start along the center axis
        path += ` L 0 0 Z`;
    }

    return { path, points };
  };

  const headHeight = 280; // Length from Navel to Head
  const feetHeight = 420; // Length from Navel to Feet (longer legs)
  const maxWidth = 160;   // Max width of the aura

  const isOuter = viewMode === 'outer';
  const upperWave = generateVerticalPath(maxWidth, headHeight, isOuter);
  const lowerWave = generateVerticalPath(maxWidth, feetHeight, isOuter);

  if (!upperWave.path || !lowerWave.path) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8 flex flex-col items-center transition-colors duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8 gap-4">
        <div>
            <h3 className="text-xl font-light tracking-wider text-white">
            KLANG-KÖRPER RESONANZ
            </h3>
            <span className="text-xs text-white/40 uppercase tracking-widest block mt-1">
            {isOuter ? "AUSSENFELD (POTENZIAL)" : "INNENFELD (RESSOURCE)"}
            </span>
        </div>

        <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
            <button
                onClick={() => setViewMode('inner')}
                className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                    !isOuter 
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                INNENFELD
            </button>
            <button
                onClick={() => setViewMode('outer')}
                className={cn(
                    "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                    isOuter 
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                AUSSENFELD
            </button>
        </div>
      </div>

      <div className="relative h-[800px] w-full max-w-md flex justify-center items-center">
        
        {/* SILHOUETTE (Abstract - Improved) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80 z-10" viewBox="0 0 400 800">
            <defs>
                <filter id="glow">
                    <feGaussianBlur stdDeviation="2.5" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
            </defs>
            {/* Head */}
            <path d="M 200 80 C 180 80, 165 95, 165 120 C 165 150, 180 160, 200 160 C 220 160, 235 150, 235 120 C 235 95, 220 80, 200 80 Z" 
                fill="rgba(255,255,255,0.05)" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Neck */}
            <path d="M 200 160 L 200 180" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Shoulders & Arms */}
            <path d="M 200 180 L 140 200 L 120 400" fill="none" stroke="white" strokeWidth="2" filter="url(#glow)" />
            <path d="M 200 180 L 260 200 L 280 400" fill="none" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Torso */}
            <path d="M 140 200 C 140 200, 150 350, 160 380" fill="none" stroke="white" strokeWidth="2" filter="url(#glow)" />
            <path d="M 260 200 C 260 200, 250 350, 240 380" fill="none" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Hips */}
            <path d="M 160 380 C 160 380, 200 400, 240 380" fill="none" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Legs */}
            <path d="M 170 390 L 160 750" stroke="white" strokeWidth="2" filter="url(#glow)" />
            <path d="M 230 390 L 240 750" stroke="white" strokeWidth="2" filter="url(#glow)" />
            
            {/* Navel Marker - Center of Universe */}
            <circle cx="200" cy="380" r="4" fill="white" filter="url(#glow)" />
            <circle cx="200" cy="380" r="10" fill="none" stroke="white" strokeWidth="1" opacity="0.8" />
        </svg>

        {/* AURA / WAVE VISUALIZATION */}
        <AnimatePresence mode="wait">
            <motion.svg 
                key={viewMode} // Re-render on mode change to animate
                className="absolute inset-0 w-full h-full overflow-visible" 
                viewBox="0 0 400 800"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
            >
                <defs>
                    <filter id="auraGlow">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    {/* Dynamic Gradients based on points color would be complex in SVG defs. 
                        Instead, we use a multi-stop gradient or simply use the dominant color. 
                        But user wants "Full Spectrum". 
                        To achieve full spectrum in a single path, we need a gradient that matches the points.
                        Since the path is continuous, we can use a linear gradient along the Y axis.
                    */}
                    <linearGradient id="spectrumGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                        {upperWave.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, upperWave.points.length - 1))) * 100}%`} stopColor={isOuter ? "#ffffff" : p.color} stopOpacity={isOuter ? 0.2 : 0.6} />
                        ))}
                    </linearGradient>
                    
                    <linearGradient id="spectrumGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
                         {lowerWave.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, lowerWave.points.length - 1))) * 100}%`} stopColor={isOuter ? "#ffffff" : p.color} stopOpacity={isOuter ? 0.2 : 0.6} />
                        ))}
                    </linearGradient>
                </defs>

                {/* Center Group at Navel (200, 380) */}
                <g transform="translate(200, 380)">
                    
                    {/* UPPER WAVE (Right Side) */}
                    <motion.path
                        d={upperWave.path}
                        fill="url(#spectrumGradientUp)"
                        stroke={isOuter ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}
                        strokeWidth="1"
                        filter="url(#auraGlow)"
                        transform="scale(1, -1)" 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* UPPER WAVE (Left Side - Mirrored) */}
                    <motion.path
                        d={upperWave.path}
                        fill="url(#spectrumGradientUp)"
                        stroke={isOuter ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}
                        strokeWidth="1"
                        filter="url(#auraGlow)"
                        transform="scale(-1, -1)" 
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                    {/* LOWER WAVE (Right Side) */}
                    <motion.path
                        d={lowerWave.path}
                        fill="url(#spectrumGradientDown)"
                        stroke={isOuter ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}
                        strokeWidth="1"
                        filter="url(#auraGlow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* LOWER WAVE (Left Side - Mirrored) */}
                    <motion.path
                        d={lowerWave.path}
                        fill="url(#spectrumGradientDown)"
                        stroke={isOuter ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.5)"}
                        strokeWidth="1"
                        filter="url(#auraGlow)"
                        transform="scale(-1, 1)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />

                </g>
            </motion.svg>
        </AnimatePresence>

      </div>
    </div>
  );
}
