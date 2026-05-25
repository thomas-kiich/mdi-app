import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Loader2, Mail, Mic, CheckCircle, Clock, User, BarChart2 } from "lucide-react";
import { Link } from "wouter";

export default function AdminStimmklang() {
  const { user, loading, isAuthenticated } = useAuth();
  const { data: anfragen, isLoading: laedtAnfragen } = trpc.stimmklang.adminBeratungsanfragen.useQuery();
  const { data: messungen, isLoading: laedtMessungen } = trpc.stimmklang.adminMessungen.useQuery();
  const { data: finaleProfile, isLoading: laedtProfile } = trpc.stimmklang.adminFinaleProfile.useQuery();

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

  // Eindeutige User-IDs aus Messungen ermitteln
  const eindeutigeNutzer = messungen
    ? Array.from(new Set(messungen.map((m) => m.userId)))
    : [];

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-10">

        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/admin">
            <button className="text-zinc-500 hover:text-zinc-300 transition-colors">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div>
            <h1 className="text-2xl font-light text-white tracking-tight">Stimmklanganalyse</h1>
            <p className="text-zinc-500 text-sm">Beratungsanfragen · Messungen · Nutzer-Übersicht</p>
          </div>
        </div>

        {/* Statistik-Kacheln */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="text-3xl font-bold text-orange-400 mb-1">
              {laedtAnfragen ? "…" : (anfragen?.length ?? 0)}
            </div>
            <div className="text-xs text-zinc-500">Beratungsanfragen gesamt</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="text-3xl font-bold text-green-400 mb-1">
              {laedtAnfragen ? "…" : (anfragen?.filter((a) => a.emailVersendet).length ?? 0)}
            </div>
            <div className="text-xs text-zinc-500">E-Mails versendet</div>
          </div>
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-5">
            <div className="text-3xl font-bold text-blue-400 mb-1">
              {laedtMessungen ? "…" : eindeutigeNutzer.length}
            </div>
            <div className="text-xs text-zinc-500">Nutzer haben gemessen</div>
          </div>
        </div>

        {/* Beratungsanfragen */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mail className="w-4 h-4 text-orange-400" />
            <h2 className="text-sm font-mono tracking-widest text-orange-400/60 uppercase">Beratungsanfragen</h2>
          </div>

          {laedtAnfragen ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
          ) : anfragen && anfragen.length > 0 ? (
            <div className="space-y-3">
              {anfragen.map((anfrage) => (
                <div
                  key={anfrage.id}
                  className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5"
                >
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-orange-400" />
                      </div>
                      <div>
                        <div className="font-semibold text-white text-sm">{anfrage.name}</div>
                        <a
                          href={`mailto:${anfrage.email}`}
                          className="text-orange-400 text-xs hover:underline"
                        >
                          {anfrage.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {anfrage.emailVersendet ? (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> E-Mail gesendet
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-zinc-500 text-xs">
                          <Clock className="w-3 h-3" /> Ausstehend
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    {anfrage.metapher && (
                      <div className="bg-zinc-800/50 rounded-lg p-3">
                        <div className="text-zinc-500 mb-1">Lichtklangcharakter</div>
                        <div className="text-white font-semibold">{anfrage.metapher}</div>
                        {anfrage.dominanteMdiId && (
                          <div className="text-zinc-500 mt-0.5">MDI-Typ {anfrage.dominanteMdiId}</div>
                        )}
                      </div>
                    )}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="text-zinc-500 mb-1">Eingegangen</div>
                      <div className="text-white">
                        {anfrage.createdAt
                          ? new Date(anfrage.createdAt).toLocaleDateString("de-AT", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "–"}
                      </div>
                    </div>
                  </div>

                  {anfrage.nachricht && (
                    <div className="bg-zinc-800/30 rounded-lg p-3 text-xs">
                      <div className="text-zinc-500 mb-1">Nachricht</div>
                      <div className="text-zinc-300 leading-relaxed whitespace-pre-wrap">{anfrage.nachricht}</div>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-zinc-800">
                    <a
                      href={`mailto:${anfrage.email}?subject=Dein Stimmklangprofil – Persönliches Gespräch&body=Liebe/r ${anfrage.name},%0A%0A`}
                      className="inline-flex items-center gap-2 text-xs text-orange-400 hover:text-orange-300 transition-colors"
                    >
                      <Mail className="w-3 h-3" />
                      Antworten an {anfrage.name}
                    </a>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 text-sm">
              Noch keine Beratungsanfragen eingegangen.
            </div>
          )}
        </div>

        {/* Finale Profile pro User */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-4 h-4 text-purple-400" />
            <h2 className="text-sm font-mono tracking-widest text-purple-400/60 uppercase">Finale Profile (nach 3 Tagen)</h2>
            <span className="text-zinc-600 text-xs ml-auto">
              {laedtProfile ? "…" : `${finaleProfile?.length ?? 0} vollständige Profile`}
            </span>
          </div>

          {laedtProfile ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
          ) : finaleProfile && finaleProfile.length > 0 ? (
            <div className="space-y-4">
              {finaleProfile.map((profil) => (
                <div key={profil.userId} className="bg-zinc-900/30 border border-zinc-800 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-purple-500/20 flex items-center justify-center">
                        <User className="w-4 h-4 text-purple-400" />
                      </div>
                      <div>
                        <div className="text-xs text-zinc-500 font-mono">User-ID {String(profil.userId).slice(0, 8)}…</div>
                        <div className="text-sm font-semibold text-white">
                          {profil.grundtonMetapher ?? `MDI-Typ ${profil.grundtonMdiId}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-zinc-500">{profil.gesamtTage} Messtage</div>
                      <div className="text-xs text-purple-400 font-mono">GRUNDTON: TYP {profil.grundtonMdiId}</div>
                    </div>
                  </div>

                  {/* Top-5 Balken */}
                  <div className="space-y-1.5 mb-3">
                    {profil.top5.map((eintrag, idx) => (
                      <div key={eintrag.mdiId} className="flex items-center gap-2">
                        <div className="text-xs text-zinc-600 font-mono w-4">{idx + 1}.</div>
                        <div className="flex-1 h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${Math.min(eintrag.prozent, 100)}%`,
                              backgroundColor: idx === 0 ? "#a855f7" : "#52525b",
                            }}
                          />
                        </div>
                        <div className="text-xs font-mono text-zinc-400 w-12 text-right">
                          Typ {eintrag.mdiId}
                        </div>
                        <div className="text-xs font-mono text-zinc-500 w-10 text-right">
                          {eintrag.prozent.toFixed(1)}%
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* 3 Messtage */}
                  <div className="flex gap-2 pt-3 border-t border-zinc-800">
                    {profil.tage.map((tag, idx) => (
                      <div key={tag.datum} className="flex-1 bg-zinc-800/50 rounded-lg p-2 text-center">
                        <div className="text-xs text-zinc-500 mb-0.5">Tag {idx + 1}</div>
                        <div className="text-xs text-zinc-300 font-mono">{tag.datum}</div>
                        <div className="text-xs text-zinc-400 mt-0.5 truncate">{tag.metapher ?? `Typ ${tag.mdiId}`}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 text-sm">
              Noch keine vollständigen 3-Tage-Profile vorhanden.
            </div>
          )}
        </div>

        {/* Messungs-Übersicht */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Mic className="w-4 h-4 text-blue-400" />
            <h2 className="text-sm font-mono tracking-widest text-blue-400/60 uppercase">Messungen</h2>
            <span className="text-zinc-600 text-xs ml-auto">
              {laedtMessungen ? "…" : `${messungen?.length ?? 0} gesamt`}
            </span>
          </div>

          {laedtMessungen ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
            </div>
          ) : messungen && messungen.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left text-zinc-500 font-normal pb-3 pr-4">Datum</th>
                    <th className="text-left text-zinc-500 font-normal pb-3 pr-4">User-ID</th>
                    <th className="text-left text-zinc-500 font-normal pb-3 pr-4">Tag</th>
                    <th className="text-left text-zinc-500 font-normal pb-3 pr-4">MDI-Typ</th>
                    <th className="text-left text-zinc-500 font-normal pb-3 pr-4">Lichtklangcharakter</th>
                    <th className="text-left text-zinc-500 font-normal pb-3">Hz</th>
                  </tr>
                </thead>
                <tbody>
                  {messungen.map((m) => (
                    <tr key={m.id} className="border-b border-zinc-900 hover:bg-zinc-900/30 transition-colors">
                      <td className="py-3 pr-4 text-zinc-400">{m.datumISO}</td>
                      <td className="py-3 pr-4 text-zinc-600 font-mono">{String(m.userId).slice(0, 8)}…</td>
                      <td className="py-3 pr-4">
                        <span
                          className="px-2 py-0.5 rounded-full text-xs font-bold"
                          style={{
                            backgroundColor: m.tagNummer >= 3 ? "#16a34a22" : "#f9731622",
                            color: m.tagNummer >= 3 ? "#4ade80" : "#fb923c",
                          }}
                        >
                          Tag {m.tagNummer}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-white font-semibold">{m.dominanteMdiId}</td>
                      <td className="py-3 pr-4 text-zinc-300">{m.metapher ?? "–"}</td>
                      <td className="py-3 text-zinc-400">
                        {m.dominanteFrequenz ? `${Number(m.dominanteFrequenz).toFixed(1)} Hz` : "–"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-600 text-sm">
              Noch keine Messungen gespeichert.
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
