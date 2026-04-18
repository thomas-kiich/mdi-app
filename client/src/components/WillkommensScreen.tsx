import { useState } from "react";
import { getLoginUrl } from "@/const";
import { Shield, Lock, Zap, Users, ChevronDown, ChevronUp, ExternalLink } from "lucide-react";

interface WillkommensScreenProps {
  onConsentGiven?: () => void;
}

export function WillkommensScreen({ onConsentGiven }: WillkommensScreenProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showManusGuide, setShowManusGuide] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);

  const handleLogin = () => {
    if (!consentGiven) {
      // Kurz aufleuchten lassen
      const el = document.getElementById("dsgvo-checkbox");
      if (el) {
        el.classList.add("ring-2", "ring-orange-500");
        setTimeout(() => el.classList.remove("ring-2", "ring-orange-500"), 1500);
      }
      return;
    }
    // Consent in localStorage speichern
    localStorage.setItem("kiich_dsgvo_consent", new Date().toISOString());
    if (onConsentGiven) onConsentGiven();
    window.location.href = getLoginUrl();
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start px-4 py-12 md:py-20">

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo-slogan-new_9c02a622.png"
          alt="KIICH – 2 minds い 1 source"
          className="w-[260px] md:w-[340px] h-auto"
        />
        <p className="text-zinc-400 text-sm tracking-widest uppercase text-center">
          Dein Identitätssystem für das KI-Zeitalter
        </p>
      </div>

      {/* Trennlinie orange */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 mb-8" />

      {/* Headline */}
      <div className="max-w-xl w-full text-center mb-10">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
          Willkommen bei KIICH
        </h1>
        <p className="text-zinc-400 text-base leading-relaxed">
          Für die Nutzung aller KIICH-Tools benötigst du einen <span className="text-amber-400 font-semibold">kostenlosen Manus-Account</span> — 
          in 30 Sekunden erstellt, kein Kreditkarte nötig.
        </p>
      </div>

      {/* Benefits-Grid */}
      <div className="max-w-xl w-full grid grid-cols-2 gap-3 mb-8">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">Maximaler Datenschutz</p>
            <p className="text-zinc-500 text-xs leading-relaxed">Keine KIICH-eigene Passwort-Speicherung. Deine Zugangsdaten bleiben ausschließlich bei Manus.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-5 h-5 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">Kein Passwort-Risiko</p>
            <p className="text-zinc-500 text-xs leading-relaxed">Kein separates KIICH-Passwort das vergessen oder gestohlen werden kann.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">Kostenlos & sofort</p>
            <p className="text-zinc-500 text-xs leading-relaxed">Manus-Account ist kostenlos. Zugang zu KIICH ist sofort nach der Registrierung aktiv.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Users className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-sm font-semibold mb-0.5">KI-Plattform inklusive</p>
            <p className="text-zinc-500 text-xs leading-relaxed">Mit deinem Manus-Account erhältst du gleichzeitig Zugang zu einer der leistungsfähigsten KI-Plattformen.</p>
          </div>
        </div>
      </div>

      {/* Manus-Kurzanleitung (ausklappbar) */}
      <div className="max-w-xl w-full mb-6">
        <button
          onClick={() => setShowManusGuide(!showManusGuide)}
          className="w-full flex items-center justify-between px-5 py-3 bg-zinc-900/80 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white hover:border-amber-500/50 transition-all"
        >
          <span className="font-semibold tracking-wide">📖 Wie erstelle ich einen kostenlosen Manus-Account?</span>
          {showManusGuide ? <ChevronUp className="w-4 h-4 text-amber-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showManusGuide && (
          <div className="mt-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 text-xs font-bold">1</div>
              <div>
                <p className="text-white text-sm font-medium">Klicke auf „JETZT KOSTENLOS STARTEN"</p>
                <p className="text-zinc-500 text-xs mt-0.5">Du wirst zur Manus-Registrierungsseite weitergeleitet.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 text-xs font-bold">2</div>
              <div>
                <p className="text-white text-sm font-medium">E-Mail-Adresse eingeben</p>
                <p className="text-zinc-500 text-xs mt-0.5">Keine Kreditkarte, kein Abo — nur deine E-Mail-Adresse.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center shrink-0 text-amber-400 text-xs font-bold">3</div>
              <div>
                <p className="text-white text-sm font-medium">Bestätigungs-E-Mail öffnen & klicken</p>
                <p className="text-zinc-500 text-xs mt-0.5">Manus sendet dir einen Bestätigungslink — einmal klicken, fertig.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-green-500/20 border border-green-500/40 flex items-center justify-center shrink-0 text-green-400 text-xs font-bold">✓</div>
              <div>
                <p className="text-white text-sm font-medium">Automatisch zurück zu KIICH</p>
                <p className="text-zinc-500 text-xs mt-0.5">Nach der Registrierung wirst du automatisch zu KIICH zurückgeleitet und kannst sofort loslegen.</p>
              </div>
            </div>
            <div className="pt-2 border-t border-zinc-800">
              <a
                href="https://manus.im"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-amber-400/70 hover:text-amber-400 transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                Mehr über Manus erfahren: manus.im
              </a>
            </div>
          </div>
        )}
      </div>

      {/* DSGVO Consent */}
      <div className="max-w-xl w-full mb-8">
        <button
          onClick={() => setShowDsgvo(!showDsgvo)}
          className="w-full flex items-center justify-between px-5 py-3 bg-zinc-900/80 border border-zinc-700 rounded-xl text-sm text-zinc-300 hover:text-white hover:border-zinc-500 transition-all mb-2"
        >
          <span className="font-semibold tracking-wide">🔒 Datenschutz & Einwilligung</span>
          {showDsgvo ? <ChevronUp className="w-4 h-4 text-zinc-400" /> : <ChevronDown className="w-4 h-4 text-zinc-500" />}
        </button>

        {showDsgvo && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-3 text-xs text-zinc-400 leading-relaxed space-y-2">
            <p className="text-zinc-300 font-semibold">Was wir speichern und warum:</p>
            <p>KIICH speichert deine <strong className="text-zinc-200">Sprachaufnahmen</strong> (für die Stimmklang-Analyse), <strong className="text-zinc-200">Reflexionstexte</strong> (für MA-Zusammenfassungen) und <strong className="text-zinc-200">Stimmungsdaten</strong> (für deinen persönlichen Verlauf).</p>
            <p>Alle Daten werden ausschließlich für die Bereitstellung der KIICH-Funktionen verwendet — kein Verkauf, keine Weitergabe an Dritte.</p>
            <p>Du kannst deine Daten jederzeit löschen (Einstellungen → Datenlöschung). Verantwortlich: Thomas Chochola · KIICH – Plattform für Persönlichkeitsentfaltung · Deutschland.</p>
            <p>
              <a href="/datenschutz" className="text-blue-400 hover:text-blue-300 underline">Vollständige Datenschutzerklärung →</a>
            </p>
          </div>
        )}

        {/* Checkbox */}
        <label
          id="dsgvo-checkbox"
          className="flex items-start gap-3 cursor-pointer group px-4 py-3 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all"
          onClick={() => setConsentGiven(!consentGiven)}
        >
          <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${consentGiven ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
            {consentGiven && (
              <svg className="w-3 h-3 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-sm text-zinc-400 group-hover:text-zinc-300 leading-relaxed transition-colors">
            Ich habe die <a href="/datenschutz" className="text-blue-400 hover:text-blue-300 underline" onClick={e => e.stopPropagation()}>Datenschutzerklärung</a> gelesen und stimme der Verarbeitung meiner Daten für die Nutzung von KIICH zu. Diese Einwilligung kann ich jederzeit widerrufen.
          </span>
        </label>
      </div>

      {/* CTA Button */}
      <div className="max-w-xl w-full">
        <button
          onClick={handleLogin}
          className={`w-full py-4 text-base font-black tracking-widest uppercase rounded-xl transition-all duration-200 ${
            consentGiven
              ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-orange-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
          }`}
        >
          {consentGiven ? 'Jetzt kostenlos starten →' : 'Bitte Datenschutz bestätigen'}
        </button>
        <p className="text-center text-xs text-zinc-600 mt-3">
          Bereits registriert? Der Button führt dich direkt zum Login.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-xs text-zinc-700 space-y-1">
        <p>KIICH – Plattform für Persönlichkeitsentfaltung · Thomas Chochola</p>
        <div className="flex justify-center gap-4">
          <a href="/impressum" className="text-blue-500/60 hover:text-blue-400 transition-colors">Impressum</a>
          <a href="/datenschutz" className="text-blue-500/60 hover:text-blue-400 transition-colors">Datenschutz</a>
        </div>
      </div>

    </div>
  );
}
