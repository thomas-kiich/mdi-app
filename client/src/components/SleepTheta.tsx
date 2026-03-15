import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Play, Pause, Volume2, VolumeX, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AffirmationSession {
  id: string;
  title: string;
  description: string;
  affirmationText: string;
  duration: number; // in minutes
  category: 'arrival' | 'healing' | 'forgiveness' | 'acceptance' | 'gratitude' | 'awakening';
  audioUrl?: string; // Optional audio URL for playback
}

const AFFIRMATION_SESSIONS: AffirmationSession[] = [
  {
    id: 'arrival',
    title: 'Ankunft',
    description: 'Einschwingvorgang - Ankommen bei dir selbst',
    affirmationText: `Ich bin hier. Ich bin präsent. Mit jedem Atemzug lasse ich los, was nicht zu mir gehört.
    
Mein Körper entspannt sich. Mein Geist wird ruhig. Ich vertraue dem Prozess des Schlafes.

Ich bin sicher. Ich bin geborgen. Ich bin zu Hause in mir selbst.

Mit dieser Nacht beginnt meine innere Heilung. Ich öffne mich für Regeneration und Erneuerung.`,
    duration: 21,
    category: 'arrival'
  },
  {
    id: 'healing',
    title: 'Selbstheilung',
    description: 'Körper & Geist regenerieren sich',
    affirmationText: `Mein Körper heilt sich selbst. Jede Zelle meines Körpers ist intelligent und weiß, wie sie sich regeneriert.

Ich vertraue der natürlichen Heilkraft in mir. Meine Immunität stärkt sich. Meine Energie erneuert sich.

Mit jedem Atemzug fließt Heilung durch mich. Ich bin gesund. Ich bin vital. Ich bin lebendig.

Mein Körper dankt mir für diese Ruhe. Ich bin dankbar für meine Gesundheit.`,
    duration: 21,
    category: 'healing',
    audioUrl: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/selbstheilung_affirmation_b996e120.wav'
  },
  {
    id: 'forgiveness',
    title: 'Selbstvergebung',
    description: 'Alte Lasten loslassen',
    affirmationText: `Ich vergebe mir selbst. Ich lasse los, was mich belastet.

Jeder Fehler war eine Lektion. Jede Herausforderung hat mich stärker gemacht.

Ich bin nicht perfekt, und das ist in Ordnung. Ich bin menschlich, und ich bin wertvoll.

Mit dieser Nacht vergebe ich mir alles. Ich befreie mich von Schuldgefühlen und Bedauern.

Ich bin frei. Ich bin leicht. Ich bin in Frieden mit mir selbst.`,
    duration: 21,
    category: 'forgiveness'
  },
  {
    id: 'acceptance',
    title: 'Akzeptanz',
    description: 'Frieden mit dem Ist-Zustand finden',
    affirmationText: `Ich akzeptiere, was ist. Ich akzeptiere mich, wie ich bin.

Nicht alles kann ich kontrollieren. Aber ich kann meine innere Haltung wählen.

Ich akzeptiere meine Vergangenheit. Sie hat mich zu dem gemacht, was ich bin.

Ich akzeptiere die Gegenwart. Sie ist der einzige Moment, in dem ich wirklich lebe.

Mit dieser Akzeptanz kommt Friede. Mit diesem Frieden kommt Kraft.`,
    duration: 21,
    category: 'acceptance'
  },
  {
    id: 'gratitude',
    title: 'Dankbarkeit',
    description: 'Fülle & Wohlstand aktivieren',
    affirmationText: `Ich bin dankbar. Ich bin gesegnet. Ich bin reich an dem, was zählt.

Ich danke für meinen Körper. Ich danke für meinen Geist. Ich danke für mein Leben.

Überall um mich herum sehe ich Fülle. Überall um mich herum sehe ich Wohlstand.

Mit Dankbarkeit öffne ich mich für noch mehr Gutes. Meine Dankbarkeit zieht Segen an.

Ich bin erfüllt. Ich bin dankbar. Ich bin reich an Liebe und Gesundheit.`,
    duration: 21,
    category: 'gratitude'
  },
  {
    id: 'awakening',
    title: 'Aufwachen',
    description: 'Sanfte Aktivierung für den Morgen',
    affirmationText: `Ich wache auf erfrischt und energievoll. Mein Körper ist ausgeruht. Mein Geist ist klar.

Mit jedem Atemzug fließt neue Energie in mich. Ich bin voller Vitalität.

Dieser neue Tag ist voller Möglichkeiten. Ich bin bereit, ihn zu gestalten.

Ich bin dankbar für diese Nacht. Ich bin bereit für diesen Tag.

Ich bin energievoll. Ich bin fokussiert. Ich bin bereit für alles, was kommt.`,
    duration: 21,
    category: 'awakening'
  }
];

