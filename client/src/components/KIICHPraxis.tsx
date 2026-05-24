import { Button } from "@/components/ui/button";

interface KIICHPraxisProps {
  onClose?: () => void;
}

export function KIICHPraxis({ onClose }: KIICHPraxisProps) {
  return (
    <div className="space-y-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-4">🎯 KIICH PRAXIS</h2>
        <p className="text-zinc-400 text-base max-w-2xl mx-auto">
          Hier findest du konkrete Tipps zu KI &amp; ICH Projekten.
        </p>
      </div>

      {onClose && (
        <div className="text-center">
          <Button variant="outline" onClick={onClose}>
            Zurück
          </Button>
        </div>
      )}
    </div>
  );
}
