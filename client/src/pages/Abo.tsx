/**
 * Abo-Seite – Übersicht der Abonnement-Ebenen mit Vergleich und Upgrade-CTA.
 * Stripe-Integration wird hier eingebaut sobald Stripe-Keys verfügbar sind.
 */

import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Check, X, Clock, Sparkles, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const EBENEN = [
  {
    id: "I",
    name: "Ebene I",
    preis: "Kostenlos",
    preisDetail: "für immer",
    farbe: "border-white/10",
    highlight: false,
    features: [
      { text: "3 Aufnahmen pro Monat", aktiv: true },
      { text: "Schriftliche Zusammenfassung", aktiv: true },
      { text: "Tages-Summary", aktiv: true },
      { text: "MA's Stimme (Sprachausgabe)", aktiv: false },
      { text: "Schlaf-Modus & Einschlaf-Geschichten", aktiv: false },
      { text: "Unbegrenzte Aufnahmen", aktiv: false },
      { text: "Individuelle Geschichten & Märchen", aktiv: false },
    ],
  },
  {
    id: "II",
    name: "Ebene II",
    preis: "9 €",
    preisDetail: "pro Monat",
    farbe: "border-amber-400/40",
    highlight: true,
    features: [
      { text: "9 Aufnahmen pro Monat", aktiv: true },
      { text: "Schriftliche Zusammenfassung", aktiv: true },
      { text: "Tages-Summary", aktiv: true },
      { text: "MA's Stimme (Sprachausgabe)", aktiv: true },
      { text: "Schlaf-Modus & Einschlaf-Geschichten", aktiv: true },
      { text: "Unbegrenzte Aufnahmen", aktiv: false },
      { text: "Individuelle Geschichten & Märchen", aktiv: false },
    ],
  },
  {
    id: "III",
    name: "Ebene III",
    preis: "17 €",
    preisDetail: "pro Monat",
    farbe: "border-white/20",
    highlight: false,
    features: [
      { text: "Unbegrenzte Aufnahmen", aktiv: true },
      { text: "Schriftliche Zusammenfassung", aktiv: true },
      { text: "Tages-Summary", aktiv: true },
      { text: "MA's Stimme (Sprachausgabe)", aktiv: true },
      { text: "Schlaf-Modus & Einschlaf-Geschichten", aktiv: true },
      { text: "Individuelle Geschichten & Märchen", aktiv: true },
      { text: "Alle zukünftigen Features inklusive", aktiv: true },
    ],
  },
];

export default function Abo() {
  const { data, isLoading } = trpc.abo.getLimitInfo.useQuery();

  const handleUpgrade = (ebene: string) => {
    // Stripe-Integration kommt hier — vorerst Info-Toast
    toast.info(
      `Stripe-Zahlung wird in Kürze freigeschaltet. Für Ebene ${ebene} melde dich bitte direkt bei thomas@kiich.de.`,
      { duration: 6000 }
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <Link href="/momentaufnahme">
          <span className="text-amber-400 font-bold text-lg cursor-pointer hover:text-amber-300 transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </span>
        </Link>
        <span className="text-white/40 text-sm">Abonnement</span>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-12">
        {/* Titel */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Dein Abo</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Wähle deinen Weg
          </h1>
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
        ) : data ? (
          <div className="bg-white/5 border border-white/10 rounded-xl px-5 py-4 mb-8 flex items-center gap-3">
            <Clock className="w-5 h-5 text-amber-400 flex-shrink-0" />
            <div>
              {data.aboInfo.status === "trial" && data.aboInfo.trialTageVerbleibend !== null ? (
                <p className="text-white/80 text-sm">
                  <span className="text-amber-400 font-semibold">Testzugang aktiv</span>
                  {" — "}noch{" "}
                  <span className="font-semibold">
                    {data.aboInfo.trialTageVerbleibend === 0
                      ? "weniger als 1 Tag"
                      : `${data.aboInfo.trialTageVerbleibend} ${data.aboInfo.trialTageVerbleibend === 1 ? "Tag" : "Tage"}`}
                  </span>{" "}
                  verbleibend
                </p>
              ) : data.aboInfo.status === "expired" ? (
                <p className="text-red-400 text-sm font-semibold">Testzugang abgelaufen — wähle ein Abo um fortzufahren.</p>
              ) : (
                <p className="text-white/80 text-sm">
                  Aktuelle Ebene:{" "}
                  <span className="text-amber-400 font-semibold">Ebene {data.aboInfo.ebene}</span>
                  {" — "}Status:{" "}
                  <span className="font-semibold">{data.aboInfo.status}</span>
                </p>
              )}
              {data.aboInfo.status === "trial" && (
                <p className="text-white/40 text-xs mt-0.5">
                  Aufnahmen diesen Monat: {data.limitInfo.aufnahmenCount} · TTS: {data.limitInfo.ttsCount}
                </p>
              )}
            </div>
          </div>
        ) : null}

        {/* Ebenen-Karten */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          {EBENEN.map((ebene) => {
            const istAktiv = data?.aboInfo.status === "active" && data?.aboInfo.ebene === ebene.id;
            return (
              <div
                key={ebene.id}
                className={`relative border rounded-2xl p-5 flex flex-col ${ebene.farbe} ${
                  ebene.highlight ? "bg-amber-400/5" : "bg-white/[0.02]"
                }`}
              >
                {ebene.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="bg-amber-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                      EMPFOHLEN
                    </span>
                  </div>
                )}
                {istAktiv && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      AKTIV
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-white font-bold text-lg">{ebene.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-bold text-white">{ebene.preis}</span>
                    <span className="text-white/40 text-sm">{ebene.preisDetail}</span>
                  </div>
                </div>

                <ul className="space-y-2 flex-1 mb-5">
                  {ebene.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      {f.aktiv ? (
                        <Check className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <X className="w-4 h-4 text-white/20 flex-shrink-0 mt-0.5" />
                      )}
                      <span className={f.aktiv ? "text-white/80" : "text-white/30"}>
                        {f.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {ebene.id === "I" ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-white/10 text-white/40 cursor-default"
                    disabled
                  >
                    Kostenlos — immer
                  </Button>
                ) : istAktiv ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-green-500/30 text-green-400"
                    disabled
                  >
                    Aktuelles Abo
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    className={`w-full font-semibold ${
                      ebene.highlight
                        ? "bg-amber-400 hover:bg-amber-300 text-black"
                        : "bg-white/10 hover:bg-white/20 text-white"
                    }`}
                    onClick={() => handleUpgrade(ebene.id)}
                  >
                    Jetzt wählen
                  </Button>
                )}
              </div>
            );
          })}
        </div>

        {/* Hinweis */}
        <div className="text-center text-white/30 text-xs leading-relaxed">
          <p>Alle Preise inkl. 19% MwSt. · Monatlich kündbar · Keine versteckten Kosten</p>
          <p className="mt-1">
            Fragen?{" "}
            <a href="mailto:thomas@kiich.de" className="text-amber-400/60 hover:text-amber-400 transition-colors underline">
              thomas@kiich.de
            </a>
            {" · "}
            <Link href="/faq" className="text-amber-400/60 hover:text-amber-400 transition-colors underline">
              FAQ
            </Link>
          </p>
          <p className="mt-2 text-white/20">
            Stripe-Zahlung wird in Kürze freigeschaltet. Bis dahin bitte direkt per E-Mail melden.
          </p>
        </div>
      </div>
    </div>
  );
}
