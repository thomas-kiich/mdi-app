import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, Music2, Activity, ArrowRight, Wind, BarChart3, BookOpen } from "lucide-react";
import { motion } from 'framer-motion';

interface DashboardProps {
    onStartAnalysis: () => void;
    onOpenTraining: () => void;
    onOpenScanner: () => void;
    onOpenKnowledge: () => void;
    onOpenTable: () => void;
}

export function Dashboard({ onStartAnalysis, onOpenTraining, onOpenScanner, onOpenKnowledge, onOpenTable }: DashboardProps) {
    return (
        <div className="min-h-[80vh] flex flex-col justify-center animate-in fade-in duration-700">
            
            <div className="text-center mb-16 space-y-4">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-4xl md:text-6xl font-bold text-white tracking-tighter mb-4">
                        METHODE 36
                    </h1>
                    <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
                        Entdecke deine wahre Frequenz. Harmonisiere Körper & Geist.
                    </p>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto w-full px-4">
                
                {/* Pillar 1: Analysis */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.1 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-orange-500/50 transition-all cursor-pointer group h-full relative overflow-hidden"
                        onClick={onStartAnalysis}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center mb-6 text-orange-500 group-hover:scale-110 transition-transform">
                                <Mic className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Frequenz-Analyse</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Bestimme deine energetische Signatur durch deine Stimme. Finde deinen Grundton und deine Farbe.
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
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all cursor-pointer group h-full relative overflow-hidden"
                        onClick={onOpenTraining}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500 group-hover:scale-110 transition-transform">
                                <Wind className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Trainings-Center</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Aktive und passive Atemtechniken zur Harmonisierung. YOHN-Atmung, Stoffwechsel-Atmung & Intervalle.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Training Öffnen <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Pillar 3: Laboratory */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                >
                    <Card 
                        className="bg-zinc-900/40 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all cursor-pointer group h-full relative overflow-hidden"
                        onClick={onOpenScanner}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-14 h-14 rounded-2xl bg-purple-500/20 flex items-center justify-center mb-6 text-purple-500 group-hover:scale-110 transition-transform">
                                <Activity className="w-7 h-7" />
                            </div>
                            
                            <h2 className="text-2xl font-bold text-white mb-2">Frequenz-Labor</h2>
                            <p className="text-zinc-400 mb-8 leading-relaxed">
                                Experimentiere frei mit dem Spektral-Scanner. Visualisiere deine Stimme in Echtzeit.
                            </p>

                            <div className="mt-auto">
                                <Button variant="outline" className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg group-hover:translate-x-1 transition-transform">
                                    Scanner Starten <ArrowRight className="ml-2 w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Footer Links */}
            <div className="mt-16 flex justify-center gap-8">
                <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={onOpenKnowledge}>
                    <BookOpen className="w-4 h-4 mr-2" /> Wissenspool
                </Button>
                <Button variant="ghost" className="text-zinc-500 hover:text-white" onClick={onOpenTable}>
                    <BarChart3 className="w-4 h-4 mr-2" /> Frequenz-Tabelle
                </Button>
            </div>
        </div>
    );
}
