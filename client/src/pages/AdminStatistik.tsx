import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { useState } from "react";
import { ArrowLeft, Loader2, BookOpen, Mic, Users, TrendingUp, Download, X, ChevronRight } from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const KATEGORIE_LABELS: Record<string, string> = {
  MAERCHEN: "Märchen",
  ABENTEUER: "Abenteuer",
  BEFINDLICHKEIT: "Befindlichkeit",
  ICH: "ICH",
  QUELL: "QUELL",
  KONZEPT: "KONZEPT",
  PROJEKT: "PROJEKT",
  DIALOG: "DIALOG",
  WELT: "WELT",
};

const KATEGORIE_COLORS: Record<string, string> = {
  MAERCHEN: "text-purple-400",
  ABENTEUER: "text-blue-400",
  BEFINDLICHKEIT: "text-orange-400",
  ICH: "text-red-400",
  QUELL: "text-amber-400",
  KONZEPT: "text-cyan-400",
  PROJEKT: "text-green-400",
  DIALOG: "text-pink-400",
  WELT: "text-indigo-400",
};

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40">
      <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-1">{label}</div>
      <div className="text-2xl font-bold text-white">{value}</div>
      {sub && <div className="text-xs text-zinc-600 mt-1">{sub}</div>}
    </div>
  );
}

