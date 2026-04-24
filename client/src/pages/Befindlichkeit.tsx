import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { BasicColorSelector } from "@/components/BasicColorSelector";
import { Method36Trainer } from "@/components/Method36Trainer";
import { ArrowLeft, Info, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";
import { useVorname } from "@/contexts/VornameContext";

export default function Befindlichkeit() {
  const { isAuthenticated, loading } = useAuth();
  const { vorname } = useVorname();
  const [showBtInfo, setShowBtInfo] = useState(false);
  const [trainingMode, setTrainingMode] = useState<{
    freq: number;
    tone: string;
    color: string;
    typeId: number;
  } | null>(null);

  // Wenn Training gestartet wurde → Method36Trainer anzeigen
  if (trainingMode) {
    return (
      <Method36Trainer
        frequency={trainingMode.freq}
        toneName={trainingMode.tone}
        color={trainingMode.color}
        typeId={trainingMode.typeId}
        duration={7}
        onClose={() => setTrainingMode(null)}
      />
    );
  }

  // Ladescreen
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // Nicht eingeloggt → Login-Hinweis
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center gap-6">
        <div className="text-5xl">🌈</div>
        <h1 className="text-2xl font-bold tracking-widest uppercase">Befindlichkeitstraining</h1>
        <p className="text-zinc-400 max-w-sm text-sm leading-relaxed">
          Dieses Training steht dir als registrierter Nutzer kostenfrei zur Verfügung.
        </p>
        <a
          href={getLoginUrl()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Einloggen →
        </a>
        <Link href="/" className="text-zinc-600 hover:text-zinc-400 text-xs transition-colors">
          ← Zurück zur Startseite
        </Link>
      </div>
    );
  }

  // Eingeloggt → Befindlichkeitstraining
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/90 backdrop-blur border-b border-white/5 px-4 py-3 flex items-center gap-3">
        <Link href="/">
          <button className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-sm transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">Startseite</span>
          </button>
        </Link>
        <div className="flex-1 text-center">
          <span className="text-base font-black tracking-widest uppercase text-violet-400">
            🌈 Befindlichkeitstraining
          </span>
        </div>
        <div className="w-16" /> {/* Spacer für Zentrierung */}
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4 text-center">
        <h1 className="text-xl md:text-2xl font-semibold tracking-wide uppercase mb-3 leading-tight text-zinc-300">
          Empfinde den Lichtklang für deine momentane Befindlichkeit
        </h1>
        {/* WIE / WANN / WARUM Erkläraudio */}
        <button
          onClick={() => setShowBtInfo(!showBtInfo)}
          className="mt-4 inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl transition-all text-sm"
        >
          <Info className="w-4 h-4" />
          Hier erfährst du WIE, WANN und WARUM du mit dem BT trainieren solltest....
          {showBtInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {showBtInfo && (
          <div className="mt-4 text-left bg-zinc-900/70 border border-orange-500/30 rounded-2xl p-6 space-y-6 text-sm text-zinc-300 leading-relaxed">
            {/* MA-Stimme Audio */}
            <div className="space-y-2 p-3 bg-zinc-800/60 rounded-xl border border-orange-500/20">
              <div className="flex items-center gap-2">
                <span className="text-orange-400 text-xs font-semibold uppercase tracking-widest">🎙 MA-Stimme</span>
                <span className="text-zinc-500 text-xs">WIE, WANN &amp; WARUM</span>
              </div>
              <audio
                controls
                className="w-full h-8 accent-orange-500"
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/bt-studio-thomas_99fd4952.mp3"
              />
            </div>
            <div>
              <h3 className="text-orange-400 font-bold text-base uppercase tracking-widest mb-3">Das WIE</h3>
              <p className="mb-2">Es gibt fünf Grundregeln für das optimale Tun mit BT:</p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li>Sei für die wenigen Minuten des Trainierens voll im Tun <strong className="text-white">OHNE ABLENKUNG</strong>.</li>
                <li>Trage Sorge, dass du während der Trainingsession ungestört bist an einem ruhigen Ort.</li>
                <li>Sei klar in der Entscheidung welchen <strong className="text-white">KONKRETEN Persönlichkeitsbereich</strong> du trainierst. <span className="text-orange-300">KEIN ABWEICHEN DAVON WÄHREND DES TRAININGS.</span></li>
                <li>Kein Training direkt nach einer Mahlzeit (ideal ist eine Stunde Zwischenraum).</li>
                <li>Höre dir die Gebrauchsanleitung im Trainingscenter an und setze die Vorgaben um.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-orange-400 font-bold text-base uppercase tracking-widest mb-3">Das WANN</h3>
              <p className="mb-3">Generelle Empfehlung ist es, zumindest zu Beginn deiner Erfahrungen mit dem BT, ein <strong className="text-white">LICHTKLANGTHEMA</strong> zu wählen und mindestens sieben Tage damit zu trainieren.</p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li><strong className="text-white">Als Morgen- und Abendritual</strong> – Entscheide dich zu Beginn für einen siebenminütigen Ablauf. Am besten schon auf deinem Schlafplatz, mit geschlossenen Augen am Rücken liegend.</li>
                <li>Zu einer bestimmten Tageszeit, an der du das Training als regelmässiges Ritual einbaust.</li>
                <li>Vor wichtigen Ereignissen wie einem Vortrag, einer wichtigen Besprechung oder einer emotional herausfordernden Situation.</li>
              </ol>
            </div>
            <div>
              <h3 className="text-orange-400 font-bold text-base uppercase tracking-widest mb-3">Das WARUM</h3>
              <p className="mb-2">Die wesentlichsten Auswirkungen des Befindlichkeitstrainings:</p>
              <ol className="list-decimal list-inside space-y-2 text-zinc-300">
                <li>Über die gewählte Lichtklangfrequenz aktivierst du den Sendekanal in deinem biologischen Kommunikationssystem, welcher dich direkt mit den angestrebten Qualitäten des <strong className="text-white">LICHTKLANGS</strong> verbindet.</li>
                <li>Die Produktion von <strong className="text-white">Stickstoffmonoxid</strong> in den Nasenschleimhäuten unterstützt dein Immunsystem, erweitert Blutgefässe und ermöglicht besseren Sauerstofftransport in die Zellen.</li>
                <li>Der <strong className="text-white">Wirkungsgrad deines Stoffwechsels</strong> erhöht sich, da der Atemrhythmus exakt darauf abgestimmt ist.</li>
                <li>Die Aktivierung des <strong className="text-white">Vagusnervs</strong> bewirkt Entspannung im gesamten System und reguliert deine Herzratenvariabilität.</li>
                <li>Durch die richtige Atemtechnik wird das <strong className="text-white">glymphatische System</strong> im Gehirn aktiviert – Entschleunigung und Lockerung von Denkblockaden werden unterstützt.</li>
                <li>Die sanften Vibrationen durch das tiefe Summen <strong className="text-white">massieren die inneren Organe</strong> und fördern tiefliegende feine Bewegungsabläufe.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      {/* Farbauswahl */}
      <div className="max-w-3xl mx-auto px-4 pb-12">
        <BasicColorSelector
          onStartTraining={(freq, tone, color, typeId) => {
            setTrainingMode({ freq, tone, color, typeId });
          }}
        />
      </div>
    </div>
  );
}
