import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { SpectrumVisualizer } from "@/components/SpectrumVisualizer";
import { FrequencyChart } from "@/components/FrequencyChart";
import { useAudioAnalyzer, AnalysisResult } from "@/hooks/useAudioAnalyzer";
import { useSoundGenerator } from "@/hooks/useSoundGenerator";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Settings, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

// Define the steps of the wizard
type WizardStep = 
  | "intro" 
  | "preparation" 
  | "question1" 
  | "question2" 
  | "question3" 
  | "analyzing" 
  | "result";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<WizardStep>("intro");
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    result: analysisResult,
    error,
  } = useAudioAnalyzer();
  
  const { 
    isPlaying, 
    playTone, 
    stopTone, 
    playChord, 
    playingFreq, 
    octaveShift, 
    fineTune,
    usePureSine,
    referencePitch,
    setReferencePitch
  } = useSoundGenerator();

  const [currentOctaveShift, setCurrentOctaveShift] = useState(0);
  const [currentFineTune, setCurrentFineTune] = useState(0); // in cents
  const [isPureSineMode, setIsPureSineMode] = useState(false);
  const [isExpertOpen, setIsExpertOpen] = useState(false);
  const [is432Hz, setIs432Hz] = useState(false);
  
  // Update reference pitch when 432Hz switch changes
  useEffect(() => {
    setReferencePitch(is432Hz ? 432 : 440);
  }, [is432Hz, setReferencePitch]);

  // Store results from each step
  const [results, setResults] = useState<{
    q1: AnalysisResult | null;
    q2: AnalysisResult | null;
    q3: AnalysisResult | null;
  }>({
    q1: null,
    q2: null,
    q3: null
  });

  // Combined result state
  const [finalResult, setFinalResult] = useState<any | null>(null);

  const handleStartRecording = async () => {
    await startRecording();
  };

  const handleStopRecording = () => {
    stopRecording();
    // The result capture is handled by the useEffect below
  };

  // Effect to capture result when recording stops
  // We use a ref to track if we were recording to detect the falling edge
  const wasRecordingRef = useRef(false);

  useEffect(() => {
    if (wasRecordingRef.current && !isRecording && analysisResult) {
      // Just finished recording
      if (currentStep === "question1") {
        setResults(prev => ({ ...prev, q1: analysisResult }));
      } else if (currentStep === "question2") {
        setResults(prev => ({ ...prev, q2: analysisResult }));
      } else if (currentStep === "question3") {
        setResults(prev => ({ ...prev, q3: analysisResult }));
      }
    }
    wasRecordingRef.current = isRecording;
  }, [isRecording, analysisResult, currentStep]);

  const nextStep = () => {
    if (currentStep === "intro") setCurrentStep("preparation");
    else if (currentStep === "preparation") setCurrentStep("question1");
    else if (currentStep === "question1") {
      setCurrentStep("question2");
    }
    else if (currentStep === "question2") {
      setCurrentStep("question3");
    }
    else if (currentStep === "question3") {
      setCurrentStep("analyzing");
      // Simulate processing time for dramatic effect
      setTimeout(() => {
        calculateFinalResult();
        setCurrentStep("result");
      }, 2000);
    }
  };

  const calculateFinalResult = () => {
    // Aggregation Logic:
    // Combine distribution maps from all 3 recordings
    
    const combinedDistribution: Record<string, number> = {};
    let totalCombinedSamples = 0;
    
    const processResult = (res: AnalysisResult | null) => {
      if (!res || !res.toneDistribution) return;
      
      for (const [tone, percent] of Object.entries(res.toneDistribution)) {
        if (!combinedDistribution[tone]) combinedDistribution[tone] = 0;
        // Add weighted contribution
        combinedDistribution[tone] += percent;
      }
      totalCombinedSamples++;
    };
    
    processResult(results.q1);
    processResult(results.q2);
    processResult(results.q3);
    
    // Find dominant tone across all sessions
    let maxScore = 0;
    let dominantToneName = "";
    
    for (const [tone, score] of Object.entries(combinedDistribution)) {
      if (score > maxScore) {
        maxScore = score;
        dominantToneName = tone;
      }
    }
    
    // If we have a winner, construct the final result
    if (dominantToneName) {
      // Find the tone data
      const toneData = TONES.find(t => t.name === dominantToneName);
      
      if (toneData) {
        // Calculate average Hz for this tone from the sessions where it appeared
        // This is a simplification - ideally we'd track exact Hz per frame
        // Instead we'll use the Hz from the session where this tone was most prominent
        
        let bestHz = 0;
        let bestConfidence = 0;
        
        const checkSession = (res: AnalysisResult | null) => {
            if (!res || !res.toneDistribution) return;
            const score = res.toneDistribution[dominantToneName] || 0;
            if (score > bestConfidence) {
                bestConfidence = score;
                bestHz = res.fundamentalFreq;
            }
        };
        
        checkSession(results.q1);
        checkSession(results.q2);
        checkSession(results.q3);
        
        // Recalculate cents/diff based on the chosen Hz
        const { cents, diffHz } = getToneFromFrequency(bestHz);
        
        setFinalResult({
          fundamentalFreq: bestHz,
          tone: toneData,
          cents,
          diffHz,
          noteName: toneData.name,
          toneDistribution: combinedDistribution,
          stepDistributions: {
            q1: results.q1?.toneDistribution,
            q2: results.q2?.toneDistribution,
            q3: results.q3?.toneDistribution
          }
        });
        return;
      }
    }
    
    // Fallback: If aggregation fails (shouldn't happen if we have data), use the last valid result
    if (results.q3) {
      setFinalResult(results.q3);
    } else if (analysisResult) {
      setFinalResult(analysisResult);
    }
  };

  // Helper to check if current step has a result
  const hasResult = () => {
    if (currentStep === "question1") return !!results.q1;
    if (currentStep === "question2") return !!results.q2;
    if (currentStep === "question3") return !!results.q3;
    return false;
  };

  // Helper to reset current step recording
  const resetStep = () => {
    if (currentStep === "question1") setResults(prev => ({ ...prev, q1: null }));
    if (currentStep === "question2") setResults(prev => ({ ...prev, q2: null }));
    if (currentStep === "question3") setResults(prev => ({ ...prev, q3: null }));
  };

  // Render different content based on current step
  const renderContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-700">
            <div className="space-y-4 max-w-2xl">
              <h1 className="text-4xl md:text-6xl font-bold tracking-tighter text-white">
                MDI <span className="text-orange-500">SYSTEM</span>
              </h1>
              <p className="text-xl text-zinc-400">
                Multidimensionales Identitätssystem
              </p>
              <div className="h-1 w-20 bg-orange-500 mx-auto rounded-full my-8" />
              <p className="text-lg text-zinc-300 leading-relaxed">
                Entdecke deine wahre Frequenz. <br/>
                Eine Reise durch deine Vergangenheit, Gegenwart und Zukunft.
              </p>
            </div>
            <Button 
              size="lg" 
              onClick={nextStep}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-6 text-lg rounded-full shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
            >
              Analyse starten <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        );

      case "preparation":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="w-full max-w-2xl bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-orange-500">VORBEREITUNG</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-left text-zinc-300 text-lg leading-relaxed">
                <p>
                  Finde einen ruhigen Platz, an dem du für die nächsten Minuten ungestört bist.
                </p>
                <p>
                  Achte darauf, dass keine externen Geräusche deine Aufnahme beeinflussen.
                </p>
                <p>
                  Setze dich aufrecht hin, ohne dich anzulehnen. Atme einige Male tief durch die Nase ein, halte kurz den Atem und lasse ihn sanft ausströmen.
                </p>
                <p>
                  Schließe kurz die Augen und lasse störende Gedanken los.
                </p>
                <div className="pt-4 text-center">
                  <p className="text-white font-medium mb-6">Wenn du bereit bist, starte das System.</p>
                  <Button 
                    size="lg" 
                    onClick={nextStep}
                    className="bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-full"
                  >
                    Ich bin bereit
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "question1":
      case "question2":
      case "question3":
        const stepData = {
          question1: { title: "GEGENWART", progress: 33, heading: "Dein heutiger Tag", text: "Erzähle bitte mit normaler Sprechstimme, wie dein heutiger Tag begonnen hat und was du bislang getan hast. Bleibe entspannt und erzähle in ruhiger, dir angenehmer Sprechstimme." },
          question2: { title: "VERGANGENHEIT", progress: 66, heading: "Ein schönes Erlebnis", text: "Erinnere dich an ein wunderschönes Erlebnis aus deinem Leben. Erzähle in dieser freudvollen Stimmung davon." },
          question3: { title: "ZUKUNFT", progress: 100, heading: "Deine Vision", text: "Stimme dich ein auf eine Vision, die du noch umsetzen möchtest. Was treibt dich an und erfüllt dich mit freudiger Erwartung?" }
        }[currentStep];

        const stepHasResult = hasResult();

        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="w-full max-w-3xl space-y-8">
              <div className="flex justify-between items-center text-sm text-zinc-500 mb-4">
                <span>SCHRITT {currentStep === "question1" ? "1" : currentStep === "question2" ? "2" : "3"}/3</span>
                <span>{stepData.title}</span>
              </div>
              <Progress value={stepData.progress} className="h-1 bg-zinc-800" indicatorClassName="bg-orange-500" />
              
              <h2 className="text-3xl font-bold text-white mt-8">{stepData.heading}</h2>
              
              <div className="bg-zinc-900/50 p-8 rounded-2xl border border-zinc-800 text-lg text-zinc-300 leading-relaxed">
                "{stepData.text}"
              </div>

              <div className="flex flex-col items-center justify-center space-y-6 py-8">
                {isRecording ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                    <Button
                      size="lg"
                      variant="destructive"
                      onClick={handleStopRecording}
                      className="h-24 w-24 rounded-full relative z-10 border-4 border-zinc-900 hover:scale-105 transition-all"
                    >
                      <Square className="h-8 w-8 fill-current" />
                    </Button>
                    <p className="mt-4 text-orange-500 animate-pulse font-medium">Aufnahme läuft...</p>
                  </div>
                ) : stepHasResult ? (
                  <div className="space-y-4 animate-in zoom-in duration-300">
                    <div className="h-24 w-24 rounded-full bg-green-500/10 flex items-center justify-center mx-auto border border-green-500/50">
                      <div className="text-green-500 font-bold text-xl">✓</div>
                    </div>
                    <div className="flex gap-4 justify-center">
                        <Button 
                        variant="outline"
                        onClick={resetStep}
                        className="border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 px-6 py-6 rounded-full"
                        >
                        <RotateCcw className="mr-2 h-4 w-4" /> Wiederholen
                        </Button>
                        <Button 
                        onClick={nextStep}
                        className="bg-white text-black hover:bg-zinc-200 px-8 py-6 rounded-full text-lg"
                        >
                        {currentStep === "question3" ? "Ergebnis anzeigen" : "Weiter"} <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                  </div>
                ) : (
                  <Button
                    size="lg"
                    onClick={handleStartRecording}
                    className="h-24 w-24 rounded-full bg-orange-500 hover:bg-orange-600 border-4 border-zinc-900 hover:scale-105 transition-all shadow-[0_0_30px_rgba(249,115,22,0.3)]"
                  >
                    <Mic className="h-8 w-8" />
                  </Button>
                )}
                
                {/* Visualizer is always visible but active only during recording */}
                <div className="w-full h-32 mt-8">
                  <SpectrumVisualizer frequencyData={analysisResult?.spectrum || new Uint8Array(0)} isActive={isRecording} />
                </div>
              </div>
            </div>
          </div>
        );

      case "analyzing":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full animate-pulse" />
                <Loader2 className="h-24 w-24 animate-spin text-orange-500 relative z-10" />
            </div>
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-white">Daten werden verarbeitet</h2>
                <p className="text-zinc-400">Vergangenheit, Gegenwart und Zukunft werden synchronisiert...</p>
            </div>
          </div>
        );

      case "result":
        // Use finalResult or fallback to analysisResult
        const res = finalResult || analysisResult;
        
        if (!res) return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
            <p className="mt-4 text-zinc-400">Ergebnis wird geladen...</p>
          </div>
        );

        // We use the properties directly from the result object which matches AnalysisResult interface
        const tone = res.tone;
        const cents = res.cents;
        const centsText = cents > 0 ? `+${cents}` : `${cents}`;

        return (
          <div className="space-y-8 animate-in fade-in duration-1000">
            {/* Header */}
            <div className="text-center space-y-2">
              <div className="inline-block px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 text-xs font-medium tracking-wider mb-4">
                ANALYSE ABGESCHLOSSEN
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter text-white">
                {tone.name}
                <span className="text-2xl md:text-3xl text-zinc-500 font-normal ml-2">
                  {centsText} Cent
                </span>
              </h1>
              <p className="text-orange-500 font-mono text-lg">
                {res.fundamentalFreq.toFixed(2)} Hz
              </p>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-12">
              
              {/* Left Column: Profile */}
              <div className="space-y-6">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="text-zinc-400 text-sm font-medium tracking-wider">
                      IDENTITÄTS-PROFIL
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <h3 className="text-2xl font-bold text-white mb-2">{tone.character}</h3>
                      <p className="text-zinc-400 leading-relaxed">
                        Deine Stimme zeigt eine starke Resonanz im Bereich {tone.name}. 
                        Dies steht für {tone.character.toLowerCase()} Qualitäten.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                        <div className="text-xs text-zinc-500 mb-1">GEOMETRIE</div>
                        <div className="text-white font-medium">{tone.geometry}</div>
                      </div>
                      <div className="p-4 rounded-lg bg-zinc-950/50 border border-zinc-800/50">
                        <div className="text-xs text-zinc-500 mb-1">FARBE</div>
                        <div className="text-white font-medium">{tone.color}</div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-4">
                      <div className="flex justify-between text-sm">
                        <span className="text-zinc-500">Intuitiv</span>
                        <span className="text-white">{tone.dimensions.intuitive}/10</span>
                      </div>
                      <Progress value={tone.dimensions.intuitive * 10} className="h-1 bg-zinc-800" indicatorClassName="bg-white" />
                      
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-zinc-500">Intellektuell</span>
                        <span className="text-white">{tone.dimensions.intellectual}/10</span>
                      </div>
                      <Progress value={tone.dimensions.intellectual * 10} className="h-1 bg-zinc-800" indicatorClassName="bg-white" />
                      
                      <div className="flex justify-between text-sm mt-2">
                        <span className="text-zinc-500">Emotional</span>
                        <span className="text-white">{tone.dimensions.emotional}/10</span>
                      </div>
                      <Progress value={tone.dimensions.emotional * 10} className="h-1 bg-zinc-800" indicatorClassName="bg-white" />
                    </div>
                  </CardContent>
                </Card>

                <div className="flex gap-4 flex-col">
                  <div className="flex gap-4">
                    <Button 
                      variant="outline" 
                      className="flex-1 h-14 border-zinc-800 hover:bg-zinc-800 text-white"
                      onClick={() => isPlaying ? stopTone() : playTone(res.fundamentalFreq, currentOctaveShift, currentFineTune, isPureSineMode)}
                    >
                      {isPlaying ? <VolumeX className="mr-2 h-4 w-4" /> : <Volume2 className="mr-2 h-4 w-4" />}
                      {isPlaying ? "Stop" : "Grundton hören"}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="flex-1 h-14 border-zinc-800 hover:bg-zinc-800 text-white"
                      onClick={() => playChord(res.fundamentalFreq, currentOctaveShift, currentFineTune)}
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Akkord abspielen
                    </Button>
                  </div>
                  
                  {/* Octave Controls */}
                  <div className="flex items-center justify-center gap-4 py-2 bg-zinc-900/30 rounded-lg border border-zinc-800/50">
                    <span className="text-xs text-zinc-500 uppercase tracking-wider">Oktave</span>
                    <div className="flex items-center gap-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400"
                        onClick={() => setCurrentOctaveShift(prev => prev - 1)}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <span className="text-sm font-mono text-white w-8 text-center">
                        {currentOctaveShift > 0 ? `+${currentOctaveShift}` : currentOctaveShift}
                      </span>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-8 w-8 p-0 hover:bg-zinc-800 text-zinc-400"
                        onClick={() => setCurrentOctaveShift(prev => prev + 1)}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* EXPERT MODE TOGGLE */}
                  <Collapsible
                    open={isExpertOpen}
                    onOpenChange={setIsExpertOpen}
                    className="w-full space-y-2 border border-zinc-800 rounded-lg p-2 bg-zinc-950/30"
                  >
                    <div className="flex items-center justify-between px-2">
                        <div className="flex items-center gap-2 text-xs text-zinc-500 font-medium">
                            <Settings className="h-3 w-3" /> EXPERTEN-MODUS
                        </div>
                        <CollapsibleTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-9 p-0 h-6">
                                <ChevronRight className={cn("h-4 w-4 transition-transform", isExpertOpen && "rotate-90")} />
                                <span className="sr-only">Toggle</span>
                            </Button>
                        </CollapsibleTrigger>
                    </div>
                    
                    <CollapsibleContent className="space-y-4 pt-2 px-2">
                        {/* 432 Hz Switch */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="432-mode" className="text-sm text-zinc-300">432 Hz Referenz</Label>
                            <Switch 
                                id="432-mode" 
                                checked={is432Hz}
                                onCheckedChange={setIs432Hz}
                            />
                        </div>

                        {/* Pure Sine Switch */}
                        <div className="flex items-center justify-between">
                            <Label htmlFor="sine-mode" className="text-sm text-zinc-300">Reiner Sinus (Kalibrierung)</Label>
                            <Switch 
                                id="sine-mode" 
                                checked={isPureSineMode}
                                onCheckedChange={setIsPureSineMode}
                            />
                        </div>

                        {/* Fine Tune Slider */}
                        <div className="space-y-3 pt-2">
                            <div className="flex justify-between">
                                <Label className="text-xs text-zinc-400">Feinabstimmung (Cents)</Label>
                                <span className="text-xs font-mono text-orange-500">{currentFineTune > 0 ? '+' : ''}{currentFineTune}</span>
                            </div>
                            <Slider
                                defaultValue={[0]}
                                max={100}
                                min={-100}
                                step={1}
                                value={[currentFineTune]}
                                onValueChange={(val) => setCurrentFineTune(val[0])}
                                className="py-2"
                            />
                        </div>
                    </CollapsibleContent>
                  </Collapsible>
                  
                  {isPlaying && playingFreq && (
                    <div className="text-center text-xs text-orange-500 animate-pulse font-mono border border-orange-500/30 bg-orange-500/10 py-2 rounded">
                      <Activity className="h-3 w-3 inline mr-2" />
                      OUTPUT: {playingFreq.toFixed(2)} Hz
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Visual Generation */}
              <div className="space-y-6">
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-black border border-zinc-800 shadow-2xl">
                  {/* Abstract Geometric Representation based on Tone */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    {/* Base Glow */}
                    <div 
                      className="absolute inset-0 opacity-30 blur-[100px]"
                      style={{ backgroundColor: tone.color }} 
                    />
                    
                    {/* Geometric Shapes - Generative Art Placeholder */}
                    <div className="relative z-10 w-3/4 h-3/4 border border-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                      <div 
                        className="w-2/3 h-2/3 border border-white/40 flex items-center justify-center"
                        style={{ 
                          borderRadius: tone.geometry.includes("kreis") ? "50%" : "0%",
                          transform: `rotate(${cents}deg)`
                        }}
                      >
                        <div 
                          className="w-1/2 h-1/2 bg-white/10 backdrop-blur-md border border-white/60"
                          style={{ 
                            borderRadius: tone.geometry.includes("kreis") ? "50%" : "0%",
                            boxShadow: `0 0 50px ${tone.color}`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                    <div>
                      <div className="text-xs text-zinc-500 font-mono mb-1">MDI GENERATION</div>
                      <div className="text-white font-mono text-sm">#{Math.floor(res.fundamentalFreq * 100)}</div>
                    </div>
                    <Button size="icon" variant="ghost" className="text-white hover:bg-white/10">
                      <Download className="h-5 w-5" />
                    </Button>
                  </div>
                </div>
                
                {/* Frequency Distribution Chart */}
                {res.toneDistribution && (
                  <FrequencyChart 
                    distribution={res.toneDistribution} 
                    stepDistributions={res.stepDistributions}
                  />
                )}
              </div>
            </div>
            
            <div className="text-center pt-12 pb-8">
               <Button 
                variant="ghost" 
                onClick={() => window.location.reload()}
                className="text-zinc-500 hover:text-white"
              >
                Neue Analyse starten
              </Button>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-orange-500/30">
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Navbar */}
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-sm" />
            <span className="font-bold text-xl tracking-tight text-white">MDI</span>
          </div>
          <div className="text-xs font-mono text-zinc-600">
            BETA 1.1
          </div>
        </header>

        <main>
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
