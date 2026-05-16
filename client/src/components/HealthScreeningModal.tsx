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

// Detaillierte Fragen mit Erklärungen
const PHYSICAL_QUESTIONS = [
  { key: "hasHighBloodPressure", label: "Bluthochdruck", description: "Erhöhter Blutdruck kann bei intensiven Atemtechniken problematisch sein" },
  { key: "hasAsthma", label: "Asthma", description: "Atemwegserkrankungen können durch bestimmte Atemtechniken verschärft werden" },
  { key: "hasHeartArrhythmia", label: "Herzrhythmusstörungen", description: "Herzprobleme erfordern ärztliche Freigabe vor Atemtraining" },
  { key: "hasEpilepsy", label: "Epilepsie", description: "Hyperventilation kann Anfälle auslösen" },
  { key: "isPregnant", label: "Schwangerschaft", description: "Intensive Atemtechniken sind in der Schwangerschaft nicht empfohlen" },
  { key: "hasRecentSurgery", label: "Kürzliche Operation", description: "Der Körper braucht Zeit zur Genesung nach Eingriffen" },
];

const MENTAL_QUESTIONS = [
  { key: "hasAnxietyDisorder", label: "Angststörung", description: "Kann durch intensive Atemtechniken ausgelöst werden" },
  { key: "hasDepression", label: "Depression", description: "Erfordert ärztliche Begleitung" },
  { key: "hasSleepDisorder", label: "Schlafstörung", description: "Kann durch Atemtraining beeinflusst werden" },
  { key: "hasMentalIllness", label: "Psychische Erkrankung", description: "Erfordert ärztliche Freigabe" },
  { key: "hasSubstanceAbuse", label: "Substanzmissbrauch", description: "Kann mit Atemtechniken interagieren" },
];

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
    setNoPhysicalContraindications(!noPhysicalContraindications);
  };

  const handleToggleMental = () => {
    setNoMentalHealthConditions(!noMentalHealthConditions);
  };

  const handleToggleDisclaimer = () => {
    setDisclaimerAccepted(!disclaimerAccepted);
  };

  const handleSubmit = async () => {
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

      if (response.evaluation.approved) {
        toast.success("✅ Screening genehmigt! Sie können RAUM 36 nutzen.");
        // Rufe onApproved auf (startet Checkout-Mutation)
        // Schließe Modal NICHT sofort - warte bis Mutation fertig ist
        onApproved();
        // Modal wird geschlossen, wenn Checkout erfolgreich ist (in Raum36.tsx)
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

            {/* Master Checkbox */}
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

            {/* Detail-Erklärungen (nur Text, keine Checkboxes) */}
            <div className="space-y-2 pl-8 text-xs text-zinc-400">
              {PHYSICAL_QUESTIONS.map(q => (
                <div key={q.key} className="border-l border-zinc-700 pl-3 py-1">
                  <p className="font-semibold text-zinc-300">{q.label}</p>
                  <p>{q.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Befindlichkeitsstörungen */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-700">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <h3 className="font-semibold text-amber-500">Befindlichkeitsstörungen</h3>
              <span className="text-xs text-zinc-400">(Ärztliches Attest erforderlich)</span>
            </div>

            {/* Master Checkbox */}
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

            {/* Detail-Erklärungen (nur Text, keine Checkboxes) */}
            <div className="space-y-2 pl-8 text-xs text-zinc-400">
              {MENTAL_QUESTIONS.map(q => (
                <div key={q.key} className="border-l border-zinc-700 pl-3 py-1">
                  <p className="font-semibold text-zinc-300">{q.label}</p>
                  <p>{q.description}</p>
                </div>
              ))}
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
