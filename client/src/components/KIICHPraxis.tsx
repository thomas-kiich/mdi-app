import { Button } from "@/components/ui/button";
import { TrainingEinheitenView } from "@/components/TrainingEinheitenView";

interface KIICHPraxisProps {
  onClose?: () => void;
}

export function KIICHPraxis({ onClose }: KIICHPraxisProps) {
  return (
    <div className="space-y-6">
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
