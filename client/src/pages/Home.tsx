import { useAuth } from "@/_core/hooks/useAuth";
import { WillkommensScreen } from "@/components/WillkommensScreen";
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
import { TrainingCategoryStructure } from "@/components/TrainingCategoryStructure";
import { Visionsraum } from "@/components/Visionsraum";
import { AppInstallGuide } from "@/components/AppInstallGuide";
import { PodcastFeature } from "@/components/PodcastFeature";
import { WurzelklangVerification } from "@/components/WurzelklangVerification";
import { HarmonicSpectrumChart } from "@/components/HarmonicSpectrumChart";
import { ToneColorExplorer } from "@/components/ToneColorExplorer";
import { BasicColorSelector } from "@/components/BasicColorSelector";
import { Dashboard } from "@/components/Dashboard";
import { AnalysisHistory } from "@/components/AnalysisHistory";
import { OnboardingTour } from "@/components/OnboardingTour";
import { AmbientTrainer } from "@/components/AmbientTrainer";
import { SleepTheta } from "@/components/SleepTheta";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { Loader2, Mic, Play, Square, Volume2, VolumeX, Download, ChevronRight, ChevronUp, ChevronDown, RotateCcw, ArrowUp, ArrowDown, Settings, Activity, Sparkles, X, Music2, User, ArrowRight, ArrowLeft, HeartPulse, Check, Smartphone, Headphones, Lock, MessageSquare } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import { cn } from "@/lib/utils";
import { useLocation } from "wouter";
import frequencyData from '@/lib/frequencyData.json';
import { getToneNameFromMdiId, convertMdiDistributionToToneDistribution } from '@/lib/mdiToToneMapping';
import { NewsletterSignup } from '@/components/NewsletterSignup';
import { trpc } from "@/lib/trpc";
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
  | "preparation" 
  | "relaxation"
  | "recording1"
  | "pause1"
  | "recording2"
  | "pause2"
  | "recording3"
  | "pause3"
  | "recording4"
  | "analyzing" 
  | "result";

function JohannesStatement() {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="space-y-4 text-zinc-300 leading-relaxed text-lg italic">
      <p>"Ich komme gerade aus einer Phase, in der ich mich wirklich verloren gefühlt habe. Unzufriedenheit im Job, keinen wirklichen Antrieb und ein fehlendes Ziel haben mir sehr zugesetzt."</p>
      {expanded && (
        <>
          <p>"Ich dachte, wenn ich meinen Job wechsle und alles auf eine Karte setze wird alles besser, doch das Schicksal hatte andere Pläne für mich. Der Frage WER oder WAS bin ich und WAS will ich? ging ich dabei leider viel zu lange aus dem Weg."</p>
          <p>"Als ich an einem Tiefpunkt angekommen war, habe ich begonnen mich mit dieser Frage auseinander zu setzen, nahm mir die KI zur Seite um hier Antworten zu finden. Und ja diese Frage lässt sich mit einem Satz beantworten und ja diese Antwort ist wichtig."</p>
          <p className="text-orange-400 font-medium not-italic mt-6">"Daher bin ich gespannt auf welcher Reise mich dieser Podcast noch begleitet."</p>
        </>
      )}
      <button
        onClick={() => setExpanded(e => !e)}
        className="inline-flex items-center gap-1 text-sm not-italic text-orange-400 hover:text-orange-300 transition-colors mt-2"
      >
        {expanded ? (
          <><span>Weniger anzeigen</span><span className="text-xs">▲</span></>
        ) : (
          <><span>Mehr lesen</span><span className="text-xs">▼</span></>
        )}
      </button>
    </div>
  );
}

