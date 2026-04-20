import { useState } from "react";
import { getLoginUrl } from "@/const";
import { Shield, Lock, Zap, Users, ChevronDown, ChevronUp, Play } from "lucide-react";

interface WillkommensScreenProps {
  onConsentGiven?: () => void;
}

export function WillkommensScreen({ onConsentGiven }: WillkommensScreenProps) {
  const [consentGiven, setConsentGiven] = useState(false);
  const [showDsgvo, setShowDsgvo] = useState(false);
  const [showVideo, setShowVideo] = useState(false);

  // ?ref= Parameter aus der URL auslesen (Einladungslink)
  // Fallback: Thomas' persönlicher Code wird immer mitgegeben wenn kein anderer Code in der URL ist
  const OWNER_REF_CODE = "U3RMEFRZ";
  const refCode = new URLSearchParams(window.location.search).get("ref") ?? OWNER_REF_CODE;

  const handleLogin = () => {
    if (!consentGiven) {
      const el = document.getElementById("dsgvo-checkbox");
      if (el) {
        el.classList.add("ring-2", "ring-orange-500");
        setTimeout(() => el.classList.remove("ring-2", "ring-orange-500"), 1500);
      }
      return;
    }
    localStorage.setItem("kiich_dsgvo_consent", new Date().toISOString());
    if (onConsentGiven) onConsentGiven();
    // refCode mitgeben falls vorhanden (Einladungslink-Tracking)
    window.location.href = getLoginUrl(refCode);
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-start px-5 py-10 md:py-20">

      {/* Logo */}
      <div className="mb-8 flex flex-col items-center gap-2">
        <img
          src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo-slogan-new_9c02a622.png"
          alt="KIICH – 2 minds い 1 source"
          className="w-[240px] sm:w-[300px] md:w-[340px] h-auto"
        />
        <div className="text-zinc-400 text-sm tracking-widest uppercase text-center leading-relaxed">
          <p>Die Plattform</p>
          <p>für deine Persönlichkeitsentfaltung</p>
          <p>im KI-Zeitalter</p>
        </div>
      </div>

      {/* Trennlinie orange */}
      <div className="w-16 h-0.5 bg-gradient-to-r from-orange-500 to-amber-400 mb-8" />

      {/* Headline */}
      <div className="max-w-xl w-full text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight mb-3">
          Willkommen bei KIICH
        </h1>
        <p className="text-zinc-300 text-base md:text-lg leading-relaxed">
          Für die Nutzung aller KIICH-Tools benötigst du einen{" "}
          <span className="text-amber-400 font-semibold">kostenlosen Account</span> —{" "}
          in 30 Sekunden erstellt, keine Kreditkarte erforderlich.
        </p>
      </div>

      {/* Benefits-Grid – 1 Spalte auf Mobile, 2 auf Desktop */}
      <div className="max-w-xl w-full grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Shield className="w-6 h-6 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-base font-semibold mb-1">Maximaler Datenschutz</p>
            <p className="text-zinc-400 text-sm leading-relaxed">Keine eigene Passwort-Speicherung. Deine Zugangsdaten sind sicher verwahrt.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Lock className="w-6 h-6 text-green-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-base font-semibold mb-1">Kein Passwort-Risiko</p>
            <p className="text-zinc-400 text-sm leading-relaxed">Kein separates KIICH-Passwort das vergessen oder gestohlen werden kann.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Zap className="w-6 h-6 text-orange-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-base font-semibold mb-1">Kostenlos & sofort</p>
            <p className="text-zinc-400 text-sm leading-relaxed">Der Account ist kostenlos. Zugang zu KIICH ist sofort nach der Registrierung aktiv.</p>
          </div>
        </div>
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-4 flex items-start gap-3">
          <Users className="w-6 h-6 text-blue-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-white text-base font-semibold mb-1">KI-Plattform inklusive</p>
            <p className="text-zinc-400 text-sm leading-relaxed">Mit deinem Account erhältst du gleichzeitig KOSTENLOSEN Zugang zu einer der leistungsfähigsten KI-Plattformen.</p>
          </div>
        </div>
      </div>

      {/* Video-Tutorial – einziger Anleitung-Button */}
      <div className="max-w-xl w-full mb-5">
        <button
          onClick={() => setShowVideo(!showVideo)}
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-base text-zinc-300 hover:text-white hover:border-orange-500/50 transition-all"
        >
          <span className="font-semibold flex items-center gap-2">
            <Play className="w-4 h-4 text-orange-400" />
            So funktioniert die Registrierung – Video-Anleitung
          </span>
          {showVideo ? <ChevronUp className="w-5 h-5 text-orange-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0 ml-2" />}
        </button>

        {showVideo && (
          <div className="mt-2 bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden flex justify-center p-3">
            <video
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/KIICHregistration-9x16_eeab9f4b.mp4"
              controls
              playsInline
              className="rounded-xl"
              style={{ width: '100%', maxWidth: '320px', aspectRatio: '9/16' }}
            />
          </div>
        )}
      </div>

      {/* DSGVO Consent */}
      <div className="max-w-xl w-full mb-8">
        <button
          onClick={() => setShowDsgvo(!showDsgvo)}
          className="w-full flex items-center justify-between px-5 py-4 bg-zinc-900/80 border border-zinc-700 rounded-xl text-base text-zinc-300 hover:text-white hover:border-zinc-500 transition-all mb-3"
        >
          <span className="font-semibold">🔒 Datenschutz & Einwilligung</span>
          {showDsgvo ? <ChevronUp className="w-5 h-5 text-zinc-400 shrink-0 ml-2" /> : <ChevronDown className="w-5 h-5 text-zinc-500 shrink-0 ml-2" />}
        </button>

        {showDsgvo && (
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 mb-4 text-sm text-zinc-300 leading-relaxed space-y-3">
            <p className="text-white font-semibold text-base">Was wir speichern und warum:</p>
            <p>KIICH speichert deine <strong className="text-white">Sprachaufnahmen</strong> (für die Stimmklang-Analyse), <strong className="text-white">Reflexionstexte</strong> (für MA-Zusammenfassungen) und <strong className="text-white">Stimmungsdaten</strong> (für deinen persönlichen Verlauf).</p>
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
          className="flex items-start gap-4 cursor-pointer group px-4 py-4 rounded-xl border border-zinc-800 hover:border-zinc-600 transition-all"
          onClick={() => setConsentGiven(!consentGiven)}
        >
          <div className={`w-6 h-6 rounded border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${consentGiven ? 'bg-amber-500 border-amber-500' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
            {consentGiven && (
              <svg className="w-3.5 h-3.5 text-black" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </div>
          <span className="text-base text-zinc-300 group-hover:text-white leading-relaxed transition-colors">
            Ich habe die{" "}
            <a href="/datenschutz" className="text-blue-400 hover:text-blue-300 underline" onClick={e => e.stopPropagation()}>Datenschutzerklärung</a>{" "}
            gelesen und stimme der Verarbeitung meiner Daten für die Nutzung von KIICH zu. Diese Einwilligung kann ich jederzeit widerrufen.
          </span>
        </label>
      </div>

      {/* CTA Button */}
      <div className="max-w-xl w-full">
        <button
          onClick={handleLogin}
          className={`w-full py-5 text-lg font-black tracking-widest uppercase rounded-xl transition-all duration-200 ${
            consentGiven
              ? 'bg-gradient-to-r from-orange-500 to-amber-400 text-black hover:opacity-90 hover:scale-[1.02] shadow-lg shadow-orange-500/20'
              : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-700'
          }`}
        >
          {consentGiven ? 'Jetzt kostenlos bei KIICH starten →' : 'Bitte Datenschutz bestätigen'}
        </button>
        <p className="text-center text-sm text-zinc-500 mt-3">
          Bereits registriert? Der Button führt dich direkt zum Login.
        </p>
      </div>

      {/* Footer */}
      <div className="mt-16 text-center text-sm text-zinc-600 space-y-2">
        <p>KIICH – Die Plattform für deine Persönlichkeitsentfaltung im KI-Zeitalter · Thomas Chochola</p>
        <div className="flex justify-center gap-6">
          <a href="/impressum" className="text-blue-500/60 hover:text-blue-400 transition-colors">Impressum</a>
          <a href="/datenschutz" className="text-blue-500/60 hover:text-blue-400 transition-colors">Datenschutz</a>
        </div>
      </div>

    </div>
  );
}
