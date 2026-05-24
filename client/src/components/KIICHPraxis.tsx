import { Flame, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TrainingEinheitenView } from "@/components/TrainingEinheitenView";

interface KIICHPraxisProps {
  onClose?: () => void;
  onOpenVisionsraum?: () => void;
}

export function KIICHPraxis({ onClose, onOpenVisionsraum }: KIICHPraxisProps) {
  return (
    <div className="space-y-6">
      {/* Visionsraum-Kachel */}
      {onOpenVisionsraum && (
        <button
          className="w-full text-left rounded-xl border border-yellow-500/30 bg-yellow-500/10 hover:brightness-110 transition-all hover:scale-[1.01] active:scale-[0.99] overflow-hidden group"
          onClick={onOpenVisionsraum}
        >
          <div className="p-4 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/20 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5 text-yellow-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-yellow-300 tracking-wide">VISIONSRAUM</p>
              <p className="text-zinc-400 text-xs mt-0.5">Der Inkubator für neue Konzepte und Ideen der Expedition 2026.</p>
            </div>
            <ArrowRight className="w-4 h-4 text-yellow-400 group-hover:translate-x-1 transition-transform shrink-0" />
          </div>
        </button>
      )}

      {/* Trainingseinheiten aus DB */}
      <TrainingEinheitenView initialKategorie="kiichpraxis" externalFilterKat="kiichpraxis" />

      {onClose && (
        <div className="text-center pt-4">
          <Button variant="outline" onClick={onClose}>
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}
