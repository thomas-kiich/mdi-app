import { useState, useEffect, useRef } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

/**
 * UpdateBanner – iOS + Android kompatibel.
 * Pollt alle 5 Minuten /api/app-version und zeigt einen Banner wenn
 * eine neue Version verfügbar ist. Funktioniert auf iPhone Safari,
 * Android Chrome und allen anderen Browsern.
 */
export function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const initialVersion = useRef<string | null>(null);

  useEffect(() => {
    const fetchVersion = async (): Promise<string | null> => {
      try {
        const res = await fetch('/api/app-version', { cache: 'no-store' });
        if (!res.ok) return null;
        const data = await res.json();
        return data.version ?? null;
      } catch {
        return null;
      }
    };

    // Erste Version beim Laden speichern
    fetchVersion().then(v => {
      if (v) initialVersion.current = v;
    });

    // Alle 5 Minuten prüfen ob sich die Version geändert hat
    const interval = setInterval(async () => {
      const current = await fetchVersion();
      if (
        current &&
        initialVersion.current &&
        current !== initialVersion.current
      ) {
        setShowBanner(true);
        clearInterval(interval);
      }
    }, 5 * 60 * 1000);

    // Zusätzlich Service Worker Update-Events abfangen (Android Chrome)
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          if (!newWorker) return;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setShowBanner(true);
            }
          });
        });
      });
    }

    return () => clearInterval(interval);
  }, []);

  const handleUpdate = () => {
    setIsReloading(true);
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        regs.forEach(reg => {
          if (reg.waiting) {
            reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        });
      });
    }
    setTimeout(() => {
      window.location.reload();
    }, 300);
  };

  if (!showBanner) return null;

  return (
    <div
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] w-[calc(100%-2rem)] max-w-sm"
      style={{ animation: "slideUp 0.4s ease-out" }}
    >
      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
      <div className="bg-gradient-to-r from-violet-900/95 to-indigo-900/95 backdrop-blur-md border border-violet-500/30 rounded-2xl shadow-2xl shadow-violet-900/50 px-5 py-4 flex items-center gap-4">
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-black" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            Neue Version verfügbar ✨
          </p>
          <p className="text-violet-300/80 text-xs mt-0.5 leading-tight">
            KIICH wurde aktualisiert – kurz neu laden?
          </p>
        </div>
        <button
          onClick={handleUpdate}
          disabled={isReloading}
          className="flex-shrink-0 flex items-center gap-1.5 bg-white/10 hover:bg-white/20 active:bg-white/30 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isReloading ? "animate-spin" : ""}`} />
          {isReloading ? "..." : "Jetzt"}
        </button>
      </div>
    </div>
  );
}
