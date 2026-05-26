/**
 * RAUM 36 – Exklusiver Mitglieder-Bereich
 *
 * Öffentlicher Teil: Landing-Page mit Abo-CTA (€4,90/Monat)
 * Mitglieder-Bereich: Wochenvideos, Fragen an Thomas, Wissenspool
 */

import { useState, useEffect, useRef } from "react";
import React from "react";
import { Link, useLocation, useSearch } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

import {
  Lock,
  Play,
  MessageSquare,
  BookOpen,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  CheckCircle,
  Loader2,
  User,
  Video,
  Lightbulb,
  Mic,
  X,
  ArrowLeft,
  HeartPulse,
  Settings,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RichTextEditor, RichTextDisplay } from "@/components/RichTextEditor";
import { VitalDashboard } from "@/components/VitalDashboard";
import { HealthScreeningModal } from "@/components/HealthScreeningModal";
import { TrainingEinheitenView } from "@/components/TrainingEinheitenView";
import { Method36Trainer } from "@/components/Method36Trainer";
import { AmbientTrainer } from "@/components/AmbientTrainer";
import { IntervalTrainer } from "@/components/IntervalTrainer";
import { SpectralScanner } from "@/components/SpectralScanner";
import { ToneColorExplorer } from "@/components/ToneColorExplorer";
import { BefindlichkeitsTraining } from "@/components/BefindlichkeitsTraining";
import { KIBereich } from "@/components/KIBereich";
import { KIICHPraxis } from "@/components/KIICHPraxis";
import { Visionsraum } from "@/components/Visionsraum";

const BOLT_LEVELS = [
  {
    range: '1–10',
    condition: 'Sehr schwache konstitutionelle Verfassung',
    details: 'Sehr schwache konstitutionelle Verfassung. Sehr häufiges Gähnen oder Seufzen. Atemfrequenz in Ruhe stark erhöht (>15 Atemzüge pro Minute). Probleme bei leichter Belastung im Alltag.',
    training: [
      'Ausschließlich sanfte Atemtechniken',
      'Befindlichkeitstraining 7min',
      'Leichte Spaziergänge (max. 20 Min.)',
      'Entspannungsübungen'
    ],
    color: 'bg-red-900/30 border-red-700'
  },
  {
    range: '11–20',
    condition: 'Schwache konstitutionelle Verfassung',
    details: 'Schwache konstitutionelle Verfassung. Häufiges Gähnen oder Seufzen. Grenzwertig kompensierter Fitnesszustand; Atemfrequenz in Ruhe erhöht (>12 Atemzüge pro Minute). Probleme bei mittlerer Belastung im Alltag (z. B. Treppensteigen).',
    training: [
      'Alles von Ebene I',
      'Enthaltsamkeitstraining',
      'Behutsames Ausdauertraining (65–72% Hmax)',
      'Befindlichkeitstraining 7/12min'
    ],
    color: 'bg-orange-900/30 border-orange-700'
  },
  {
    range: '21–26',
    condition: 'Durchschnittliche Konstitution',
    details: 'Durchschnittliche Konstitution. Mittlermäßiger Fitnesszustand. Normale Atmung eher ruhig, gleichmäßig und mühelos. Verbesserte Ausdauer; leichtes körperliches Training und Alltagsaktivitäten ohne merkliche Probleme machbar.',
    training: [
      'Alles von den Vorebenen',
      'Schnelles Gehen oder Joggen (30–60 Min.) bei leichtem Lufthunger',
      'Yohntraining neunstufig',
      'Mobilitätstraining'
    ],
    color: 'bg-yellow-900/30 border-yellow-700'
  },
  {
    range: '26–35',
    condition: 'Gute Atemsensitivität und Belastbarkeit',
    details: 'Gute Atemsensitivität und Belastbarkeit; guter bis sehr guter Fitnesszustand. Zügige Erholungsphasen nach Anstrengung; effizientes Herzkreislaufsystem. Gute Sporttauglichkeit. Leistungssteigerungen sind problemlos möglich.',
    training: [
      'Alles aus den Vorebenen',
      'Apnoetraining morgens',
      'Yohntraining intensiv',
      'Maximalkrafttraining',
      'VO2 max Training'
    ],
    color: 'bg-green-900/30 border-green-700'
  },
  {
    range: '36+',
    condition: 'Ideale Atemphysiologie und exzellenter Fitnesszustand',
    details: 'Ideale Atemphysiologie und exzellenter Fitnesszustand; Zielwert für Athleten. Sportliche Leistungsfähigkeit und effiziente Erholungsphasen.',
    training: [
      'Hochintensives Training bei reiner Nasenatmung möglich',
      'In Pausenzeiten hochintensiver Intervall-Sessions ausschließlich durch die Nase atmen',
      'Fortgeschrittene Simulation von Höhentraining unter hoher Belastung'
    ],
    color: 'bg-blue-900/30 border-blue-700'
  }
];

