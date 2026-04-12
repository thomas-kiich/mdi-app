/**
 * TrialBanner – zeigt den Trial-Countdown und Upgrade-Hinweise.
 * Wird in Momentaufnahme und EinschlafBibliothek eingebaut.
 */

import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Clock, Sparkles, X } from "lucide-react";
import { useState } from "react";

export function TrialBanner() {
  const [dismissed, setDismissed] = useState(false);
  const { data } = trpc.abo.getLimitInfo.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 Minuten cachen
  });

  if (!data || dismissed) return null;

  const { aboInfo } = data;

  // Kein Banner wenn aktives Abo Ebene II oder III
  if (aboInfo.status === "active" && (aboInfo.ebene === "II" || aboInfo.ebene === "III")) return null;
  // Kein Banner wenn gekündigt aber noch aktiv
  if (aboInfo.status === "cancelled") return null;

  // Trial-Banner
  if (aboInfo.status === "trial" && aboInfo.trialTageVerbleibend !== null) {
    const tage = aboInfo.trialTageVerbleibend;
    const dringend = tage <= 2;

    return (
      <div
        className={`relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm mb-4 ${
          dringend
            ? "bg-orange-500/15 border border-orange-500/30 text-orange-300"
            : "bg-amber-400/10 border border-amber-400/20 text-amber-300"
        }`}
      >
        <Clock className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">
          {tage === 0
            ? "Dein Testzugang endet heute."
            : tage === 1
            ? "Noch 1 Tag Testzugang — alle Features verfügbar."
            : `Noch ${tage} Tage Testzugang — alle Features verfügbar.`}
          {" "}
          <Link href="/abo" className="underline underline-offset-2 hover:text-white transition-colors">
            Jetzt Abo wählen →
          </Link>
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  // Abgelaufen-Banner
  if (aboInfo.trialAbgelaufen || aboInfo.status === "expired") {
    return (
      <div className="relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm mb-4 bg-red-500/10 border border-red-500/30 text-red-300">
        <Sparkles className="w-4 h-4 flex-shrink-0" />
        <span className="flex-1">
          Dein Testzugang ist abgelaufen. Wähle ein Abo um MOMENTAUFNAHME weiter zu nutzen.{" "}
          <Link href="/abo" className="underline underline-offset-2 hover:text-white transition-colors font-semibold">
            Abo wählen →
          </Link>
        </span>
      </div>
    );
  }

  // Ebene I Banner (kostenlos, aber eingeschränkt)
  if (aboInfo.status === "active" && aboInfo.ebene === "I") {
    return (
      <div className="relative flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm mb-4 bg-white/5 border border-white/10 text-white/50">
        <Sparkles className="w-4 h-4 flex-shrink-0 text-amber-400/60" />
        <span className="flex-1">
          Du nutzt die kostenlose Ebene I (3 Aufnahmen/Monat).{" "}
          <Link href="/abo" className="text-amber-400/80 underline underline-offset-2 hover:text-amber-400 transition-colors">
            Auf Ebene II oder III upgraden →
          </Link>
        </span>
        <button
          onClick={() => setDismissed(true)}
          className="opacity-50 hover:opacity-100 transition-opacity"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    );
  }

  return null;
}
