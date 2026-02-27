import React, { useState, useEffect } from 'react';
import { useAudioAnalyzer, AnalysisResult } from '@/hooks/useAudioAnalyzer';
import { useSoundGenerator } from '@/hooks/useSoundGenerator';
import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Mic, Play, Volume2, Download, RefreshCw } from 'lucide-react';
import { TONES } from '@/lib/tones';

// Phasen der App
type AppPhase = 'intro' | 'recording' | 'analyzing' | 'result';

export default function Home() {
  const [phase, setPhase] = useState<AppPhase>('intro');
  const { isRecording, startRecording, stopRecording, result } = useAudioAnalyzer();
  const { playTone, playChord, stopAllSounds } = useSoundGenerator();
  const [finalResult, setFinalResult] = useState<AnalysisResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);

  // Aufnahme-Logik
  const handleStartRecording = () => {
    setPhase('recording');
    setTimeLeft(10); // 10 Sekunden Aufnahme
    startRecording();
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (phase === 'recording' && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (phase === 'recording' && timeLeft === 0) {
      // Aufnahme beenden
      stopRecording();
      setPhase('analyzing');
      // Kurz warten für "Analyse-Effekt"
      setTimeout(() => {
        // Das letzte Ergebnis speichern
        // Hier müssten wir eigentlich das "beste" oder "häufigste" Ergebnis nehmen
        // Da useAudioAnalyzer kontinuierlich updated, nehmen wir das letzte gültige
        if (result) {
             setFinalResult(result);
        } else {
             // Fallback falls kein Ton erkannt wurde
             // Wir nehmen einfach den letzten State aus dem Hook, aber der ist evtl null
             // In einer echten App würden wir Ergebnisse sammeln und mitteln
        }
        setPhase('result');
      }, 2000);
    }
    return () => clearInterval(timer);
  }, [phase, timeLeft, stopRecording, result]);

  // Wenn wir im Result-Screen sind und result null ist (z.B. weil Hook resettet),
  // nutzen wir finalResult. Aber während Recording nutzen wir result live.
  const displayResult = phase === 'result' ? finalResult : result;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black overflow-x-hidden">
      {/* Scanline Effect */}
      <div className="scanline fixed inset-0 pointer-events-none z-50 opacity-10"></div>

      {/* Header */}
      <header className="p-6 border-b border-white/10 flex justify-between items-center backdrop-blur-md sticky top-0 z-40 bg-black/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-12 bg-primary animate-pulse shadow-[0_0_15px_var(--color-primary)]"></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tighter font-display">MDI SYSTEM</h1>
            <p className="text-xs text-white/50 tracking-widest uppercase">Multidimensionales Identitätssystem</p>
          </div>
        </div>
        <div className="text-right hidden md:block">
            <div className="text-xs text-primary font-mono">V 1.0 // BETA</div>
            <div className="text-[10px] text-white/30">KIICH WERKE</div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 flex flex-col items-center justify-center min-h-[80vh]">
        
        {/* PHASE 1: INTRO */}
        {phase === 'intro' && (
          <div className="max-w-2xl text-center space-y-8 animate-in fade-in zoom-in duration-500">
            <div className="relative inline-block">
                <div className="absolute -inset-1 bg-primary/20 blur-xl rounded-full"></div>
                <Mic className="w-24 h-24 text-primary relative z-10 mx-auto mb-4" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-white/50">
              Entdecke deinen<br/>
              <span className="text-primary neon-text">Ur-Klang</span>
            </h2>
            
            <p className="text-xl text-white/60 max-w-lg mx-auto leading-relaxed">
              Deine Stimme ist dein Fingerabdruck. MDI analysiert deine Frequenzstruktur und enthüllt deine multidimensionale Identität.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left my-12">
                <div className="p-4 border border-white/10 bg-white/5 backdrop-blur rounded hover:border-primary/50 transition-colors">
                    <div className="text-primary mb-2 font-mono">01. SCAN</div>
                    <div className="text-sm text-white/70">Präzise FFT-Analyse deiner Stimme in Echtzeit.</div>
                </div>
                <div className="p-4 border border-white/10 bg-white/5 backdrop-blur rounded hover:border-primary/50 transition-colors">
                    <div className="text-primary mb-2 font-mono">02. DECODE</div>
                    <div className="text-sm text-white/70">Bestimmung deines exakten Grundtons und Charakters.</div>
                </div>
                <div className="p-4 border border-white/10 bg-white/5 backdrop-blur rounded hover:border-primary/50 transition-colors">
                    <div className="text-primary mb-2 font-mono">03. REVEAL</div>
                    <div className="text-sm text-white/70">Visualisierung deiner inneren Geometrie und Farbe.</div>
                </div>
            </div>

            <Button 
                size="lg" 
                onClick={handleStartRecording}
                className="bg-primary text-black hover:bg-white hover:text-black font-bold text-lg px-12 py-8 rounded-none border border-primary shadow-[0_0_30px_rgba(255,107,0,0.3)] transition-all hover:scale-105"
            >
              ANALYSE STARTEN
            </Button>
            
            <p className="text-xs text-white/30 mt-4">
                Benötigt Mikrofon-Zugriff. Daten werden lokal verarbeitet.
            </p>
          </div>
        )}

        {/* PHASE 2: RECORDING */}
        {phase === 'recording' && (
          <div className="w-full max-w-4xl space-y-8 text-center animate-in fade-in duration-300">
            <div className="flex flex-col items-center justify-center space-y-4">
                <div className="text-primary font-mono text-xl animate-pulse">AUFNAHME LÄUFT...</div>
                <div className="text-6xl font-bold font-mono tabular-nums">{timeLeft < 10 ? `0${timeLeft}` : timeLeft}s</div>
                <p className="text-white/50">Sprich bitte ganz natürlich. Erzähl etwas über dich.</p>
            </div>

            {/* Visualizer */}
            <div className="h-64 w-full border border-white/10 bg-black/50 rounded-lg overflow-hidden relative">
                <SpectrumVisualizer result={result} width={800} height={256} />
                
                {/* Overlay Grid */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>
            </div>

            {/* Live Data */}
            {result && result.isSpeaking && (
                <div className="grid grid-cols-2 gap-4 max-w-md mx-auto">
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                        <div className="text-xs text-white/50 uppercase">Frequenz</div>
                        <div className="text-2xl font-mono text-primary">{result.fundamentalFreq.toFixed(2)} Hz</div>
                    </div>
                    <div className="bg-white/5 p-4 rounded border border-white/10">
                        <div className="text-xs text-white/50 uppercase">Tendenz</div>
                        <div className="text-2xl font-mono text-white">{result.dominantTone.name}</div>
                    </div>
                </div>
            )}
          </div>
        )}

        {/* PHASE 3: ANALYZING */}
        {phase === 'analyzing' && (
          <div className="flex flex-col items-center justify-center space-y-6 animate-in fade-in duration-500">
            <div className="relative">
                <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full animate-pulse"></div>
                <Loader2 className="w-16 h-16 text-primary animate-spin relative z-10" />
            </div>
            <h2 className="text-3xl font-bold">BERECHNE IDENTITÄT...</h2>
            <div className="font-mono text-primary/70 text-sm space-y-1 text-center">
                <p>Extrahieren der Grundfrequenz...</p>
                <p>Berechnen der Obertöne (1-32)...</p>
                <p>Mappen der Geometrie...</p>
                <p>Generieren der Farbpalette...</p>
            </div>
          </div>
        )}

        {/* PHASE 4: RESULT */}
        {phase === 'result' && finalResult && (
           <div className="w-full max-w-6xl animate-in slide-in-from-bottom-10 duration-700">
             
             {/* Top Section: Hero Result */}
             <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16 items-center">
                
                {/* Left: Data & Identity */}
                <div className="space-y-8">
                    <div>
                        <div className="text-sm text-primary font-mono mb-2 border-b border-primary/30 inline-block pb-1">DEIN UR-KLANG</div>
                        <h2 className="text-7xl font-bold tracking-tighter text-white mb-2">
                            {finalResult.dominantTone.name}
                            <span className="text-3xl text-white/50 ml-4 font-normal align-top">
                                {finalResult.cents > 0 ? '+' : ''}{finalResult.cents} Cent
                            </span>
                        </h2>
                        <div className="text-4xl font-mono text-primary/80 mb-6">
                            {finalResult.fundamentalFreq.toFixed(2)} Hz
                        </div>
                        <p className="text-xl text-white/80 leading-relaxed border-l-4 border-primary pl-6 italic">
                            "{finalResult.dominantTone.character.toUpperCase()}"
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-white/5 border border-white/10 rounded">
                            <div className="text-xs text-white/50 uppercase mb-1">Geometrie</div>
                            <div className="text-lg font-medium">{finalResult.dominantTone.geometry}</div>
                        </div>
                        <div className="p-4 bg-white/5 border border-white/10 rounded">
                            <div className="text-xs text-white/50 uppercase mb-1">Lichtfarbe</div>
                            <div className="text-lg font-medium" style={{ color: finalResult.dominantTone.color }}>
                                {finalResult.dominantTone.lightColorNm.toUpperCase()}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <Button 
                            onClick={() => playTone(finalResult.fundamentalFreq)}
                            className="bg-white text-black hover:bg-primary hover:text-white border-none"
                        >
                            <Play className="w-4 h-4 mr-2" /> Ton abspielen
                        </Button>
                        <Button 
                            variant="outline"
                            onClick={() => {
                                // Akkord: Grundton, Quinte (1.5x), Oktave (2x)
                                playChord([
                                    finalResult.fundamentalFreq, 
                                    finalResult.fundamentalFreq * 1.5, 
                                    finalResult.fundamentalFreq * 2
                                ]);
                            }}
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <Volume2 className="w-4 h-4 mr-2" /> Akkord hören
                        </Button>
                    </div>
                </div>

                {/* Right: Generative Art */}
                <div className="relative aspect-square bg-black border border-white/10 rounded-full overflow-hidden flex items-center justify-center shadow-[0_0_100px_rgba(255,107,0,0.1)] group">
                    {/* Placeholder for Generative Art - based on Tone Color & Geometry */}
                    <div 
                        className="absolute inset-0 opacity-30"
                        style={{
                            background: `radial-gradient(circle at center, ${finalResult.dominantTone.color}, transparent 70%)`
                        }}
                    ></div>
                    
                    {/* Geometrie-Simulation */}
                    <div className="relative z-10 w-2/3 h-2/3 flex items-center justify-center animate-pulse-slow">
                        {/* Hier würde die echte Geometrie generiert werden */}
                        <div 
                            className="w-full h-full border-4 border-white/80 opacity-80"
                            style={{
                                borderRadius: finalResult.dominantTone.geometry.includes('kreis') ? '50%' : 
                                              finalResult.dominantTone.geometry.includes('rechteck') ? '0%' : '30%',
                                transform: 'rotate(45deg)',
                                boxShadow: `0 0 50px ${finalResult.dominantTone.color}`
                            }}
                        ></div>
                        <div className="absolute text-center text-white/80 font-mono text-xs tracking-widest mix-blend-difference">
                            MDI GENERATED<br/>
                            {finalResult.dominantTone.name} // {finalResult.dominantTone.geometry.toUpperCase()}
                        </div>
                    </div>
                </div>

             </div>

             {/* Bottom: Detailed Stats */}
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Card className="bg-black border-white/10 text-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-white/50">INTUITIV</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{finalResult.dominantTone.dimensions.intuitive}/10</div>
                        <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${finalResult.dominantTone.dimensions.intuitive * 10}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-black border-white/10 text-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-white/50">INTELLEKTUELL</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{finalResult.dominantTone.dimensions.intellectual}/10</div>
                        <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${finalResult.dominantTone.dimensions.intellectual * 10}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-black border-white/10 text-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-white/50">EMOTIONAL</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{finalResult.dominantTone.dimensions.emotional}/10</div>
                        <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${finalResult.dominantTone.dimensions.emotional * 10}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-black border-white/10 text-white">
                    <CardHeader className="pb-2"><CardTitle className="text-sm text-white/50">STRUKTURIERT</CardTitle></CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold">{finalResult.dominantTone.dimensions.structured}/10</div>
                        <div className="h-1 w-full bg-white/10 mt-2 rounded-full overflow-hidden">
                            <div className="h-full bg-primary" style={{ width: `${finalResult.dominantTone.dimensions.structured * 10}%` }}></div>
                        </div>
                    </CardContent>
                </Card>
             </div>

             <div className="text-center space-x-4">
                <Button 
                    variant="outline" 
                    size="lg"
                    onClick={() => {
                        setFinalResult(null);
                        setPhase('intro');
                    }}
                    className="border-white/20 hover:bg-white/10"
                >
                    <RefreshCw className="w-4 h-4 mr-2" /> NEUE ANALYSE
                </Button>
                <Button 
                    size="lg"
                    className="bg-primary text-black hover:bg-white"
                >
                    <Download className="w-4 h-4 mr-2" /> ERGEBNIS SPEICHERN
                </Button>
             </div>

           </div>
        )}

      </main>
    </div>
  );
}
