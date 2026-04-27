import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { ArrowLeft, Loader2, BookOpen, Mic, BarChart3, Users, TrendingUp, Headphones } from "lucide-react";

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

export default function AdminStatistik() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: einschlaf, isLoading: einschlafLoading } = trpc.admin.getEinschlafStats.useQuery();
  const { data: yohn, isLoading: yohnLoading } = trpc.admin.getMomentaufnahmenStats.useQuery();

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
        <Link href="/">
          <button className="text-xs text-orange-400 border border-orange-500/40 rounded px-4 py-2 hover:bg-orange-500/10 transition-colors">
            Zur Startseite
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
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
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <BookOpen className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-semibold text-orange-400 uppercase tracking-widest font-mono">Einschlafbibliothek</h2>
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
                      <div key={n.userId} className="flex items-center justify-between border border-zinc-800/60 rounded-lg px-3 py-2 bg-zinc-900/20">
                        <span className="text-sm text-zinc-300">{n.vorname || n.name || `User #${n.userId}`}</span>
                        <span className="text-xs text-orange-400 font-bold font-mono">{n.count} Geschichten</span>
                      </div>
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
          <div className="flex items-center gap-2 border-b border-zinc-800 pb-3">
            <Mic className="w-4 h-4 text-cyan-400" />
            <h2 className="text-sm font-semibold text-cyan-400 uppercase tracking-widest font-mono">YOHN-Training · Momentaufnahmen</h2>
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
                      <div key={n.userId} className="flex items-center justify-between border border-zinc-800/60 rounded-lg px-3 py-2 bg-zinc-900/20">
                        <span className="text-sm text-zinc-300">{n.vorname || n.name || `User #${n.userId}`}</span>
                        <span className="text-xs text-cyan-400 font-bold font-mono">{n.count} Aufnahmen</span>
                      </div>
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
