import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId } from '@/lib/mdiToToneMapping';
import { colorMatrix } from '@/lib/colorMatrix';
import { Volume2 } from 'lucide-react';

interface ToneColorExplorerProps {
  mdiDistribution?: Record<string, number>;
}

export function ToneColorExplorer({ mdiDistribution }: ToneColorExplorerProps) {
  const [hoveredSegment, setHoveredSegment] = useState<{ id: number, intensity: number, color: string, toneName: string, freq: number } | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // Initialize audio context on first interaction
  useEffect(() => {
    const initAudio = () => {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
    };
    window.addEventListener('click', initAudio, { once: true });
    return () => window.removeEventListener('click', initAudio);
  }, []);

  const playTone = (freq: number, intensity: number) => {
    if (!audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    // Stop previous tone
    if (oscillatorRef.current) {
      oscillatorRef.current.stop();
      oscillatorRef.current.disconnect();
    }
    if (gainNodeRef.current) {
      gainNodeRef.current.disconnect();
    }

    const osc = audioContextRef.current.createOscillator();
    const gain = audioContextRef.current.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioContextRef.current.currentTime);

    // Map intensity (25-100) to volume (0.05 - 0.3)
    // 25% = quiet, 100% = loud
    const maxVol = 0.3;
    const minVol = 0.02;
    const volume = minVol + ((intensity - 25) / 75) * (maxVol - minVol);

    // Smooth envelope to avoid clicks
    gain.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gain.gain.linearRampToValueAtTime(volume, audioContextRef.current.currentTime + 0.1);

    osc.connect(gain);
    gain.connect(audioContextRef.current.destination);

    osc.start();
    
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
  };

  const stopTone = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      gainNodeRef.current.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.1);
      setTimeout(() => {
        if (oscillatorRef.current) {
          oscillatorRef.current.stop();
          oscillatorRef.current.disconnect();
          oscillatorRef.current = null;
        }
      }, 150);
    }
  };

  const handleMouseEnter = (id: number, intensity: number, color: string, freq: number) => {
    const toneName = getToneNameFromMdiId(id) || "Unbekannt";
    setHoveredSegment({ id, intensity, color, toneName, freq });
    playTone(freq, intensity);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
    stopTone();
  };

  // 100% at top, 25% at bottom to match typical Y-axis coordinates (or as requested)
  // The PDF shows 100% to 25% from top to bottom usually, let's match that.
  const intensities = [100, 75, 50, 25];
  const columns = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
          Farblichtfeld Matrix
        </CardTitle>
        <p className="text-sm text-zinc-400 mt-2">
          Erkunde die 96 Farbsegmente der MDI-Matrix. Fahre mit der Maus über ein Segment, um den Code und den entsprechenden Ton in der jeweiligen Lautstärke zu hören (25% = leise, 100% = laut).
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* The Matrix */}
        <div className="w-full overflow-x-auto pb-4">
          <div className="min-w-[800px] flex flex-col">
            {/* Top labels (1-24) */}
            <div className="flex mb-2">
              <div className="w-12 shrink-0"></div> {/* Spacer for Y-axis labels */}
              {columns.map(col => (
                <div key={`label-${col}`} className="flex-1 text-center text-xs text-zinc-500 font-mono">
                  {col}
                </div>
              ))}
            </div>

            {/* Rows */}
            {intensities.map(intensity => (
              <div key={`row-${intensity}`} className="flex h-16 md:h-20 w-full group/row">
                {/* Y-axis label */}
                <div className="w-12 shrink-0 flex items-center justify-end pr-3 text-xs text-zinc-500 font-mono">
                  {intensity}%
                </div>
                
                {/* Cells */}
                {columns.map(col => {
                  const color = colorMatrix[col]?.[intensity as keyof typeof colorMatrix[typeof col]] || "#000000";
                  const freqItem = frequencyData.find(f => f.id === col);
                  const freq = freqItem?.frequency || 100;
                  
                  return (
                    <div
                      key={`cell-${col}-${intensity}`}
                      className="flex-1 h-full cursor-pointer transition-transform duration-100 hover:scale-110 hover:z-10 relative"
                      style={{ backgroundColor: color }}
                      onMouseEnter={() => handleMouseEnter(col, intensity, color, freq)}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Optional: Add a subtle overlay for active/energy state if needed */}
                      {mdiDistribution && mdiDistribution[col.toString()] > 0 && (
                        <div className="absolute inset-0 border-2 border-white/30 pointer-events-none" />
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Info Panel */}
        <div className="h-24 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between px-6">
          {hoveredSegment ? (
            <>
              <div className="flex items-center gap-6">
                <div 
                  className="w-12 h-12 rounded-full shadow-lg border border-white/20"
                  style={{ backgroundColor: hoveredSegment.color }}
                />
                <div>
                  <div className="text-2xl font-bold text-white font-mono tracking-wider">
                    {hoveredSegment.id.toString().padStart(2, '0')} / {hoveredSegment.intensity}%
                  </div>
                  <div className="text-sm text-zinc-400">
                    Ton: <span className="text-orange-400 font-medium">{hoveredSegment.toneName}</span> ({hoveredSegment.freq} Hz)
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3 text-zinc-500">
                <Volume2 className="w-5 h-5" />
                <div className="w-32 h-2 bg-zinc-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-orange-500 transition-all duration-300"
                    style={{ width: `${hoveredSegment.intensity}%` }}
                  />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full text-center text-zinc-500 italic">
              Fahre über ein Segment, um Details anzuzeigen
            </div>
          )}
        </div>

      </CardContent>
    </Card>
  );
}
