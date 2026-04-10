import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useState, useMemo } from "react";
import {
  ArrowLeft,
  Download,
  ChevronDown,
  ChevronUp,
  Loader2,
  Calendar,
  LogIn,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

// ─── Gravitationszentren ─────────────────────────────────────────────────────

const KATEGORIE_CONFIG = {
  ICH:     { emoji: "👤", farbe: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  QUELL:   { emoji: "⚡", farbe: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  KONZEPT: { emoji: "🧠", farbe: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  PROJEKT: { emoji: "🎯", farbe: "bg-green-500/20 text-green-300 border-green-500/30" },
  DIALOG:  { emoji: "💬", farbe: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  WELT:    { emoji: "🌍", farbe: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
} as const;

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

function formatDatumAnzeige(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString("de-DE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function formatDatumKurz(isoDate: string): string {
  const d = new Date(isoDate + "T12:00:00Z");
  return d.toLocaleDateString("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ─── Archiv-Tag-Karte ─────────────────────────────────────────────────────────

function TagKarte({
  datum,
  isSelected,
  onSelect,
}: {
  datum: string;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const heute = new Date().toISOString().split("T")[0];
  const istHeute = datum === heute;

  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full text-left px-4 py-3 rounded-xl border transition-all duration-150",
        isSelected
          ? "bg-violet-500/20 border-violet-500/40 text-white"
          : "bg-white/5 border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
      )}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium">
            {istHeute ? "Heute" : formatDatumAnzeige(datum)}
          </p>
          {!istHeute && (
            <p className="text-xs text-white/30 mt-0.5">{formatDatumKurz(datum)}</p>
          )}
        </div>
        <Calendar className={cn("w-4 h-4", isSelected ? "text-violet-400" : "text-white/20")} />
      </div>
    </button>
  );
}

// ─── Aufnahmen-Liste für einen Tag ───────────────────────────────────────────

function TagDetail({ datum }: { datum: string }) {
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const utils = trpc.useUtils();
  const { data: aufnahmen, isLoading } = trpc.momentaufnahme.tagAbrufen.useQuery({ datum });
  const { data: exportData } = trpc.momentaufnahme.obsidianExportTag.useQuery({ datum });

  const loeschenMutation = trpc.momentaufnahme.loeschen.useMutation({
    onSuccess: () => {
      utils.momentaufnahme.tagAbrufen.invalidate({ datum });
      utils.momentaufnahme.archivTage.invalidate();
      toast.success("Aufnahme gelöscht");
      setDeletingId(null);
    },
    onError: () => {
      toast.error("Löschen fehlgeschlagen");
      setDeletingId(null);
    },
  });

  const handleLoeschen = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Diese Aufnahme wirklich löschen? Das kann nicht rückgängig gemacht werden.")) return;
    setDeletingId(id);
    loeschenMutation.mutate({ id });
  };

  const handleExport = () => {
    if (!exportData) return;
    const blob = new Blob([exportData.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Obsidian-Datei heruntergeladen");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-white/30 animate-spin" />
      </div>
    );
  }

  if (!aufnahmen || aufnahmen.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="text-4xl mb-3 opacity-30">🎙️</div>
        <p className="text-white/30 text-sm">Keine Aufnahmen für diesen Tag.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Export-Button */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-xs text-white/40">
          {aufnahmen.length} Aufnahme{aufnahmen.length !== 1 ? "n" : ""}
        </p>
        <button
          onClick={handleExport}
          className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10"
        >
          <Download className="w-3.5 h-3.5" />
          Obsidian Export
        </button>
      </div>

      {/* Aufnahmen */}
      {aufnahmen.map((aufnahme) => {
        const kat = aufnahme.kategorie as keyof typeof KATEGORIE_CONFIG;
        const config = KATEGORIE_CONFIG[kat] ?? KATEGORIE_CONFIG.QUELL;
        const isExpanded = expandedId === aufnahme.id;
        const zeit = new Date(aufnahme.createdAt).toLocaleTimeString("de-DE", {
          hour: "2-digit",
          minute: "2-digit",
        });

        return (
          <div
            key={aufnahme.id}
            className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
          >
            <div
              className="flex items-start gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedId(isExpanded ? null : aufnahme.id)}
            >
              <span className="text-xl mt-0.5">{config.emoji}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-xs px-2 py-0.5 rounded-full border font-medium",
                      config.farbe
                    )}
                  >
                    {kat}
                  </span>
                  <span className="text-xs text-white/30">{zeit}</span>
                  {aufnahme.dauerSekunden && (
                    <span className="text-xs text-white/20">
                      {Math.floor(aufnahme.dauerSekunden / 60)}:{String(aufnahme.dauerSekunden % 60).padStart(2, "0")}
                    </span>
                  )}
                </div>
                <p className="text-sm text-white/70 line-clamp-2">
                  {aufnahme.zusammenfassung || aufnahme.text}
                </p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {/* Audio-Download */}
                {aufnahme.audioUrl && (
                  <a
                    href={aufnahme.audioUrl}
                    download={`${datum}-aufnahme-${aufnahme.id}.webm`}
                    onClick={(e) => e.stopPropagation()}
                    className="p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-white/60 transition-colors"
                    title="Audio herunterladen"
                  >
                    <Download className="w-3.5 h-3.5" />
                  </a>
                )}
                {/* Löschen */}
                <button
                  onClick={(e) => handleLoeschen(aufnahme.id, e)}
                  disabled={deletingId === aufnahme.id}
                  className="p-1.5 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                  title="Aufnahme löschen"
                >
                  {deletingId === aufnahme.id ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Trash2 className="w-3.5 h-3.5" />
                  )}
                </button>
                {isExpanded ? (
                  <ChevronUp className="w-4 h-4 text-white/30" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-white/30" />
                )}
              </div>
            </div>
            {isExpanded && (
              <div className="px-4 pb-4 pt-0 border-t border-white/5">
                <p className="text-sm text-white/60 leading-relaxed mt-3">{aufnahme.text}</p>
                {aufnahme.audioUrl && (
                  <div className="mt-3">
                    <audio
                      controls
                      src={aufnahme.audioUrl}
                      className="w-full h-8 opacity-60"
                      style={{ filter: "invert(1) brightness(0.5)" }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Hauptseite ───────────────────────────────────────────────────────────────

export default function MomentaufnahmeArchiv() {
  const { loading, isAuthenticated } = useAuth();
  const { data: tage, isLoading: tageLoading } = trpc.momentaufnahme.archivTage.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const heute = useMemo(() => new Date().toISOString().split("T")[0], []);
  const [selectedDatum, setSelectedDatum] = useState<string | null>(null);

  // Automatisch heutigen Tag vorauswählen wenn vorhanden
  const aktiverTag = selectedDatum ?? (tage?.includes(heute) ? heute : tage?.[0] ?? null);

  // ─── Login-Gate ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">📅</div>
        <h1 className="text-2xl font-bold text-white mb-2">ARCHIV</h1>
        <p className="text-white/50 mb-8 max-w-xs">
          Deine vergangenen Gedanken. Melde dich an um das Archiv zu öffnen.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <LogIn className="w-4 h-4" />
          Anmelden
        </Button>
      </div>
    );
  }

  // ─── Hauptansicht ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-white/5">
        <Link href="/momentaufnahme">
          <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-wide">ARCHIV</h1>
          <p className="text-xs text-white/40">
            {tage?.length
              ? `${tage.length} Tag${tage.length !== 1 ? "e" : ""} mit Aufnahmen`
              : "Noch keine Aufnahmen"}
          </p>
        </div>
      </header>

      {/* Inhalt */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* Linke Spalte: Tages-Liste */}
        <div className="md:w-72 md:border-r border-white/5 overflow-y-auto">
          <div className="p-4 space-y-2">
            {tageLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-white/30 animate-spin" />
              </div>
            ) : !tage || tage.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/30 text-sm">Noch keine Aufnahmen vorhanden.</p>
                <Link href="/momentaufnahme">
                  <button className="mt-3 text-xs text-violet-400 hover:text-violet-300 transition-colors">
                    Erste Aufnahme starten →
                  </button>
                </Link>
              </div>
            ) : (
              tage.map((datum) => (
                <TagKarte
                  key={datum}
                  datum={datum}
                  isSelected={aktiverTag === datum}
                  onSelect={() => setSelectedDatum(datum)}
                />
              ))
            )}
          </div>
        </div>

        {/* Rechte Spalte: Aufnahmen des gewählten Tages */}
        <div className="flex-1 overflow-y-auto p-5">
          {aktiverTag ? (
            <>
              <h2 className="text-base font-semibold text-white/80 mb-4">
                {aktiverTag === heute ? "Heute" : formatDatumAnzeige(aktiverTag)}
              </h2>
              <TagDetail datum={aktiverTag} />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-20 text-center">
              <div className="text-4xl mb-3 opacity-20">📅</div>
              <p className="text-white/20 text-sm">Wähle einen Tag aus der Liste.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
