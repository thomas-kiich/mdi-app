/**
 * RAUM 36 – Exklusiver Mitglieder-Bereich
 *
 * Öffentlicher Teil: Landing-Page mit Abo-CTA (€4,90/Monat)
 * Mitglieder-Bereich: Wochenvideos, Fragen an Thomas, Wissenspool
 */

import { useState, useEffect } from "react";
import React from "react";
import { Link, useLocation } from "wouter";
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
  ArrowRight,
  HeartPulse,
  Activity,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { VitalDashboard } from "@/components/VitalDashboard";
import StimmklangPage from "@/pages/Stimmklanganalyse";
import { AnalysisHistory } from "@/components/AnalysisHistory";

// ─── Öffentliche Landing-Page ───────────────────────────────────────────────

function Raum36Landing() {
  const { isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

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
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Eröffnung am 14. Mai 2026 – bis dahin kein Checkout
  const EROEFFNUNG = new Date("2026-05-14T00:00:00");
  const isBeforeEroeffnung = new Date() < EROEFFNUNG;

  const handleJoin = () => {
    if (isBeforeEroeffnung) {
      toast.info("RAUM 36 öffnet am 14. Mai 2026. Wir freuen uns auf dich!");
      return;
    }
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/raum36");
      return;
    }
    checkoutMutation.mutate({ origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-black text-white">

      {/* Navigation */}
      <div className="px-6 pt-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 hover:text-orange-500 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Startseite
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-zinc-800 px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block border border-orange-600 px-3 py-1 text-xs font-mono text-orange-500 mb-8 uppercase tracking-widest">
            Exklusiver Mitglieder-Bereich
          </div>
          <h1 className="text-4xl md:text-6xl font-semibold tracking-tight leading-none mb-6">
            RAUM 36
          </h1>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed mb-10">
            Der direkte Kanal zu Thomas Chochola
          </p>

          {/* 5 Leistungsversprechen */}
          <ul className="space-y-4 mb-12 max-w-2xl">
            {[
              "Stelle deine persönlichen Fragen an Thomas (auch mit Pseudonym möglich).",
              "Erhalte detailgenaue Trainingsanleitungen zu allen Bereichen der METHODE 36.",
              "Erhalte Zugang zu den besten Trainingstools wie YOHNATMUNG | VITALMONITOR und dem erweiterten WISSENSPOOL.",
              "Tausche kontinuierlich Informationen aus, wie du KI mit Vorsicht und Überblick für dein Leben nützen kannst.",
              "Profitiere von der sich aufbauenden Gruppendynamik und deren Lebenserfahrung.",
            ].map((text, i) => (
              <li key={i} className="flex items-start gap-4">
                <span className="w-5 h-5 mt-0.5 flex-shrink-0 border border-orange-600 flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-orange-500" />
                </span>
                <span className="text-zinc-300 leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>

          {/* CTA */}
          <div className="space-y-4">
            {/* Eröffnungs-Badge */}
            <div className="inline-flex items-center gap-3 border border-orange-600/40 bg-orange-600/10 px-5 py-3">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-xs font-mono uppercase tracking-widest">
                Eröffnung · 14. Mai 2026
              </span>
            </div>
            <div>
              <Button
                onClick={handleJoin}
                disabled={checkoutMutation.isPending}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-10 py-6 h-auto rounded-none border-0 uppercase tracking-wide"
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                JETZT MITGLIED WERDEN
              </Button>
              <p className="text-zinc-500 text-sm mt-3">
                Werteausgleich: € 4,90 pro Monat · jederzeit kündbar
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Feature-Bereiche */}
      <section className="px-6 py-20 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="grid md:grid-cols-2 gap-0 border border-zinc-800">
            {[
              {
                icon: <Video className="w-7 h-7 text-orange-500" />,
                title: "ERKLÄRVIDEOS",
                desc: "Thomas führt dich detailgenau und anschaulich durch das umfangreiche System der METHODE 36.",
              },
              {
                icon: <MessageSquare className="w-7 h-7 text-orange-500" />,
                title: "PERSÖNLICHES FEEDBACK",
                desc: "Thomas steht dir für deine Fragen zur Verfügung. Du kannst auch anonym im Gruppenprozess teilhaben.",
              },
              {
                icon: <BookOpen className="w-7 h-7 text-orange-500" />,
                title: "WISSENSPOOL",
                desc: "Du erhältst weiterführende Informationen zu den im Hörbuch angesprochenen Themen mit Quellenangaben und Detailschärfe.",
              },
              {
                icon: <Lightbulb className="w-7 h-7 text-orange-500" />,
                title: "KIICH PRAXIS",
                desc: "Thomas zeigt dir, wie er selbst den ethischen Dialog mit Künstlicher Intelligenz führt. Du kannst deine Ideen, Bedenken und Interessen persönlich formulieren und reflektieren.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className="p-8 border-r border-b border-zinc-800 last:border-b-0 md:odd:border-r md:even:border-r-0"
              >
                <div className="mb-5">{item.icon}</div>
                <h3 className="font-semibold text-base mb-3 tracking-widest text-zinc-200">{item.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
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
                <div className="flex items-center gap-3 border border-orange-600/40 bg-orange-600/10 px-4 py-3 mb-4 w-fit">
                  <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-orange-400 text-xs font-mono uppercase tracking-widest">
                    Verfügbar ab · 14. Mai 2026
                  </span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={() => toast.info("Die Stimmklanganalyse ist ab 14. Mai 2026 in RAUM 36 buchbar.")}
                    className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold py-3 h-auto rounded-none uppercase tracking-wide border border-zinc-600"
                  >
                    <Lock className="w-4 h-4 mr-2" />
                    Ab 14. Mai buchbar
                  </Button>
                  <Button
                    onClick={() => setShowVoranmeldung(true)}
                    className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-400 font-semibold py-3 h-auto rounded-none uppercase tracking-wide border border-orange-600/40"
                  >
                    <Mic className="w-4 h-4 mr-2" />
                    Voranmeldung
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>



      {/* Mitgliedschaft */}
      <section className="px-6 py-20 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="border border-zinc-700 p-8 md:p-12 max-w-lg">
            <div className="text-orange-500 text-sm font-mono uppercase tracking-widest mb-4">
              Mitgliedschaft
            </div>
            <div className="flex items-baseline gap-2 mb-1">
              <span className="text-2xl font-medium text-white">€ 4,90</span>
              <span className="text-zinc-500 text-sm">/ Monat</span>
            </div>
            <div className="text-zinc-500 text-xs mb-8">Jederzeit kündbar</div>
            <ul className="space-y-3 mb-10">
              {[
                "Persönliche Fragen an Thomas stellen",
                "Zugang zu allen Erklärvideos",
                "Wissenspool mit Quellenangaben",
                "KIICH Praxis – ethischer KI-Dialog",
                "Pseudonym für anonyme Teilnahme möglich",
                "Alle zukünftigen Inhalte inklusive",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
            {/* Eröffnungs-Badge */}
            <div className="flex items-center gap-3 border border-orange-600/40 bg-orange-600/10 px-4 py-3 mb-4">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span className="text-orange-400 text-xs font-mono uppercase tracking-widest">
                Eröffnung · 14. Mai 2026
              </span>
            </div>
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
type Tab = "videos" | "fragen" | "wissenspool" | "vital";

// Freischaltungsdatum für neue Features (Vital Monitor)
const FEATURE_UNLOCK = new Date("2026-05-14T00:00:00");

function Raum36Member() {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";
  const [activeTab, setActiveTab] = useState<Tab>("videos");
  const [neueFrageText, setNeueFrageText] = useState("");
  const [showFrageForm, setShowFrageForm] = useState(false);
  const [pseudonymInput, setPseudonymInput] = useState("");
  const [showPseudonymForm, setShowPseudonymForm] = useState(false);

  const statusQuery = trpc.raum36.getStatus.useQuery();
  // Vital Monitor ist für alle aktiven RAUM 36 Mitglieder zugänglich (kein separater Kauf nötig)
  const isVitalUnlocked = isAdmin || statusQuery.data?.isActive === true;
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
      setShowFrageForm(false);
      utils.raum36.getFragen.invalidate();
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

      {/* Tabs */}
      <div className="border-b border-zinc-800 px-6">
        <div className="max-w-4xl mx-auto flex">
          {(
            [
              { id: "videos", label: "Wochenvideos", icon: <Video className="w-4 h-4" /> },
              { id: "fragen", label: "Fragen", icon: <MessageSquare className="w-4 h-4" /> },
              { id: "wissenspool", label: "Wissenspool", icon: <Lightbulb className="w-4 h-4" /> },
              { id: "vital", label: "Vital Monitor", icon: <HeartPulse className="w-4 h-4" /> },
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
          {/* Wochenvideos */}
          {activeTab === "videos" && (
            <div>
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
                    onClick={() => {
                      if (!pseudonym) {
                        toast.error("Bitte zuerst ein Pseudonym wählen.");
                        setShowPseudonymForm(true);
                        return;
                      }
                      setShowFrageForm(true);
                    }}
                    className="bg-orange-600 hover:bg-orange-500 rounded-none"
                  >
                    Frage stellen
                  </Button>
                )}
              </div>

              {showFrageForm && (
                <div className="border border-zinc-700 p-6 mb-8">
                  <h3 className="font-bold mb-4">Neue Frage</h3>
                  <Textarea
                    value={neueFrageText}
                    onChange={(e) => setNeueFrageText(e.target.value)}
                    placeholder="Was möchtest du Thomas fragen?"
                    className="rounded-none border-zinc-700 bg-zinc-900 text-white mb-4 min-h-[120px]"
                    maxLength={2000}
                  />
                  <div className="flex gap-3">
                    <Button
                      onClick={() => stelleFrageMutation.mutate({ frage: neueFrageText })}
                      disabled={stelleFrageMutation.isPending || neueFrageText.length < 10}
                      className="bg-orange-600 hover:bg-orange-500 rounded-none"
                    >
                      {stelleFrageMutation.isPending ? (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      ) : null}
                      Frage senden
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setShowFrageForm(false)}
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
                          <p className="text-zinc-300 leading-relaxed text-sm">{frage.antwort}</p>
                          {frage.beantwortetAt && (
                            <span className="text-zinc-600 text-xs font-mono mt-2 block">
                              {new Date(frage.beantwortetAt).toLocaleDateString("de-DE")}
                            </span>
                          )}
                        </div>
                      )}

                      {!frage.antwort && (
                        <div className="ml-9 mt-3">
                          <span className="text-zinc-600 text-xs font-mono">
                            Noch nicht beantwortet
                          </span>
                        </div>
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
              ) : wissenspoolQuery.data?.length === 0 ? (
                <div className="border border-zinc-800 p-12 text-center">
                  <BookOpen className="w-10 h-10 text-zinc-700 mx-auto mb-4" />
                  <p className="text-zinc-500">Der Wissenspool wird gerade befüllt.</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-0 border border-zinc-800">
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
                      {item.url && (
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
              {isVitalUnlocked ? (
                <VitalDashboard onClose={() => setActiveTab("videos")} />
              ) : (
                <div className="border border-red-600/30 p-12 text-center">
                  <HeartPulse className="w-12 h-12 text-red-500/40 mx-auto mb-4" />
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <span className="text-red-400 text-xs font-mono uppercase tracking-widest">Verfügbar ab · 14. Mai 2026</span>
                  </div>
                  <p className="text-zinc-500 text-sm">Der Vital Monitor öffnet am 14. Mai 2026.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ─── Stimmklanganalyse – Separater Bereich (nur nach Kauf) ────────────────────── */}
      <div className="border-t border-zinc-800 mt-8">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center gap-3 mb-6">
            <Mic className="w-5 h-5 text-orange-500" />
            <h2 className="text-lg font-semibold tracking-widest uppercase text-zinc-200">Stimmklanganalyse</h2>
            <span className="text-xs font-mono text-zinc-600 uppercase tracking-widest">· Persönliche Buchung</span>
          </div>
          {statusQuery.data?.hasStimmklangAccess || isAdmin ? (
            <>
              <StimmklangPage embedded={true} params={{}} />
              <div className="mt-8 border-t border-zinc-800 pt-8">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-4 h-4 text-orange-500" />
                  <h3 className="text-sm font-semibold tracking-widest uppercase text-zinc-400">Deine bisherigen Analysen</h3>
                </div>
                <AnalysisHistory />
              </div>
            </>
          ) : (
            <div className="border border-zinc-800 bg-zinc-900/40 p-8 flex flex-col sm:flex-row items-start gap-6">
              <div className="w-12 h-12 bg-orange-600/10 flex items-center justify-center text-orange-500 flex-shrink-0">
                <Mic className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="text-zinc-300 text-sm leading-relaxed mb-4">
                  Die Stimmklanganalyse ist eine einmalige persönliche Buchung (€ 150) – unabhängig von der Mitgliedschaft.
                  Nach der Buchung erhältst du hier direkten Zugang.
                </p>
                <a
                  href="/stimmklanganalyse"
                  className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-500 text-white text-sm font-bold px-5 py-3 uppercase tracking-wide transition-colors"
                >
                  Zur Buchungsseite
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>
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
      window.history.replaceState({}, "", "/raum36");
    } else if (params.get("checkout") === "cancelled") {
      toast.info("Checkout abgebrochen.");
      window.history.replaceState({}, "", "/raum36");
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
  if (isAuthenticated && statusQuery.data?.isActive) {
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
