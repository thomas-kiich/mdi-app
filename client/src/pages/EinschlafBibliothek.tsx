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

  // Audio-State
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const musikRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioLaedt, setAudioLaedt] = useState(false);

  // Schlaf-Musik URL (dieselbe wie im Schlaf-Modus)
  const SCHLAF_MUSIK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/schlauntermalung_MAapp_3deef3ee.wav";

  // Musik sanft einblenden
  const startMusik = useCallback(() => {
    if (!musikRef.current) {
      musikRef.current = new Audio(SCHLAF_MUSIK_URL);
      musikRef.current.loop = true;
      musikRef.current.volume = 0;
    }
    musikRef.current.currentTime = 0;
    musikRef.current.play().catch(() => {});
    // Fade-in auf 0.30 in 3 Sekunden
    const steps = 30;
    const interval = 3000 / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (musikRef.current) musikRef.current.volume = Math.min(0.30, 0.30 * (step / steps));
      if (step >= steps) clearInterval(timer);
    }, interval);
  }, [SCHLAF_MUSIK_URL]);

  // Musik sanft ausblenden
  const stopMusik = useCallback((durationMs = 5000) => {
    if (!musikRef.current) return;
    const audio = musikRef.current;
    const startVol = audio.volume;
    const steps = 40;
    const interval = durationMs / steps;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(timer);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = 0.30;
      }
    }, interval);
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
    onSuccess: () => refetch(),
  });

  const loeschenMutation = trpc.einschlafBibliothek.loeschen.useMutation({
    onSuccess: () => {
      refetch();
      if (ansicht === "lesen") setAnsicht("start");
      toast.success("Geschichte gelöscht");
    },
  });

  // Audio abspielen / pausieren
  const handleAudio = useCallback(async (geschichte: Geschichte) => {
    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopMusik(2000); // Musik sanft ausblenden beim Pausieren
      return;
    }

    if (geschichte.audioUrl) {
      // Bereits gecachtes Audio
      if (!audioRef.current || audioRef.current.src !== geschichte.audioUrl) {
        audioRef.current = new Audio(geschichte.audioUrl);
        audioRef.current.onended = () => {
          setIsPlaying(false);
          stopMusik(5000); // Musik sanft ausblenden nach Ende
        };
      }
      startMusik(); // Musik einblenden
      // Kurze Verzögerung damit Musik zuerst einsetzt
      setTimeout(() => {
        audioRef.current?.play();
        setIsPlaying(true);
      }, 1500);
    } else {
      // Audio generieren (ElevenLabs)
      setAudioLaedt(true);
      try {
        const result = await audioGenerierenMutation.mutateAsync({ id: geschichte.id });
        if (result.audioUrl) {
          audioRef.current = new Audio(result.audioUrl);
          audioRef.current.onended = () => {
            setIsPlaying(false);
            stopMusik(5000); // Musik sanft ausblenden nach Ende
          };
          startMusik(); // Musik einblenden
          // Kurze Verzögerung damit Musik zuerst einsetzt
          setTimeout(() => {
            audioRef.current?.play();
            setIsPlaying(true);
          }, 1500);
          // Lokale Geschichte aktualisieren
          setAktiveGeschichte(prev => prev ? { ...prev, audioUrl: result.audioUrl } : prev);
          refetch();
        }
      } finally {
        setAudioLaedt(false);
      }
    }
  }, [isPlaying, audioGenerierenMutation, refetch, startMusik, stopMusik]);

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
            <p className="text-xs text-white/25 mt-2 ml-1">Beim ersten Abspielen wird die Stimme generiert (~10 Sek.)</p>
          )}
        </div>

        {/* Text */}
        <div className="px-5 pb-12 flex-1">
          <div className="prose prose-invert prose-sm max-w-none">
            {aktiveGeschichte.text.split("\n\n").map((absatz, i) => (
              <p key={i} className="text-white/80 leading-relaxed mb-4 text-[15px]">{absatz}</p>
            ))}
          </div>
        </div>
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
              <textarea
                value={personalisierung}
                onChange={e => setPersonalisierung(e.target.value)}
                placeholder="..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/25 text-sm focus:outline-none focus:border-white/30 resize-none"
              />
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
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-wide">EINSCHLAF-BIBLIOTHEK</h1>
            <p className="text-xs text-white/40">
              {alleGeschichten.length === 0
                ? "Noch keine Geschichten"
                : `${alleGeschichten.length} Geschichte${alleGeschichten.length !== 1 ? "n" : ""}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => { setGewaehlteKategorie(filterKategorie); setGewaehlteThema(""); setPersonalisierung(""); setAnsicht("neu"); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 transition-colors text-sm font-semibold text-white"
        >
          <Sparkles className="w-3.5 h-3.5" />
          Neue Geschichte
        </button>
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
