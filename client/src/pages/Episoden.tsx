import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PodcastFeature } from "@/components/PodcastFeature";

export default function Episoden() {
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

      {/* Content */}
      <div className="container max-w-4xl mx-auto px-4 py-12 space-y-12">

        {/* Aktuelle Episode */}
        <div>
          <p className="text-xs text-orange-400 uppercase tracking-widest font-mono mb-4">
            Aktuelle Episode
          </p>
          <PodcastFeature
            topLabel="NEUESTE EPISODE"
            title={
              <>
                2026 EPISODE 02
                <br />
                <span className="text-orange-400 block mt-1">EXTREME ZEITEN!</span>
              </>
            }
            subtitle="Wie bleibe ich der Dirigent meines Lebens? _ Warum es enorme Vorteile für dich bietet, wenn du deinen Körper verstehst und ihm gibst was er wirklich braucht..."
            coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png"
            audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/EPISODE_02_8bca4d18.mp3"
          />
        </div>

        {/* Trennlinie */}
        <div className="border-t border-zinc-800 pt-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">
            Frühere Episoden
          </p>
          <PodcastFeature
            title={
              <>
                2026 EPISODE 01
                <br />
                <span className="text-orange-400 block mt-1">BEFEHL ERTEILT!</span>
              </>
            }
            subtitle="Wer lenkt mein Leben im Agentenzeitalter? _ Warum der Takt der MASCHINEN dich von deinem einzigartigen Lebenspuls entfremdet und wie du das verhindern kannst..."
            coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png"
            audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/podcast_01_8f2ce81d.mp3"
          />
        </div>

      </div>
    </div>
  );
}
