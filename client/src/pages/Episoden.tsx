import { ArrowLeft, Sparkles, Loader2 } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PodcastFeature } from "@/components/PodcastFeature";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

export default function Episoden() {
  const { isAuthenticated, loading } = useAuth();
  const { data: episodes, isLoading: episodesLoading } = trpc.podcastEpisodes.list.useQuery();

  // Scroll to anchor after page loads
  useEffect(() => {
    const hash = window.location.hash;
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 300);
    }
  }, []);

  const latestEpisode = episodes?.find(ep => ep.isLatest);
  const olderEpisodes = episodes?.filter(ep => !ep.isLatest) ?? [];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-4 py-4">
        <div className="container max-w-4xl mx-auto flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Startseite
            </Button>
          </Link>
          <div className="h-4 w-px bg-zinc-700" />
          <span className="text-xs text-zinc-500 uppercase tracking-widest font-mono">
            Maschinen atmen nicht · Alle Episoden
          </span>
        </div>
      </div>

      {/* Dezenter Registrierungs-Banner – nur für nicht-eingeloggte User */}
      {!loading && !isAuthenticated && (
        <div className="border-b border-amber-900/40 bg-amber-950/20 px-4 py-3">
          <div className="container max-w-4xl mx-auto flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-2 text-sm text-amber-200/80">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Für das volle KIICH-Erlebnis – Stimmklang-Analyse, Trainings &amp; mehr</span>
            </div>
            <Link href="/">
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-400 text-black font-semibold text-xs px-4 shrink-0"
              >
                Kostenlos registrieren →
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Headliner */}
        <div className="text-center">
          <p className="text-xs font-mono text-red-500 uppercase tracking-widest mb-3">DIE HÖRBUCHSERIE</p>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-1">MASCHINEN ATMEN NICHT</h1>
          <p className="text-orange-400 text-base font-medium">das interaktive HÖRBUCH von Thomas Chochola</p>
        </div>

        {/* WIE DIESES HÖRBUCH ENTSTEHT */}
        <div className="bg-zinc-900/60 border border-orange-500/15 rounded-2xl px-6 py-5">
          <p className="text-orange-400 text-xs font-black tracking-widest uppercase mb-3">Wie dieses Hörbuch entsteht</p>
          <p className="text-zinc-300 text-sm leading-relaxed">
            Im Sinne der KIICH Philosophie werden die originalen Rohtexte des Autors von KI-Stimmen <span className="text-zinc-400">(Google NotebookLM)</span> dialogmässig interpretiert. Die inhaltliche Aufbereitung legt dabei das Hauptaugenmerk auf leichte Verständlichkeit und praxisnaher Interpretation der Originaltexte.
          </p>
        </div>

        {/* Loading state */}
        {episodesLoading && (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 text-orange-400 animate-spin" />
          </div>
        )}

        {/* Aktuelle Episode */}
        {latestEpisode && (
          <div id={`episode-${latestEpisode.episodeNumber}`} style={{ scrollMarginTop: '80px' }}>
            <p className="text-xs text-orange-400 uppercase tracking-widest font-mono mb-4">
              Aktuelle Episode
            </p>
            <PodcastFeature
              topLabel="NEUESTE EPISODE"
              coverImage={latestEpisode.coverImageUrl}
              title={
                <>
                  2026 EPISODE {latestEpisode.episodeNumber}
                  <br />
                  <span className="text-orange-400 block mt-1">{latestEpisode.catchphrase}</span>
                </>
              }
              subtitle={latestEpisode.subtitle}
              audioUrl={latestEpisode.audioUrl}
              description={latestEpisode.description ?? undefined}
            />
          </div>
        )}

        {/* Frühere Episoden */}
        {olderEpisodes.length > 0 && (
          <div className="border-t border-zinc-800 pt-8">
            <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">
              Frühere Episoden
            </p>
            <div className="space-y-8">
              {olderEpisodes.map(ep => (
                <div key={ep.id} id={`episode-${ep.episodeNumber}`} style={{ scrollMarginTop: '80px' }}>
                  <PodcastFeature
                    coverImage={ep.coverImageUrl}
                    title={
                      <>
                        2026 EPISODE {ep.episodeNumber}
                        <br />
                        <span className="text-orange-400 block mt-1">{ep.catchphrase}</span>
                      </>
                    }
                    subtitle={ep.subtitle}
                    audioUrl={ep.audioUrl}
                    description={ep.description ?? undefined}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
