import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChevronRight, AlertCircle, BookOpen, ArrowLeft, Lock, ChevronDown, ChevronUp, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { BasicColorSelector } from "@/components/BasicColorSelector";
import { useToast } from "@/hooks/use-toast";
import { trpc } from "@/lib/trpc";

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
  onStartBasicTraining?: (freq: number, tone: string, color: string, typeId: number) => void;
  onOpenKnowledge?: () => void;
  onClose?: () => void;
  isPremium?: boolean;
}

/** Prüft ob eine Kategorie oder ein Item freigeschaltet ist */
function istFreigeschaltet(
  freigaben: Record<string, boolean | Record<string, boolean>>,
  isAdmin: boolean,
  categoryId: string,
  itemId?: string
): boolean {
  if (isAdmin) return true;
  const cat = freigaben[categoryId];
  if (!cat) return false;
  if (cat === true) return true;
  if (itemId && typeof cat === "object") return !!cat[itemId];
  return false;
}

const TRAINING_CATEGORIES: TrainingCategory[] = [
  {
    id: "befindlichkeit",
    name: "BEFINDLICHKEITSTRAINING",
    icon: "🌈",
    description: "Wähle intuitiv deine momentane Stimmung und aktiviere dein Potential.",
    items: [],
  },
  {
    id: "breathing",
    name: "1 - ATEMTRAINING",
    icon: "🫁",
    description: "Übungen in diesem Segment konzentrieren sich auf die Stärkung der Atemkompetenz mit all ihren positiven Auswirkungen auf das ganzheitliche Wohlbefinden.",
    items: [],
  },
  {
    id: "voice",
    name: "2 - STIMMKLANGTRAINING",
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
    name: "3 - BEWEGUNGSTRAINING",
    icon: "🏃",
    description: "Übungen in diesem Segment konzentrieren sich auf körperliche Bewegungsübungen in Abstimmung mit rhythmisch koordinierten Atemzyklen. Sie dienen der optimalen Aktivierung von Muskelketten - gesteuert durch gezielte Atemrhythmik.",
    items: [],
  },
  {
    id: "ambient",
    name: "4 - UMFELDAKTIVIERUNG",
    icon: "✨",
    description: "Übungen in diesem Segment dienen der Regulation des Umfelds durch sanfte Hintergrundkompositionen. Zudem motivieren die eingearbeiteten Pulsationen zu einem optimalen Atemrhythmus.",
    items: [
      {
        id: "metabolic",
        name: "RESONANZ AUS DEM RAUM",
        description: "Lass die Komposition als Klangraum wirken – im Hintergrund beim Arbeiten, in der Pause oder zur bewussten Einstimmung. Sie ist so komponiert, dass sie deinen inneren Resonanzraum aktiviert.\n\nWIRKUNG: Die Klangschichten sprechen direkt das Nervensystem an und unterstützen einen Zustand tiefer Wachheit bei gleichzeitiger Entspannung. Ideal für kreative Arbeit, Reflexion oder als Übergang in eine Meditationsphase.\n\nANWENDUNG: Reguliere die Lautstärke so, dass der Sound angenehm wahrnehmbar ist / Schließe die Augen für einige Atemzüge und lass den Klang in dich einwirken.\n\nWICHTIG: Keine Kopfhörer erforderlich – der Raumklang entfaltet seine Wirkung auch über Lautsprecher.",
        durations: [0],
        audioUrls: {
          0: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/RESONSANZausdemRAUM_434eee24.mp3",
        },
        type: "ambient",
      },
      {
        id: "mayerwelle",
        name: "MAYERWELLE 5,5 / MW",
        description: "OPTIMALE NUTZUNG: Verwende die MW als Hintergrundsound um ein regenerierendes Umfeld zu unterstützen und deinen Atemzyklus auf eine optimale Atemrhythmik einzuschwingen (Detailinfo dazu unter METHODE 36).\n\nWIRKUNG: Dein Unterbewusstsein beginnt, einen förderlichen Atemrhythmus aufzunehmen und dadurch deinen Stresspegel zu regulieren. Du bleibst entspannter und gleichzeitig erfrischt (Wasserrauschen) während deiner aktiven Tätigkeiten.\n\nANWENDUNG: Wähle eine Zeitdauer / Reguliere die Lautstärke so, dass der Sound im Hintergrund wahrnehmbar ist / Stimme dich zu Beginn für einige Atemzyklen auf die Gongsignale hinter dem Wasser rauschen ein / erster Gong = EINatmen / zweiter Gong = HALTEN / dritter Gong = AUSatmen.\n\nWICHTIG: Versuche stets durch die Nase zu atmen / SOWOHL EIN- WIE AUS !",
        durations: [45],
        audioUrls: {
          45: "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/ambient-extra_262fb71f.mp3",
        },
        type: "ambient",
      },
    ],
  },
];

