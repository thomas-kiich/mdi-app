import React, { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TONES } from '@/lib/tones';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getComplementaryColor } from "@/lib/colors";

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
  const [viewMode, setViewMode] = useState<'inner' | 'outer' | 'both'>('inner');
  
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
  // generateVerticalPath:
  // width: max width of wave
  // height: length of wave (vertical)
  // isOuterField: true if rendering Outer Field (Key-Lock)
  // direction: -1 for UP (Head), 1 for DOWN (Feet)
  // side: 1 for Right, -1 for Left
  const generateVerticalPath = (width: number, height: number, isOuterField: boolean, direction: number, side: number) => {
    if (sortedData.length === 0) return { path: "", points: [] };

    const numPoints = sortedData.length;
    
    // Find index of dominant tone
    const domIndex = sortedData.findIndex(d => d.name === dominantToneName);
    if (domIndex === -1) return { path: "", points: [] };

    // Determine spectral direction based on body part (UP/DOWN)
    // The list 'sortedData' is ordered: E, Dis, D, Cis, C, H, Ais, A, Gis, G, Fis, F.
    // This is a DESCENDING chromatic scale (e.g. F -> E is a descending step if wrapping).
    // Or E -> Dis is descending.
    
    // User requirement:
    // UP (Head): Ascending Scale (F -> Fis -> G...)
    // DOWN (Feet): Descending Scale (F -> E -> Dis...)
    
    let directionalData: typeof sortedData = [];

    if (direction === -1) {
        // UP (Head): Ascending.
        // Since the list is Descending, we need to traverse it BACKWARDS to get Ascending order.
        // Start at domIndex, then domIndex-1, domIndex-2...
        
        for (let i = 0; i < numPoints; i++) {
            let idx = domIndex - i;
            if (idx < 0) idx += numPoints; // Wrap around
            directionalData.push(sortedData[idx]);
        }
    } else {
        // DOWN (Feet): Descending.
        // Since the list is Descending, we traverse it FORWARDS.
        // Start at domIndex, then domIndex+1, domIndex+2...
        
        for (let i = 0; i < numPoints; i++) {
            let idx = (domIndex + i) % numPoints; // Wrap around
            directionalData.push(sortedData[idx]);
        }
    }

    // Now map this directional spectrum from Navel (y=0 relative) to Head/Feet
    // We need points for the path.
    const points = directionalData.map((d, i) => {
      // Linear interpolation for y: 0 (Navel) to height (Head/Feet)
      // For Upper Wave (invertY=true), we go from 0 to -height
      // For Lower Wave (invertY=false), we go from 0 to +height
      const rawY = (i / (numPoints - 1)) * height;
      const y = rawY * direction;
      
      let val = d.percentage;
      // Note: We use d.percentage directly for both Inner and Outer fields now
      // to ensure the Key-Lock fit (Outer starts where Inner ends).
      
      // Scale factor:
      // Inner: val * 3 (so 33% fills the width)
      // Outer: val is large, so we scale it differently to fit nicely
      let normalizedW = 0;
      let offset = 0; // Key-Lock gap

      if (!isOuterField) {
          // INNER FIELD
          // Scale intensity to width. 
          // Max intensity (usually around 30-40%) should fill significant width.
          // Let's say 40% -> 100% width. Factor 2.5
          normalizedW = Math.min(val * 3.5, 100); 
          
          const x = (normalizedW / 100) * width * side;
          return { x, y, color: d.color, tone: d.name };
      } else {
          // OUTER FIELD (Key-Lock)
          // The wave is the INNER edge. The outer edge is straight.
          // We calculate the inner edge X position.
          // It should match the inner field's wave shape exactly, but be the "hole".
          // Inner field x = (val * 3.5 / 100) * width
          // So Outer field inner edge starts there.
          
          // We use the same calculation as Inner Field to get the boundary line
          const innerVal = Math.min(d.percentage * 3.5, 100);
          const x = (innerVal / 100) * width * side;
          
          return { x, y, color: d.color, tone: d.name };
      }
    });

    let path = "";

    if (!isOuterField) {
        // INNER FIELD: Standard wave shape from center outwards
        const startX = 0;
        path = `M ${startX} 0`;
        
        if (points.length > 0) {
            path += ` L ${points[0].x} ${points[0].y}`;
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                const cp1y = p0.y + (p1.y - p0.y) * 0.5;
                const cp1x = p0.x;
                const cp2y = p0.y + (p1.y - p0.y) * 0.5;
                const cp2x = p1.x;
                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
            }
            path += ` L ${startX} ${direction * height}`;
            path += ` L ${startX} 0 Z`;
        }
    } else {
        // OUTER FIELD: Rectangle with inner wave cutout
        // We draw the outer box first, then the wave as the inner edge
        
        const outerX = width * 1.2 * side; // Fixed outer edge (slightly wider than wave max to fit in view)
        const startY = 0;
        const endY = direction * height;
        
        // Start at inner wave top (Navel)
        if (points.length > 0) {
            // Start at the first point of the wave (Navel area)
            path = `M ${points[0].x} ${points[0].y}`;
            
            // Draw the wave (Inner Edge)
            for (let i = 0; i < points.length - 1; i++) {
                const p0 = points[i];
                const p1 = points[i + 1];
                
                // Control points for smooth curve
                const cp1y = p0.y + (p1.y - p0.y) * 0.5;
                const cp1x = p0.x;
                const cp2y = p0.y + (p1.y - p0.y) * 0.5;
                const cp2x = p1.x;
                
                path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
            }
            
            // From the last wave point (Head/Feet), draw line OUT to the box edge
            path += ` L ${outerX} ${endY}`;
            
            // Draw line UP/DOWN along the outer edge back to the Navel level (Y=0)
            path += ` L ${outerX} ${startY}`;
            
            // Close the shape by drawing line back to the first wave point
            path += ` Z`;
        }
    }

    return { path, points };
  };

  // Precise Anatomical Heights relative to Navel (0,0)
  // Head/Pineal: Navel to Nose Root (~260px in this scale)
  const headHeight = 260; 
  // Feet/Soles: Navel to Soles (~370px in this scale)
  const feetHeight = 370; 
  const maxWidth = 160;   // Max width of the aura

  // Determine what to render based on viewMode
  const renderInner = viewMode === 'inner' || viewMode === 'both';
  const renderOuter = viewMode === 'outer' || viewMode === 'both';

  // Generate paths for INNER Field
  const innerUpperRight = generateVerticalPath(maxWidth, headHeight, false, -1, 1);
  const innerUpperLeft = generateVerticalPath(maxWidth, headHeight, false, -1, -1);
  const innerLowerRight = generateVerticalPath(maxWidth, feetHeight, false, 1, 1);
  const innerLowerLeft = generateVerticalPath(maxWidth, feetHeight, false, 1, -1);

  // Generate paths for OUTER Field
  const outerUpperRight = generateVerticalPath(maxWidth, headHeight, true, -1, 1);
  const outerUpperLeft = generateVerticalPath(maxWidth, headHeight, true, -1, -1);
  const outerLowerRight = generateVerticalPath(maxWidth, feetHeight, true, 1, 1);
  const outerLowerLeft = generateVerticalPath(maxWidth, feetHeight, true, 1, -1);

  // Use the appropriate path for the main "isOuter" check in gradients if only one is shown,
  // but for "both", we need separate gradients.
  // We will define gradients for both Inner and Outer.
  
  if (!innerUpperRight.path || !innerLowerRight.path) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8 flex flex-col items-center transition-colors duration-500">
      
      <div className="flex flex-col md:flex-row justify-between items-center w-full mb-8 gap-4">
        <div>
            <h3 className="text-xl font-light tracking-wider text-white">
            KLANG-KÖRPER RESONANZ
            </h3>
            <span className="text-xs text-white/40 uppercase tracking-widest block mt-1">
            {viewMode === 'inner' && "INNENFELD (RESSOURCE)"}
            {viewMode === 'outer' && "AUSSENFELD (POTENZIAL)"}
            {viewMode === 'both' && "GANZHEIT (INTEGRATION)"}
            </span>
        </div>

        <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800">
            <button
                onClick={() => setViewMode('inner')}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === 'inner'
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                INNEN
            </button>
            <button
                onClick={() => setViewMode('outer')}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === 'outer'
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                AUSSEN
            </button>
            <button
                onClick={() => setViewMode('both')}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
                    viewMode === 'both'
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                GANZHEIT
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
            
            {/* Nose Root Marker - Center of Spirit */}
            <circle cx="200" cy="120" r="3" fill="white" filter="url(#glow)" opacity="0.8" />
            
            {/* Soles Line - Grounding */}
            <line x1="140" y1="750" x2="260" y2="750" stroke="white" strokeWidth="1" opacity="0.5" strokeDasharray="4 4" />
        </svg>

        {/* AURA / WAVE VISUALIZATION */}
        <motion.svg 
            className="absolute inset-0 w-full h-full overflow-visible" 
            viewBox="0 0 400 800"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
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
                    {/* INNER FIELD GRADIENTS */}
                    <linearGradient id="innerGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                        {innerUpperRight.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, innerUpperRight.points.length - 1))) * 100}%`} stopColor={p.color} stopOpacity={0.6} />
                        ))}
                    </linearGradient>
                    <linearGradient id="innerGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
                         {innerLowerRight.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, innerLowerRight.points.length - 1))) * 100}%`} stopColor={p.color} stopOpacity={0.6} />
                        ))}
                    </linearGradient>

                    {/* OUTER FIELD GRADIENTS */}
                    <linearGradient id="outerGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                        {outerUpperRight.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, outerUpperRight.points.length - 1))) * 100}%`} stopColor={getComplementaryColor(p.color)} stopOpacity={0.5} />
                        ))}
                    </linearGradient>
                    <linearGradient id="outerGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
                         {outerLowerRight.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, outerLowerRight.points.length - 1))) * 100}%`} stopColor={getComplementaryColor(p.color)} stopOpacity={0.5} />
                        ))}
                    </linearGradient>
                </defs>

                {/* Center Group at Navel (200, 380) */}
                <g transform="translate(200, 380)">
                    
                    <AnimatePresence>
                    {/* OUTER FIELD LAYERS (Render first so they are behind if overlapping, though they shouldn't overlap) */}
                    {renderOuter && (
                        <>
                            {/* UPPER */}
                            <motion.path key="outerUR" d={outerUpperRight.path} fill="url(#outerGradientUp)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="outerUL" d={outerUpperLeft.path} fill="url(#outerGradientUp)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            {/* LOWER */}
                            <motion.path key="outerLR" d={outerLowerRight.path} fill="url(#outerGradientDown)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="outerLL" d={outerLowerLeft.path} fill="url(#outerGradientDown)" stroke="rgba(255,255,255,0.3)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                        </>
                    )}

                    {/* INNER FIELD LAYERS */}
                    {renderInner && (
                        <>
                            {/* UPPER */}
                            <motion.path key="innerUR" d={innerUpperRight.path} fill="url(#innerGradientUp)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="innerUL" d={innerUpperLeft.path} fill="url(#innerGradientUp)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            {/* LOWER */}
                            <motion.path key="innerLR" d={innerLowerRight.path} fill="url(#innerGradientDown)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="innerLL" d={innerLowerLeft.path} fill="url(#innerGradientDown)" stroke="rgba(255,255,255,0.5)" strokeWidth="1" filter="url(#auraGlow)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                        </>
                    )}
                    </AnimatePresence>
                    
                    {/* BOUNDARY HIGHLIGHT FOR 'BOTH' MODE */}
                    {viewMode === 'both' && (
                        <>
                             {/* Re-draw the wave line with brighter stroke to highlight the meeting point */}
                             <motion.path d={innerUpperRight.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />
                             <motion.path d={innerUpperLeft.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />
                             <motion.path d={innerLowerRight.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />
                             <motion.path d={innerLowerLeft.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />
                        </>
                    )}

                </g>
            </motion.svg>

      </div>
    </div>
  );
}
