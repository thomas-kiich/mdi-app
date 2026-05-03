/**
 * PwaInstallBanner – Zeigt einen diskreten Hinweis an, die App zum Home-Bildschirm
 * hinzuzufügen. Erscheint einmalig, wird nach Schließen dauerhaft in localStorage
 * gespeichert. Unterstützt iOS (Safari) und Android (Chrome/Edge).
 *
 * Datenschutz: Speichert nur "kiich_pwa_banner_dismissed" in localStorage (technisch
 * notwendig, kein Tracking). Bereits im kiich-datenschutz Skill dokumentiert.
 */
import { useState, useEffect } from "react";
import { X, Smartphone, Share } from "lucide-react";

const STORAGE_KEY = "kiich_pwa_banner_dismissed";

function isIos(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}

function isAndroid(): boolean {
  return /android/i.test(navigator.userAgent);
}

function isInStandaloneMode(): boolean {
  return (
    ("standalone" in navigator && (navigator as any).standalone === true) ||
    window.matchMedia("(display-mode: standalone)").matches
  );
}

export function PwaInstallBanner() {
  const [visible, setVisible] = useState(false);
  const [platform, setPlatform] = useState<"ios" | "android" | null>(null);

  useEffect(() => {
    // Nicht anzeigen wenn: bereits als PWA installiert, bereits weggeklickt, oder Desktop
    if (isInStandaloneMode()) return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    if (isIos()) {
      setPlatform("ios");
      setVisible(true);
    } else if (isAndroid()) {
      setPlatform("android");
      setVisible(true);
    }
  }, []);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-in slide-in-from-bottom-4 duration-300">
      <div className="bg-zinc-900 border border-orange-500/30 rounded-2xl p-4 shadow-2xl shadow-black/60 max-w-md mx-auto">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="w-10 h-10 rounded-xl bg-orange-500/20 border border-orange-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Smartphone className="w-5 h-5 text-orange-400" />
          </div>

          {/* Text */}
          <div className="flex-1 min-w-0">
            <p className="text-white text-sm font-semibold mb-1">
              KIICH als App installieren
            </p>

            {platform === "ios" && (
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tippe auf{" "}
                <span className="inline-flex items-center gap-0.5 text-orange-400 font-medium">
                  <Share className="w-3 h-3" /> Teilen
                </span>{" "}
                in Safari, dann auf{" "}
                <span className="text-orange-400 font-medium">
                  „Zum Home-Bildschirm"
                </span>
                . So bleibst du dauerhaft angemeldet.
              </p>
            )}

            {platform === "android" && (
              <p className="text-zinc-400 text-xs leading-relaxed">
                Tippe auf das{" "}
                <span className="text-orange-400 font-medium">⋮ Menü</span> in
                Chrome, dann auf{" "}
                <span className="text-orange-400 font-medium">
                  „Zum Startbildschirm hinzufügen"
                </span>
                . So bleibst du dauerhaft angemeldet.
              </p>
            )}
          </div>

          {/* Schließen */}
          <button
            onClick={dismiss}
            className="text-zinc-600 hover:text-zinc-300 transition-colors flex-shrink-0 p-1 -mr-1 -mt-1"
            aria-label="Banner schließen"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