function BoltLevels() {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  return (
    <div className="space-y-3 mt-4">
      {BOLT_LEVELS.map((level, idx) => (
        <div
          key={idx}
          onClick={() => setSelectedLevel(selectedLevel === idx ? null : idx)}
          className={`p-4 rounded-lg border cursor-pointer transition-all ${level.color} hover:border-opacity-100`}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="font-semibold text-white">{level.range} Sekunden</div>
              <div className="text-sm text-zinc-300 mt-1">{level.condition}</div>
              <p className="text-xs text-zinc-400 mt-2">{level.details}</p>
              {selectedLevel === idx && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">Trainingsempfehlungen:</div>
                  <ul className="space-y-1">
                    {level.training.map((item, i) => (
                      <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                        <span className="text-orange-400 mt-0.5">→</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="ml-4 text-xl flex-shrink-0">{selectedLevel === idx ? '▼' : '▶'}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

function PodcastButton() {
  const podcastUrl = 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663036873684/JePJKOCZiSbQlcdH.mp3';
  
  return (
    <a
      href={podcastUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
    >
      <Mic className="w-4 h-4" />
      Podcast hören
    </a>
  );
}

// ─── Öffentliche Landing-Page ───────────────────────────────────────────────

function Raum36Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  // Health Screening Modal State
  const [showHealthScreening, setShowHealthScreening] = useState(false);

  // Voranmeldungs-Modal State
  const [showVoranmeldung, setShowVoranmeldung] = useState(false);
  const [voranName, setVoranName] = useState("");
  const [voranEmail, setVoranEmail] = useState("");
  const [voranNachricht, setVoranNachricht] = useState("Ich interessiere mich für die Stimmklanganalyse und bitte um Kontaktaufnahme.");

  const voranmeldungMutation = trpc.raum36.voranmeldungStimmklang.useMutation({
    onSuccess: () => {
      toast.success("Voranmeldung gesendet! Thomas meldet sich bei dir.");
      setShowVoranmeldung(false);
      setVoranName("");
      setVoranEmail("");
      setVoranNachricht("Ich interessiere mich für die Stimmklanganalyse und bitte um Kontaktaufnahme.");
    },
    onError: (err) => toast.error(err.message),
  });

  const checkoutMutation = trpc.raum36.createCheckoutRaum36.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Du wirst zu Stripe weitergeleitet…");
        setShowHealthScreening(false);
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message);
      setShowHealthScreening(false);
    },
  });

  const stimmklangCheckoutMutation = trpc.raum36.createCheckoutStimmklang.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Du wirst zu Stripe weitergeleitet…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => toast.error(err.message),
  });

  const handleJoin = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/raum36");
      return;
    }
    // Zeige Health Screening Modal vor Checkout
    setShowHealthScreening(true);
  };

  const handleHealthScreeningApproved = () => {
    // Starte Checkout nach Genehmigung
    checkoutMutation.mutate({ origin: window.location.origin });
  };

  const handleHealthScreeningExcluded = () => {
    toast.error("Screening nicht genehmigt. Bitte konsultieren Sie einen Arzt.");
  };

  const handleHealthScreeningPendingAttestation = () => {
    // Leite zu Attest-Upload Seite weiter
    window.location.href = "/account/health-attestation";
  };

  const handleBuchenStimmklang = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/raum36");
      return;
    }
    stimmklangCheckoutMutation.mutate({ origin: window.location.origin });
  };

  // Überprüfe Checkout-Status beim Laden
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkoutStatus = params.get("checkout");

    if (checkoutStatus === "success") {
      toast.success("✅ Zahlung erfolgreich! Willkommen in RAUM 36!");
      // Entferne Query-Parameter aus URL
      window.history.replaceState({}, document.title, "/raum36");
    } else if (checkoutStatus === "cancelled") {
      toast.info("Checkout abgebrochen. Du kannst jederzeit erneut versuchen.");
      window.history.replaceState({}, document.title, "/raum36");
    }
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Health Screening Modal */}
      <HealthScreeningModal
        open={showHealthScreening}
        onOpenChange={setShowHealthScreening}
        onApproved={handleHealthScreeningApproved}
        onExcluded={handleHealthScreeningExcluded}
        onPendingAttestation={handleHealthScreeningPendingAttestation}
      />

      {/* Navigation */}
      <div className="px-6 pt-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 hover:text-orange-500 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Startseite
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-zinc-800 px-6 py-10 md:py-16">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block border border-orange-600 px-3 py-1 text-xs font-mono text-orange-500 mb-6 uppercase tracking-widest">
            Exklusiver Mitglieder-Bereich
          </div>
          <div className="flex items-baseline gap-4 mb-4">
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-none">
              RAUM 36
            </h1>
            <span className="text-xl md:text-2xl font-semibold text-orange-400 tracking-tight leading-none">
              WILLKOMMEN!
            </span>
          </div>
          <p className="text-base md:text-lg text-zinc-300 max-w-2xl leading-relaxed">
            Hier findest du das interaktive Angebot für deine maximale Unterstützung. Erhalte Antworten auf deine persönlichen Anliegen, inspiriere dich durch die gemeinsamen Dialoge der Mitglieder, entwickle deinen individuellen Trainingsplan und verfolge deine Entwicklungen auf deinem eigenen VITALMONITOR.
          </p>
        </div>
      </section>

      {/* Mitgliedschaft */}
      <section className="px-6 py-10 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="border border-zinc-700 p-8 md:p-12 max-w-lg">
            <div className="text-orange-500 text-sm font-mono uppercase tracking-widest mb-4">
              HIER ANMELDEN
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-medium text-white">€ 4,90</span>
              <span className="text-zinc-500 text-sm">/ Monat</span>
            </div>
            <div className="text-zinc-500 text-xs mb-8">Jederzeit kündbar</div>
            <ul className="space-y-3 mb-10">
              {[
                "Persönliche Fragen an Thomas stellen",
                "Mit deinem gewünschten Namen oder einem Pseudonym im aktiven Informationspool dabei sein",
                "Das umfangreiche Trainingsangebot der METHODE 36 schrittweise in deinen Alltag integrieren",
                "Nutze deinen persönlichen VITALMONITOR und erhalte Überblick über deine Trainingsfortschritte",
                "Lerne und wachse mit KI-Werkzeugen",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>

            <Button
              onClick={handleJoin}
              disabled={checkoutMutation.isPending}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 h-auto rounded-none uppercase tracking-wide"
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              MITGLIED WERDEN
            </Button>
            <p className="text-zinc-500 text-xs mt-3 text-center">
              Werteausgleich: € 4,90 pro Monat · jederzeit kündbar
            </p>
          </div>
        </div>
      </section>

      {/* Stimmklanganalyse – exklusiv in RAUM 36 */}
      <section className="px-6 py-16 border-b border-zinc-800 bg-zinc-900/40">
        <div className="max-w-4xl mx-auto">
          <div className="border border-orange-600/30 p-8 md:p-10">
            <div className="flex items-start gap-6">
              <div className="w-14 h-14 bg-orange-600/20 flex items-center justify-center text-orange-500 flex-shrink-0">
                <Mic className="w-7 h-7" />
              </div>
              <div className="flex-1">
                <div className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">
                  Exklusiv in RAUM 36
                </div>
                <h3 className="text-lg font-semibold tracking-widest mb-3 text-zinc-100">
                  STIMMKLANGANALYSE
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Hier bestimmst du deinen Stimmklang. In drei aufeinanderfolgenden Tagen führst du die Frequenzanalyse deiner Stimme durch – detailgenaue Anleitung mit sofortiger Darstellung deines Klangspektrums. Danach bespricht Thomas das Ergebnis persönlich mit dir und führt die finale Justierung durch.
                </p>
                <div className="flex items-baseline gap-2 mb-5">
                  <span className="text-xl font-medium text-white">€ 150</span>
                  <span className="text-zinc-500 text-xs">einmalig · inkl. persönlichem Gespräch mit Thomas</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleBuchenStimmklang}
                    disabled={stimmklangCheckoutMutation.isPending}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 h-auto rounded-none uppercase tracking-wide border-0"
                  >
                    {stimmklangCheckoutMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    Jetzt buchen
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Voranmeldungs-Modal */}
      {showVoranmeldung && (
        <div className="fixed inset-0 bg-black/85 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 p-8 max-w-md w-full relative">
            <button
              onClick={() => setShowVoranmeldung(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-white transition-colors"
              aria-label="Schließen"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">Stimmklanganalyse</div>
            <h3 className="text-xl font-semibold mb-1">Voranmeldung</h3>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Thomas meldet sich bei dir, sobald die Stimmklanganalyse in RAUM 36 verfügbar ist.
            </p>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1.5 block">Name</label>
                <Input
                  value={voranName}
                  onChange={(e) => setVoranName(e.target.value)}
                  placeholder="Dein Name"
                  className="rounded-none border-zinc-700 bg-zinc-800 text-white"
                  maxLength={100}
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1.5 block">E-Mail</label>
                <Input
                  type="email"
                  value={voranEmail}
                  onChange={(e) => setVoranEmail(e.target.value)}
                  placeholder="deine@email.com"
                  className="rounded-none border-zinc-700 bg-zinc-800 text-white"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-zinc-500 mb-1.5 block">Nachricht</label>
                <Textarea
                  value={voranNachricht}
                  onChange={(e) => setVoranNachricht(e.target.value)}
                  rows={3}
                  className="rounded-none border-zinc-700 bg-zinc-800 text-white resize-none"
                  maxLength={1000}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() =>
                    voranmeldungMutation.mutate({
                      name: voranName,
                      email: voranEmail,
                      nachricht: voranNachricht,
                    })
                  }
                  disabled={
                    voranmeldungMutation.isPending ||
                    voranName.length < 2 ||
                    voranEmail.length < 5 ||
                    voranNachricht.length < 5
                  }
                  className="bg-orange-600 hover:bg-orange-500 rounded-none flex-1 font-semibold"
                >
                  {voranmeldungMutation.isPending ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : null}
                  Absenden
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowVoranmeldung(false)}
                  className="rounded-none border-zinc-700"
                >
                  Abbrechen
                </Button>
              </div>
              <p className="text-zinc-600 text-xs leading-relaxed pt-1">
                Deine Angaben werden ausschließlich zur Kontaktaufnahme verwendet
                (Art. 6 Abs. 1 lit. b DSGVO). Weitere Infos in der{" "}
                <a href="/datenschutz" className="underline hover:text-zinc-400 transition-colors">Datenschutzerklärung</a>.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Mitglieder-Bereich ──────────────────────────────────────────────────────
type Tab = "methode36" | "fragen" | "videos" | "vital" | "wissenspool" | "frequenzlabor" | "kiich-praxis";

// Freischaltungsdatum für neue Features (Vital Monitor)
const FEATURE_UNLOCK = new Date("2026-05-14T00:00:00");

function Raum36Member() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  // URL-Parameter auswerten: ?tab=methode&kategorie=befindlichkeit&training=3
  // useSearch() von Wouter reagiert reaktiv auf Query-String-Änderungen (auch ohne Reload)
  const search = useSearch();

  // Tab-Mapping: URL-Param → interner Tab-Name
  const tabMap: Record<string, Tab> = {
    methode: "methode36",
    methode36: "methode36",
    fragen: "fragen",
    kommunikation: "fragen",
    videos: "videos",
    trainingsaufbau: "videos",
    vital: "vital",
    vitalmonitor: "vital",
    wissenspool: "wissenspool",
    frequenzlabor: "frequenzlabor",
    kiichPraxis: "kiich-praxis",
  };

  const urlParams = new URLSearchParams(search);
  const tabParam = urlParams.get("tab");
  const kategorieParam = urlParams.get("kategorie") || undefined;
  const trainingParam = urlParams.get("training") ? parseInt(urlParams.get("training")!) : undefined;
  const resolvedTab: Tab = (tabParam && tabMap[tabParam]) ? tabMap[tabParam] as Tab : "methode36" as Tab;

  const [activeTab, setActiveTab] = useState<Tab>(resolvedTab);
  const trainingViewRef = useRef<HTMLDivElement>(null);
  const [externalFilterKat, setExternalFilterKat] = useState<string | undefined>(undefined);

  // Mapping: alte Kategorie-IDs -> neue DB-Kategorie-IDs
  // OLD_TO_NEW_KAT entfernt (TrainingCategoryStructure nicht mehr verwendet)
  // Platzhalter für zukünftige Kategorie-Mappings
  const _OLD_TO_NEW_KAT: Record<string, string> = {
    befindlichkeit: "befindlichkeit",
    breathing: "atemtraining",
    voice: "stimmklangtraining",
    movement: "bewegungstraining",
    ambient: "umfeldaktivierung",
  };

  // Reagiert auf Query-String-Änderungen (z.B. interner Link-Klick im Kommunikationscenter)
  useEffect(() => {
    setActiveTab(resolvedTab);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  // Scrollt automatisch zur TrainingEinheitenView wenn ein training-Parameter gesetzt ist
  useEffect(() => {
    if (trainingParam && trainingViewRef.current) {
      setTimeout(() => {
        trainingViewRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 300);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainingParam, activeTab]);
  const [neueFrageText, setNeueFrageText] = useState("");
  const [showFrageForm, setShowFrageForm] = useState(false);
  const [pseudonymInput, setPseudonymInput] = useState("");
  const [showPseudonymForm, setShowPseudonymForm] = useState(false);
  const [inlineNameInput, setInlineNameInput] = useState("");

  // Methode 36 Trainer State
  const [m36ActiveTrainer, setM36ActiveTrainer] = useState<string | null>(null);
  const [m36TrainingItem, setM36TrainingItem] = useState<{ id: string; name: string; description: string; type: string } | null>(null);
  const [m36Duration, setM36Duration] = useState<number>(0);
  const [m36BasicData, setM36BasicData] = useState<{ freq: number; tone: string; color: string; typeId: number } | null>(null);
  const [kiichPraxisView, setKiichPraxisView] = useState<string | null>(null);

  // Frequenz-Labor State
  const [flShowScanner, setFlShowScanner] = useState(false);
  const [flTrainerData, setFlTrainerData] = useState<{ freq: number; tone: string; color: string; typeId: number } | null>(null);

  const statusQuery = trpc.raum36.getStatus.useQuery();
  // Vital Monitor ist für alle aktiven RAUM 36 Mitglieder zugänglich (kein separater Kauf nötig)
  const isVitalUnlocked = isAdmin || statusQuery.data?.isActive === true;
  // Stimmklang-Status für Erinnerungs-Banner
  const { data: stimmklangStatus } = trpc.stimmklang.status.useQuery(
    undefined,
    { enabled: !!user && (statusQuery.data?.hasStimmklangAccess === true || isAdmin) }
  );
  const postsQuery = trpc.raum36.getPosts.useQuery(undefined, {
    enabled: activeTab === "videos",
  });
  const fragenQuery = trpc.raum36.getFragen.useQuery(undefined, {
    enabled: activeTab === "fragen",
  });
  const wissenspoolQuery = trpc.raum36.getWissenspool.useQuery(undefined, {
    enabled: activeTab === "wissenspool",
  });

  const utils = trpc.useUtils();

  const stelleFrageMutation = trpc.raum36.stelleFrage.useMutation({
    onSuccess: () => {
      toast.success("Frage gestellt! Thomas antwortet in Kürze.");
      setNeueFrageText("");
      setInlineNameInput("");
      setShowFrageForm(false);
      utils.raum36.getFragen.invalidate();
      utils.raum36.getStatus.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  const setPseudonymMutation = trpc.raum36.setPseudonym.useMutation({
    onSuccess: () => {
      toast.success("Pseudonym gespeichert.");
      setShowPseudonymForm(false);
      utils.raum36.getStatus.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  // Admin: Inline-Antwort direkt im Forum
  const [answeringFrageId, setAnsweringFrageId] = useState<number | null>(null);
  const [inlineAntwortText, setInlineAntwortText] = useState("");
  const adminAntworte = trpc.raum36.adminAntworte.useMutation({
    onSuccess: () => {
      toast.success("Antwort gespeichert!");
      setAnsweringFrageId(null);
      setInlineAntwortText("");
      utils.raum36.getFragen.invalidate();
    },
    onError: (e) => toast.error(e.message),
  });

  const pseudonym = statusQuery.data?.pseudonym;

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div>
            <Link href="/" className="text-xs font-mono text-zinc-400 hover:text-orange-500 uppercase tracking-widest mb-2 flex items-center gap-1.5 transition-colors border border-zinc-700 hover:border-orange-600 px-3 py-1.5 w-fit">
              ← Startseite
            </Link>
            <div className="text-xs font-mono text-orange-500 uppercase tracking-widest mb-1">
              Mitglieder-Bereich
            </div>
            <h1 className="text-2xl font-black tracking-tight">RAUM 36</h1>
          </div>
          <div className="flex items-center gap-3">
            {pseudonym ? (
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <User className="w-4 h-4" />
                <span>{pseudonym}</span>
                <button
                  onClick={() => setShowPseudonymForm(true)}
                  className="text-zinc-600 hover:text-zinc-400 text-xs underline"
                >
                  ändern
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowPseudonymForm(true)}
                className="rounded-none border-zinc-700 text-zinc-400 hover:text-white"
              >
                Pseudonym wählen
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Pseudonym-Dialog */}
      {showPseudonymForm && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-zinc-900 border border-zinc-700 p-8 max-w-md w-full">
            <h3 className="font-bold text-lg mb-2">Pseudonym wählen</h3>
            <p className="text-zinc-400 text-sm mb-6">
              Dein Pseudonym erscheint bei deinen Fragen. Wähle etwas, das du gerne bist.
            </p>
            <Input
              value={pseudonymInput}
              onChange={(e) => setPseudonymInput(e.target.value)}
              placeholder="z.B. Wanderer, Klangsucher, Lichtbote…"
              className="rounded-none border-zinc-700 bg-zinc-800 text-white mb-4"
              maxLength={64}
            />
            <div className="flex gap-3">
              <Button
                onClick={() => setPseudonymMutation.mutate({ pseudonym: pseudonymInput })}
                disabled={setPseudonymMutation.isPending || pseudonymInput.length < 2}
                className="bg-orange-600 hover:bg-orange-500 rounded-none flex-1"
              >
                {setPseudonymMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : null}
                Speichern
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowPseudonymForm(false)}
                className="rounded-none border-zinc-700"
              >
                Abbrechen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Stimmklang-Erinnerungs-Banner */}
      {stimmklangStatus && stimmklangStatus.gesamtTage < 3 && stimmklangStatus.gesamtTage > 0 && (
        <div className="px-6 py-3 bg-orange-950/40 border-b border-orange-800/40">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Mic className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="text-orange-300 text-sm font-medium">
                  Stimmklangmessung Tag {stimmklangStatus.gesamtTage + 1} / 3 steht aus
                </span>
                <span className="text-zinc-500 text-xs ml-2">
                  Für ein vollständiges Profil bitte heute messen.
                </span>
              </div>
            </div>
            <a
              href="/stimmklang-start"
              className="shrink-0 text-xs font-mono bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded transition-colors"
            >
              Jetzt messen →
            </a>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-6">
        <div className="max-w-4xl mx-auto flex">
          {(
            [
              { id: "methode36", label: "METHODE 36", icon: <span className="text-base">⚡</span> },
              { id: "fragen", label: "KOMMUNIKATIONSCENTER", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "videos", label: "TRAININGSAUFBAU", icon: <Video className="w-4 h-4" /> },
              { id: "vital", label: "VITALMONITOR", icon: <HeartPulse className="w-4 h-4" /> },
              { id: "wissenspool", label: "WISSENSPOOL", icon: <Lightbulb className="w-4 h-4" /> },
              { id: "frequenzlabor", label: "FREQUENZ-LABOR", icon: <span className="text-base">🔬</span> },
              { id: "kiich-praxis", label: "KIICH PRAXIS", icon: <span className="text-base">🎯</span> },
            ] as { id: Tab; label: string; icon: React.ReactNode }[]
          ).map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-orange-500 text-white"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-10">
        <div className="max-w-4xl mx-auto">

          {/* METHODE 36 */}
          {activeTab === "methode36" && (
            <div>
              {m36ActiveTrainer === "yohn" ? (
                <Method36Trainer
                  frequency={m36BasicData?.freq || 97.2}
                  toneName={m36BasicData?.tone || "G"}
                  color={m36BasicData?.color || "#ff5757"}
                  typeId={m36BasicData?.typeId || 19}
                  duration={m36Duration || 7}
                  onClose={() => {
                    setM36ActiveTrainer(null);
                    setM36BasicData(null);
                  }}
                />
              ) : m36ActiveTrainer === "interval" ? (
                <IntervalTrainer
                  baseTone={m36BasicData ? {
                    name: m36BasicData.tone,
                    frequency: m36BasicData.freq,
                    color: m36BasicData.color,
                  } : undefined}
                  onClose={() => {
                    setM36ActiveTrainer(null);
                    setM36TrainingItem(null);
                  }}
                />
              ) : m36ActiveTrainer === "metabolic" ? (
                <AmbientTrainer
                  trainingId="metabolic"
                  duration={m36Duration || 0}
                  audioUrls={{ 0: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/RESONSANZausdemRAUM_434eee24.mp3" }}
                  onClose={() => {
                    setM36ActiveTrainer(null);
                    setM36TrainingItem(null);
                  }}
                />
              ) : m36ActiveTrainer === "mayerwelle" ? (
                <AmbientTrainer
                  trainingId="mayerwelle"
                  duration={m36Duration || 0}
                  audioUrls={{ 45: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/ambient-extra_262fb71f.mp3" }}
                  onClose={() => {
                    setM36ActiveTrainer(null);
                    setM36TrainingItem(null);
                  }}
                />
              ) : m36ActiveTrainer === "befindlichkeit" ? (
                <BefindlichkeitsTraining
                  onClose={() => {
                    setM36ActiveTrainer(null);
                  }}
                />
              ) : m36ActiveTrainer === "ki" ? (
                <KIBereich onBack={() => setM36ActiveTrainer(null)} />
              ) : null}
              {/* TRAININGSEINHEITEN (vom Admin verwaltet) – 1-Atemtraining, 2-Stimmklang, 4-Umfeldaktivierung */}
              {!m36ActiveTrainer && (
                <div className="mb-8" ref={trainingViewRef}>
                  <TrainingEinheitenView
                    initialKategorie={kategorieParam}
                    initialTrainingId={trainingParam}
                    externalFilterKat={externalFilterKat}
                    excludeKat={["kiichpraxis"]}
                    onStartTrainer={(payload) => {
                      setM36Duration(payload.duration);
                      setM36ActiveTrainer(payload.trainer);
                      if (payload.trainer === "yohn") {
                        setM36BasicData({
                          freq: payload.freq ?? 97.2,
                          tone: payload.tone ?? "G",
                          color: payload.color ?? "#ff5757",
                          typeId: payload.typeId ?? 19,
                        });
                      }
                    }}
                  />
                </div>
              )}

              {/* BEWEGUNGSTRAINING – Thema 3 */}
              {!m36ActiveTrainer && (
                <div className="mt-8 mb-4">
                  <div className="rounded-xl p-4 border border-red-500/30 bg-red-500/10 mb-3">
                    <h2 className="text-base font-bold tracking-wide mb-1 text-red-400">4 – BEWEGUNGSTRAINING</h2>
                    <p className="text-zinc-300 text-sm leading-relaxed">Gezielte Bewegungsübungen zur Aktivierung und Unterstützung deines Trainings.</p>
                  </div>
                  <div className="rounded-xl p-4 border border-orange-500/20 bg-zinc-900/40">
                    <p className="text-zinc-500 text-sm text-center">Inhalte folgen in Kürze.</p>
                  </div>
                </div>
              )}
              {/* BEFINDLICHKEITSTRAINING – Thema 5 */}
              {!m36ActiveTrainer && (
                <div className="mt-8 mb-4">
                  {/* Kategorie-Header */}
                  <div className="rounded-xl p-4 border border-orange-500/30 bg-orange-500/10 mb-3">
                    <h2 className="text-base font-bold tracking-wide mb-1 text-orange-300">5 – BEFINDLICHKEITSTRAINING</h2>
                    <p className="text-zinc-300 text-sm leading-relaxed">Wähle intuitiv deine momentane Stimmung und aktiviere dein Potential durch die passende Lichtklang-Frequenz.</p>
                  </div>
                  {/* Trainingskachel */}
                  <button
                    className="w-full text-left rounded-xl p-4 border border-orange-500/30 bg-orange-500/10 hover:brightness-110 transition-all hover:scale-[1.01] active:scale-[0.99]"
                    onClick={() => setM36ActiveTrainer("befindlichkeit")}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0 bg-orange-400" />
                      <div>
                        <p className="text-xs font-bold mb-1 text-orange-300">BEFINDLICHKEITSTRAINING</p>
                        <p className="text-zinc-300 text-sm leading-relaxed">12 Lichtfarben-Archetypen – wähle die Farbe, die du gerade brauchst, und starte das YOHN-Training mit der passenden Frequenz.</p>
                      </div>
                    </div>
                  </button>
                </div>
              )}

              {/* Admin-Button: METHODE 36 bearbeiten */}
              {isAdmin && !m36ActiveTrainer && (
                <div className="flex justify-end mb-4">
                  <a
                    href="/admin/training-einheiten"
                    className="flex items-center gap-2 text-xs text-orange-400 border border-orange-500/30 hover:border-orange-400/60 bg-orange-500/5 hover:bg-orange-500/10 px-3 py-1.5 rounded transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    METHODE 36 bearbeiten
                  </a>
                </div>
              )}
            </div>
          )}

          {/* Wochenvideos */}
          {activeTab === "videos" && (
            <div>
              {/* TRAININGSAUFBAU Einführungstext */}
              <div className="mb-8 p-6 bg-gradient-to-br from-orange-500/10 to-transparent border border-orange-500/30 rounded-xl">
                <h2 className="text-2xl font-bold text-white mb-4 tracking-wide">TRAININGSAUFBAU</h2>
                <p className="text-zinc-300 leading-relaxed mb-4">
                  In diesem Segment findest du die empfohlene Herangehensweise, wie du ausgehend von deinem Befindlichkeitsstatus (BOLTWERT am Morgen) deine Vitalität erhöhst. Je höher dein BOLTlevel am Morgen, umso höher ist der Resilienzfaktor deines Systems. Das bedeutet, dass der Wirkungsgrad deines Stoffwechsels und die gesamte Kommunikation der drei Gehirne in deinem Körper (Kopf, Herz, Bauchgehirn) auf hohem Niveau agieren.
                </p>
                <div className="mb-4 p-4 bg-zinc-900/50 border border-zinc-700 rounded-lg">
                  <p className="text-sm font-semibold text-orange-400 mb-2">Messe täglich folgende Werte am Morgen und trage sie anschliessend in deinen persönlichen VITALMONITOR in RAUM 36 ein:</p>
                  <ul className="text-sm text-zinc-300 space-y-1 ml-2">
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">→</span><span>BOLTWERT</span></li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">→</span><span>RUHEPULS</span></li>
                    <li className="flex items-start gap-2 mt-2"><span className="text-zinc-500 text-xs mt-0.5">ab BOLTlevel 26–35:</span></li>
                    <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">→</span><span>APNOEWERTE</span></li>
                  </ul>
                </div>
                <p className="text-zinc-300 leading-relaxed mb-4">
                  Setze die Trainingsempfehlungen deines jeweilig aktuellen BOLTwerts um und trage die Ergebnisse immer gleich in deinen persönlichen{" "}
                  <button
                    onClick={() => setActiveTab("vital")}
                    className="text-orange-400 font-semibold underline underline-offset-2 hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    VITALMONITOR
                  </button>{" "}
                  ein. Du wirst merken, wie motivierend es ist, die sofort einsehbaren Steigerungen deiner Formkurven zu verfolgen. Im Kontext mit Eintragungen aus deinem Essverhalten und den persönlichen Erlebnisfaktoren (die du ebenso eintragen kannst) erhältst du in kurzer Zeit ein vollkommen neues, tiefes Erfahrungsbild der Zusammenhänge deiner Aktivitäten.
                </p>
                <p className="text-zinc-300 leading-relaxed mb-4">
                  Stelle jederzeit Fragen an Thomas im{" "}
                  <button
                    onClick={() => setActiveTab("fragen")}
                    className="text-orange-400 font-semibold underline underline-offset-2 hover:text-orange-300 transition-colors cursor-pointer"
                  >
                    KOMMUNIKATIONSCENTER
                  </button>
                  , wenn etwas unklar ist, du weiterführende Fragen hast oder Ideen und Empfehlungen.
                </p>
                <p className="text-zinc-400 text-sm leading-relaxed italic">
                  Es kommen ständig neue Trainingsangebote in RAUM 36 – halte dich also auf dem Laufenden und nütze die vielfältigen Möglichkeiten, aber immer auf deinem abgestimmten Level der Befindlichkeit.
                </p>
              </div>

              {/* BOLT-Messung */}
              <div className="mb-8 p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-xl">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-white mb-1">🫁 BOLT-Messung</h3>
                    <p className="text-sm text-zinc-400">Atemkontrolle & Konstitution – Der wahre Wert deiner Gesundheit</p>
                    <p className="text-xs text-zinc-500 mt-3 pt-3 border-t border-zinc-700 italic">Die nachfolgenden Angaben zu medizinischen Zuordnungen der BOLTWERTE stammen aus dem Buch von P. Keown - Erfolgsfaktor Sauerstoff. Dr. Keown war Schüler des Begründers der Buteykomethode - Dr. Buteyko.</p>
                    <div className="text-xs text-zinc-500 mt-3 space-y-1">
                      <p className="font-semibold text-zinc-400">Quellenverzeichnis:</p>
                      <p>[1] The Oxygen Advantage Lib/E - Bookey</p>
                      <p>[2] So verbesserst Du optimal Deinen BOLT-Wert - strongmove</p>
                      <p>[3] TEST 1: BOLT TEST = BODY OXYGEN LEVEL TEST - Thiemo Osterhaus</p>
                      <p>[4] From Breathless to Breathe Less: Run smart. Run nasal | Patrick McKeown | Erfolgsfaktor Sauerstoff</p>
                    </div>
                  </div>
                  <PodcastButton />
                </div>
                <p className="text-zinc-300 mb-4">Messe deine Atemhaltedauer nach normalem Ausatmen. Die BOLT-Messung zeigt deine Atemkontrolle, Konstitution und personalisierte Trainingsempfehlungen.</p>
                
                {/* BOLT Levels – interaktiv klappbar */}
                <BoltLevels />

                {/* BOLT-Messung Anleitung */}
                <div className="mt-8 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
                  <h4 className="font-bold text-white mb-4">Ablauf der BOLT-Messung</h4>
                  <p className="text-sm text-zinc-400 mb-4">So machst du deine BOLT-Messung richtig:</p>
                  <ol className="space-y-3 text-sm text-zinc-300">
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">1)</span>
                      <span>Am Morgen gleich nach dem Aufwachen noch im Bett liegend auf dem Rücken.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">2)</span>
                      <span>Eine Uhr bereitstellen mit Sekundenzeiger.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">3)</span>
                      <span>Dreimaliges sanftes Atmen durch die Nase.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">4)</span>
                      <span>Nach dem dritten Ausatmen deine Nasenflügel sanft mit zwei Fingern schließen und die Startzeit an der Uhr erfassen.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">5)</span>
                      <span>Wenn ein erster Reflex zum Einatmen kommt, die vergangenen Sekunden an der Uhr ablesen.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">6)</span>
                      <span>Wenn du die Übung richtig gemacht hast, kannst du dein Atmen ganz normal wieder aufnehmen ohne Luftknappheit zu empfinden.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="font-semibold text-orange-500 flex-shrink-0">7)</span>
                      <span>Trage deinen Wert am Besten gleich in deinen persönlichen Vitalmonitor in RAUM 36 ein.</span>
                    </li>
                  </ol>
                </div>
              </div>

              {postsQuery.isLoading ? (
                <div className="flex items-center gap-3 text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Lade Videos…</span>
                </div>
              ) : postsQuery.data?.length === 0 ? (
                <div className="border border-zinc-800 p-12 text-center">
                  <Video className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">Das erste Video kommt bald.</p>
                </div>
              ) : (
                <div className="space-y-0 border border-zinc-800">
                  {postsQuery.data?.map((post) => (
                    <div key={post.id} className="border-b border-zinc-800 last:border-b-0 p-6">
                      <div className="flex items-start gap-4">
                        {post.thumbnailUrl ? (
                          <img
                            src={post.thumbnailUrl}
                            alt={post.titel}
                            className="w-32 h-20 object-cover flex-shrink-0 bg-zinc-800"
                          />
                        ) : (
                          <div className="w-32 h-20 bg-zinc-900 border border-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Play className="w-6 h-6 text-zinc-600" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-lg mb-2 leading-tight">{post.titel}</h3>
                          {post.beschreibung && (
                            <p className="text-zinc-400 text-sm leading-relaxed mb-3 line-clamp-2">
                              {post.beschreibung}
                            </p>
                          )}
                          <div className="flex items-center gap-4">
                            <span className="text-zinc-600 text-xs font-mono">
                              {new Date(post.createdAt).toLocaleDateString("de-DE")}
                            </span>
                            {post.videoUrl && (
                              <a
                                href={post.videoUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-sm font-medium"
                              >
                                <Play className="w-3 h-3" />
                                Video ansehen
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Fragen */}
          {activeTab === "fragen" && (
            <div>
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className="font-bold text-xl">Fragen an Thomas</h2>
                  <p className="text-zinc-500 text-sm mt-1">
                    Alle Fragen und Antworten sind für alle Mitglieder sichtbar.
                  </p>
                </div>
                {!showFrageForm && (
                  <Button
                    onClick={() => setShowFrageForm(true)}
                    className="bg-orange-600 hover:bg-orange-500 rounded-none"
                  >
                    Frage stellen
                  </Button>
                )}
              </div>

              {showFrageForm && (
                <div className="border border-zinc-700 p-6 mb-8">
                  <h3 className="font-bold mb-4">Neue Frage</h3>
                  {/* Name/Pseudonym inline – nur anzeigen wenn noch keins gesetzt */}
                  {!pseudonym && (
                    <div className="mb-4">
                      <label className="block text-xs font-mono text-zinc-400 uppercase tracking-widest mb-2">
                        Dein Name oder Pseudonym
                      </label>
                      <Input
                        value={inlineNameInput}
                        onChange={(e) => setInlineNameInput(e.target.value)}
                        placeholder="z.B. Thomas, Wanderer, Klangsucher…"
                        className="rounded-none border-zinc-700 bg-zinc-900 text-white"
                        maxLength={64}
                      />
                      <p className="text-zinc-600 text-xs mt-1.5">
                        Wird bei deiner Frage angezeigt und für zukünftige Fragen gespeichert.
                      </p>
                    </div>
                  )}
                  <Textarea
                    value={neueFrageText}
                    onChange={(e) => setNeueFrageText(e.target.value)}
                    placeholder="Was möchtest du Thomas fragen?"
                    className="rounded-none border-zinc-700 bg-zinc-900 text-white mb-4 min-h-[120px]"
                    maxLength={2000}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => {
                        // Wenn kein Pseudonym gesetzt: erst speichern, dann Frage stellen
                        if (!pseudonym) {
                          if (inlineNameInput.trim().length < 2) {
                            toast.error("Bitte gib einen Namen oder ein Pseudonym ein (mind. 2 Zeichen).");
                            return;
                          }
                          setPseudonymMutation.mutate(
                            { pseudonym: inlineNameInput.trim() },
                            {
                              onSuccess: () => {
                                stelleFrageMutation.mutate({ frage: neueFrageText });
                              },
                            }
                          );
                        } else {
                          stelleFrageMutation.mutate({ frage: neueFrageText });
                        }
                      }}
                      disabled={
                        stelleFrageMutation.isPending ||
                        setPseudonymMutation.isPending ||
                        neueFrageText.length < 10 ||
                        (!pseudonym && inlineNameInput.trim().length < 2)
                      }
                      className="bg-orange-600 hover:bg-orange-500 rounded-none"
                    >
                      {(stelleFrageMutation.isPending || setPseudonymMutation.isPending) ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Frage senden
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => { setShowFrageForm(false); setInlineNameInput(""); }}
                      className="rounded-none border-zinc-700"
                    >
                      Abbrechen
                    </Button>
                  </div>
                </div>
              )}

              {fragenQuery.isLoading ? (
                <div className="flex items-center gap-3 text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Lade Fragen…</span>
                </div>
              ) : fragenQuery.data?.length === 0 ? (
                <div className="border border-zinc-800 p-12 text-center">
                  <MessageSquare className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">Noch keine Fragen. Sei der Erste!</p>
                </div>
              ) : (
                <div className="space-y-0 border border-zinc-800">
                  {fragenQuery.data?.map((frage) => (
                    <div key={frage.id} className="border-b border-zinc-800 last:border-b-0 p-6">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-6 h-6 bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <User className="w-3 h-3 text-zinc-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-orange-500 text-sm font-medium">
                              {frage.pseudonym}
                            </span>
                            <span className="text-zinc-600 text-xs font-mono">
                              {new Date(frage.createdAt).toLocaleDateString("de-DE")}
                            </span>
                          </div>
                          <p className="text-zinc-200 leading-relaxed">{frage.frage}</p>
                        </div>
                      </div>

                      {frage.antwort && (
                        <div className="ml-9 border-l-2 border-orange-600 pl-4 mt-4">
                          <div className="text-xs font-mono text-orange-500 uppercase tracking-widest mb-2">
                            Thomas antwortet
                          </div>
                          <RichTextDisplay html={frage.antwort ?? ""} className="text-sm" />
                          {frage.beantwortetAt && (
                            <span className="text-zinc-600 text-xs font-mono mt-2 block">
                              {new Date(frage.beantwortetAt).toLocaleDateString("de-DE")}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Admin: Inline-Antwort */}
                      {isAdmin && answeringFrageId === frage.id ? (
                        <div className="ml-9 mt-4 border-l-2 border-orange-600 pl-4">
                          <div className="text-xs font-mono text-orange-500 uppercase tracking-widest mb-2">
                            Deine Antwort
                          </div>
                          <RichTextEditor
                            value={inlineAntwortText}
                            onChange={(html) => setInlineAntwortText(html)}
                            placeholder="Schreibe deine Antwort…"
                            minHeight="120px"
                            className="mb-3"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => adminAntworte.mutate({ frageId: frage.id, antwort: inlineAntwortText })}
                              disabled={!inlineAntwortText.trim() || adminAntworte.isPending}
                              className="bg-orange-600 hover:bg-orange-500 text-white rounded-none h-8 text-xs"
                            >
                              {adminAntworte.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Speichern"}
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => { setAnsweringFrageId(null); setInlineAntwortText(""); }}
                              className="text-zinc-500 hover:text-white rounded-none h-8 text-xs"
                            >
                              Abbrechen
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          {!frage.antwort && (
                            <div className="ml-9 mt-3 flex items-center gap-3">
                              <span className="text-zinc-600 text-xs font-mono">
                                Noch nicht beantwortet
                              </span>
                              {isAdmin && (
                                <button
                                  onClick={() => { setAnsweringFrageId(frage.id); setInlineAntwortText(frage.antwort ?? ""); }}
                                  className="text-orange-500 text-xs font-mono hover:text-orange-400 underline underline-offset-2"
                                >
                                  Antworten
                                </button>
                              )}
                            </div>
                          )}
                          {frage.antwort && isAdmin && (
                            <div className="ml-9 mt-2">
                              <button
                                onClick={() => { setAnsweringFrageId(frage.id); setInlineAntwortText(frage.antwort ?? ""); }}
                                className="text-zinc-600 text-xs font-mono hover:text-orange-400 underline underline-offset-2"
                              >
                                Antwort bearbeiten
                              </button>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Wissenspool */}
          {activeTab === "wissenspool" && (
            <div>
              <div className="mb-8">
                <h2 className="font-bold text-xl">Wissenspool</h2>
                <p className="text-zinc-500 text-sm mt-1">
                  Kuratierte Ressourcen aus Thomas' Arbeit.
                </p>
              </div>

              {wissenspoolQuery.isLoading ? (
                <div className="flex items-center gap-3 text-zinc-500">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>Lade Wissenspool…</span>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-0 border border-zinc-800">
                  {/* BOLT-Podcast Card */}
                  <div className="border-r border-b border-zinc-800 p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-mono text-orange-500 uppercase tracking-widest border border-orange-900 px-2 py-0.5">
                        Podcast
                      </span>
                    </div>
                    <h3 className="font-bold mb-2 leading-tight">Der wahre Wert meiner Gesundheit</h3>
                    <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                      Verstehe die BOLTMESSUNG und starte danach im Trainingscenter mit deinen Auswertungen. Die Ergebnisse speicherst du täglich im Vitalmonitor ab.
                    </p>
                    <audio
                      controls
                      className="w-full mt-2"
                      src="https://files.manuscdn.com/user_upload_by_module/session_file/310519663036873684/JePJKOCZiSbQlcdH.mp3"
                    />
                  </div>

                  {wissenspoolQuery.data?.map((item) => (
                    <div
                      key={item.id}
                      className="border-r border-b border-zinc-800 p-6 last:border-r-0"
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xs font-mono text-orange-500 uppercase tracking-widest border border-orange-900 px-2 py-0.5">
                          {item.typ}
                        </span>
                      </div>
                      <h3 className="font-bold mb-2 leading-tight">{item.titel}</h3>
                      {item.beschreibung && (
                        <p className="text-zinc-400 text-sm leading-relaxed mb-4 line-clamp-3">
                          {item.beschreibung}
                        </p>
                      )}
                      {(item as any).audioUrl && (
                        <audio
                          controls
                          className="w-full mt-2"
                          src={(item as any).audioUrl}
                        />
                      )}
                      {item.url && !(item as any).audioUrl && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-orange-500 hover:text-orange-400 text-sm"
                        >
                          Öffnen <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          {/* Vital Monitor */}
          {activeTab === "vital" && (
            <div>
              {/* Admin-Button: VITALMONITOR bearbeiten */}
              {isAdmin && (
                <div className="flex justify-end mb-4">
                  <a
                    href="/admin/raum36"
                    className="flex items-center gap-2 text-xs text-orange-400 border border-orange-500/30 hover:border-orange-400/60 bg-orange-500/5 hover:bg-orange-500/10 px-3 py-1.5 rounded transition-colors"
                  >
                    <Settings className="w-3 h-3" />
                    VITALMONITOR bearbeiten
                  </a>
                </div>
              )}
              {isVitalUnlocked ? (
                <VitalDashboard onClose={() => setActiveTab("videos")} />
              ) : (
                <div className="border border-red-600/30 p-12 text-center">
                  <HeartPulse className="w-12 h-12 text-red-500/40 mx-auto mb-4" />
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                    <span className="text-orange-400 text-xs font-mono uppercase tracking-widest">Mitgliedschaft erforderlich</span>
                  </div>
                  <p className="text-zinc-500 text-sm">Der Vital Monitor ist exklusiv für RAUM 36 Mitglieder.</p>
                </div>
              )}
            </div>
          )}

          {/* KIICH PRAXIS */}
          {activeTab === "kiich-praxis" && (
            <KIICHPraxis onOpenVisionsraum={() => setKiichPraxisView("visionsraum")} />
          )}
          {activeTab === "kiich-praxis" && kiichPraxisView === "visionsraum" && (
            <div className="fixed inset-0 z-50 bg-zinc-950 overflow-y-auto">
              <Visionsraum onClose={() => setKiichPraxisView(null)} />
            </div>
          )}

          {/* Frequenz-Labor */}
          {activeTab === "frequenzlabor" && (
            <div>
              {flTrainerData ? (
                /* Direkt ins YOHNTRAINING wenn Farbe gewählt */
                <Method36Trainer
                  frequency={flTrainerData.freq}
                  toneName={flTrainerData.tone}
                  color={flTrainerData.color}
                  typeId={flTrainerData.typeId}
                  duration={7}
                  onClose={() => setFlTrainerData(null)}
                />
              ) : flShowScanner ? (
                /* Spektral-Scanner (Mikrofon-Analyse) */
                <SpectralScanner
                  onClose={() => setFlShowScanner(false)}
                  onStartTraining={(data) => {
                    setFlShowScanner(false);
                    setFlTrainerData(data);
                  }}
                />
              ) : (
                /* Übersicht: Auswahl zwischen Scanner und Farbmatrix */
                <div className="space-y-8">
                  <div className="text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-2">🔬 Frequenz-Labor</h2>
                    <p className="text-zinc-400 text-sm max-w-xl mx-auto">
                      Erforsche den Zusammenhang von Klang und Lichtfarbe. Analysiere deine Stimme oder wähle direkt eine Farbe – und steige dann ins YOHNTRAINING ein.
                    </p>
                  </div>

                  {/* Spektral-Scanner */}
                  <div className="border border-zinc-800 rounded-xl p-6 hover:border-orange-500/40 transition-colors cursor-pointer" onClick={() => setFlShowScanner(true)}>
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0">
                        <Mic className="w-6 h-6 text-orange-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-white font-semibold mb-1">Spektral-Scanner</h3>
                        <p className="text-zinc-400 text-sm">Summe einen Ton ins Mikrofon – die App erkennt deine Frequenz und zeigt dir die zugehörige Lichtfarbe. Danach kannst du direkt ins YOHNTRAINING wechseln.</p>
                        <Button size="sm" className="mt-4 bg-orange-600 hover:bg-orange-500 text-white" onClick={(e) => { e.stopPropagation(); setFlShowScanner(true); }}>
                          Scanner starten
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Farbmatrix */}
                  <div className="border border-zinc-800 rounded-xl p-6">
                    <div className="mb-4">
                      <h3 className="text-white font-semibold mb-1">Lichtklang-Matrix</h3>
                      <p className="text-zinc-400 text-sm">Wähle eine Farbe die du gerade brauchst – du hörst den zugehörigen Ton und kannst direkt ins YOHNTRAINING einsteigen.</p>
                    </div>
                    <ToneColorExplorer
                      onStartTraining={(data) => setFlTrainerData(data)}
                    />
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


    </div>
  );
}

// ─── Haupt-Komponente ────────────────────────────────────────────────────────

export default function Raum36() {
  const { isAuthenticated, loading, user } = useAuth();
  const [location] = useLocation();
  const isAdmin = user?.role === "admin";

  // Admin kann per ?preview=landing die öffentliche Landing-Page sehen
  const [previewLanding, setPreviewLanding] = React.useState(() => {
    return new URLSearchParams(window.location.search).get("preview") === "landing";
  });

  const statusQuery = trpc.raum36.getStatus.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  // Checkout-Ergebnis aus URL-Params auslesen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Willkommen im RAUM 36! Dein Abo ist aktiv.");
      // Nur checkout-Parameter entfernen, tab/kategorie/training behalten
      params.delete("checkout");
      const rest = params.toString();
      window.history.replaceState({}, "", rest ? `/raum36?${rest}` : "/raum36");
    } else if (params.get("checkout") === "cancelled") {
      toast.info("Checkout abgebrochen.");
      params.delete("checkout");
      const rest = params.toString();
      window.history.replaceState({}, "", rest ? `/raum36?${rest}` : "/raum36");
    }
  }, []);

  if (loading || (isAuthenticated && statusQuery.isLoading)) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  // Admin: Landing-Page-Vorschau
  if (isAdmin && previewLanding) {
    return (
      <div className="relative">
        {/* Admin-Banner oben */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-orange-600 text-white text-xs font-mono uppercase tracking-widest px-4 py-2 flex items-center justify-between">
          <span>⚙ Admin-Vorschau: Öffentliche Landing-Page</span>
          <button
            onClick={() => {
              setPreviewLanding(false);
              window.history.replaceState({}, "", "/raum36");
            }}
            className="underline hover:no-underline"
          >
            → Zum Mitglieder-Bereich
          </button>
        </div>
        <div className="pt-8">
          <Raum36Landing />
        </div>
      </div>
    );
  }

  // Mitglied (oder Admin) → Member-Bereich mit Admin-Link zur Landing-Vorschau
  if (isAuthenticated && (statusQuery.data?.isActive || isAdmin)) {
    return (
      <div className="relative">
        {isAdmin && (
          <div className="fixed top-0 left-0 right-0 z-50 bg-zinc-900 border-b border-zinc-700 text-xs font-mono uppercase tracking-widest px-4 py-2 flex items-center justify-between">
            <span className="text-zinc-500">⚙ Admin-Ansicht</span>
            <button
              onClick={() => {
                setPreviewLanding(true);
                window.history.replaceState({}, "", "/raum36?preview=landing");
              }}
              className="text-orange-500 hover:text-orange-400 underline hover:no-underline"
            >
              → Landing-Page ansehen
            </button>
          </div>
        )}
        <div className={isAdmin ? "pt-8" : ""}>
          <Raum36Member />
        </div>
      </div>
    );
  }

  // Nicht eingeloggt oder kein Abo → Landing-Page
  return <Raum36Landing />;
}
