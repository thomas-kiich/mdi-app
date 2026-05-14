import { useState } from "react";
import { AlertCircle, CheckCircle2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface HealthScreeningModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onApproved: () => void;
  onExcluded: (reasons: string[]) => void;
  onPendingAttestation: () => void;
}

/**
 * Health Screening Modal – Sorgfaltspflichten § 630e BGB
 * 
 * Zeigt Anamnesefragebogen vor RAUM 36 Aktivierung
 * Evaluiert Kontraindikationen und bestimmt Status
 */
export function HealthScreeningModal({
  open,
  onOpenChange,
  onApproved,
  onExcluded,
  onPendingAttestation,
}: HealthScreeningModalProps) {
  const [step, setStep] = useState<"questions" | "review" | "result">("questions");
  const [loading, setLoading] = useState(false);

  // Physische Kontraindikationen
  const [noPhysicalContraindications, setNoPhysicalContraindications] = useState(true);
  const [hasHighBloodPressure, setHasHighBloodPressure] = useState(false);
  const [hasAsthma, setHasAsthma] = useState(false);
  const [hasHeartArrhythmia, setHasHeartArrhythmia] = useState(false);
  const [hasEpilepsy, setHasEpilepsy] = useState(false);
  const [isPregnant, setIsPregnant] = useState(false);
  const [hasRecentSurgery, setHasRecentSurgery] = useState(false);

  // Befindlichkeitsstörungen
  const [noMentalHealthConditions, setNoMentalHealthConditions] = useState(true);
  const [hasAnxietyDisorder, setHasAnxietyDisorder] = useState(false);
  const [hasDepression, setHasDepression] = useState(false);
  const [hasSleepDisorder, setHasSleepDisorder] = useState(false);
  const [hasMentalIllness, setHasMentalIllness] = useState(false);
  const [hasSubstanceAbuse, setHasSubstanceAbuse] = useState(false);

  // Sonstiges
  const [notes, setNotes] = useState("");
  const [disclaimerAccepted, setDisclaimerAccepted] = useState(false);

  // Ergebnis
  const [result, setResult] = useState<any>(null);

  const submitMutation = trpc.healthScreening.submitScreening.useMutation();

  const handleSubmit = async () => {
    if (!disclaimerAccepted) {
      toast.error("Bitte akzeptieren Sie den Haftungsausschluss");
      return;
    }

    setLoading(true);

    try {
      const response = await submitMutation.mutateAsync({
        hasHighBloodPressure,
        hasAsthma,
        hasHeartArrhythmia,
        hasEpilepsy,
        isPregnant,
        hasRecentSurgery,
        hasAnxietyDisorder,
        hasDepression,
        hasSleepDisorder,
        hasMentalIllness,
        hasSubstanceAbuse,
        disclaimerAccepted,
        notes: notes || undefined,
      });

      setResult(response.evaluation);
      setStep("result");

      if (response.evaluation.approved) {
        toast.success("✅ Screening genehmigt! Sie können RAUM 36 nutzen.");
        setTimeout(() => {
          onApproved();
          onOpenChange(false);
        }, 2000);
      } else if (response.evaluation.status === "excluded_physical") {
        toast.error("❌ Screening nicht genehmigt");
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

  const handleReset = () => {
    setStep("questions");
    setResult(null);
    setHasHighBloodPressure(false);
    setHasAsthma(false);
    setHasHeartArrhythmia(false);
    setHasEpilepsy(false);
    setIsPregnant(false);
    setHasRecentSurgery(false);
    setHasAnxietyDisorder(false);
    setHasDepression(false);
    setHasSleepDisorder(false);
    setHasMentalIllness(false);
    setHasSubstanceAbuse(false);
    setNotes("");
    setDisclaimerAccepted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-orange-500" />
            Gesundheits-Screening
          </DialogTitle>
          <DialogDescription>
            Vor der Aktivierung von RAUM 36 müssen wir einige Fragen zu Ihrer Gesundheit stellen.
            Dies ist erforderlich für Ihre Sicherheit (§ 630e BGB).
          </DialogDescription>
        </DialogHeader>

        {step === "questions" && (
          <div className="space-y-6">
            {/* Physische Kontraindikationen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-700">
                <AlertTriangle className="w-4 h-4 text-red-500" />
                <h3 className="font-semibold text-red-500">Physische Kontraindikationen</h3>
              </div>

              {/* "Keine" Checkbox */}
              <div className="flex items-center space-x-2 bg-zinc-900/50 p-3 rounded-lg">
                <Checkbox
                  id="noPhysical"
                  checked={noPhysicalContraindications}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setNoPhysicalContraindications(isChecked);
                    if (isChecked) {
                      // Setze alle auf false wenn "Keine" aktiviert
                      setHasHighBloodPressure(false);
                      setHasAsthma(false);
                      setHasHeartArrhythmia(false);
                      setHasEpilepsy(false);
                      setIsPregnant(false);
                      setHasRecentSurgery(false);
                    }
                  }}
                />
                <Label htmlFor="noPhysical" className="cursor-pointer text-sm font-semibold text-green-400">
                  ✓ Keine Kontraindikationen
                </Label>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "highBloodPressure",
                    label: "Bluthochdruck (≥ 140/90 mmHg)",
                    value: hasHighBloodPressure,
                    onChange: setHasHighBloodPressure,
                  },
                  {
                    id: "asthma",
                    label: "Asthma oder chronische Atemwegserkrankungen",
                    value: hasAsthma,
                    onChange: setHasAsthma,
                  },
                  {
                    id: "heartArrhythmia",
                    label: "Herzrhythmusstörungen oder Herzerkrankungen",
                    value: hasHeartArrhythmia,
                    onChange: setHasHeartArrhythmia,
                  },
                  {
                    id: "epilepsy",
                    label: "Epilepsie oder Anfallsleiden",
                    value: hasEpilepsy,
                    onChange: setHasEpilepsy,
                  },
                  {
                    id: "pregnant",
                    label: "Schwangerschaft",
                    value: isPregnant,
                    onChange: setIsPregnant,
                  },
                  {
                    id: "recentSurgery",
                    label: "Kürzliche Operation oder Verletzung (< 6 Wochen)",
                    value: hasRecentSurgery,
                    onChange: setHasRecentSurgery,
                  },
                ].map(({ id, label, value, onChange }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox id={id} checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
                    <Label htmlFor={id} className="cursor-pointer text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Befindlichkeitsstörungen */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-700">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Befindlichkeitsstörungen</h3>
                <span className="text-xs text-zinc-400">(Ärztliches Attest erforderlich)</span>
              </div>

              {/* "Keine" Checkbox */}
              <div className="flex items-center space-x-2 bg-zinc-900/50 p-3 rounded-lg">
                <Checkbox
                  id="noMental"
                  checked={noMentalHealthConditions}
                  onCheckedChange={(checked) => {
                    const isChecked = checked === true;
                    setNoMentalHealthConditions(isChecked);
                    if (isChecked) {
                      // Setze alle auf false wenn "Keine" aktiviert
                      setHasAnxietyDisorder(false);
                      setHasDepression(false);
                      setHasSleepDisorder(false);
                      setHasMentalIllness(false);
                      setHasSubstanceAbuse(false);
                    }
                  }}
                />
                <Label htmlFor="noMental" className="cursor-pointer text-sm font-semibold text-green-400">
                  ✓ Keine Befindlichkeitsstörungen
                </Label>
              </div>

              <div className="space-y-3">
                {[
                  {
                    id: "anxietyDisorder",
                    label: "Angststörung, Panikstörung",
                    value: hasAnxietyDisorder,
                    onChange: setHasAnxietyDisorder,
                  },
                  {
                    id: "depression",
                    label: "Depression oder depressive Episode",
                    value: hasDepression,
                    onChange: setHasDepression,
                  },
                  {
                    id: "sleepDisorder",
                    label: "Schlafstörungen",
                    value: hasSleepDisorder,
                    onChange: setHasSleepDisorder,
                  },
                  {
                    id: "mentalIllness",
                    label: "Psychische Erkrankung (allgemein)",
                    value: hasMentalIllness,
                    onChange: setHasMentalIllness,
                  },
                  {
                    id: "substanceAbuse",
                    label: "Substanzmissbrauch oder Suchterkrankung",
                    value: hasSubstanceAbuse,
                    onChange: setHasSubstanceAbuse,
                  },
                ].map(({ id, label, value, onChange }) => (
                  <div key={id} className="flex items-center space-x-2">
                    <Checkbox id={id} checked={value} onCheckedChange={(checked) => onChange(checked === true)} />
                    <Label htmlFor={id} className="cursor-pointer text-sm">
                      {label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notizen */}
            <div className="space-y-2">
              <Label htmlFor="notes">Zusätzliche Informationen (optional)</Label>
              <Textarea
                id="notes"
                placeholder="z.B. Unter ärztlicher Behandlung, Medikamente, etc."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="min-h-20"
              />
            </div>

            {/* Disclaimer */}
            <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 space-y-3">
              <p className="text-sm font-semibold text-red-400">⚠️ Wichtiger Haftungsausschluss</p>
              <p className="text-xs text-zinc-300">
                KIICH ist kein Ersatz für medizinische Beratung. Die Atemtechniken können bei bestimmten
                Erkrankungen schädlich sein. Sie nutzen RAUM 36 auf eigene Verantwortung. Im Zweifelsfall
                konsultieren Sie einen Arzt.
              </p>
              <div className="flex items-center space-x-2">
              <Checkbox
                id="disclaimer"
                checked={disclaimerAccepted}
                onCheckedChange={(checked) => setDisclaimerAccepted(checked === true)}
              />
                <Label htmlFor="disclaimer" className="cursor-pointer text-xs">
                  Ich habe den Haftungsausschluss gelesen und akzeptiert
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Abbrechen
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={loading || !disclaimerAccepted || !noPhysicalContraindications || !noMentalHealthConditions}
                className="bg-orange-600 hover:bg-orange-700"
                title={!noPhysicalContraindications || !noMentalHealthConditions ? "Bitte bestätigen Sie, dass keine Kontraindikationen und keine Befindlichkeitsstörungen vorliegen" : ""}
              >
                {loading ? "Wird verarbeitet..." : "Screening absenden"}
              </Button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            {result.approved ? (
              <div className="bg-green-950/20 border border-green-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <p className="font-semibold text-green-400">✅ Screening genehmigt</p>
                </div>
                <p className="text-sm text-zinc-300">
                  {result.reason}
                </p>
              </div>
            ) : result.status === "excluded_physical" ? (
              <div className="bg-red-950/20 border border-red-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  <p className="font-semibold text-red-400">❌ Screening nicht genehmigt</p>
                </div>
                <p className="text-sm text-zinc-300">
                  {result.reason}
                </p>
                {result.excludedReasons && result.excludedReasons.length > 0 && (
                  <div className="text-sm">
                    <p className="text-zinc-400 mb-2">Ausschlussgründe:</p>
                    <ul className="list-disc list-inside space-y-1 text-zinc-300">
                      {result.excludedReasons.map((reason: string) => (
                        <li key={reason}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <p className="text-xs text-zinc-400 mt-3">
                  Bitte konsultieren Sie einen Arzt, bevor Sie RAUM 36 nutzen.
                </p>
              </div>
            ) : result.status === "pending_attestation" ? (
              <div className="bg-amber-950/20 border border-amber-900/50 rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <p className="font-semibold text-amber-400">📋 Ärztliches Attest erforderlich</p>
                </div>
                <p className="text-sm text-zinc-300">
                  {result.reason}
                </p>
                <p className="text-xs text-zinc-400">
                  Bitte laden Sie ein ärztliches Attest hoch, das bestätigt, dass Sie RAUM 36 nutzen können.
                </p>
              </div>
            ) : null}

            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  handleReset();
                  onOpenChange(false);
                }}
              >
                Schließen
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
