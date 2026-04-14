import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft, AlertTriangle, CheckCircle2, Clock,
  Sparkles, ChevronDown, ChevronUp, FileText,
  Shield, Scale, BookOpen, Loader2, ExternalLink,
  History, Bell
} from "lucide-react";
import { Link } from "wouter";
import { Streamdown } from "streamdown";
import { cn } from "@/lib/utils";

type Kategorie = "datenschutz" | "impressum" | "ki_recht" | "nutzungsbedingungen" | "sonstiges";
type Ergebnis = "ok" | "anpassung_noetig" | "kritisch";

const KATEGORIE_CONFIG: Record<Kategorie, { label: string; icon: React.ReactNode; farbe: string }> = {
  datenschutz: {
    label: "Datenschutz",
    icon: <Shield className="w-4 h-4" />,
    farbe: "text-blue-400 bg-blue-950/40 border-blue-800/40"
  },
  impressum: {
    label: "Impressum",
    icon: <FileText className="w-4 h-4" />,
    farbe: "text-zinc-400 bg-zinc-900/60 border-zinc-800/40"
  },
  ki_recht: {
    label: "KI-Recht",
    icon: <Scale className="w-4 h-4" />,
    farbe: "text-purple-400 bg-purple-950/40 border-purple-800/40"
  },
  nutzungsbedingungen: {
    label: "Nutzungsbedingungen",
    icon: <BookOpen className="w-4 h-4" />,
    farbe: "text-teal-400 bg-teal-950/40 border-teal-800/40"
  },
  sonstiges: {
    label: "Sonstiges",
    icon: <FileText className="w-4 h-4" />,
    farbe: "text-zinc-400 bg-zinc-900/60 border-zinc-800/40"
  },
};

const ERGEBNIS_CONFIG: Record<Ergebnis, { label: string; farbe: string; icon: React.ReactNode }> = {
  ok: {
    label: "Kein Handlungsbedarf",
    farbe: "text-green-400 bg-green-950/40 border-green-800/40",
    icon: <CheckCircle2 className="w-4 h-4" />
  },
  anpassung_noetig: {
    label: "Anpassung empfohlen",
    farbe: "text-amber-400 bg-amber-950/40 border-amber-800/40",
    icon: <AlertTriangle className="w-4 h-4" />
  },
  kritisch: {
    label: "Dringende Anpassung",
    farbe: "text-red-400 bg-red-950/40 border-red-800/40",
    icon: <AlertTriangle className="w-4 h-4" />
  },
};

function formatDatum(ms: number | null): string {
  if (!ms) return "–";
  return new Date(ms).toLocaleDateString("de-DE", {
    day: "2-digit", month: "2-digit", year: "numeric"
  });
}

function TageBis(ms: number): number {
  return Math.ceil((ms - Date.now()) / (1000 * 60 * 60 * 24));
}

