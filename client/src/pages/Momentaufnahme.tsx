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

  // Aufnahme-State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryDatum, setSummaryDatum] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

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

  // Timer
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Aufnahme starten
  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return;
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
          {anzahlHeute > 0 && (
            <>
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
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4 opacity-30">🎙️</div>
            <p className="text-white/30 text-sm max-w-xs">
              Drücke den Aufnahme-Knopf und sprich deinen ersten Gedanken des Tages.
            </p>
            <p className="text-white/20 text-xs mt-3 max-w-xs">
              Deine Gedanken werden automatisch in die 6 Gravitationszentren eingeordnet.
            </p>
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
          <div className="flex items-center gap-2 text-sm text-white/60">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            {formatZeit(recordingSeconds)} – Spreche jetzt...
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
            isRecording
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
  );
}
