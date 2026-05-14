import { useState } from "react";
import { AlertTriangle, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HealthScreeningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
  onExcluded: (reasons: string[]) => void;
  onPendingAttestation: () => void;
}

export function HealthScreeningModal({
  open,
  onOpenChange,
  onApproved,
  onExcluded,
  onPendingAttestation,
}: HealthScreeningModalProps) {
  // Master Checkboxes
  const [noPhysicalContraindications, setNoPhysicalContraindications] = useState(false);
  const [noMentalHealthConditions, setNoMentalHealthConditions] = useState(false);
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submitMutation = trpc.healthScreening.submitScreening.useMutation();

  const canSubmit = noPhysicalContraindications && noMentalHealthConditions && disclaimerAccepted;

  const handleTogglePhysical = () => {
    console.log("Toggle physical:", !noPhysicalContraindications);
    setNoPhysicalContraindications(!noPhysicalContraindications);
  };

  const handleToggleMental = () => {
    console.log("Toggle mental:", !noMentalHealthConditions);
    setNoMentalHealthConditions(!noMentalHealthConditions);
  };

  const handleToggleDisclaimer = () => {
    console.log("Toggle disclaimer:", !disclaimerAccepted);
    setDisclaimerAccepted(!disclaimerAccepted);
  };

  const handleSubmit = async () => {
    console.log("Submit clicked. States:", {
      noPhysicalContraindications,
      noMentalHealthConditions,
      disclaimerAccepted,
      canSubmit,
    });

    if (!canSubmit) {
      toast.error("Bitte füllen Sie alle erforderlichen Felder aus");
      return;
    }

    setLoading(true);

    try {
      const response = await submitMutation.mutateAsync({
        hasHighBloodPressure: false,
        hasAsthma: false,
        hasHeartArrhythmia: false,
        hasEpilepsy: false,
        isPregnant: false,
        hasRecentSurgery: false,
        hasAnxietyDisorder: false,
        hasDepression: false,
        hasSleepDisorder: false,
        hasMentalIllness: false,
        hasSubstanceAbuse: false,
        disclaimerAccepted: true,
        notes: undefined,
      });

      console.log("Response:", response);

      if (response.evaluation.approved) {
        toast.success("✅ Screening genehmigt! Sie können RAUM 36 nutzen.");
        setTimeout(() => {
          onApproved();
          onOpenChange(false);
        }, 2000);
      } else if (response.evaluation.status === "pending_attestation") {
        toast.info("📋 Ärztliches Attest erforderlich");
        setTimeout(() => {
          onPendingAttestation();
          onOpenChange(false);
        }, 2000);
      }
    } catch (error) {
      console.error("Error submitting screening:", error);
      toast.error("Fehler beim Speichern des Screenings");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-zinc-950 border-zinc-800">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-white">
            <AlertTriangle className="w-5 h-5 text-red-500" />
            Health Screening – Sorgfaltspflichten
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Hinweis */}
          <div className="bg-amber-900/30 border border-amber-700/50 rounded-lg p-3">
            <p className="text-xs text-amber-200">
              ℹ️ Bitte bestätigen Sie beide Punkte durch <span className="font-semibold">Anklicken der grünen Begriffe</span>
            </p>
          </div>

          {/* Physische Kontraindikationen */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-700">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <h3 className="font-semibold text-red-500">Physische Kontraindikationen</h3>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg cursor-pointer hover:bg-zinc-900/70 transition-colors" onClick={handleTogglePhysical}>
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                noPhysicalContraindications 
                  ? "bg-green-500 border-green-500" 
                  : "border-zinc-600 bg-transparent"
              }`}>
                {noPhysicalContraindications && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                noPhysicalContraindications 
                  ? "text-green-400" 
                  : "text-green-400 hover:text-green-300"
              }`}>
                Keine Kontraindikationen
              </span>
            </div>
          </div>

          {/* Befindlichkeitsstörungen */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-amber-500">Befindlichkeitsstörungen</h3>
              <span className="text-xs text-zinc-400">(Ärztliches Attest erforderlich)</span>
            </div>

            <div className="flex items-center gap-3 p-3 bg-zinc-900/50 rounded-lg cursor-pointer hover:bg-zinc-900/70 transition-colors" onClick={handleToggleMental}>
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                noMentalHealthConditions 
                  ? "bg-green-500 border-green-500" 
                  : "border-zinc-600 bg-transparent"
              }`}>
                {noMentalHealthConditions && <Check className="w-3 h-3 text-white" />}
              </div>
              <span className={`text-sm font-semibold transition-colors ${
                noMentalHealthConditions 
                  ? "text-green-400" 
                  : "text-green-400 hover:text-green-300"
              }`}>
                Keine Befindlichkeitsstörungen
              </span>
            </div>
          </div>

          {/* Disclaimer */}
          <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 space-y-3">
            <p className="text-sm font-semibold text-red-400">⚠️ Wichtiger Haftungsausschluss</p>
            <p className="text-xs text-zinc-300">
              KIICH ist kein Ersatz für medizinische Beratung. Die Atemtechniken können bei bestimmten
              Erkrankungen schädlich sein. Sie nutzen RAUM 36 auf eigene Verantwortung. Im Zweifelsfall
              konsultieren Sie einen Arzt.
            </p>
            <div className="flex items-center gap-3 cursor-pointer" onClick={handleToggleDisclaimer}>
              <div className={`w-5 h-5 border-2 rounded flex items-center justify-center transition-all ${
                disclaimerAccepted 
                  ? "bg-green-500 border-green-500" 
                  : "border-zinc-600 bg-transparent"
              }`}>
                {disclaimerAccepted && <Check className="w-3 h-3 text-white" />}
              </div>
              <label className="cursor-pointer text-xs">
                Ich habe den Haftungsausschluss gelesen und akzeptiert
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 justify-end pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Abbrechen
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || loading}
              className="bg-orange-600 hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wird verarbeitet..." : "Screening absenden"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
