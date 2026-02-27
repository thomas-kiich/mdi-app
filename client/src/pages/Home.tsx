import { SpectrumVisualizer } from '@/components/SpectrumVisualizer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useAudioAnalyzer } from '@/hooks/useAudioAnalyzer';
import { useSoundGenerator } from '@/hooks/useSoundGenerator';
import { Loader2, Mic, Pause, Play, RefreshCw, Volume2 } from "lucide-react";
import { useState } from 'react';

export default function Home() {
  const { isRecording, startRecording, stopRecording, result, error } = useAudioAnalyzer();
  const { isPlaying, playTone, stopTone } = useSoundGenerator();
  const [scanStep, setScanStep] = useState<'idle' | 'scanning' | 'analyzing' | 'result'>('idle');

  const handleStartScan = async () => {
    setScanStep('scanning');
    await startRecording();
  };

  const handleStopScan = () => {
    stopRecording();
    setScanStep('analyzing');
    // Simulate analysis delay for dramatic effect
    setTimeout(() => {
      setScanStep('result');
    }, 1500);
  };

  const handleReset = () => {
    setScanStep('idle');
    stopTone();
  };

  const handlePlayTone = () => {
    if (result && result.tone) {
      if (isPlaying) {
        stopTone();
      } else {
        playTone(result.fundamentalFreq);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary selection:text-black font-sans overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 w-full z-50 border-b border-white/10 bg-black/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-1 h-6 bg-primary"></div>
            <div>
              <h1 className="text-lg font-bold tracking-tight leading-none">MDI SYSTEM</h1>
              <p className="text-[10px] text-gray-500 tracking-widest uppercase">Multidimensionales Identitätssystem</p>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="text-xs text-primary font-mono">V 1.0 // BETA</p>
            <p className="text-[10px] text-gray-600">KIICH WERKE</p>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 container mx-auto px-4 min-h-screen flex flex-col items-center justify-center">
        
        {/* IDLE STATE */}
        {scanStep === 'idle' && (
          <div className="text-center max-w-2xl animate-in fade-in zoom-in duration-700">
            <div className="mb-8 relative inline-block">
              <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"></div>
              <Mic className="w-24 h-24 text-primary relative z-10" />
            </div>
            
            <h2 className="text-5xl md:text-7xl font-bold mb-6 tracking-tighter">
              Entdecke deinen <br/>
              <span className="text-primary text-glow">Ur-Klang</span>
            </h2>
            
            <p className="text-xl text-gray-400 mb-12 leading-relaxed max-w-lg mx-auto">
              Deine Stimme ist dein Fingerabdruck. MDI analysiert deine Frequenzstruktur und enthüllt deine multidimensionale Identität.
            </p>

            <Button 
              size="lg" 
              className="h-16 px-12 text-lg rounded-full bg-primary text-black hover:bg-white hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(255,107,0,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.4)]"
              onClick={handleStartScan}
            >
              <Mic className="mr-2 h-5 w-5" /> SCAN STARTEN
            </Button>

            <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left opacity-50">
              <div className="border-t border-white/20 pt-4">
                <h3 className="text-primary font-mono text-sm mb-2">01. SCAN</h3>
                <p className="text-sm text-gray-400">Präzise FFT-Analyse deiner Stimme in Echtzeit.</p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <h3 className="text-primary font-mono text-sm mb-2">02. DECODE</h3>
                <p className="text-sm text-gray-400">Bestimmung deines exakten Grundtons und Charakters.</p>
              </div>
              <div className="border-t border-white/20 pt-4">
                <h3 className="text-primary font-mono text-sm mb-2">03. REVEAL</h3>
                <p className="text-sm text-gray-400">Visualisierung deiner inneren Geometrie und Farbe.</p>
              </div>
            </div>
          </div>
        )}

        {/* SCANNING STATE */}
        {scanStep === 'scanning' && (
          <div className="w-full max-w-4xl animate-in fade-in duration-500">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-mono animate-pulse">
                <div className="w-2 h-2 rounded-full bg-primary"></div>
                AUFNAHME LÄUFT...
              </div>
              <p className="mt-4 text-gray-400">Sprich bitte natürlich in dein Mikrofon...</p>
            </div>

            <div className="h-64 mb-8">
               <SpectrumVisualizer result={result} height={256} />
            </div>

            <div className="flex justify-center">
              <Button 
                size="lg" 
                variant="destructive"
                className="h-16 px-12 text-lg rounded-full"
                onClick={handleStopScan}
              >
                <div className="w-4 h-4 bg-white rounded-sm mr-3"></div>
                STOP & ANALYSIEREN
              </Button>
            </div>
          </div>
        )}

        {/* ANALYZING STATE */}
        {scanStep === 'analyzing' && (
          <div className="text-center animate-in fade-in zoom-in duration-500">
            <div className="relative mb-8 inline-block">
               <Loader2 className="w-24 h-24 text-primary animate-spin" />
               <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            </div>
            <h2 className="text-3xl font-bold mb-2">MDI ALGORITHMUS</h2>
            <p className="text-gray-400 font-mono">Decodiere Frequenzstruktur...</p>
          </div>
        )}

        {/* RESULT STATE */}
        {scanStep === 'result' && result && result.tone && (
          <div className="w-full max-w-6xl animate-in fade-in slide-in-from-bottom-10 duration-700">
            
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              
              {/* LEFT COLUMN: VISUAL & TONE */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* TONE CARD */}
                <Card className="bg-zinc-900/50 border-white/10 overflow-hidden relative group">
                  <div 
                    className="absolute inset-0 opacity-20 transition-opacity duration-1000 group-hover:opacity-30"
                    style={{ backgroundColor: result.tone.color }}
                  ></div>
                  <CardContent className="p-8 relative z-10 text-center">
                    <p className="text-sm text-gray-400 font-mono mb-2">DEIN GRUNDTON</p>
                    <h2 className="text-8xl font-bold tracking-tighter mb-2" style={{ color: result.tone.color, textShadow: `0 0 30px ${result.tone.color}` }}>
                      {result.tone.name}
                    </h2>
                    <div className="inline-block px-3 py-1 bg-black/50 backdrop-blur rounded border border-white/10 text-sm font-mono text-gray-300">
                      {result.fundamentalFreq.toFixed(2)} Hz 
                      <span className="text-gray-500 mx-2">|</span>
                      {result.cents > 0 ? '+' : ''}{result.cents} Cent
                    </div>
                  </CardContent>
                </Card>

                {/* GEOMETRY PREVIEW (PLACEHOLDER FOR GENERATIVE ART) */}
                <Card className="bg-black border-white/10 aspect-square flex items-center justify-center relative overflow-hidden">
                   {/* Background Glow */}
                   <div 
                      className="absolute inset-0 opacity-20 blur-3xl"
                      style={{ background: `radial-gradient(circle at center, ${result.tone.color}, transparent 70%)` }}
                   ></div>
                   
                   {/* Geometry Representation based on Tone */}
                   <div className="relative z-10 w-48 h-48 border-2 border-white/50 flex items-center justify-center" style={{ borderColor: result.tone.color }}>
                      <div className="text-center">
                        <p className="text-xs text-gray-500 uppercase tracking-widest mb-2">Geometrie</p>
                        <p className="text-xl font-bold uppercase">{result.tone.geometry}</p>
                      </div>
                   </div>
                </Card>

                <div className="flex gap-4">
                  <Button 
                    className="flex-1 h-14 text-lg bg-white text-black hover:bg-gray-200"
                    onClick={handlePlayTone}
                  >
                    {isPlaying ? <Pause className="mr-2" /> : <Play className="mr-2" />}
                    {isPlaying ? 'STOP' : 'TON ABSPIELEN'}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-14 w-14 border-white/20 hover:bg-white/10 hover:text-white"
                    onClick={handleReset}
                  >
                    <RefreshCw className="h-5 w-5" />
                  </Button>
                </div>
              </div>

              {/* RIGHT COLUMN: DATA & PROFILE */}
              <div className="lg:col-span-7 flex flex-col gap-6">
                
                {/* CHARACTER CARD */}
                <Card className="bg-zinc-900/50 border-white/10">
                  <CardContent className="p-8">
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <p className="text-sm text-gray-400 font-mono mb-1">CHARAKTER</p>
                        <h3 className="text-3xl font-bold uppercase text-white">{result.tone.character}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400 font-mono mb-1">LICHTFARBE</p>
                        <div className="flex items-center gap-2 justify-end">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: result.tone.color }}></div>
                          <span className="text-xl font-bold uppercase" style={{ color: result.tone.color }}>{result.tone.lightColorNm}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-8">
                      {result.tone.keywords.map((keyword, i) => (
                        <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-xs font-mono text-gray-300">
                          {keyword}
                        </span>
                      ))}
                    </div>

                    {/* DIMENSIONS BARS */}
                    <div className="space-y-4">
                      <p className="text-sm text-gray-400 font-mono border-b border-white/10 pb-2 mb-4">MDI PROFIL</p>
                      
                      <DimensionBar label="INTUITIV" value={result.tone.dimensions.intuitive} color={result.tone.color} />
                      <DimensionBar label="INTELLEKTUELL" value={result.tone.dimensions.intellectual} color={result.tone.color} />
                      <DimensionBar label="EMOTIONAL" value={result.tone.dimensions.emotional} color={result.tone.color} />
                      <DimensionBar label="STRUKTURIERT" value={result.tone.dimensions.structured} color={result.tone.color} />
                      <DimensionBar label="ABSTRAKT" value={result.tone.dimensions.abstract} color={result.tone.color} />
                    </div>
                  </CardContent>
                </Card>

                {/* INFO CARD */}
                <Card className="bg-zinc-900/30 border-white/5">
                  <CardContent className="p-6 text-sm text-gray-400 leading-relaxed">
                    <p>
                      Dein Grundton <strong>{result.tone.name}</strong> ({result.fundamentalFreq.toFixed(1)} Hz) resoniert mit der Geometrie 
                      des <strong>{result.tone.geometry}</strong>. In der vedischen Lehre entspricht dies einer 
                      {result.tone.character}en Grundschwingung. Deine Stimme trägt die Qualität von 
                      {result.tone.keywords.join(" und ")}.
                    </p>
                  </CardContent>
                </Card>

              </div>
            </div>
          </div>
        )}

        {/* ERROR STATE */}
        {error && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-red-900/90 text-white px-6 py-4 rounded-lg border border-red-500/50 shadow-2xl flex items-center gap-4 animate-in slide-in-from-bottom-5">
             <div className="p-2 bg-red-800 rounded-full">
               <Volume2 className="w-5 h-5" />
             </div>
             <div>
               <p className="font-bold">Fehler bei der Aufnahme</p>
               <p className="text-sm text-red-200">{error}</p>
             </div>
             <Button variant="ghost" size="sm" onClick={() => window.location.reload()} className="ml-4 hover:bg-red-800">
               Neu laden
             </Button>
          </div>
        )}

      </main>
    </div>
  );
}

function DimensionBar({ label, value, color }: { label: string, value: number, color: string }) {
  return (
    <div className="flex items-center gap-4">
      <div className="w-24 text-xs font-mono text-gray-500 text-right">{label}</div>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <div 
          className="h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${value * 10}%`, backgroundColor: color, opacity: 0.8 }}
        ></div>
      </div>
      <div className="w-8 text-xs font-mono text-gray-400">{value}</div>
    </div>
  );
}
