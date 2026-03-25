import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Play, Music, BookOpen, ExternalLink } from "lucide-react";

interface PodcastFeatureProps {
  youtubeUrl?: string;
  spotifyUrl?: string;
  coverImage: string;
  title: string;
  subtitle: string;
  description: React.ReactNode;
}

export function PodcastFeature({
  youtubeUrl,
  spotifyUrl,
  coverImage,
  title,
  subtitle,
  description,
}: PodcastFeatureProps) {
  return (
    <Card className="bg-gradient-to-r from-red-900/20 to-orange-900/20 border-red-800/50 overflow-hidden">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-3 gap-6 items-center">
          {/* Cover Image */}
          <div className="md:col-span-1 p-6">
            <div className="relative group">
              <img
                src={coverImage}
                alt={title}
                className="w-full rounded-lg shadow-2xl group-hover:shadow-red-500/50 transition-shadow"
              />
              <div className="absolute inset-0 rounded-lg bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="md:col-span-2 p-6 space-y-4">
            <div>
              <p className="text-sm font-mono text-red-500 uppercase tracking-widest mb-2">
                📚 DAS HÖRBUCH
              </p>
              <h2 className="text-3xl md:text-4xl font-bold mb-2">
                <span className="text-red-500">{title.split(" ")[0]}</span>
                <br />
                <span className="text-white">{title.split(" ").slice(1).join(" ")}</span>
              </h2>
              <p className="text-lg text-orange-400 font-semibold mb-4">{subtitle}</p>
              <p className="text-zinc-300 leading-relaxed max-w-lg">{description}</p>
            </div>

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
              {!youtubeUrl && !spotifyUrl && (
                <div className="text-sm text-zinc-500 italic">
                  Links folgen in Kürze...
                </div>
              )}
            </div>

          </div>
        </div>
      </CardContent>
    </Card>
  );
}
