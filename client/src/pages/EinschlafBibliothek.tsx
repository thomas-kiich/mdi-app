import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState, useRef, useCallback } from "react";
import { Link } from "wouter";
import {
  ArrowLeft,
  BookOpen,
  Sparkles,
  Star,
  Trash2,
  Play,
  Pause,
  Loader2,
  ChevronRight,
  LogIn,
  Heart,
  Sword,
  Moon,
  RefreshCw,
  Scissors,
  X,
  Mic,
  MicOff,
  Menu,
  Home,
  Camera,
  Archive,
  Crown,
} from "lucide-react";

// ─── Typen ────────────────────────────────────────────────────────────────────

type Kategorie = "MAERCHEN" | "ABENTEUER" | "BEFINDLICHKEIT";
type Zielgruppe = "KIND" | "JUGENDLICHER" | "ERWACHSENER";

type Geschichte = {
  id: number;
  kategorie: Kategorie;
  zielgruppe: Zielgruppe;
  thema: string;
  personalisierung: string | null;
  titel: string;
  text: string;
  audioUrl: string | null;
  favorit: boolean;
  createdAt: Date;
};

// ─── Konstanten ───────────────────────────────────────────────────────────────

const KATEGORIE_INFO: Record<Kategorie, { label: string; icon: React.ReactNode; farbe: string; beschreibung: string }> = {
  MAERCHEN: {
    label: "Märchen",
    icon: <Moon className="w-5 h-5" />,
    farbe: "from-indigo-600 to-violet-700",
    beschreibung: "Personalisierte Gutenacht-Märchen für Kinder & Jugendliche",
  },
  ABENTEUER: {
    label: "Abenteuer",
    icon: <Sword className="w-5 h-5" />,
    farbe: "from-amber-600 to-orange-700",
    beschreibung: "Heldenreisen für Erwachsene — deine Herausforderung als Abenteuer",
  },
  BEFINDLICHKEIT: {
    label: "Befindlichkeit",
    icon: <Heart className="w-5 h-5" />,
    farbe: "from-rose-600 to-pink-700",
    beschreibung: "Sanfte Metaphern für schwierige Gefühle & Situationen",
  },
};

const BEFINDLICHKEITS_THEMEN = [
  "Angst vor der Zukunft",
  "Beziehungssorgen",
  "Erschöpfung & Burnout",
  "Trauer & Verlust",
  "Prüfungsangst",
  "Einsamkeit",
  "Selbstzweifel",
  "Beruflicher Druck",
  "Familienkonflikte",
  "Körperliche Beschwerden",
  "Ungewissheit & Kontrollverlust",
  "Scham & Schuld",
];

