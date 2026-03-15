import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Music2, Activity, ArrowRight, Wind, BarChart3, BookOpen, HeartPulse, GraduationCap, Flame, Moon } from "lucide-react";
import { calculateStreak } from "@/lib/training";
import { useEffect, useState } from "react";
import { motion } from 'framer-motion';
import { ThemeToggle } from "./ThemeToggle";

interface DashboardProps {
    onStartAnalysis: () => void;
    onOpenTraining: () => void;
    onOpenScanner: () => void;
    onOpenKnowledge: () => void;
    onOpenTable: () => void;
    onOpenVital: () => void;
    onOpenSleep: () => void;
}

export function Dashboard({ onStartAnalysis, onOpenTraining, onOpenScanner, onOpenKnowledge, onOpenTable, onOpenVital, onOpenSleep }: DashboardProps) {
    const [streak, setStreak] = useState(0);

    useEffect(() => {
        setStreak(calculateStreak());
    }, []);

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
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                        METHODE 36
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Entdecke deine wahre Frequenz. Harmonisiere Körper & Geist.
                    </p>
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
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Frequenz-Analyse</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Bestimme deine energetische Signatur durch deine Stimme. Finde deinen Grundton.
                            </p>

                            <div className="mt-auto">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-lg group-hover:translate-x-1 transition-transform">
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
                                Aktive und passive Atemtechniken zur Harmonisierung. YOHN & Stoffwechsel.
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
                        onClick={onOpenVital}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-red-500/20 flex items-center justify-center mb-6 text-red-500 group-hover:scale-110 transition-transform">
                                <HeartPulse className="w-7 h-7" />
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
                        onClick={onOpenSleep}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                                <Moon className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Schlaf & Theta</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Affirmationen & Umprogrammierung im Theta-Zustand. Schlaf mit Intention.
                            </p>

                            <div className="mt-auto">
                                <Button className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Schlaf-Session Starten <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                 {/* Pillar 7: Frequency Table (To balance the grid 3x2) */}
                 <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.7 }}
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
