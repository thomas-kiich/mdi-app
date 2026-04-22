/**
 * Abo-Seite – /abo
 * Zeigt die vier KIICH-Pläne (Free / Essential / Complete / Pro),
 * den aktuellen Abo-Status, Trial-Countdown und Beta-Code-Einlösung.
 * Stripe-Integration wird nach Kontoeinrichtung aktiviert.
 */

import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Check, Clock, Sparkles, ArrowLeft, Loader2, Gift, Crown, Zap, Star, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { useState } from "react";

const PLAN_COLORS: Record<string, { border: string; bg: string; badge: string; btn: string; icon: string }> = {
  free:      { border: "border-white/10",        bg: "bg-white/[0.02]",      badge: "bg-white/10 text-white/50",           btn: "bg-white/10 text-white/40",              icon: "text-white/30" },
  essential: { border: "border-violet-500/40",   bg: "bg-violet-500/5",      badge: "bg-violet-500/20 text-violet-300",    btn: "bg-violet-600 hover:bg-violet-500 text-white", icon: "text-violet-400" },
  complete:  { border: "border-amber-400/50",    bg: "bg-amber-400/5",       badge: "bg-amber-400/20 text-amber-300",      btn: "bg-amber-400 hover:bg-amber-300 text-black font-bold", icon: "text-amber-400" },
  pro:       { border: "border-purple-500/40",   bg: "bg-purple-500/5",      badge: "bg-purple-500/20 text-purple-300",    btn: "bg-purple-600 hover:bg-purple-500 text-white", icon: "text-purple-400" },
};

const PLAN_ICONS: Record<string, React.ReactNode> = {
  free:      <Zap className="w-5 h-5 text-white/30" />,
  essential: <Star className="w-5 h-5 text-violet-400" />,
  complete:  <Sparkles className="w-5 h-5 text-amber-400" />,
  pro:       <Crown className="w-5 h-5 text-purple-400" />,
};

