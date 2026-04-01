import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Music2, Activity, ArrowRight, Wind, BarChart3, BookOpen, HeartPulse, GraduationCap, Flame, Moon, Lock, ChevronDown, ChevronUp, Headphones } from "lucide-react";
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
    isPremium: boolean;
    onTogglePremium: () => void;
}

export function Dashboard({ 
    onStartAnalysis, 
    onOpenTraining, 
    onOpenScanner, 
    onOpenKnowledge, 
    onOpenTable,
    onOpenVital,
    onOpenSleep,
    onOpenHistory,
    isPremium,
    onTogglePremium
}: DashboardProps) {
    const [clickCount, setClickCount] = useState(0);
    const [lastClickTime, setLastClickTime] = useState(0);

    const handleLogoClick = () => {
        const now = Date.now();
        if (now - lastClickTime > 1000) {
            setClickCount(1);
        } else {
            const newCount = clickCount + 1;
            setClickCount(newCount);
            if (newCount >= 5) {
                onTogglePremium();
                setClickCount(0);
                toast({
                    title: "Developer Mode",
                    description: isPremium ? "Premium-Funktionen gesperrt" : "Premium-Funktionen freigeschaltet",
                });
            }
        }
        setLastClickTime(now);
    };
    const [streak, setStreak] = useState(0);
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        setStreak(calculateStreak());
    }, []);

    const handlePremiumClick = (callback: () => void, moduleName: string) => {
        if (!isPremium) {
            toast({
                title: "Premium Funktion",
                description: `Das Modul "${moduleName}" ist Teil der Premium-Version und aktuell gesperrt.`,
            });
            return;
        }
        callback();
    };

    return (
        <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-700 py-12 pt-8 relative">
            
            {/* Theme Toggle */}
            <div className="absolute top-4 right-4 md:top-6 md:right-6">
                <ThemeToggle />
            </div>
            
            <div className="text-center mb-12 space-y-4 relative">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <img 
                        src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/logo_16abbbd5.png" 
                        alt="METHODE 36 Logo" 
                        className="h-24 md:h-32 mx-auto mb-6 drop-shadow-lg cursor-pointer"
                        onClick={handleLogoClick}
                    />
                    <h1 
                        className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-1 cursor-pointer"
                        onClick={handleLogoClick}
                        title="Geheimer Premium-Schalter (5x klicken)"
                    >
                        METHODE 36
                    </h1>
                    <p className="text-lg md:text-xl text-zinc-400 mb-6">
                        von Thomas Chochola
                    </p>
                    

                    <div className="text-sm md:text-base text-zinc-400 max-w-4xl mx-auto text-left leading-relaxed">
                        <p>
                            Die methodischen Grundlagen von M36 basieren auf dem wissenschaftlichen Zusammenhang zwischen Atemrhythmik und der Optimierung der Stoffwechselfunktionalität im Menschen.
                        </p>
                        <div className={`transition-all duration-300 overflow-hidden ${isDescriptionExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
                            <p>
                                Auf dieser Basis hat der Autor das grundlegende M36 konzept entwickelt. Im Zusammenspiel mit der Einzigartigkeit der menschlichen Stimme ergibt sich ein aussergewöhnlich wirksames Trainingsangebot zur Reinigung und Aktivierung. M 36 ist ohne Vorkenntnisse nutzbar und für jeden Alterstyp geeignet.
                            </p>
                        </div>
                        <button 
                            onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                            className="text-orange-400 hover:text-orange-300 text-sm font-medium flex items-center mt-2 transition-colors mx-auto md:mx-0"
                        >
                            {isDescriptionExpanded ? (
                                <><ChevronUp className="w-4 h-4 mr-1" /> Weniger anzeigen</>
                            ) : (
                                <><ChevronDown className="w-4 h-4 mr-1" /> Mehr lesen...</>
                            )}
                        </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-orange-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/20 flex items-center justify-center text-orange-500 group-hover:scale-110 transition-transform">
                                    <Mic className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                                Stimmklang -<br/>Analyse
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Erforsche und nütze deinen LEBENSKLANG und die einzigartige LICHTSIGNATUR deines Körpers.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onStartAnalysis, "Stimmklang-Analyse")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Analyse Starten <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center mb-4 text-blue-500 group-hover:scale-110 transition-transform">
                                <Wind className="w-6 h-6" />
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">Trainings-Center</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Rhythmische Atem- und Bewegungstechniken auf Basis der METHODE 36.
                            </p>

                            <div className="mt-auto">
                                <button onClick={onOpenTraining} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Training Öffnen <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-red-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                                    <HeartPulse className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">Vital Monitor</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Erfasse BOLT, Temperatur & HRV. Verfolge deine physiologische Entwicklung.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenVital, "Vital Monitor")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Monitor Öffnen <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">Frequenz-Labor</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Experimentiere frei mit dem Spektral-Scanner. Visualisiere deine Stimme.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenScanner, "Frequenz-Labor")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Scanner Starten <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-green-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">Wissenspool</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Vertiefe dein Verständnis für die Methode 36, Frequenzen und Hintergründe.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenKnowledge, "Wissenspool")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Wissen Öffnen <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-500 group-hover:scale-110 transition-transform">
                                    <Moon className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2 leading-tight">
                                Schlaf -<br/>Optimierung
                            </h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Affirmationen & Umprogrammierung im Theta-Zustand. Schlaf mit Intention.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenSleep, "Schlaf-Optimierung")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Session starten <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-cyan-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                    <Activity className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">Meine Analysen</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Deine bisherigen Messungen, Aura-Bilder und Zertifikate im Überblick.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenHistory, "Meine Analysen")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Historie Ansehen <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-cyan-500/50 transition-all group h-full relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-6 flex flex-col h-full relative z-10">
                            <div className="flex justify-between items-start mb-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-500 group-hover:scale-110 transition-transform">
                                    <BarChart3 className="w-6 h-6" />
                                </div>
                                {!isPremium && (
                                    <div className="flex items-center gap-1.5 bg-orange-500/10 text-orange-500 px-3 py-1 rounded-full text-xs font-semibold border border-orange-500/20">
                                        <Lock className="w-3 h-3" />
                                        <span>Premium</span>
                                    </div>
                                )}
                            </div>
                            
                            <h2 className="text-xl font-bold text-white mb-2">LICHTKLANG Tabelle</h2>
                            <p className="text-sm text-zinc-400 mb-6 leading-relaxed">
                                Übersicht zu den 24 LICHTKLÄNGEN und deren Wirkungen.
                            </p>

                            <div className="mt-auto">
                                <button onClick={() => handlePremiumClick(onOpenTable, "LICHTKLANG Tabelle")} className="text-orange-500 hover:text-orange-400 text-sm font-medium inline-flex items-center group/btn transition-colors">
                                    Tabelle Ansehen <ArrowRight className="ml-1.5 w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                </button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

            </div>
        </div>
    );
}