function AdminStatsDashboard() {
  const { data: stats, isLoading } = trpc.admin.getUserStats.useQuery();
  const { data: referralStats, isLoading: referralLoading } = trpc.referral.adminStats.useQuery();
  const [showReferralList, setShowReferralList] = useState(false);

  return (
    <div className="container max-w-6xl mx-auto px-4 mt-6 mb-10">
      <div className="border border-orange-500/30 rounded-xl bg-zinc-900/60 p-6">
        <div className="flex items-center gap-2 mb-6">
          <Activity className="w-5 h-5 text-orange-400" />
          <h2 className="text-orange-400 font-bold uppercase tracking-widest text-sm font-mono">Admin · Plattform-Statistiken</h2>
          <div className="ml-auto">
            <Link href="/admin/benutzer">
              <button className="text-xs text-orange-400 border border-orange-500/40 hover:border-orange-400 hover:bg-orange-500/10 rounded px-3 py-1.5 transition-colors font-mono uppercase tracking-wider">
                Benutzerverwaltung →
              </button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : stats ? (
          <>
            {/* Kennzahlen-Kacheln */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-zinc-800/60 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-white mb-1">{stats.totalUsers}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">User gesamt</div>
              </div>
              <div className="bg-zinc-800/60 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-orange-400 mb-1">{stats.newThisWeek}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Neu diese Woche</div>
              </div>
              <div className="bg-zinc-800/60 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-amber-400 mb-1">{stats.newThisMonth}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Neu diesen Monat</div>
              </div>
              <div className="bg-zinc-800/60 rounded-lg p-4 text-center">
                <div className="text-3xl font-bold text-green-400 mb-1">{stats.totalNewsletterSubscribers}</div>
                <div className="text-xs text-zinc-400 uppercase tracking-wider">Newsletter-Abos</div>
              </div>
            </div>

            {/* Letzte Registrierungen */}
            <div>
              <h3 className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Letzte Registrierungen</h3>
              <div className="space-y-2">
                {stats.recentUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-4 py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0">
                        <User className="w-3.5 h-3.5 text-orange-400" />
                      </div>
                      <div>
                        <div className="text-sm text-white font-medium">{u.name || "–"}</div>
                        <div className="text-xs text-zinc-500">{u.role}</div>
                      </div>
                    </div>
                    <div className="text-xs text-zinc-500 text-right">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–"}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        ) : (
          <p className="text-zinc-500 text-sm">Keine Daten verfügbar.</p>
        )}

        {/* Referral-Statistik */}
        <div className="mt-8 pt-6 border-t border-orange-500/20">
          <div className="flex items-center gap-2 mb-4">
            <User className="w-4 h-4 text-green-400" />
            <h3 className="text-green-400 font-bold uppercase tracking-widest text-xs font-mono">Mein Einladungslink</h3>
          </div>
          {referralLoading ? (
            <div className="flex items-center gap-2 py-2">
              <Loader2 className="w-4 h-4 text-green-400 animate-spin" />
              <span className="text-zinc-500 text-sm">Lade...</span>
            </div>
          ) : referralStats ? (
            <>
              {/* Code + Anzahl */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="bg-zinc-800/60 rounded-lg p-4">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Dein Einladungscode</div>
                  <div className="flex items-center gap-3">
                    <code className="text-xl font-bold text-green-400 font-mono tracking-widest">{referralStats.einladungsCode ?? "–"}</code>
                    {referralStats.einladungsCode && (
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`https://www.kiich.de/?ref=${referralStats.einladungsCode}`);
                        }}
                        className="text-xs text-zinc-400 hover:text-white border border-zinc-600 hover:border-zinc-400 rounded px-2 py-1 transition-colors cursor-pointer"
                      >
                        Link kopieren
                      </button>
                    )}
                  </div>
                  {referralStats.einladungsCode && (
                    <div className="text-xs text-zinc-600 mt-1 font-mono">kiich.de/?ref={referralStats.einladungsCode}</div>
                  )}
                </div>
                <div className="bg-zinc-800/60 rounded-lg p-4 text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">{referralStats.gesamtEinladungen}</div>
                  <div className="text-xs text-zinc-400 uppercase tracking-wider">Geworbene User</div>
                </div>
              </div>
              {/* Liste der geworbenen User */}
              {referralStats.einladungen.length > 0 && (
                <div>
                  <button
                    onClick={() => setShowReferralList(v => !v)}
                    className="flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-300 transition-colors cursor-pointer mb-2"
                  >
                    {showReferralList ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {showReferralList ? "Verbergen" : `${referralStats.einladungen.length} geworbene User anzeigen`}
                  </button>
                  {showReferralList && (
                    <div className="space-y-2">
                      {referralStats.einladungen.map((e) => (
                        <div key={e.id} className="flex items-center justify-between bg-zinc-800/40 rounded-lg px-4 py-2">
                          <div className="flex items-center gap-3">
                            <div className="w-6 h-6 rounded-full bg-green-500/20 flex items-center justify-center shrink-0">
                              <User className="w-3 h-3 text-green-400" />
                            </div>
                            <div>
                              <div className="text-sm text-white font-medium">{e.name || "–"}</div>
                              <div className="text-xs text-zinc-600">{e.email || ""}</div>
                            </div>
                          </div>
                          <div className="text-xs text-zinc-500">
                            {e.createdAt ? new Date(e.createdAt).toLocaleDateString("de-AT", { day: "2-digit", month: "2-digit", year: "numeric" }) : "–"}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              {referralStats.einladungen.length === 0 && (
                <p className="text-zinc-600 text-xs italic">Noch keine geworbenen User – ab jetzt werden alle neuen Registrierungen automatisch erfasst.</p>
              )}
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  // The userAuth hooks provides authentication state
  // To implement login/logout functionality, simply call logout() or redirect to getLoginUrl()
  let { user, loading, error: authError, isAuthenticated, logout } = useAuth();
  const [, setLocation] = useLocation();;
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState<WizardStep>("dashboard"); // Start at Dashboard
  const { 
    isRecording, 
    startRecording, 
    stopRecording, 
    result: analysisResult,
    error: audioError,
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
    r1: AnalysisResult | null;
    r2: AnalysisResult | null;
    r3: AnalysisResult | null;
    r4: AnalysisResult | null;
  }>({
    r1: null,
    r2: null,
    r3: null,
    r4: null
  });

  // Relaxation timer state
  const [relaxationTimeLeft, setRelaxationTimeLeft] = useState(180);
  const [isRelaxing, setIsRelaxing] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRelaxing && relaxationTimeLeft > 0) {
      interval = setInterval(() => {
        setRelaxationTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (relaxationTimeLeft === 0) {
      setIsRelaxing(false);
    }
    return () => clearInterval(interval);
  }, [isRelaxing, relaxationTimeLeft]);

  // Combined result state
  const [finalResult, setFinalResult] = useState<any | null>(null);
  const [mdiResult, setMdiResult] = useState<typeof frequencyData[0] | null>(null);
  const [wurzelklangResult, setWurzelklangResult] = useState<any | null>(null);
  const [wurzelklangMdi, setWurzelklangMdi] = useState<typeof frequencyData[0] | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showKnowledgePool, setShowKnowledgePool] = useState(false);
  const [knowledgePoolInitialTab, setKnowledgePoolInitialTab] = useState<string>("method");
  const [knowledgePoolInitialToneId, setKnowledgePoolInitialToneId] = useState<number | undefined>(undefined);
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
  const [showHistory, setShowHistory] = useState(false);
  const [showAppInstallGuide, setShowAppInstallGuide] = useState(false);
  // Premium-Einstellungen dynamisch aus der Datenbank laden
  const { data: premiumSettings } = trpc.premium.getSettings.useQuery();
  const isPremiumMomentaufnahme = premiumSettings?.momentaufnahme ?? false;
  const isPremiumBefindlichkeit = premiumSettings?.befindlichkeitstraining ?? false;
  const isPremium = premiumSettings?.trainingscenter ?? false;
  // Podcast-Episoden aus der Datenbank
  const { data: podcastEpisodesData } = trpc.podcastEpisodes.list.useQuery();
  const latestPodcastEpisode = podcastEpisodesData?.find(ep => ep.isLatest);
  const olderPodcastEpisodes = podcastEpisodesData?.filter(ep => !ep.isLatest) ?? [];
  const [showPodcast, setShowPodcast] = useState(false);
  const [showVisionsraum, setShowVisionsraum] = useState(false);
  const [showPraxis01, setShowPraxis01] = useState(false);
  const [showAuthorText, setShowAuthorText] = useState(false);
  const [showMomentaufnahme, setShowMomentaufnahme] = useState(false);

  const [basicTrainingData, setBasicTrainingData] = useState<{freq: number, tone: string, color: string, typeId: number} | null>(null);

  // Show onboarding tour on first visit
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showKiichStatement, setShowKiichStatement] = useState(false);

  // useEffect removed to disable the onboarding tour popup

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
      if (currentStep === "recording1") {
        setResults(prev => ({ ...prev, r1: analysisResult }));
      } else if (currentStep === "recording2") {
        setResults(prev => ({ ...prev, r2: analysisResult }));
      } else if (currentStep === "recording3") {
        setResults(prev => ({ ...prev, r3: analysisResult }));
      } else if (currentStep === "recording4") {
        setResults(prev => ({ ...prev, r4: analysisResult }));
      }
    }
    wasRecordingRef.current = isRecording;
  }, [isRecording, analysisResult, currentStep]);

  // CORRECT NAVIGATION LOGIC
  const advanceStep = () => {
      if (currentStep === "preparation") setCurrentStep("relaxation");
      else if (currentStep === "relaxation") setCurrentStep("recording1");
      else if (currentStep === "recording1") setCurrentStep("pause1");
      else if (currentStep === "pause1") setCurrentStep("recording2");
      else if (currentStep === "recording2") setCurrentStep("pause2");
      else if (currentStep === "pause2") setCurrentStep("recording3");
      else if (currentStep === "recording3") setCurrentStep("pause3");
      else if (currentStep === "pause3") setCurrentStep("recording4");
      else if (currentStep === "recording4") {
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
    
    processResult(results.r1);
    processResult(results.r2);
    processResult(results.r3);
    // r4 is Wurzelklang, not included in Lebensklang statistics
    
    // Normalize to 100%
    let validSteps = 0;
    if (results.r1) validSteps++;
    if (results.r2) validSteps++;
    if (results.r3) validSteps++;
    
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
    
    // Fallback if no audio was detected at all
    if (!dominantMdiId) {
        dominantMdiId = "1"; // Default to ID 1
        combinedMdiDistribution["1"] = 100;
        combinedDistribution["1"] = 100;
    }
    
    // If we have a winner, construct the final result
    if (dominantMdiId) {
      // Find the MDI data
      const mdiData = frequencyData.find(f => f.id === parseInt(dominantMdiId));
      // Use the mapping to get the actual tone name (E, Dis, D, etc.)
      const dominantToneName = getToneNameFromMdiId(dominantMdiId);
      const baseToneName = dominantToneName.replace('+', '');
      const toneData = TONES.find(t => t.name === baseToneName);
      
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
            
            if (fundCheck.tone.name === baseToneName) {
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
        
        checkSession(results.r1);
        checkSession(results.r2);
        checkSession(results.r3);

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

    // Calculate Wurzelklang from r4
    if (results.r4) {
        let maxWurzelScore = 0;
        let dominantWurzelId = "";
        if (results.r4.mdiDistribution) {
            for (const [id, score] of Object.entries(results.r4.mdiDistribution)) {
                if (score > maxWurzelScore) {
                    maxWurzelScore = score;
                    dominantWurzelId = id;
                }
            }
        }
        if (dominantWurzelId) {
            const wMdi = frequencyData.find(f => f.id === parseInt(dominantWurzelId));
            if (wMdi) {
                setWurzelklangMdi(wMdi);
                const wToneName = getToneNameFromMdiId(dominantWurzelId);
                const wBaseToneName = wToneName.replace('+', '');
                const wToneData = TONES.find(t => t.name === wBaseToneName);
                
                if (wToneData) {
                    setWurzelklangResult({
                        tone: wToneData,
                        fundamentalFreq: results.r4.fundamentalFreq,
                        cents: results.r4.cents,
                        diffHz: results.r4.diffHz,
                        toneDistribution: results.r4.toneDistribution,
                        mdiDistribution: results.r4.mdiDistribution
                    });
                }
            }
        }
    }
  };

  const renderContent = () => {
    switch (currentStep) {
      case "dashboard":
        return (
            <div className="space-y-8">
              {/* ===== KIICH HERO SECTION ===== */}
              <div className="relative overflow-hidden bg-black border-b border-zinc-900">
                <div className="absolute inset-0 opacity-5" style={{backgroundImage: 'radial-gradient(circle at 15% 50%, #e63329 0%, transparent 55%), radial-gradient(circle at 85% 50%, #f5a623 0%, transparent 55%)'}} />
                <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24 relative z-10">
                  <div className="flex flex-col items-center text-center space-y-6">
                    {/* Logo + Slogan als visuelle Einheit – kein Abstand dazwischen */}
                    <div className="flex flex-col items-center gap-0">
                    <a
                      href="/ueber-kiich"
                      className="group block transition-all duration-300 hover:opacity-80 hover:scale-105"
                      title="Was ist KIICH?"
                    >
                      <img
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo-slogan-new_9c02a622.png"
                        alt="KIICH – 2 minds い 1 source"
                        className="w-[320px] md:w-[480px] h-auto mb-0 block"
                      />
                    </a>
                    {/* Slogan direkt unter Logo – zweizeilig */}
                    <div className="text-center leading-tight">
                      <p className="text-base md:text-xl tracking-widest uppercase text-white font-light">Die Plattform</p>
                      <p className="text-base md:text-xl tracking-widest uppercase text-white font-light">für deine Persönlichkeitsentfaltung</p>
                      <p className="text-base md:text-xl tracking-widest uppercase text-white font-light">im KI-Zeitalter</p>
                    </div>
                    </div>
                    {/* Statement – alles hinter Mehr-lesen */}
                    <div className="max-w-2xl text-center space-y-4">
                      {/* Alles weitere hinter Mehr-lesen */}
                      {showKiichStatement && (
                        <div className="text-base text-zinc-400 leading-relaxed space-y-3 text-left">
                          <p className="text-amber-400 font-semibold tracking-wide uppercase text-sm mb-1">Wer bin ich selbst, bevor ich die Welt gestalte?</p>
                          <p className="text-white font-normal">Wenn jeder Mensch bald der Manager unendlicher KI-Agenten ist – wer hilft ihm dann zu wissen, wer er selbst ist, bevor er diese Agenten führt?</p>
                          <p>Diese Frage ist der Ausgangspunkt von KIICH. In einer Welt, in der KI die äußere Produktivität exponentiell steigert, entsteht ein wachsendes Vakuum im Inneren: Wer bin ich? Was will ich wirklich? Welche meiner Entscheidungen kommen aus Klarheit – und welche aus Angst, Gewohnheit oder Fremderwartung?</p>
                          <p>KIICH ist die Antwort auf dieses Vakuum. Nicht als Therapie. Nicht als Coaching. Sondern als proprietäres Identitätssystem, das Sprache, Frequenz, Farbe und KI zu einem täglichen Selbsterkenntnisprozess verbindet.</p>
                        </div>
                      )}
                      <button
                        onClick={() => setShowKiichStatement(prev => !prev)}
                        className="text-sm font-semibold tracking-widest uppercase text-zinc-400 hover:text-white transition-colors duration-200 border-b border-zinc-600 hover:border-white pb-0.5"
                      >
                        {showKiichStatement ? 'Weniger lesen ↑' : 'Mehr lesen →'}
                      </button>
                    </div>
                    {/* 4 Buttons */}
                    <div className="flex flex-wrap justify-center gap-3 mt-2">
                      <button
                        onClick={() => setShowTrainingCenter(true)}
                        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border border-zinc-600 hover:border-white text-zinc-300 hover:text-white transition-all duration-200"
                      >
                        METHODE 36
                      </button>
                      <button
                        onClick={() => setShowPodcast(true)}
                        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase text-black transition-all duration-200 hover:opacity-90"
                        style={{background: 'linear-gradient(135deg, #e63329, #f5a623)'}}
                      >
                        HÖRBUCH
                      </button>
                      <button
                        onClick={() => document.getElementById('newsletter-section')?.scrollIntoView({behavior: 'smooth'})}
                        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border border-zinc-600 hover:border-white text-zinc-300 hover:text-white transition-all duration-200"
                      >
                        NEWSLETTER
                      </button>
                      <button
                        onClick={() => document.getElementById('vorschau-april-2026')?.scrollIntoView({behavior: 'smooth'})}
                        className="px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border transition-all duration-200"
                        style={{borderColor: 'rgba(245,166,35,0.5)', color: '#f5a623'}}
                      >
                        VORSCHAU APRIL 2026
                      </button>
                      <button
                        onClick={() => setLocation('/momentaufnahme')}
                        className="relative px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border border-violet-500/60 text-violet-300 hover:border-violet-400 hover:text-violet-200 transition-colors"
                      >
                        MOMENTAUFNAHME
                      </button>
                      <button
                        onClick={() => setShowAppInstallGuide(true)}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border border-zinc-600 hover:border-orange-500/60 text-zinc-400 hover:text-orange-300 transition-all duration-200 group"
                      >
                        <Smartphone className="w-4 h-4 text-orange-500 group-hover:scale-110 transition-transform" />
                        APP LADEN
                      </button>
                      <button
                        onClick={() => setLocation('/faq')}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-semibold tracking-widest uppercase border border-zinc-600 hover:border-amber-400/60 text-zinc-400 hover:text-amber-300 transition-all duration-200"
                      >
                        FAQ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              {/* ===== END KIICH HERO ===== */}

              {/* BETA LAUNCH BANNER: deaktiviert – zu früh für Veröffentlichung */}



              <div className="container max-w-6xl mx-auto px-4 pt-8">
                <PodcastFeature
                  coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/2_30109d8c.png"
                  title="MASCHINEN ATMEN NICHT"
                  subtitle="Die Chance auf selbstbestimmtes Glücklichsein"
                  description={
                    <div className="space-y-4">
                      <div className="mb-6">
                        <button 
                          onClick={() => setShowAuthorText(!showAuthorText)}
                          className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center transition-colors mb-2"
                        >
                          {showAuthorText ? (
                            <><ChevronUp className="w-4 h-4 mr-1" /> Autor-Info ausblenden</>
                          ) : (
                            <><ChevronDown className="w-4 h-4 mr-1" /> Über den Autor und seine Intention...</>
                          )}
                        </button>
                        {showAuthorText && (
                          <div className="bg-zinc-900/50 p-4 rounded-lg border border-orange-900/30 text-zinc-300 text-sm leading-relaxed mb-6 shadow-inner">
                            <p>
                              Der Autor ist kein Physiker, Mediziner oder Programmierexperte. Vielmehr baut er sein Weltbild kontrovers aus der Sicht eines Brückenbauingenieurs, Musikers und Atemexperten auf. Diese drei Fähigkeiten vereint das Naturgesetz der Harmonie. Ein lebendiges System fordert ein harmonisches, sich selbst regulierendes Tun als Existenzgrundlage ein. Genau hier zieht der Autor die Trennlinie zwischen Mensch und Maschine. Die fundamentale Fähigkeit des ATMENS wird dabei als entscheidender Qualitätsunterschied bestätigt. In beeindruckender Weise komprimiert der Autor wissenschaftlich-philosophische Darlegungen zu einer einfach zugänglichen Alltagspraxis, der METHODE 36.
                            </p>
                            <p className="mt-3">
                              Ein revolutionäres Hörbuch im Podcast-Format. Es verwebt die Originaltexte des Autors mit kontroversen Reflexionen KI-generierter Kompetenz zu einem lebendigen Dialog. Diese innovative Form bereitet anspruchsvolle wissenschaftliche und philosophische Themen leicht verständlich auf – um dich zu inspirieren und direkt in dein eigenes, selbstbestimmtes Tun mit der METHODE 36 zu führen.
                            </p>
                          </div>
                        )}
                      </div>
                      <p>
                         Willkommen zur Hörbuchserie MASCHINEN ATMEN NICHT von <i>Thomas Chochola</i>. Wir schreiben das Jahr 2026. Wenn es nach dem Autor geht, startet die Menschheit gerade in ein nie dagewesenes Abenteuer von Lebensqualität. Allerdings ist diese Qualität zweischneidig. Fremd- oder selbstbestimmt in einem Zeitalter mit schier unbegrenzten Möglichkeiten der Lebensentfaltung – das ist die entscheidende Frage, die es zu beantworten gilt.
                      </p>
                      <p>
                        Tauche bewusst ein in das Szenario, in dem du dich bereits befindest, und erkenne Lösungen, wie du dein Leben optimal inszenierst, in einer Zeit, die niemals wiederkommt und noch nie da war.
                      </p>
                    </div>
                  }
                  youtubeUrl=""
                  spotifyUrl=""
                  audioUrl="" // Platzhalter für die Podcast-Audiodatei
                  customAction={
                    <div className="flex flex-col items-center gap-3 mt-2">
                      <span className="text-orange-200/80 text-sm uppercase tracking-widest font-medium">HIER GEHT'S ZUM WÖCHENTLICHEN PODCAST</span>
                      <button 
                        onClick={() => setShowPodcast(true)}
                        className="group flex items-center gap-3 bg-gradient-to-r from-orange-500/20 to-orange-600/20 hover:from-orange-500/30 hover:to-orange-600/30 border border-orange-500/30 px-6 py-3 rounded-full transition-all duration-300"
                      >
                        <div className="bg-orange-500/20 p-2 rounded-full group-hover:scale-110 transition-transform duration-300">
                          <Headphones className="w-5 h-5 text-orange-400" />
                        </div>
                        <span className="font-bold text-orange-100 tracking-wide">SZENARIO 2026 PODCAST</span>
                        <ArrowRight className="w-4 h-4 text-orange-400 group-hover:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  }
                />
              </div>


              <div id="vorschau-april-2026" className="container max-w-6xl mx-auto px-4 mt-12 mb-24">

                {/* PREMIUM ANGEBOTE: deaktiviert für Marktauftritt */}
                <div id="premium-angebote-section" className="mt-16 mb-8" style={{display:'none'}}>
                  <div className="text-center mb-10">
                    <span className="inline-block bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black tracking-widest px-4 py-1.5 rounded-full mb-4">PREMIUM ANGEBOTE</span>
                    <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">Dein persönliches KIICH-Werkzeugset</h2>
                    <p className="text-zinc-400 max-w-xl mx-auto text-sm leading-relaxed">Drei Praxiswerkzeuge, die dich vom Zuhörer zum Gestalter machen. Wir öffnen sie schrittweise — als logische Fortsetzung der Episoden.</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">

                    {/* MOMENTAUFNAHME - navigiert zur echten Momentaufnahme-Seite */}
                    <div
                      className="relative bg-zinc-900/60 border border-violet-500/40 rounded-2xl p-6 overflow-hidden cursor-pointer hover:border-violet-400/70 transition-all duration-200 group"
                      onClick={() => setLocation('/momentaufnahme')}
                    >
                      {/* Violetter Glanz oben */}
                      <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="mb-4 flex items-center justify-between">
                        <span className="text-2xl">📸</span>
                        <span className="inline-flex items-center gap-1 bg-violet-500/15 border border-violet-500/30 text-violet-300 text-[10px] font-black px-2.5 py-1 rounded-full tracking-wider">
                          <Lock className="w-3 h-3" /> BALD FREI
                        </span>
                      </div>
                      <h3 className="text-white font-bold tracking-wider text-base mb-1">MOMENTAUFNAHME</h3>
                      <h4 className="text-violet-400 text-sm font-medium mb-3">Wo stehe ich gerade wirklich?</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Ein strukturierter Selbst-Check, der dir in wenigen Minuten ein klares Bild deiner aktuellen Lebenssituation gibt. Nicht als Bewertung — sondern als ehrlicher Kompass. Weil Klarheit der erste Schritt zur Veränderung ist.
                      </p>
                      <div className="mt-4 text-violet-400 text-xs font-medium flex items-center gap-1 group-hover:text-violet-300 transition-colors">
                        <span>Einführung lesen</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>

                    {/* TRAININGSCENTER / METHODE 36 */}
                    <div className="relative bg-zinc-900/60 border border-orange-500/20 rounded-2xl p-6 overflow-hidden cursor-pointer hover:border-orange-400/60 transition-all group"
                      onClick={() => setShowTrainingCenter(true)}
                    >
                      <div className="mb-4">
                        <span className="text-2xl">⚡</span>
                      </div>
                      <h3 className="text-white font-bold tracking-wider text-base mb-1">METHODE 36</h3>
                      <h4 className="text-orange-400 text-sm font-medium mb-3">36 Tage. Dein Rhythmus. Dein Leben.</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Ein wissenschaftlich fundiertes Trainingsprogramm, das auf deinem persönlichen Klangprofil aufbaut. Keine Einheitsformel — sondern ein System, das sich deinem einzigartigen Lebenspuls anpasst. Wer seinen Rhythmus kennt, kann ihn gestalten.
                      </p>
                    </div>

                    {/* BEFINDLICHKEITSTRAINING */}
                    <div className="relative bg-zinc-900/60 border border-red-500/20 rounded-2xl p-6 overflow-hidden cursor-pointer hover:border-red-400/60 transition-all group"
                      onClick={() => setShowTrainingCenter(true)}
                    >
                      <div className="mb-4">
                        <span className="text-2xl">🎯</span>
                      </div>
                      <h3 className="text-white font-bold tracking-wider text-base mb-1">BEFINDLICHKEITSTRAINING</h3>
                      <h4 className="text-red-400 text-sm font-medium mb-3">7 Minuten. Täglich. Selbstbestimmt.</h4>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Das kürzeste und wirksamste Training, das du je gemacht hast. Du bestimmst wann, wo und wie — und dein Körper gibt dir sofort Rückmeldung. So empfindungsfähig für deine wahren Bedürfnisse warst du noch nie.
                      </p>
                    </div>

                  </div>

                  {/* EINSCHLAF-BIBLIOTHEK */}
                  <div className="mt-6">
                    <div
                      className="relative bg-zinc-900/60 border border-indigo-500/30 rounded-2xl p-6 overflow-hidden cursor-pointer hover:border-indigo-400/60 transition-all duration-200 group"
                      onClick={() => setLocation('/einschlafen')}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/8 to-violet-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <span className="text-2xl">🌙</span>
                          <div>
                            <h3 className="text-white font-bold tracking-wider text-sm">EINSCHLAF-BIBLIOTHEK</h3>
                            <p className="text-indigo-400 text-xs">Märchen · Abenteuer · Befindlichkeits-Metaphern</p>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-indigo-400/50 group-hover:text-indigo-400 transition-colors" />
                      </div>
                      <p className="text-zinc-400 text-xs leading-relaxed">
                        Von MA generierte Einschlaf-Geschichten — personalisiert für Kinder, Jugendliche und Erwachsene. Mit ElevenLabs-Stimme vorgelesen.
                      </p>
                    </div>
                  </div>

                </div>
                {/* ===== END PREMIUM ANGEBOTE ===== */}


              </div>
              <div className="container max-w-6xl mx-auto px-4 flex justify-center mb-4">
                <button
                  onClick={() => setShowAppInstallGuide(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-orange-500/50 rounded-full text-zinc-300 hover:text-white transition-all group"
                >
                  <Smartphone className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                  <span>Hier die App auf dein Handy laden</span>
                </button>
              </div>
              <div className="container max-w-6xl mx-auto px-4">
                <Dashboard 
                  onStartAnalysis={() => setCurrentStep("preparation")}
                  onOpenTraining={() => setShowTrainingCenter(true)}
                  onOpenScanner={() => setShowSpectralScanner(true)}
                  onOpenKnowledge={() => setShowKnowledgePool(true)}
                  onOpenTable={() => setShowFrequencyTable(true)}
                  onOpenVital={() => setShowVitalDashboard(true)}
                  onOpenSleep={() => setShowSleepTheta(true)}
                  onOpenHistory={() => setShowHistory(true)}
                  onOpenVisionsraum={() => setShowVisionsraum(true)}
                  isPremium={isPremium || user?.role === "admin"}
                  onTogglePremium={() => {}}
                />
              </div>
              <div id="newsletter-section" className="container max-w-6xl mx-auto px-4 mt-10 mb-8">
                <NewsletterSignup source="podcast" />
              </div>

              {/* Admin-Statistik-Dashboard – nur für Admins sichtbar */}
              {user?.role === "admin" && <AdminStatsDashboard />}
              
            </div>
        );

      case "preparation":
        return (
          <div className="max-w-2xl mx-auto py-20 px-4 animate-in slide-in-from-bottom-8 duration-700 pt-32">
            <h2 className="text-3xl font-bold text-white mb-8">Vorbereitung zur Stimmklanganalyse</h2>
            
            <div className="space-y-4 mb-12">
              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">0</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Voraussetzungen</h3>
                        <p className="text-zinc-400 text-sm">Du solltest die folgende Stimmklanganalyse nur machen, wenn deine Stimme frei ist von Einschränkungen jeglicher Art (Schnupfen, Husten, Heiserkeit, überanstrengte Stimme aus dem Tagesgeschehen). Mache die Analyse deiner Stimme nicht am Morgen, nicht nachdem du gegessen hast (mindestens zwei Stunden sollten vergangen sein) und nicht wenn du von einer anstrengenden Tätigkeit kommst.</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">1</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Ruhige Umgebung</h3>
                        <p className="text-zinc-400 text-sm">Nimm dir 10 min Zeit an einem ruhigen ungestörten Platz deiner Wahl. Du benötigst einen Sitzplatz auf dem du aufrecht Platz nehmen kannst. Weiche Sofas oder ähnliche Sitzmöglichkeiten sind ungeeignet. Es dürfen keine Nebengeräusche im Umfeld vorhanden sein.</p>
                    </div>
                </CardContent>
              </Card>

              <Card className="bg-zinc-900/50 border-zinc-800">
                <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-orange-500 font-bold">2</span>
                    </div>
                    <div>
                        <h3 className="text-white font-medium mb-1">Wasser bereitstellen</h3>
                        <p className="text-zinc-400 text-sm">Stelle für dich ein Glas mit angenehm warmen Trinkwasser bereit und öffne das Stimmklangprogramm auf deinem Handy oder Computer.</p>
                    </div>
                </CardContent>
              </Card>
            </div>

            <div className="relative">
              <Button
                onClick={() => {
                  toast({
                    title: 'PREMIUM – Bald verfügbar',
                    description: 'Die MOMENTAUFNAHME-Analyse öffnen wir schrittweise für unsere Community.',
                  });
                }}
                size="lg"
                className="w-full h-14 text-lg rounded-full opacity-60 cursor-not-allowed"
              >
                <Lock className="mr-2 w-5 h-5" />
                PREMIUM – Bald verfügbar
              </Button>
              <span className="block text-center text-xs text-zinc-500 mt-3">Diese Funktion wird schrittweise für die Community geöffnet.</span>
            </div>
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

      case "recording1":
      case "recording2":
      case "recording3":
      case "recording4":
        const recordingTitles: Record<string, string> = {
          recording1: "Dein Tagesablauf",
          recording2: "Herzens-Erinnerung",
          recording3: "Der Ton A",
          recording4: "Tiefstes Summen"
        };

        const recordingInstructions: Record<string, string> = {
          recording1: "Beginne bitte nun mit ganz normaler Sprechstimme zu erzählen, wie dein bisheriger Tag verlaufen ist. Erinnere dich einfach an die Ereignisse des Tages und erzähle davon. Nimm dir dafür zumindest eine Minute, aber gerne auch länger Zeit dafür.\n\nDRÜCKE DEN STARTBUTTON BEVOR DU BEGINNST ZU ERZÄHLEN.",
          recording2: "Schliesse deine Augen. Wandere mit deiner inneren Aufmerksamkeit in dein Herzzentrum. Atme sanft dreimal in deine Brust und erinnere dich an ein wunderschönes Erlebnis. Es kann aus deiner Kindheit oder auch aus der nahen Vergangenheit stammen. Wichtig ist, dass es eine schöne, angenehme Erinnerung ist, die in dein Bewusstsein tritt.\n\nDRÜCKE BITTE DEN STARTBUTTON\nNun erzähle davon. Wenn du fertig bist öffne deine Augen und drücke den Stoppbutton.",
          recording3: "Töne einen dir angenehmen Ton, indem du den Laut AAAAAAAAhhhh klingen lässt. Wiederhole den Ton 2x nachdem du zu Beginn deines Tönenes den STARTBUTTON gedrückt hast.",
          recording4: "Zum Abschluss versuchst du nun den tiefsten Ton zu tönen der dir möglich scheint. Verwende dazu die Silbe NOOOOOO und töne tief in deine Wirbelsäule hinab nachdem du den Startbutton gedrückt hast. Wiederhole diesen tiefsten Summton noch weitere 2x."
        };
        
        // Determine if current step is done
        const isCurrentStepDone = 
           (currentStep === "recording1" && results.r1) ||
           (currentStep === "recording2" && results.r2) ||
           (currentStep === "recording3" && results.r3) ||
           (currentStep === "recording4" && results.r4);

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

            {/* Show question text only if recording is not done */}
            {!isCurrentStepDone && (
              <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 max-w-2xl leading-tight">
                {recordingTitles[currentStep]}
              </h2>
            )}
            
            {/* Instructions - Only show if NOT done */}
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
                   {currentStep === "recording4" ? "Analyse abschließen" : "Nächster Schritt"} <ArrowRight className="ml-2 w-5 h-5" />
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

        if (!res || !mdi) return (
            <div className="text-white p-8 pt-48 text-center">
                <h2 className="text-2xl font-bold text-red-500 mb-4">Fehler bei der Auswertung.</h2>
                <pre className="text-xs text-left bg-zinc-900 p-4 rounded-lg inline-block overflow-auto max-w-full">
{`Debug Info:
res: ${res ? 'ok' : 'missing'}
mdi: ${mdi ? 'ok' : 'missing'}
isStudyComplete: ${isStudyComplete ? 'yes' : 'no'}
finalResult: ${finalResult ? 'ok' : 'missing'}
mdiResult: ${mdiResult ? 'ok' : 'missing'}
studyResult: ${studyResult ? 'ok' : 'missing'}
studyMdiResult: ${studyMdiResult ? 'ok' : 'missing'}
`}
                </pre>
                <div className="mt-8">
                    <Button onClick={() => window.location.reload()} variant="outline">
                        Neu starten
                    </Button>
                </div>
            </div>
        );

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
              
              <h1 
                className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter"
                style={{ color: mdi.hex }}
              >
                {mdi.metaphor || "DER CHARISMAT"}
              </h1>
              <p className="text-xl text-orange-500 font-medium">{mdi.frequency} Hz (Lebensklang)</p>

              {wurzelklangMdi && (
                <div className="inline-block bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 mt-4">
                  <p className="text-sm text-zinc-400 uppercase tracking-widest mb-1">Dein Wurzelklang</p>
                  <p className="text-2xl font-bold text-white">{wurzelklangMdi.colorName}</p>
                  <p className="text-md text-orange-400">{wurzelklangMdi.frequency} Hz</p>
                </div>
              )}
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
                      Qualität & Synonyme
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Detailbeschreibung</h4>
                        <p className="text-zinc-300">{mdi.description}</p>
                    </div>
                    <div>
                        <h4 className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Synonyme</h4>
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
                      className={`border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer transition-all ${wurzelklangVerified ? 'border-green-500/50 hover:border-green-500/70' : ''}`}
                      onClick={() => setShowWurzelklangVerification(true)}
                    >
                      {wurzelklangVerified ? '✓' : '✓'}
                    </Button>
                    <Button 
                      variant="outline" 
                      className="border-zinc-800 hover:bg-zinc-800 hover:border-zinc-600 cursor-pointer transition-all text-xs"
                      onClick={() => {
                        if (user?.role !== "admin" && !isPremium) {
                          toast({
                            title: "Premium-Feature",
                            description: "Das YOHN-Training ist Teil des Premium-Angebots. Upgrade erforderlich.",
                          });
                          return;
                        }
                        setShowTrainingCenter(false);
                        setSelectedTrainingItem("yohn");
                        setSelectedTrainingDuration(12);
                        setShowDirectTrainer(true);
                      }}
                    >
                      <Music2 className="mr-2 h-4 w-4 shrink-0" />
                      HIER KLICKEN - zum YOHNTRAINING mit deinem LEBENSKLANG
                    </Button>
                  </div>
                  
                  <div className="flex flex-col items-center gap-2">
                    <Button 
                        variant="ghost" 
                        className="text-zinc-500 hover:text-white cursor-pointer transition-colors w-full border border-dashed border-zinc-800"
                        onClick={handleDownloadResult}
                      >
                        <Download className="mr-2 h-4 w-4" />
                        Zertifikat als PDF speichern
                    </Button>
                    <p className="text-[10px] text-zinc-500 text-center px-4">
                      Tipp: Lade dein Zertifikat herunter, um deine detaillierten Ergebnisse (inkl. Aura-Bild) dauerhaft zu sichern.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            {/* AURA VISUALIZATION (Restored) */}
            {res && res.mdiDistribution && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
                    <SoundBody 
                        toneDistribution={convertMdiDistributionToToneDistribution(res.mdiDistribution)} 
                        dominantToneName={getToneNameFromMdiId(mdi.id)}
                        dominantToneId={mdi.id}
                    />
                </div>
            )}

            {/* HARMONIC SPECTRUM ANALYSIS */}
            {res && res.mdiDistribution && (
                <div className="mb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-700">
                    <HarmonicSpectrumChart 
                        toneDistribution={res.mdiDistribution}
                        dominantToneId={mdi.id}
                        onToneClick={(toneId) => {
                          setKnowledgePoolInitialTab("frequencies");
                          setKnowledgePoolInitialToneId(toneId);
                          setShowKnowledgePool(true);
                        }}
                    />
                </div>
            )}
            
            {/* Longitudinal Progress */}
            {!isStudyComplete && (
                <div className="mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="text-lg font-semibold text-white">Deine 3-Tage-Messung</h3>
                            <p className="text-sm text-zinc-400">Wir benötigen 3 Messungen für dein valides Profil.</p>
                        </div>
                        <div className="text-2xl font-bold text-orange-500">
                            {daysCompleted} / 3
                        </div>
                    </div>
                    <Progress value={(daysCompleted / 3) * 100} className="h-2 bg-zinc-800" />
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
                    ZUR HAUPTSEITE
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

  // Nicht eingeloggt: Willkommens-Screen mit Manus-Login + DSGVO anzeigen
  if (!loading && !isAuthenticated) {
    return <WillkommensScreen />;
  }

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
                     <ArrowLeft className="mr-2 w-4 h-4" /> ZUR HAUPTSEITE
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
          {showPodcast && (
            <div className="fixed inset-0 z-50 bg-black overflow-y-auto pt-24">
              <div className="container max-w-4xl mx-auto px-4 py-8 relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowPodcast(false)}
                  className="absolute top-4 left-4 z-50 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  ZUR HAUPTSEITE
                </Button>
                <div className="mt-8 flex flex-col gap-10">
                  {/* ===== HEADLINER ===== */}
                  <div className="text-center">
                    <p className="text-xs font-mono text-red-500 uppercase tracking-widest mb-3">DIE HÖRBUCHSERIE</p>
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-1">MASCHINEN ATMEN NICHT</h2>
                    <p className="text-orange-400 text-base font-medium">das interaktive HÖRBUCH von Thomas Chochola</p>
                  </div>

                  {/* ===== WIE DIESES HÖRBUCH ENTSTEHT ===== */}
                  <div className="bg-zinc-900/60 border border-orange-500/15 rounded-2xl px-6 py-5">
                    <p className="text-orange-400 text-xs font-black tracking-widest uppercase mb-3">Wie dieses Hörbuch entsteht</p>
                    <p className="text-zinc-300 text-sm leading-relaxed">
                      Im Sinne der KIICH Philosophie werden die originalen Rohtexte des Autors von KI-Stimmen <span className="text-zinc-400">(Google NotebookLM)</span> dialogmässig interpretiert. Die inhaltliche Aufbereitung legt dabei das Hauptaugenmerk auf leichte Verständlichkeit und praxisnaher Interpretation der Originaltexte.
                    </p>
                  </div>

                  {/* ===== AKTUELLE EPISODE AUS DATENBANK ===== */}
                  {latestPodcastEpisode && (
                    <div id={`episode-${latestPodcastEpisode.episodeNumber}`} style={{scrollMarginTop: '80px'}}>
                      <p className="text-xs text-orange-400 uppercase tracking-widest font-mono mb-4">Aktuelle Episode</p>
                      <PodcastFeature
                        topLabel="NEUESTE EPISODE"
                        coverImage={latestPodcastEpisode.coverImageUrl}
                        title={<>2026 EPISODE {latestPodcastEpisode.episodeNumber}<br/><span className="text-orange-400 block mt-1">{latestPodcastEpisode.catchphrase}</span></>}
                        subtitle={latestPodcastEpisode.subtitle}
                        audioUrl={latestPodcastEpisode.audioUrl}
                        description={latestPodcastEpisode.description ?? undefined}
                      />
                    </div>
                  )}

                  {/* ===== FRÜHERE EPISODEN AUS DATENBANK ===== */}
                  {olderPodcastEpisodes.length > 0 && (
                    <div className="border-t border-zinc-800 pt-8">
                      <p className="text-zinc-500 text-xs uppercase tracking-widest mb-6 text-center">Frühere Episoden</p>
                      <div className="space-y-6">
                        {olderPodcastEpisodes.map(ep => (
                          <div key={ep.id} id={`episode-${ep.episodeNumber}`} style={{scrollMarginTop: '80px'}}>
                            <PodcastFeature
                              coverImage={ep.coverImageUrl}
                              title={<>2026 EPISODE {ep.episodeNumber}<br/><span className="text-orange-400 block mt-1">{ep.catchphrase}</span></>}
                              subtitle={ep.subtitle}
                              audioUrl={ep.audioUrl}
                              description={ep.description ?? undefined}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* STIMMEN AUS DEM FELD */}
                  <div className="mt-10 mb-4 relative">
                    <div className="relative z-10 text-center mb-8">
                      <h2 className="text-2xl font-bold text-white mb-3 tracking-tight">STIMMEN AUS DEM FELD</h2>
                      <p className="text-zinc-400 max-w-2xl mx-auto text-sm">Die Reise ins Jahr 2026 hat bereits begonnen. Hier teilen Pioniere ihre ersten Erkenntnisse und Erfahrungen auf dem Weg zu mehr Selbstbestimmung.</p>
                    </div>
                    <div className="max-w-4xl mx-auto">
                      {/* Barbara Mohr-Modes Statement */}
                      <div className="bg-zinc-900/40 border border-orange-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden group mb-6">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-600" />
                        <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" />
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <span className="text-orange-400 font-bold text-lg">BM</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Barbara Mohr-Modes</h4>
                            <p className="text-zinc-500 text-sm">USA / Deutschland • April 2026</p>
                          </div>
                        </div>
                        <blockquote className="text-zinc-300 leading-relaxed text-lg italic">
                          <p className="mb-4">"Hi Thomas, wollte dir nur kurz sagen, dein 2. Podcast hat mir <strong className="text-orange-400">SEHR gut gefallen</strong>, mein Gehirn liebt deine visuellen Bilder, wie Du weißt!</p>
                          <p>Ich höre die Podcasts immer mehrmals an und diese Bilder werden weiter ausgemalt… <strong className="text-orange-400">ganz bunt!</strong>"</p>
                        </blockquote>
                      </div>
                      {/* Monika Feldmeier Statement */}
                      <div className="bg-zinc-900/40 border border-orange-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-600" />
                        <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" />
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <span className="text-orange-400 font-bold text-lg">MF</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Monika Feldmeier</h4>
                            <p className="text-zinc-500 text-sm">13. April 2026</p>
                          </div>
                        </div>
                        <blockquote className="text-zinc-300 leading-relaxed text-lg italic">
                          <p className="mb-4">"Bin dir jetzt schon extrem dankbar für dein Hörbuch 🙏🏽</p>
                          <p className="mb-4">Lektion 2 hab ich sofort umgesetzt – Phänomenal. Mach ich jetzt so oft wie möglich, damit es sich automatisiert. Freu mich schon auf Lektion 03.</p>
                          <p className="mb-4">So verständlich hat es mir noch keiner erklären können – aber so logisch und nachvollziehbar. Danke dafür 🙏🏽💕</p>
                          <p className="mb-2">Und noch eine Erfahrung: Ich hab nachdem ich diese 6 Atemzüge in 1 Minute gemacht habe sofort gespürt, dass ich ruhiger wurde – und es war wie eine <strong className="text-orange-400">Energietankstelle</strong>."</p>
                        </blockquote>
                      </div>
                      {/* Johannes E. Statement */}
                      <div className="bg-zinc-900/40 border border-orange-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden group mt-6">
                        <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-orange-400 to-red-600" />
                        <MessageSquare className="absolute top-8 right-8 w-12 h-12 text-orange-500/10 group-hover:text-orange-500/20 transition-colors" />
                        <div className="flex items-center gap-4 mb-6">
                          <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                            <span className="text-orange-400 font-bold text-lg">JE</span>
                          </div>
                          <div>
                            <h4 className="text-white font-medium">Johannes E.</h4>
                            <p className="text-zinc-500 text-sm">D-Regensburg • 03.04.2026</p>
                          </div>
                        </div>
                        <JohannesStatement />
                      </div>
                    </div>
                  </div>

                  {/* Feedback-Einladung */}
                  <div className="mt-8 text-center">
                    <p className="text-zinc-400 mb-4 max-w-lg mx-auto">
                      Wie hat dir die aktuelle EPISODE gefallen? Teile gerne deine Gedanken mit uns.
                    </p>
                    <a
                      href="mailto:LKRforschung@gmail.com?subject=Meine Eindrücke zur aktuellen Episode"
                      className="inline-flex items-center justify-center px-6 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-medium rounded-lg transition-colors shadow-lg"
                    >
                      <MessageSquare className="w-5 h-5 mr-2" />
                      Meine Eindrücke.
                    </a>
                  </div>
                </div>
              </div>
            </div>
          )}

          {showPraxis01 && (
            <div className="fixed inset-0 z-50 bg-black overflow-y-auto pt-24">
              <div className="container max-w-4xl mx-auto px-4 py-8 relative">
                <Button
                  variant="ghost"
                  onClick={() => setShowPraxis01(false)}
                  className="absolute top-4 left-4 z-50 text-zinc-400 hover:text-white"
                >
                  <ArrowLeft className="w-5 h-5 mr-2" />
                  ZUR HAUPTSEITE
                </Button>
                
                <div className="mt-8">
                  <PodcastFeature 
                    title={<>2026 PRAXIS 01<br/><span className="text-orange-400 block mt-1">ECHT KRASS!</span></>}
                    subtitle="Befindlichkeitstraining das ich selbst bestimme? So empfindungsfähig für meine wahren Bedürfnisse war ich nie zuvor! Und das mit sieben Minuten selbstbestimmten Trainings zwischendurch..."
                    coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png"
                    audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/einschwingenSTIMMKLANGANALYSE_f1530836.wav"
                  />
                </div>
              </div>
            </div>
          )}

          {showHistory ? (
             <div className="fixed inset-0 z-50 bg-black overflow-y-auto pt-24">
                <div className="container max-w-4xl mx-auto px-4 py-8 relative">
	                  <Button
	                    variant="ghost"
	                    onClick={() => setShowHistory(false)}
	                    className="absolute top-4 left-4 z-50 text-zinc-400 hover:text-white"
	                  >
	                    <ArrowLeft className="w-5 h-5 mr-2" />
	                    ZUR HAUPTSEITE
	                  </Button>
                  <AnalysisHistory />
                </div>
             </div>
          ) : showSleepTheta ? (
            <SleepTheta onClose={() => setShowSleepTheta(false)} />
          ) : showKnowledgePool ? (
            <KnowledgePool 
              onClose={() => {
                setShowKnowledgePool(false);
                // Reset to defaults when closing
                setKnowledgePoolInitialTab("method");
                setKnowledgePoolInitialToneId(undefined);
              }} 
              initialTab={knowledgePoolInitialTab}
              initialToneId={knowledgePoolInitialToneId}
            />
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
                frequency={basicTrainingData?.freq || finalResult?.fundamentalFreq || mdiResult?.frequency || 97.2}
                toneName={basicTrainingData?.tone || finalResult?.tone?.name || "G"}
                color={basicTrainingData?.color || mdiResult?.hex || "#ff5757"}
                typeId={basicTrainingData?.typeId || mdiResult?.id || 19}
                duration={selectedTrainingDuration || 7}
                onClose={() => {
                  setShowDirectTrainer(false);
                  setShowTrainingCenter(false);
                  setSelectedTrainingItem(null);
                  setBasicTrainingData(null);
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
               duration={selectedTrainingDuration || 0}
               audioUrls={{
                 0: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/RESONSANZausdemRAUM_434eee24.mp3"
               }}
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
               duration={selectedTrainingDuration || 0}
               audioUrls={{
                 45: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/ambient-extra_262fb71f.mp3"
               }}
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
                isPremium={isPremium}
                onClose={() => setShowTrainingCenter(false)}
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
                }}
                onStartBasicTraining={(freq, tone, color, typeId) => {
                  setBasicTrainingData({freq, tone, color, typeId});
                  setSelectedTrainingItem("yohn");
                  setSelectedTrainingDuration(7);
                  setShowDirectTrainer(true);
                }}
                onOpenKnowledge={() => {
                  setShowKnowledgePool(true);
                  setKnowledgePoolInitialTab("method");
                }}
              />
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
          ) : showVisionsraum ? (
            <Visionsraum onClose={() => setShowVisionsraum(false)} />
          ) : showMomentaufnahme ? (
            <div className="max-w-2xl mx-auto py-20 px-4 animate-in slide-in-from-bottom-8 duration-700 pt-32">
              <button
                onClick={() => setShowMomentaufnahme(false)}
                className="mb-8 flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm"
              >
                <ArrowLeft className="w-4 h-4" /> Zurück
              </button>
              <div className="inline-block mb-3 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/30 text-violet-400 text-xs font-mono tracking-widest">
                MOMENTAUFNAHME
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Wo stehe ich gerade wirklich?</h2>
              <p className="text-violet-400 text-sm mb-8">Ein ehrlicher Kompass für deine aktuelle Lebenssituation</p>

              <div className="space-y-4 mb-12">
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-violet-400 font-bold text-sm">1</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Was ist die MOMENTAUFNAHME?</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Die MOMENTAUFNAHME ist ein strukturierter Selbst-Check, der dir in wenigen Minuten ein klares Bild deiner aktuellen Lebenssituation gibt. Nicht als Bewertung — sondern als ehrlicher Kompass. Weil Klarheit der erste Schritt zur Veränderung ist.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-violet-400 font-bold text-sm">2</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Wie funktioniert sie?</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Du beantwortest einige gezielte Fragen zu deinem körperlichen, emotionalen und mentalen Befinden. MIND 2 — die Maschine — hilft dir dabei, Muster zu erkennen, die MIND 1 — der Mensch in dir — alleine oft nicht sieht.
                      </p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-violet-400 font-bold text-sm">3</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">Wann wird sie freigeschaltet?</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">
                        Wir öffnen die MOMENTAUFNAHME schrittweise — als logische Fortsetzung der Episoden. Wer die Episoden hört und versteht, ist bereit für das Werkzeug. Das Häppchenprinzip schützt vor Überforderung und sichert Tiefe statt Oberfläche.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="relative">
                <Button
                  onClick={() => {
                    toast({
                      title: 'PREMIUM — Bald verfügbar',
                      description: 'Die MOMENTAUFNAHME wird schrittweise für die Community geöffnet. Bleib dabei!',
                    });
                  }}
                  size="lg"
                  className="w-full h-14 text-lg rounded-full bg-violet-600/40 hover:bg-violet-600/50 border border-violet-500/40 text-violet-200 cursor-not-allowed"
                >
                  <Lock className="mr-2 w-5 h-5" />
                  Ich bin bereit — PREMIUM
                </Button>
                <span className="block text-center text-xs text-zinc-500 mt-3">Diese Funktion wird schrittweise für die Community geöffnet.</span>
              </div>
            </div>
          ) : (
            renderContent()
          )}
        </main>
        
        {/* Footer */}
        {!showStory && !showSpectralScanner && !showVitalDashboard && !showIntervalTrainer && !showDirectTrainer && !showFrequencyTable && !showTrainingCenter && !showVisionsraum && currentStep === 'dashboard' && (
            <footer className="mt-24 pb-8 border-t border-zinc-900 pt-8 flex flex-col gap-6 text-xs text-zinc-600">
                {/* Disclaimer */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-5 py-4 text-zinc-400 text-xs leading-relaxed">
                  <p className="font-semibold text-zinc-300 mb-1 uppercase tracking-widest">Haftungsausschluss</p>
                  <p>
                    KIICH ist kein medizinisches Angebot. Die Inhalte und KI-generierten Auswertungen dienen ausschließlich der persönlichen Selbstreflexion und stellen keine medizinische Diagnose, psychologische Beratung oder Therapie dar. Bei psychischen Krisen wenden Sie sich bitte an eine qualifizierte Fachkraft.
                  </p>
                  <div className="mt-3 flex flex-col sm:flex-row gap-3 text-[11px]">
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 shrink-0">🇩🇪 Deutschland:</span>
                      <span><span className="text-zinc-200 font-medium">0800 111 0 111</span> oder <span className="text-zinc-200 font-medium">0800 111 0 222</span> <span className="text-zinc-500">(Telefonseelsorge, kostenlos, 24h)</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 shrink-0">🇨🇭 Schweiz:</span>
                      <span><span className="text-zinc-200 font-medium">143</span> <span className="text-zinc-500">(Die Dargebotene Hand, kostenlos, 24h)</span></span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-zinc-500 shrink-0">🇦🇹 Österreich:</span>
                      <span><span className="text-zinc-200 font-medium">142</span> <span className="text-zinc-500">(Telefonseelsorge, kostenlos, 24h)</span></span>
                    </div>
                  </div>

                </div>

                {/* Globaler Hinweis */}
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-lg px-5 py-4 text-zinc-400 text-xs leading-relaxed">
                  <p className="font-semibold text-zinc-300 mb-1 uppercase tracking-widest">Globaler Hinweis</p>
                  <p>
                    Sämtliche Inhalte von KIICH sind ausschließlich innerhalb der KIICH-Applikation zugänglich. Anteilige Freischaltungen für Exporte und Downloads sind der Premiumklasse vorbehalten.
                  </p>
                </div>
                {/* Über den Gründer */}
                <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl px-6 py-5">
                  <p className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-3">Über den Gründer</p>
                  <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                    <span className="font-semibold text-white">Thomas Chochola</span> entwickelt seit Jahrzehnten Produkte und Konzepte an der Schnittstelle von Frequenz, Bewusstsein und Transformation. Drei Referenzprojekte belegen die internationale Marktreife dieser Arbeit:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                    <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50">
                      <p className="text-orange-400 font-semibold mb-1">ALADIN</p>
                      <p className="text-zinc-400 leading-relaxed">Energetische Wasserkaraffe · TCenergydesign · Vertrieb in USA, Japan, Europa · heute: <a href="https://www.livingdesigns.de" target="_blank" rel="noopener noreferrer" className="text-orange-500/70 hover:text-orange-400 transition-colors">livingdesigns.de</a></p>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50">
                      <p className="text-orange-400 font-semibold mb-1">ECHOBELL</p>
                      <p className="text-zinc-400 leading-relaxed">Tragbares Klang- und Vibrationsinstrument · von Ärzten empfohlen · <a href="https://www.echobell.at" target="_blank" rel="noopener noreferrer" className="text-orange-500/70 hover:text-orange-400 transition-colors">echobell.at</a></p>
                    </div>
                    <div className="bg-zinc-800/60 rounded-lg p-4 border border-zinc-700/50">
                      <p className="text-orange-400 font-semibold mb-1">AUMEGA</p>
                      <p className="text-zinc-400 leading-relaxed">CD zur Gehirnaktivierung · mit Biophysiker Dieter Broers · <a href="https://dieterbroers.com/shop/downloads/aumega-die-vision-download/" target="_blank" rel="noopener noreferrer" className="text-orange-500/70 hover:text-orange-400 transition-colors">dieterbroers.com</a></p>
                    </div>
                  </div>
                  <p className="mt-4 pt-4 border-t border-zinc-700/50 text-zinc-500 text-xs italic">&ldquo;Frequenz ist nicht abstrakt – sie ist erfahrbar, messbar und transformativ.&rdquo;</p>
                </div>

                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>&copy; {new Date().getFullYear()} KIICH. Alle Rechte vorbehalten.</div>
                  <div className="flex gap-6">
                      <Link href="/faq" className="hover:text-white transition-colors">FAQ</Link>
                      <Link href="/impressum" className="hover:text-white transition-colors">Impressum</Link>
                      <Link href="/datenschutz" className="hover:text-white transition-colors">Datenschutz</Link>
                      <Link href="/nutzungsbedingungen" className="hover:text-white transition-colors">Nutzungsbedingungen</Link>
                      <Link href="/rechts-checkliste" className="hover:text-orange-400 transition-colors">⚖ Rechts-Checkliste</Link>
                  </div>
                </div>
            </footer>
        )}
        {showAppInstallGuide && (
          <AppInstallGuide onClose={() => setShowAppInstallGuide(false)} />
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
