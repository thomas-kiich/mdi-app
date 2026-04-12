import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, X } from "lucide-react";

/**
 * Willkommens- und Einführungsdialog für neue Nutzer.
 * Wird angezeigt wenn ?willkommen=1 in der URL steht.
 * Führt in 4 Schritten durch das Wesen von kiich.de / MA.
 */

const SCHRITTE = [
  {
    emoji: "🌙",
    titel: "Willkommen.",
    text: [
      "Jemand, dem du vertraust, hat dich hierher eingeladen.",
      "kiich.de ist kein soziales Netzwerk. Keine Ablenkung. Keine Bewertung.",
      "Es ist ein stiller Raum — für dich allein.",
    ],
    zitat: null,
  },
  {
    emoji: "🎤",
    titel: "Was ist MA?",
    text: [
      "MA ist deine persönliche Begleiterin — eine KI-Stimme, die zuhört, ohne zu urteilen.",
      "Du sprichst einen Gedanken ein. MA transkribiert, ordnet ein und fasst zusammen.",
      "Sie gibt keine Ratschläge. Sie spiegelt — was du sagst, wer du bist.",
    ],
    zitat: "MA gibt keine Ratschläge. Sie spiegelt, verdichtet und begleitet — ohne zu lenken.",
  },
  {
    emoji: "⚡",
    titel: "Die 6 Gravitationszentren",
    text: [
      "Jeder Gedanke, den du einsprichst, wird einem von 6 Bereichen zugeordnet:",
    ],
    kategorien: [
      { emoji: "👤", name: "ICH", beschreibung: "Selbstwahrnehmung, Gefühle, Körper" },
      { emoji: "⚡", name: "QUELL", beschreibung: "Intuition, Träume, innere Stimme" },
      { emoji: "🧠", name: "KONZEPT", beschreibung: "Ideen, Erkenntnisse, Theorien" },
      { emoji: "🎯", name: "PROJEKT", beschreibung: "Pläne, Aufgaben, Vorhaben" },
      { emoji: "💬", name: "DIALOG", beschreibung: "Beziehungen, Gespräche, Begegnungen" },
      { emoji: "🌍", name: "WELT", beschreibung: "Gesellschaft, Natur, das Größere" },
    ],
    zitat: null,
  },
  {
    emoji: "✨",
    titel: "Dein erster Schritt",
    text: [
      "Tippe auf den Mikrofon-Button und sprich deinen ersten Gedanken.",
      "Es muss nichts Besonderes sein. Ein Satz genügt.",
      "MA hört zu.",
    ],
    zitat: "2 minds · 1 source",
  },
];

export function WillkommensDialog() {
  const [sichtbar, setSichtbar] = useState(false);
  const [schritt, setSchritt] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("willkommen") === "1") {
      setSichtbar(true);
      // URL bereinigen ohne Reload
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!sichtbar) return null;

  const aktuellerSchritt = SCHRITTE[schritt];
  const istLetzter = schritt === SCHRITTE.length - 1;
  const istErster = schritt === 0;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm px-4 pb-4 sm:pb-0">
      <div className="w-full max-w-sm bg-[#0f0d1a] border border-violet-500/25 rounded-2xl shadow-2xl shadow-violet-900/30 overflow-hidden">
        {/* Fortschrittsbalken */}
        <div className="flex gap-1 p-4 pb-0">
          {SCHRITTE.map((_, i) => (
            <div
              key={i}
              className={`h-0.5 flex-1 rounded-full transition-all duration-300 ${
                i <= schritt ? "bg-violet-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>

        {/* Schließen-Button */}
        <div className="flex justify-end px-4 pt-3">
          <button
            onClick={() => setSichtbar(false)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-white/50 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inhalt */}
        <div className="px-6 pb-2 min-h-[260px]">
          {/* Emoji */}
          <div className="text-4xl mb-4 text-center">{aktuellerSchritt.emoji}</div>

          {/* Titel */}
          <h2 className="text-white font-bold text-lg text-center mb-4">
            {aktuellerSchritt.titel}
          </h2>

          {/* Text */}
          <div className="space-y-2 mb-4">
            {aktuellerSchritt.text.map((zeile, i) => (
              <p key={i} className="text-white/65 text-sm leading-relaxed text-center">
                {zeile}
              </p>
            ))}
          </div>

          {/* Kategorien (nur Schritt 3) */}
          {"kategorien" in aktuellerSchritt && aktuellerSchritt.kategorien && (
            <div className="grid grid-cols-2 gap-2 mt-3">
              {aktuellerSchritt.kategorien.map((kat) => (
                <div
                  key={kat.name}
                  className="flex items-start gap-2 p-2.5 rounded-xl bg-white/5 border border-white/5"
                >
                  <span className="text-base leading-none mt-0.5">{kat.emoji}</span>
                  <div>
                    <p className="text-white/80 text-[11px] font-semibold">{kat.name}</p>
                    <p className="text-white/35 text-[10px] leading-tight">{kat.beschreibung}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Zitat */}
          {aktuellerSchritt.zitat && (
            <p className="text-violet-300/60 text-xs text-center italic mt-4 leading-relaxed">
              {aktuellerSchritt.zitat}
            </p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex items-center gap-3 px-6 py-5">
          {!istErster ? (
            <button
              onClick={() => setSchritt(s => s - 1)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <div className="w-10" />
          )}

          {istLetzter ? (
            <button
              onClick={() => setSichtbar(false)}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
            >
              Ich bin bereit ✨
            </button>
          ) : (
            <button
              onClick={() => setSchritt(s => s + 1)}
              className="flex-1 py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors flex items-center justify-center gap-2"
            >
              Weiter
              <ChevronRight className="w-4 h-4" />
            </button>
          )}

          {!istLetzter ? (
            <button
              onClick={() => setSichtbar(false)}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white/25 hover:text-white/50 transition-colors text-xs"
            >
              Überspringen
            </button>
          ) : (
            <div className="w-10" />
          )}
        </div>
      </div>
    </div>
  );
}
