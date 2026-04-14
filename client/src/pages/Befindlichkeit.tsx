import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { BasicColorSelector } from "@/components/BasicColorSelector";
import { Method36Trainer } from "@/components/Method36Trainer";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

export default function Befindlichkeit() {
  const { isAuthenticated, loading } = useAuth();
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
          Dieses Training ist für registrierte Nutzer. Bitte melde dich an, um Zugang zu erhalten.
        </p>
        <a
          href={getLoginUrl()}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
        >
          Einloggen
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
          <span className="text-xs font-black tracking-widest uppercase text-violet-400">
            🌈 Befindlichkeitstraining
          </span>
        </div>
        <div className="w-16" /> {/* Spacer für Zentrierung */}
      </div>

      {/* Intro */}
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-4 text-center">
        <h1 className="text-3xl font-bold mb-3">Wähle deine Frequenz</h1>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-xl mx-auto">
          Wähle intuitiv deine momentane Stimmung und aktiviere dein Potential.
          Berühre einen Lichtkreis und spüre den Klang der Lichtfarbe.
        </p>
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
