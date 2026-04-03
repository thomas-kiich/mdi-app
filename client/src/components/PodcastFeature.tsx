import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Music, BookOpen, ExternalLink, ChevronDown, ChevronUp } from "lucide-react";

interface PodcastFeatureProps {
  youtubeUrl?: string;
  spotifyUrl?: string;
  audioUrl?: string;
  coverImage: string;
  title: React.ReactNode;
  subtitle: string;
  description?: React.ReactNode;
  customAction?: React.ReactNode;
  underCoverContent?: React.ReactNode;
  topLabel?: string;
  titleClassName?: string;
}

export function PodcastFeature({
  youtubeUrl,
  spotifyUrl,
  audioUrl,
  coverImage,
  title,
  subtitle,
  description,
  customAction,
  underCoverContent,
  topLabel = "DIE HÖRBUCHSERIE",
  titleClassName = "text-3xl md:text-4xl font-bold mb-2",
}: PodcastFeatureProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-800/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Cover Image */}
          <div className="md:col-span-1 p-6 flex flex-col justify-center">
            <div className="relative group mx-auto w-full max-w-[180px]">
              <img
                src={coverImage}
                alt={typeof title === "string" ? title : "Podcast Episode"}
                className="w-full h-auto object-contain rounded-lg shadow-2xl group-hover:shadow-red-500/50 transition-shadow"
              />
            </div>
            {underCoverContent && (
              <div className="mt-4">
                {underCoverContent}
              </div>
            )}
          </div>

          {/* Content */}
          <div className="md:col-span-2 p-6 space-y-4">
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
              {description && (
                <div className="relative">
                  <div className="text-zinc-300 leading-relaxed max-w-lg transition-all duration-300">
                    {description}
                  </div>
                </div>
              )}
            </div>

            {/* Embedded Audio Player */}
            {audioUrl && (
              <div className="pt-2">
                <audio controls className="w-full h-12 rounded-md bg-zinc-900/50">
                  <source src={audioUrl} type="audio/mpeg" />
                  Dein Browser unterstützt das Audio-Element nicht.
                </audio>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-3 pt-4">
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

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
