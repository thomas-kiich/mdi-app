import { useState, useEffect } from "react";
import { Sparkles, RefreshCw } from "lucide-react";

/**
 * UpdateBanner – erscheint wenn ein neuer Service Worker wartet.
 * Zeigt eine charmante Aufforderung zum Neuladen statt schwarzem Bildschirm.
 */
export function UpdateBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [waitingWorker, setWaitingWorker] = useState<ServiceWorker | null>(null);
  const [isReloading, setIsReloading] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    const checkForWaiting = (registration: ServiceWorkerRegistration) => {
      if (registration.waiting) {
        setWaitingWorker(registration.waiting);
        setShowBanner(true);
      }
    };

    // Bestehende Registrierungen prüfen
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach(checkForWaiting);
    });

    // Auf neue Updates lauschen
    const handleControllerChange = () => {
      if (!isReloading) {
        // Neuer SW hat übernommen – sanft neuladen
        window.location.reload();
      }
    };

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange);

    // Update-Events von SW-Registrierungen abfangen
    const handleRegistration = (registration: ServiceWorkerRegistration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;
        newWorker.addEventListener("statechange", () => {
          if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
            setWaitingWorker(newWorker);
            setShowBanner(true);
          }
        });
      });
      checkForWaiting(registration);
    };

    navigator.serviceWorker.ready.then(handleRegistration);

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange);
    };
  }, [isReloading]);

  const handleUpdate = () => {
    setIsReloading(true);
    if (waitingWorker) {
      // SW anweisen sofort zu übernehmen
      waitingWorker.postMessage({ type: "SKIP_WAITING" });
    }
    // Kurz warten dann neuladen
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
        {/* Icon */}
        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center shadow-lg">
          <Sparkles className="w-5 h-5 text-black" />
        </div>

        {/* Text */}
        <div className="flex-1 min-w-0">
          <p className="text-white text-sm font-semibold leading-tight">
            Neue Version verfügbar ✨
          </p>
          <p className="text-violet-300/80 text-xs mt-0.5 leading-tight">
            KIICH wurde aktualisiert – kurz neu laden?
          </p>
        </div>

        {/* Button */}
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
