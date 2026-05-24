import { useState } from "react";
import { ChevronDown, ChevronUp, Brain, Lightbulb, Scale } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainingEinheitenView } from "@/components/TrainingEinheitenView";

interface KIICHPraxisProps {
  onClose?: () => void;
}

const KI_INHALTE = [
  {
    id: "ethik",
    icon: Scale,
    titel: "MEIN ETHISCHER UMGANG MIT KI",
    farbe: "orange",
    text: `KI ist ein Werkzeug – wie ein Hammer oder ein Telefon. Die Frage ist nicht ob wir KI nutzen, sondern wie wir sie nutzen.

Meine persönlichen Grundsätze:
• KI unterstützt – sie ersetzt nicht mein Denken
• Ich überprüfe KI-Outputs immer mit meinem eigenen Urteil
• Ich nutze KI für Effizienz – nicht um Verantwortung abzugeben
• Transparenz: Wenn ich KI-Hilfe nutze, sage ich es

Die entscheidende Frage ist immer: Wer trifft die Entscheidung? Ich – oder die KI?`,
  },
  {
    id: "werkzeug",
    icon: Lightbulb,
    titel: "KI ALS WERKZEUG – KONKRETE ANLEITUNGEN",
    farbe: "blue",
    text: `Wie du KI sinnvoll in deinen Alltag integrierst:

TEXTE VERBESSERN
Schreib deinen Text zuerst selbst. Dann: "Verbessere diesen Text für Klarheit und Lesbarkeit – behalte meinen Stil."

RECHERCHE
Nutze KI als ersten Überblick – aber verifiziere wichtige Fakten immer mit echten Quellen.

BRAINSTORMING
Wenn du feststeckst: "Gib mir 10 ungewöhnliche Ideen für [Aufgabe]." Nicht alle werden gut sein – aber eine wird dich weiterbringen.

ACHTSAMKEIT
Bemerke wann du KI nutzt um Entscheidungen zu vermeiden. KI kann Optionen aufzeigen – die Entscheidung triffst du.`,
  },
  {
    id: "grenzen",
    icon: Brain,
    titel: "WO KI AN IHRE GRENZEN STÖSST",
    farbe: "purple",
    text: `KI hat keine Erfahrung. Sie hat Texte gelesen – aber nie geatmet, nie getrauert, nie geliebt. Das macht einen fundamentalen Unterschied.

Was KI nicht kann:
• Echte Empathie – sie simuliert sie nur
• Körperliche Intuition – das Wissen das im Atem sitzt
• Langfristige Verantwortung übernehmen
• Neue Erkenntnisse generieren – sie kombiniert Bekanntes

Was das für dich bedeutet:
Alles was mit deinem Körper, deinen Gefühlen und deinen Beziehungen zu tun hat – dort ist deine menschliche Intelligenz unersetzlich. METHODE 36 arbeitet genau in diesem Bereich: mit dem Atem, mit dem Klang, mit der Stille. Das kann keine KI ersetzen.`,
  },
];

const FARB_MAP: Record<string, { border: string; bg: string; text: string; dot: string }> = {
  orange: { border: "border-orange-500/30", bg: "bg-orange-500/10", text: "text-orange-300", dot: "bg-orange-400" },
  blue: { border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-300", dot: "bg-blue-400" },
  purple: { border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-300", dot: "bg-purple-400" },
};

export function KIICHPraxis({ onClose }: KIICHPraxisProps) {
  const [offeneKarte, setOffeneKarte] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {/* Titel */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold text-white mb-1">KIICH PRAXIS</h2>
        <p className="text-zinc-400 text-sm max-w-2xl mx-auto">
          Konkrete Projekte und Übungen an der Schnittstelle von KI und menschlicher Identität.
        </p>
      </div>

      {/* KI & Menschlichkeit – drei Kacheln */}
      <div className="space-y-3">
        <div className="rounded-xl p-4 border border-orange-500/30 bg-orange-500/10 mb-1">
          <h3 className="text-sm font-bold tracking-wide text-orange-300">KI &amp; MENSCHLICHKEIT</h3>
          <p className="text-zinc-400 text-xs mt-1">Mein persönlicher ethischer Umgang mit KI und konkrete Anleitungen für deinen Alltag.</p>
        </div>
        {KI_INHALTE.map((inhalt) => {
          const Icon = inhalt.icon;
          const istOffen = offeneKarte === inhalt.id;
          const f = FARB_MAP[inhalt.farbe] ?? FARB_MAP["orange"];
          return (
            <div key={inhalt.id} className={`rounded-xl border ${f.border} ${f.bg} overflow-hidden`}>
              <button
                className="w-full text-left p-4 flex items-center gap-3 hover:brightness-110 transition-all"
                onClick={() => setOffeneKarte(istOffen ? null : inhalt.id)}
              >
                <Icon className={`w-4 h-4 shrink-0 ${f.text}`} />
                <div className="flex-1">
                  <p className={`text-xs font-bold tracking-wide ${f.text}`}>{inhalt.titel}</p>
                </div>
                {istOffen ? (
                  <ChevronUp className={`w-4 h-4 ${f.text}`} />
                ) : (
                  <ChevronDown className={`w-4 h-4 ${f.text}`} />
                )}
              </button>
              {istOffen && (
                <div className="px-4 pb-5 border-t border-white/5">
                  <div className="pt-4 space-y-3">
                    {inhalt.text.split("\n\n").map((absatz, i) => (
                      <p key={i} className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">
                        {absatz}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Trainingseinheiten aus DB */}
      <TrainingEinheitenView initialKategorie="kiichpraxis" externalFilterKat="kiichpraxis" />

      {onClose && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}
