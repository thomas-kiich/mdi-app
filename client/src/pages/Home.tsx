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
import { CertificateView } from "@/components/CertificateView"; // Import new component
import { KnowledgePool } from "@/components/KnowledgePool"; // Import new component
import { useAudioAnalyzer, AnalysisResult } from "@/hooks/useAudioAnalyzer";
import { useSoundGenerator } from "@/hooks/useSoundGenerator";
import { useLongitudinalStudy } from "@/hooks/useLongitudinalStudy";
import { InterpretationView } from "@/components/InterpretationView";
import { ConnectionStory } from "@/components/ConnectionStory";
import { SpectralScanner } from "@/components/SpectralScanner";
import { VitalDashboard } from "@/components/VitalDashboard";
import { IntervalTrainer } from "@/components/IntervalTrainer";
import { Method36Trainer } from "@/components/Method36Trainer";
import { TrainingCenter } from "@/components/TrainingCenter";
import { TrainingCategoryStructure } from "@/components/TrainingCategoryStructure";
import { SleepTheta } from "@/components/SleepTheta";
import { WurzelklangVerification } from "@/components/WurzelklangVerification";
import { HarmonicSpectrumChart } from "@/components/HarmonicSpectrumChart";
import { ToneColorExplorer } from "@/components/ToneColorExplorer";
import { Dashboard } from "@/components/Dashboard";
import { OnboardingTour } from "@/components/OnboardingTour";
import { PodcastFeature } from "@/components/PodcastFeature";
import { AmbientTrainer } from "@/components/AmbientTrainer";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, RotateCcw, ArrowUp, ArrowDown, Settings, Activity, Sparkles, X, Music2, User, ArrowRight, ArrowLeft, HeartPulse, Check } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId, convertMdiDistributionToToneDistribution } from '@/lib/mdiToToneMapping';
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
  | "dashboard" // New start step
  | "intro" 
  | "preparation" 
  | "question1" 
  | "question2" 
  | "question3" 
  | "analyzing" 
  | "result";