const MAERCHEN_THEMEN = [
  "Mut finden",
  "Freundschaft & Vertrauen",
  "Angst überwinden",
  "Anderssein als Stärke",
  "Verlust & Trost",
  "Neugier & Entdecken",
  "Streit & Versöhnung",
  "Einschlafen & Träumen",
];

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function EinschlafBibliothek() {
  const { user, loading, isAuthenticated } = useAuth();

  // UI-State
  const [ansicht, setAnsicht] = useState<"start" | "neu" | "lesen">("start");
  const [gewaehlteKategorie, setGewaehlteKategorie] = useState<Kategorie | null>(null);
  const [gewaehlteZielgruppe, setGewaehlteZielgruppe] = useState<Zielgruppe>("ERWACHSENER");
  const [gewaehlteThema, setGewaehlteThema] = useState("");
  const [personalisierung, setPersonalisierung] = useState("");
  const [aktiveGeschichte, setAktiveGeschichte] = useState<Geschichte | null>(null);
  const [filterKategorie, setFilterKategorie] = useState<Kategorie | null>(null);
  const [showNavMenu, setShowNavMenu] = useState(false);

  // Audio-State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musikRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLaedt, setAudioLaedt] = useState(false);

  // Bearbeitungs-State
  const [neuSchreibenLaedt, setNeuSchreibenLaedt] = useState(false);
  const [korrekturDialogOffen, setKorrekturDialogOffen] = useState(false);
  const [korrekturAbschnitt, setKorrekturAbschnitt] = useState("");
  const [korrekturHinweis, setKorrekturHinweis] = useState("");
  const [korrekturLaedt, setKorrekturLaedt] = useState(false);

  // Spracheingabe-State
  const [sprichtGerade, setSprichtGerade] = useState(false);
  const erkennungRef = useRef<any>(null);

  const handleSprachEingabe = useCallback(() => {
    const SpeechRecognitionAPI =
      (window as any).SpeechRecognition ||
      (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionAPI) {
      toast.error("Spracheingabe wird von diesem Browser nicht unterstützt. Bitte Chrome oder Safari verwenden.");
      return;
    }

    if (sprichtGerade && erkennungRef.current) {
      erkennungRef.current.stop();
      return;
    }

    const erkennung: any = new SpeechRecognitionAPI();
    erkennung.lang = "de-DE";
    erkennung.continuous = true;
    erkennung.interimResults = false;
    erkennungRef.current = erkennung;

    erkennung.onstart = () => setSprichtGerade(true);
    erkennung.onend = () => setSprichtGerade(false);
    erkennung.onerror = (e: any) => {
      setSprichtGerade(false);
      if (e.error !== "no-speech" && e.error !== "aborted") {
        toast.error("Spracheingabe-Fehler: " + e.error);
      }
    };
    erkennung.onresult = (e: any) => {
      const transkript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join(" ");
      setPersonalisierung((prev) =>
        prev ? prev.trim() + " " + transkript : transkript
      );
    };

    erkennung.start();
  }, [sprichtGerade]);

  // Schlaf-Musik URL (dieselbe wie im Schlaf-Modus)
  const SCHLAF_MUSIK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/schlafmusik_ma_5b2eb01f.mp3";

  // Musik: new Audio() direkt erstellen (zuverlässiger als DOM-Ref für Browser-Autoplay)
  const startMusik = useCallback(() => {
    // Altes Element stoppen falls vorhanden
    if (musikRef.current) {
      musikRef.current.pause();
    }
    const el = new Audio(SCHLAF_MUSIK_URL);
    el.loop = true;
    el.volume = 0;
    musikRef.current = el;
    el.play().then(() => {
      // Fade-in auf 0.02 in 4 Sekunden (sehr minimal, Klangteppich)
      let step = 0;
      const steps = 40;
      const timer = setInterval(() => {
        step++;
        el.volume = Math.min(0.02, 0.02 * (step / steps));
        if (step >= steps) clearInterval(timer);
      }, 4000 / steps);
    }).catch(err => console.warn("[Musik] Autoplay blockiert:", err));
  }, [SCHLAF_MUSIK_URL]);

  // Musik sanft ausblenden
  const stopMusik = useCallback((durationMs = 5000) => {
    const el = musikRef.current;
    if (!el) return;
    const startVol = el.volume;
    const steps = 40;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      el.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(timer);
        el.pause();
        musikRef.current = null;
      }
    }, durationMs / steps);
  }, []);

  // tRPC
  const { data: geschichten, refetch } = trpc.einschlafBibliothek.liste.useQuery(
    filterKategorie ? { kategorie: filterKategorie } : undefined,
    { enabled: isAuthenticated }
  );

  const generierenMutation = trpc.einschlafBibliothek.generieren.useMutation({
    onSuccess: (neu) => {
      refetch();
      setAktiveGeschichte(neu as Geschichte);
      setAnsicht("lesen");
      toast.success("Geschichte generiert!");
    },
    onError: (err) => toast.error(err.message),
  });

  const audioGenerierenMutation = trpc.einschlafBibliothek.audioGenerieren.useMutation({
    onError: (err) => toast.error("Audio-Generierung fehlgeschlagen: " + err.message),
  });

  const favoritMutation = trpc.einschlafBibliothek.favoritToggle.useMutation({
    onMutate: ({ id }) => {
      // Optimistisches Update: Stern sofort umschalten
      if (aktiveGeschichte?.id === id) {
        setAktiveGeschichte(prev => prev ? { ...prev, favorit: !prev.favorit } : prev);
      }
    },
    onSuccess: () => refetch(),
    onError: () => {
      // Rollback: Stern zurücksetzen
      if (aktiveGeschichte) {
        setAktiveGeschichte(prev => prev ? { ...prev, favorit: !prev.favorit } : prev);
      }
    },
  });

  const loeschenMutation = trpc.einschlafBibliothek.loeschen.useMutation({
    onSuccess: () => {
      refetch();
      if (ansicht === "lesen") setAnsicht("start");
      toast.success("Geschichte gelöscht");
    },
  });

  const neuSchreibenMutation = trpc.einschlafBibliothek.neuSchreiben.useMutation({
    onError: (err) => toast.error("Neu-Schreiben fehlgeschlagen: " + err.message),
  });

  const stelleKorrigierenMutation = trpc.einschlafBibliothek.stelleKorrigieren.useMutation({
    onError: (err) => toast.error("Korrektur fehlgeschlagen: " + err.message),
  });

  const handleNeuSchreiben = useCallback(async () => {
    if (!aktiveGeschichte) return;
    setNeuSchreibenLaedt(true);
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    try {
      const result = await neuSchreibenMutation.mutateAsync({ id: aktiveGeschichte.id });
      setAktiveGeschichte(prev => prev ? { ...prev, titel: result.titel, text: result.text, audioUrl: null } : prev);
      refetch();
      toast.success("Geschichte neu geschrieben!");
    } finally {
      setNeuSchreibenLaedt(false);
    }
  }, [aktiveGeschichte, neuSchreibenMutation, refetch]);

  const handleKorrekturAbsenden = useCallback(async () => {
    if (!aktiveGeschichte || !korrekturAbschnitt.trim() || !korrekturHinweis.trim()) return;
    setKorrekturLaedt(true);
    if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
    try {
      const result = await stelleKorrigierenMutation.mutateAsync({
        id: aktiveGeschichte.id,
        abschnitt: korrekturAbschnitt,
        hinweis: korrekturHinweis,
      });
      setAktiveGeschichte(prev => prev ? { ...prev, text: result.neuerText, audioUrl: null } : prev);
      refetch();
      setKorrekturDialogOffen(false);
      setKorrekturAbschnitt("");
      setKorrekturHinweis("");
      toast.success("Stelle umformuliert!");
    } finally {
      setKorrekturLaedt(false);
    }
  }, [aktiveGeschichte, korrekturAbschnitt, korrekturHinweis, stelleKorrigierenMutation, refetch]);

  // Web Audio Context für Raumhall
  const audioCtxRef = useRef<AudioContext | null>(null);

  // Synthetischer Reverb: Impulsantwort aus weissem Rauschen
  const createReverbBuffer = (ctx: AudioContext, durationSec: number, decay: number): AudioBuffer => {
    const rate = ctx.sampleRate;
    const length = rate * durationSec;
    const buffer = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  };

  // Spielt Audio-URL mit Raumhall ab
  const playWithReverb = useCallback((url: string, onEnded: () => void) => {
    if (!audioCtxRef.current || audioCtxRef.current.state === "closed") {
      audioCtxRef.current = new AudioContext();
    }
    const ctx = audioCtxRef.current;

    const el = new Audio(url);
    el.crossOrigin = "anonymous";
    // Sprechtempo: 0.85 = 15% langsamer, preservesPitch verhindert Tonhöhenänderung
    el.playbackRate = 0.85;
    el.preservesPitch = true;
    audioRef.current = el;

    const source = ctx.createMediaElementSource(el);

    // Reverb
    const convolver = ctx.createConvolver();
    convolver.buffer = createReverbBuffer(ctx, 2.5, 3.0);

    // Dry/Wet Mix: 90% trocken, 10% Hall
    const dryGain = ctx.createGain();
    dryGain.gain.value = 0.90;
    const wetGain = ctx.createGain();
    wetGain.gain.value = 0.10;

    source.connect(dryGain);
    source.connect(convolver);
    convolver.connect(wetGain);
    dryGain.connect(ctx.destination);
    wetGain.connect(ctx.destination);

    el.onended = onEnded;
    el.play().catch(e => console.warn("[Audio+Reverb] Play blockiert:", e));
  }, []);

  // Audio abspielen / pausieren
  const handleAudio = useCallback(async (geschichte: Geschichte) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopMusik(2000);
      return;
    }

    // WICHTIG: Musik SOFORT beim Klick starten (Browser-Autoplay-Policy)
    startMusik();

    const onEnded = () => {
      setIsPlaying(false);
      stopMusik(5000);
    };

    if (geschichte.audioUrl) {
      playWithReverb(geschichte.audioUrl, onEnded);
      setIsPlaying(true);
    } else {
      // Audio generieren — Musik läuft bereits
      setAudioLaedt(true);
      try {
        const result = await audioGenerierenMutation.mutateAsync({ id: geschichte.id });
        if (result.audioUrl) {
          playWithReverb(result.audioUrl, onEnded);
          setIsPlaying(true);
          setAktiveGeschichte(prev => prev ? { ...prev, audioUrl: result.audioUrl } : prev);
          refetch();
        }
      } finally {
        setAudioLaedt(false);
      }
    }
  }, [isPlaying, audioGenerierenMutation, refetch, startMusik, stopMusik, playWithReverb]);

  const handleGenerieren = useCallback(() => {
    if (!gewaehlteKategorie || !gewaehlteThema.trim()) {
      toast.error("Bitte Kategorie und Thema wählen");
      return;
    }
    generierenMutation.mutate({
      kategorie: gewaehlteKategorie,
      zielgruppe: gewaehlteZielgruppe,
      thema: gewaehlteThema,
      personalisierung: personalisierung.trim() || undefined,
    });
  }, [gewaehlteKategorie, gewaehlteZielgruppe, gewaehlteThema, personalisierung, generierenMutation]);

  // ─── Login-Gate ─────────────────────────────────────────────────────────────

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
        <div className="text-6xl mb-6">🌙</div>
        <h1 className="text-2xl font-bold text-white mb-2">EINSCHLAF-BIBLIOTHEK</h1>
        <p className="text-white/50 mb-8 max-w-xs">
          Märchen, Abenteuer und Metaphern — personalisiert für deine Nacht.
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

  // ─── Geschichte lesen ────────────────────────────────────────────────────────

  if (ansicht === "lesen" && aktiveGeschichte) {
    const info = KATEGORIE_INFO[aktiveGeschichte.kategorie];
    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
        {/* Musik wird per new Audio() im handleAudio gestartet (Browser-Autoplay-Policy) */}
        {/* Header */}
        <header className="px-5 pt-6 pb-4 flex items-center justify-between">
          <button
            onClick={() => {
              if (audioRef.current) { audioRef.current.pause(); setIsPlaying(false); }
              setAnsicht("start");
            }}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => favoritMutation.mutate({ id: aktiveGeschichte.id })}
              className={`p-2 rounded-full transition-colors ${aktiveGeschichte.favorit ? "text-amber-400" : "text-white/30 hover:text-white/60"}`}
            >
              <Star className="w-4 h-4" fill={aktiveGeschichte.favorit ? "currentColor" : "none"} />
            </button>
            <button
              onClick={() => loeschenMutation.mutate({ id: aktiveGeschichte.id })}
              className="p-2 rounded-full text-white/20 hover:text-red-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Kategorie-Badge */}
        <div className="px-5 mb-4">
          <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${info.farbe} text-white`}>
            {info.icon}
            {info.label}
          </span>
        </div>

        {/* Titel */}
        <div className="px-5 mb-6">
          <h1 className="text-2xl font-bold text-white leading-tight mb-1">{aktiveGeschichte.titel}</h1>
          <p className="text-xs text-white/30">{aktiveGeschichte.thema}</p>
        </div>

        {/* Audio-Button */}
        <div className="px-5 mb-6">
          <button
            onClick={() => handleAudio(aktiveGeschichte)}
            disabled={audioLaedt}
            className={`flex items-center gap-3 px-5 py-3 rounded-2xl transition-all ${
              isPlaying
                ? "bg-white/10 border border-white/20 text-white"
                : "bg-gradient-to-r " + info.farbe + " text-white shadow-lg"
            }`}
          >
            {audioLaedt ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {audioLaedt
                ? "Stimme wird generiert..."
                : isPlaying
                ? "Pause"
                : aktiveGeschichte.audioUrl
                ? "Vorlesen"
                : "Mit MA-Stimme vorlesen"}
            </span>
          </button>
          {!aktiveGeschichte.audioUrl && !audioLaedt && (
            <p className="text-xs text-white/25 mt-2 ml-1">Beim ersten Abspielen wird die Stimme generiert (20–30 Sek.)</p>
          )}
          {audioLaedt && (
            <p className="text-xs text-white/30 mt-2 ml-1 animate-pulse">MA's Stimme wird vorbereitet — bitte warte einen Moment…</p>
          )}
          {/* Audio neu erstellen (für Tempo-Updates) */}
          {aktiveGeschichte.audioUrl && !isPlaying && !audioLaedt && (
            <button
              onClick={async () => {
                if (audioRef.current) { audioRef.current.pause(); }
                setAktiveGeschichte(prev => prev ? { ...prev, audioUrl: null } : prev);
                setAudioLaedt(true);
                try {
                  const result = await audioGenerierenMutation.mutateAsync({ id: aktiveGeschichte.id, force: true });
                  if (result.audioUrl) {
                    setAktiveGeschichte(prev => prev ? { ...prev, audioUrl: result.audioUrl } : prev);
                    refetch();
                  }
                } finally {
                  setAudioLaedt(false);
                }
              }}
              className="mt-2 ml-1 text-xs text-white/20 hover:text-white/50 transition-colors flex items-center gap-1"
            >
              ↺ Stimme neu generieren
            </button>
          )}
        </div>

        {/* Text */}
        <div className="px-5 pb-4 flex-1">
          <div className="prose prose-invert prose-sm max-w-none">
            {aktiveGeschichte.text.split("\n\n").map((absatz, i) => (
              <p key={i} className="text-white/80 leading-relaxed mb-4 text-[15px]">{absatz}</p>
            ))}
          </div>
        </div>

        {/* Bearbeitungs-Buttons */}
        <div className="px-5 pb-10 flex gap-3 flex-wrap">
          <button
            onClick={handleNeuSchreiben}
            disabled={neuSchreibenLaedt || korrekturLaedt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-40"
          >
            {neuSchreibenLaedt ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {neuSchreibenLaedt ? "Wird neu geschrieben…" : "Geschichte neu schreiben"}
          </button>
          <button
            onClick={() => setKorrekturDialogOffen(true)}
            disabled={neuSchreibenLaedt || korrekturLaedt}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all disabled:opacity-40"
          >
            <Scissors className="w-4 h-4" />
            Stelle korrigieren
          </button>
        </div>

        {/* Korrektur-Dialog */}
        {korrekturDialogOffen && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end justify-center p-4">
            <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-lg p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-semibold">Stelle korrigieren</h3>
                <button onClick={() => { setKorrekturDialogOffen(false); setKorrekturAbschnitt(""); setKorrekturHinweis(""); }} className="text-white/30 hover:text-white/70">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Abschnitt einfügen (kopiere den Textabschnitt der geändert werden soll)</label>
                  <textarea
                    value={korrekturAbschnitt}
                    onChange={e => setKorrekturAbschnitt(e.target.value)}
                    placeholder="Hier den Abschnitt einfügen…"
                    rows={4}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="text-xs text-white/40 mb-1.5 block">Was soll geändert werden?</label>
                  <textarea
                    value={korrekturHinweis}
                    onChange={e => setKorrekturHinweis(e.target.value)}
                    placeholder="z.B. klingt zu rational, mehr Bilder aus der Natur"
                    rows={2}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white/80 placeholder:text-white/20 resize-none focus:outline-none focus:border-white/30"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => { setKorrekturDialogOffen(false); setKorrekturAbschnitt(""); setKorrekturHinweis(""); }}
                  className="flex-1 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 border border-white/10 hover:bg-white/5 transition-all"
                >
                  Abbrechen
                </button>
                <button
                  onClick={handleKorrekturAbsenden}
                  disabled={korrekturLaedt || !korrekturAbschnitt.trim() || !korrekturHinweis.trim()}
                  className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-white/10 hover:bg-white/20 text-white transition-all disabled:opacity-40 flex items-center justify-center gap-2"
                >
                  {korrekturLaedt ? <><Loader2 className="w-4 h-4 animate-spin" /> Wird umformuliert…</> : "Stelle umformulieren"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ─── Neue Geschichte erstellen ────────────────────────────────────────────────

  if (ansicht === "neu") {
    const themenListe = gewaehlteKategorie === "MAERCHEN"
      ? MAERCHEN_THEMEN
      : gewaehlteKategorie === "BEFINDLICHKEIT"
      ? BEFINDLICHKEITS_THEMEN
      : null; // ABENTEUER: freies Thema

    return (
      <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
        <header className="px-5 pt-6 pb-4 flex items-center gap-3">
          <button
            onClick={() => setAnsicht("start")}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-wide">NEUE GESCHICHTE</h1>
            <p className="text-xs text-white/40">Von MA für dich generiert</p>
          </div>
        </header>

        <div className="px-5 pb-12 flex-1 overflow-y-auto space-y-6">
          {/* Schritt 1: Kategorie */}
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3">Kategorie</p>
            <div className="grid grid-cols-1 gap-2">
              {(Object.keys(KATEGORIE_INFO) as Kategorie[]).map((kat) => {
                const info = KATEGORIE_INFO[kat];
                const aktiv = gewaehlteKategorie === kat;
                return (
                  <button
                    key={kat}
                    onClick={() => { setGewaehlteKategorie(kat); setGewaehlteThema(""); }}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all text-left ${
                      aktiv
                        ? "border-white/30 bg-white/10"
                        : "border-white/5 bg-white/3 hover:bg-white/6"
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.farbe} flex items-center justify-center flex-shrink-0`}>
                      {info.icon}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-white">{info.label}</p>
                      <p className="text-xs text-white/40 mt-0.5">{info.beschreibung}</p>
                    </div>
                    {aktiv && <ChevronRight className="w-4 h-4 text-white/40 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Schritt 2: Zielgruppe (nur für Märchen) */}
          {gewaehlteKategorie === "MAERCHEN" && (
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3">Für wen?</p>
              <div className="flex gap-2">
                {(["KIND", "JUGENDLICHER"] as Zielgruppe[]).map((zg) => (
                  <button
                    key={zg}
                    onClick={() => setGewaehlteZielgruppe(zg)}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      gewaehlteZielgruppe === zg
                        ? "bg-indigo-600 text-white"
                        : "bg-white/5 text-white/50 hover:bg-white/10"
                    }`}
                  >
                    {zg === "KIND" ? "Kind (5–10 J.)" : "Jugendliche/r (11–17 J.)"}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Schritt 3: Thema */}
          {gewaehlteKategorie && (
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-3">Thema</p>
              {themenListe ? (
                <div className="flex flex-wrap gap-2">
                  {themenListe.map((thema) => (
                    <button
                      key={thema}
                      onClick={() => setGewaehlteThema(thema)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                        gewaehlteThema === thema
                          ? "bg-white text-black"
                          : "bg-white/8 text-white/60 hover:bg-white/15"
                      }`}
                    >
                      {thema}
                    </button>
                  ))}
                </div>
              ) : (
                // Abenteuer: freies Thema
                <input
                  type="text"
                  value={gewaehlteThema}
                  onChange={e => setGewaehlteThema(e.target.value)}
                  placeholder="z.B. Neuer Job, Beziehung beenden, Selbständigkeit wagen ..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30"
                />
              )}
            </div>
          )}

          {/* Schritt 4: Personalisierung (optional) */}
          {gewaehlteKategorie && gewaehlteThema && (
            <div>
              <p className="text-xs font-semibold tracking-[0.15em] text-white/40 uppercase mb-1">
                Persönliche Details <span className="text-white/20 font-normal normal-case tracking-normal">(optional)</span>
              </p>
              <p className="text-xs text-white/30 mb-3">
                {gewaehlteKategorie === "MAERCHEN"
                  ? "Besonderer Wunsch, Name einer Figur, Lieblingstier ..."
                  : gewaehlteKategorie === "ABENTEUER"
                  ? "Beschreibe deine konkrete Herausforderung — der Held erlebt sie als Abenteuer"
                  : "Deine persönliche Situation — für eine maßgeschneiderte Metapher"}
              </p>
              <div className="relative">
                <textarea
                  value={personalisierung}
                  onChange={e => setPersonalisierung(e.target.value)}
                  placeholder="..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 resize-none"
                />
                <button
                  type="button"
                  onClick={handleSprachEingabe}
                  title={sprichtGerade ? "Aufnahme stoppen" : "Einsprechen"}
                  className={`absolute right-3 bottom-3 p-1.5 rounded-full transition-all ${
                    sprichtGerade
                      ? "bg-red-500/20 text-red-400 animate-pulse"
                      : "text-white/30 hover:text-white/70 hover:bg-white/10"
                  }`}
                >
                  {sprichtGerade ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                </button>
              </div>
              {sprichtGerade && (
                <p className="text-xs text-red-400/70 mt-1.5 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                  Hört zu — tippe auf das Mikrofon zum Stoppen
                </p>
              )}
            </div>
          )}

          {/* Generieren-Button */}
          {gewaehlteKategorie && gewaehlteThema && (
            <button
              onClick={handleGenerieren}
              disabled={generierenMutation.isPending}
              className={`w-full py-4 rounded-2xl font-semibold text-white transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${
                KATEGORIE_INFO[gewaehlteKategorie].farbe
              } disabled:opacity-50 shadow-lg`}
            >
              {generierenMutation.isPending ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  MA schreibt ...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Geschichte generieren
                </>
              )}
            </button>
          )}
        </div>
      </div>
    );
  }

  // ─── Startseite / Bibliothek ─────────────────────────────────────────────────

  const favoriten = (geschichten as Geschichte[] | undefined)?.filter(g => g.favorit) ?? [];
  const alleGeschichten = (geschichten as Geschichte[] | undefined) ?? [];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <button
            onClick={() => window.history.back()}
            className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-lg font-bold tracking-wide">EINSCHLAF-BIBLIOTHEK</h1>
            <p className="text-xs text-white/40">
              {alleGeschichten.length === 0
                ? "Noch keine Geschichten"
                : `${alleGeschichten.length} Geschichte${alleGeschichten.length !== 1 ? "n" : ""}`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => { setGewaehlteKategorie(filterKategorie); setGewaehlteThema(""); setPersonalisierung(""); setAnsicht("neu"); }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-semibold text-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Neue Geschichte</span>
            <span className="sm:hidden">Neu</span>
          </button>
          {/* Hamburger-Menü */}
          <div className="relative">
            <button
              onClick={() => setShowNavMenu(v => !v)}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white/80"
              aria-label="Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
            {showNavMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowNavMenu(false)} />
                <div className="absolute right-0 top-full mt-2 w-56 bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden">
                  <div className="px-3 py-2 border-b border-white/5">
                    <p className="text-xs text-white/30 font-medium tracking-widest uppercase">Navigation</p>
                  </div>
                  <div className="py-1">
                    <Link href="/">
                      <button
                        onClick={() => setShowNavMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <Home className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80">KIICH Startseite</span>
                      </button>
                    </Link>
                    <Link href="/momentaufnahme">
                      <button
                        onClick={() => setShowNavMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <Camera className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80">Momentaufnahme</span>
                      </button>
                    </Link>
                    <Link href="/momentaufnahme/archiv">
                      <button
                        onClick={() => setShowNavMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <Archive className="w-4 h-4 text-white/40" />
                        <span className="text-sm text-white/80">Alle Aufnahmen</span>
                      </button>
                    </Link>
                    <Link href="/abo">
                      <button
                        onClick={() => setShowNavMenu(false)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-white/5 transition-colors text-left"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span className="text-sm text-amber-400 font-medium">Premium</span>
                      </button>
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Kategorie-Filter */}
      <div className="px-5 mb-4 flex gap-2 overflow-x-auto pb-1">
        <button
          onClick={() => setFilterKategorie(null)}
          className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
            !filterKategorie ? "bg-white text-black" : "bg-white/8 text-white/50 hover:bg-white/15"
          }`}
        >
          Alle
        </button>
        {(Object.keys(KATEGORIE_INFO) as Kategorie[]).map(kat => (
          <button
            key={kat}
            onClick={() => setFilterKategorie(kat)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
              filterKategorie === kat ? "bg-white text-black" : "bg-white/8 text-white/50 hover:bg-white/15"
            }`}
          >
            {KATEGORIE_INFO[kat].icon}
            {KATEGORIE_INFO[kat].label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-12">
        {/* Leer-Zustand */}
        {alleGeschichten.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="text-5xl mb-4">🌙</div>
            <p className="text-white/40 text-sm mb-6 max-w-xs">
              Deine Bibliothek ist noch leer. Lass MA eine Geschichte für dich schreiben.
            </p>
            <button
              onClick={() => setAnsicht("neu")}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Erste Geschichte erstellen
            </button>
          </div>
        )}

        {/* Favoriten */}
        {favoriten.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold tracking-[0.15em] text-amber-400/70 uppercase mb-3 flex items-center gap-1.5">
              <Star className="w-3 h-3" fill="currentColor" />
              Favoriten
            </p>
            <div className="space-y-2">
              {favoriten.map(g => <GeschichteKarte key={g.id} geschichte={g} onOeffnen={() => { setAktiveGeschichte(g); setAnsicht("lesen"); }} />)}
            </div>
          </div>
        )}

        {/* Alle Geschichten */}
        {alleGeschichten.length > 0 && (
          <div>
            <p className="text-xs font-semibold tracking-[0.15em] text-white/30 uppercase mb-3 flex items-center gap-1.5">
              <BookOpen className="w-3 h-3" />
              {filterKategorie ? KATEGORIE_INFO[filterKategorie].label : "Alle Geschichten"}
            </p>
            <div className="space-y-2">
              {alleGeschichten.map(g => (
                <GeschichteKarte key={g.id} geschichte={g} onOeffnen={() => { setAktiveGeschichte(g); setAnsicht("lesen"); }} />
              ))}
            </div>
            {/* Weitere Geschichte erstellen */}
            <button
              onClick={() => { setGewaehlteKategorie(filterKategorie); setGewaehlteThema(""); setPersonalisierung(""); setAnsicht("neu"); }}
              className="mt-4 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-white/10 hover:bg-white/6 transition-colors text-sm text-white/50 hover:text-white/80"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {filterKategorie ? `Neue ${KATEGORIE_INFO[filterKategorie].label}-Geschichte erstellen` : "Neue Geschichte erstellen"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Karten-Komponente ────────────────────────────────────────────────────────

function GeschichteKarte({ geschichte, onOeffnen }: { geschichte: Geschichte; onOeffnen: () => void }) {
  const info = KATEGORIE_INFO[geschichte.kategorie];
  return (
    <button
      onClick={onOeffnen}
      className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white/4 hover:bg-white/8 border border-white/5 hover:border-white/10 transition-all text-left"
    >
      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${info.farbe} flex items-center justify-center flex-shrink-0`}>
        {info.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-white truncate">{geschichte.titel}</p>
        <p className="text-xs text-white/35 mt-0.5 truncate">{geschichte.thema}</p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {geschichte.favorit && <Star className="w-3.5 h-3.5 text-amber-400" fill="currentColor" />}
        {geschichte.audioUrl && <div className="w-1.5 h-1.5 rounded-full bg-green-400/60" title="Audio verfügbar" />}
        <ChevronRight className="w-4 h-4 text-white/20" />
      </div>
    </button>
  );
}
