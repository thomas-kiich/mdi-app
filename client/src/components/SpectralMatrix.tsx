import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TONES, ToneData } from '@/lib/tones';

interface SpectralMatrixProps {
  toneDistribution: Record<string, number>; // e.g. { "C": 10, "F": 30 ... }
}

// User Requirement:
// "Der natürliche Farbverlauf des Regenbogens: VIOLETT-INDIGO-BLAU-GRÜN-GELB-ORANGE-ROT
// ... entspricht exakt der Tonfolge von E-DIS-D-CIS-C-H-AIS-A-GIS-G-FIS-F"

const SPECTRAL_ORDER = [
  "E",   // Violett
  "Dis", // Indigo
  "D",   // Blau
  "Cis", // Blau-Grün
  "C",   // Grün (Mitte)
  "H",   // Gelb-Grün
  "Ais", // Gelb
  "A",   // Gelb-Orange
  "Gis", // Orange
  "G",   // Rot-Orange
  "Fis", // Rot
  "F"    // Tiefrot
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

  // Generate SVG path for the "Mountain Range"
  // We need smooth curves between points.
  const generatePath = (width: number, height: number) => {
    if (sortedData.length === 0) return "";

    const stepX = width / (sortedData.length - 1);
    const points = sortedData.map((d, i) => {
      const x = i * stepX;
      // Map percentage (0-100) to height (y). 0% -> height (bottom), 100% -> 0 (top)
      // Scale: Let's say max visible is 50% for visual balance
      const normalizedH = Math.min(d.percentage * 3.5, 95); 
      const y = height - (normalizedH / 100) * height;
      return { x, y };
    });

    // Start path at bottom left
    let path = `M 0 ${height}`;

    // Curve to first point
    path += ` L ${points[0].x} ${points[0].y}`;

    // Cubic Bezier interpolation
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      
      // Control points for smooth curve
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0.y;
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1.y;

      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
    }

    // Close path at bottom right
    path += ` L ${width} ${height} Z`;

    return path;
  };

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-light tracking-wider text-white">
          SPEKTRALE RESONANZ-MATRIX
        </h3>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          VIOLETT (E) — ROT (F)
        </span>
      </div>

      <div className="relative h-64 w-full rounded-lg overflow-hidden border border-white/5">
        
        {/* 1. BACKGROUND: The Full Potential (Rainbow Gradient) */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `linear-gradient(to right, 
              #8b5cf6 0%,   /* E - Violet */
              #6366f1 9%,   /* Dis - Indigo */
              #3b82f6 18%,  /* D - Blue */
              #0d9488 27%,  /* Cis - Blue-Green */
              #22c55e 36%,  /* C - Green */
              #84cc16 45%,  /* H - Yellow-Green */
              #facc15 54%,  /* Ais - Yellow */
              #eab308 63%,  /* A - Yellow-Orange */
              #fb923c 72%,  /* Gis - Orange */
              #f97316 81%,  /* G - Red-Orange */
              #ef4444 90%,  /* Fis - Red */
              #9f1239 100%  /* F - Deep Red */
            )`
          }}
        />

        {/* 2. GRID LINES (Vertical) for each Tone */}
        <div className="absolute inset-0 flex justify-between px-4 sm:px-8 pointer-events-none z-10">
          {sortedData.map((d, i) => (
            <div key={i} className="h-full border-r border-white/5 flex flex-col justify-end items-center pb-2 w-0 relative group">
              <span className="text-[10px] text-white/50 font-mono mb-1 absolute bottom-6">{d.name}</span>
              <div 
                className="w-1 rounded-full absolute bottom-0 transition-all duration-1000"
                style={{ 
                  height: '4px', 
                  backgroundColor: d.color,
                  boxShadow: `0 0 10px ${d.color}`
                }} 
              />
              {/* Tooltip for percentage */}
              {d.percentage > 0 && (
                <div className="absolute bottom-10 bg-black/80 text-white text-[9px] px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {Math.round(d.percentage)}%
                </div>
              )}
            </div>
          ))}
        </div>

        {/* 3. MASK / FOREGROUND: The Reality (Voice Shape) */}
        
        <svg className="absolute inset-0 w-full h-full preserve-3d" viewBox="0 0 1000 300" preserveAspectRatio="none">
          <defs>
            <linearGradient id="rainbowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
               <stop offset="0%" stopColor="#8b5cf6" />
               <stop offset="9%" stopColor="#6366f1" />
               <stop offset="18%" stopColor="#3b82f6" />
               <stop offset="27%" stopColor="#0d9488" />
               <stop offset="36%" stopColor="#22c55e" />
               <stop offset="45%" stopColor="#84cc16" />
               <stop offset="54%" stopColor="#facc15" />
               <stop offset="63%" stopColor="#eab308" />
               <stop offset="72%" stopColor="#fb923c" />
               <stop offset="81%" stopColor="#f97316" />
               <stop offset="90%" stopColor="#ef4444" />
               <stop offset="100%" stopColor="#9f1239" />
            </linearGradient>
            
            <filter id="glow">
              <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>

          {/* The Wave Shape filled with Gradient */}
          <motion.path
            d={generatePath(1000, 300)}
            fill="url(#rainbowGrad)"
            stroke="white"
            strokeWidth="1"
            strokeOpacity="0.4"
            filter="url(#glow)"
            initial={{ opacity: 0, pathLength: 0 }}
            animate={{ opacity: 0.9, pathLength: 1 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
          />
        </svg>

        {/* 4. FREQUENCY LABELS (Hz) */}
        <div className="absolute top-2 right-4 text-right">
           <div className="text-[10px] text-white/30 font-mono">
             High Freq (Violet) ← → Low Freq (Red)
           </div>
        </div>

      </div>

      {/* LEGEND / EXPLANATION */}
      <div className="mt-4 grid grid-cols-3 gap-4 text-xs text-white/40 font-light">
        <div className="text-left">
          <span className="text-violet-400 font-bold">E (Violett)</span>: Transformation
        </div>
        <div className="text-center">
          <span className="text-green-400 font-bold">C (Grün)</span>: Herz-Zentrum
        </div>
        <div className="text-right">
          <span className="text-red-500 font-bold">F (Rot)</span>: Erleuchtung/Spirit
        </div>
      </div>
    </div>
  );
}
