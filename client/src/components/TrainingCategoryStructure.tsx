import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, AlertCircle, BookOpen, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

interface TrainingItem {
  id: string;
  name: string;
  description: string;
  durations?: number[]; // in minutes
  audioUrls?: Record<number, string>; // duration -> URL mapping
  type: "breathing" | "voice" | "movement" | "ambient";
}

interface TrainingCategory {
  id: string;
  name: string;
  description: string;
  icon: string;
  items: TrainingItem[];
}

interface TrainingCategoryStructureProps {
  onStartTraining?: (item: TrainingItem, duration: number) => void;
  onOpenKnowledge?: () => void;
  onClose?: () => void;
}

const TRAINING_CATEGORIES: TrainingCategory[] = [
  {
    id: "breathing",
    name: "1 - Atemtraining",
    icon: "🫁",
    description: "Übungen in diesem Segment konzentrieren sich auf die Stärkung der Atemkompetenz mit all ihren positiven Auswirkungen auf das ganzheitliche Wohlbefinden.",
    items: [],
  },
  {
    id: "voice",
    name: "2 - Stimmklangtraining",
    icon: "🎵",
    description: "Übungen in diesem Segment konzentrieren sich auf die Nutzung und die Stärkung der eigenen Stimmqualität.",
    items: [
      {
        id: "yohn",
        name: "YOHN-Atmung",
        description: "Intervall-Training mit Wasser-Ambience",
        durations: [7, 12, 21],
        type: "voice",
      },
      {
        id: "interval",
        name: "Intervall-Training",
        description: "Strukturiertes Atemtraining mit Pausen",
        durations: [7, 12, 21],
        type: "voice",
      },
    ],
  },
  {
    id: "movement",
    name: "3 - Bewegungstraining",
    icon: "🏃",
    description: "Übungen in diesem Segment konzentrieren sich auf körperliche Bewegungsübungen in Abstimmung mit rhythmisch koordinierten Atemzyklen. Sie dienen der optimalen Aktivierung von Muskelketten - gesteuert durch gezielte Atemrhythmik.",
    items: [],
  },
  {
    id: "ambient",
    name: "4 - Umfeldaktivierung",
    icon: "✨",
    description: "Übungen in diesem Segment dienen der Regulation des Umfelds durch sanfte Hintergrundkompositionen. Zudem motivieren die eingearbeiteten Pulsationen zu einem optimalen Atemrhythmus.",
    items: [
      {
        id: "metabolic",
        name: "STOFFWECHSELATMUNG",
        description: "OPTIMALE NUTZUNG: Verwende die SWA als Hintergrundsound um ein harmonisches Umfeld zu unterstützen und deinen Atemzyklus auf die optimale Rhythmik einzuschwingen (Detailinfo dazu unter METHODE 36).\n\nWIRKUNG: Dein Unterbewusstsein beginnt, den optimalen Atemrhythmus aufzunehmen und dadurch deinen Stresspegel zu regulieren. Du wirst zunehmend ruhiger und beginnst tief zu regenerieren. Ideal für echte Erholungsphasen zwischendurch oder zur Stimulierung einer meditativen Raumatmosphäre.\n\nANWENDUNG: Wähle eine Zeitdauer / Reguliere die Lautstärke so, dass der Sound im Hintergrund wahrnehmbar ist / Stimme dich zu Beginn für einige Atemzyklen auf die Gongsignale hinter dem Wasser rauschen ein / erster Gong = EINatmen / zweiter Gong = AUSatmen (höre genau hin, das Gongsignal ist sanft in die Musik eingebettet).\n\nWICHTIG: Versuche stets durch die Nase zu atmen / SOWOHL EIN- WIE AUS !",
        durations: [7, 21],
        audioUrls: {
          7: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663036873684/platonischesJAHR_7min.wav",
          21: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663036873684/platonischesJAHR_21min.wav",
        },
        type: "ambient",
      },
      {
        id: "mayerwelle",
        name: "MAYERWELLE 5,5 / MW",
        description: "OPTIMALE NUTZUNG: Verwende die MW als Hintergrundsound um ein regenerierendes Umfeld zu unterstützen und deinen Atemzyklus auf eine optimale Atemrhythmik einzuschwingen (Detailinfo dazu unter METHODE 36).\n\nWIRKUNG: Dein Unterbewusstsein beginnt, einen förderlichen Atemrhythmus aufzunehmen und dadurch deinen Stresspegel zu regulieren. Du bleibst entspannter und gleichzeitig erfrischt (Wasserrauschen) während deiner aktiven Tätigkeiten.\n\nANWENDUNG: Wähle eine Zeitdauer / Reguliere die Lautstärke so, dass der Sound im Hintergrund wahrnehmbar ist / Stimme dich zu Beginn für einige Atemzyklen auf die Gongsignale hinter dem Wasser rauschen ein / erster Gong = EINatmen / zweiter Gong = HALTEN / dritter Gong = AUSatmen.\n\nWICHTIG: Versuche stets durch die Nase zu atmen / SOWOHL EIN- WIE AUS !",
        durations: [45],
        audioUrls: {
          45: "https://files.manuscdn.com/user_upload_by_module/session_file/310519663036873684/llGeZhyAsOhattjj.wav",
        },
        type: "ambient",
      },
    ],
  },
];

