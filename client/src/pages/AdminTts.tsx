import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Mic, BookOpen, Activity, Users, BarChart3, ArrowLeft, Euro } from "lucide-react";
import { Link } from "wouter";

// Voxtral TTS: $0.016 pro 1.000 Zeichen
const VOXTRAL_PREIS_PRO_1000 = 0.016; // USD
const USD_TO_EUR = 0.92; // Näherungswert

function usdToEurStr(usd: number): string {
  const eur = usd * USD_TO_EUR;
  if (eur < 0.01) return "< 0,01 €";
  return eur.toFixed(2).replace(".", ",") + " €";
}

function formatZeichen(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)} Mio.`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function ProgressBar({ prozent, color = "bg-emerald-500" }: { prozent: number; color?: string }) {
  const clipped = Math.min(100, Math.max(0, prozent));
  const barColor = prozent >= 90 ? "bg-red-500" : prozent >= 70 ? "bg-amber-500" : color;
  return (
    <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
      <div
        className={`h-3 rounded-full transition-all duration-700 ${barColor}`}
        style={{ width: `${clipped}%` }}
      />
    </div>
  );
}

function TagesBalken({ verlauf }: { verlauf: { datum: string; zeichen: number; aufrufe: number }[] }) {
  if (!verlauf.length) return <p className="text-white/40 text-sm">Noch keine Daten</p>;
  const maxZeichen = Math.max(...verlauf.map(d => d.zeichen), 1);
  return (
    <div className="flex items-end gap-1 h-32 w-full">
      {verlauf.map((tag) => {
        const hoehe = Math.max(4, (tag.zeichen / maxZeichen) * 100);
        const datum = new Date(tag.datum + "T12:00:00");
        const label = datum.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit" });
        const isToday = tag.datum === new Date().toISOString().slice(0, 10);
        const kostenEur = usdToEurStr((tag.zeichen / 1000) * VOXTRAL_PREIS_PRO_1000);
        return (
          <div key={tag.datum} className="flex flex-col items-center flex-1 group relative">
            <div
              className={`w-full rounded-t transition-all ${isToday ? "bg-emerald-400" : "bg-emerald-700 group-hover:bg-emerald-500"}`}
              style={{ height: `${hoehe}%` }}
            />
            <div className="absolute bottom-full mb-1 hidden group-hover:flex flex-col items-center z-10 pointer-events-none">
              <div className="bg-black/90 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                {label}: {formatZeichen(tag.zeichen)} Zeichen ({tag.aufrufe} Aufrufe) · {kostenEur}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AdminTts() {
  const { user, isAuthenticated } = useAuth();
  const { data, isLoading, error } = trpc.adminTts.monatsStats.useQuery(undefined, {
    refetchInterval: 60_000,
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Kein Zugriff. Nur für Admins.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="text-white/40 hover:text-white transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">MA-Stimme · Nutzungsmonitor</h1>
            <p className="text-white/50 text-sm mt-1">
              Mistral Voxtral TTS ·{" "}
              <span className="text-emerald-400 font-mono text-xs">voxtral-mini-tts-latest</span>{" "}
              · <span className="text-amber-400 font-mono text-xs">$0,016 / 1.000 Zeichen</span>
            </p>
          </div>
        </div>

        {isLoading && (
          <div className="flex items-center gap-2 text-white/50">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Lade Statistiken…</span>
          </div>
        )}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
            Fehler beim Laden: {error.message}
          </div>
        )}
        {data && (
          <>
            {/* Monats-Hauptkarte */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Monat {data.monat}
                  </CardTitle>
                  <Badge
                    variant="outline"
                    className={`${
                      data.prozentVerbraucht >= 90
                        ? "border-red-500 text-red-400"
                        : data.prozentVerbraucht >= 70
                        ? "border-amber-500 text-amber-400"
                        : "border-emerald-500 text-emerald-400"
                    }`}
                  >
                    {data.prozentVerbraucht}% von 1 Mio. Zeichen
                  </Badge>
                </div>
                <CardDescription className="text-white/50">
                  Kosten diesen Monat:{" "}
                  <span className="text-amber-300 font-semibold">{usdToEurStr(data.monatKostenUsd)}</span>
                  {" "}(≈ ${data.monatKostenUsd.toFixed(4)})
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <ProgressBar prozent={data.prozentVerbraucht} />
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-emerald-400">{formatZeichen(data.gesamtZeichen)}</p>
                    <p className="text-white/50 text-xs mt-1">Zeichen verbraucht</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-amber-300">{usdToEurStr(data.monatKostenUsd)}</p>
                    <p className="text-white/50 text-xs mt-1">Kosten diesen Monat</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-white">{data.prozentVerbraucht}%</p>
                    <p className="text-white/50 text-xs mt-1">von 1 Mio. Zeichen</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kontext-Aufschlüsselung */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {data.nachKontext.map((k) => (
                <Card key={k.kontext} className="bg-white/5 border-white/10">
                  <CardContent className="pt-5 flex items-center gap-4">
                    <div className="p-2 rounded-lg bg-white/10">
                      {k.kontext === "einschlaf_bibliothek"
                        ? <BookOpen className="w-5 h-5 text-indigo-400" />
                        : k.kontext === "momentaufnahme" || k.kontext === "momentaufnahme-vorlesen"
                        ? <Mic className="w-5 h-5 text-amber-400" />
                        : <Activity className="w-5 h-5 text-white/50" />
                      }
                    </div>
                    <div className="flex-1">
                      <p className="text-white font-medium text-sm">
                        {k.kontext === "einschlaf_bibliothek" ? "Einschlaf-Bibliothek"
                          : k.kontext === "momentaufnahme" || k.kontext === "momentaufnahme-vorlesen" ? "Momentaufnahme / MA"
                          : k.kontext}
                      </p>
                      <p className="text-white/50 text-xs">
                        {formatZeichen(k.zeichen)} Zeichen · {k.aufrufe} Aufrufe
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-amber-300 text-sm font-semibold">{usdToEurStr(k.kostenUsd)}</p>
                      <p className="text-white/30 text-xs">Kosten</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
              {data.nachKontext.length === 0 && (
                <Card className="bg-white/5 border-white/10 col-span-2">
                  <CardContent className="pt-5 text-white/40 text-sm text-center">
                    Noch keine TTS-Aufrufe diesen Monat
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Tagesdiagramm */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-white text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-400" />
                  Tagesverbrauch (letzte 30 Tage)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <TagesBalken verlauf={data.tagesVerlauf} />
                <p className="text-white/30 text-xs mt-2 text-center">
                  Hover über einen Balken für Details (inkl. Kosten) · Heute in Grün
                </p>
              </CardContent>
            </Card>

            {/* Gesamt-Statistik */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold text-white">{formatZeichen(data.alleZeit.zeichen)}</p>
                  <p className="text-white/50 text-xs mt-1">Zeichen gesamt (alle Zeit)</p>
                  <p className="text-amber-300 text-sm font-semibold mt-2">{usdToEurStr(data.alleZeit.kostenUsd)}</p>
                  <p className="text-white/30 text-xs">Gesamtkosten seit Start</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-5 text-center">
                  <p className="text-2xl font-bold text-white">{data.alleZeit.aufrufe}</p>
                  <p className="text-white/50 text-xs mt-1">TTS-Aufrufe gesamt</p>
                </CardContent>
              </Card>
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-5 text-center flex flex-col items-center">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-white/50" />
                    <p className="text-2xl font-bold text-white">{data.eindeutigeUser}</p>
                  </div>
                  <p className="text-white/50 text-xs mt-1">User haben TTS genutzt</p>
                </CardContent>
              </Card>
            </div>

            {/* Kosten-Hinweis */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4 text-white/50 text-xs space-y-1">
              <p>
                <strong className="text-white/70">Kostenberechnung:</strong>{" "}
                Mistral Voxtral TTS kostet $0,016 pro 1.000 Zeichen (≈ {(VOXTRAL_PREIS_PRO_1000 * USD_TO_EUR).toFixed(4).replace(".", ",")} € pro 1.000 Zeichen).
              </p>
              <p>
                Wechselkurs USD/EUR: {USD_TO_EUR} (Näherungswert – aktuellen Kurs und Rechnungen auf{" "}
                <a href="https://console.mistral.ai" target="_blank" rel="noopener" className="text-amber-400 hover:underline">
                  console.mistral.ai
                </a>{" "}
                prüfen).
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
