import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Mic, Wind, Brain, Activity, Play, Info, Music2, History as HistoryIcon } from "lucide-react";
import { Method36Trainer } from "@/components/Method36Trainer";
import { MetabolicBreathingTrainer } from "@/components/MetabolicBreathingTrainer";
import { IntervalTrainer } from "@/components/IntervalTrainer";
import { TrainingHistory } from "@/components/TrainingHistory";
import { TONES } from "@/lib/tones";

type TrainingMode = 'SELECTION' | 'YOHN' | 'METABOLIC' | 'INTERVAL' | 'HISTORY';

interface TrainingCenterProps {
    frequency: number;
    toneName: string;
    color: string;
    onClose: () => void;
    initialMode?: TrainingMode;
}

export function TrainingCenter({ frequency, toneName, color, onClose, initialMode = 'SELECTION' }: TrainingCenterProps) {
    const [mode, setMode] = useState<TrainingMode>(initialMode);
    const [selectedDuration, setSelectedDuration] = useState<number>(7);
    const [selectedAudioModule, setSelectedAudioModule] = useState<'7min' | '21min' | '21min-loop'>('7min');

    useEffect(() => {
        console.log("TrainingCenter initialized with mode:", initialMode);
        setMode(initialMode);
    }, [initialMode]);

    // If a specific trainer is active, render it
    if (mode === 'YOHN') {
        return (
            <Method36Trainer 
                frequency={frequency}
                toneName={toneName}
                color={color}
                duration={selectedDuration}
                onClose={onClose}
            />
        );
    }

    if (mode === 'METABOLIC') {
        return (
            <MetabolicBreathingTrainer 
                frequency={frequency}
                toneName={toneName}
                color={color}
                audioModule={selectedAudioModule}
                onClose={onClose}
            />
        );
    }

    if (mode === 'INTERVAL') {
        // Find the full tone object for IntervalTrainer
        const toneObj = TONES.find(t => t.name === toneName) || TONES[0];
        return (
            <IntervalTrainer 
                baseTone={toneObj}
                onClose={onClose}
            />
        );
    }

    if (mode === 'HISTORY') {
        return (
            <TrainingHistory 
                onClose={onClose}
            />
        );
    }

    return (
        <div className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-4 animate-in fade-in duration-300 pt-40">
            <div className="w-full max-w-6xl mx-auto py-12 pt-40">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <Button 
                        variant="ghost" 
                        onClick={onClose}
                        className="text-zinc-400 hover:text-white"
                    >
                        <ArrowLeft className="w-5 h-5 mr-2" />
                        ZUR HAUPTSEITE
                    </Button>
                    <h2 className="text-2xl font-bold text-white">Frequenz-Training</h2>
                    <Button 
                        variant="ghost" 
                        onClick={() => setMode('HISTORY')}
                        className="text-zinc-400 hover:text-white"
                    >
                        <HistoryIcon className="w-5 h-5 mr-2" />
                        MEINE ANALYSEN
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Option 1: YOHN-Atmung (Active) */}
                    <Card 
                        className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-orange-500/50 transition-all cursor-pointer group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-12 h-12 rounded-full bg-orange-500/20 flex items-center justify-center mb-6 text-orange-500">
                                <Mic className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">YOHN-Atmung</h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-orange-400 mb-4 uppercase tracking-wider">
                                <Activity className="w-3 h-3" />
                                Aktiv • 1-1-3-1 Rhythmus
                            </div>
                            
                            <p className="text-zinc-400 mb-8 flex-grow leading-relaxed">
                                Die zentrale Atemtechnik der Methode 36. Kombiniert Atmung, Bewegung und Klang (Tönen) zur aktiven Harmonisierung und Frequenz-Aktivierung.
                            </p>

                            <div className="space-y-4 mt-auto">
                                <div className="grid grid-cols-3 gap-2">
                                    {[7, 12, 21].map(mins => (
                                        <Button
                                            key={mins}
                                            variant={selectedDuration === mins ? "default" : "outline"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedDuration(mins);
                                            }}
                                            className={`h-10 ${selectedDuration === mins ? 'bg-orange-500 hover:bg-orange-600 text-white' : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'}`}
                                        >
                                            {mins} Min
                                        </Button>
                                    ))}
                                </div>
                                <Button 
                                    className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-lg font-medium"
                                    onClick={() => setMode('YOHN')}
                                >
                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                    Training Starten
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Option 2: Stoffwechsel-Atmung (Passive) */}
                    <Card 
                        className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-blue-500/50 transition-all group relative overflow-hidden"
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mb-6 text-blue-500">
                                <Wind className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">Stoffwechsel-Atmung</h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-blue-400 mb-4 uppercase tracking-wider">
                                <Brain className="w-3 h-3" />
                                Passiv • 2:4 Rhythmus
                            </div>
                            
                            <p className="text-zinc-400 mb-8 flex-grow leading-relaxed">
                                Eine passive Technik zur unterbewussten parasympathischen Regulation. Ideal als Hintergrundbegleitung bei der Arbeit oder Entspannung.
                            </p>

                            <div className="mt-auto space-y-4">
                                <div className="bg-zinc-950/50 rounded-lg p-4 border border-zinc-800/50">
                                    <div className="flex justify-between text-sm text-zinc-500 mb-2">
                                        <span>Einatmen</span>
                                        <span>Ausatmen</span>
                                    </div>
                                    <div className="h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                                        <div className="w-1/3 bg-blue-500/50" />
                                        <div className="w-2/3 bg-blue-500/20" />
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-600 mt-1 font-mono">
                                        <span>2 Beats</span>
                                        <span>4 Beats</span>
                                    </div>
                                </div>
                                
                                <div className="space-y-2">
                                    <label className="text-xs font-mono text-blue-400 uppercase tracking-wider">Musik-Modul</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        {['7min', '21min', '21min-loop'].map((module: any) => (
                                            <Button
                                                key={module}
                                                variant={selectedAudioModule === module ? "default" : "outline"}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedAudioModule(module as '7min' | '21min' | '21min-loop');
                                                }}
                                                className={`h-10 text-xs font-medium ${
                                                    selectedAudioModule === module
                                                        ? 'bg-blue-500 hover:bg-blue-600 text-white border-blue-500' 
                                                        : 'border-zinc-700 text-zinc-300 hover:bg-zinc-800'
                                                }`}
                                            >
                                                {module === '7min' ? '7 Min' : module === '21min' ? '21 Min' : '21 Loop'}
                                            </Button>
                                        ))}
                                    </div>
                                </div>
                                
                                <Button 
                                    className="w-full bg-white text-black hover:bg-zinc-200 h-12 text-lg font-medium"
                                    onClick={() => setMode('METABOLIC')}
                                >
                                    <Play className="w-4 h-4 mr-2 fill-current" />
                                    Training Starten
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Option 3: Interval Training (Musical) */}
                    <Card 
                        className="bg-zinc-900/50 border-zinc-800 hover:bg-zinc-900 hover:border-purple-500/50 transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => setMode('INTERVAL')}
                    >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <CardContent className="p-8 flex flex-col h-full relative z-10">
                            <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-6 text-purple-500">
                                <Music2 className="w-6 h-6" />
                            </div>
                            
                            <h3 className="text-2xl font-bold text-white mb-2">Intervall-Training</h3>
                            <div className="flex items-center gap-2 text-xs font-mono text-purple-400 mb-4 uppercase tracking-wider">
                                <Activity className="w-3 h-3" />
                                Musikalisch • Harmonien
                            </div>
                            
                            <p className="text-zinc-400 mb-8 flex-grow leading-relaxed">
                                Trainiere dein Gehör und deine Stimme mit harmonischen Intervallen. Lerne, die Resonanzräume deines Körpers gezielt anzusteuern.
                            </p>

                            <div className="mt-auto">
                                <div className="bg-zinc-950/50 rounded-lg p-4 mb-4 border border-zinc-800/50">
                                    <div className="grid grid-cols-4 gap-1 h-8">
                                        {[1,2,3,4,5,6,7,8].map(i => (
                                            <div key={i} className={`rounded-sm ${i % 2 === 0 ? 'bg-purple-500/40' : 'bg-purple-500/20'}`} />
                                        ))}
                                    </div>
                                    <div className="flex justify-between text-xs text-zinc-600 mt-2 font-mono">
                                        <span>Grundton</span>
                                        <span>Oktave</span>
                                    </div>
                                </div>
                                <Button 
                                    className="w-full border-zinc-700 text-white hover:bg-zinc-800 h-12 text-lg font-medium"
                                    variant="outline"
                                >
                                    <Play className="w-4 h-4 mr-2" />
                                    Training Öffnen
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
                
                {/* Coming Soon Teaser */}
                <div className="mt-12 text-center">
                   <p className="text-zinc-500 text-sm uppercase tracking-widest mb-4">Demnächst verfügbar</p>
                   <div className="flex flex-wrap justify-center gap-4 opacity-50">
                        {['Klangatmung', 'Bewegungsatmung', 'Geistatmung', 'Geistklangatmung'].map(tech => (
                            <span key={tech} className="px-4 py-2 rounded-full border border-zinc-800 text-zinc-600 text-sm">
                                {tech}
                            </span>
                        ))}
                   </div>
                </div>
            </div>
        </div>
    );
}
