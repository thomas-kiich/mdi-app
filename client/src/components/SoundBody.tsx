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
  const [viewMode, setViewMode] = useState<'inner' | 'outer' | 'both' | 'art' | 'vision'>('inner');
  const [visionPrompt, setVisionPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
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
    // Handle ranges like "C - D" by taking the first part
    const cleanDominantName = dominantToneName.split(' - ')[0].split('/')[0].trim();
    
    let domIndex = sortedData.findIndex(d => d.name === cleanDominantName);
    
    // Fallback: if still not found, try to find a partial match or default to first
    if (domIndex === -1) {
        domIndex = sortedData.findIndex(d => dominantToneName.includes(d.name));
    }
    
    // Last resort: default to 0 (E) if nothing matches, to ensure visualization always appears
    if (domIndex === -1) domIndex = 0;

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
        // Start at domIndex (which is at the navel), then domIndex-1, domIndex-2...
        
        for (let i = 0; i < numPoints; i++) {
            let idx = domIndex - i;
            if (idx < 0) idx += numPoints; // Wrap around
            directionalData.push(sortedData[idx]);
        }
    } else {
        // DOWN (Feet): Descending.
        // Since the list is Descending, we traverse it FORWARDS.
        // Start at domIndex (which is at the navel), then domIndex+1, domIndex+2...
        
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
  // Center is now at y=420. Head is around y=130. 420 - 130 = 290
  const headHeight = 290; 
  // Feet/Soles: Navel to Soles. Soles are around y=750. 750 - 420 = 330
  const feetHeight = 330; 
  const maxWidth = 160;   // Max width of the aura

  // Determine what to render based on viewMode
  const renderInner = viewMode === 'inner' || viewMode === 'both' || viewMode === 'art' || viewMode === 'vision';
  const renderOuter = viewMode === 'outer' || viewMode === 'both' || viewMode === 'art' || viewMode === 'vision';
  const isArtMode = viewMode === 'art';
  const isVisionMode = viewMode === 'vision';

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
            {viewMode === 'art' && "SEELENBILD (ART MODE)"}
            {viewMode === 'vision' && "VISIONS-GENERATOR"}
            </span>
        </div>

        <div className="flex bg-zinc-900/80 p-1 rounded-lg border border-zinc-800 overflow-x-auto max-w-full">
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
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all ml-1",
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
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all ml-1",
                    viewMode === 'both'
                        ? "bg-white text-black shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                GANZHEIT
            </button>
            <button
                onClick={() => setViewMode('art')}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all ml-1",
                    viewMode === 'art'
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                ART
            </button>
            <button
                onClick={() => setViewMode('vision')}
                className={cn(
                    "px-3 py-1.5 text-xs font-medium rounded-md transition-all ml-1",
                    viewMode === 'vision'
                        ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-sm" 
                        : "text-zinc-400 hover:text-white"
                )}
            >
                VISION
            </button>
        </div>
      </div>

      <div className="relative w-full h-[600px] flex justify-center items-center overflow-hidden bg-black/20 rounded-lg border border-white/5">
            {/* SVG Visualization */}
            <motion.svg
                viewBox="0 0 400 800" // Standardize viewport for body silhouette
                className="w-full h-full max-h-[800px] z-10"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1 }}
            >
                <defs>
                    <filter id="auraGlow">
                        <feGaussianBlur stdDeviation="8" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                    
                    <filter id="artBlur">
                        {/* Complex filter for Art Mode: Heavy blur + turbulence for organic feel */}
                        <feGaussianBlur stdDeviation="20" result="blur1" />
                        <feTurbulence type="fractalNoise" baseFrequency="0.015" numOctaves="2" result="noise" />
                        <feDisplacementMap in="blur1" in2="noise" scale="30" result="displaced" />
                        <feComposite operator="in" in="displaced" in2="SourceGraphic" result="composite" />
                         {/* Mix with original slightly to keep shape */}
                        <feMerge>
                             <feMergeNode in="blur1" />
                             <feMergeNode in="displaced" />
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

                {/* Center Group at Navel (200, 420) - adjusted from 380 to be lower, closer to actual navel/sacral area */}
                <g transform="translate(200, 420)">
                    
                    {/* VISION MODE BACKGROUND (Full Screen Energy) */}
                    {isVisionMode && (
                        <rect x="-200" y="-420" width="400" height="800" fill="url(#artBlur)" opacity="0.8" />
                    )}

                    <AnimatePresence>
                    {/* OUTER FIELD LAYERS */}
                    {(!isVisionMode && renderOuter) && (
                        <>
                            {/* UPPER */}
                            <motion.path key="outerUR" d={outerUpperRight.path} fill="url(#outerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.3)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: isArtMode ? 0.8 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="outerUL" d={outerUpperLeft.path} fill="url(#outerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.3)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: isArtMode ? 0.8 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            {/* LOWER */}
                            <motion.path key="outerLR" d={outerLowerRight.path} fill="url(#outerGradientDown)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.3)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: isArtMode ? 0.8 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="outerLL" d={outerLowerLeft.path} fill="url(#outerGradientDown)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.3)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: isArtMode ? 0.8 : 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                        </>
                    )}

                    {/* INNER FIELD LAYERS */}
                    {(!isVisionMode && renderInner) && (
                        <>
                            {/* UPPER */}
                            <motion.path key="innerUR" d={innerUpperRight.path} fill="url(#innerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="innerUL" d={innerUpperLeft.path} fill="url(#innerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            {/* LOWER */}
                            <motion.path key="innerLR" d={innerLowerRight.path} fill="url(#innerGradientDown)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="innerLL" d={innerLowerLeft.path} fill="url(#innerGradientDown)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
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

      {/* HUMAN BODY SILHOUETTE OVERLAY - Hidden in Vision Mode */}
      {!isVisionMode && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-start opacity-100">
             {/* Simple SVG Silhouette */}
             <svg width="400" height="800" viewBox="0 0 400 800" className="opacity-60">
                {/* Head */}
                <circle cx="200" cy="130" r="30" fill="none" stroke="white" strokeWidth="1.5" />
                {/* Spine/Chakra Line */}
                <path d="M 200 160 L 200 420" stroke="white" strokeWidth="1" strokeDasharray="2 4" opacity="0.5" />
                {/* Shoulders */}
                <path d="M 160 170 Q 200 160 240 170" fill="none" stroke="white" strokeWidth="1.5" />
                {/* Arms */}
                <path d="M 160 170 L 140 300" stroke="white" strokeWidth="1" opacity="0.8" />
                <path d="M 240 170 L 260 300" stroke="white" strokeWidth="1" opacity="0.8" />
                {/* Torso Sides */}
                <path d="M 160 170 Q 150 295 165 420" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                <path d="M 240 170 Q 250 295 235 420" fill="none" stroke="white" strokeWidth="0.5" opacity="0.5" />
                {/* Hips / Navel Area */}
                <path d="M 165 420 L 235 420" stroke="white" strokeWidth="1" opacity="0.5" />
                {/* Navel Point */}
                <circle cx="200" cy="420" r="3" fill="white" opacity="0.8" />
                {/* Legs */}
                <line x1="180" y1="420" x2="170" y2="750" stroke="white" strokeWidth="1" opacity="0.8" />
                <line x1="220" y1="420" x2="230" y2="750" stroke="white" strokeWidth="1" opacity="0.8" />
             </svg>
          </div>
      )}

      {/* VISION MODE INTERFACE */}
      {isVisionMode && (
        <div className="absolute inset-0 flex flex-col justify-center items-center p-8 z-20 bg-black/20 backdrop-blur-sm">
            <motion.div 
                initial={{ opacity: 0, y: 20 }} 
                animate={{ opacity: 1, y: 0 }} 
                className="w-full max-w-md bg-black/80 border border-white/10 rounded-xl p-6 shadow-2xl backdrop-blur-md"
            >
                <h3 className="text-xl font-light text-white mb-4 text-center">VISIONS-GENERATOR</h3>
                <p className="text-xs text-zinc-400 mb-6 text-center">
                    Deine Frequenz-Aura dient als energetische Leinwand. Formuliere deine Vision und lade ein Foto hoch, um dich selbst in deiner vollendeten Energie zu sehen.
                </p>

                <div className="space-y-4">
                    <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1 block">Dein Foto (Optional)</label>
                        <div className="border border-dashed border-zinc-700 rounded-lg p-4 text-center hover:bg-zinc-900/50 transition-colors cursor-pointer">
                            <span className="text-zinc-400 text-sm">Foto hochladen oder hier ablegen</span>
                        </div>
                    </div>

                    <div>
                        <label className="text-xs uppercase tracking-wider text-zinc-500 mb-1 block">Deine Vision</label>
                        <textarea 
                            value={visionPrompt}
                            onChange={(e) => setVisionPrompt(e.target.value)}
                            placeholder="Ich stehe selbstbewusst auf einer großen Bühne und inspiriere tausende Menschen..."
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-white text-sm focus:outline-none focus:border-cyan-500 min-h-[100px]"
                        />
                    </div>

                    <Button 
                        onClick={() => {
                            setIsGenerating(true);
                            setTimeout(() => setIsGenerating(false), 3000);
                        }}
                        disabled={!visionPrompt || isGenerating}
                        className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white border-none py-6"
                    >
                        {isGenerating ? (
                            <span className="flex items-center gap-2">
                                <span className="animate-spin">◌</span> GENERIERE VISION...
                            </span>
                        ) : (
                            "VISION GENERIEREN"
                        )}
                    </Button>
                </div>
            </motion.div>
        </div>
      )}

      </div>
    </div>
  );
}