export default function Home() {
  const [, setLocation] = useLocation();
  const [currentStep, setCurrentStep] = useState<WizardStep>("dashboard"); // Start at Dashboard
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
  const [showCertificate, setShowCertificate] = useState(false);
  const [showKnowledgePool, setShowKnowledgePool] = useState(false);
  const [showStory, setShowStory] = useState(false);
  const [showSpectralScanner, setShowSpectralScanner] = useState(false);
  const [showVitalDashboard, setShowVitalDashboard] = useState(false);
  const [showIntervalTrainer, setShowIntervalTrainer] = useState(false);
  const [showFrequencyTable, setShowFrequencyTable] = useState(false);
  const [showDirectTrainer, setShowDirectTrainer] = useState(false);
  const [showTrainingDurationSelect, setShowTrainingDurationSelect] = useState(false);
  const [showTrainingCenter, setShowTrainingCenter] = useState(false);
  const [showWurzelklangVerification, setShowWurzelklangVerification] = useState(false);
  const [wurzelklangVerified, setWurzelklangVerified] = useState(false);
  const [selectedTrainingDuration, setSelectedTrainingDuration] = useState<number>(7);
  const [selectedTrainingItem, setSelectedTrainingItem] = useState<string | null>(null);
  const [selectedFeature, setSelectedFeature] = useState<{title: string, description: string, icon: any, bg: string} | null>(null);
  const [showSleepTheta, setShowSleepTheta] = useState(false);

  // Show onboarding tour on first visit
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
      const hasSeenTour = localStorage.getItem('mdi_onboarding_completed');
      if (!hasSeenTour) {
          setShowOnboarding(true);
      }
  }, []);

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
    // Note: toneDistribution now contains MDI type IDs, not tone names
    
    const combinedMdiDistribution: Record<string, number> = {};
    const combinedDistribution: Record<string, number> = {}; // Keep for compatibility

    const processResult = (res: AnalysisResult | null) => {
      if (!res) return;
      
      // Use mdiDistribution (which contains MDI type IDs)
      if (res.mdiDistribution) {
        for (const [id, percent] of Object.entries(res.mdiDistribution)) {
          if (!combinedMdiDistribution[id]) combinedMdiDistribution[id] = 0;
          combinedMdiDistribution[id] += percent;
        }
      }
      // For backward compatibility, also populate combinedDistribution with MDI IDs
      if (res.toneDistribution) {
        for (const [id, percent] of Object.entries(res.toneDistribution)) {
          if (!combinedDistribution[id]) combinedDistribution[id] = 0;
          combinedDistribution[id] += percent;
        }
      }
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

    // Find dominant MDI type across all sessions
    let maxScore = 0;
    let dominantMdiId = "";
    
    for (const [id, score] of Object.entries(combinedMdiDistribution)) {
      if (score > maxScore) {
        maxScore = score;
        dominantMdiId = id;
      }
    }
    
    // If we have a winner, construct the final result
    if (dominantMdiId) {
      // Find the MDI data
      const mdiData = frequencyData.find(f => f.id === parseInt(dominantMdiId));
      // Use the mapping to get the actual tone name (E, Dis, D, etc.)
      const dominantToneName = getToneNameFromMdiId(dominantMdiId);
      const toneData = TONES.find(t => t.name === dominantToneName);
      
      if (toneData && mdiData && dominantToneName) {
        // Determine the "Final Hz" for the result.
        // FIX: Ensure the Hz matches the Tone (F) and not some distant frequency (A).
        // If the deviation is too large (> 50 cents), clamp it or reset to 0.

        // 1. Try to find if the dominant tone was ever the fundamental in any session
        let measuredHz = 0;
        let bestConfidence = 0;
        
        const checkSession = (res: AnalysisResult | null) => {
            if (!res) return;
            // Check if this session's FUNDAMENTAL tone matches our dominant tone
            const fundCheck = getToneFromFrequency(res.fundamentalFreq);
            
            if (fundCheck.tone.name === dominantToneName) {
                // This session actually measured our dominant tone as the fundamental!
                // We prefer this real measurement.
                if (mdiData && res.toneDistribution) {
                    const score = res.toneDistribution[mdiData.id.toString()] || 0;
                    if (score > bestConfidence) {
                        bestConfidence = score;
                        measuredHz = res.fundamentalFreq;
                    }
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
            // Case B: The dominant tone was inferred from harmonics, but never measured as fundamental.
            // Use the ideal frequency.
            finalHz = toneData.frequency;
            finalCents = 0;
            finalDiffHz = 0;
        }

        setFinalResult({
          tone: toneData,
          fundamentalFreq: finalHz,
          cents: finalCents,
          diffHz: finalDiffHz,
          toneDistribution: combinedDistribution,
          mdiDistribution: combinedMdiDistribution
        });

        // Find MDI Result
        // We use the highest score from mdiDistribution
        let maxMdiScore = 0;
        let bestMdiId = "";
        for (const [id, score] of Object.entries(combinedMdiDistribution)) {
            if (score > maxMdiScore) {
                maxMdiScore = score;
                bestMdiId = id;
            }
        }
        
        const mdi = frequencyData.find(f => f.id === parseInt(bestMdiId));
        if (mdi) {
            setMdiResult(mdi);
            
            // Save to longitudinal study
            // Construct a synthetic AnalysisResult for storage
            const syntheticResult: AnalysisResult = {
                fundamentalFreq: finalHz,
                tone: toneData,
                cents: finalCents,
                diffHz: finalDiffHz,
                noteName: dominantToneName,
                isSpeaking: false,
                spectrum: new Uint8Array(0),
                volume: 0,
                toneDistribution: combinedDistribution,
                mdiDistribution: combinedMdiDistribution
            };
            saveDailyResult(syntheticResult);
        }
      }
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "dashboard":
        return (
            <div className="space-y-8">
              <div className="container max-w-6xl mx-auto px-4 pt-8">
                <PodcastFeature
                  coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/2_30109d8c.png"
                  title="MASCHINEN ATMEN NICHT"
                  subtitle="Die Chance auf dein selbstbestimmtes Glücklichsein"
                  description="Ein revolutionärer Podcast über die METHODE 36 - eine 12-teilige atemgesteuerte Bewegungstechnik, die alte Weisheitslehren mit moderner Wissenschaft vereint. Entdecke, wie Bewusstsein, Kreativität und Empfindsamkeit deine wahre Natur offenbaren."
                  youtubeUrl=""
                  spotifyUrl=""
                />
              </div>
              <Dashboard 
                onStartAnalysis={() => setCurrentStep("intro")}
                onOpenTraining={() => setShowTrainingCenter(true)}
                onOpenScanner={() => setShowSpectralScanner(true)}
                onOpenKnowledge={() => setShowKnowledgePool(true)}
                onOpenTable={() => setShowFrequencyTable(true)}
                onOpenVital={() => setShowVitalDashboard(true)}
                onOpenSleep={() => setShowSleepTheta(true)}
              />
            </div>
        );

      case "intro":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-700">
            
            <div className="mb-8 relative">
                 {/* Logo Container */}
                 <div className="w-48 h-48 rounded-full bg-black border border-zinc-800 flex items-center justify-center relative overflow-hidden shadow-[0_0_50px_rgba(249,115,22,0.2)]">
                     {/* Inner Glow */}
                     <div className="absolute inset-0 bg-gradient-to-tr from-orange-500/20 to-transparent opacity-50" />
                     
                     {/* Logo Image - Adjusted Size and Position */}
                     <img 
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/mdi_logo_neu_b556f8e7.jpg" 
                        alt="MDI Logo" 
                        className="w-40 h-40 object-contain relative z-10 translate-y-2" 
                     />
                 </div>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tighter">
              METHODE 36
            </h1>
            
            <p className="text-xl text-zinc-400 max-w-2xl mb-12 leading-relaxed">
              Entdecke deine wahre Frequenz und bringe Körper & Geist in Einklang.
              <br/>
              <span className="text-sm text-zinc-500 mt-4 block">
                Schön, dass du da bist! Diese App hilft dir, deine energetische Signatur zu finden und zu harmonisieren.
              </span>
            </p>

            <Button onClick={advanceStep} size="lg" className="rounded-full w-48 h-14 text-lg bg-white text-black hover:bg-zinc-200 transition-all hover:scale-105">
              Weiter <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            
            <div className="mt-16 flex gap-2 justify-center">
                {[0, 1, 2, 3].map((_, i) => (
                    <div key={i} className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-white' : 'bg-zinc-800'}`} />
                ))}
            </div>
          </div>
        );

      case "preparation":
        return (
          <div className="max-w-2xl mx-auto py-20 px-4 animate-in slide-in-from-bottom-8 duration-700 pt-48">
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-48">
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

            {/* Show question text only if recording is not done */}
            {!isCurrentStepDone && (
              <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-12 max-w-2xl leading-tight">
                "{questions[currentStep]}"
              </h2>
            )}
            
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
          <div className="flex flex-col items-center justify-center min-h-[60vh] pt-48">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-8" />
            <h2 className="text-2xl font-bold text-white mb-2">Berechne dein Profil...</h2>
            <p className="text-zinc-400">Deine Frequenzen werden multidimensional ausgewertet.</p>
          </div>
        );

      case "result":
        const res = isStudyComplete ? studyResult : finalResult;
        const mdi = isStudyComplete ? studyMdiResult : mdiResult;

        if (!res || !mdi) return <div>Fehler bei der Auswertung.</div>;

        const handleDownloadResult = () => {
             setShowCertificate(true);
        };

        return (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-1000 pt-48">
            
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

                  {!wurzelklangVerified && (
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                      <p className="text-sm text-blue-300">
                        <span className="font-semibold">Nächster Schritt:</span> Überprüfe deinen Wurzelklang
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <Button 
                      variant="outline" 
                      className={`border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer transition-all ${wurzelklangVerified ? 'border-green-500/50 hover:border-green-500/70' : ''}`}
                      onClick={() => setShowWurzelklangVerification(true)}
                    >
                      {wurzelklangVerified ? '✓' : ''} Wurzelklang
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer transition-all text-xs"
                      onClick={() => {
                        setShowTrainingCenter(false);
                        setSelectedTrainingItem("yohn");
                        setSelectedTrainingDuration(12); // Default to 12 minutes
                        setShowDirectTrainer(true);
                      }}
                    >
                      <Music2 className="mr-2 h-4 w-4 shrink-0" />
                      HIER KLICKEN - zum YOHNTRAINING mit deinem LEBENSKLANG
                    </Button>
                  </div>
                  
                  <Button 
                      variant="ghost" 
                      className="text-zinc-500 hover:text-white cursor-pointer transition-colors"
                      onClick={handleDownloadResult}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Zertifikat erstellen
                    </Button>
                </div>

              </div>
            </div>

            {/* HARMONIC SPECTRUM ANALYSIS */}
            {res && res.mdiDistribution && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <HarmonicSpectrumChart 
                        toneDistribution={res.mdiDistribution}
                        dominantToneId={mdi.id}
                    />
                </div>
            )}

            {/* TONE COLOR EXPLORER - Saturation Exploration */}
            {res && res.mdiDistribution && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <ToneColorExplorer 
                        mdiDistribution={res.mdiDistribution}
                    />
                </div>
            )}

            {/* AURA VISUALIZATION (Restored) */}
            {res && res.mdiDistribution && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    <SoundBody 
                        toneDistribution={convertMdiDistributionToToneDistribution(res.mdiDistribution)} 
                        dominantToneName={getToneNameFromMdiId(mdi.id)} 
                    />
                </div>
            )}
            
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
                    
                    {!wurzelklangVerified && (
                        <div className="mt-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 text-center">
                            <p className="text-sm text-blue-300">
                                <span className="font-semibold">Wichtig:</span> Überprüfe heute auch deinen Wurzelklang!
                            </p>
                        </div>
                    )}
                </div>
            )}

            {showInterpretation && mdi && (
                <InterpretationView 
                  mdiResult={mdi}
                  onClose={() => setShowInterpretation(false)}
                />
            )}
            
            {/* Back to Dashboard Button */}
            <div className="text-center mt-8">
                <Button 
                    variant="ghost" 
                    className="text-zinc-500 hover:text-white"
                    onClick={() => setCurrentStep("dashboard")}
                >
                    Zurück zum Dashboard
                </Button>
            </div>

            {/* Certificate View Overlay */}
            {showCertificate && mdi && (
                <CertificateView 
                    mdiResult={mdi}
                    toneDistribution={res.toneDistribution}
                    onClose={() => setShowCertificate(false)}
                />
            )}

            {showWurzelklangVerification && mdi && (
                <WurzelklangVerification 
                    analyzedToneId={mdi.id}
                    onClose={() => setShowWurzelklangVerification(false)}
                    onVerificationComplete={(isValid) => {
                      setWurzelklangVerified(isValid);
                    }}
                />
            )}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-black text-foreground font-sans selection:bg-orange-500/30">
      {/* Onboarding Tour */}
      {showOnboarding && <OnboardingTour />}
      
      <div className="container max-w-5xl mx-auto px-4 py-8">
        {/* Navbar - Only show if NOT in dashboard to keep dashboard clean, OR show minimal nav */}
        {currentStep !== 'dashboard' && (
            <header className="flex justify-between items-center mb-4 md:mb-8 animate-in fade-in">
              <div className="flex gap-2">
                 {/* Back to Dashboard if not on dashboard */}
                 <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white" onClick={() => setCurrentStep("dashboard")}>
                     <ArrowLeft className="mr-2 w-4 h-4" /> Dashboard
                 </Button>
              </div>
              <div className="flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-zinc-500 hover:text-white"
                    onClick={() => setShowVitalDashboard(true)}
                  >
                    <span className="mr-2">❤️</span> Vital
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-zinc-500 hover:text-white ml-2"
                    onClick={() => setShowKnowledgePool(true)}
                  >
                    <span className="mr-2">📚</span> Wissen
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-zinc-500 hover:text-white ml-2"
                    onClick={() => setShowFrequencyTable(true)}
                  >
                    <span className="mr-2">📊</span> Tabelle
                  </Button>
              </div>
            </header>
        )}

        <main>
          {showSleepTheta ? (
            <SleepTheta onClose={() => setShowSleepTheta(false)} />
          ) : showKnowledgePool ? (
            <KnowledgePool onClose={() => setShowKnowledgePool(false)} />
          ) : showStory ? (
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
          ) : showDirectTrainer && selectedTrainingItem === "yohn" ? (
             <Method36Trainer
                frequency={finalResult?.fundamentalFreq || mdiResult?.frequency || 95}
                toneName={finalResult?.tone?.name || "F"}
                color={mdiResult?.hex || "#FF4444"}
                duration={selectedTrainingDuration || 7}
                onClose={() => {
                  setShowDirectTrainer(false);
                  setShowTrainingCenter(false);
                  setSelectedTrainingItem(null);
                }}
             />
          ) : showDirectTrainer && selectedTrainingItem === "interval" ? (
             <IntervalTrainer
                baseTone={finalResult?.tone || { name: "F", frequency: 95 }}
                onClose={() => {
                  setShowDirectTrainer(false);
                  setShowTrainingCenter(false);
                  setSelectedTrainingItem(null);
                }}
             />
          ) : showDirectTrainer && selectedTrainingItem === "metabolic" ? (
             <AmbientTrainer
               trainingId="metabolic"
               duration={selectedTrainingDuration || 21}
               audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/metabolic_0af5bdc2.mp3"
               baseTone={finalResult?.tone}
               onClose={() => {
                 setShowDirectTrainer(false);
                 setShowTrainingCenter(false);
                 setSelectedTrainingItem(null);
               }}
             />
          ) : showDirectTrainer && selectedTrainingItem === "mayerwelle" ? (
             <AmbientTrainer
               trainingId="mayerwelle"
               duration={selectedTrainingDuration || 45}
               audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/mayerwelle_0a96a8d7.mp3"
               baseTone={finalResult?.tone}
               onClose={() => {
                 setShowDirectTrainer(false);
                 setShowTrainingCenter(false);
                 setSelectedTrainingItem(null);
               }}
             />
          ) : showTrainingCenter ? (
            <div className="fixed inset-0 z-50 bg-black overflow-y-auto">
              <TrainingCategoryStructure
                onStartTraining={(item, duration) => {
                  setSelectedTrainingDuration(duration);
                  setSelectedTrainingItem(item.id);
                  setShowTrainingDurationSelect(false);
                  if (item.id === "yohn" || item.id === "interval") {
                    setShowDirectTrainer(true);
                  } else if (item.id === "metabolic" || item.id === "mayerwelle") {
                    // Ambient trainings - show ambient trainer
                    setShowDirectTrainer(true);
                  }
                }}                onOpenKnowledge={() => {
                  setShowKnowledgePool(true);
                  setShowTrainingCenter(false);
                }}
              />
              <button
                onClick={() => setShowTrainingCenter(false)}
                className="fixed top-4 right-4 z-50 p-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-orange-500 text-zinc-400 hover:text-orange-500 transition-colors"
              >
                ✕
              </button>
            </div>
          ) : showTrainingDurationSelect ? (
             <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                 <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-2xl max-w-md w-full space-y-8">
                     <div className="text-center">
                         <h2 className="text-2xl font-bold text-white mb-2">Training Starten</h2>
                         <p className="text-zinc-400">Wähle deine Trainingsdauer für heute.</p>
                     </div>
                     
                     <div className="grid grid-cols-1 gap-4">
                         {[7, 12, 21].map(min => (
                             <Button
                                key={min}
                                variant="outline"
                                className="h-16 text-lg border-zinc-700 hover:bg-zinc-800 hover:border-orange-500 hover:text-orange-500 transition-all justify-between px-6 group"
                                onClick={() => {
                                    setSelectedTrainingDuration(min);
                                    setShowTrainingDurationSelect(false);
                                    setShowDirectTrainer(true);
                                }}
                             >
                                 <span className="font-bold">{min} Minuten</span>
                                 <span className="text-xs text-zinc-500 group-hover:text-orange-400 uppercase tracking-widest">
                                     {min === 7 ? "Zentrierung" : min === 12 ? "Entspannung" : "Transformation"}
                                 </span>
                             </Button>
                         ))}
                     </div>
                     
                     <Button 
                        variant="ghost" 
                        className="w-full text-zinc-500 hover:text-white"
                        onClick={() => setShowTrainingDurationSelect(false)}
                     >
                         Abbrechen
                     </Button>
                 </div>
             </div>
          ) : showFrequencyTable ? (
            <FrequencyTable onClose={() => setShowFrequencyTable(false)} />
          ) : (
            renderContent()
          )}
        </main>
        
        {/* Footer */}
        {!showStory && !showSpectralScanner && !showVitalDashboard && !showIntervalTrainer && !showDirectTrainer && !showFrequencyTable && !showTrainingCenter && currentStep === 'dashboard' && (
            <footer className="mt-24 pb-8 border-t border-zinc-900 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-zinc-600">
                <div>
                    &copy; {new Date().getFullYear()} MDI System.
                </div>
                <div className="flex gap-6">
                    <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
                    <Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
                </div>
            </footer>
        )}
        {/* Global Audio Element for Ambient Trainers */}
        <audio
          id="ambient-audio"
          loop
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
