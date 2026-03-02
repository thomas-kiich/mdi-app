import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TONES, ToneData } from '@/lib/tones';

interface SpectralMatrixProps {
  toneDistribution: Record<string, number>; // e.g. { "C": 10, "F": 30 ... }
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

export function SpectralMatrix({ toneDistribution }: SpectralMatrixProps) {
  
  // Prepare data sorted by SPECTRAL_ORDER
  const sortedData = useMemo(() => {
    return SPECTRAL_ORDER.map(toneName => {
      const toneInfo = TONES.find(t => t.name === toneName);
      const percentage = toneDistribution[toneName] || 0;
      
      return {
        name: toneName,
        percentage,
        color: toneInfo?.color || "#666",
        frequency: toneInfo?.frequency || 0
      };
    });
  }, [toneDistribution]);

  // Generate SVG path for the "Wave Diagram"
  // The path must go through the center of each bar column at the correct height
  const generatePath = (width: number, height: number) => {
    if (sortedData.length === 0) return "";

    const numPoints = sortedData.length;
    // We want the points to span from 0 to width.
    // Tone E (index 0) -> x = 0
    // Tone F (index 11) -> x = width
    // The others are equally spaced in between.
    
    const points = sortedData.map((d, i) => {
      // Linear interpolation for x: 0 to width
      const x = (i / (numPoints - 1)) * width;
      
      // Map percentage (0-100) to height (y). 0% -> height (bottom), 100% -> 0 (top)
      // Scale: Let's use 100% as full height.
      const normalizedH = Math.min(d.percentage * 2.5, 95); // Scale factor for visibility
      const y = height - (normalizedH / 100) * height;
      return { x, y };
    });

    // Start path at bottom left
    let path = `M 0 ${height}`;

    if (points.length > 0) {
        // Line to first point (Tone E at x=0)
        path += ` L ${points[0].x} ${points[0].y}`;

        // Cubic Bezier interpolation through all points
        for (let i = 0; i < points.length - 1; i++) {
            const p0 = points[i];
            const p1 = points[i + 1];
            
            // Control points for smooth curve (tension 0.5)
            // Since x spacing is uniform, we can use fixed offset
            const offset = (p1.x - p0.x) * 0.4;
            
            const cp1x = p0.x + offset;
            const cp1y = p0.y;
            const cp2x = p1.x - offset;
            const cp2y = p1.y;

            path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
        }
        
        // Line to last point base (bottom right)
        path += ` L ${points[points.length-1].x} ${height}`;
        // Close back to start
        path += ` L 0 ${height} Z`;
    }

    return path;
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-light tracking-wider text-white">
          SPEKTRALE RESONANZ-MATRIX
        </h3>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          E (BLAUVIOLETT) — F (MAGENTA)
        </span>
      </div>

      <div className="relative h-64 w-full rounded-lg overflow-hidden border border-white/5 bg-zinc-950">
        
        {/* 1. BACKGROUND: The Custom Gradient (User Palette) */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(to right, 
              #8A2BE2 0%,   /* E */
              #0a0a45 9%,   /* Dis */
              #4169E1 18%,  /* D */
              #40E0D0 27%,  /* Cis */
              #008000 36%,  /* C */
              #808000 45%,  /* H */
              #9ACD32 54%,  /* Ais */
              #FFFF00 63%,  /* A */
              #FFAE42 72%,  /* Gis */
              #FF4500 81%,  /* G */
              #FF0000 90%,  /* Fis */
              #FF00FF 100%  /* F */
            )`
          }}
        />

        {/* 2. GRID LINES (Vertical) & LABELS for each Tone (Equal Spacing) */}
        <div className="absolute inset-0 flex w-full pointer-events-none z-10 justify-between px-0">
          {sortedData.map((d, i) => (
            <div key={i} className="flex-1 h-full border-r border-white/5 last:border-r-0 flex flex-col justify-end items-center pb-2 relative group">
              <span className="text-[10px] text-white/50 font-mono mb-1 absolute bottom-6">{d.name}</span>
              <div 
                className="w-1.5 rounded-t-sm absolute bottom-0 transition-all duration-1000"
                style={{ 
                  height: '4px', 
                  backgroundColor: d.color,
                  boxShadow: `0 0 8px ${d.color}`
                }} 
              />
              {/* Tooltip for percentage */}
              {d.percentage > 0 && (
                <div className="absolute bottom-12 bg-black/90 text-white text-[9px] px-1.5 py-0.5 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                  {Math.round(d.percentage)}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. WAVE DIAGRAM: The Voice Shape */}
        
        <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="customRainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#8A2BE2" />
               <stop offset="9%" stopColor="#0a0a45" />
               <stop offset="18%" stopColor="#4169E1" />
               <stop offset="27%" stopColor="#40E0D0" />
               <stop offset="36%" stopColor="#008000" />
               <stop offset="45%" stopColor="#808000" />
               <stop offset="54%" stopColor="#9ACD32" />
               <stop offset="63%" stopColor="#FFFF00" />
               <stop offset="72%" stopColor="#FFAE42" />
               <stop offset="81%" stopColor="#FF4500" />
               <stop offset="90%" stopColor="#FF0000" />
               <stop offset="100%" stopColor="#FF00FF" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* The Wave Shape filled with Gradient */}
          <motion.path
            d={generatePath(1000, 300)}
            fill="url(#customRainbowGrad)"
            stroke="white"
            strokeWidth="1.5"
            strokeOpacity="0.5"
            filter="url(#glow)"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.85, pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* 4. Y-AXIS LABELS (%) */}
        <div className="absolute top-2 left-2 flex flex-col justify-between h-full pb-8 pointer-events-none">
           <div className="text-[9px] text-white/20 font-mono">100%</div>
           <div className="text-[9px] text-white/20 font-mono">50%</div>
           <div className="text-[9px] text-white/20 font-mono">0%</div>
        </div>

      </div>

      {/* LEGEND / EXPLANATION */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-white/40 font-light">
        <div className="text-left">
          <span style={{color: "#8A2BE2"}} className="font-bold">E (Blauviolett)</span>
        </div>
        <div className="text-center">
          <span style={{color: "#008000"}} className="font-bold">C (Grün)</span>
        </div>
        <div className="text-right">
          <span style={{color: "#FF00FF"}} className="font-bold">F (Magenta)</span>
        </div>
      </div>
    </div>
  );
}
