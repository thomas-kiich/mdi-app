import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Music2, Activity, ArrowRight, Wind, BarChart3, BookOpen, HeartPulse, GraduationCap, Flame, Moon, Lock } from "lucide-react";
import { calculateStreak } from "@/lib/training";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { ThemeToggle } from "./ThemeToggle";
import { useToast } from "@/hooks/use-toast";

interface DashboardProps {
    onStartAnalysis: () => void;
    onOpenTraining: () => void;
    onOpenScanner: () => void;
    onOpenKnowledge: () => void;
    onOpenTable: () => void;
    onOpenVital: () => void;
    onOpenSleep: () => void;
    onOpenHistory: () => void;
}

export function Dashboard({ onStartAnalysis, onOpenTraining, onOpenScanner, onOpenKnowledge, onOpenTable, onOpenVital, onOpenSleep, onOpenHistory }: DashboardProps) {
    const [streak, setStreak] = useState(0);
    const { toast } = useToast();

    useEffect(() => {
        setStreak(calculateStreak());
    }, []);

    const handlePremiumClick = (callback: () => void, moduleName: string) => {
        toast({
            title: "Premium Modul",
            description: `Das Modul "${moduleName}" wird in der finalen Version kostenpflichtig sein. Für diesen Test ist es jedoch freigeschaltet.`,
        });
        // Slight delay to allow user to read the toast before navigating
        setTimeout(callback, 500);
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-700 py-12 pt-48 relative">
            
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <ThemeToggle />
            </div>
            
            <div className="text-center mb-12 space-y-4 relative">
                 {streak > 0 && (
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="absolute top-0 right-4 md:right-12 lg:right-24 flex items-center gap-2 bg-orange-500/10 border border-orange-500/20 px-4 py-2 rounded-full cursor-help"
                        title="Tage in Folge trainiert"
                    >
                        <Flame className="w-5 h-5 text-orange-500 fill-orange-500 animate-pulse" />
                        <span className="text-orange-500 font-bold">{streak} Tage Streak</span>
                    </motion.div>
                )}

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <img 
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png" 
                        alt="METHODE 36 Logo" 
                        className="h-24 md:h-32 mx-auto mb-6 drop-shadow-lg"
                    />
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-1">
                        METHODE 36
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 mb-6">
                        von Thomas Chochola
                    </p>
                    <div className="text-sm md:text-base text-zinc-400 max-w-4xl mx-auto text-left leading-relaxed space-y-2">
                        <p>
                            Die methodischen Grundlagen von M36 basieren auf dem wissenschaftlichen Zusammenhang zwischen Atemrhythmik und der Optimierung der Stoffwechselfunktionalität im Menschen. Auf dieser Basis hat der Autor das grundlegende M36 konzept entwickelt. Im Zusammenspiel mit der Einzigartigkeit der menschlichen Stimme ergibt sich ein aussergewöhnlich wirksames Trainingsangebot zur Reinigung und Aktivierung. M 36 ist ohne Vorkenntnisse nutzbar und für jeden Alterstyp geeignet.
                        </p>
                    </div>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto w-full px-4">
                
                {/* Pillar 1: Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-orange-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={onStartAnalysis}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                                <Mic className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                Stimmklang -<br/>Analyse
                            </h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Erforsche und nütze deinen LEBENSKLANG und die einzigartige LICHTSIGNATUR deines Körpers.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Analyse Starten <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pillar 2: Training */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={onOpenTraining}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                                <Wind className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Trainings-Center</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Rhythmische Atem- und Bewegungstechniken auf Basis der METHODE 36.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Training Öffnen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pillar 3: Vital Monitor (NEW POSITION) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-red-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={() => handlePremiumClick(onOpenVital, "Vital Monitor")}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <HeartPulse className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                    <Lock className="w-3 h-3" />
                                    <span>Premium</span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Vital Monitor</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Erfasse BOLT, Temperatur & HRV. Verfolge deine physiologische Entwicklung.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Monitor Öffnen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pillar 4: Laboratory */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={onOpenScanner}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                                <Activity className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Frequenz-Labor</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Experimentiere frei mit dem Spektral-Scanner. Visualisiere deine Stimme.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Scanner Starten <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pillar 5: Knowledge Pool (NEW POSITION) */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-green-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={onOpenKnowledge}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-green-500/20 flex items-center justify-center mb-6 text-green-500 group-hover:scale-110 transition-transform">
                                <BookOpen className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Wissenspool</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Vertiefe dein Verständnis für die Methode 36, Frequenzen und Hintergründe.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Wissen Öffnen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                 {/* Pillar 6: Sleep & Theta */}
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={() => handlePremiumClick(onOpenSleep, "Schlaf-Optimierung")}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Moon className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                    <Lock className="w-3 h-3" />
                                    <span>Premium</span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2 leading-tight">
                                Schlaf -<br/>Optimierung
                            </h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Affirmationen & Umprogrammierung im Theta-Zustand. Schlaf mit Intention.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Session starten <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                 {/* Pillar 7: Analysis History */}
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-cyan-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={() => handlePremiumClick(onOpenHistory, "Meine Analysen")}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                    <Activity className="w-7 h-7" />
                                </div>
                                <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                    <Lock className="w-3 h-3" />
                                    <span>Premium</span>
                                </div>
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Meine Analysen</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Deine bisherigen Messungen, Aura-Bilder und Zertifikate im Überblick.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Historie Ansehen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                 {/* Pillar 8: Frequency Table */}
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-cyan-500/50 transition-all cursor-pointer group h-full relative overflow-hidden min-h-[320px]"
                        onClick={onOpenTable}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-cyan-500/20 flex items-center justify-center mb-6 text-cyan-500 group-hover:scale-110 transition-transform">
                                <BarChart3 className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Frequenz-Tabelle</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Detaillierte Übersicht aller 12 Töne, Farben und körperlichen Zuordnungen.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Tabelle Ansehen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
