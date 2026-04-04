import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Flame, Lightbulb, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisionsraumProps {
    onClose: () => void;
}

export function Visionsraum({ onClose }: VisionsraumProps) {
    const [activeConcept, setActiveConcept] = useState<string | null>("atemdiaet");

    return (
        <div className="max-w-5xl mx-auto py-8 px-4 animate-in fade-in duration-500">
            <header className="mb-12">
                <Button 
                    variant="ghost" 
                    className="text-zinc-500 hover:text-white mb-6 -ml-4"
                    onClick={onClose}
                >
                    <ArrowLeft className="mr-2 w-4 h-4" /> Zurück zum Dashboard
                </Button>
                
                <div className="flex items-center gap-4 mb-4">
                    <div className="w-16 h-16 rounded-2xl bg-yellow-500/20 flex items-center justify-center text-yellow-500">
                        <Flame className="w-8 h-8" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Visionsraum</h1>
                        <p className="text-zinc-400 mt-2 text-lg">Der Inkubator für neue Konzepte der Expedition 2026.</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                {/* Sidebar / Navigation */}
                <div className="md:col-span-4 space-y-4">
                    <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Aktuelle Konzepte</h3>
                    
                    <Card 
                        className={`bg-zinc-900/50 border-zinc-800 cursor-pointer transition-all hover:border-yellow-500/50 ${activeConcept === 'atemdiaet' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : ''}`}
                        onClick={() => setActiveConcept('atemdiaet')}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeConcept === 'atemdiaet' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                <Wind className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">DIE ATEMDIÄT</h4>
                                <p className="text-xs text-zinc-500">Stoffwechsel & Rhythmus</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-zinc-900/20 border-zinc-800/50 border-dashed opacity-50">
                        <CardContent className="p-4 flex items-center justify-center h-24">
                            <p className="text-xs text-zinc-600 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4" /> Platz für neue Visionen
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="md:col-span-8">
                    {activeConcept === 'atemdiaet' && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                                
                                <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 border border-yellow-500/20">
                                    <Zap className="w-3 h-3" /> KONZEPT-ENTWURF
                                </div>
                                
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter leading-tight">
                                    DIE ATEMDIÄT
                                </h2>
                                <p className="text-xl text-yellow-500/80 font-medium mb-8 leading-relaxed">
                                    Warum du nicht abnimmst, wenn du falsch atmest – und wie 7 Minuten Rhythmus deinen Stoffwechsel neu programmieren.
                                </p>
                                
                                <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-orange-400">
                                    <p>
                                        Ein radikal neuer Ansatz zur Gewichtsregulation, der nicht beim Magen, sondern beim Nervensystem und der Atmung ansetzt.
                                    </p>
                                    
                                    <h3 className="text-2xl mt-8 mb-4 border-b border-zinc-800 pb-2">Die Kern-These</h3>
                                    <p>
                                        Über 85 % der Menschen scheitern beim Versuch, ihr Normalgewicht zu erreichen oder zu halten. Der Grund ist nicht mangelnde Disziplin oder die falsche Kalorienbilanz, sondern ein <strong>Stoffwechsel-Wirkungsgrad von oft nur 60 %</strong>. Wenn das autonome Nervensystem im permanenten "Überlebens- und Stressmodus" (Sympathikus) feststeckt, schaltet der Körper auf Notstrom und Fettspeicherung.
                                    </p>
                                    <p>
                                        Die Lösung liegt nicht auf dem Teller, sondern im Atemrhythmus. "Die Atemdiät" nutzt harte physiologische Fakten – <strong>CO2-Toleranz, Stickstoffmonoxid-Produktion (NO) und Körperkerntemperatur</strong> –, um den Stoffwechsel über gezieltes Mikrotraining (7–12 Minuten) von "Überleben" auf "Verbrennung" umzuprogrammieren.
                                    </p>

                                    <h3 className="text-2xl mt-12 mb-6 border-b border-zinc-800 pb-2">Die drei Säulen der Atemdiät</h3>
                                    
                                    <div className="grid gap-6 mt-6">
                                        <div className="bg-black/40 border border-zinc-800 p-6 rounded-xl">
                                            <h4 className="text-xl text-yellow-500 mt-0 mb-3 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm">1</span>
                                                Die Physiologie des Atems
                                            </h4>
                                            <p className="mb-2"><strong>Die CO2-Toleranz als Schalter:</strong> Nur wer eine hohe Toleranz für Kohlendioxid im Blut aufbaut, ermöglicht es den roten Blutkörperchen, Sauerstoff an die Zellen (und Mitochondrien) abzugeben (Bohr-Effekt).</p>
                                            <p className="mb-2"><strong>Das Wunder-Molekül NO:</strong> Entsteht primär bei Nasenatmung. Es weitet Gefäße, senkt Blutdruck und pusht das Immunsystem.</p>
                                            <p className="mb-0"><strong>Die Körperkerntemperatur:</strong> Gezielte Atemtechniken beeinflussen die Thermogenese und steigern den Grundumsatz.</p>
                                        </div>

                                        <div className="bg-black/40 border border-zinc-800 p-6 rounded-xl">
                                            <h4 className="text-xl text-yellow-500 mt-0 mb-3 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm">2</span>
                                                Das Rhythmus-Mikrotraining
                                            </h4>
                                            <p className="mb-2"><strong>7 bis 12 Minuten:</strong> Kurze, hochpräzise Rhythmus-Einheiten, die das System "resetten" statt stundenlangem, stressigem Ausdauertraining.</p>
                                            <p className="mb-0"><strong>Takt vs. Pulsation:</strong> Wir brechen die maschinelle Monotonie (den Stress-Takt) auf und etablieren eine dynamische Pulsation (HRV), die dem Körper Sicherheit signalisiert.</p>
                                        </div>

                                        <div className="bg-black/40 border border-zinc-800 p-6 rounded-xl">
                                            <h4 className="text-xl text-yellow-500 mt-0 mb-3 flex items-center gap-2">
                                                <span className="w-8 h-8 rounded-full bg-yellow-500/20 flex items-center justify-center text-sm">3</span>
                                                Neurobiologische Hacks
                                            </h4>
                                            <p className="mb-2"><strong>Der "Graue-Brille-Effekt":</strong> Unser Gehirn assoziiert leuchtende Farben evolutionär mit energiereicher Nahrung. Entzieht man der Nahrung (mental oder real) die Farbe, stuft das Gehirn sie als unattraktiv ein. Der Appetit verschwindet gehirnphysiologisch sofort.</p>
                                            <p className="mb-0"><strong>Reizunterbrechung:</strong> Gezielte Atempausen unterbrechen den "Autopiloten" beim Essen.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Temporary icon definition since Wind might not be imported correctly in this isolated scope if missing
function Wind(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.7 7.7a2.5 2.5 0 1 1 1.8 4.3H2" />
      <path d="M9.6 4.6A2 2 0 1 1 11 8H2" />
      <path d="M12.6 19.4A2 2 0 1 0 14 16H2" />
    </svg>
  )
}