export function TrainingCategoryStructure({ 
  onStartTraining,
  onOpenKnowledge,
  onClose
}: TrainingCategoryStructureProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);

  const category = selectedCategory
    ? TRAINING_CATEGORIES.find((c) => c.id === selectedCategory)
    : null;

  const item = selectedItem && category
    ? category.items.find((i) => i.id === selectedItem)
    : null;

  if (item) {
    // Layer 3: Training Item Detail
    return (
      <div className="min-h-screen bg-black text-foreground">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Back Navigation */}
          <div className="flex gap-2 mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-white"
              onClick={() => {
                setSelectedItem(null);
                setSelectedDuration(null);
              }}
            >
              ← ZUR HAUPTSEITE
            </Button>
          </div>

          {/* Training Item Card */}
          <Card className="bg-zinc-900/50 border-zinc-800">
            <CardHeader>
              <CardTitle className="text-2xl">{item.name}</CardTitle>
              <div className="text-zinc-400 mt-2 whitespace-pre-wrap">{item.description}</div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration Selection */}
              {item.durations && item.durations.length > 0 && (
                <div>
                  <h3 className="text-sm font-semibold text-zinc-300 mb-3">
                    Dauer wählen:
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {item.durations.map((duration) => (
                      <Button
                        key={duration}
                        variant="outline"
                        className={cn(
                          "border-zinc-700 transition-all",
                          selectedDuration === duration
                            ? "bg-orange-500 border-orange-500 text-black font-bold"
                            : "hover:bg-zinc-800 hover:border-orange-500"
                        )}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedDuration(duration);
                        }}
                      >
                        {duration} Min
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {/* Start Training Button */}
              <Button 
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDuration}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  if (selectedDuration && onStartTraining) {
                    onStartTraining(item, selectedDuration);
                  }
                }}
              >
                {selectedDuration ? `Training starten (${selectedDuration} Min)` : "Dauer wählen"}
              </Button>


            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (category) {
    // Layer 2: Category with Items
    return (
      <div className="min-h-screen bg-black text-foreground">
        <div className="container max-w-3xl mx-auto px-4 py-8">
          {/* Back Navigation */}
          <div className="flex gap-2 mb-8">
            <Button
              variant="ghost"
              size="sm"
              className="text-zinc-500 hover:text-white"
              onClick={() => setSelectedCategory(null)}
            >
              ← ZUR HAUPTSEITE
            </Button>
          </div>

          {/* Category Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-4">{category.name}</h1>
            <p className="text-zinc-300 text-lg leading-relaxed">
              {category.description}
            </p>
          </div>

          {/* Training Items Grid */}
          <div className="grid gap-4">
            {category.items.map((item) => (
              <Card
                key={item.id}
                className="bg-zinc-900/50 border-zinc-800 hover:border-orange-500/50 cursor-pointer transition-all"
                onClick={() => {
                  if (item.id === "metabolic" || item.id === "mayerwelle") {
                    if (onStartTraining) onStartTraining(item, 0);
                  } else {
                    setSelectedItem(item.id);
                  }
                }}
              >
                <CardContent className="p-6 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold mb-1">{item.name}</h3>
                    {item.id !== "metabolic" && item.id !== "mayerwelle" && (
                      <p className="text-sm text-zinc-400 line-clamp-2">{item.description}</p>
                    )}
                  </div>
                  <ChevronRight className="w-5 h-5 text-zinc-500 flex-shrink-0" />
                </CardContent>
              </Card>
            ))}
          </div>

          {category.items.length === 0 && (
            <div className="text-center py-12">
              <p className="text-zinc-500">
                In dieser Kategorie sind noch keine Trainings verfügbar.
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Layer 1: Main Training Center
  return (
    <div className="min-h-screen bg-black text-foreground">
      <div className="container max-w-4xl mx-auto px-4 pt-24 pb-8">
        {/* Header */}
        <div className="mb-12">
          {onClose && (
            <Button 
              variant="ghost" 
              onClick={onClose}
              className="text-zinc-400 hover:text-white mb-8 -ml-4"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              ZUR HAUPTSEITE
            </Button>
          )}
          <h1 className="text-5xl font-bold mb-8">Trainings-Center</h1>
          
          {/* Intro Text */}
          <Card className="bg-zinc-900/50 border-zinc-800 mb-8">
            <CardContent className="p-6">
              <div className="text-zinc-300 leading-relaxed space-y-4">
                <p>
                  Alle in diesem Trainingscenter abrufbaren Einheiten basieren auf den Prinzipien der{" "}
                  <button
                    onClick={onOpenKnowledge}
                    className="text-orange-500 hover:text-orange-400 underline transition-colors font-semibold"
                  >
                    METHODE 36
                  </button>
                  . Dies bedeutet, dass der Grundpuls jeweils auf einem Atemzyklus von rund 6 Wiederholungen je Minute aufbaut. Weiterführende Trainingsabläufe variieren entsprechend der Dynamik der jeweiligen Übung.
                </p>
                <div className="pt-4">
                  <p className="flex gap-2">
                    <span className="text-orange-500 font-bold flex-shrink-0">⚠️</span>
                    <span>
                      <strong>ACHTUNG:</strong> Das Praktizieren aller angebotenen Übungen erfolgt auf der eigenen Verantwortlichkeit und Einschätzung der persönlichen gesundheitlichen Befindlichkeit. Bei Unklarheiten kontaktieren Sie bitte unbedingt eine medizinische Kompetenz ihrer Wahl.
                    </span>
                  </p>
                </div>

              </div>
            </CardContent>
          </Card>
        </div>

        {/* Category Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TRAINING_CATEGORIES.map((cat) => (
            <Card
              key={cat.id}
              className="bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border-zinc-800 hover:border-orange-500/50 cursor-pointer transition-all group"
              onClick={() => setSelectedCategory(cat.id)}
            >
              <CardContent className="p-8">
                <div className="text-5xl mb-4">{cat.icon}</div>
                <h2 className="text-2xl font-bold mb-3 group-hover:text-orange-500 transition-colors">
                  {cat.name}
                </h2>
                <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                  {cat.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-500">
                    {cat.items.length} {cat.items.length === 1 ? "Training" : "Trainings"}
                  </span>
                  <ChevronRight className="w-5 h-5 text-zinc-500 group-hover:text-orange-500 transition-colors" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Knowledge Pool Link */}
        <div className="mt-12 flex justify-center">
          <Button
            variant="outline"
            className="border-zinc-700 hover:border-orange-500 hover:text-orange-500"
            onClick={onOpenKnowledge}
          >
            <BookOpen className="mr-2 w-4 h-4" />
            Zum Wissenspool
          </Button>
        </div>
      </div>
    </div>
  );
}
