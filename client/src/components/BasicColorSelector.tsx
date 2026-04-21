import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Play, Volume2, ChevronDown, ChevronUp } from 'lucide-react';
import frequencyData from '@/lib/frequencyData.json';
import { motion, AnimatePresence } from 'framer-motion';
import { useSoundGenerator } from '@/hooks/useSoundGenerator';

interface BasicColorSelectorProps {
  onStartTraining: (freq: number, tone: string, color: string, typeId: number) => void;
}

export function BasicColorSelector({ onStartTraining }: BasicColorSelectorProps) {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [showAudioGuide, setShowAudioGuide] = useState(false);
  const { playTone, stopAllSounds } = useSoundGenerator();

  // Filter only odd-numbered types (1, 3, 5, 7, 9, 11, 13, 15, 17, 19, 21, 23)
  const basicTypes = frequencyData.filter(item => item.id % 2 !== 0 && item.id <= 23);

  const selectedItem = basicTypes.find(item => item.id === selectedId);

  return (
    <Card className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
      <CardHeader className="text-center">
        <div className="flex items-start gap-2 max-w-2xl mx-auto mt-3 bg-blue-950/40 border border-blue-500/30 rounded-lg px-4 py-3">
          <span className="text-blue-400 text-base mt-0.5">&#9888;</span>
          <p className="text-xs text-blue-300 leading-relaxed">
            <strong className="text-blue-200">Handy-Hinweis:</strong> Falls du mit deinem Handy trainierst, achte darauf, dass du den <strong className="text-blue-200">Energiesparmodus abschaltest</strong> während der Übung. Ansonsten kann es zu unerwünschten Unterbrechungen im Spielablauf kommen!
          </p>
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Audio-Anleitung */}
        <div className="max-w-2xl mx-auto">
          <button
            onClick={() => setShowAudioGuide(!showAudioGuide)}
            className="w-full flex items-center justify-between px-5 py-4 bg-zinc-800/60 border border-zinc-700 rounded-xl text-sm text-zinc-200 hover:text-white hover:border-amber-500/50 transition-all"
          >
            <span className="font-bold tracking-widest uppercase flex items-center gap-2 text-amber-400">
              <Volume2 className="w-5 h-5 text-amber-400" />
              GEBRAUCHSANLEITUNG HIER ANHÖREN
            </span>
            {showAudioGuide ? <ChevronUp className="w-4 h-4 text-amber-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-zinc-500 shrink-0" />}
          </button>
          {showAudioGuide && (
            <div className="mt-2 bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <audio
                src={'/api/audio-proxy?url=' + encodeURIComponent('https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/befindlichkeit-anleitung-ma-stimme_a92ec0ec.mp3')}
                controls
                className="w-full"
              />
            </div>
          )}
        </div>
        {/* Color Grid */}
        <div className="grid grid-cols-3 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
          {basicTypes.map((item) => (
            <motion.button
              key={item.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedId(item.id);
                playTone(item.frequency);
              }}
              onMouseEnter={() => {
                playTone(item.frequency);
              }}
              onMouseLeave={() => {
                stopAllSounds();
              }}
              className={`relative aspect-square rounded-full flex items-center justify-center transition-all duration-300 ${
                selectedId === item.id ? 'ring-4 ring-white ring-offset-4 ring-offset-zinc-900' : 'hover:ring-2 hover:ring-white/50 hover:ring-offset-2 hover:ring-offset-zinc-900'
              }`}
              style={{ backgroundColor: item.hex }}
              title={item.colorName}
            >
              {selectedId === item.id && (
                <div className="absolute inset-0 rounded-full bg-black/20" />
              )}
            </motion.button>
          ))}
        </div>

        {/* Selected Color Details */}
        <AnimatePresence mode="wait">
          {selectedItem && (
            <motion.div
              key={selectedItem.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto bg-zinc-800/40 rounded-xl p-6 border border-zinc-700/50 text-center space-y-6"
            >
              <div>
                <h3 className="text-2xl font-bold mb-2 tracking-wide uppercase" style={{ color: selectedItem.hex }}>
                  {selectedItem.metaphor}
                </h3>
                <p className="text-lg font-medium" style={{ color: selectedItem.hex }}>
                  {selectedItem.description}
                </p>
              </div>

              <div className="space-y-6 text-left">
                <div>
                  <h4 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3 border-b border-zinc-800 pb-2">Identität</h4>
                  <p className="text-sm text-zinc-300 leading-relaxed">
                    {selectedItem.talent.split(' | ').slice(0, 6).join(' • ')}
                  </p>
                </div>
                
                {selectedItem.nutzung && selectedItem.nutzung.length > 0 && (
                  <div>
                    <div className="border border-amber-500/50 bg-amber-500/10 rounded-lg px-3 py-3 mb-3">
                      <p className="text-xs font-bold text-amber-400 uppercase tracking-widest">WAS DAS TRAINING MIT DEINEM GEWÄHLTEN LICHTKLANG BEWIRKEN KANN</p>
                    </div>
                    <h4 className="text-xs font-semibold text-amber-400/80 uppercase tracking-widest mb-3 border-b border-amber-500/20 pb-2">ANWENDUNG</h4>
                    <ul className="space-y-2 text-sm text-zinc-300">
                      {selectedItem.nutzung.map((nutzung: string, idx: number) => (
                        <li key={idx} className="flex items-start">
                          <span className="text-zinc-500 mr-2 font-mono">{idx + 1}.</span>
                          <span className="leading-relaxed">{nutzung}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <Button 
                size="lg"
                onClick={() => onStartTraining(selectedItem.frequency, selectedItem.tone, selectedItem.hex, selectedItem.id)}
                className="w-full sm:w-auto bg-white text-black hover:bg-zinc-200 transition-colors"
              >
                <Play className="w-5 h-5 mr-2" />
                Training starten
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
