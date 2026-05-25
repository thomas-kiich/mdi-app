import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { SpectrumVisualizer } from "@/components/SpectrumVisualizer";
import { SoundBody } from "@/components/SoundBody";
import { CertificateView } from "@/components/CertificateView";
import { InterpretationView } from "@/components/InterpretationView";
import { HarmonicSpectrumChart } from "@/components/HarmonicSpectrumChart";
import { WurzelklangVerification } from "@/components/WurzelklangVerification";
import { KnowledgePool } from "@/components/KnowledgePool";
import { useAudioAnalyzer, AnalysisResult } from "@/hooks/useAudioAnalyzer";
import { useLongitudinalStudy } from "@/hooks/useLongitudinalStudy";
import { getToneFromFrequency, TONES } from "@/lib/tones";
import { getToneNameFromMdiId, convertMdiDistributionToToneDistribution } from "@/lib/mdiToToneMapping";
import frequencyData from "@/lib/frequencyData.json";
import {
  Loader2, Mic, ArrowRight, Sparkles, Check, Download, Music2, ArrowLeft,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useWaterSound } from "@/hooks/useWaterSound";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";

type WizardStep =
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

export default function StimmklangWizard() {
  const [, setLocation] = useLocation();
  const { user } = useAuth();

  // Check if user has paid – redirect if not
  const { data: statusData, isLoading: checkingPayment } = trpc.raum36.getStatus.useQuery(
    undefined,
    { enabled: !!user }
  );

  const [currentStep, setCurrentStep] = useState<WizardStep>("preparation");

  const {
    isRecording,
    startRecording,
    stopRecording,
    result: analysisResult,
  } = useAudioAnalyzer();

  const {
    daysCompleted,
    isComplete: isStudyComplete,
    finalResult: studyResult,
    mdiResult: studyMdiResult,
    saveDailyResult,
  } = useLongitudinalStudy();

  // Results from each recording step
  const [results, setResults] = useState<{
    r1: AnalysisResult | null;
    r2: AnalysisResult | null;
    r3: AnalysisResult | null;
    r4: AnalysisResult | null;
  }>({ r1: null, r2: null, r3: null, r4: null });

  // Relaxation timer
  const [relaxationTimeLeft, setRelaxationTimeLeft] = useState(180);
  const [isRelaxing, setIsRelaxing] = useState(false);
  const waterSound = useWaterSound();

  // Ref auf den laufenden Interval – damit kann er von außen (Überspringen) sofort gestoppt werden
  const relaxIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isRelaxing) {
      // Interval stoppen wenn isRelaxing auf false geht (Überspringen oder goBack)
      // Beim Timer-Ende ist relaxIntervalRef bereits null (wurde im Callback gecleart)
      if (relaxIntervalRef.current) {
        clearInterval(relaxIntervalRef.current);
        relaxIntervalRef.current = null;
        // Ton ausblenden – nur beim manuellen Abbruch (Überspringen/goBack)
        waterSound.stop();
      }
      return;
    }
    // Timer starten
    relaxIntervalRef.current = setInterval(() => {
      setRelaxationTimeLeft(prev => {
        if (prev <= 1) {
          // Timer abgelaufen: Interval sofort stoppen, Ton ausblenden, State zurücksetzen
          if (relaxIntervalRef.current) {
            clearInterval(relaxIntervalRef.current);
            relaxIntervalRef.current = null;
          }
          waterSound.stop();
          setIsRelaxing(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (relaxIntervalRef.current) {
        clearInterval(relaxIntervalRef.current);
        relaxIntervalRef.current = null;
      }
    };
  }, [isRelaxing]); // nur isRelaxing als Dependency

  // Final result states
  const [finalResult, setFinalResult] = useState<any | null>(null);
  const [mdiResult, setMdiResult] = useState<(typeof frequencyData)[0] | null>(null);
  const [wurzelklangMdi, setWurzelklangMdi] = useState<(typeof frequencyData)[0] | null>(null);
  const [showInterpretation, setShowInterpretation] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [showKnowledgePool, setShowKnowledgePool] = useState(false);
  const [knowledgePoolInitialTab, setKnowledgePoolInitialTab] = useState<string>("method");
  const [knowledgePoolInitialToneId, setKnowledgePoolInitialToneId] = useState<number | undefined>(undefined);
  const [showWurzelklangVerification, setShowWurzelklangVerification] = useState(false);
  const [wurzelklangVerified, setWurzelklangVerified] = useState(false);

  // Capture result when recording stops
  const wasRecordingRef = useRef(false);
  useEffect(() => {
    if (wasRecordingRef.current && !isRecording && analysisResult) {
      if (currentStep === "recording1") setResults((p) => ({ ...p, r1: analysisResult }));
      else if (currentStep === "recording2") setResults((p) => ({ ...p, r2: analysisResult }));
      else if (currentStep === "recording3") setResults((p) => ({ ...p, r3: analysisResult }));
      else if (currentStep === "recording4") setResults((p) => ({ ...p, r4: analysisResult }));
    }
    wasRecordingRef.current = isRecording;
  }, [isRecording, analysisResult, currentStep]);

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

  const goBack = () => {
    // Beim Zurückgehen: laufende Aufnahme stoppen
    // Wassergeräusch wird über setIsRelaxing(false) gestoppt (useEffect reagiert darauf)
    if (isRecording) stopRecording();
    setIsRelaxing(false);
    if (currentStep === "relaxation") setCurrentStep("preparation");
    else if (currentStep === "recording1") { setCurrentStep("relaxation"); setRelaxationTimeLeft(180); }
    else if (currentStep === "pause1") { setCurrentStep("recording1"); setResults((p) => ({ ...p, r1: null })); }
    else if (currentStep === "recording2") setCurrentStep("pause1");
    else if (currentStep === "pause2") { setCurrentStep("recording2"); setResults((p) => ({ ...p, r2: null })); }
    else if (currentStep === "recording3") setCurrentStep("pause2");
    else if (currentStep === "pause3") { setCurrentStep("recording3"); setResults((p) => ({ ...p, r3: null })); }
    else if (currentStep === "recording4") setCurrentStep("pause3");
    else if (currentStep === "result") setCurrentStep("preparation");
  };

  const calculateFinalResult = () => {
    const combinedMdiDistribution: Record<string, number> = {};
    const combinedDistribution: Record<string, number> = {};

    const processResult = (res: AnalysisResult | null) => {
      if (!res) return;
      if (res.mdiDistribution) {
        for (const [id, percent] of Object.entries(res.mdiDistribution)) {
          combinedMdiDistribution[id] = (combinedMdiDistribution[id] || 0) + percent;
        }
      }
      if (res.toneDistribution) {
        for (const [id, percent] of Object.entries(res.toneDistribution)) {
          combinedDistribution[id] = (combinedDistribution[id] || 0) + percent;
        }
      }
    };

    processResult(results.r1);
    processResult(results.r2);
    processResult(results.r3);

    let validSteps = [results.r1, results.r2, results.r3].filter(Boolean).length;
    if (validSteps > 0) {
      for (const k in combinedDistribution) combinedDistribution[k] /= validSteps;
      for (const k in combinedMdiDistribution) combinedMdiDistribution[k] /= validSteps;
    }

    let maxScore = 0;
    let dominantMdiId = "";
    for (const [id, score] of Object.entries(combinedMdiDistribution)) {
      if (score > maxScore) { maxScore = score; dominantMdiId = id; }
    }
    if (!dominantMdiId) { dominantMdiId = "1"; combinedMdiDistribution["1"] = 100; combinedDistribution["1"] = 100; }

    const mdiData = frequencyData.find((f) => f.id === parseInt(dominantMdiId));
    const dominantToneName = getToneNameFromMdiId(dominantMdiId);
    const baseToneName = dominantToneName.replace("+", "");
    const toneData = TONES.find((t) => t.name === baseToneName);

    if (toneData && mdiData) {
      let measuredHz = 0;
      let bestConfidence = 0;
      [results.r1, results.r2, results.r3].forEach((res) => {
        if (!res) return;
        const fundCheck = getToneFromFrequency(res.fundamentalFreq);
        if (fundCheck.tone.name === baseToneName) {
          const score = res.toneDistribution?.[mdiData.id.toString()] || 0;
          if (score > bestConfidence) { bestConfidence = score; measuredHz = res.fundamentalFreq; }
        }
      });

      let finalHz = measuredHz > 0 ? measuredHz : toneData.frequency;
      let finalCents = 0;
      let finalDiffHz = 0;
      if (measuredHz > 0) {
        const check = getToneFromFrequency(finalHz);
        if (check.tone.name === dominantToneName) { finalCents = check.cents; finalDiffHz = check.diffHz; }
        else { finalHz = toneData.frequency; }
      }

      setFinalResult({ tone: toneData, fundamentalFreq: finalHz, cents: finalCents, diffHz: finalDiffHz, toneDistribution: combinedDistribution, mdiDistribution: combinedMdiDistribution });

      let maxMdiScore = 0;
      let bestMdiId = "";
      for (const [id, score] of Object.entries(combinedMdiDistribution)) {
        if (score > maxMdiScore) { maxMdiScore = score; bestMdiId = id; }
      }
      const mdi = frequencyData.find((f) => f.id === parseInt(bestMdiId));
      if (mdi) {
        setMdiResult(mdi);
        const syntheticResult: AnalysisResult = {
          fundamentalFreq: finalHz, tone: toneData, cents: finalCents, diffHz: finalDiffHz,
          noteName: dominantToneName, isSpeaking: false, spectrum: new Uint8Array(0), volume: 0,
          toneDistribution: combinedDistribution, mdiDistribution: combinedMdiDistribution,
        };
        saveDailyResult(syntheticResult);
      }
    }

    // Wurzelklang from r4
    if (results.r4?.mdiDistribution) {
      let maxW = 0; let dominantWId = "";
      for (const [id, score] of Object.entries(results.r4.mdiDistribution)) {
        if (score > maxW) { maxW = score; dominantWId = id; }
      }
      if (dominantWId) {
        const wMdi = frequencyData.find((f) => f.id === parseInt(dominantWId));
        if (wMdi) setWurzelklangMdi(wMdi);
      }
    }
  };

  // Loading / access check
  if (!user || checkingPayment) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  const hasPaid = statusData?.hasStimmklangAccess;

  if (statusData && !hasPaid) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center px-4 text-center">
        <h2 className="text-2xl font-bold text-white mb-4">Kein Zugang</h2>
        <p className="text-zinc-400 mb-8">Du benötigst eine aktive Stimmklanganalyse-Buchung um fortzufahren.</p>
        <Button onClick={() => setLocation("/stimmklanganalyse")}>Zur Buchungsseite</Button>
      </div>
    );
  }

  const recordingTitles: Record<string, string> = {
    recording1: "Dein Tagesablauf",
    recording2: "Herzens-Erinnerung",
    recording3: "TON SUMMEN",
    recording4: "VISION",
  };

  const recordingInstructions: Record<string, string> = {
    recording1: "Beginne bitte nun mit ganz normaler Sprechstimme zu erzählen, wie dein bisheriger Tag verlaufen ist. Erinnere dich einfach an die Ereignisse des Tages und erzähle davon. Nimm dir dafür zumindest eine Minute, aber gerne auch länger Zeit dafür.\n\nDRÜCKE DEN STARTBUTTON BEVOR DU BEGINNST ZU ERZÄHLEN.",
    recording2: "Schliesse deine Augen. Wandere mit deiner inneren Aufmerksamkeit in dein Herzzentrum. Atme sanft dreimal in deine Brust und erinnere dich an ein wunderschönes Erlebnis. Es kann aus deiner Kindheit oder auch aus der nahen Vergangenheit stammen. Wichtig ist, dass es eine schöne, angenehme Erinnerung ist, die in dein Bewusstsein tritt.\n\nDRÜCKE BITTE DEN STARTBUTTON\nNun erzähle davon. Wenn du fertig bist öffne deine Augen und drücke den Stoppbutton.",
    recording3: "Atme über die Nase ein und summe zweimal hintereinander einen dir angenehmen Ton mit geschlossenen Lippen. Es klingt wie ein langes MMMMMMMMMMM. Vor Beginn bitte den Startbutton drücken und nach Beendigung des Summens auf Stop drücken.",
    recording4: "Zum Abschluss wanderst du bitte in dein drittes Auge zwischen deinen Augen. Erzähle spontan etwas über deine Visionen im Leben, etwas das du gerne noch erleben oder erreichen möchtest. Sprich gerne rund eine Minute darüber oder auch etwas länger. Drücke vor Beginn den START button und nach Beendigung auf die STOP taste.",
  };

  const isCurrentStepDone =
    (currentStep === "recording1" && results.r1) ||
    (currentStep === "recording2" && results.r2) ||
    (currentStep === "recording3" && results.r3) ||
    (currentStep === "recording4" && results.r4);

  const renderStep = () => {
    switch (currentStep) {
      case "preparation":
        return (
          <div className="max-w-2xl mx-auto py-20 px-4 animate-in slide-in-from-bottom-8 duration-700 pt-16">
            <h2 className="text-3xl font-bold text-white mb-8">Vorbereitung zur Stimmklanganalyse</h2>
            <div className="space-y-4 mb-12">
              {[
                { num: "0", title: "Voraussetzungen", text: "Du solltest die folgende Stimmklanganalyse nur machen, wenn deine Stimme frei ist von Einschränkungen jeglicher Art (Schnupfen, Husten, Heiserkeit, überanstrengte Stimme aus dem Tagesgeschehen). Mache die Analyse deiner Stimme nicht am Morgen, nicht nachdem du gegessen hast (mindestens zwei Stunden sollten vergangen sein) und nicht wenn du von einer – psychisch oder physisch – anstrengenden Tätigkeit kommst." },
                { num: "1", title: "Ruhige Umgebung", text: "Nimm dir 30 min Zeit an einem ruhigen ungestörten Platz deiner Wahl. Du benötigst einen Sitzplatz auf dem du aufrecht Platz nehmen kannst. Weiche Sofas oder ähnliche Sitzmöglichkeiten sind ungeeignet. Es dürfen keine Nebengeräusche im Umfeld vorhanden sein." },
                { num: "2", title: "Wasser bereitstellen", text: "Stelle ein Glas angenehm temperiertes Trinkwasser bereit und nimm einen Schluck jeweils vor dem Einsprechen. Klicke nun bitte weiter zu Analyse starten." },
              ].map(({ num, title, text }) => (
                <Card key={num} className="bg-zinc-900/50 border-zinc-800">
                  <CardContent className="p-6 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center shrink-0 mt-1">
                      <span className="text-orange-500 font-bold">{num}</span>
                    </div>
                    <div>
                      <h3 className="text-white font-medium mb-1">{title}</h3>
                      <p className="text-zinc-400 text-sm">{text}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Button onClick={advanceStep} size="lg" className="w-full h-14 text-lg rounded-full">
                Ich bin bereit – Analyse starten <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button onClick={() => setLocation("/raum36")} variant="ghost" className="text-zinc-500 hover:text-white">
                <ArrowLeft className="mr-2 w-4 h-4" /> Zurück zu RAUM 36
              </Button>
            </div>
          </div>
        );

      case "relaxation":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-16">
            <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8 max-w-2xl leading-tight">Entspannung</h2>
            <div className="mb-8 p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 text-left w-full max-w-md">
              <p className="text-zinc-300 text-lg leading-relaxed">
                Du hörst nun für drei Minuten ein sanftes Wasserplätschern. Sitze auf deinem Platz, schliesse die Augen und atme entspannt durch die Nase ein und aus. Lasse deine Gedanken mit dem Wasser dahinfliessen und versuche ein zartes Lächeln in dein Gesicht zu zaubern. Starte bitte mit der Entspannungsphase.
              </p>
            </div>
            {isRelaxing ? (
              <div className="flex flex-col items-center">
                <div className="text-6xl font-mono text-orange-500 mb-8">
                  {Math.floor(relaxationTimeLeft / 60)}:{(relaxationTimeLeft % 60).toString().padStart(2, "0")}
                </div>
                {/* Wassergeräusch via Web Audio API – kein externes File nötig */}
                <p className="text-zinc-500">Bitte schließe deine Augen und entspanne.</p>
                <Button onClick={() => setIsRelaxing(false)} variant="ghost" className="mt-8 text-zinc-500 hover:text-white">Überspringen</Button>
              </div>
            ) : (
              <div className="flex flex-col items-center animate-in fade-in slide-in-from-bottom-4">
                {relaxationTimeLeft < 180 && (
                  <p className="text-green-500 mb-8 flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5" /> Entspannungsphase abgeschlossen.
                  </p>
                )}
                <Button onClick={() => { setIsRelaxing(true); waterSound.start(); }} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full mb-4">
                  Entspannung starten
                </Button>
                {relaxationTimeLeft < 180 && (
                  <Button onClick={advanceStep} variant="outline" className="border-zinc-700 hover:bg-zinc-800 h-12 px-8">
                    Weiter zur Aufnahme <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                )}
                <Button onClick={goBack} variant="ghost" className="mt-4 text-zinc-500 hover:text-white text-sm">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Zurück zur Vorbereitung
                </Button>
              </div>
            )}
          </div>
        );

      case "pause1":
      case "pause2":
      case "pause3":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-16">
            <div className="w-20 h-20 rounded-full bg-blue-500/20 flex items-center justify-center mb-8">
              <div className="w-10 h-10 rounded-full bg-blue-500/40 animate-pulse" />
            </div>
            <h2 className="text-2xl md:text-4xl font-bold text-center text-white mb-8">Trinkpause</h2>
            <p className="text-zinc-300 text-lg mb-12 text-center max-w-md">Nimm wieder einen Schluck Wasser zu dir.</p>
            <Button onClick={advanceStep} size="lg" className="w-full max-w-xs h-14 text-lg rounded-full">
              Weiter <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button onClick={goBack} variant="ghost" className="mt-2 text-zinc-500 hover:text-white text-sm">
              <ArrowLeft className="mr-2 w-4 h-4" /> Zurück
            </Button>
          </div>
        );

      case "recording1":
      case "recording2":
      case "recording3":
      case "recording4":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] animate-in fade-in pt-16">
            <div className="mb-8 flex gap-2">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={cn("w-3 h-3 rounded-full transition-colors",
                  (currentStep === "recording1" && i === 1) || (currentStep === "recording2" && i <= 2) ||
                  (currentStep === "recording3" && i <= 3) || (currentStep === "recording4" && i <= 4)
                    ? "bg-orange-500" : "bg-zinc-800"
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
                <p className="text-zinc-300 text-lg leading-relaxed mb-4 whitespace-pre-wrap">{recordingInstructions[currentStep]}</p>
                <div className="flex items-center gap-2 text-zinc-500 text-sm">
                  <Mic className="w-4 h-4" />
                  <span>Sprich in normaler Lautstärke. Drücke Stopp, wenn du fertig bist.</span>
                </div>
              </div>
            )}
            <div className="relative">
              {isRecording && <div className="absolute inset-0 rounded-full border-4 border-orange-500/30 animate-ping" />}
              {!isRecording && !isCurrentStepDone && (
                <Button onClick={() => startRecording()} size="lg" className="rounded-full w-48 h-16 text-lg bg-white text-black hover:bg-zinc-200">
                  <Mic className="mr-2 w-5 h-5" /> Start
                </Button>
              )}
              {isRecording && (
                <Button onClick={() => stopRecording()} size="lg" variant="destructive" className="rounded-full w-48 h-16 text-lg animate-pulse">
                  Stopp
                </Button>
              )}
              {!isRecording && isCurrentStepDone && (
                <Button disabled size="lg" className="rounded-full w-48 h-16 text-lg bg-green-500/20 text-green-500 border border-green-500/50 opacity-100">
                  <Check className="mr-2 w-5 h-5" /> Erledigt
                </Button>
              )}
            </div>
            {isRecording && analysisResult && (
              <div className="h-48 w-full max-w-md mx-auto mt-8 bg-black/50 rounded-xl overflow-hidden border border-zinc-800">
                <SpectrumVisualizer spectrum={analysisResult.spectrum} width={400} height={192} isActive={isRecording} />
              </div>
            )}
            {!isRecording && isCurrentStepDone && (
              <div className="mt-8 animate-in fade-in slide-in-from-bottom-4 flex flex-col items-center gap-3">
                <p className="text-green-500 mb-2 flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" /> Aufnahme erfolgreich!
                </p>
                <Button onClick={advanceStep} variant="outline" className="border-zinc-700 hover:bg-zinc-800 h-12 px-8 text-lg">
                  {currentStep === "recording4" ? "Analyse abschließen" : "Nächster Schritt"} <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Button onClick={goBack} variant="ghost" className="text-zinc-500 hover:text-white text-sm">
                  <ArrowLeft className="mr-2 w-4 h-4" /> Zurück (Aufnahme wiederholen)
                </Button>
              </div>
            )}
            {!isRecording && !isCurrentStepDone && currentStep !== "recording1" && (
              <Button onClick={goBack} variant="ghost" className="mt-6 text-zinc-500 hover:text-white text-sm">
                <ArrowLeft className="mr-2 w-4 h-4" /> Zurück
              </Button>
            )}
          </div>
        );

      case "analyzing":
        return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] pt-16">
            <Loader2 className="w-16 h-16 text-orange-500 animate-spin mb-8" />
            <h2 className="text-2xl font-bold text-white mb-2">Berechne dein Profil...</h2>
            <p className="text-zinc-400">Deine Frequenzen werden multidimensional ausgewertet.</p>
          </div>
        );

      case "result": {
        const res = isStudyComplete ? studyResult : finalResult;
        const mdi = isStudyComplete ? studyMdiResult : mdiResult;

        if (!res || !mdi) return (
          <div className="text-white p-8 pt-16 text-center">
            <h2 className="text-2xl font-bold text-red-500 mb-4">Fehler bei der Auswertung.</h2>
            <Button onClick={() => window.location.reload()} variant="outline">Neu starten</Button>
          </div>
        );

        return (
          <div className="max-w-4xl mx-auto py-8 px-4 animate-in fade-in duration-1000 pt-16">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-1 rounded-full bg-zinc-800/50 border border-zinc-700 text-xs font-mono text-zinc-400">
                {isStudyComplete ? "LÄNGSSCHNITT-STUDIE ABGESCHLOSSEN" : "TAGES-MESSUNG"}
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-2 tracking-tighter" style={{ color: mdi.hex }}>
                {mdi.metaphor || "–"}
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

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
                <CardContent className="p-8 flex flex-col items-center justify-center min-h-[400px]">
                  <div className="w-48 h-48 rounded-full flex items-center justify-center mb-8 relative"
                    style={{ backgroundColor: mdi.hex, boxShadow: `0 0 60px ${mdi.hex}40` }}>
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

              <div className="space-y-4">
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

                <div className="grid gap-3">
                  <Button size="lg" className="w-full bg-white text-black hover:bg-zinc-200" onClick={() => setShowInterpretation(true)}>
                    Detaillierte Deutung ansehen <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800 cursor-pointer"
                      onClick={() => setShowWurzelklangVerification(true)}>
                      Wurzelklang prüfen
                    </Button>
                    <Button variant="outline" className="border-zinc-800 hover:bg-zinc-800 cursor-pointer text-xs"
                      onClick={() => setLocation("/raum36")}>
                      <Music2 className="mr-2 h-4 w-4 shrink-0" />
                      YOHNTRAINING in RAUM 36 →
                    </Button>
                  </div>
                  <Button variant="ghost" className="text-zinc-500 hover:text-white border border-dashed border-zinc-800"
                    onClick={() => setShowCertificate(true)}>
                    <Download className="mr-2 h-4 w-4" />
                    Zertifikat als PDF speichern
                  </Button>
                </div>
              </div>
            </div>

            {res?.mdiDistribution && (
              <div className="mb-12">
                <SoundBody
                  toneDistribution={convertMdiDistributionToToneDistribution(res.mdiDistribution)}
                  dominantToneName={getToneNameFromMdiId(mdi.id.toString())}
                  dominantToneId={mdi.id}
                />
              </div>
            )}

            {res?.mdiDistribution && (
              <div className="mb-12">
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

            {!isStudyComplete && (
              <div className="mb-12 bg-zinc-900/30 border border-zinc-800 rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-white">Deine 3-Tage-Messung</h3>
                    <p className="text-sm text-zinc-400">Wir benötigen 3 Messungen für dein valides Profil.</p>
                  </div>
                  <div className="text-2xl font-bold text-orange-500">{daysCompleted} / 3</div>
                </div>
                <Progress value={(daysCompleted / 3) * 100} className="h-2 bg-zinc-800" />
              </div>
            )}

            {showInterpretation && mdi && (
              <InterpretationView mdiResult={mdi} onClose={() => setShowInterpretation(false)} />
            )}

            {showCertificate && mdi && (
              <CertificateView mdiResult={mdi} toneDistribution={res.toneDistribution} onClose={() => setShowCertificate(false)} />
            )}

            {showWurzelklangVerification && mdi && (
              <WurzelklangVerification
                analyzedToneId={mdi.id}
                onVerificationComplete={(isValid) => { setWurzelklangVerified(isValid); setShowWurzelklangVerification(false); }}
                onClose={() => setShowWurzelklangVerification(false)}
              />
            )}

            {showKnowledgePool && (
              <KnowledgePool
                initialTab={knowledgePoolInitialTab}
                initialToneId={knowledgePoolInitialToneId}
                onClose={() => setShowKnowledgePool(false)}
              />
            )}

            <div className="text-center mt-8">
              <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={() => setLocation("/stimmklanganalyse")}>
                <ArrowLeft className="mr-2 w-4 h-4" /> Zurück zur Übersicht
              </Button>
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <div className="border-b border-zinc-900 px-4 py-4 flex items-center gap-4">
        <button onClick={() => setLocation("/stimmklanganalyse")} className="text-zinc-500 hover:text-white transition-colors flex items-center gap-2 text-sm">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">Stimmklanganalyse</span>
        {/* Step indicator */}
        <div className="ml-auto flex items-center gap-1">
          {(["preparation", "relaxation", "recording1", "pause1", "recording2", "pause2", "recording3", "pause3", "recording4", "analyzing", "result"] as WizardStep[]).map((step, i) => (
            <div key={step} className={cn("w-1.5 h-1.5 rounded-full transition-colors",
              currentStep === step ? "bg-orange-500" :
              (["preparation", "relaxation", "recording1", "pause1", "recording2", "pause2", "recording3", "pause3", "recording4", "analyzing", "result"] as WizardStep[]).indexOf(currentStep) > i
                ? "bg-zinc-600" : "bg-zinc-800"
            )} />
          ))}
        </div>
      </div>

      {renderStep()}
    </div>
  );
}
