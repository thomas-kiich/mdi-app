import { Button } from "@/components/ui/button";
import { TrainingEinheitenView } from "@/components/TrainingEinheitenView";

interface KIICHPraxisProps {
  onClose?: () => void;
}

export function KIICHPraxis({ onClose }: KIICHPraxisProps) {
  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="text-3xl font-bold text-white mb-2">🎯 KIICH PRAXIS</h2>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto">
          Konkrete Projekte und Übungen an der Schnittstelle von KI und menschlicher Identität.
        </p>
      </div>

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
