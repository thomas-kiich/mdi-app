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
    // Only UP (Head): Ascending Scale. Start at Nabelpunkt, end exactly one octave higher exactly between Nabel and Zirbeldrüse (Herzpunkt).
    // That means we need exactly 13 points (the base tone + 12 semitones = the octave tone again).
    
    let directionalData: typeof sortedData = [];

    if (direction === -1) {
        // UP (Head): Ascending.
        // We need 13 points to complete the octave (e.g. F -> Fis -> G ... -> F)
        const octavePoints = 13;
        for (let i = 0; i < octavePoints; i++) {
            let idx = domIndex - i;
            // Handle negative indices by wrapping around
            while (idx < 0) idx += numPoints;
            directionalData.push(sortedData[idx % numPoints]);
        }
    } else {
        // We no longer render the downward wave, but keep this for safety
        directionalData = [];
    }

    // Now map this directional spectrum from Navel (y=0 relative) to Head/Feet
    // We need points for the path.
    const numActualPoints = directionalData.length;
    const points = directionalData.map((d, i) => {
      // Linear interpolation for y: 0 (Navel) to height (Head/Feet)
      // We use numActualPoints - 1 so the last point hits exactly the top height
      const rawY = numActualPoints > 1 ? (i / (numActualPoints - 1)) * height : 0;
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

  // Precise Anatomical Heights relative to Nabelpunkt (0,0)
  // New SVG Coordinates:
  // Zirbeldrüse: cy=100
  // Herzpunkt: cy=200
  // Nabelpunkt: cy=300
  
  // The wave should span from Nabelpunkt (300) to Herzpunkt (200).
  // Distance = 300 - 200 = 100.
  const waveHeight = 100; 
  const headHeight = waveHeight; 
  
  // We no longer render the feet part, but keep a variable for safety
  const feetHeight = 0; 
  const maxWidth = 160;   // Max width of the aura

  // Determine what to render based on viewMode
  const renderInner = viewMode === 'inner' || viewMode === 'both' || viewMode === 'art' || viewMode === 'vision';
  const renderOuter = viewMode === 'outer' || viewMode === 'both' || viewMode === 'art' || viewMode === 'vision';
  const isArtMode = viewMode === 'art';
  const isVisionMode = viewMode === 'vision';

  // Generate paths for INNER Field (Only UP)
  const innerUpperRight = generateVerticalPath(maxWidth, headHeight, false, -1, 1);
  const innerUpperLeft = generateVerticalPath(maxWidth, headHeight, false, -1, -1);

  // Generate paths for OUTER Field (Only UP)
  const outerUpperRight = generateVerticalPath(maxWidth, headHeight, true, -1, 1);
  const outerUpperLeft = generateVerticalPath(maxWidth, headHeight, true, -1, -1);

  // Use the appropriate path for the main "isOuter" check in gradients if only one is shown,
  // but for "both", we need separate gradients.
  // We will define gradients for both Inner and Outer.
  
  if (!innerUpperRight.path) return null;

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
                    {/* OUTER FIELD GRADIENTS */}
                    <linearGradient id="outerGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                        {outerUpperRight.points.map((p, i) => (
                             <stop key={i} offset={`${(i / (Math.max(1, outerUpperRight.points.length - 1))) * 100}%`} stopColor={getComplementaryColor(p.color)} stopOpacity={0.5} />
                        ))}
                    </linearGradient>
                </defs>

                {/* Center Group at Nabelpunkt (224, 300) to match new SVG */}
                <g transform="translate(224, 300)">
                    
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

                        </>
                    )}

                    {/* INNER FIELD LAYERS */}
                    {(!isVisionMode && renderInner) && (
                        <>
                            {/* UPPER */}
                            <motion.path key="innerUR" d={innerUpperRight.path} fill="url(#innerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />
                            <motion.path key="innerUL" d={innerUpperLeft.path} fill="url(#innerGradientUp)" stroke={isArtMode ? "none" : "rgba(255,255,255,0.5)"} strokeWidth="1" filter={isArtMode ? "url(#artBlur)" : "url(#auraGlow)"} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} />

                        </>
                    )}
                    </AnimatePresence>
                    
                    {/* BOUNDARY HIGHLIGHT FOR 'BOTH' MODE */}
                    {viewMode === 'both' && (
                        <>
                             {/* Re-draw the wave line with brighter stroke to highlight the meeting point */}
                             <motion.path d={innerUpperRight.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />
                             <motion.path d={innerUpperLeft.path} fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="1.5" filter="url(#auraGlow)" />

                        </>
                    )}

                </g>
            </motion.svg>

      {/* HUMAN BODY SILHOUETTE OVERLAY - Hidden in Vision Mode */}
      {!isVisionMode && (
          <div className="absolute inset-0 pointer-events-none flex justify-center items-start opacity-100">
             {/* Anatomical Human Silhouette SVG */}
             <svg width="400" height="800" viewBox="0 0 400 800" className="opacity-40">
                <g transform="translate(100, 80) scale(1.5)">
                    {/* Head */}
                    <path d="M66.5 12c0-8.8 7.2-16 16-16s16 7.2 16 16c0 6.6-4 12.3-9.7 14.7-1.4 3.5-3.3 6.3-6.3 6.3s-4.9-2.8-6.3-6.3C70.5 24.3 66.5 18.6 66.5 12z" fill="none" stroke="white" strokeWidth="1.5" />
                    
                    {/* Neck and Shoulders */}
                    <path d="M78 33v8c-10 2-25 5-32 12-4 4-6 10-6 16v12h10V69c0-4 2-8 5-10 6-5 16-8 23-9h8c7 1 17 4 23 9 3 2 5 6 5 10v12h10V69c0-6-2-12-6-16-7-7-22-10-32-12v-8h-8z" fill="none" stroke="white" strokeWidth="1.5" />
                    
                    {/* Torso */}
                    <path d="M56 69v60c0 15 10 25 15 30v20c-5-2-10-5-15-10v-30c-5-5-10-15-10-30V69h10z" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M109 69v60c0 15-10 25-15 30v20c5-2 10-5 15-10v-30c5-5 10-15 10-30V69h-10z" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M71 179v-20c-5-5-15-15-15-30V69h53v60c0 15-10 25-15 30v20h-23z" fill="none" stroke="white" strokeWidth="1.5" />
                    
                    {/* Arms */}
                    <path d="M40 69v60c0 10 5 20 10 25v30c0 5-2 10-5 15-2 3-5 5-10 5s-8-2-10-5c-3-5-5-10-5-15V69h20z" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M125 69v60c0 10-5 20-10 25v30c0 5 2 10 5 15 2 3 5 5 10 5s8-2 10-5c3-5 5-10 5-15V69h-20z" fill="none" stroke="white" strokeWidth="1.5" />
                    
                    {/* Legs */}
                    <path d="M71 179v100c0 10-5 20-10 25v50c0 5-2 10-5 15-2 3-5 5-10 5s-8-2-10-5c-3-5-5-10-5-15v-50c0-10 5-20 10-25v-80h30z" fill="none" stroke="white" strokeWidth="1.5" />
                    <path d="M94 179v100c0 10 5 20 10 25v50c0 5 2 10 5 15 2 3 5 5 10 5s8-2 10-5c3-5 5-10 5-15v-50c0-10-5-20-10-25v-80h-30z" fill="none" stroke="white" strokeWidth="1.5" />
                </g>
                
                {/* Spine/Central Axis */}
                <line x1="224" y1="120" x2="224" y2="350" stroke="white" strokeWidth="1" strokeDasharray="2 4" opacity="0.4" />
                
                {/* Energy Centers (Chakras/Points) */}
                {/* Zirbeldrüse (Pineal Gland) - roughly center of head */}
                <g className="opacity-100">
                    <circle cx="224" cy="100" r="4" fill="#fff" />
                    <circle cx="224" cy="100" r="8" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="232" y1="100" x2="270" y2="100" stroke="white" strokeWidth="0.5" strokeDasharray="1 2" />
                    <text x="275" y="103" fill="white" fontSize="10" fontFamily="monospace" letterSpacing="1">ZIRBELDRÜSE</text>
                </g>

                {/* Herzpunkt (Heart Center) - middle of chest */}
                <g className="opacity-100">
                    <circle cx="224" cy="200" r="4" fill="#fff" />
                    <circle cx="224" cy="200" r="8" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="232" y1="200" x2="270" y2="200" stroke="white" strokeWidth="0.5" strokeDasharray="1 2" />
                    <text x="275" y="203" fill="white" fontSize="10" fontFamily="monospace" letterSpacing="1">HERZPUNKT</text>
                </g>

                {/* Nabelpunkt (Navel Center) - belly area */}
                <g className="opacity-100">
                    <circle cx="224" cy="300" r="4" fill="#fff" />
                    <circle cx="224" cy="300" r="8" fill="none" stroke="#fff" strokeWidth="0.5" opacity="0.5" />
                    <line x1="232" y1="300" x2="270" y2="300" stroke="white" strokeWidth="0.5" strokeDasharray="1 2" />
                    <text x="275" y="303" fill="white" fontSize="10" fontFamily="monospace" letterSpacing="1">NABELPUNKT</text>
                </g>
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
