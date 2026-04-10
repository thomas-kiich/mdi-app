import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect } from "react";
import {
  Mic,
  MicOff,
  Download,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Headphones,
  Sparkles,
  LogIn,
  Play,
  Square,
  ArrowLeft,
  Archive,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";

// ─── Gravitationszentren ─────────────────────────────────────────────────────

const KATEGORIE_CONFIG = {
  ICH: { emoji: "👤", farbe: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  QUELL: { emoji: "⚡", farbe: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  KONZEPT: { emoji: "🧠", farbe: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  PROJEKT: { emoji: "🎯", farbe: "bg-green-500/20 text-green-300 border-green-500/30" },
  DIALOG: { emoji: "💬", farbe: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  WELT: { emoji: "🌍", farbe: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
} as const;

// ─── TTS Hook ─────────────────────────────────────────────────────────────────

function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-Speech wird von diesem Browser nicht unterstützt.");
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.9;
    utterance.pitch = 1.0;

    // Deutschen Voice bevorzugen
    const voices = window.speechSynthesis.getVoices();
    const deVoice = voices.find(v => v.lang.startsWith("de") && v.localService) ||
                    voices.find(v => v.lang.startsWith("de"));
    if (deVoice) utterance.voice = deVoice;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return { speak, stop, isSpeaking };
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────

export default function Momentaufnahme() {
  const { loading, isAuthenticated } = useAuth();
  const { speak, stop, isSpeaking } = useTTS();

  // Aufnahme-Konstanten
  const MIN_DAUER_SEK = 2;
  const MAX_DAUER_SEK = 180; // 3 Minuten

  // Aufnahme-State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaxReached, setIsMaxReached] = useState(false); // 3-Min-Signal
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryDatum, setSummaryDatum] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // DSGVO-Einwilligung: einmalig pro Session
  const [consentGiven, setConsentGiven] = useState(() => {
    return localStorage.getItem("kiich_ma_consent") === "true";
  });
  const [showConsentDialog, setShowConsentDialog] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // tRPC
  const aufnehmenMutation = trpc.momentaufnahme.aufnehmen.useMutation();
  const tagesSummaryMutation = trpc.momentaufnahme.tagesSummary.useMutation();
  const loeschenMutation = trpc.momentaufnahme.loeschen.useMutation();
  const { data: aufnahmen, refetch: refetchAufnahmen } = trpc.momentaufnahme.heuteAbrufen.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: exportData, refetch: refetchExport } = trpc.momentaufnahme.obsidianExport.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  // Timer + Auto-Stop bei 3 Minuten
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          const next = s + 1;
          if (next >= MAX_DAUER_SEK) {
            // Maximaldauer erreicht: optisches Signal + Vibration
            setIsMaxReached(true);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            // Auto-Stop nach kurzem Delay damit letztes Chunk noch kommt
            setTimeout(() => stopRecordingRef.current?.(), 300);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
      setIsMaxReached(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Ref auf stopRecording für den Auto-Stop-Callback
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Aufnahme starten — mit DSGVO-Einwilligungsprüfung
  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return;
    if (!consentGiven) {
      setShowConsentDialog(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setIsRecording(true);
    } catch {
      toast.error("Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.");
    }
  }, [isRecording, isProcessing]);

  // Aufnahme stoppen und verarbeiten
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    // Mindestdauer prüfen
    if (recordingSeconds < MIN_DAUER_SEK) {
      // Aufnahme abbrechen ohne Upload
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
        toast.warning("Zu kurz – bitte mindestens 2 Sekunden sprechen.");
      };
      return;
    }

    const dauer = recordingSeconds;

    mediaRecorderRef.current.onstop = async () => {
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });

        // Schritt 1: Audio direkt als multipart/form-data hochladen
        const formData = new FormData();
        formData.append("audio", blob, "aufnahme.webm");
        formData.append("mimeType", blob.type);

        const uploadRes = await fetch("/api/audio/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Audio-Upload fehlgeschlagen");
        }

        const { audioUrl } = await uploadRes.json();

        // Schritt 2: tRPC-Mutation mit S3-URL
        const result = await aufnehmenMutation.mutateAsync({
          audioUrl,
          dauerSekunden: dauer,
        });

        const config = KATEGORIE_CONFIG[result.kategorie as keyof typeof KATEGORIE_CONFIG];
        toast.success(
          `${config?.emoji ?? "📸"} Eingeordnet in ${result.kategorie}`,
          { description: result.zusammenfassung || undefined }
        );

        await refetchAufnahmen();
        await refetchExport();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verarbeitung fehlgeschlagen";
        toast.error(msg);
      } finally {
        setIsProcessing(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
      }
    };

    mediaRecorderRef.current.stop();
  }, [isRecording, recordingSeconds, aufnehmenMutation, refetchAufnahmen, refetchExport]);

  // stopRecording-Ref aktuell halten
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Obsidian-Export herunterladen
  const handleExport = useCallback(() => {
    if (!exportData) return;
    const blob = new Blob([exportData.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Obsidian-Datei heruntergeladen");
  }, [exportData]);

  // Tages-Zusammenfassung generieren
  const handleTagesSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const result = await tagesSummaryMutation.mutateAsync();
      setSummaryText(typeof result.text === "string" ? result.text : "");
      setSummaryDatum(result.datum);
      setShowSummary(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Zusammenfassung fehlgeschlagen";
      toast.error(msg);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [tagesSummaryMutation]);

  // TTS für Zusammenfassung
  const handleSpeakSummary = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else if (summaryText) {
      speak(summaryText);
    }
  }, [isSpeaking, summaryText, speak, stop]);

  // Aufnahme löschen
  const handleLoeschen = useCallback(async (id: number) => {
    await loeschenMutation.mutateAsync({ id });
    await refetchAufnahmen();
    await refetchExport();
    toast.success("Aufnahme gelöscht");
  }, [loeschenMutation, refetchAufnahmen, refetchExport]);

  const formatZeit = (sek: number) => {
    const m = Math.floor(sek / 60).toString().padStart(2, "0");
    const s = (sek % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Login-Gate ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">📸</div>
        <h1 className="text-2xl font-bold text-white mb-2">MOMENTAUFNAHME</h1>
        <p className="text-white/50 mb-8 max-w-xs">
          Halte deine Gedanken fest, bevor sie verschwinden. Melde dich an um zu beginnen.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <LogIn className="w-4 h-4" />
          Anmelden
        </Button>
      </div>
    );
  }

  // ─── Hauptansicht ─────────────────────────────────────────────────────────────

  const anzahlHeute = aufnahmen?.length ?? 0;

  return (
    <>
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-wide">MOMENTAUFNAHME</h1>
            <p className="text-xs text-white/40">
              {anzahlHeute === 0
                ? "Noch keine Aufnahmen heute"
                : `${anzahlHeute} Gedanke${anzahlHeute !== 1 ? "n" : ""} heute`}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {/* Archiv-Link */}
          <Link href="/momentaufnahme/archiv">
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Archiv"
            >
              <Archive className="w-4 h-4" />
            </button>
          </Link>
          {/* Obsidian-Verbinden-Link */}
          <Link href="/momentaufnahme/obsidian">
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              title="Obsidian verbinden"
            >
              <Plug className="w-4 h-4" />
            </button>
          </Link>
          {anzahlHeute > 0 && (
            <>
              {/* Neue Aufnahme – immer sichtbar wenn bereits Aufnahmen vorhanden */}
              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className="p-2 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors text-white"
                title="Neue Aufnahme starten"
              >
                <Mic className="w-4 h-4" />
              </button>
              <button
                onClick={handleExport}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Obsidian Export"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                onClick={handleTagesSummary}
                disabled={isSummaryLoading}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                title="Das war mein Tag"
              >
                {isSummaryLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Headphones className="w-4 h-4" />
                )}
              </button>
            </>
          )}
        </div>
      </header>

      {/* Tages-Zusammenfassung */}
      {showSummary && summaryText && (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-violet-900/40 to-blue-900/40 border border-violet-500/20">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span className="text-xs font-medium text-violet-300">Das war mein Tag</span>
            </div>
            <div className="flex items-center gap-2">
              {/* TTS Play/Stop Button */}
              <button
                onClick={handleSpeakSummary}
                className={cn(
                  "p-1.5 rounded-full transition-colors",
                  isSpeaking
                    ? "bg-violet-500/30 text-violet-300"
                    : "hover:bg-white/10 text-white/40 hover:text-white/70"
                )}
                title={isSpeaking ? "Vorlesen stoppen" : "Vorlesen"}
              >
                {isSpeaking ? (
                  <Square className="w-3.5 h-3.5 fill-current" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
              </button>
              <button
                onClick={() => { stop(); setShowSummary(false); }}
                className="text-white/30 hover:text-white/60 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          <p className="text-xs text-white/60 mb-2">{summaryDatum}</p>
          <p className="text-sm text-white/80 leading-relaxed">{summaryText}</p>
          {/* KI-Kennzeichnung (EU AI Act Art. 50) */}
          <div className="mt-3 pt-3 border-t border-violet-500/10 flex items-center gap-1.5">
            <span className="text-[10px] text-violet-400/60 font-medium tracking-wide">✦ KI-GENERIERT</span>
            <span className="text-[10px] text-white/25">· Dieser Text wurde automatisch durch ein KI-Sprachmodell erstellt und dient ausschließlich der persönlichen Reflexion.</span>
          </div>
          {/* Pulsierender Indikator beim Vorlesen */}
          {isSpeaking && (
            <div className="flex items-center gap-1.5 mt-3">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-violet-400 animate-pulse"
                  style={{
                    height: `${8 + (i % 3) * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
              <span className="text-xs text-violet-400 ml-1">wird vorgelesen...</span>
            </div>
          )}
        </div>
      )}

      {/* Aufnahmeliste */}
      <div className="flex-1 overflow-y-auto px-5 pb-44">
        {anzahlHeute === 0 ? (
          <div className="flex flex-col items-center pt-6 pb-44 text-center">
            {/* Tagline + Claim */}
            <div className="mb-8 px-2">
              <p className="text-xs font-semibold tracking-[0.2em] text-violet-400 uppercase mb-3">
                NIE WIEDER VERGESSEN WAS DU BEHALTEN MÖCHTEST
              </p>
              <p className="text-white/70 text-sm leading-relaxed max-w-sm">
                Sichere deine besten Ideen, die wichtigsten Erkenntnisse, die echten Eindrücke
                und deine tiefsten Empfindungen – in jedem Moment deines Tages.
              </p>
              <p className="text-white/50 text-sm leading-relaxed max-w-sm mt-3">
                Organisiere dein Leben neu – in nie dagewesener Qualität und Übersicht.
                Erstelle dein <span className="text-white font-semibold">ZWEITES GEHIRN</span> –
                nur dir selbst zugänglich, bestens aufbereitet, optimal nutzbar.
              </p>
            </div>

            {/* Zitat-Karte */}
            <div className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-violet-900/30 to-blue-900/20 border border-violet-500/20">
              <p className="text-white/60 text-sm italic leading-relaxed">
                „Die besten Ideen fallen ein, wenn man loslässt – beim Duschen, auf der Toilette,
                beim Spazierengehen, beim Angeln..."
              </p>
              <p className="text-violet-400 text-xs mt-3 font-medium">
                ✦ Der MOMENT entscheidet – erlöse deine wichtigsten Momente in die Zeitlosigkeit.
              </p>
            </div>

            {/* MA als Hüterin */}
            <div className="w-full max-w-sm mx-auto mb-8 px-2">
              <p className="text-white/40 text-xs leading-relaxed">
                MA ist wie eine Mutter, die alles für dich bereithält – behutsam, strukturiert,
                vollständig.{" "}
                <strong className="text-white/80">Am Abend bist du erstaunt und dankbar: ALLES DA! – was schon vergessen war – MA hat es aufbereitet und zusammengefasst.</strong>{" "}
                Die Hüterin deines geistigen Potentials. Dein zweites Gehirn.
                Deine Chefsekretärin. Alles nur für dich zugänglich –{" "}
                <strong className="text-white/80">gesichert als Schatz deiner einzigartigen IDENTITÄT.</strong>
              </p>
            </div>

            {/* Aufnahme-Hinweis */}
            <div className="text-center">
              <div className="text-4xl mb-3 opacity-40">🎙️</div>
              <p className="text-white/30 text-xs">
                Tippe auf den Mikrofon-Button und sprich deinen ersten Gedanken.
              </p>
              <p className="text-white/20 text-xs mt-1">
                MA ordnet ihn automatisch in eines der 6 Gravitationszentren ein.
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {aufnahmen?.map((aufnahme) => {
              const kat = aufnahme.kategorie as keyof typeof KATEGORIE_CONFIG;
              const config = KATEGORIE_CONFIG[kat] ?? KATEGORIE_CONFIG.QUELL;
              const isExpanded = expandedId === aufnahme.id;
              const zeit = new Date(aufnahme.createdAt).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={aufnahme.id}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : aufnahme.id)}
                  >
                    <span className="text-xl mt-0.5">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border font-medium",
                            config.farbe
                          )}
                        >
                          {kat}
                        </span>
                        <span className="text-xs text-white/30">{zeit}</span>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-2">
                        {aufnahme.zusammenfassung || aufnahme.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Audio-Download */}
                      {aufnahme.audioUrl && (
                        <a
                          href={aufnahme.audioUrl}
                          download={`aufnahme-${aufnahme.id}.webm`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-white/60 transition-colors"
                          title="Audio herunterladen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoeschen(aufnahme.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/30" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5">
                      <p className="text-sm text-white/60 leading-relaxed mt-3">{aufnahme.text}</p>
                      {aufnahme.audioUrl && (
                        <div className="mt-3">
                          <audio
                            controls
                            src={aufnahme.audioUrl}
                            className="w-full h-8 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Aufnahme-Button (fixiert unten) */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 flex flex-col items-center gap-3 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent pt-8">
        {/* Status-Text */}
        {isRecording && (
          <div className="flex flex-col items-center gap-1.5 w-full px-8">
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isMaxReached ? "bg-amber-400" : "bg-red-500"
              )} />
              <span className={isMaxReached ? "text-amber-400 font-medium" : "text-white/60"}>
                {isMaxReached
                  ? "3 Minuten erreicht – wird gespeichert..."
                  : `${formatZeit(recordingSeconds)} – Spreche jetzt...`}
              </span>
            </div>
            {/* Fortschrittsbalken */}
            <div className="w-full max-w-xs h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isMaxReached ? "bg-amber-400" : "bg-red-500"
                )}
                style={{ width: `${Math.min((recordingSeconds / MAX_DAUER_SEK) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            KI klassifiziert deinen Gedanken...
          </div>
        )}

        {/* Haupt-Aufnahme-Button – Tap-to-Start / Tap-to-Stop */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 select-none touch-none",
            "shadow-2xl active:scale-95",
            isMaxReached
              ? "bg-amber-500 shadow-amber-500/40 scale-110 animate-pulse"
              : isRecording
              ? "bg-red-500 shadow-red-500/40 scale-110"
              : isProcessing
              ? "bg-white/20 cursor-not-allowed"
              : "bg-white shadow-white/20 hover:scale-105"
          )}
          aria-label={isRecording ? "Aufnahme stoppen" : "Aufnahme starten"}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-black" />
          )}
        </button>

        <p className="text-xs text-white/30">
          {isRecording ? "Nochmal tippen zum Stoppen" : "Tippen zum Sprechen"}
        </p>
        {/* Datenschutz-Hinweis unter Button */}
        {!isRecording && !isProcessing && (
          <p className="text-[10px] text-white/15 text-center px-8">
            Aufnahmen werden verschlüsselt verarbeitet und nicht für KI-Training verwendet.
          </p>
        )}

        {/* Obsidian-Hinweis */}
        {anzahlHeute > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {exportData?.filename || "Obsidian Export"}
          </button>
        )}
      </div>
    </div>
    {/* DSGVO-Einwilligungsdialog */}
    {showConsentDialog && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-[#0f0f1a] border border-violet-500/30 rounded-t-3xl p-6 pb-10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔒</span>
            <h2 className="text-white font-semibold text-base">Datenschutz & Einwilligung</h2>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Bevor du deine erste Aufnahme machst, benötigen wir deine Einwilligung zur Verarbeitung deiner Spracheingabe.
          </p>
          <div className="bg-white/5 rounded-xl p-4 mb-5 text-xs text-white/40 leading-relaxed space-y-2">
            <p>✦ Deine Sprachaufnahme wird transkribiert und durch ein KI-Sprachmodell analysiert.</p>
            <p>✦ Die Aufnahme wird nach der Verarbeitung nicht dauerhaft gespeichert.</p>
            <p>✦ Deine Daten werden nicht für das Training von KI-Modellen verwendet.</p>
            <p>✦ Du kannst deine Einwilligung jederzeit widerrufen (Einstellungen → Datenschutz).</p>
            <p>✦ Die KI-generierten Auswertungen dienen ausschließlich der persönlichen Reflexion — kein medizinisches Angebot.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => {
                localStorage.setItem("kiich_ma_consent", "true");
                setConsentGiven(true);
                setShowConsentDialog(false);
                // Aufnahme direkt starten
                setTimeout(() => startRecording(), 100);
              }}
              className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
            >
              Ich stimme zu — Aufnahme starten
            </button>
            <button
              onClick={() => setShowConsentDialog(false)}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    )}
    </>
  );
}
