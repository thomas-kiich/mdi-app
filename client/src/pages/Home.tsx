import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { SpectrumVisualizer } from "@/components/SpectrumVisualizer";
import { FrequencyChart } from "@/components/FrequencyChart";
import { SpectralMatrix } from '@/components/SpectralMatrix'; // Import new component
import { FrequencyTable } from '@/components/FrequencyTable'; // Import new component
import { SoundBody } from '@/components/SoundBody'; // Import new component
import { useAudioAnalyzer, AnalysisResult } from "@/hooks/useAudioAnalyzer";
import { useSoundGenerator } from "@/hooks/useSoundGenerator";
import { useLongitudinalStudy } from "@/hooks/useLongitudinalStudy";
import { InterpretationView } from "@/components/InterpretationView";
import { ConnectionStory } from "@/components/ConnectionStory";
import { SpectralScanner } from "@/components/SpectralScanner";
import { VitalDashboard } from "@/components/VitalDashboard";
import { IntervalTrainer } from "@/components/IntervalTrainer";
import { Method36Trainer } from "@/components/Method36Trainer";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Settings, Activity, Sparkles, X, Music2, User, ArrowRight, HeartPulse, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import frequencyData from '@/lib/frequencyData.json';
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
    mdiResult: studyMdiResult,
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
  const [mdiResult, setMdiResult] = useState<typeof frequencyData[0] | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showSpectralScanner, setShowSpectralScanner] = useState(false);
  const [showVitalDashboard, setShowVitalDashboard] = useState(false);
  const [showIntervalTrainer, setShowIntervalTrainer] = useState(false);
  const [showFrequencyTable, setShowFrequencyTable] = useState(false);
  const [showDirectTrainer, setShowDirectTrainer] = useState(false);

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
    
    const combinedMdiDistribution: Record<string, number> = {};

    const processResult = (res: AnalysisResult | null) => {
      if (!res || !res.toneDistribution) return;
      
      for (const [tone, percent] of Object.entries(res.toneDistribution)) {
        if (!combinedDistribution[tone]) combinedDistribution[tone] = 0;
        // Add weighted contribution
        combinedDistribution[tone] += percent;
      }
      
      if (res.mdiDistribution) {
        for (const [id, percent] of Object.entries(res.mdiDistribution)) {
          if (!combinedMdiDistribution[id]) combinedMdiDistribution[id] = 0;
          combinedMdiDistribution[id] += percent;
        }
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
        for (const id in combinedMdiDistribution) {
            combinedMdiDistribution[id] /= validSteps;
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
            
            // Calculate Hz from shift relative to ideal
            // Hz = Ideal * 2^(cents/1200)
            finalHz = toneData.frequency * Math.pow(2, avgShift / 1200);
            finalCents = avgShift;
            finalDiffHz = finalHz - toneData.frequency;
        }

        const result: AnalysisResult = {
          tone: toneData,
          fundamentalFreq: finalHz,
          cents: finalCents,
          diffHz: finalDiffHz,
          // confidence: maxScore, // Removed as not in type
          noteName: dominantToneName,
          toneDistribution: combinedDistribution,
          mdiDistribution: combinedMdiDistribution,
          isSpeaking: false, // Default for final result
          spectrum: new Uint8Array(0), // Empty spectrum for final result
          volume: 0 // Default volume
        };
        
        setFinalResult(result);

        // Find best matching MDI type
        // Strategy: Use the combinedMdiDistribution to find the winner
        let maxMdiScore = 0;
        let bestMdiId = "1";
        
        for (const [id, score] of Object.entries(combinedMdiDistribution)) {
            if (score > maxMdiScore) {
                maxMdiScore = score;
                bestMdiId = id;
            }
        }
        
        const mdiMatch = frequencyData.find(f => f.id.toString() === bestMdiId);
        setMdiResult(mdiMatch || frequencyData[0]);

        // Save to longitudinal study
        if (mdiMatch) {
            // Construct a complete AnalysisResult object for the daily save
            const dailyResult: AnalysisResult = {
                ...result, // Use the measured result data (freq, tone, etc.)
                // Add MDI specific properties if needed by the longitudinal study, 
                // but usually it expects the AnalysisResult structure.
                // However, saveDailyResult in useLongitudinalStudy might be expecting just the MDI type or the full result.
                // Looking at the error, saveDailyResult expects AnalysisResult, but we passed mdiMatch (which is just the JSON entry).
                // Let's pass the 'result' object which is of type AnalysisResult, but we should probably attach the mdiMatch info to it if needed.
                // Actually, let's check useLongitudinalStudy definition.
                // Assuming saveDailyResult takes the MDI match object based on previous code context, but the error says it expects AnalysisResult.
                // Let's pass 'result' which IS the AnalysisResult.
            };
            // Wait, the error says: Argument of type '{ ... }' (mdiMatch) is not assignable to parameter of type 'AnalysisResult'.
            // So saveDailyResult expects AnalysisResult.
            saveDailyResult(result); 
        }
      }
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "intro":
        return (
          <div className="flex flex-col items-center justify-center min-h-[70vh] animate-in fade-in duration-700">
            <div className="relative mb-12 group">
              <div className="absolute inset-0 bg-orange-500/20 blur-3xl rounded-full animate-pulse-slow group-hover:bg-orange-500/30 transition-all duration-500" />
              <div className="w-32 h-32 md:w-40 md:h-40 bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-full flex items-center justify-center shadow-2xl relative z-10 group-hover:scale-105 transition-transform duration-500">
                <Mic className="w-12 h-12 md:w-16 md:h-16 text-white" />
              </div>
              
              {/* Orbiting Elements */}
              <div className="absolute inset-0 animate-spin-slow">
                 <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 w-3 h-3 bg-orange-500 rounded-full blur-[2px]" />
              </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-center text-white mb-6 tracking-tight">
              Entdecke deine <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-600">
                Wahre Frequenz
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-zinc-400 text-center max-w-xl mb-12 leading-relaxed">
              Deine Stimme ist der Schlüssel zu deiner Identität. 
              Analysiere jetzt deine energetische Signatur mit der METHODE 36.
            </p>

            <div className="flex flex-col gap-4 w-full max-w-xs">
                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg bg-white text-black hover:bg-zinc-200 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.1)] transition-all hover:shadow-[0_0_30px_rgba(255,255,255,0.2)]"
                  onClick={advanceStep}
                >
                  Analyse Starten
                </Button>
                
                <div className="grid grid-cols-3 gap-2 mt-4">
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-white flex flex-col h-auto py-2" onClick={() => setShowSpectralScanner(true)}>
                        <Activity className="w-4 h-4 mb-1" />
                        Live-Scanner
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-white flex flex-col h-auto py-2" onClick={() => setShowVitalDashboard(true)}>
                        <HeartPulse className="w-4 h-4 mb-1" />
                        Vital-Monitor
                    </Button>
                    <Button variant="ghost" size="sm" className="text-xs text-zinc-600 hover:text-white flex flex-col h-auto py-2" onClick={() => setShowStory(true)}>
                        <Play className="w-4 h-4 mb-1" />
                        Intro-Animation
                    </Button>
                </div>
            </div>
          </div>
        );

      case "preparation":
        return (
          <div className="max-w-2xl mx-auto py-12 px-4 animate-in slide-in-from-bottom-8 duration-700">
            <h2 className="text-3xl font-bold text-white mb-8">Vorbereitung</h2>
            
            <div className="space-y-6 mb-12">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">1</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Ruhige Umgebung</h3>
                        <p className="text-zinc-400 text-sm">Suche dir einen Ort ohne Hintergrundgeräusche.</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">2</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Natürliche Stimme</h3>
                        <p className="text-zinc-400 text-sm">Sprich so, wie du dich wohlfühlst. Nicht verstellen.</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">3</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">3 Fragen</h3>
                        <p className="text-zinc-400 text-sm">Wir stellen dir 3 kurze Fragen. Antworte intuitiv.</p>
                    </div>
                </CardContent>
              </Card>
            </div>

            <Button onClick={advanceStep} size="lg" className="w-full h-14 text-lg rounded-full">
              Ich bin bereit <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        );

      case "question1":
      case "question2":
      case "question3":
        const questions = {
          question1: "Zähle bitte entspannt von 1 bis 10.",
          question2: "Nenne deinen vollen Namen und dein Geburtsdatum.",
          question3: "Was ist deine größte Stärke?"
        };
        
        // Determine if current step is done
        const isCurrentStepDone = 
           (currentStep === "question1" && results.q1) ||
           (currentStep === "question2" && results.q2) ||
           (currentStep === "question3" && results.q3);

        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in">
            <div className="mb-8 flex gap-2">
                {[1, 2, 3].map(i => (
                    <div key={i} className={cn(
                        "w-3 h-3 rounded-full transition-colors",
                        (currentStep === "question1" && i === 1) || (currentStep === "question2" && i <= 2) || (currentStep === "question3" && i <= 3) 
                        ? "bg-orange-500" 
                        : "bg-zinc-800"
                    )} />
                ))}
            </div>

            <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12 max-w-2xl leading-tight">
              "{questions[currentStep]}"
            </h2>
            
            {/* Instructions - Only show if NOT done */}
            {!isCurrentStepDone && (
              <div className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-left w-full max-w-md">
                <p className="text-zinc-300 text-lg leading-relaxed mb-4">
                  {currentStep === "question1" && "Zähle bitte entspannt von 1 bis 10."}
                  {currentStep === "question2" && "Sage deinen Vor- und Nachnamen drei Mal."}
                  {currentStep === "question3" && "Summe einen Ton, der sich für dich angenehm anfühlt."}
                </p>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Mic className="w-4 h-4" />
                  <span>Sprich in normaler Lautstärke.</span>
                </div>
              </div>
            )}

            <div className="relative">
              {/* Status Indicator Ring */}
              {isRecording && (
                 <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />
              )}
              
              {!isRecording && !isCurrentStepDone && (
                <Button 
                  onClick={handleStartRecording} 
                  size="lg" 
                  className="rounded-full w-48 h-16 text-lg bg-white text-black hover:bg-zinc-200 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
                >
                  <Mic className="mr-2 w-5 h-5" /> Aufnahme
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
              
              {/* Step Done State - Show "Done" button that does nothing or indicates completion */}
              {!isRecording && isCurrentStepDone && (
                 <Button 
                    disabled
                    size="lg" 
                    className="rounded-full w-48 h-16 text-lg bg-green-500/20 text-green-500 border border-green-500/50 opacity-100"
                 >
                    <Check className="mr-2 w-5 h-5" /> Erledigt
                 </Button>
              )}
            </div>

            {/* Visual Feedback during recording */}
            {isRecording && analysisResult && (
               <div className="h-48 w-full max-w-md mx-auto mt-8 bg-black/50 rounded-xl overflow-hidden border border-zinc-800 relative shadow-[0_0_30px_rgba(249,115,22,0.1)]">
                  <SpectrumVisualizer 
                      spectrum={analysisResult.spectrum} 
                      width={400} 
                      height={192}
                      isActive={isRecording}
                  />
               </div>
            )}

            {/* Next Button (only if result captured) */}
            {!isRecording && isCurrentStepDone ? (
               <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center">
                 <p className="text-green-500 mb-4 flex items-center justify-center gap-2">
                   <Sparkles className="w-4 h-4" /> Aufnahme erfolgreich!
                 </p>
                 <Button onClick={advanceStep} variant="outline" className="border-zinc-700 hover:bg-zinc-800 h-12 px-8 text-lg">
                   Nächster Schritt <ArrowRight className="ml-2 w-5 h-5" />
                 </Button>
               </div>
            ) : null}
          </div>
        );

      case "analyzing":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-8" />
            <h2 className="text-2xl font-bold text-white mb-2">Berechne dein Profil...</h2>
            <p className="text-zinc-400">Deine Frequenzen werden multidimensional ausgewertet.</p>
          </div>
        );

      case "result":
        const res = isStudyComplete ? studyResult : finalResult;
        const mdi = isStudyComplete ? studyMdiResult : mdiResult;

        if (!res || !mdi) return <div>Fehler bei der Auswertung.</div>;

        const handleDownloadResult = async () => {
             // We can implement a simple text download or PDF here
             const text = `MDI SYSTEM ANALYSE\nDatum: ${new Date().toLocaleDateString()}\n\nErgebnis: ${mdi.id} - ${mdi.colorName}\nFrequenz: ${mdi.frequency} Hz\nLicht: ${mdi.lightRange}\nKlang: ${mdi.toneRange}\n\nPsychophysiologische Wirkung:\n${mdi.description}\n\nTalent:\n${mdi.talent}`;
             
             const blob = new Blob([text], { type: 'text/plain' });
             const url = URL.createObjectURL(blob);
             const a = document.createElement('a');
             a.href = url;
             a.download = `MDI-Analyse-${new Date().toISOString().split('T')[0]}.txt`;
             document.body.appendChild(a);
             a.click();
             document.body.removeChild(a);
             URL.revokeObjectURL(url);
        };

        return (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-1000">
            
            {/* Header Result Card */}
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-xs font-mono text-zinc-400">
                 {isStudyComplete ? "LÄNGSSCHNITT-STUDIE ABGESCHLOSSEN" : "TAGES-MESSUNG"}
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-white mb-2 tracking-tighter">
                {mdi.colorName}
              </h1>
              <p className="text-xl text-orange-500 font-medium">{mdi.frequency} Hz</p>
            </div>

            {/* Main Content Grid */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              
              {/* Left: Visual & Data */}
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-black/0 via-black/0 to-orange-500/5 pointer-events-none" />
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                   
                   {/* Big Color Circle */}
                   <div 
                      className="w-48 h-48 rounded-full shadow-[0_0_100px_rgba(255,255,255,0.1)] flex items-center justify-center mb-8 relative"
                      style={{ 
                          backgroundColor: mdi.hex,
                          boxShadow: `0 0 60px ${mdi.hex}40`
                      }}
                   >
                      <div className="absolute inset-0 rounded-full border border-white/20 animate-pulse-slow" />
                      <span className="text-4xl font-bold text-white drop-shadow-md">{mdi.id}</span>
                   </div>

                   <div className="grid grid-cols-2 gap-8 w-full text-center">
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Licht</div>
                        <div className="text-lg font-mono text-white">{mdi.lightRange}</div>
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 uppercase tracking-widest mb-1">Klang</div>
                        <div className="text-lg font-mono text-white">{mdi.toneRange}</div>
                      </div>
                   </div>

                </CardContent>
              </Card>

              {/* Right: Interpretation & Actions */}
              <div className="space-y-4">
                
                {/* Description Card */}
                <Card className="bg-zinc-900 border-zinc-800">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-white">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                      Wirkung & Talent
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Psychophysiologische Wirkung</h4>
                        <p className="text-zinc-300">{mdi.description}</p>
                    </div>
                    <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Talent</h4>
                        <p className="text-zinc-300">{mdi.talent}</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="grid gap-3">
                  <Button 
                    size="lg" 
                    className="w-full bg-white text-black hover:bg-zinc-200"
                    onClick={() => setShowInterpretation(true)}
                  >
                    Detaillierte Deutung ansehen <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800"
                      onClick={() => setShowSpectralScanner(true)}
                    >
                      <Activity className="mr-2 h-4 w-4" />
                      Live-Scanner
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800"
                      onClick={() => setShowDirectTrainer(true)}
                    >
                      <Music2 className="mr-2 h-4 w-4" />
                      Training
                    </Button>
                  </div>
                  
                  <Button 
                      variant="ghost" 
                      className="text-zinc-500 hover:text-white"
                      onClick={handleDownloadResult}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Ergebnis als Text speichern
                    </Button>
                </div>

              </div>
            </div>
            
            {/* Longitudinal Progress */}
            {!isStudyComplete && (
                <div className="mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Deine 5-Tage-Messung</h3>
                            <p className="text-sm text-zinc-400">Wir benötigen 5 Messungen für dein valides Profil.</p>
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                            {daysCompleted} / 5
                        </div>
                    </div>
                    <Progress value={(daysCompleted / 5) * 100} className="h-2 bg-zinc-800" />
                    <p className="text-xs text-zinc-500 mt-2 text-center">
                        Die 2 extremsten Werte werden automatisch als Ausreißer entfernt.
                    </p>
                </div>
            )}

            {showInterpretation && mdi && (
                <InterpretationView 
                  mdiResult={mdi}
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
        {/* Navbar - Logo removed, content shifted up */}
        <header className="flex justify-between items-center mb-4 md:mb-8">
          <Link href="/wissen">
            <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">
              <span className="mr-2">📚</span> Wissenspool
            </Button>
          </Link>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-zinc-500 hover:text-white ml-2"
            onClick={() => setShowFrequencyTable(true)}
          >
            <span className="mr-2">📊</span> Tabelle
          </Button>
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
          ) : showIntervalTrainer && finalResult ? (
            <IntervalTrainer 
              baseTone={finalResult.tone} 
              onClose={() => setShowIntervalTrainer(false)} 
            />
          ) : showDirectTrainer && finalResult && mdiResult ? (
             <Method36Trainer
                frequency={finalResult.fundamentalFreq || mdiResult.frequency}
                toneName={finalResult.tone.name}
                color={mdiResult.hex}
                onClose={() => setShowDirectTrainer(false)}
             />
          ) : showFrequencyTable ? (
            <FrequencyTable onClose={() => setShowFrequencyTable(false)} />
          ) : (
            renderContent()
          )}
        </main>
      </div>
    </div>
  );
}
