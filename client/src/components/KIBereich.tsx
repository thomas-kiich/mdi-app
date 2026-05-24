/**
 * KIBereich.tsx
 * Thema 6 in METHODE 36 / RAUM 36
 * Persönlicher ethischer Umgang mit KI + Anleitungen für den Alltag
 */
import { useState } from "react";
import { ArrowLeft, Brain, Shield, Lightbulb, ChevronDown, ChevronUp } from "lucide-react";

interface KIBereichProps {
  onBack: () => void;
}

const INHALTE = [
  {
    id: "ethik",
    icon: Shield,
    titel: "MEIN ETHISCHER UMGANG MIT KI",
    farbe: "orange",
    text: `Künstliche Intelligenz ist ein Werkzeug – wie jedes Werkzeug ist es weder gut noch böse. Die entscheidende Frage ist: Wer hält es in der Hand, und mit welcher Absicht?

Mein Grundsatz: KI dient dem Menschen – nicht umgekehrt. Ich nutze KI als Verstärker für menschliche Kreativität, als Recherche-Assistent und als Sparringspartner für Ideen. Niemals als Ersatz für echte menschliche Verbindung, Intuition oder Verantwortung.

Konkret bedeutet das für mich:
• Ich kennzeichne KI-unterstützte Inhalte transparent.
• Ich überprüfe alle KI-Ausgaben kritisch – KI irrt sich.
• Ich nutze KI nicht für Entscheidungen, die Menschen direkt betreffen.
• Ich schütze persönliche Daten: keine sensiblen Informationen in öffentliche KI-Systeme.`,
  },
  {
    id: "alltag",
    icon: Lightbulb,
    titel: "KI IN DEINEM ALLTAG NUTZEN",
    farbe: "blue",
    text: `Hier sind konkrete Anleitungen wie du KI sinnvoll in deinen Alltag integrieren kannst – ohne dich zu verlieren.

SCHREIBEN & FORMULIEREN
Nutze KI als ersten Entwurf. Schreib deine Idee in 2-3 Sätzen, lass KI einen Entwurf erstellen, dann überarbeite ihn mit deiner eigenen Stimme. Das Ergebnis ist deins – KI hat nur die Rohform geliefert.

RECHERCHE & LERNEN
KI ist ein exzellenter Erklärer. Stelle komplexe Fragen in einfacher Sprache: "Erkläre mir [Thema] als wäre ich 12 Jahre alt." Dann vertiefe mit echten Quellen.

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

export function KIBereich({ onBack }: KIBereichProps) {
  const [offeneKarte, setOffeneKarte] = useState<string | null>("ethik");

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Zurück
        </button>
        <div className="h-4 w-px bg-zinc-700" />
        <h2 className="text-sm font-bold tracking-widest text-orange-300 uppercase">
          6 – KI &amp; MENSCHLICHKEIT
        </h2>
      </div>

      {/* Einleitung */}
      <div className="rounded-xl p-5 border border-orange-500/20 bg-gradient-to-br from-orange-500/5 to-transparent mb-6">
        <p className="text-zinc-300 text-sm leading-relaxed">
          In einem Zeitalter völlig neuer technologischer Möglichkeiten ist es wichtig, einen klaren
          persönlichen Standpunkt zu KI zu entwickeln. Hier zeige ich dir meinen ethischen Umgang
          und gebe dir konkrete Anleitungen wie du KI in deinem Alltag sinnvoll nützen kannst –
          ohne deine Menschlichkeit zu verlieren.
        </p>
      </div>

      {/* Aufklappbare Karten */}
      {INHALTE.map((inhalt) => {
        const Icon = inhalt.icon;
        const istOffen = offeneKarte === inhalt.id;
        const FARB_MAP: Record<string, { border: string; bg: string; text: string; dot: string }> = {
          orange: {
            border: "border-orange-500/30",
            bg: "bg-orange-500/10",
            text: "text-orange-300",
            dot: "bg-orange-400",
          },
          blue: {
            border: "border-blue-500/30",
            bg: "bg-blue-500/10",
            text: "text-blue-300",
            dot: "bg-blue-400",
          },
          purple: {
            border: "border-purple-500/30",
            bg: "bg-purple-500/10",
            text: "text-purple-300",
            dot: "bg-purple-400",
          },
        };
        const farbKlassen = FARB_MAP[inhalt.farbe] ?? FARB_MAP["orange"];

        return (
          <div
            key={inhalt.id}
            className={`rounded-xl border ${farbKlassen.border} ${farbKlassen.bg} overflow-hidden`}
          >
            {/* Kachel-Header */}
            <button
              className="w-full text-left p-4 flex items-center gap-3 hover:brightness-110 transition-all"
              onClick={() => setOffeneKarte(istOffen ? null : inhalt.id)}
            >
              <div className={`w-2 h-2 rounded-full shrink-0 ${farbKlassen.dot}`} />
              <div className="flex-1">
                <p className={`text-xs font-bold tracking-wide ${farbKlassen.text}`}>
                  {inhalt.titel}
                </p>
              </div>
              {istOffen ? (
                <ChevronUp className={`w-4 h-4 ${farbKlassen.text}`} />
              ) : (
                <ChevronDown className={`w-4 h-4 ${farbKlassen.text}`} />
              )}
            </button>

            {/* Aufgeklappter Inhalt */}
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

      {/* Hinweis */}
      <div className="rounded-xl p-4 border border-zinc-700/50 bg-zinc-900/30 mt-6">
        <p className="text-zinc-500 text-xs leading-relaxed text-center">
          Dieser Bereich wird laufend mit neuen Inhalten und Anleitungen erweitert.
        </p>
      </div>
    </div>
  );
}
