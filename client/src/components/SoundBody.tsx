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
    if (sortedData.length === 0) return "";

    const numPoints = sortedData.length;
    
    // Find index of dominant tone
    const domIndex = sortedData.findIndex(d => d.name === dominantToneName);
    if (domIndex === -1) return "";

    // Rotate the array so dominant tone is first
    const rotatedData = [
      ...sortedData.slice(domIndex),
      ...sortedData.slice(0, domIndex)
    ];

    // Now map this rotated spectrum from Navel (y=0 relative) to Head (y=max relative)
    // We need points for the path.
    const points = rotatedData.map((d, i) => {
      // Linear interpolation for y: 0 (Navel) to height (Head/Feet)
      const y = (i / (numPoints - 1)) * height;
      
      // Map percentage (0-100) to width (x). 
      // 0% -> 0 width (center line), 100% -> max width
      // If INVERT (Outer Field), we show 100 - percentage
      // But we need to handle the scaling carefully.
      // Inner Field: 0% -> 0 width, 100% -> max width
      // Outer Field: 0% -> max width, 100% -> 0 width (missing potential)
      // Actually, "Outer Field" is what is MISSING. So if I have 10% Inner, I have 90% Outer.
      
      let val = d.percentage;
      if (invert) {
          // For Outer Field, we visualize the GAP.
          // If percentage is 0, gap is 100. If percentage is 100, gap is 0.
          // However, usually percentages sum to 100 total across all tones? 
          // No, here 'percentage' is the relative strength in the distribution.
          // The sum of all toneDistribution values is 100.
          // So the max possible value for a single tone is 100 (if it's the only tone).
          // But typically peaks are around 20-40%.
          // If we just do 100 - val, we get huge values everywhere.
          // We should probably normalize or just invert the shape visually relative to a "full" cylinder.
          // Let's assume a "Full Potential" is a straight cylinder of width 100.
          // Inner Field is the shape inside. Outer Field is the shape outside?
          // Or simply: Outer Field value = (Max Observed % in dataset) - current %.
          // Or better: Outer Field = 100 - (val * scale).
          // Let's stick to the "Inverse Wave" concept: 
          // Where there is a peak in Inner, there is a valley in Outer.
          
          // Let's try: val = 30 (max typical) - val. 
          // If val > 30, result is 0.
          // This might be too arbitrary.
          
          // Let's use a simple inversion relative to a fixed "100%" width reference.
          // If we assume the max width represents 100% potential (which is rare to reach for one tone),
          // then Outer Field is simply 100 - val.
          // But since val is usually small (e.g. 5-10%), 100-val is huge (90-95%).
          // This would make the Outer Field look like a giant block with small holes.
          // Maybe that's the point? "You are mostly empty space / potential".
          
          // Alternative interpretation: 
          // Outer Field is the COMPLEMENTARY shape.
          // Let's try mapping 100 - val, but maybe scale the visualization so it fits nicely.
          // Let's cap the visual width at 100 units.
          
          val = 100 - val; // Invert
      }
      
      // Scale factor:
      // Inner: val * 3 (so 33% fills the width)
      // Outer: val is now large (e.g. 90). 90 * 3 = 270. Too big.
      // We need a different scale for Outer if we want it to look comparable.
      // Or we just use the same scale and let it be big?
      // Let's use a dynamic scale based on the view mode.
      
      let normalizedW = 0;
      if (!invert) {
          normalizedW = Math.min(val * 3, 100); 
      } else {
          // For outer field, we want to see the "negative space".
          // If Inner is 10%, Outer is 90%.
          // If we map 90% to width, it should be wide.
          // Let's scale it down a bit so it fits.
          // Maybe max width corresponds to 100%?
          normalizedW = Math.min(val, 100); 
      }
      
      const x = (normalizedW / 100) * width;
      return { x, y, color: d.color };
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

  const headHeight = 250; // Length from Navel to Head
  const feetHeight = 350; // Length from Navel to Feet (longer legs)
  const maxWidth = 150;   // Max width of the aura

  const isOuter = viewMode === 'outer';
  const upperWave = generateVerticalPath(maxWidth, headHeight, isOuter);
  const lowerWave = generateVerticalPath(maxWidth, feetHeight, isOuter);

  if (!upperWave || !lowerWave) return null;

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

      <div className="relative h-[700px] w-full max-w-md flex justify-center items-center">
        
        {/* SILHOUETTE (Abstract) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" viewBox="0 0 400 800">
            {/* Head */}
            <circle cx="200" cy="100" r="40" fill="none" stroke="white" strokeWidth="2" />
            {/* Body Line */}
            <path d="M 200 140 L 200 450" stroke="white" strokeWidth="2" />
            {/* Shoulders */}
            <path d="M 160 160 L 240 160" stroke="white" strokeWidth="2" />
            {/* Arms */}
            <path d="M 160 160 L 140 350" stroke="white" strokeWidth="2" />
            <path d="M 240 160 L 260 350" stroke="white" strokeWidth="2" />
            {/* Hips */}
            <path d="M 170 450 L 230 450" stroke="white" strokeWidth="2" />
            {/* Legs */}
            <path d="M 170 450 L 160 750" stroke="white" strokeWidth="2" />
            <path d="M 230 450 L 240 750" stroke="white" strokeWidth="2" />
            
            {/* Navel Marker */}
            <circle cx="200" cy="380" r="4" fill="white" />
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
                        <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <linearGradient id="auraGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                        <stop offset="0%" stopColor={isOuter ? "#FFFFFF" : "#FFFFFF"} stopOpacity={isOuter ? 0.4 : 0.8} />
                        <stop offset="100%" stopColor={isOuter ? "#888888" : "#8A2BE2"} stopOpacity={isOuter ? 0.1 : 0.2} />
                    </linearGradient>
                    <linearGradient id="auraGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={isOuter ? "#FFFFFF" : "#FFFFFF"} stopOpacity={isOuter ? 0.4 : 0.8} />
                        <stop offset="100%" stopColor={isOuter ? "#888888" : "#8A2BE2"} stopOpacity={isOuter ? 0.1 : 0.2} />
                    </linearGradient>
                </defs>

                {/* Center Group at Navel (200, 380) */}
                <g transform="translate(200, 380)">
                    
                    {/* UPPER WAVE (Right Side) */}
                    <motion.path
                        d={upperWave.path}
                        fill="url(#auraGradientUp)"
                        stroke={isOuter ? "rgba(255,255,255,0.5)" : "white"}
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
                        fill="url(#auraGradientUp)"
                        stroke={isOuter ? "rgba(255,255,255,0.5)" : "white"}
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
                        fill="url(#auraGradientDown)"
                        stroke={isOuter ? "rgba(255,255,255,0.5)" : "white"}
                        strokeWidth="1"
                        filter="url(#auraGlow)"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                    {/* LOWER WAVE (Left Side - Mirrored) */}
                    <motion.path
                        d={lowerWave.path}
                        fill="url(#auraGradientDown)"
                        stroke={isOuter ? "rgba(255,255,255,0.5)" : "white"}
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
