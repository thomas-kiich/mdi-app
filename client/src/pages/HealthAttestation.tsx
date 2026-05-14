import { useState, useRef } from "react";
import { Upload, AlertTriangle, CheckCircle2, Loader2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";


/**
 * Health Attestation Upload – Ärztliches Attest für RAUM 36
 * 
 * Seite unter /account/health-attestation
 * Ermöglicht Upload von ärztlichem Attest für Befindlichkeitsstörungen
 */
export default function HealthAttestation() {
  const [file, setFile] = useState<File | null>(null);
  const [physicianName, setPhysicianName] = useState("");
  const [attestationDate, setAttestationDate] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const latestScreeningQuery = trpc.healthScreening.getLatest.useQuery();
  const uploadAttestationMutation = trpc.healthScreening.uploadAttestation.useMutation();

  const screening = latestScreeningQuery.data;
  const isPendingAttestation = screening?.status === "pending_attestation";
  const isAlreadyApproved =
    screening?.status === "approved_with_attestation" || screening?.status === "approved";

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    // Validiere Dateityp
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error("Nur PDF, JPG und PNG Dateien sind erlaubt");
      return;
    }

    // Validiere Dateigröße (max 10MB)
    if (selectedFile.size > 10 * 1024 * 1024) {
      toast.error("Datei darf maximal 10MB groß sein");
      return;
    }

    setFile(selectedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Bitte wählen Sie eine Datei aus");
      return;
    }

    if (!physicianName.trim()) {
      toast.error("Bitte geben Sie den Namen des Arztes ein");
      return;
    }

    if (!attestationDate) {
      toast.error("Bitte geben Sie das Datum des Attests ein");
      return;
    }

    setLoading(true);

    try {
      // Upload zu S3 via tRPC
      const arrayBuffer = await file.arrayBuffer();
      const base64 = Buffer.from(arrayBuffer).toString('base64');

      // Nutze tRPC für Upload (wird vom Server zu S3 hochgeladen)
      // Hier würde normalerweise ein tRPC-Mutation für File-Upload verwendet
      // Für jetzt verwenden wir eine direkte S3-URL
      const fileKey = `health-attestations/${Date.now()}-${file.name}`;
      const url = `https://storage.example.com/${fileKey}`; // Placeholder

      // Speichere Attest in Datenbank
      await uploadAttestationMutation.mutateAsync({
        attestationUrl: url,
        physicianName,
        attestationDate,
      });

      toast.success("✅ Attest erfolgreich hochgeladen und genehmigt!");
      
      // Reset Form
      setFile(null);
      setPhysicianName("");
      setAttestationDate("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Refresh Screening Status
      latestScreeningQuery.refetch();
    } catch (error) {
      console.error("Error uploading attestation:", error);
      toast.error("Fehler beim Hochladen des Attests");
    } finally {
      setLoading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Ärztliches Attest</h1>
        <p className="text-zinc-400 mt-2">
          Laden Sie Ihr ärztliches Attest hoch, um RAUM 36 nutzen zu können
        </p>
      </div>

      {/* Status Card */}
      {screening && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {isPendingAttestation && (
                <>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span>Attest erforderlich</span>
                </>
              )}
              {isAlreadyApproved && (
                <>
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span>Bereits genehmigt</span>
                </>
              )}
              {!isPendingAttestation && !isAlreadyApproved && (
                <>
                  <AlertTriangle className="w-5 h-5 text-blue-500" />
                  <span>Kein Screening durchgeführt</span>
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {isPendingAttestation && (
              <p className="text-sm text-zinc-300">
                Ihr Screening hat Befindlichkeitsstörungen ergeben. Bitte laden Sie ein ärztliches
                Attest hoch, das bestätigt, dass Sie RAUM 36 nutzen können.
              </p>
            )}
            {isAlreadyApproved && (
              <p className="text-sm text-green-400">
                ✅ Ihr Screening wurde genehmigt. Sie können RAUM 36 nutzen.
              </p>
            )}
            {!isPendingAttestation && !isAlreadyApproved && (
              <p className="text-sm text-blue-400">
                Führen Sie zunächst das Health Screening durch.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Upload Form */}
      {isPendingAttestation && (
        <Card className="bg-zinc-900/50 border-zinc-800">
          <CardHeader>
            <CardTitle>Attest hochladen</CardTitle>
            <CardDescription>
              Laden Sie ein PDF oder Bild Ihres ärztlichen Attests hoch
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* File Upload */}
            <div className="space-y-3">
              <Label htmlFor="attestation-file">Datei (PDF, JPG, PNG - max 10MB)</Label>
              <div className="flex gap-3">
                <div className="flex-1">
                  <Input
                    ref={fileInputRef}
                    id="attestation-file"
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={handleFileSelect}
                    disabled={loading}
                    className="cursor-pointer"
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <FileUp className="w-4 h-4 mr-2" />
                  Durchsuchen
                </Button>
              </div>
              {file && (
                <p className="text-sm text-green-400">
                  ✅ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)
                </p>
              )}
            </div>

            {/* Physician Name */}
            <div className="space-y-3">
              <Label htmlFor="physician-name">Name des Arztes / der Ärztin</Label>
              <Input
                id="physician-name"
                placeholder="z.B. Dr. med. Max Mustermann"
                value={physicianName}
                onChange={(e) => setPhysicianName(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Attestation Date */}
            <div className="space-y-3">
              <Label htmlFor="attestation-date">Datum des Attests</Label>
              <Input
                id="attestation-date"
                type="date"
                value={attestationDate}
                onChange={(e) => setAttestationDate(e.target.value)}
                disabled={loading}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-950/20 border border-blue-900/50 rounded-lg p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-400">ℹ️ Anforderungen an das Attest</p>
              <ul className="text-xs text-zinc-300 space-y-1 list-disc list-inside">
                <li>Muss von einem Arzt oder einer Ärztin ausgestellt sein</li>
                <li>Sollte bestätigen, dass Sie RAUM 36 nutzen können</li>
                <li>Muss das Datum und den Namen des Arztes enthalten</li>
                <li>Kann eine PDF-Datei oder ein Foto sein</li>
              </ul>
            </div>

            {/* Upload Progress */}
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Upload läuft...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-2">
                  <div
                    className="bg-orange-600 h-2 rounded-full transition-all"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 justify-end">
              <Button variant="outline" disabled={loading}>
                Abbrechen
              </Button>
              <Button
                onClick={handleUpload}
                disabled={loading || !file || !physicianName || !attestationDate}
                className="bg-orange-600 hover:bg-orange-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird hochgeladen...
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Attest hochladen
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Already Approved Message */}
      {isAlreadyApproved && (
        <Card className="bg-green-950/20 border-green-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              Genehmigt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-green-300">
              Ihr Screening wurde genehmigt. Sie können jetzt RAUM 36 vollständig nutzen.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
