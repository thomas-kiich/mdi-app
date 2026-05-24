import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { BookOpen, Lightbulb, Users, Zap } from "lucide-react";

interface KIICHPraxisProps {
  onClose?: () => void;
}

export function KIICHPraxis({ onClose }: KIICHPraxisProps) {
  const praxisItems = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Atemtechniken",
      description: "Lerne die Grundlagen der optimalen Atmung für mehr Vitalität und Klarheit.",
      link: "/raum36?tab=methode36&training=1",
    },
    {
      icon: <Lightbulb className="w-6 h-6" />,
      title: "Lichtklang-Training",
      description: "Nutze die Kraft der Lichtfarben und Frequenzen für deine persönliche Entwicklung.",
      link: "/raum36?tab=methode36&training=2",
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Gemeinschaft",
      description: "Tausche dich mit anderen Mitgliedern aus und stelle Fragen an Thomas.",
      link: "/raum36?tab=fragen",
    },
    {
      icon: <BookOpen className="w-6 h-6" />,
      title: "Wissenspool",
      description: "Vertiefte Informationen, Audios und wissenschaftliche Grundlagen.",
      link: "/raum36?tab=wissenspool",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">🎯 KIICH PRAXIS</h2>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto">
          Deine praktische Anleitung für die Anwendung von KIICH im Alltag. Wähle einen Bereich und beginne deine Reise.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {praxisItems.map((item, idx) => (
          <Card
            key={idx}
            className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/40 transition-all cursor-pointer p-6 group"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-orange-500/10 flex items-center justify-center shrink-0 group-hover:bg-orange-500/20 transition-colors text-orange-400">
                {item.icon}
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-2">{item.title}</h3>
                <p className="text-zinc-400 text-sm mb-4">{item.description}</p>
                <a href={item.link}>
                  <Button
                    size="sm"
                    className="bg-orange-600 hover:bg-orange-500 text-white"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Starten →
                  </Button>
                </a>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-12 p-6 bg-zinc-900/30 border border-zinc-800 rounded-lg text-center">
        <p className="text-zinc-400 text-sm">
          <strong>Tipp:</strong> Beginne mit den Atemtechniken um die Grundlagen zu verstehen, dann erkunde die Lichtklang-Trainings.
        </p>
      </div>

      {onClose && (
        <div className="text-center">
          <Button variant="outline" onClick={onClose}>
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}
