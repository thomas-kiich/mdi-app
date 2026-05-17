import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Info, Play, BookOpen } from 'lucide-react';

interface BoltMeasurementProps {
  onClose: () => void;
}

const BOLT_LEVELS = [
  {
    range: '1–10',
    condition: 'Sehr schwache konstitutionelle Verfassung',
    details: 'Sehr schwache konstitutionelle Verfassung; oft verbunden mit Müdigkeit, eingeschränkter Produktivität und Schlafstörungen. Sehr schlechter Fitnesszustand; Atmung in Ruhe unregelmäßig, tagsüber Schnappen nach Luft oder Gähnen. Atemnot tritt schon bei leichter Belastung oder beim Sprechen auf.',
    training: [
      'Nasenatmung Tag und Nacht',
      'Resonanztraining',
      'Inhärentes Gähntraining',
      'Langsame Spaziergänge (10-15 Min.) mit geschlossenem Mund',
      'Dirigentenspiel'
    ],
    color: 'bg-red-900/30 border-red-700'
  },
  {
    range: '11–20',
    condition: 'Schwache konstitutionelle Verfassung',
    details: 'Schwache konstitutionelle Verfassung. Häufiges Gähnen oder Seufzen. Grenzwertig kompensierter Fitnesszustand; Atemfrequenz in Ruhe erhöht (>12 Atemzüge pro Minute). Probleme bei mittlerer Belastung im Alltag (z. B. Treppensteigen).',
    training: [
      'Alles von Ebene I',
      'Enthaltsamkeitstraining',
      'Behutsames Ausdauertraining (65-72% Hmax)',
      'Befindlichkeitstraining 7/12min'
    ],
    color: 'bg-orange-900/30 border-orange-700'
  },
  {
    range: '21–26',
    condition: 'Durchschnittliche Konstitution',
    details: 'Durchschnittliche Konstitution. Mittelmäßiger Fitnesszustand. Normale Atmung eher ruhig, gleichmäßig und mühelos. Verbesserte Ausdauer; leichtes körperliches Training und Alltagsaktivitäten ohne merkliche Probleme machbar.',
    training: [
      'Alles von den Vorebenen',
      'Schnelles Gehen oder Joggen (30-60 Min.) bei leichtem Lufthunger',
      'Yohntraining neunstufig',
      'Mobilitätstraining'
    ],
    color: 'bg-yellow-900/30 border-yellow-700'
  },
  {
    range: '26–35',
    condition: 'Gute Atemsensitivität und Belastbarkeit',
    details: 'Gute Atemsensitivität und Belastbarkeit; guter bis sehr guter Fitnesszustand. Zügige Erholungsphasen nach Anstrengung; effizientes Herzkreislaufsystem. Gute Sporttauglichkeit. Leistungssteigerungen sind problemlos möglich.',
    training: [
      'Alles aus den Vorebenen',
      'Apnoetraining morgens',
      'Yohntraining intensiv',
      'Maximalkrafttraining',
      'VO2 max Training'
    ],
    color: 'bg-green-900/30 border-green-700'
  },
  {
    range: '36+',
    condition: 'Ideale Atemphysiologie und exzellenter Fitnesszustand',
    details: 'Ideale Atemphysiologie und exzellenter Fitnesszustand; Zielwert für Athleten. Sportliche Leistungsfähigkeit und effiziente Erholungsphasen.',
    training: [
      'Hochintensives Training bei reiner Nasenatmung möglich',
      'In Pausenzeiten hochintensiver Intervall-Sessions ausschließlich durch die Nase atmen',
      'Fortgeschrittene Simulation von Höhentraining unter hoher Belastung (längere Atempausen bis zu 40 Schritten beim Laufen)'
    ],
    color: 'bg-blue-900/30 border-blue-700'
  }
];

export function BoltMeasurement({ onClose }: BoltMeasurementProps) {
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);

  return (
    <div className="fixed inset-0 z-50 bg-black overflow-y-auto p-4 animate-in fade-in duration-300">
      <div className="w-full max-w-6xl mx-auto pt-24 pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <Button 
            variant="ghost" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            ZUR HAUPTSEITE
          </Button>
          <h2 className="text-2xl font-bold text-white">🫁 BOLT-Messung</h2>
          <Button 
            variant="ghost" 
            onClick={() => window.open('/manus-storage/DERWAHREWERTMEINERGESUNDHEIT_67a0aff6.mp3', '_blank')}
            className="text-zinc-400 hover:text-white"
          >
            <BookOpen className="w-5 h-5 mr-2" />
            PODCAST
          </Button>
        </div>

        {/* BOLT Levels Grid */}
        <div className="space-y-4">
          {BOLT_LEVELS.map((level, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedLevel(selectedLevel === idx ? null : idx)}
              className={`p-6 rounded-xl border transition-all cursor-pointer ${level.color} hover:border-opacity-100 border-opacity-50`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="text-lg font-bold text-white mb-1">{level.range} Sekunden</div>
                  <div className="text-sm font-semibold text-zinc-300 mb-2">{level.condition}</div>
                  <p className="text-sm text-zinc-400 mb-4">{level.details}</p>
                  
                  {selectedLevel === idx && (
                    <div className="mt-4 pt-4 border-t border-white/10">
                      <div className="text-xs font-mono text-zinc-300 uppercase tracking-wider mb-2">Trainingsempfehlungen:</div>
                      <ul className="space-y-1">
                        {level.training.map((item, i) => (
                          <li key={i} className="text-sm text-zinc-300 flex items-start gap-2">
                            <span className="text-orange-400 mt-0.5">→</span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <div className="ml-4 text-2xl">{selectedLevel === idx ? '▼' : '▶'}</div>
              </div>
            </div>
          ))}
        </div>


      </div>
    </div>
  );
}
