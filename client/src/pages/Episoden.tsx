import { ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PodcastFeature } from "@/components/PodcastFeature";
import { useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";

export default function Episoden() {
  const { isAuthenticated, loading } = useAuth();

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

        {/* Aktuelle Episode – Episode 04 */}
        <div id="episode-04" style={{ scrollMarginTop: '80px' }}>
          <p className="text-xs text-orange-400 uppercase tracking-widest font-mono mb-4">
            Aktuelle Episode
          </p>
          <PodcastFeature
            topLabel="NEUESTE EPISODE"
            title={
              <>
                2026 EPISODE 04
                <br />
                <span className="text-orange-400 block mt-1">ECHT KRASS!</span>
              </>
            }
            subtitle="MASCHINEN wollen atmen? _ Heute musst du entscheiden, wer du wirklich sein willst ..."
            coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png"
            description={
              <div className="mt-4 border border-zinc-700/50 bg-zinc-900/50 rounded-xl px-4 py-4">
                <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Inhalt dieser Episode....</p>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  Thomas Chochola thematisiert die essenzielle Bedeutung der bewussten Atmung als Werkzeug für individuelle Selbstbestimmung in einer zunehmend technologisierten Welt des Jahres 2026. Er nutzt das Beispiel einer Künstlichen Intelligenz, die das Atmen als ihre erste Priorität wählt, um die biologische Notwendigkeit dieses Vorgangs für Körper und Geist zu verdeutlichen. Der Autor warnt vor einer wachsenden Fremdbestimmung durch smarte Technologien, welche die menschliche Intuition und Eigenverantwortung zu verdrängen drohen. Als Gegenentwurf wird ein ganzheitliches Weltbild präsentiert, in dem alles durch physikalische Energien und Frequenzen miteinander verbunden ist. Um diese Verbindung aktiv zu nutzen, stellt die Quelle das Befindlichkeitstraining vor, welches durch die Harmonisierung von Licht und Klang die innere Balance fördern soll. Letztlich fungiert der Text als leidenschaftlicher Appell, die eigene Rolle als Dirigent des Lebens anzunehmen und durch Achtsamkeit aus der passiven Komfortzone auszubrechen.
                </p>
              </div>
            }
          />
        </div>

        {/* Trennlinie – Frühere Episoden */}
        <div className="border-t border-zinc-800 pt-8">
          <p className="text-xs text-zinc-500 uppercase tracking-widest font-mono mb-6">
            Frühere Episoden
          </p>

          <div id="episode-03" style={{ scrollMarginTop: '80px' }}>
            <PodcastFeature
              title={
                <>
                  2026 EPISODE 03
                  <br />
                  <span className="text-orange-400 block mt-1">ALLES KLAR!</span>
                </>
              }
              subtitle="Ich muss was tun und weiß jetzt wie? _ Warum ich sofort den Schalter umlegen muss und die Überforderung in den Mülleimer schmeiße..."
              coverImage="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png"
              audioUrl="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/EPISODE03_audio_v2.mp3"
              description={
                <div className="mt-4 border border-zinc-700/50 bg-zinc-900/50 rounded-xl px-4 py-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Inhalt dieser Episode....</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">Audio verfügbar – Inhaltsbeschreibung folgt.</p>
                </div>
              }
            />
          </div>

          <div id="episode-02" style={{ scrollMarginTop: '80px', marginTop: '2rem' }}>
            <PodcastFeature
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
              description={
                <div className="mt-4 border border-zinc-700/50 bg-zinc-900/50 rounded-xl px-4 py-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Inhalt dieser Episode....</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">Audio verfügbar – Inhaltsbeschreibung folgt.</p>
                </div>
              }
            />
          </div>

          <div id="episode-01" style={{ scrollMarginTop: '80px', marginTop: '2rem' }}>
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
              description={
                <div className="mt-4 border border-zinc-700/50 bg-zinc-900/50 rounded-xl px-4 py-4">
                  <p className="text-xs font-bold text-orange-400 uppercase tracking-widest mb-3">Inhalt dieser Episode....</p>
                  <p className="text-sm text-zinc-300 leading-relaxed">Audio verfügbar – Inhaltsbeschreibung folgt.</p>
                </div>
              }
            />
          </div>
        </div>

      </div>
    </div>
  );
}
