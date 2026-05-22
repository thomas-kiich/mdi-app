import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Mic,
  Play,
  Pause,
  Download,
  Save,
  Trash2,
  Volume2,
  FileAudio,
  Sparkles,
} from "lucide-react";
import { Link } from "wouter";
import { useState, useRef, useEffect } from "react";

const MAX_ZEICHEN = 12000;

// Vordefinierte Textvorlagen
const VORLAGEN = [
  {
    label: "Meditation / Einschlaf",
    text: "Lass dich fallen in die Stille. Jeder Atemzug trägt dich tiefer in deine Mitte. Dein Körper wird schwerer, dein Geist weiter. Du bist sicher. Du bist gehalten.",
  },
  {
    label: "Begrüßung / Intro",
    text: "Willkommen bei KIICH. Ich bin MA, deine Begleiterin auf diesem Weg. Heute laden wir gemeinsam dein System auf.",
  },
  {
    label: "BOLT-Anleitung",
    text: "Atme ruhig ein und aus. Nach dem nächsten Ausatmen schließe deinen Mund und halte die Nase zu. Zähle die Sekunden bis zum ersten deutlichen Drang zu atmen. Das ist dein BOLT-Wert.",
  },
  {
    label: "Trainingseinleitung",
    text: "Gut gemacht. Du hast heute deinen ersten Schritt gesetzt. Dein Körper registriert jede Veränderung. Bleib dran – die Wirkung entfaltet sich in der Kontinuität.",
  },
];

interface GenerierterAudio {
  audioBase64: string;
  mimeType: string;
  zeichenAnzahl: number;
  textVorschau: string;
  titel: string;
  timestamp: number;
}

