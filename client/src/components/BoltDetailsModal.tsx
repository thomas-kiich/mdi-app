import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, Lightbulb, Activity } from 'lucide-react';

interface BoltEntry {
  id: number;
  datum: string;
  ruhepuls?: number;
  hrv?: number;
  boltMcp?: number | null;
  boltCp?: number | null;
  apnoeAus?: string;
  apnoeEin?: string;
  temperatur?: number;
  gewicht?: number;
  anmerkungen?: string;
}

interface BoltDetailsModalProps {
  entry: BoltEntry | null;
  isOpen: boolean;
  onClose: () => void;
}

// BOLT-Wert Interpretationen und Trainingsempfehlungen
const BOLT_INTERPRETATIONS: Record<string, { befindlichkeit: string; trainingsempfehlung: string; farbe: string }> = {
  'sehr_niedrig': {
    befindlichkeit: 'Atemkapazität sehr niedrig - Körper unter Stress',
    trainingsempfehlung: 'Beginne mit sanftem Atemtraining (Befindlichkeitstraining) und Entspannungsübungen',
    farbe: 'text-red-400'
  },
  'niedrig': {
    befindlichkeit: 'Atemkapazität niedrig - Körper leicht angespannt',
    trainingsempfehlung: 'Regelmäßiges Befindlichkeitstraining und leichte Atemübungen empfohlen',
    farbe: 'text-orange-400'
  },
  'mittel': {
    befindlichkeit: 'Atemkapazität im normalen Bereich - ausgewogener Zustand',
    trainingsempfehlung: 'Fortgeschrittenes Atemtraining (YOHNTRAIN) oder Bewegungstraining möglich',
    farbe: 'text-yellow-400'
  },
  'hoch': {
    befindlichkeit: 'Atemkapazität hoch - Körper in guter Verfassung',
    trainingsempfehlung: 'Intensives Training (Apnoetraining, Kältetraining) oder Geisttraining möglich',
    farbe: 'text-green-400'
  },
  'sehr_hoch': {
    befindlichkeit: 'Atemkapazität sehr hoch - optimale Körperverfassung',
    trainingsempfehlung: 'Alle Trainingsformen möglich - nutze diese Phase für Fortgeschrittenes Training',
    farbe: 'text-emerald-400'
  }
};

function getBoltCategory(boltMcp: number | null | undefined): string {
  if (!boltMcp) return 'mittel';
  if (boltMcp < 10) return 'sehr_niedrig';
  if (boltMcp < 20) return 'niedrig';
  if (boltMcp < 30) return 'mittel';
  if (boltMcp < 40) return 'hoch';
  return 'sehr_hoch';
}

export function BoltDetailsModal({ entry, isOpen, onClose }: BoltDetailsModalProps) {
  if (!entry) return null;

  const boltCategory = getBoltCategory(entry.boltMcp);
  const interpretation = BOLT_INTERPRETATIONS[boltCategory];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-zinc-900 border border-zinc-800">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-white">
            BOLT-Wert Details – {entry.datum}
          </DialogTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-white/10"
          >
            <X className="w-4 h-4" />
          </Button>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Vitalwerte Übersicht */}
          <div className="grid grid-cols-2 gap-4">
            {entry.boltMcp != null && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-sm text-zinc-400 mb-1">BOLT/MCP</div>
                <div className="text-2xl font-bold text-orange-400">{entry.boltMcp} s</div>
                <div className="text-xs text-zinc-500 mt-1">Atemhaltung nach Ausatmung</div>
              </div>
            )}
            {entry.boltCp != null && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-sm text-zinc-400 mb-1">CP</div>
                <div className="text-2xl font-bold text-yellow-400">{entry.boltCp} s</div>
                <div className="text-xs text-zinc-500 mt-1">Kontrollpause</div>
              </div>
            )}
            {entry.ruhepuls && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-sm text-zinc-400 mb-1">Ruhepuls</div>
                <div className="text-2xl font-bold text-pink-400">{entry.ruhepuls} bpm</div>
                <div className="text-xs text-zinc-500 mt-1">Herzschlag in Ruhe</div>
              </div>
            )}
            {entry.hrv && (
              <div className="bg-white/5 p-4 rounded-lg border border-white/10">
                <div className="text-sm text-zinc-400 mb-1">HRV</div>
                <div className="text-2xl font-bold text-red-400">{entry.hrv} ms</div>
                <div className="text-xs text-zinc-500 mt-1">Herzratenvariabilität</div>
              </div>
            )}
          </div>

          {/* Befindlichkeit */}
          <div className={`bg-${interpretation.farbe.split('-')[1]}-500/10 border border-${interpretation.farbe.split('-')[1]}-500/30 p-4 rounded-lg`}>
            <div className="flex items-start gap-3">
              <Activity className={`w-5 h-5 ${interpretation.farbe} flex-shrink-0 mt-1`} />
              <div>
                <h3 className={`font-semibold ${interpretation.farbe} mb-1`}>Befindlichkeit</h3>
                <p className="text-sm text-zinc-300">{interpretation.befindlichkeit}</p>
              </div>
            </div>
          </div>

          {/* Trainingsempfehlung */}
          <div className="bg-blue-500/10 border border-blue-500/30 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <Lightbulb className="w-5 h-5 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="font-semibold text-blue-400 mb-1">Trainingsempfehlung</h3>
                <p className="text-sm text-zinc-300">{interpretation.trainingsempfehlung}</p>
              </div>
            </div>
          </div>

          {/* Zusätzliche Infos */}
          {entry.anmerkungen && (
            <div className="bg-white/5 p-4 rounded-lg border border-white/10">
              <h3 className="font-semibold text-white mb-2">Anmerkungen</h3>
              <p className="text-sm text-zinc-300">{entry.anmerkungen}</p>
            </div>
          )}

          {/* Weitere Messungen */}
          <div className="grid grid-cols-3 gap-3">
            {entry.temperatur && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                <div className="text-xs text-zinc-400">Temperatur</div>
                <div className="text-lg font-bold text-blue-400">{entry.temperatur}°C</div>
              </div>
            )}
            {entry.gewicht && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                <div className="text-xs text-zinc-400">Gewicht</div>
                <div className="text-lg font-bold text-green-400">{entry.gewicht} kg</div>
              </div>
            )}
            {entry.apnoeAus && (
              <div className="bg-white/5 p-3 rounded-lg border border-white/10 text-center">
                <div className="text-xs text-zinc-400">Apnoe AUS</div>
                <div className="text-lg font-bold text-cyan-400">{entry.apnoeAus}</div>
              </div>
            )}
          </div>

          <Button onClick={onClose} className="w-full bg-orange-600 hover:bg-orange-700 text-white">
            Schließen
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
