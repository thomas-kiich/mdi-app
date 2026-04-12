import { useState, useEffect } from "react";
import { Sparkles, X } from "lucide-react";

/**
 * Willkommens-Dialog für neue Nutzer die über einen Einladungslink beigetreten sind.
 * Wird angezeigt wenn ?willkommen=1 in der URL steht.
 */
export function WillkommensDialog() {
  const [sichtbar, setSichtbar] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("willkommen") === "1") {
      setSichtbar(true);
      // URL bereinigen ohne Reload
      const neueUrl = window.location.pathname;
      window.history.replaceState({}, "", neueUrl);
    }
  }, []);

  if (!sichtbar) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
      <div className="w-full max-w-sm bg-[#12101a] border border-violet-500/30 rounded-2xl p-7 shadow-2xl shadow-violet-900/30">
        {/* Schließen-Button */}
        <button
          onClick={() => setSichtbar(false)}
          className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Avatar */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-3xl mb-4 shadow-lg shadow-violet-900/50">
            🌙
          </div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="w-4 h-4 text-violet-400" />
            <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400 uppercase">Herzlich Willkommen</p>
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
        </div>

        {/* Text */}
        <div className="text-center space-y-4 mb-7">
          <p className="text-white text-lg font-semibold leading-snug">
            Schön, dass du da bist.
          </p>
          <p className="text-white/70 text-sm leading-relaxed">
            Jemand, dem du vertraust, hat dich hierher eingeladen —
            zu einem Werkzeug für Selbstwahrnehmung, innere Klarheit
            und den Dialog mit dir selbst.
          </p>
          <p className="text-white/50 text-sm leading-relaxed">
            <strong className="text-white/70">kiich.de</strong> ist ein stiller Begleiter.
            Kein soziales Netzwerk, keine Ablenkung —
            nur du, deine Gedanken und eine Stimme, die zuhört.
          </p>
          <p className="text-violet-300/80 text-xs leading-relaxed italic">
            „2 minds · 1 source"
          </p>
        </div>

        {/* Button */}
        <button
          onClick={() => setSichtbar(false)}
          className="w-full py-3 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
        >
          Ich bin bereit
        </button>
      </div>
    </div>
  );
}
