import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SpectrumVisualizer } from "@/components/SpectrumVisualizer";
import { FrequencyChart } from "@/components/FrequencyChart";
import { SpectralMatrix } from '@/components/SpectralMatrix'; // Import new component
import { SoundBody } from '@/components/SoundBody'; // Import new component
import { useAudioAnalyzer, AnalysisResult } from "@/hooks/useAudioAnalyzer";
import { useSoundGenerator } from "@/hooks/useSoundGenerator";
import { useLongitudinalStudy } from "@/hooks/useLongitudinalStudy";
import { InterpretationView } from "@/components/InterpretationView";
import { ConnectionStory } from "@/components/ConnectionStory";
import { SpectralScanner } from "@/components/SpectralScanner";
import { VitalDashboard } from "@/components/VitalDashboard";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Settings, Activity, Sparkles, X } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
  const [, setLocation] = useLocation();
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

  const {
    daysCompleted,
    isComplete: isStudyComplete,
    finalResult: studyResult,
    saveDailyResult
  } = useLongitudinalStudy();

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
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showSpectralScanner, setShowSpectralScanner] = useState(false);
  const [showVitalDashboard, setShowVitalDashboard] = useState(false);

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

  // CORRECT NAVIGATION LOGIC
  const advanceStep = () => {
      if (currentStep === "intro") setCurrentStep("preparation");
      else if (currentStep === "preparation") setCurrentStep("question1");
      else if (currentStep === "question1") setCurrentStep("question2");
      else if (currentStep === "question2") setCurrentStep("question3");
      else if (currentStep === "question3") {
          setCurrentStep("analyzing");
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
    
    // Normalize to 100%
    let validSteps = 0;
    if (results.q1) validSteps++;
    if (results.q2) validSteps++;
    if (results.q3) validSteps++;
    
    if (validSteps > 0) {
        for (const tone in combinedDistribution) {
            combinedDistribution[tone] /= validSteps;
        }
    }

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
        // Determine the "Final Hz" for the result.
        // FIX: Ensure the Hz matches the Tone (F) and not some distant frequency (A).
        // If the deviation is too large (> 50 cents), clamp it or reset to 0.

        // 1. Try to find if the dominant tone was ever the fundamental in any session
        let measuredHz = 0;
        let bestConfidence = 0;
        
        const checkSession = (res: AnalysisResult | null) => {
            if (!res || !res.toneDistribution) return;
            // Check if this session's FUNDAMENTAL tone matches our dominant tone
            const fundCheck = getToneFromFrequency(res.fundamentalFreq);
            
            if (fundCheck.tone.name === dominantToneName) {
                // This session actually measured our dominant tone as the fundamental!
                // We prefer this real measurement.
                const score = res.toneDistribution[dominantToneName] || 0;
                if (score > bestConfidence) {
                    bestConfidence = score;
                    measuredHz = res.fundamentalFreq;
                }
            }
        };
        
        checkSession(results.q1);
        checkSession(results.q2);
        checkSession(results.q3);

        let finalHz = 0;
        let finalCents = 0;
        let finalDiffHz = 0;

        if (measuredHz > 0) {
            // Case A: We have a real measurement of this tone
            finalHz = measuredHz;
            const check = getToneFromFrequency(finalHz);
            
            // Double check: Is the measured Hz really close to the target tone?
            // If check.tone.name is NOT dominantToneName, then something is wrong with getToneFromFrequency or the measurement.
            if (check.tone.name === dominantToneName) {
                 finalCents = check.cents;
                 finalDiffHz = check.diffHz;
            } else {
                 // Fallback: The measurement drifted too far. Reset to ideal freq.
                 finalHz = toneData.frequency;
                 finalCents = 0;
                 finalDiffHz = 0;
            }
        } else {
            // Case B: The dominant tone (e.g. F#) won by accumulation/distribution, 
            // but was never the fundamental of a single session.
            // We use the IDEAL frequency of the dominant tone.
            
            // We can try to apply a small average shift from the sessions, but ONLY if it's small.
            let totalCentsShift = 0;
            let count = 0;
            
            const addShift = (res: AnalysisResult | null) => {
                if (res && res.cents !== undefined) {
                    // Only include shifts that are reasonable (< 50 cents)
                    if (Math.abs(res.cents) < 50) {
                        totalCentsShift += res.cents;
                        count++;
                    }
                }
            };
            addShift(results.q1);
            addShift(results.q2);
            addShift(results.q3);
            
            const avgShift = count > 0 ? totalCentsShift / count : 0;
            
            // Apply this average shift to the ideal frequency of the dominant tone
            // Formula: f = f0 * 2^(cents/1200)
            finalHz = toneData.frequency * Math.pow(2, avgShift / 1200);
            finalCents = avgShift;
            finalDiffHz = finalHz - toneData.frequency;
        }
        
        // FINAL SAFETY CHECK: Cap Cents at +/- 50
        if (Math.abs(finalCents) > 50) {
            console.warn(`Large cent deviation detected (${finalCents}). Clamping to 0.`);
            finalCents = 0;
            finalHz = toneData.frequency;
            finalDiffHz = 0;
        }

        const result = {
          fundamentalFreq: finalHz,
          tone: toneData,
          cents: finalCents,
          diffHz: finalDiffHz,
          noteName: toneData.name,
          toneDistribution: combinedDistribution,
          stepDistributions: {
            q1: results.q1?.toneDistribution,
            q2: results.q2?.toneDistribution,
            q3: results.q3?.toneDistribution
          },
          isSpeaking: false,
          spectrum: new Uint8Array(0),
          volume: 0
        };

        setFinalResult(result);
        
        // Save to longitudinal study
        saveDailyResult(result);
        
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

  const renderContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-700">
            <div className="relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-red-600 rounded-full blur opacity-25 animate-pulse"></div>
                <h1 className="relative text-6xl md:text-8xl font-bold tracking-tighter text-white mb-4">
                MDI <span className="text-orange-500">SYSTEM</span>
                </h1>
            </div>
            <p className="text-xl text-zinc-400 max-w-2xl font-light tracking-wide">
              Multidimensionales Identitätssystem
            </p>
            
            <div className="w-16 h-1 bg-orange-500 rounded-full my-8" />

            <p className="text-lg text-zinc-300 max-w-xl leading-relaxed">
              Entdecke deine wahre Frequenz.<br/>
              Eine Reise durch deine Vergangenheit, Gegenwart und Zukunft.
            </p>

            <div className="flex flex-col gap-4 pt-8">
                <Button 
                size="lg"
                className="bg-orange-500 hover:bg-orange-600 text-white rounded-full px-12 py-8 text-lg font-medium shadow-[0_0_30px_rgba(249,115,22,0.3)] transition-all hover:scale-105"
                onClick={advanceStep}
                >
                Analyse starten <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                
                <div className="flex gap-4 justify-center mt-4 flex-wrap">
                    <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setShowStory(true)}>
                        <Play className="mr-2 h-4 w-4" /> Das Prinzip entdecken
                    </Button>
                    <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setLocation("/guide/pendulum")}>
                        <Sparkles className="mr-2 h-4 w-4" /> Anleitung
                    </Button>
                    <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setShowSpectralScanner(true)}>
                        <Activity className="mr-2 h-4 w-4" /> Live Spektrum
                    </Button>
                    <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setShowVitalDashboard(true)}>
                        <Activity className="mr-2 h-4 w-4" /> Vital Monitor
                    </Button>
                </div>
            </div>
          </div>
        );

      case "preparation":
        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
            <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-2xl text-center text-white">Vorbereitung</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 text-zinc-300">
                <p>
                  Wir werden nun deine Stimme in drei Dimensionen analysieren.
                  Bitte antworte spontan und authentisch auf die folgenden drei Fragen.
                </p>
                <ul className="space-y-4 list-disc list-inside text-zinc-400 ml-4">
                  <li>Sorge für eine ruhige Umgebung</li>
                  <li>Sprich in deiner normalen Stimmlage</li>
                  <li>Nimm dir für jede Antwort ca. 10-20 Sekunden Zeit</li>
                </ul>
                <div className="pt-6 flex justify-center">
                  <Button onClick={advanceStep} className="bg-white text-black hover:bg-zinc-200 rounded-full px-8">
                    Bereit <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case "question1":
      case "question2":
      case "question3":
        const questions = {
          question1: {
            title: "Dimension 1: Die Gegenwart",
            text: "Wie fühlst du dich in diesem Moment? Was bewegt dich gerade jetzt?",
            hint: "Beschreibe deinen aktuellen Zustand."
          },
          question2: {
            title: "Dimension 2: Die Vergangenheit",
            text: "Was ist deine prägendste Erinnerung aus der Kindheit?",
            hint: "Erzähle kurz von einem Moment, der geblieben ist."
          },
          question3: {
            title: "Dimension 3: Die Zukunft",
            text: "Was ist dein größter Wunsch oder deine Vision für dich selbst?",
            hint: "Wo möchtest du hin? Was zieht dich an?"
          }
        };
        
        const q = questions[currentStep];
        const hasRes = hasResult();

        return (
          <div className="max-w-2xl mx-auto space-y-8 animate-in slide-in-from-right duration-500">
            <div className="flex justify-between text-xs uppercase tracking-widest text-zinc-500 mb-4">
                <span>Analyse läuft</span>
                <span>Schritt {currentStep === "question1" ? 1 : currentStep === "question2" ? 2 : 3} / 3</span>
            </div>
            
            <div className="text-center space-y-6">
               <h2 className="text-xl text-orange-500 font-mono">{q.title}</h2>
               <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">{q.text}</h3>
               <p className="text-zinc-400 italic">{q.hint}</p>
            </div>

            <div className="flex flex-col items-center justify-center py-12 space-y-8">
               
               {/* Visualizer Circle */}
               <div className="relative w-64 h-64 flex items-center justify-center">
                  {isRecording ? (
                    <div className="absolute inset-0 bg-orange-500/20 rounded-full animate-pulse" />
                  ) : (
                    <div className="absolute inset-0 border border-zinc-800 rounded-full" />
                  )}
                  
                  {/* Real-time Visualizer */}
                  <div className="w-48 h-16">
                    <SpectrumVisualizer 
                        frequencyData={analysisResult?.spectrum || new Uint8Array(0)} 
                        isActive={isRecording}
                    />
                  </div>
               </div>

               {/* Controls */}
               <div className="flex flex-col items-center gap-4">
                 {!isRecording && !hasRes && (
                   <Button 
                    size="lg"
                    onClick={handleStartRecording}
                    className="bg-orange-500 hover:bg-orange-600 text-white rounded-full w-20 h-20 flex items-center justify-center shadow-[0_0_30px_rgba(249,115,22,0.4)] transition-transform hover:scale-110"
                   >
                     <Mic className="h-8 w-8" />
                   </Button>
                 )}

                 {isRecording && (
                   <Button 
                    size="lg"
                    onClick={handleStopRecording}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white rounded-full w-16 h-16 flex items-center justify-center border border-zinc-700"
                   >
                     <Square className="h-6 w-6 fill-current" />
                   </Button>
                 )}

                 {hasRes && (
                    <div className="flex gap-4">
                        <Button 
                            variant="outline"
                            onClick={resetStep}
                            className="rounded-full border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                        >
                            <RotateCcw className="mr-2 h-4 w-4" /> Wiederholen
                        </Button>
                        <Button 
                            onClick={advanceStep}
                            className="bg-white text-black hover:bg-zinc-200 rounded-full px-8"
                        >
                            Weiter <ChevronRight className="ml-2 h-4 w-4" />
                        </Button>
                    </div>
                 )}
               </div>
            </div>
          </div>
        );

      case "analyzing":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 animate-in fade-in duration-500">
            <Loader2 className="h-16 w-16 text-orange-500 animate-spin" />
            <p className="text-xl text-zinc-400 animate-pulse">
              Berechne multidimensionale Resonanz...
            </p>
          </div>
        );

      case "result":
        const res = finalResult || analysisResult;
        if (!res) return <div>Kein Ergebnis verfügbar.</div>;

        const { tone, cents, noteName } = res;
        
        // Calculate display values
        const displayHz = res.fundamentalFreq.toFixed(2); 
        
        // Calculate playback frequency (including octave shift)
        const baseFreq = res.fundamentalFreq;
        const factor = Math.pow(2, currentOctaveShift);
        const finalFreq = baseFreq * factor;

        return (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-700 pb-20">
            {/* Top Navigation for Result View */}
            <div className="absolute top-4 right-4 md:top-8 md:right-8">
                <Button 
                    variant="ghost" 
                    onClick={() => window.location.reload()}
                    className="text-zinc-500 hover:text-white"
                >
                    <X className="mr-2 h-4 w-4" /> Zur Übersicht
                </Button>
            </div>

            <div className="text-center mb-12">
              <h2 className="text-sm font-mono text-orange-500 mb-2 tracking-widest uppercase">Deine MDI Signatur</h2>
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-tighter">
                {noteName} <span className="text-2xl text-zinc-500 font-normal align-top">{cents > 0 ? '+' : ''}{Math.round(cents)} cent</span>
              </h1>
              <div className="inline-flex items-center px-4 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400 font-mono text-sm">
                {displayHz} Hz
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Left Column: Analysis & Sound */}
              <div className="space-y-6">
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden">
                  <CardHeader>
                    <CardTitle className="text-zinc-300 flex items-center gap-2">
                      <Volume2 className="h-5 w-5 text-orange-500" />
                      Resonanz-Check
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <p className="text-zinc-400 text-sm leading-relaxed">
                      Dies ist dein identifizierter Grundton. Er verbindet deine zeitlichen Dimensionen.
                      Höre ihn dir an und spüre die Resonanz.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                      <Button 
                        size="lg" 
                        onClick={() => isPlaying ? stopTone() : playTone(finalFreq, 0, currentFineTune, isPureSineMode)}
                        className={cn(
                          "w-full py-8 text-lg rounded-xl transition-all",
                          isPlaying 
                            ? "bg-orange-500/20 text-orange-500 border border-orange-500/50 shadow-[0_0_20px_rgba(249,115,22,0.2)]" 
                            : "bg-white text-black hover:bg-zinc-200"
                        )}
                      >
                        {isPlaying ? (
                          <>
                            <Square className="mr-3 h-5 w-5 fill-current" /> Stop
                          </>
                        ) : (
                          <>
                            <Play className="mr-3 h-5 w-5 fill-current" /> Grundton hören
                          </>
                        )}
                      </Button>
                      
                      {/* Octave Control */}
                      <div className="flex items-center justify-between bg-black/40 p-3 rounded-lg border border-zinc-800">
                        <span className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Oktave</span>
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
                                <span className="text-sm text-zinc-300">432 Hz Referenz</span>
                                <Switch 
                                    checked={is432Hz}
                                    onCheckedChange={setIs432Hz}
                                />
                            </div>

                            {/* Pure Sine Switch */}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-zinc-300">Reiner Sinus (Kalibrierung)</span>
                                <Switch 
                                    checked={isPureSineMode}
                                    onCheckedChange={setIsPureSineMode}
                                />
                            </div>

                            {/* Fine Tune Slider */}
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between">
                                    <span className="text-xs text-zinc-400">Feinabstimmung (Cents)</span>
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
                  </CardContent>
                </Card>
                
                {/* Detail Analysis Table */}
                <Card className="bg-zinc-900/50 border-zinc-800 backdrop-blur-sm overflow-hidden">
                    <CardHeader>
                        <CardTitle className="text-zinc-300 text-sm uppercase tracking-wider">Detail-Analyse</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow className="border-zinc-800 hover:bg-transparent">
                                    <TableHead className="text-zinc-500">Phase</TableHead>
                                    <TableHead className="text-zinc-500">Ton</TableHead>
                                    <TableHead className="text-zinc-500 text-right">Frequenz</TableHead>
                                    <TableHead className="text-zinc-500 text-right">Info</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {[
                                    { name: "Gegenwart", data: results.q1 },
                                    { name: "Vergangenheit", data: results.q2 },
                                    { name: "Zukunft", data: results.q3 }
                                ].map((step) => {
                                    // RE-CALCULATE TONE FOR DISPLAY TO ENSURE CONSISTENCY
                                    let displayTone = step.data?.noteName || "-";
                                    let displayFreq = step.data?.fundamentalFreq;
                                    let displayCents = step.data?.cents;
                                    
                                    if (displayFreq) {
                                        const check = getToneFromFrequency(displayFreq);
                                        displayTone = check.tone.name;
                                        displayCents = check.cents;
                                    }

                                    return (
                                    <TableRow key={step.name} className="border-zinc-800 hover:bg-zinc-800/50">
                                        <TableCell className="font-medium text-zinc-300">{step.name}</TableCell>
                                        <TableCell className="text-white">
                                            {displayTone}
                                        </TableCell>
                                        <TableCell className="text-right font-mono text-orange-500">
                                            {displayFreq ? `${displayFreq.toFixed(2)} Hz` : "-"}
                                        </TableCell>
                                        <TableCell className="text-right text-xs text-zinc-500">
                                            {step.data?.correctionNote ? (
                                                <span className="text-orange-400" title={step.data.correctionNote}>Korr.</span>
                                            ) : (
                                                <span>{displayCents !== undefined ? `${displayCents > 0 ? '+' : ''}${Math.round(displayCents)} ct` : ""}</span>
                                            )}
                                        </TableCell>
                                    </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
              </div>

              {/* Right Column: Visual Generation */}
              <div className="space-y-6">
                {/* Abstract Square Removed as requested */}
                
                {/* NEW: Spectral Resonance Matrix */}
                {res.toneDistribution && (
                    <SpectralMatrix toneDistribution={res.toneDistribution} />
                )}

                {/* NEW: Sound Body Visualization */}
                {res.toneDistribution && (
                    <SoundBody 
                        toneDistribution={res.toneDistribution} 
                        dominantToneName={res.tone.name} 
                    />
                )}
                
                {/* Legacy Frequency Distribution Chart (Optional, kept for reference if needed) */}
                {/* 
                {res.toneDistribution && (
                  <FrequencyChart 
                    distribution={res.toneDistribution} 
                    stepDistributions={res.stepDistributions}
                  />
                )}
                */}
              </div>
            </div>
            
            <div className="flex flex-col items-center gap-6 pt-12 pb-20">
              <div className="flex gap-4 flex-wrap justify-center">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => window.location.reload()}
                  className="rounded-full border-zinc-700 hover:bg-zinc-800 text-zinc-300"
                >
                  <RotateCcw className="mr-2 h-4 w-4" />
                  Neue Analyse
                </Button>
                
                <Button 
                  size="lg"
                  className="rounded-full bg-white text-black hover:bg-zinc-200"
                  onClick={() => setShowInterpretation(true)}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  Deutung lesen
                </Button>

                <Button 
                  size="lg"
                  className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white"
                  onClick={() => setShowSpectralScanner(true)}
                >
                  <Activity className="mr-2 h-4 w-4" />
                  Live-Scanner & Training
                </Button>

                <Button 
                  size="lg"
                  className="rounded-full bg-orange-500 hover:bg-orange-600 text-white"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Ergebnis speichern
                </Button>
              </div>
            </div>

            {showInterpretation && res && (
                <InterpretationView 
                  innerTone={res.tone}
                  outerTone={TONES[(TONES.findIndex(t => t.name === res.tone.name) + 6) % 12]}
                  onClose={() => setShowInterpretation(false)}
                />
            )}
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
          {showStory ? (
            <ConnectionStory onClose={() => setShowStory(false)} />
          ) : showSpectralScanner ? (
            <SpectralScanner 
              onClose={() => setShowSpectralScanner(false)} 
              forcedFrequency={finalResult?.fundamentalFreq}
            />
          ) : showVitalDashboard ? (
            <VitalDashboard onClose={() => setShowVitalDashboard(false)} />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