export default function AdminMaStimme() {
  const { user, isAuthenticated, loading } = useAuth();
  const [text, setText] = useState("");
  const [titel, setTitel] = useState("");
  const [generierteAudios, setGenerierteAudios] = useState<GenerierterAudio[]>([]);
  const [spielendeIndex, setSpielndeIndex] = useState<number | null>(null);
  const [speichernIndex, setSpeichernIndex] = useState<number | null>(null);
  const audioRefs = useRef<(HTMLAudioElement | null)[]>([]);

  const generiereAudio = trpc.adminMaStimme.generiere.useMutation({
    onSuccess: (data) => {
      const neuesAudio: GenerierterAudio = {
        ...data,
        titel: titel || `Audio ${new Date().toLocaleTimeString("de-AT")}`,
        timestamp: Date.now(),
      };
      setGenerierteAudios(prev => [neuesAudio, ...prev]);
      toast.success(`Audio generiert (${data.zeichenAnzahl} Zeichen)`);
    },
    onError: (err) => {
      toast.error(`Fehler: ${err.message}`);
    },
  });

  const speichereAufS3 = trpc.adminMaStimme.speichereAufS3.useMutation({
    onSuccess: (data) => {
      toast.success("Auf S3 gespeichert – URL in Zwischenablage kopiert");
      navigator.clipboard.writeText(data.url).catch(() => {});
      setSpeichernIndex(null);
    },
    onError: (err) => {
      toast.error(`Speichern fehlgeschlagen: ${err.message}`);
      setSpeichernIndex(null);
    },
  });

  const handleGenerieren = () => {
    if (!text.trim()) {
      toast.error("Bitte Text eingeben");
      return;
    }
    generiereAudio.mutate({ text: text.trim(), titel: titel.trim() || undefined });
  };

  const handleSpielen = (index: number, audioBase64: string) => {
    // Alle anderen stoppen
    audioRefs.current.forEach((ref, i) => {
      if (i !== index && ref) {
        ref.pause();
        ref.currentTime = 0;
      }
    });

    const audio = audioRefs.current[index];
    if (!audio) return;

    if (spielendeIndex === index && !audio.paused) {
      audio.pause();
      setSpielndeIndex(null);
    } else {
      audio.play();
      setSpielndeIndex(index);
    }
  };

  const handleHerunterladen = (audio: GenerierterAudio) => {
    const blob = new Blob(
      [Uint8Array.from(atob(audio.audioBase64), c => c.charCodeAt(0))],
      { type: audio.mimeType }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${audio.titel.replace(/[^a-zA-Z0-9_\-äöüÄÖÜß ]/g, "_")}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleS3Speichern = (index: number, audio: GenerierterAudio) => {
    setSpeichernIndex(index);
    speichereAufS3.mutate({
      audioBase64: audio.audioBase64,
      dateiname: audio.titel,
    });
  };

  const handleLoeschen = (index: number) => {
    const audio = audioRefs.current[index];
    if (audio) {
      audio.pause();
    }
    if (spielendeIndex === index) setSpielndeIndex(null);
    setGenerierteAudios(prev => prev.filter((_, i) => i !== index));
  };

  const handleVorlage = (vorlage: typeof VORLAGEN[0]) => {
    setText(vorlage.text);
    setTitel(vorlage.label);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center text-zinc-400">
        Kein Zugriff.
      </div>
    );
  }

  const zeichenVerbleibend = MAX_ZEICHEN - text.length;
  const zeichenProzent = Math.min(100, (text.length / MAX_ZEICHEN) * 100);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Admin
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-orange-500" />
            <h1 className="text-lg font-bold tracking-wider">MA-STIMMGENERIERUNG</h1>
          </div>
          <Badge variant="outline" className="ml-auto text-xs border-orange-500/30 text-orange-400">
            Voxtral TTS · MA-Stimme
          </Badge>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Text-Eingabe */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold tracking-wider text-zinc-200 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-orange-500" />
              TEXT EINGEBEN
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Vorlagen */}
            <div>
              <Label className="text-xs text-zinc-500 tracking-wider mb-2 block">VORLAGEN</Label>
              <div className="flex flex-wrap gap-2">
                {VORLAGEN.map((v) => (
                  <button
                    key={v.label}
                    onClick={() => handleVorlage(v)}
                    className="text-xs px-3 py-1.5 rounded border border-zinc-700 text-zinc-400 hover:border-orange-500/50 hover:text-orange-400 transition-colors"
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titel */}
            <div>
              <Label className="text-xs text-zinc-500 tracking-wider mb-1.5 block">TITEL / BEZEICHNUNG</Label>
              <Input
                value={titel}
                onChange={(e) => setTitel(e.target.value)}
                placeholder="z.B. Einschlafgeschichte EP08, BOLT-Anleitung..."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600"
                maxLength={200}
              />
            </div>

            {/* Text */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <Label className="text-xs text-zinc-500 tracking-wider">TEXT FÜR MA-STIMME</Label>
                <span className={`text-xs ${zeichenVerbleibend < 500 ? "text-orange-400" : "text-zinc-600"}`}>
                  {text.length.toLocaleString("de-AT")} / {MAX_ZEICHEN.toLocaleString("de-AT")} Zeichen
                </span>
              </div>
              <Textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Text eingeben, der von MA gesprochen werden soll...&#10;&#10;Tipp: Absätze und Punkte erzeugen natürliche Pausen. Gedankenstriche (–) und Auslassungspunkte (...) für längere Pausen."
                className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-600 min-h-[200px] resize-y font-mono text-sm leading-relaxed"
                maxLength={MAX_ZEICHEN}
              />
              {/* Fortschrittsbalken */}
              <div className="mt-1.5 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${zeichenProzent > 90 ? "bg-orange-500" : "bg-zinc-600"}`}
                  style={{ width: `${zeichenProzent}%` }}
                />
              </div>
            </div>

            {/* Generieren-Button */}
            <Button
              onClick={handleGenerieren}
              disabled={generiereAudio.isPending || !text.trim()}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-wider"
            >
              {generiereAudio.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  GENERIERE AUDIO… (kann 10–60 Sek. dauern)
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  MIT MA-STIMME GENERIEREN
                </>
              )}
            </Button>

            {generiereAudio.isPending && (
              <p className="text-xs text-zinc-500 text-center">
                Lange Texte können bis zu 3 Minuten dauern. Bitte warten…
              </p>
            )}
          </CardContent>
        </Card>

        {/* Generierte Audios */}
        {generierteAudios.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-sm font-semibold tracking-wider text-zinc-400 flex items-center gap-2">
              <FileAudio className="w-4 h-4" />
              GENERIERTE AUDIOS ({generierteAudios.length})
            </h2>

            {generierteAudios.map((audio, index) => (
              <Card key={audio.timestamp} className="bg-zinc-900 border-zinc-800">
                <CardContent className="pt-4 space-y-3">
                  {/* Titel + Metadaten */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-white text-sm">{audio.titel}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">
                        {audio.zeichenAnzahl.toLocaleString("de-AT")} Zeichen ·{" "}
                        {new Date(audio.timestamp).toLocaleTimeString("de-AT")}
                      </p>
                    </div>
                    <button
                      onClick={() => handleLoeschen(index)}
                      className="text-zinc-600 hover:text-red-400 transition-colors shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Textvorschau */}
                  <p className="text-xs text-zinc-500 italic border-l-2 border-zinc-700 pl-3">
                    „{audio.textVorschau}"
                  </p>

                  {/* Verstecktes Audio-Element */}
                  <audio
                    ref={(el) => { audioRefs.current[index] = el; }}
                    src={`data:${audio.mimeType};base64,${audio.audioBase64}`}
                    onEnded={() => setSpielndeIndex(null)}
                    onPause={() => { if (spielendeIndex === index) setSpielndeIndex(null); }}
                  />

                  {/* Steuerung */}
                  <div className="flex gap-2 flex-wrap">
                    {/* Abspielen / Pause */}
                    <Button
                      size="sm"
                      onClick={() => handleSpielen(index, audio.audioBase64)}
                      className="bg-zinc-800 hover:bg-zinc-700 text-white border border-zinc-700"
                    >
                      {spielendeIndex === index ? (
                        <><Pause className="w-4 h-4 mr-1.5" /> PAUSE</>
                      ) : (
                        <><Play className="w-4 h-4 mr-1.5" /> ABSPIELEN</>
                      )}
                    </Button>

                    {/* Herunterladen */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleHerunterladen(audio)}
                      className="border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      DOWNLOAD
                    </Button>

                    {/* Auf S3 speichern */}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleS3Speichern(index, audio)}
                      disabled={speichernIndex === index}
                      className="border-orange-500/30 text-orange-400 hover:border-orange-500 hover:text-orange-300"
                    >
                      {speichernIndex === index ? (
                        <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> SPEICHERN…</>
                      ) : (
                        <><Save className="w-4 h-4 mr-1.5" /> AUF S3 SPEICHERN</>
                      )}
                    </Button>
                  </div>

                  {/* Hinweis nach S3-Speicherung */}
                  {speichernIndex === null && speichereAufS3.isSuccess && (
                    <p className="text-xs text-green-400">
                      ✓ URL in Zwischenablage kopiert – direkt in Episoden oder Training einfügbar
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Info-Box */}
        <Card className="bg-zinc-900/50 border-zinc-800/50">
          <CardContent className="pt-4">
            <div className="flex items-start gap-3">
              <Volume2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1.5 text-xs text-zinc-500">
                <p><span className="text-zinc-400 font-medium">Stimme:</span> MA – Voxtral TTS (Mistral AI) · Voice-ID: 89bc29eb</p>
                <p><span className="text-zinc-400 font-medium">Pausen:</span> Punkte, Absätze und Gedankenstriche (–) erzeugen natürliche Sprechpausen.</p>
                <p><span className="text-zinc-400 font-medium">Limit:</span> Max. 12.000 Zeichen pro Generierung · ca. $0,016 pro 1.000 Zeichen</p>
                <p><span className="text-zinc-400 font-medium">S3-Speichern:</span> Permanente CDN-URL – direkt in Episoden, Trainings oder Newsletter einfügbar.</p>
              </div>
            </div>
          </CardContent>
        </Card>

      </div>
    </div>
  );
}