export function TrainingCategoryStructure({ 
  onStartTraining,
  onStartBasicTraining,
  onOpenKnowledge,
  onClose,
  isPremium
}: TrainingCategoryStructureProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { toast } = useToast();
  const { data: freigabenData } = trpc.training.getFreigaben.useQuery();
  const freigaben = freigabenData?.freigaben ?? {};
  const isAdmin = freigabenData?.isAdmin ?? false;
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [selectedDuration, setSelectedDuration] = useState<number | null>(null);
  const [showBtInfo, setShowBtInfo] = useState<boolean>(false);

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
              {/* Dauer-Auswahl nur anzeigen wenn echte Dauern vorhanden (nicht [0]) */}
              {item.durations && item.durations.length > 0 && !item.durations.every(d => d === 0) && (
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

              {/* Start Training Button – bei durations=[0] sofort aktiv */}
              <Button 
                className="w-full h-12 bg-orange-500 hover:bg-orange-600 text-black font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!selectedDuration && !item.durations?.every(d => d === 0)}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const dur = item.durations?.every(d => d === 0) ? 0 : selectedDuration;
                  if (dur !== null && dur !== undefined && onStartTraining) {
                    onStartTraining(item, dur);
                  }
                }}
              >
                Training starten
              </Button>


            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (category) {
    if (category.id === "befindlichkeit") {
      return (
        <div className="min-h-screen bg-black text-foreground">
          <div className="container max-w-6xl mx-auto px-4 py-8">
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
            
            <div className="mb-8 max-w-3xl mx-auto text-center">
              <h1 className="text-4xl font-bold mb-4">{category.name} <span className="text-orange-400">(BT)</span></h1>
              <p className="text-zinc-300 text-lg leading-relaxed">
                {category.description}
              </p>

              {/* Oranger Info-Button */}
              <button
                onClick={() => setShowBtInfo(!showBtInfo)}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl transition-all text-sm"
              >
                <Info className="w-4 h-4" />
                Hier erfährst du WIE, WANN und WARUM du mit dem BT trainieren solltest....
                {showBtInfo ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {/* Aufklappbarer Info-Bereich */}
              {showBtInfo && (
                <div className="mt-4 text-left bg-zinc-900/70 border border-orange-500/30 rounded-2xl p-6 space-y-6 text-sm text-zinc-300 leading-relaxed">
                  {/* MA-Stimme Audio – Thomas' Studioaufnahme */}
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
                    <p className="mb-2">Es gibt vier Grundregeln für das optimale Tun mit BT:</p>
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
                    <p className="mb-3">Generelle Empfehlung ist es, zumindest zu Beginn deiner Erfahrungen mit dem BT, ein <strong className="text-white">LICHTKLANGTHEMA</strong> zu wählen und mindestens sieben Tage damit zu trainieren. So kannst du nachhaltige Wirkungen in deinem Verhaltenskonzept bewirken.</p>
                    <p className="mb-2">Es gibt vier Zeitfenster über den Tag verteilt, die für ein BT empfohlen sind:</p>
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

            <BasicColorSelector 
              onStartTraining={(freq, tone, color, typeId) => {
                if (onStartBasicTraining) {
                  onStartBasicTraining(freq, tone, color, typeId);
                }
              }} 
            />
          </div>
        </div>
      );
    }

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
              <div key={item.id} id={item.id === 'metabolic' ? 'resonanz-komposition' : undefined} style={item.id === 'metabolic' ? {scrollMarginTop: '80px'} : undefined}>
              <Card
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
              </div>
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
          {TRAINING_CATEGORIES.map((cat) => {
            const freigeschaltet = istFreigeschaltet(freigaben, isAdmin, cat.id);
            return (
              <Card
                key={cat.id}
                className={cn(
                  "bg-gradient-to-br from-zinc-900/50 to-zinc-800/30 border-zinc-800 transition-all group relative overflow-hidden",
                  freigeschaltet
                    ? "cursor-pointer hover:bg-zinc-900 hover:border-orange-500/50"
                    : "cursor-not-allowed select-none opacity-60"
                )}
                onClick={() => {
                  if (freigeschaltet) {
                    setSelectedCategory(cat.id);
                  } else {
                    toast({
                      title: "Bald verfügbar",
                      description: "Diese Einheit wird schrittweise für unsere Community geöffnet.",
                    });
                  }
                }}
              >
                <CardContent className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-5xl">{cat.icon}</div>
                    {freigeschaltet ? (
                      isAdmin && (
                        <div className="flex items-center gap-1.5 bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-semibold border border-green-500/20">
                          <span>ADMIN</span>
                        </div>
                      )
                    ) : (
                      <div className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 px-3 py-1 rounded-full text-xs font-semibold border border-amber-500/20">
                        <Lock className="w-3 h-3" />
                        <span>BALD</span>
                      </div>
                    )}
                  </div>
                  <h2 className="text-2xl font-bold mb-3">
                    {cat.name}
                  </h2>
                  <p className="text-sm text-zinc-400 line-clamp-3 mb-4">
                    {cat.description}
                  </p>
                  <div className="flex items-center justify-between">
                    {freigeschaltet ? (
                      <span className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center gap-1">
                        Öffnen <ChevronRight className="w-4 h-4" />
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-500">Bald verfügbar</span>
                    )}
                    {!freigeschaltet && <Lock className="w-4 h-4 text-amber-500/60" />}
                  </div>
                </CardContent>
              </Card>
            );
          })}
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
