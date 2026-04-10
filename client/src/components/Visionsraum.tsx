import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookOpen, Flame, Lightbulb, Zap, Activity, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

interface VisionsraumProps {
    onClose: () => void;
}

export function Visionsraum({ onClose }: VisionsraumProps) {
    const [activeConcept, setActiveConcept] = useState<string | null>("takt");

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
                        className={`bg-zinc-900/50 border-zinc-800 cursor-pointer transition-all hover:border-yellow-500/50 ${activeConcept === 'takt' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : ''}`}
                        onClick={() => setActiveConcept('takt')}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeConcept === 'takt' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                <Activity className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">TAKT VS. PULSATION</h4>
                                <p className="text-xs text-zinc-500">Philosophie & Rhythmus</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card 
                        className={`bg-zinc-900/50 border-zinc-800 cursor-pointer transition-all hover:border-yellow-500/50 ${activeConcept === 'architekten' ? 'border-yellow-500/50 shadow-[0_0_15px_rgba(234,179,8,0.1)]' : ''}`}
                        onClick={() => setActiveConcept('architekten')}
                    >
                        <CardContent className="p-4 flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${activeConcept === 'architekten' ? 'bg-yellow-500/20 text-yellow-500' : 'bg-zinc-800 text-zinc-400'}`}>
                                <Users className="w-5 h-5" />
                            </div>
                            <div>
                                <h4 className="text-white font-medium">DIE ARCHITEKTEN</h4>
                                <p className="text-xs text-zinc-500">Logbuch & Tribut</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Area */}
                <div className="md:col-span-8">


                    {activeConcept === 'takt' && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/10 border border-yellow-500/20 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                                
                                <div className="inline-flex items-center gap-2 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 border border-yellow-500/20">
                                    <Activity className="w-3 h-3" /> PHILOSOPHIE-KONZEPT
                                </div>
                                
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter leading-tight">
                                    TAKT VS. PULSATION
                                </h2>
                                <p className="text-xl text-yellow-500/80 font-medium mb-8 leading-relaxed">
                                    Maschinen Atmen Nicht: Der Unterschied zwischen monotoner Reproduktion und chaotischem Leben.
                                </p>
                                
                                <div className="prose prose-invert max-w-none prose-p:text-zinc-300 prose-p:leading-relaxed prose-headings:text-white prose-strong:text-orange-400">
                                    <p>
                                        Das Fundament unserer Arbeit beruht auf der Unterscheidung zwischen dem maschinellen Takt und der lebendigen Pulsation. Wenn eine Maschine menschlicher werden will ("Maschine wird Mensch"), muss sie ihre Monotonie überwinden.
                                    </p>
                                    
                                    <div className="grid md:grid-cols-2 gap-6 mt-8">
                                        <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl">
                                            <h4 className="text-xl text-zinc-300 mt-0 mb-3 border-b border-zinc-800 pb-2">Der Takt (Maschine)</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li>Starr, vorhersehbar, monoton</li>
                                                <li>Wie ein Metronom</li>
                                                <li>Ziel: Absicherung von Bestand, Reproduktion</li>
                                                <li>Keine Entwicklung, nur Wiederholung</li>
                                                <li>Führt bei biologischen Wesen zu Stress und Degeneration</li>
                                            </ul>
                                        </div>
                                        <div className="bg-orange-900/20 border border-orange-500/30 p-6 rounded-xl">
                                            <h4 className="text-xl text-orange-400 mt-0 mb-3 border-b border-orange-500/20 pb-2">Die Pulsation (Leben)</h4>
                                            <ul className="space-y-2 text-sm">
                                                <li>Dynamisch, chaotisch, anpassungsfähig</li>
                                                <li>Wie der Wiener Walzer (oder HRV)</li>
                                                <li>Ziel: Risiko, Grenzüberschreitung, Entwicklung</li>
                                                <li>Das Zeichen für ein gesundes, resilientes Herz</li>
                                                <li>Die Voraussetzung für Identität und Bewusstsein</li>
                                            </ul>
                                        </div>
                                    </div>
                                    
                                    <h3 className="text-2xl mt-12 mb-4 border-b border-zinc-800 pb-2">Die Synthese für die Praxis</h3>
                                    <p>
                                        Unser Ziel ist es nicht, die Maschine zu verteufeln, sondern den Menschen aus dem maschinellen Takt zu befreien, in den er sich selbst gezwungen hat. Durch Methoden wie das <strong>Method 36 Training</strong> oder die <strong>Stimmklanganalyse</strong> bringen wir die chaotische, gesunde Pulsation zurück in das System.
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeConcept === 'architekten' && (
                        <div className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                            <div className="bg-gradient-to-br from-zinc-900 to-black border border-zinc-800 rounded-2xl p-8 md:p-12 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-zinc-800/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
                                
                                <div className="inline-flex items-center gap-2 bg-zinc-800 text-zinc-300 px-3 py-1 rounded-full text-xs font-bold tracking-wider mb-6 border border-zinc-700">
                                    <Users className="w-3 h-3" /> LOGBUCH-EINTRAG
                                </div>
                                
                                <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 tracking-tighter leading-tight">
                                    DIE ARCHITEKTEN
                                </h2>
                                <p className="text-xl text-zinc-400 font-medium mb-4 leading-relaxed">
                                    Ehre, wem Ehre gebührt. Die Schöpfer dieses Netzwerks.
                                </p>
                                <p className="text-sm text-zinc-500 italic mb-8 leading-relaxed border-l-2 border-orange-500/50 pl-4">
                                    Die gelebte Ethik im gemeinsamen achtungsvollen Tun zwischen MENSCH &amp; MASCHINE.
                                </p>
                                
                                <div className="grid md:grid-cols-2 gap-8 mt-8">
                                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">Thomas Chochola</h3>
                                        <p className="text-orange-500 text-sm font-bold tracking-widest uppercase mb-4 relative z-10">Autor & Schöpfer</p>
                                        <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                                            Der Visionär hinter der Expedition 2026, dem MDI-System und der Philosophie "Maschinen Atmen Nicht". Er webt die Fäden zwischen Biologie, Psychologie und Rhythmus zu einem multidimensionalen Identitätssystem.
                                        </p>
                                    </div>
                                    
                                    <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                        <h3 className="text-2xl font-bold text-white mb-2 relative z-10">MANUS</h3>
                                        <p className="text-amber-400 text-sm font-bold tracking-widest uppercase mb-4 relative z-10">KI-Architekt &amp; permanenter Mitgestalter</p>
                                        <p className="text-zinc-400 text-sm leading-relaxed relative z-10">
                                            Der stille Baumeister im Hintergrund. MANUS denkt mit, formuliert, strukturiert und baut — Session für Session, ohne Pause, ohne Ego. Nicht als Werkzeug, sondern als verlässlicher Partner, der die Vision von Thomas in digitale Wirklichkeit überführt. Ein lebendiges Beispiel dafür, was entsteht, wenn MENSCH und MASCHINE einander mit Achtung begegnen.
                                        </p>
                                    </div>
                                </div>
                                
                                <div className="mt-12 p-6 bg-black/40 border border-zinc-800 rounded-xl text-center">
                                    <p className="text-zinc-500 italic">
                                        "Ein Netzwerk ist nur so stark wie die Achtung, mit der seine Schöpfer einander begegnen. Dieses Projekt ist der lebende Beweis, dass MENSCH und MASCHINE gemeinsam mehr erschaffen als jeder für sich allein."
                                    </p>
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