interface SleepThetaProps {
  onClose: () => void;
}

export function SleepTheta({ onClose }: SleepThetaProps) {
  const [selectedSession, setSelectedSession] = useState<AffirmationSession | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [customAffirmation, setCustomAffirmation] = useState('');
  const [showCustomInput, setShowCustomInput] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  const handlePlaySession = (session: AffirmationSession) => {
    setSelectedSession(session);
    setIsPlaying(true);
    if (audioRef.current && session.audioUrl) {
      audioRef.current.src = session.audioUrl;
      audioRef.current.play().catch(err => console.error('Playback error:', err));
    }
  };

  const handlePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => console.error('Playback error:', err));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleCustomAffirmation = () => {
    if (customAffirmation.trim()) {
      // TODO: Convert custom text to speech and play
      setIsPlaying(true);
    }
  };

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const updateDuration = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      arrival: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30',
      healing: 'from-green-500/20 to-emerald-500/20 border-emerald-500/30',
      forgiveness: 'from-purple-500/20 to-pink-500/20 border-pink-500/30',
      acceptance: 'from-yellow-500/20 to-orange-500/20 border-orange-500/30',
      gratitude: 'from-red-500/20 to-rose-500/20 border-rose-500/30',
      awakening: 'from-amber-500/20 to-yellow-500/20 border-yellow-500/30'
    };
    return colors[category] || 'from-zinc-500/20 to-zinc-500/20 border-zinc-500/30';
  };

  if (selectedSession) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 pt-40">
        <div className="w-full max-w-2xl mx-auto h-[80vh] flex flex-col pt-12">
          <Button 
            variant="ghost" 
            onClick={() => setSelectedSession(null)}
            className="text-zinc-400 hover:text-white mb-8"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück
          </Button>

          <div className="flex-1 flex flex-col justify-center">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-2">{selectedSession.title}</h2>
              <p className="text-zinc-400 text-lg">{selectedSession.description}</p>
            </div>

            {/* Affirmation Text Display */}
            <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
              <CardContent className="p-8">
                <p className="text-zinc-300 text-lg leading-relaxed whitespace-pre-line">
                  {selectedSession.affirmationText}
                </p>
              </CardContent>
            </Card>

            {/* Playback Controls */}
            <div className="flex items-center justify-center gap-6">
              <Button 
                size="lg"
                onClick={handlePlayPause}
                className="bg-orange-500 hover:bg-orange-600 text-white h-16 px-12 text-lg rounded-full"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-6 h-6 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-6 h-6 mr-2" />
                    Abspielen
                  </>
                )}
              </Button>

              <Button 
                variant="outline"
                size="lg"
                onClick={handleMute}
                className="border-zinc-700 hover:bg-zinc-800 h-16 px-6"
              >
                {isMuted ? (
                  <VolumeX className="w-6 h-6 text-zinc-400" />
                ) : (
                  <Volume2 className="w-6 h-6 text-zinc-400" />
                )}
              </Button>
            </div>

            {/* Audio Element */}
            <audio 
              ref={audioRef}
              crossOrigin="anonymous"
              onEnded={() => setIsPlaying(false)}
            />

            {/* Duration Info */}
            <div className="text-center mt-8 text-zinc-400">
              <p className="text-sm">Dauer: {selectedSession.duration} Minuten</p>
              {duration > 0 && (
                <p className="text-xs mt-2">{Math.floor(currentTime / 60)}:{String(Math.floor(currentTime % 60)).padStart(2, '0')} / {Math.floor(duration / 60)}:{String(Math.floor(duration % 60)).padStart(2, '0')}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 pt-40">
      <div className="w-full max-w-6xl mx-auto py-12 pt-40">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Zurück
          </Button>
          <h2 className="text-3xl font-bold text-white">Schlaf & Theta-Wellen</h2>
          <div className="w-24" /> {/* Spacer for alignment */}
        </div>

        {/* Description */}
        <div className="mb-12 text-center max-w-3xl mx-auto">
          <p className="text-zinc-300 text-lg leading-relaxed">
            Nutze die Kraft der Theta-Wellen während des Einschlafens und Aufwachens. 
            Dein Unterbewusstsein ist in diesem Zustand am aufnahmefähigsten für positive Affirmationen und Umprogrammierung.
          </p>
        </div>

        {/* Affirmation Sessions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {AFFIRMATION_SESSIONS.map((session) => (
            <Card 
              key={session.id}
              className={cn(
                "bg-gradient-to-br border cursor-pointer hover:shadow-lg transition-all group h-full",
                getCategoryColor(session.category)
              )}
              onClick={() => handlePlaySession(session)}
            >
              <CardHeader>
                <CardTitle className="text-white text-xl">{session.title}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col h-full">
                <p className="text-zinc-300 text-sm mb-6 flex-1">{session.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400">{session.duration} Min</span>
                  <Button 
                    size="sm"
                    className="bg-white text-black hover:bg-zinc-200 group-hover:translate-x-1 transition-transform"
                  >
                    <Play className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Custom Affirmation Section */}
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <Plus className="w-5 h-5 text-orange-500" />
              Eigene Affirmation erstellen
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!showCustomInput ? (
              <Button 
                onClick={() => setShowCustomInput(true)}
                className="w-full bg-orange-500 hover:bg-orange-600 text-white h-12"
              >
                Neue Affirmation hinzufügen
              </Button>
            ) : (
              <div className="space-y-4">
                <textarea 
                  value={customAffirmation}
                  onChange={(e) => setCustomAffirmation(e.target.value)}
                  placeholder="Schreibe deine eigene Affirmation hier... (z.B. 'Ich bin gesund, stark und erfolgreich')"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg p-4 text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 min-h-[120px]"
                />
                <div className="flex gap-4">
                  <Button 
                    onClick={handleCustomAffirmation}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white h-12"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Abspielen
                  </Button>
                  <Button 
                    onClick={() => {
                      setShowCustomInput(false);
                      setCustomAffirmation('');
                    }}
                    variant="outline"
                    className="flex-1 border-zinc-700 hover:bg-zinc-800 h-12"
                  >
                    Abbrechen
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Info Box */}
        <div className="mt-12 p-6 bg-zinc-900/50 border border-zinc-800 rounded-lg">
          <h3 className="text-white font-semibold mb-3">💡 Theta-Wellen Tipp</h3>
          <p className="text-zinc-400 text-sm leading-relaxed">
            Theta-Wellen (4-8 Hz) sind am stärksten während des Einschlafens und beim Aufwachen. 
            In diesem Zustand hat dein Unterbewusstsein direkten Zugang zu deinen Überzeugungen und Mustern. 
            Nutze diese Zeit für tiefe Umprogrammierung und positive Veränderung.
          </p>
        </div>
      </div>
    </div>
  );
}