export default function Abo() {
  const [betaCode, setBetaCode] = useState("");
  const [betaLoading, setBetaLoading] = useState(false);

  const { data, isLoading, refetch } = trpc.abo.getLimitInfo.useQuery(undefined, {
    staleTime: 30 * 1000,
  });
  const { data: plaene } = trpc.abo.plaene.useQuery();

  const betaEinloesen = trpc.abo.betaCodeEinloesen.useMutation({
    onSuccess: (result) => {
      toast.success(
        `🎉 Beta-Zugang aktiviert! Gültig bis ${new Date(result.betaEndsAt).toLocaleDateString("de-DE")}.`,
        { duration: 6000 }
      );
      setBetaCode("");
      refetch();
    },
    onError: (err) => {
      toast.error(err.message ?? "Beta-Code konnte nicht eingelöst werden.");
    },
  });

  const handleBetaEinloesen = async () => {
    if (!betaCode.trim()) return;
    setBetaLoading(true);
    try {
      await betaEinloesen.mutateAsync({ code: betaCode.trim() });
    } finally {
      setBetaLoading(false);
    }
  };

  const handleUpgrade = (planName: string) => {
    toast.info(
      `Stripe-Zahlung wird in Kürze freigeschaltet. Für den ${planName}-Plan melde dich bitte direkt bei thomas@kiich.de.`,
      { duration: 6000 }
    );
  };

  const aboInfo = data?.aboInfo;
  const limitInfo = data?.limitInfo;

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">

      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <button
          onClick={() => window.history.back()}
          className="text-amber-400 font-bold text-lg cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" /> Zurück
        </button>
        <span className="text-white/40 text-sm">Abonnement & Pläne</span>
      </div>

      {/* Launch-Banner */}
      <div className="relative overflow-hidden" style={{background: 'linear-gradient(135deg, rgba(124,58,237,0.18) 0%, rgba(245,166,35,0.12) 100%)', borderBottom: '1px solid rgba(124,58,237,0.25)'}}>
        <div className="max-w-5xl mx-auto px-4 py-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{background: 'linear-gradient(135deg, #7c3aed, #a855f7)'}}>
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse"></span>
                <span className="text-violet-300 text-xs font-bold tracking-widest uppercase">Beta-Launch · 17. April 2026</span>
              </div>
              <p className="text-white/70 text-sm">
                KIICH startet offiziell. Alle Beta-Nutzer erhalten <span className="text-emerald-300 font-semibold">60 Tage Complete-Zugang kostenlos</span>.
              </p>
            </div>
          </div>
          <div className="text-center shrink-0">
            <p className="text-white/40 text-xs mb-1">Du hast einen Beta-Code?</p>
            <button
              onClick={() => document.getElementById('beta-code-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="text-emerald-400 hover:text-emerald-300 text-sm font-semibold underline underline-offset-4 transition-colors"
            >
              Jetzt einlösen ↓
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-12">

        {/* Titel */}
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Wähle deinen Weg</h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-md mx-auto">
            7 Tage voller Zugang zum Kennenlernen — danach wählst du die Ebene,
            die zu deinem Leben passt.
          </p>
        </div>

        {/* Aktueller Status */}
        {isLoading ? (
          <div className="flex justify-center mb-8">
            <Loader2 className="w-5 h-5 animate-spin text-white/30" />
          </div>
        ) : aboInfo ? (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              {aboInfo.status === "trial" && aboInfo.trialTageVerbleibend !== null ? (
                <p className="text-white/80 text-sm">
                  <span className="text-amber-400 font-semibold">Testzugang aktiv</span>
                  {" — "}noch{" "}
                  <span className="font-semibold">
                    {aboInfo.trialTageVerbleibend === 0
                      ? "weniger als 1 Tag"
                      : `${aboInfo.trialTageVerbleibend} ${aboInfo.trialTageVerbleibend === 1 ? "Tag" : "Tage"}`}
                  </span>{" "}
                  verbleibend
                </p>
              ) : aboInfo.status === "beta" ? (
                <p className="text-emerald-300 text-sm font-semibold">
                  🎁 Beta-Zugang aktiv — Complete-Funktionen freigeschaltet
                </p>
              ) : aboInfo.status === "expired" ? (
                <p className="text-red-400 text-sm font-semibold">
                  Testzugang abgelaufen — wähle ein Abo um fortzufahren.
                </p>
              ) : (
                <p className="text-white/80 text-sm">
                  Aktiver Plan:{" "}
                  <span className="text-amber-400 font-semibold capitalize">{aboInfo.ebene}</span>
                  {" — "}Status:{" "}
                  <span className="font-semibold">{aboInfo.status}</span>
                </p>
              )}
              {limitInfo && (
                <p className="text-white/40 text-xs mt-0.5">
                  Aufnahmen diesen Monat: {limitInfo.aufnahmenCount}
                  {limitInfo.aufnahmenLimit < 999999 && ` / ${limitInfo.aufnahmenLimit}`}
                  {" · "}TTS: {limitInfo.ttsCount}
                  {limitInfo.ttsLimit < 999999 && ` / ${limitInfo.ttsLimit}`}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Plan-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
          {(plaene ?? []).map((plan) => {
            const istAktiv = aboInfo?.status === "active" && aboInfo?.ebene === plan.id;
            const istHighlight = plan.highlight;
            const colors = PLAN_COLORS[plan.id] ?? PLAN_COLORS.free;

            return (
              <div
                key={plan.id}
                className={`relative border rounded-2xl p-5 flex flex-col transition-all duration-300 ${colors.border} ${colors.bg} ${istHighlight ? "scale-[1.03] shadow-lg shadow-amber-400/10" : ""}`}
              >
                {istHighlight && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full shadow-md">
                      EMPFOHLEN
                    </span>
                  </div>
                )}
                {istAktiv && (
                  <div className="absolute -top-3.5 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      AKTIV
                    </span>
                  </div>
                )}

                <div className="mb-4 mt-1">
                  <div className="flex items-center gap-2 mb-2">
                    {PLAN_ICONS[plan.id]}
                    <h3 className="text-white font-bold text-lg">{plan.name}</h3>
                  </div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-2xl font-bold text-white">{plan.preisText}</span>
                  </div>
                  <p className="text-white/40 text-xs">{plan.beschreibung}</p>
                </div>

                <ul className="space-y-2.5 flex-1 mb-5">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      <span className="text-white/70">{f}</span>
                    </li>
                  ))}
                </ul>

                {plan.preis === 0 ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 text-white/40 cursor-default bg-transparent"
                    disabled
                  >
                    Kostenlos — immer
                  </Button>
                ) : istAktiv ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-500/30 text-green-400 bg-transparent"
                    disabled
                  >
                    Aktueller Plan
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={`w-full ${colors.btn}`}
                    onClick={() => handleUpgrade(plan.name)}
                  >
                    {plan.cta}
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Beta-Code-Einlösung – prominent */}
        <div id="beta-code-section" className="max-w-lg mx-auto mb-12">
          <div className="relative border border-emerald-500/30 rounded-2xl p-7 overflow-hidden" style={{background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(5,150,105,0.05) 100%)'}}>
            {/* Dekoratives Element */}
            <div className="absolute top-0 right-0 w-32 h-32 opacity-5" style={{background: 'radial-gradient(circle, #10b981, transparent 70%)'}} />
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                <Gift className="w-5 h-5 text-emerald-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-emerald-300">Beta-Einladungscode einlösen</h2>
                <p className="text-emerald-400/60 text-xs">60 Tage Complete-Zugang · Kostenlos</p>
              </div>
            </div>
            <p className="text-sm text-white/50 mb-5 leading-relaxed">
              Du hast einen persönlichen Beta-Einladungscode erhalten? Gib ihn hier ein und starte sofort mit dem vollen KIICH-Erlebnis — ohne Kreditkarte.
            </p>
            <div className="flex gap-2">
              <Input
                value={betaCode}
                onChange={(e) => setBetaCode(e.target.value.toUpperCase())}
                placeholder="KIICH-BETA-XXXX"
                className="bg-white/5 border-emerald-500/20 text-white placeholder:text-white/20 font-mono text-sm focus:border-emerald-400/50"
                onKeyDown={(e) => e.key === "Enter" && handleBetaEinloesen()}
              />
              <Button
                onClick={handleBetaEinloesen}
                disabled={!betaCode.trim() || betaLoading}
                className="bg-emerald-600 hover:bg-emerald-500 text-white shrink-0 font-semibold px-5"
              >
                {betaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Einlösen"}
              </Button>
            </div>
            <p className="text-white/25 text-xs mt-3 text-center">
              Noch kein Code? Schreib uns: <a href="mailto:thomas@kiich.de" className="text-emerald-400/60 hover:text-emerald-400 underline transition-colors">thomas@kiich.de</a>
            </p>
          </div>
        </div>

        {/* Hinweis */}
        <div className="text-center text-white/30 text-xs leading-relaxed space-y-1">
          <p>Alle Preise inkl. 19% MwSt. · Monatlich kündbar · Keine versteckten Kosten</p>
          <p>
            Fragen?{" "}
            <a href="mailto:thomas@kiich.de" className="text-amber-400/60 hover:text-amber-400 transition-colors underline">
              thomas@kiich.de
            </a>
          </p>
          <p className="text-white/20 pt-1">
            Stripe-Zahlung wird in Kürze freigeschaltet. Bis dahin bitte direkt per E-Mail melden.
          </p>
        </div>
      </div>
    </div>
  );
}