function AufgabeKarte({ aufgabe, onAbgeschlossen }: { aufgabe: any; onAbgeschlossen: () => void }) {
  const [offen, setOffen] = useState(false);
  const [maAnalyse, setMaAnalyse] = useState<string | null>(null);
  const [maErgebnis, setMaErgebnis] = useState<Ergebnis | null>(null);
  const [laedt, setLaedt] = useState(false);
  const [notizen, setNotizen] = useState("");
  const [manuellErgebnis, setManuellErgebnis] = useState<Ergebnis>("ok");
  const [protokollOffen, setProtokollOffen] = useState(false);

  const { data: protokoll } = trpc.rechtsCheckliste.protokollLaden.useQuery(
    { aufgabeId: aufgabe.id },
    { enabled: protokollOffen }
  );

  const maAnalyseMutation = trpc.rechtsCheckliste.maAnalyseStarten.useMutation({
    onSuccess: (data) => {
      setMaAnalyse(data.maAnalyse);
      setMaErgebnis(data.ergebnis as Ergebnis);
      setManuellErgebnis(data.ergebnis as Ergebnis);
      setLaedt(false);
    },
    onError: () => setLaedt(false),
  });

  const pruefungMutation = trpc.rechtsCheckliste.pruefungAbschliessen.useMutation({
    onSuccess: () => {
      onAbgeschlossen();
    },
  });

  const jetzt = Date.now();
  const istFaellig = aufgabe.naechsteFaelligMs <= jetzt;
  const tage = TageBis(aufgabe.naechsteFaelligMs);
  const kat = KATEGORIE_CONFIG[aufgabe.kategorie as Kategorie] ?? KATEGORIE_CONFIG.sonstiges;
  const quellen: string[] = aufgabe.quellen ? JSON.parse(aufgabe.quellen) : [];

  const handleMaAnalyse = () => {
    setLaedt(true);
    setMaAnalyse(null);
    maAnalyseMutation.mutate({
      aufgabeId: aufgabe.id,
      aufgabeTitel: aufgabe.titel,
      aufgabeBeschreibung: aufgabe.beschreibung,
      aufgabeKategorie: aufgabe.kategorie,
      quellen: aufgabe.quellen ?? undefined,
    });
  };

  const handleAbschliessen = (geprueftVon: "user" | "ma_auto") => {
    pruefungMutation.mutate({
      aufgabeId: aufgabe.id,
      ergebnis: maErgebnis ?? manuellErgebnis,
      notizen: notizen || undefined,
      maAnalyse: maAnalyse ?? undefined,
      geprueftVon,
    });
  };

  return (
    <div className={cn(
      "rounded-xl border transition-all",
      istFaellig
        ? "border-amber-700/50 bg-amber-950/20"
        : "border-zinc-800 bg-zinc-900/40"
    )}>
      {/* Header */}
      <button
        className="w-full text-left p-4 flex items-start gap-3"
        onClick={() => setOffen(!offen)}
      >
        <div className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md border text-xs font-medium flex-shrink-0 mt-0.5", kat.farbe)}>
          {kat.icon}
          <span>{kat.label}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-medium text-sm leading-snug">{aufgabe.titel}</p>
          <div className="flex items-center gap-3 mt-1">
            {istFaellig ? (
              <span className="text-amber-400 text-xs flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Fällig seit {formatDatum(aufgabe.naechsteFaelligMs)}
              </span>
            ) : (
              <span className="text-zinc-500 text-xs flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {tage > 0 ? `Fällig in ${tage} Tagen (${formatDatum(aufgabe.naechsteFaelligMs)})` : "Heute fällig"}
              </span>
            )}
            {aufgabe.prioritaet === "hoch" && (
              <span className="text-red-400 text-xs">● Hohe Priorität</span>
            )}
          </div>
        </div>
        {offen ? <ChevronUp className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-1" /> : <ChevronDown className="w-4 h-4 text-zinc-500 flex-shrink-0 mt-1" />}
      </button>

      {/* Detail-Bereich */}
      {offen && (
        <div className="px-4 pb-4 space-y-4 border-t border-zinc-800/50 pt-4">

          {/* Beschreibung */}
          <div className="bg-zinc-900/60 rounded-lg p-4 text-sm text-zinc-400 whitespace-pre-line leading-relaxed">
            {aufgabe.beschreibung}
          </div>

          {/* Quellen */}
          {quellen.length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Relevante Quellen</p>
              <div className="flex flex-wrap gap-2">
                {quellen.map((q: string, i: number) => (
                  <a
                    key={i}
                    href={q}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-orange-400 hover:underline bg-orange-950/20 border border-orange-800/30 rounded-md px-2 py-1"
                  >
                    {new URL(q).hostname}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Prüfprotokoll */}
          <button
            onClick={() => setProtokollOffen(!protokollOffen)}
            className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Prüfhistorie anzeigen
            {protokollOffen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>

          {protokollOffen && (
            <div className="space-y-2">
              {!protokoll || protokoll.length === 0 ? (
                <p className="text-xs text-zinc-600 italic">Noch keine Prüfungen dokumentiert.</p>
              ) : (
                protokoll.map((p: any) => {
                  const erg = ERGEBNIS_CONFIG[p.ergebnis as Ergebnis];
                  return (
                    <div key={p.id} className="bg-zinc-900/60 border border-zinc-800/50 rounded-lg p-3 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border", erg?.farbe)}>
                          {erg?.icon}{erg?.label}
                        </span>
                        <span className="text-xs text-zinc-600">
                          {p.geprueftVon === "ma_auto" ? "🤖 MA" : "👤 Manuell"} · {formatDatum(p.geprueftAmMs)}
                        </span>
                      </div>
                      {p.notizen && <p className="text-xs text-zinc-400">{p.notizen}</p>}
                      {p.maAnalyse && (
                        <details className="text-xs text-zinc-500">
                          <summary className="cursor-pointer hover:text-zinc-300 transition-colors">MA-Analyse anzeigen</summary>
                          <div className="mt-2 text-zinc-400 leading-relaxed">
                            <Streamdown>{p.maAnalyse}</Streamdown>
                          </div>
                        </details>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          )}

          {/* MA-Analyse Button */}
          <div className="flex gap-2">
            <Button
              onClick={handleMaAnalyse}
              disabled={laedt}
              className="bg-orange-500 hover:bg-orange-600 text-white gap-2 text-sm"
              size="sm"
            >
              {laedt ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> MA analysiert...</>
              ) : (
                <><Sparkles className="w-4 h-4" /> MA-Analyse starten</>
              )}
            </Button>
          </div>

          {/* MA-Analyse Ergebnis */}
          {maAnalyse && (
            <div className="bg-zinc-900/80 border border-zinc-700/50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                <span className="text-orange-400 text-sm font-medium">MA-Analyse</span>
                {maErgebnis && (
                  <span className={cn(
                    "flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border",
                    ERGEBNIS_CONFIG[maErgebnis].farbe
                  )}>
                    {ERGEBNIS_CONFIG[maErgebnis].icon}
                    {ERGEBNIS_CONFIG[maErgebnis].label}
                  </span>
                )}
              </div>
              <div className="text-sm text-zinc-300 leading-relaxed">
                <Streamdown>{maAnalyse}</Streamdown>
              </div>
            </div>
          )}

          {/* Manuelle Notizen + Abschließen */}
          <div className="space-y-3 pt-2 border-t border-zinc-800/50">
            <div className="space-y-1.5">
              <label className="text-xs text-zinc-500 uppercase tracking-wider">Eigene Notizen (optional)</label>
              <textarea
                value={notizen}
                onChange={(e) => setNotizen(e.target.value)}
                rows={2}
                placeholder="Was habe ich geprüft, was wurde angepasst..."
                className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none"
              />
            </div>

            {!maAnalyse && (
              <div className="space-y-1.5">
                <label className="text-xs text-zinc-500 uppercase tracking-wider">Ergebnis</label>
                <div className="flex gap-2 flex-wrap">
                  {(["ok", "anpassung_noetig", "kritisch"] as Ergebnis[]).map((e) => (
                    <button
                      key={e}
                      onClick={() => setManuellErgebnis(e)}
                      className={cn(
                        "flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border transition-all",
                        manuellErgebnis === e
                          ? ERGEBNIS_CONFIG[e].farbe
                          : "text-zinc-500 border-zinc-800 hover:border-zinc-600"
                      )}
                    >
                      {ERGEBNIS_CONFIG[e].icon}
                      {ERGEBNIS_CONFIG[e].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                onClick={() => handleAbschliessen("user")}
                disabled={pruefungMutation.isPending}
                variant="outline"
                size="sm"
                className="gap-2 text-sm border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                {pruefungMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                Prüfung abschließen
              </Button>
              {maAnalyse && (
                <Button
                  onClick={() => handleAbschliessen("ma_auto")}
                  disabled={pruefungMutation.isPending}
                  size="sm"
                  className="gap-2 text-sm bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-700/40"
                  variant="outline"
                >
                  <Sparkles className="w-4 h-4" />
                  Mit MA-Analyse abschließen
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function RechtsCheckliste() {
  const utils = trpc.useUtils();
  const { data: aufgaben, isLoading } = trpc.rechtsCheckliste.aufgabenLaden.useQuery();
  const { data: stats } = trpc.rechtsCheckliste.faelligeAufgabenZaehlen.useQuery();

  const jetzt = Date.now();
  const faelligeAufgaben = aufgaben?.filter(a => a.naechsteFaelligMs <= jetzt) ?? [];
  const kommendeAufgaben = aufgaben?.filter(a => a.naechsteFaelligMs > jetzt) ?? [];

  const handleAbgeschlossen = () => {
    utils.rechtsCheckliste.aufgabenLaden.invalidate();
    utils.rechtsCheckliste.faelligeAufgabenZaehlen.invalidate();
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10 font-sans">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-4">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
              <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
            </Button>
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-light text-white tracking-tight">
                MA Rechts-Checkliste
              </h1>
              <p className="text-zinc-500 text-sm mt-1">
                Monatliche Prüfpflichten · Datenschutz · Impressum · KI-Recht
              </p>
            </div>
            <div className="flex gap-3">
              {stats && stats.faellig > 0 && (
                <div className="bg-amber-950/40 border border-amber-700/40 rounded-xl px-4 py-2 text-center">
                  <p className="text-amber-400 text-2xl font-bold">{stats.faellig}</p>
                  <p className="text-amber-600 text-xs">Fällig</p>
                </div>
              )}
              {stats && stats.bald > 0 && (
                <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl px-4 py-2 text-center">
                  <p className="text-zinc-300 text-2xl font-bold">{stats.bald}</p>
                  <p className="text-zinc-500 text-xs">Bald fällig</p>
                </div>
              )}
            </div>
          </div>

          {/* Info-Banner */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-sm text-zinc-400 flex gap-3">
            <Sparkles className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-zinc-300 font-medium mb-1">MA hilft dir bei der Prüfung</p>
              <p>
                Klicke bei jeder Aufgabe auf <strong className="text-orange-400">„MA-Analyse starten"</strong> –
                MA analysiert aktuelle Rechtsänderungen, prüft relevante Quellen und gibt dir
                konkrete Handlungsempfehlungen. Danach kannst du die Prüfung mit einem Klick abschließen.
              </p>
            </div>
          </div>
        </div>

        {/* Laden */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Aufgaben werden geladen...</span>
          </div>
        )}

        {/* Fällige Aufgaben */}
        {faelligeAufgaben.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-white font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Jetzt fällig ({faelligeAufgaben.length})
            </h2>
            {faelligeAufgaben.map(a => (
              <AufgabeKarte key={a.id} aufgabe={a} onAbgeschlossen={handleAbgeschlossen} />
            ))}
          </div>
        )}

        {/* Kommende Aufgaben */}
        {kommendeAufgaben.length > 0 && (
          <div className="space-y-3">
            <h2 className="text-zinc-400 font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Kommende Prüfungen ({kommendeAufgaben.length})
            </h2>
            {kommendeAufgaben.map(a => (
              <AufgabeKarte key={a.id} aufgabe={a} onAbgeschlossen={handleAbgeschlossen} />
            ))}
          </div>
        )}

        {/* Leer-Zustand */}
        {!isLoading && aufgaben?.length === 0 && (
          <div className="text-center py-16 text-zinc-500">
            <CheckCircle2 className="w-12 h-12 mx-auto mb-4 text-green-600" />
            <p className="text-lg text-zinc-400">Alle Prüfungen erledigt</p>
            <p className="text-sm mt-1">Keine fälligen Aufgaben – gut gemacht!</p>
          </div>
        )}

        {/* Rechtsdokumente Schnellzugriff */}
        <div className="pt-6 border-t border-zinc-800 space-y-3">
          <p className="text-xs text-zinc-500 uppercase tracking-wider">Rechtsdokumente</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/datenschutz">
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-blue-700/40 rounded-xl p-4 text-sm flex items-center gap-3 transition-colors cursor-pointer group">
                <Shield className="w-4 h-4 text-blue-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-blue-400 transition-colors">Datenschutz</p>
                  <p className="text-zinc-600 text-xs">DSGVO · BDSG · DSG</p>
                </div>
              </div>
            </Link>
            <Link href="/impressum">
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-zinc-600 rounded-xl p-4 text-sm flex items-center gap-3 transition-colors cursor-pointer group">
                <FileText className="w-4 h-4 text-zinc-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-zinc-300 transition-colors">Impressum</p>
                  <p className="text-zinc-600 text-xs">§ 5 DDG · ECG · UWG</p>
                </div>
              </div>
            </Link>
            <Link href="/nutzungsbedingungen">
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-teal-700/40 rounded-xl p-4 text-sm flex items-center gap-3 transition-colors cursor-pointer group">
                <BookOpen className="w-4 h-4 text-teal-400" />
                <div>
                  <p className="text-white font-medium group-hover:text-teal-400 transition-colors">Nutzungsbedingungen</p>
                  <p className="text-zinc-600 text-xs">AGB · Version 1.0</p>
                </div>
              </div>
            </Link>
          </div>
        </div>

        <div className="pt-4 text-center text-xs text-zinc-700">
          <p>Prüfintervall: monatlich (30 Tage) · Powered by MA</p>
        </div>
      </div>
    </div>
  );
}
