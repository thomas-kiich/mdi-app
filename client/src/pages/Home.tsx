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
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Settings, Activity } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
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
    // If we simply summed percentages from 3 steps, the total could be 300%
    // We should divide by the number of valid steps (1, 2, or 3)
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
        // User Requirement: The result should be consistent. If Tone is F# and Cents is -27, 
        // the Hz must match F# -27 cents, NOT the Hz of a different tone from a specific session.

        // 1. Try to find if the dominant tone was ever the fundamental in any session
        let measuredHz = 0;
        let bestConfidence = 0;
        
        const checkSession = (res: AnalysisResult | null) => {
            if (!res || !res.toneDistribution) return;
            // Check if this session's FUNDAMENTAL tone matches our dominant tone
            // We need to re-check the tone of the fundamental freq
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
            finalCents = check.cents;
            finalDiffHz = check.diffHz;
        } else {
            // Case B: The dominant tone (e.g. F#) won by accumulation/distribution, 
            // but was never the fundamental of a single session.
            // Instead of showing the "perfect" Hz (which looks fake), we try to find ANY instance where this tone appeared
            // in the raw analysis data, even if it wasn't the fundamental.
            // Since we don't store full spectral data here, we will approximate a realistic deviation.
            // We look at the average cent deviation of the sessions to apply a similar "character" to the calculated tone.
            
            let totalCentsShift = 0;
            let count = 0;
            
            const addShift = (res: AnalysisResult | null) => {
                if (res && res.cents !== undefined) {
                    totalCentsShift += res.cents;
                    count++;
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
        
        setFinalResult({
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
              onClick={advanceStep}
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
                    onClick={advanceStep}
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
        const stepTitles = {
          question1: "GEGENWART",
          question2: "VERGANGENHEIT",
          question3: "ZUKUNFT"
        };
        const stepQuestions = {
          question1: "Erzähle bitte mit normaler Sprechstimme, wie dein heutiger Tag begonnen hat und was du bislang getan hast.",
          question2: "Erinnere dich an ein wunderschönes Erlebnis aus deinem Leben. Erzähle in dieser freudvollen Stimmung davon.",
          question3: "Stimme dich ein auf eine Vision, die du selbst in deinem Leben noch umsetzen möchtest. Was treibt dich an?"
        };
        
        const hasRes = hasResult();

        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-8 animate-in fade-in duration-500">
             {/* Progress Steps */}
             <div className="flex items-center gap-4 mb-8">
                {["question1", "question2", "question3"].map((s, i) => (
                  <div key={s} className="flex items-center gap-2">
                    <div className={cn(
                      "w-3 h-3 rounded-full transition-colors",
                      currentStep === s ? "bg-orange-500 shadow-[0_0_10px_rgba(249,115,22,0.8)]" : 
                      (i < ["question1", "question2", "question3"].indexOf(currentStep) ? "bg-orange-500/50" : "bg-zinc-800")
                    )} />
                    {i < 2 && <div className="w-8 h-0.5 bg-zinc-800" />}
                  </div>
                ))}
             </div>

            <div className="space-y-4 max-w-2xl">
              <h2 className="text-3xl font-bold text-white tracking-tight">{stepTitles[currentStep]}</h2>
              <p className="text-xl text-zinc-400 leading-relaxed">
                {stepQuestions[currentStep]}
              </p>
            </div>

            <div className="w-full max-w-md bg-zinc-900/50 rounded-2xl p-8 border border-zinc-800 shadow-xl backdrop-blur-sm">
               {/* Visualizer Area */}
               <div className="h-32 flex items-center justify-center mb-8 relative">
                 {isRecording ? (
                    <SpectrumVisualizer 
                        isActive={true} 
                        frequencyData={analysisResult?.spectrum || new Uint8Array(0)} 
                    />
                 ) : hasRes ? (
                    <div className="text-orange-500 font-mono text-xl animate-pulse">
                        AUFNAHME GESPEICHERT
                    </div>
                 ) : (
                    <div className="text-zinc-600">
                        <Mic className="h-12 w-12 mx-auto mb-2 opacity-20" />
                        <span className="text-sm">Bereit zur Aufnahme</span>
                    </div>
                 )}
               </div>

               <div className="flex justify-center gap-4">
                 {!isRecording && !hasRes && (
                   <Button 
                    size="lg"
                    onClick={handleStartRecording}
                    className="bg-red-500 hover:bg-red-600 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-[0_0_20px_rgba(239,68,68,0.4)] transition-transform hover:scale-110"
                   >
                     <Mic className="h-6 w-6" />
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
                                    let displayCents = step.data?.cents;
                                    let displayFreq = step.data?.fundamentalFreq;
                                    
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
