import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, BookOpen, Activity, Info, ChevronRight, Play } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TONES } from "@/lib/tones";
import frequencyData from "@/lib/frequencyData.json";
import { cn } from "@/lib/utils";

interface KnowledgePoolProps {
  onClose: () => void;
  initialTab?: string;
  initialToneId?: number;
}

export function KnowledgePool({ onClose, initialTab = "method", initialToneId }: KnowledgePoolProps) {
  const [selectedTone, setSelectedTone] = useState<string | null>(
    initialToneId ? initialToneId.toString() : null
  );

  // Filter frequency data to get only the 12 main tones (if frequencyData contains more)
  // Actually frequencyData contains 12 items, one for each tone.
  // We can map TONES to frequencyData.

  const renderMethodSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Die Methode 36</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-zinc-300">
          <p>
            Die <strong>Methode 36</strong> basiert auf der Erkenntnis, dass alles im Universum Schwingung ist. 
            Jeder Mensch besitzt eine einzigartige energetische Signatur – seinen persönlichen Grundton.
          </p>
          <p>
            Diese Methode verbindet altes Wissen über Harmonik mit modernster Frequenz-Analyse. 
            Der Kern ist die Zahl <strong>36</strong>, die als universeller Pulsgeber dient.
          </p>
          <h3 className="text-lg font-semibold text-white mt-6">Warum 36?</h3>
          <p>
            Der Atemrhythmus des Menschen korrespondiert in Ruhe oft mit 6 Atemzügen pro Minute. 
            36 ist ein Vielfaches davon und bildet eine harmonische Basis für unser biologisches System.
            In der Methode 36 nutzen wir diesen Takt, um Körper und Geist zu synchronisieren.
          </p>
        </CardContent>
      </Card>

      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Die 3 Säulen</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div className="p-4 bg-black/40 rounded-lg border border-zinc-800">
            <Activity className="w-8 h-8 text-orange-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">1. Analyse</h4>
            <p className="text-sm text-zinc-400">
              Bestimmung deiner aktuellen Frequenz-Signatur durch deine Stimme.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-lg border border-zinc-800">
            <BookOpen className="w-8 h-8 text-blue-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">2. Verstehen</h4>
            <p className="text-sm text-zinc-400">
              Erkennen der Zusammenhänge zwischen Ton, Farbe und deiner Persönlichkeit.
            </p>
          </div>
          <div className="p-4 bg-black/40 rounded-lg border border-zinc-800">
            <Play className="w-8 h-8 text-green-500 mb-3" />
            <h4 className="font-semibold text-white mb-2">3. Training</h4>
            <p className="text-sm text-zinc-400">
              Aktives Tönen und Atmen zur Harmonisierung und Stärkung deiner Mitte.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderFrequenciesSection = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
      {/* Type List */}
      <div className="md:col-span-1 space-y-2 overflow-y-auto pr-2 max-h-[60vh] md:max-h-[70vh]">
        {frequencyData.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedTone(type.id.toString())}
            className={cn(
              "w-full text-left p-3 rounded-lg border transition-all flex items-center justify-between group",
              selectedTone === type.id.toString() 
                ? "bg-zinc-800 border-orange-500/50" 
                : "bg-zinc-900/30 border-zinc-800 hover:bg-zinc-800/50"
            )}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-4 h-4 rounded-full shadow-[0_0_8px_rgba(0,0,0,0.5)]"
                style={{ backgroundColor: type.hex }}
              />
              <div className="flex flex-col">
                  <span className={cn(
                    "font-medium text-sm",
                    selectedTone === type.id.toString() ? "text-white" : "text-zinc-400 group-hover:text-zinc-200"
                  )}>
                    Typ {type.id} - {type.tone}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase tracking-wider">{type.metaphor}</span>
              </div>
            </div>
            <span className="text-xs text-zinc-600 font-mono">{type.frequency} Hz</span>
          </button>
        ))}
      </div>

      {/* Type Details */}
      <div className="md:col-span-2">
        <AnimatePresence mode="wait">
          {selectedTone ? (
            (() => {
              const mdiInfo = frequencyData.find(f => f.id.toString() === selectedTone);
              
              if (!mdiInfo) return null;

              return (
                <motion.div
                  key={selectedTone}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 h-full overflow-y-auto max-h-[60vh] md:max-h-[70vh]"
                >
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                          <span className="bg-black/30 text-zinc-400 px-2 py-1 rounded text-xs font-mono border border-zinc-800">TYP {mdiInfo.id}</span>
                          <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                            Ton {mdiInfo.tone} 
                            <span className="text-lg font-normal text-zinc-500">({mdiInfo.frequency} Hz)</span>
                          </h2>
                      </div>
                      <p className="font-medium text-lg mt-2 drop-shadow-md" style={{ color: mdiInfo.hex }}>
                        {mdiInfo.metaphor}
                      </p>
                      <p className="text-zinc-400 text-sm">
                        {mdiInfo.colorName}
                      </p>
                    </div>
                    <div 
                      className="w-16 h-16 rounded-full shadow-[0_0_30px_rgba(0,0,0,0.3)] border-4 border-zinc-900 shrink-0"
                      style={{ backgroundColor: mdiInfo.hex }}
                    />
                  </div>

                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-2">Bedeutung</h3>
                      <p className="text-zinc-200 leading-relaxed text-lg">
                        {mdiInfo.description}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-black/20 rounded-lg border border-zinc-800/50">
                        <h4 className="text-xs uppercase text-zinc-500 mb-1">Licht-Spektrum</h4>
                        <p className="text-white font-mono text-sm">{mdiInfo.lightRange}</p>
                      </div>
                      <div className="p-4 bg-black/20 rounded-lg border border-zinc-800/50">
                        <h4 className="text-xs uppercase text-zinc-500 mb-1">Klang-Spektrum</h4>
                        <p className="text-white font-mono text-sm">{mdiInfo.toneRange}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm uppercase tracking-wider text-zinc-500 mb-2 flex items-center gap-2">
                          <Activity className="w-4 h-4" /> Assoziationen & Synonyme
                      </h3>
                      <div className="flex flex-wrap gap-2">
                          {mdiInfo.talent.split('|').map((word, i) => (
                              <span key={i} className="bg-zinc-800/50 text-zinc-300 px-3 py-1.5 rounded-full text-xs border border-zinc-700/50">
                                  {word.trim()}
                              </span>
                          ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })()
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-zinc-500 p-8 text-center border border-dashed border-zinc-800 rounded-xl">
              <Info className="w-12 h-12 mb-4 opacity-20" />
              <p>Wähle einen der 24 Typen aus der Liste, um mehr über seine spezifische Bedeutung, Metaphorik und Wirkung zu erfahren.</p>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );

  const renderInstructionsSection = () => (
    <div className="space-y-6">
      <Card className="bg-zinc-900/50 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-xl text-white">Anleitung zur App</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-zinc-300">
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">1</div>
              <div>
                <h4 className="font-semibold text-white">Frequenz-Analyse durchführen</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Nutze die Analyse-Funktion im Dashboard. Beantworte die 3 Fragen intuitiv und mit deiner natürlichen Stimme. 
                  Die App ermittelt daraus deinen Grundton.
                </p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">2</div>
              <div>
                <h4 className="font-semibold text-white">Trainings-Center nutzen</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Wähle zwischen YOHN-Atmung (aktiv), Stoffwechsel-Atmung (passiv) oder Intervall-Training.
                  Regelmäßiges Tönen stärkt deine Resonanz.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold shrink-0">3</div>
              <div>
                <h4 className="font-semibold text-white">Frequenz-Labor</h4>
                <p className="text-sm text-zinc-400 mt-1">
                  Experimentiere mit deiner Stimme. Finde heraus, welche Töne du heute brauchst. 
                  Du kannst jede Frequenz festhalten und direkt damit trainieren.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col animate-in fade-in duration-300">
      {/* Header */}
      <div className="p-6 border-b border-zinc-800 flex items-center justify-between bg-black/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="hover:bg-zinc-800 text-zinc-400 hover:text-white px-4"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ZUR HAUPTSEITE
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Wissenspool</h1>
            <p className="text-sm text-zinc-500">Hintergründe & Details zur Methode 36</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden p-6 max-w-7xl mx-auto w-full">
        <Tabs defaultValue="ep01" className="h-full flex flex-col">
          <TabsList className="bg-zinc-900 border border-zinc-800 p-1 mb-6 w-full max-w-2xl mx-auto grid grid-cols-3">
            <TabsTrigger value="ep01">Episode 01</TabsTrigger>
            <TabsTrigger value="ep02">Episode 02</TabsTrigger>
            <TabsTrigger value="ep03">Episode 03</TabsTrigger>
          </TabsList>

          <TabsContent value="ep01" className="flex-1 overflow-hidden flex flex-col mt-0">
            <Tabs defaultValue={initialTab} className="h-full flex flex-col">
              <TabsList className="bg-zinc-900/50 border border-zinc-800 p-1 mb-6 w-full max-w-md mx-auto grid grid-cols-3">
                <TabsTrigger value="method">Die Methode</TabsTrigger>
                <TabsTrigger value="frequencies">Frequenzen</TabsTrigger>
                <TabsTrigger value="instructions">Anleitung</TabsTrigger>
              </TabsList>

              <ScrollArea className="flex-1 pr-4">
                <TabsContent value="method" className="mt-0 pb-20">
                  {renderMethodSection()}
                </TabsContent>
                
                <TabsContent value="frequencies" className="mt-0 pb-20 h-full">
                  {renderFrequenciesSection()}
                </TabsContent>
                
                <TabsContent value="instructions" className="mt-0 pb-20">
                  {renderInstructionsSection()}
                </TabsContent>
              </ScrollArea>
            </Tabs>
          </TabsContent>

          <TabsContent value="ep02" className="flex-1 mt-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Episode 02</h2>
              <p className="text-zinc-400">Demnächst verfügbar</p>
            </div>
          </TabsContent>

          <TabsContent value="ep03" className="flex-1 mt-0 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-zinc-900/50 border border-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-zinc-600" />
              </div>
              <h2 className="text-2xl font-bold text-white">Episode 03</h2>
              <p className="text-zinc-400">Demnächst verfügbar</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
