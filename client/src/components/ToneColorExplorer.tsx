import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId } from '@/lib/mdiToToneMapping';
import { colorMatrix } from '@/lib/colorMatrix';
import { Volume2, Info, Zap } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Method36Trainer } from "@/components/Method36Trainer";
import { AnimatePresence } from 'framer-motion';

interface ToneColorExplorerProps {
  mdiDistribution?: Record<string, number>;
  liveFrequency?: number;
}

export function ToneColorExplorer({ mdiDistribution, liveFrequency }: ToneColorExplorerProps) {
  const [hoveredSegment, setHoveredSegment] = useState<{ id: number, intensity: number, color: string, toneName: string, freq: number } | null>(null);
  const [selectedSegment, setSelectedSegment] = useState<{ id: number, intensity: number, color: string, toneName: string, freq: number } | null>(null);
  const [trainingMode, setTrainingMode] = useState<{ freq: number, tone: string, color: string, duration?: number } | null>(null);
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

  // Ref to track if we are currently hovering over the matrix container
  const isHoveringMatrixRef = useRef(false);

  // Auto-highlight based on live frequency
  useEffect(() => {
    if (!liveFrequency || liveFrequency <= 0) {
      if (!isHoveringMatrixRef.current && hoveredSegment && hoveredSegment.toneName === "Live") {
        setHoveredSegment(null);
      }
      return;
    }

    // Find closest frequency in our data
    let closestDist = Infinity;
    let closestId = 1;
    let closestFreq = frequencyData[0].frequency;
    
    frequencyData.forEach(item => {
      const dist = Math.abs(item.frequency - liveFrequency);
      if (dist < closestDist) {
        closestDist = dist;
        closestId = item.id;
        closestFreq = item.frequency;
      }
    });

    // We map the raw frequency directly since it is normalized to the octave in SpectralScanner
    // Wir können sehr großzügig sein mit der Distanz, da wir *immer* einen Ton anzeigen wollen, 
    // wenn das Mikrofon etwas aufnimmt (liveFrequency > 0).
    // Da die Oktave von ca. 88 bis 170 geht, sind 40Hz Distanz manchmal schon zu knapp am Rand.
    // Wir nehmen einfach immer den nächsten Ton, wenn liveFrequency > 0 ist.
    if (!isHoveringMatrixRef.current) {
      const color = colorMatrix[closestId]?.[100 as keyof typeof colorMatrix[typeof closestId]] || "#ff9900";
      // Only update if it actually changed to prevent too many re-renders
      setHoveredSegment(prev => {
          if (prev && prev.id === closestId && prev.toneName === "Live") return prev;
          return {
            id: closestId,
            intensity: 100,
            color: color || "#ff9900",
            toneName: "Live", // Special marker
            freq: closestFreq
          };
      });
    }
  }, [liveFrequency]);

  const playTone = (freq: number, intensity: number) => {
    if (!audioContextRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }

    const ctx = audioContextRef.current;
    const currentTime = ctx.currentTime;

    // Map intensity (25-100) to volume (0.05 - 0.3)
    const maxVol = 0.3;
    const minVol = 0.02;
    const targetVolume = minVol + ((intensity - 25) / 75) * (maxVol - minVol);

    // If we already have an oscillator, just smoothly transition frequency and volume
    if (oscillatorRef.current && gainNodeRef.current) {
      // Cancel any scheduled ramp downs
      gainNodeRef.current.gain.cancelScheduledValues(currentTime);
      
      // Smoothly glide to new frequency
      oscillatorRef.current.frequency.setTargetAtTime(freq, currentTime, 0.05);
      
      // Smoothly glide to new volume
      gainNodeRef.current.gain.setTargetAtTime(targetVolume, currentTime, 0.05);
      return;
    }

    // Otherwise create new oscillator
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, currentTime);

    // Smooth attack envelope
    gain.gain.setValueAtTime(0, currentTime);
    gain.gain.setTargetAtTime(targetVolume, currentTime, 0.1);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    
    oscillatorRef.current = osc;
    gainNodeRef.current = gain;
  };

  const stopTone = () => {
    if (gainNodeRef.current && audioContextRef.current) {
      const ctx = audioContextRef.current;
      const currentTime = ctx.currentTime;
      
      // Smooth release envelope
      gainNodeRef.current.gain.cancelScheduledValues(currentTime);
      gainNodeRef.current.gain.setTargetAtTime(0, currentTime, 0.1);
      
      // Only completely stop and disconnect if we actually leave the whole matrix
      // This allows continuous playing when moving between segments
      setTimeout(() => {
        if (!isHoveringMatrixRef.current && oscillatorRef.current) {
          try {
            oscillatorRef.current.stop();
            oscillatorRef.current.disconnect();
            oscillatorRef.current = null;
            if (gainNodeRef.current) {
              gainNodeRef.current.disconnect();
              gainNodeRef.current = null;
            }
          } catch (e) {
            // Ignore errors if already stopped
          }
        }
      }, 500);
    }
  };

  const handleMouseEnter = (id: number, intensity: number, color: string, freq: number) => {
    isHoveringMatrixRef.current = true;
    const toneName = getToneNameFromMdiId(id) || "Unbekannt";
    setHoveredSegment({ id, intensity, color, toneName, freq });
    playTone(freq, intensity);
  };

  const handleMouseLeave = () => {
    setHoveredSegment(null);
    // We don't call stopTone here immediately for each segment leave,
    // we handle the global stop on the container leave
  };

  const handleMatrixLeave = () => {
    isHoveringMatrixRef.current = false;
    setHoveredSegment(null);
    stopTone();
  };

  const handleSegmentClick = (id: number, intensity: number, color: string, freq: number) => {
    const toneName = getToneNameFromMdiId(id) || "Unbekannt";
    setSelectedSegment({ id, intensity, color, toneName, freq });
  };

  // Interval markers removed per user request

  // 100% at top, 25% at bottom to match typical Y-axis coordinates (or as requested)
  // The PDF shows 100% to 25% from top to bottom usually, let's match that.
  const intensities = [100, 75, 50, 25];
  const columns = Array.from({ length: 24 }, (_, i) => i + 1);

    return (
    <>
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <div className="w-4 h-4 rounded bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500" />
          LICHTKLANG MATRIX
        </CardTitle>
        <div className="text-sm text-zinc-400 mt-2 space-y-2">
          <p>
            Erkunde die 96 Farbsegmente der MDI-Matrix. Fahre mit der Maus über ein Segment, um den Code und den entsprechenden Ton in der jeweiligen Lautstärke zu hören (25% = leise, 100% = laut).
          </p>
          <div className="bg-zinc-800/50 p-3 rounded-lg border border-zinc-700/50">
            <h4 className="font-semibold text-orange-400 mb-1">So arbeitest du mit der Matrix:</h4>
            <ol className="list-decimal list-inside space-y-1">
              <li>Starte den Scanner (unten), um deine Stimme live in der Matrix sichtbar zu machen.</li>
              <li>Singe einen Ton. Das entsprechende Segment in der Matrix leuchtet rot auf.</li>
              <li>Klicke auf <strong>"DIESEN TON VERWENDEN"</strong>, um den aktuell erfassten Ton einzufrieren.</li>
              <li>Klicke auf das markierte Segment, um die Details zu öffnen und direkt in das YOHN-Training mit diesem Ton zu starten.</li>
            </ol>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* The Matrix */}
        <div className="w-full overflow-x-auto pb-4" onMouseLeave={handleMatrixLeave}>
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
                  
                  const isHovered = hoveredSegment?.id === col && hoveredSegment?.intensity === intensity;
                  let overlayClass = "";
                  if (isHovered) {
                    overlayClass = "border-2 border-white shadow-[0_0_15px_rgba(255,255,255,0.8)] z-20 scale-110";
                  } else if (hoveredSegment) {
                    // Dim others slightly when hovering
                    overlayClass = "opacity-40";
                  }

                  // Live frequency highlight
                  const isLiveMatch = hoveredSegment?.toneName === "Live" && hoveredSegment.id === col && intensity === 100;
                  if (isLiveMatch) {
                    overlayClass = "ring-4 ring-red-500 ring-inset shadow-[0_0_50px_rgba(239,68,68,1)] z-50 scale-125 border-2 border-white animate-pulse";
                  }

                  return (
                    <div
                      key={`cell-${col}-${intensity}`}
                      className={`flex-1 h-full cursor-pointer transition-all duration-200 relative ${overlayClass}`}
                      style={{ backgroundColor: color }}
                      onMouseEnter={() => handleMouseEnter(col, intensity, color, freq)}
                      onMouseLeave={handleMouseLeave}
                      onClick={() => handleSegmentClick(col, intensity, color, freq)}
                    >
                      {/* Optional: Add a subtle overlay for active/energy state if needed */}
                      {mdiDistribution && mdiDistribution[col.toString()] > 0 && !hoveredSegment && (
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
        <div className="h-24 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between px-6 mt-6">
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

    {/* Detail View Modal */}
      <Dialog open={!!selectedSegment} onOpenChange={(open) => !open && setSelectedSegment(null)}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3 text-2xl">
              <div 
                className="w-8 h-8 rounded shadow-lg" 
                style={{ backgroundColor: selectedSegment?.color }}
              />
              Segment {selectedSegment?.id.toString().padStart(2, '0')}/{selectedSegment?.intensity}
            </DialogTitle>
            <DialogDescription className="text-zinc-400">
              Detaillierte Analyse der Farb-Intensitäts-Kombination
            </DialogDescription>
          </DialogHeader>
          
          {selectedSegment && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Grundton</p>
                  <p className="text-lg font-semibold">{selectedSegment.toneName}</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Frequenz</p>
                  <p className="text-lg font-semibold">{selectedSegment.freq.toFixed(2)} Hz</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">Intensität</p>
                  <p className="text-lg font-semibold">{selectedSegment.intensity}%</p>
                </div>
                <div className="bg-black/50 p-4 rounded-lg border border-zinc-800/50">
                  <p className="text-xs text-zinc-500 mb-1">HEX Code</p>
                  <p className="text-lg font-mono">{selectedSegment.color}</p>
                </div>
              </div>
              
              <div className="bg-zinc-800/30 p-4 rounded-lg border border-zinc-700/50">
                <h4 className="font-medium text-orange-400 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" /> Philosophische Deutung
                </h4>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Die Intensität von {selectedSegment.intensity}% beim Ton {selectedSegment.toneName} repräsentiert 
                  {selectedSegment.intensity === 100 ? " die reinste, kraftvollste Ausprägung dieses Prinzips. Es steht für absolute Präsenz und ungetrübte Manifestation." : 
                   selectedSegment.intensity === 75 ? " eine starke, bewusste Ausrichtung. Die Energie ist aktiv, lässt aber Raum für Nuancen." :
                   selectedSegment.intensity === 50 ? " einen balancierten Zustand des Übergangs. Es ist der Bereich der Vermittlung zwischen Potenzial und Aktion." :
                   " die subtilste, tiefste Ebene. Hier wirkt das Prinzip eher unbewusst, als feines Potenzial oder sanfter Impuls im Hintergrund."}
                </p>
              </div>

              <Button 
                size="lg" 
                className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold h-12 text-xs"
                onClick={() => {
                  setTrainingMode({
                    freq: selectedSegment.freq,
                    tone: selectedSegment.toneName,
                    color: selectedSegment.color,
                    duration: 12
                  });
                  setSelectedSegment(null);
                }}
              >
                <Zap className="mr-2 h-4 w-4 fill-current shrink-0" />
                HIER KLICKEN - zum YOHNTRAINING mit deinem LEBENSKLANG
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Training Overlay */}
      <AnimatePresence>
          {trainingMode && (
              <div className="fixed inset-0 z-[100] bg-black">
                  <Method36Trainer 
                    frequency={trainingMode.freq}
                    toneName={trainingMode.tone}
                    color={trainingMode.color}
                    duration={trainingMode.duration}
                    onClose={() => setTrainingMode(null)}
                  />
              </div>
          )}
      </AnimatePresence>
    </>
  );
}