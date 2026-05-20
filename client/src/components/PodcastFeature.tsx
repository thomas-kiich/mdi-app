import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Music, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface PodcastFeatureProps {
  youtubeUrl?: string;
  spotifyUrl?: string;
  audioUrl?: string;
  /** @deprecated Cover-Bilder werden nicht mehr angezeigt – Prop wird ignoriert */
  coverImage?: string | null;
  topLabel?: string;
  titleClassName?: string;
  title: React.ReactNode;
  subtitle: string;
  description?: React.ReactNode;
  customAction?: React.ReactNode;
  /** @deprecated Wird ohne Cover-Bild nicht mehr angezeigt */
  underCoverContent?: React.ReactNode;
}

function getProxiedAudioUrl(url?: string): string | undefined {
  if (!url) return undefined;
  // /manus-storage/ Pfade: Server-seitig auflösen via Proxy
  if (url.startsWith('/manus-storage/')) return `/api/audio-proxy?url=${encodeURIComponent(url)}`;
  // Andere lokale Pfade direkt verwenden
  if (url.startsWith('/') && !url.startsWith('/api/audio-proxy')) return url;
  // Bereits geproxied
  if (url.startsWith('/api/audio-proxy')) return url;
  // Externe URLs durch Proxy leiten (setzt korrekten Content-Type: audio/mpeg)
  return `/api/audio-proxy?url=${encodeURIComponent(url)}`;
}

export function PodcastFeature({
  youtubeUrl,
  spotifyUrl,
  audioUrl,
  title,
  subtitle,
  description,
  customAction,
  topLabel = "DIE HÖRBUCHSERIE",
  titleClassName = "text-3xl md:text-4xl font-bold mb-2",
}: PodcastFeatureProps) {
  const [descOpen, setDescOpen] = useState(false);
  const proxiedAudioUrl = getProxiedAudioUrl(audioUrl);

  return (
    <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-800/50 overflow-hidden">
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div>
          <div className="flex items-center gap-3 mb-2">
            <p className="text-sm font-mono text-red-500 uppercase tracking-widest">
              {topLabel}
            </p>
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 text-xs font-bold rounded-full border border-orange-500/30">
              JEDE WOCHE NEU
            </span>
          </div>
          <h2 className={titleClassName}>
            {typeof title === 'string' ? (
              <>
                <span className="text-red-500">{title.split(" ")[0]}</span>
                <br />
                <span className="text-white">{title.split(" ").slice(1).join(" ")}</span>
              </>
            ) : (
              title
            )}
          </h2>
          <div className="text-lg font-semibold mb-4">
            {subtitle.includes(" _ ") ? (
              <>
                <span className="text-orange-400">{subtitle.split(" _ ")[0]}</span>
                <br />
                <span className="text-white text-base font-normal mt-2 inline-block">{subtitle.split(" _ ")[1]}</span>
              </>
            ) : (
              <span className="text-orange-400">{subtitle}</span>
            )}
          </div>

          {/* Collapsible description */}
          {description && (
            <div>
              <button
                onClick={() => setDescOpen(prev => !prev)}
                className="flex items-center gap-2 text-xs font-bold text-orange-400 uppercase tracking-widest hover:text-orange-300 transition-colors group"
              >
                <BookOpen className="w-3.5 h-3.5 shrink-0" />
                Mehr lesen
                {descOpen
                  ? <ChevronUp className="w-3.5 h-3.5 shrink-0 transition-transform" />
                  : <ChevronDown className="w-3.5 h-3.5 shrink-0 transition-transform" />
                }
              </button>

              {descOpen && (
                <div className="mt-3 text-zinc-300 leading-relaxed max-w-2xl">
                  {description}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Embedded Audio Player */}
        {proxiedAudioUrl && (
          <div className="pt-2">
            <audio
              key={proxiedAudioUrl}
              controls
              preload="metadata"
              className="w-full rounded-md bg-zinc-900/50"
              style={{ height: '48px' }}
            >
              <source
                src={proxiedAudioUrl}
                type="audio/mpeg"
              />
              Dein Browser unterstützt das Audio-Element nicht.
            </audio>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 pt-2">
          {youtubeUrl && (
            <Button
              asChild
              className="bg-red-600 hover:bg-red-700 text-white font-bold"
            >
              <a href={youtubeUrl} target="_blank" rel="noopener noreferrer">
                <Play className="w-4 h-4 mr-2" />
                Auf YouTube ansehen
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}
          {spotifyUrl && (
            <Button
              asChild
              variant="outline"
              className="border-green-600 text-green-400 hover:bg-green-600/10"
            >
              <a href={spotifyUrl} target="_blank" rel="noopener noreferrer">
                <Music className="w-4 h-4 mr-2" />
                Auf Spotify hören
                <ExternalLink className="w-4 h-4 ml-2" />
              </a>
            </Button>
          )}

          {customAction && customAction}
        </div>
      </CardContent>
    </Card>
  );
}
