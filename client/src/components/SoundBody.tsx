import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TONES, ToneData } from '@/lib/tones';

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
    
    // We want the points to span from bottom (feet) to top (head) or vice versa?
    // User says: "PEAK/Grundton setzt genau beim Nabel an. er entwickelt sich nach oben... Gleichzeitig die selbe welle nach unten"
    // So we need TWO waves mirrored from the center (Navel).
    // Let's assume Navel is at Y = height / 2.
    // Upward wave: Navel -> Head. Downward wave: Navel -> Feet.
    // The wave shape itself is defined by the sortedData (E -> F).
    // Which end is at the Navel?
    // "Grundton setzt genau beim Nabel an." -> The fundamental (Dominant Tone) is at the Navel.
    // But the wave is a spectrum (E...F). We can't just put one tone at the Navel and the rest elsewhere unless we shift the spectrum.
    // However, the user says "er entwickelt sich nach oben...".
    // Maybe the user means the *amplitude* of the wave at the Navel is the Dominant Tone's amplitude?
    // Let's map the entire spectrum (E to F) along the vertical axis (Navel to Head), and mirror it (Navel to Feet).
    // The "Navel" is the starting point (E? or F? or Center of Spectrum?).
    // User: "Grundton setzt genau beim Nabel an."
    // If the Dominant Tone is F#, then F# is at the Navel.
    // This implies a SHIFT of the spectrum so that the Dominant Tone is at the center (Navel).
    // Let's try to shift the `sortedData` so that `dominantToneName` is at index 0 (Navel).
    
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
      const normalizedW = Math.min(d.percentage * 3, 100); // Scale factor
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

  const upperWave = generateVerticalPath(maxWidth, headHeight);
  const lowerWave = generateVerticalPath(maxWidth, feetHeight);

  if (!upperWave || !lowerWave) return null;

  return (
    <div className="w-full bg-black/40 backdrop-blur-md border border-white/10 rounded-xl p-6 mt-8 flex flex-col items-center">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="text-xl font-light tracking-wider text-white">
          KLANG-KÖRPER RESONANZ
        </h3>
        <span className="text-xs text-white/40 uppercase tracking-widest">
          INNENFELD & AUSSENFELD
        </span>
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
        <svg className="absolute inset-0 w-full h-full overflow-visible" viewBox="0 0 400 800">
            <defs>
                <filter id="auraGlow">
                    <feGaussianBlur stdDeviation="6" result="coloredBlur"/>
                    <feMerge>
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                    </feMerge>
                </filter>
                
                <linearGradient id="auraGradientUp" x1="0%" y1="100%" x2="0%" y2="0%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.2" />
                </linearGradient>
                <linearGradient id="auraGradientDown" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#8A2BE2" stopOpacity="0.2" />
                </linearGradient>
            </defs>

            {/* Center Group at Navel (200, 380) */}
            <g transform="translate(200, 380)">
                
                {/* UPPER WAVE (Right Side) */}
                <motion.path
                    d={upperWave.path}
                    fill="url(#auraGradientUp)"
                    stroke="white"
                    strokeWidth="1"
                    filter="url(#auraGlow)"
                    transform="scale(1, -1)" 
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 0.8, scale: 1 }} 
                />
                 {/* UPPER WAVE (Left Side - Mirrored) */}
                 <motion.path
                    d={upperWave.path}
                    fill="url(#auraGradientUp)"
                    stroke="white"
                    strokeWidth="1"
                    filter="url(#auraGlow)"
                    transform="scale(-1, -1)" 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                />

                {/* LOWER WAVE (Right Side) */}
                <motion.path
                    d={lowerWave.path}
                    fill="url(#auraGradientDown)"
                    stroke="white"
                    strokeWidth="1"
                    filter="url(#auraGlow)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                />
                {/* LOWER WAVE (Left Side - Mirrored) */}
                <motion.path
                    d={lowerWave.path}
                    fill="url(#auraGradientDown)"
                    stroke="white"
                    strokeWidth="1"
                    filter="url(#auraGlow)"
                    transform="scale(-1, 1)"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.8 }}
                />

            </g>
        </svg>

      </div>
    </div>
  );
}
