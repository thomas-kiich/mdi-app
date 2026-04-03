import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, ArrowRight, Activity, Brain, Sparkles, CheckCircle2, Play } from "lucide-react";
import { cn } from "@/lib/utils";
import { useMDI } from "@/contexts/MDIContext";
import { useAudioAnalyzer } from "@/hooks/useAudioAnalyzer";
import { useLongitudinalStudy } from "@/hooks/useLongitudinalStudy";

// Props will be passed from Home to control the flow
export interface VoiceAnalysisProps {
  onComplete: () => void;
  onCancel: () => void;
}

export function VoiceAnalysis({ onComplete, onCancel }: VoiceAnalysisProps) {
  const [currentStep, setCurrentStep] = useState<string>("preparation");
  const { isRecording, startRecording, stopRecording, result: analysisResult, error } = useAudioAnalyzer();
  const { saveDailyResult } = useLongitudinalStudy();

  const [relaxationTimeLeft, setRelaxationTimeLeft] = useState(180);
  const [isRelaxing, setIsRelaxing] = useState(false);

  // Helper to get local results since the context might not have intermediate states
  const [localResults, setLocalResults] = useState({ r1: false, r2: false, r3: false, r4: false });

  const handleStartRecording = () => {
    startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    if (currentStep === "recording1") setLocalResults(prev => ({ ...prev, r1: true }));
    if (currentStep === "recording2") setLocalResults(prev => ({ ...prev, r2: true }));
    if (currentStep === "recording3") setLocalResults(prev => ({ ...prev, r3: true }));
    if (currentStep === "recording4") setLocalResults(prev => ({ ...prev, r4: true }));
  };

  const advanceStep = () => {
    const steps = [
      "preparation", 
      "recording1", "pause1", 
      "recording2", "pause2", 
      "recording3", "pause3", 
      "recording4", "relaxation", 
      "analysis", "result"
    ];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1] as any);
    }
  };

  // Effect for relaxation timer
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRelaxing && relaxationTimeLeft > 0) {
      interval = setInterval(() => {
        setRelaxationTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (relaxationTimeLeft === 0) {
      setIsRelaxing(false);
    }
    return () => clearInterval(interval);
  }, [isRelaxing, relaxationTimeLeft]);

  // Render logic based on currentStep
  switch (currentStep) {
    case "preparation":
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
          <h2 className="text-3xl md:text-5xl font-bold text-center text-white mb-8 leading-tight max-w-3xl">
            Lass uns herausfinden, <br/>
            <span className="text-orange-500">wo du heute stehst.</span>
          </h2>
          
          <div className="grid md:grid-cols-3 gap-6 max-w-4xl w-full mb-12">
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6 text-center">
                <Mic className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">4 Aufnahmen</h3>
                <p className="text-zinc-400 text-sm">Sprich natürlich in dein Mikrofon</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6 text-center">
                <Activity className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Frequenz-Analyse</h3>
                <p className="text-zinc-400 text-sm">Wir messen deinen Grundton</p>
              </CardContent>
            </Card>
            <Card className="bg-zinc-900/50 border-zinc-800">
              <CardContent className="pt-6 text-center">
                <Brain className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-white mb-2">Dein Training</h3>
                <p className="text-zinc-400 text-sm">Maßgeschneidert für deinen Tag</p>
              </CardContent>
            </Card>
          </div>

          <Button onClick={advanceStep} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full">
            Ich bin bereit <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button onClick={onCancel} variant="ghost" className="mt-4 text-zinc-500 hover:text-white">
            Abbrechen
          </Button>
        </div>
      );

    case "recording1":
    case "recording2":
    case "recording3":
    case "recording4":
      const recordingTitles: Record<string, string> = {
        recording1: "Aufnahme 1: Dein Name",
        recording2: "Aufnahme 2: Dein Alter",
        recording3: "Aufnahme 3: Dein Wohnort",
        recording4: "Aufnahme 4: Dein tiefster Ton"
      };

      const recordingInstructions: Record<string, string> = {
        recording1: "Bitte drücke den Startbutton und sage deinen vollständigen Namen.",
        recording2: "Bitte drücke den Startbutton und sage dein Alter.",
        recording3: "Bitte drücke den Startbutton und nenne deinen aktuellen Wohnort.",
        recording4: "Zum Abschluss versuchst du nun den tiefsten Ton zu tönen der dir möglich scheint. Verwende dazu die Silbe NOOOOOO und töne tief in deine Wirbelsäule hinab nachdem du den Startbutton gedrückt hast. Wiederhole diesen tiefsten Summton noch weitere 2x."
      };
      
      const isCurrentStepDone = 
         (currentStep === "recording1" && localResults.r1) ||
         (currentStep === "recording2" && localResults.r2) ||
         (currentStep === "recording3" && localResults.r3) ||
         (currentStep === "recording4" && localResults.r4);

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
          <div className="mb-8 flex gap-2">
              {[1, 2, 3, 4].map(i => (
                  <div key={i} className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      (currentStep === "recording1" && i === 1) || (currentStep === "recording2" && i <= 2) || (currentStep === "recording3" && i <= 3) || (currentStep === "recording4" && i <= 4) 
                      ? "bg-orange-500" 
                      : "bg-zinc-800"
                  )} />
              ))}
          </div>

          {!isCurrentStepDone && (
            <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 max-w-2xl leading-tight">
              {recordingTitles[currentStep]}
            </h2>
          )}
          
          {!isCurrentStepDone && (
            <div className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-left w-full max-w-2xl">
              <p className="text-zinc-300 text-lg leading-relaxed mb-4 whitespace-pre-wrap">
                {recordingInstructions[currentStep]}
              </p>
              <div className="flex items-center gap-2 text-zinc-500 text-sm">
                <Mic className="w-4 h-4" />
                <span>Sprich in normaler Lautstärke. Drücke Stopp, wenn du fertig bist.</span>
              </div>
            </div>
          )}

          <div className="relative">
            {isRecording && (
               <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />
            )}
            
            {!isRecording && !isCurrentStepDone && (
              <Button 
                onClick={handleStartRecording} 
                size="lg" 
                className="rounded-full w-48 h-16 text-lg bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
              >
                <Mic className="mr-2 w-5 h-5" /> Start
              </Button>
            )}

            {isRecording && (
              <Button 
                onClick={handleStopRecording} 
                size="lg" 
                variant="destructive"
                className="rounded-full w-48 h-16 text-lg animate-pulse"
              >
                Stopp
              </Button>
            )}
            
            {!isRecording && isCurrentStepDone && (
               <Button 
                  disabled
                  size="lg" 
                  className="rounded-full w-48 h-16 text-lg bg-green-500/20 text-green-500 border border-green-500/50"
                >
                  <CheckCircle2 className="mr-2 w-5 h-5" /> Gespeichert
                </Button>
            )}
          </div>
          
          {!isRecording && isCurrentStepDone && (
              <div className="mt-12 animate-in fade-in slide-in-from-bottom-4">
                  <Button onClick={advanceStep} size="lg" className="rounded-full w-48 h-14 text-lg">
                    Weiter <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
              </div>
          )}

          {error && (
            <p className="text-red-500 mt-4 max-w-md text-center">{error}</p>
          )}
        </div>
      );

    case "relaxation":
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
           <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 max-w-2xl leading-tight">
              Entspannung
           </h2>
           <div className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-left w-full max-w-md">
              <p className="text-zinc-300 text-lg leading-relaxed mb-4">
                Du hörst nun für drei Minuten ein sanftes Wasserplätschern. Atme entspannt durch die Nase ein und aus. Beobachte den Atemfluss und entspanne dich.
              </p>
           </div>
           
           {isRelaxing ? (
               <div className="flex flex-col items-center">
                   <div className="text-6xl font-mono text-orange-500 mb-8">
                       {Math.floor(relaxationTimeLeft / 60)}:{(relaxationTimeLeft % 60).toString().padStart(2, '0')}
                   </div>
                   <audio autoPlay loop src="/water-stream.mp3" />
                   <p className="text-zinc-500">Bitte schließe deine Augen und entspanne.</p>
                   <Button onClick={() => setIsRelaxing(false)} variant="ghost" className="mt-8 text-zinc-500 hover:text-white">
                       Überspringen
                   </Button>
               </div>
           ) : (
               <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                   <p className="text-green-500 mb-8 flex items-center justify-center gap-2">
                     <Sparkles className="w-5 h-5" /> Entspannungsphase abgeschlossen.
                   </p>
                   <p className="text-zinc-300 mb-8 text-center max-w-md">
                     Wenn das Wasserplätschern verstummt öffne deine Augen, nimm einen Schluck Wasser zu dir und drücke den Startbutton für den nächsten Schritt.
                   </p>
                   <Button onClick={advanceStep} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full">
                     Weiter <ArrowRight className="ml-2 w-5 h-5" />
                   </Button>
               </div>
           )}
        </div>
      );

    case "pause1":
    case "pause2":
    case "pause3":
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
           <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-8">
               <div className="w-10 h-10 rounded-full bg-blue-500/40 animate-pulse" />
           </div>
           <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 max-w-2xl leading-tight">
              Trinkpause
           </h2>
           <p className="text-zinc-300 text-lg mb-12 text-center max-w-md">
              Nimm wieder einen Schluck Wasser zu dir.
           </p>
           <Button onClick={advanceStep} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full">
              Weiter <ArrowRight className="ml-2 w-5 h-5" />
           </Button>
        </div>
      );

    case "analysis":
      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
          <div className="w-32 h-32 relative mb-12">
            <div className="absolute inset-0 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
            <div className="absolute inset-4 rounded-full border-4 border-orange-500/20 border-b-orange-500 animate-spin-reverse" />
            <Activity className="absolute inset-0 m-auto w-10 h-10 text-orange-500 animate-pulse" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Analysiere Stimmfrequenz...</h2>
          <p className="text-zinc-400 text-center max-w-md mb-12">
            Die neuronalen Muster deiner Stimme werden ausgewertet, um deinen optimalen Resonanzton zu ermitteln.
          </p>
          <Button onClick={advanceStep} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full">
            Ergebnis anzeigen <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      );

    case "result":
      if (!analysisResult) {
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
            <p className="text-red-500">Fehler: Keine Analyseergebnisse gefunden.</p>
            <Button onClick={onCancel} className="mt-8">Zurück zum Dashboard</Button>
          </div>
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48 pb-24">
          <h2 className="text-4xl md:text-5xl font-bold text-center text-white mb-12 leading-tight">
            Dein optimaler <br/>
            <span className="text-orange-500">Resonanzton</span>
          </h2>
          
          <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-8 md:p-12 w-full max-w-2xl mb-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-orange-500/0 via-orange-500 to-orange-500/0" />
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left">
                <p className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-2">Grundfrequenz</p>
                <div className="text-6xl md:text-7xl font-bold text-white mb-2">
                  {analysisResult.fundamentalFreq.toFixed(1)} <span className="text-3xl text-orange-500">Hz</span>
                </div>
                <p className="text-xl text-orange-400 font-medium">Ton: {analysisResult.tone.name}</p>
              </div>
              
              <div className="w-px h-24 bg-zinc-800 hidden md:block" />
              
              <div className="text-center md:text-right">
                <p className="text-zinc-400 uppercase tracking-widest text-sm font-bold mb-2">Farb-Korrespondenz</p>
                <div className="flex items-center justify-center md:justify-end gap-4">
                  <div 
                    className="w-12 h-12 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.5)]" 
                    style={{ backgroundColor: analysisResult.tone.color || "#ff9900" }}
                  />
                  <div className="text-xl text-white capitalize">{analysisResult.tone.name || "Orange"}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6 w-full max-w-2xl">
            <Button 
              onClick={() => {
                saveDailyResult(analysisResult);
                onComplete();
              }}
              size="lg" 
              className="h-16 text-lg rounded-xl bg-orange-600 hover:bg-orange-700"
            >
              <Play className="mr-2 w-5 h-5" /> Training starten
            </Button>
            <Button 
              onClick={onCancel}
              variant="outline"
              size="lg" 
              className="h-16 text-lg rounded-xl border-zinc-700 hover:bg-zinc-800"
            >
              Zum Dashboard
            </Button>
          </div>
        </div>
      );

    default:
      return null;
  }
}