// ── Zeitverlauf-Diagramm ──────────────────────────────────────────────────────
function ZeitverlaufChart({ feature, color }: { feature: "einschlaf" | "momentaufnahmen"; color: string }) {
  const { data, isLoading } = trpc.admin.getZeitverlauf.useQuery({ feature });

  if (isLoading) return <div className="flex justify-center py-6"><Loader2 className={`w-4 h-4 animate-spin ${color}`} /></div>;
  if (!data || data.every(d => d.count === 0)) return <p className="text-zinc-600 text-xs text-center py-4">Noch keine Daten für diesen Zeitraum.</p>;

  const formatted = data.map(d => ({
    ...d,
    label: d.datum.slice(5), // MM-DD
  }));

  return (
    <div className="h-40">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={formatted} margin={{ top: 4, right: 4, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id={`grad-${feature}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color === "text-orange-400" ? "#f97316" : "#22d3ee"} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color === "text-orange-400" ? "#f97316" : "#22d3ee"} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
          <XAxis dataKey="label" tick={{ fontSize: 9, fill: "#52525b" }} tickLine={false} interval={6} />
          <YAxis tick={{ fontSize: 9, fill: "#52525b" }} tickLine={false} allowDecimals={false} />
          <Tooltip
            contentStyle={{ background: "#18181b", border: "1px solid #3f3f46", borderRadius: 8, fontSize: 11 }}
            labelStyle={{ color: "#a1a1aa" }}
            itemStyle={{ color: "#fff" }}
          />
          <Area
            type="monotone"
            dataKey="count"
            stroke={color === "text-orange-400" ? "#f97316" : "#22d3ee"}
            strokeWidth={1.5}
            fill={`url(#grad-${feature})`}
            name="Nutzungen"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Nutzer-Detail-Modal ───────────────────────────────────────────────────────
function NutzerDetailModal({ userId, onClose }: { userId: number; onClose: () => void }) {
  const { data, isLoading } = trpc.admin.getUserDetail.useQuery({ userId });

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto p-6 space-y-5"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-white font-semibold">Nutzer-Details</h3>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-orange-400 animate-spin" /></div>
        ) : data ? (
          <>
            {/* Nutzer-Info */}
            <div className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/40 space-y-1">
              <div className="text-white font-medium">{data.user.vorname || data.user.name}</div>
              <div className="text-zinc-500 text-xs">{data.user.email}</div>
              <div className="text-zinc-600 text-xs font-mono">
                Registriert: {data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString("de-AT") : "–"}
                {" · "}
                Zuletzt aktiv: {data.user.lastSignedIn ? new Date(data.user.lastSignedIn).toLocaleDateString("de-AT") : "–"}
              </div>
            </div>

            {/* Einschlafgeschichten */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3 h-3" /> Einschlafgeschichten ({data.geschichten.length})
              </div>
              {data.geschichten.length === 0 ? (
                <p className="text-zinc-700 text-xs">Keine Geschichten.</p>
              ) : (
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {data.geschichten.map(g => (
                    <div key={g.id} className="flex items-center justify-between border border-zinc-800/50 rounded-lg px-3 py-1.5 bg-zinc-900/20 text-xs">
                      <div className="flex items-center gap-2">
                        <span className={KATEGORIE_COLORS[g.kategorie] ?? "text-zinc-400"}>{KATEGORIE_LABELS[g.kategorie] ?? g.kategorie}</span>
                        <span className="text-zinc-400 truncate max-w-48">{g.thema}</span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {g.audioUrl && <span className="text-emerald-500 text-xs">▶</span>}
                        <span className="text-zinc-600 font-mono">{g.createdAt ? new Date(g.createdAt).toLocaleDateString("de-AT") : "–"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Momentaufnahmen */}
            <div>
              <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-2 flex items-center gap-1.5">
                <Mic className="w-3 h-3" /> YOHN-Aufnahmen ({data.aufnahmen.length})
              </div>
              {data.aufnahmen.length === 0 ? (
                <p className="text-zinc-700 text-xs">Keine Aufnahmen.</p>
              ) : (
                <div className="space-y-1.5 max-h-40 overflow-y-auto">
                  {data.aufnahmen.map(a => (
                    <div key={a.id} className="flex items-center justify-between border border-zinc-800/50 rounded-lg px-3 py-1.5 bg-zinc-900/20 text-xs">
                      <span className={KATEGORIE_COLORS[a.kategorie] ?? "text-zinc-400"}>{KATEGORIE_LABELS[a.kategorie] ?? a.kategorie}</span>
                      <span className="text-zinc-600 font-mono">{a.createdAt ? new Date(a.createdAt).toLocaleDateString("de-AT") : "–"}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <p className="text-zinc-600 text-sm">Nutzer nicht gefunden.</p>
        )}
      </div>
    </div>
  );
}

// ── CSV-Export-Button ─────────────────────────────────────────────────────────
function CsvExportButton({ feature, label, color }: { feature: "einschlaf" | "momentaufnahmen"; label: string; color: string }) {
  const [loading, setLoading] = useState(false);
  const einschlafCsv = trpc.admin.exportEinschlafCsv.useQuery(undefined, { enabled: false });
  const momentaufnahmenCsv = trpc.admin.exportMomentaufnahmenCsv.useQuery(undefined, { enabled: false });

  const handleExport = async () => {
    setLoading(true);
    try {
      let csv: string | undefined;
      if (feature === "einschlaf") {
        const result = await einschlafCsv.refetch();
        csv = result.data;
      } else {
        const result = await momentaufnahmenCsv.refetch();
        csv = result.data;
      }
      if (!csv) return;

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kiich-${feature}-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className={`flex items-center gap-1.5 text-xs border rounded-lg px-3 py-1.5 transition-colors ${color === "orange"
        ? "border-orange-500/40 text-orange-400 hover:bg-orange-500/10"
        : "border-cyan-500/40 text-cyan-400 hover:bg-cyan-500/10"
        } disabled:opacity-50`}
    >
      {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Download className="w-3 h-3" />}
      {label} als CSV
    </button>
  );
}

// ── Hauptseite ────────────────────────────────────────────────────────────────
export default function AdminStatistik() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: einschlaf, isLoading: einschlafLoading } = trpc.admin.getEinschlafStats.useQuery();
  const { data: yohn, isLoading: yohnLoading } = trpc.admin.getMomentaufnahmenStats.useQuery();
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p className="text-sm">Kein Zugriff.</p>
        <Link href="/admin">
          <button className="text-xs text-orange-400 border border-orange-500/40 rounded px-4 py-2 hover:bg-orange-500/10 transition-colors">
            Zum Admin-Bereich
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      {selectedUserId !== null && (
        <NutzerDetailModal userId={selectedUserId} onClose={() => setSelectedUserId(null)} />
      )}

      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/admin">
            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors mb-2">
              <ArrowLeft className="w-3 h-3" /> ADMIN-ZENTRALE
            </button>
          </Link>
          <h1 className="text-3xl font-light text-white tracking-tight">Nutzungsstatistik</h1>
          <p className="text-zinc-500 text-sm">Einschlafbibliothek · YOHN-Training · Aktivste Nutzer</p>
        </div>

        {/* ── EINSCHLAFBIBLIOTHEK ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-orange-400" />
              <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-widest font-mono">Einschlafbibliothek</h2>
            </div>
            <CsvExportButton feature="einschlaf" label="Einschlafbibliothek" color="orange" />
          </div>

          {einschlafLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-orange-400 animate-spin" /></div>
          ) : einschlaf ? (
            <div className="space-y-6">
              {/* Kennzahlen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Gesamt" value={einschlaf.total} />
                <StatCard label="Letzte 7 Tage" value={einschlaf.letzteWoche} />
                <StatCard label="Letzte 30 Tage" value={einschlaf.letzterMonat} />
                <StatCard label="Mit Audio abgehört" value={einschlaf.mitAudio} sub={`${einschlaf.total > 0 ? Math.round((einschlaf.mitAudio / einschlaf.total) * 100) : 0}% der Geschichten`} />
              </div>

              {/* Zeitverlauf */}
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Zeitverlauf (letzte 30 Tage)
                </div>
                <ZeitverlaufChart feature="einschlaf" color="text-orange-400" />
              </div>

              {/* Kategorien */}
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Nach Kategorie</div>
                <div className="flex flex-wrap gap-3">
                  {einschlaf.byKategorie.map((k) => (
                    <div key={k.kategorie} className="border border-zinc-800 rounded-lg px-4 py-2 bg-zinc-900/40 flex items-center gap-2">
                      <span className={`text-sm font-semibold ${KATEGORIE_COLORS[k.kategorie] ?? "text-zinc-300"}`}>
                        {KATEGORIE_LABELS[k.kategorie] ?? k.kategorie}
                      </span>
                      <span className="text-white font-bold">{k.count}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Befindlichkeits-Themen */}
              {einschlaf.topThemen.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Top Befindlichkeits-Themen</div>
                  <div className="space-y-2">
                    {einschlaf.topThemen.map((t, i) => {
                      const maxCount = einschlaf.topThemen[0]?.count ?? 1;
                      const pct = Math.round((t.count / maxCount) * 100);
                      return (
                        <div key={t.thema} className="flex items-center gap-3">
                          <span className="text-xs text-zinc-600 font-mono w-4 text-right">{i + 1}</span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-0.5">
                              <span className="text-sm text-zinc-300 truncate">{t.thema}</span>
                              <span className="text-xs text-orange-400 font-bold ml-2 shrink-0">{t.count}×</span>
                            </div>
                            <div className="h-1 bg-zinc-800 rounded-full overflow-hidden">
                              <div className="h-full bg-orange-500/60 rounded-full" style={{ width: `${pct}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Aktivste Nutzer */}
              {einschlaf.aktivsteNutzer.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Aktivste Nutzer
                  </div>
                  <div className="space-y-1.5">
                    {einschlaf.aktivsteNutzer.map((n) => (
                      <button
                        key={n.userId}
                        onClick={() => setSelectedUserId(n.userId)}
                        className="w-full flex items-center justify-between border border-zinc-800/60 rounded-lg px-3 py-2 bg-zinc-900/20 hover:bg-zinc-800/40 transition-colors group"
                      >
                        <span className="text-sm text-zinc-300">{n.vorname || n.name || `User #${n.userId}`}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-orange-400 font-bold font-mono">{n.count} Geschichten</span>
                          <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">Keine Daten verfügbar.</p>
          )}
        </section>

        {/* ── YOHN-TRAINING / MOMENTAUFNAHMEN ── */}
        <section className="space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2">
              <Mic className="w-4 h-4 text-cyan-400" />
              <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest font-mono">YOHN-Training · Momentaufnahmen</h2>
            </div>
            <CsvExportButton feature="momentaufnahmen" label="YOHN" color="cyan" />
          </div>

          {yohnLoading ? (
            <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-cyan-400 animate-spin" /></div>
          ) : yohn ? (
            <div className="space-y-6">
              {/* Kennzahlen */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard label="Gesamt" value={yohn.total} />
                <StatCard label="Letzte 7 Tage" value={yohn.letzteWoche} />
                <StatCard label="Letzte 30 Tage" value={yohn.letzterMonat} />
                <StatCard label="Ø Aufnahmedauer" value={`${yohn.avgDauer}s`} sub="Sekunden pro Aufnahme" />
              </div>

              {/* Zeitverlauf */}
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3" /> Zeitverlauf (letzte 30 Tage)
                </div>
                <ZeitverlaufChart feature="momentaufnahmen" color="text-cyan-400" />
              </div>

              {/* Gravitationszentren */}
              {yohn.byKategorie.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3">Gravitationszentren</div>
                  <div className="flex flex-wrap gap-3">
                    {yohn.byKategorie.map((k) => (
                      <div key={k.kategorie} className="border border-zinc-800 rounded-lg px-4 py-2 bg-zinc-900/40 flex items-center gap-2">
                        <span className={`text-sm font-semibold ${KATEGORIE_COLORS[k.kategorie] ?? "text-zinc-300"}`}>
                          {KATEGORIE_LABELS[k.kategorie] ?? k.kategorie}
                        </span>
                        <span className="text-white font-bold">{k.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Aktivste Nutzer */}
              {yohn.aktivsteNutzer.length > 0 && (
                <div>
                  <div className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-3 flex items-center gap-1.5">
                    <Users className="w-3 h-3" /> Aktivste Nutzer
                  </div>
                  <div className="space-y-1.5">
                    {yohn.aktivsteNutzer.map((n) => (
                      <button
                        key={n.userId}
                        onClick={() => setSelectedUserId(n.userId)}
                        className="w-full flex items-center justify-between border border-zinc-800/60 rounded-lg px-3 py-2 bg-zinc-900/20 hover:bg-zinc-800/40 transition-colors group"
                      >
                        <span className="text-sm text-zinc-300">{n.vorname || n.name || `User #${n.userId}`}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-cyan-400 font-bold font-mono">{n.count} Aufnahmen</span>
                          <ChevronRight className="w-3 h-3 text-zinc-600 group-hover:text-zinc-400 transition-colors" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <p className="text-zinc-600 text-sm">Keine Daten verfügbar.</p>
          )}
        </section>

        <p className="text-zinc-700 text-xs text-center font-mono pb-6">
          KIICH Statistik · {user?.name || "thomas"}
        </p>
      </div>
    </div>
  );
}
