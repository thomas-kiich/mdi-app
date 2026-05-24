import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Mail, Send, Eye, ChevronLeft, Loader2, CheckCircle2,
  XCircle, RefreshCw, Users, AlertTriangle, X
} from "lucide-react";
import { Link } from "wouter";

const EMPFAENGER_COLOR: Record<string, string> = {
  "Nutzer": "bg-blue-500/20 text-blue-300 border-blue-500/30",
  "Mitglied": "bg-orange-500/20 text-orange-300 border-orange-500/30",
  "Käufer": "bg-green-500/20 text-green-300 border-green-500/30",
  "Thomas (Admin)": "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

type GruppeKey = "raum36" | "kiich" | "newsletter";

const GRUPPEN: Array<{ key: GruppeKey; label: string; color: string; countKey: keyof { raum36Count: number; kiichCount: number; newsletterCount: number } }> = [
  { key: "raum36", label: "RAUM 36-Mitglieder", color: "border-orange-500/60 bg-orange-500/10 text-orange-300", countKey: "raum36Count" },
  { key: "kiich", label: "KIICH-Nutzer", color: "border-blue-500/60 bg-blue-500/10 text-blue-300", countKey: "kiichCount" },
  { key: "newsletter", label: "Newsletter-Abonnenten", color: "border-green-500/60 bg-green-500/10 text-green-300", countKey: "newsletterCount" },
];

export default function AdminEmailVorschau() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("lkrforschung@gmail.com");
  const [fieldValues, setFieldValues] = useState<Record<string, string>>({});
  // Checkbox-Auswahl für Gruppen
  const [selectedGruppen, setSelectedGruppen] = useState<GruppeKey[]>([]);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [versandListe, setVersandListe] = useState<Array<{ email: string; name: string; gruppen: string[] }> | null>(null);
  const [versandInfo, setVersandInfo] = useState<{ gesendet: number; fehlgeschlagen: number; gruppen: string } | null>(null);

  const { data: templates, isLoading: loadingTemplates } = trpc.emailVorschau.getTemplates.useQuery();
  const { data: templateFields } = trpc.emailVorschau.getTemplateFields.useQuery(
    { templateId: selectedId! },
    { enabled: !!selectedId }
  );
  const { data: empfaengerAnzahl } = trpc.emailVorschau.getEmpfaengerAnzahl.useQuery(
    undefined,
    { enabled: selectedId === "raum36_neuigkeit" }
  );

  useEffect(() => {
    if (!templateFields) return;
    const defaults: Record<string, string> = {};
    for (const f of templateFields) defaults[f.key] = f.defaultValue;
    setFieldValues(defaults);
  }, [templateFields, selectedId]);

  const { data: vorschau, isLoading: loadingVorschau, refetch: refetchVorschau } =
    trpc.emailVorschau.getVorschau.useQuery(
      { templateId: selectedId!, fields: fieldValues },
      { enabled: !!selectedId && Object.keys(fieldValues).length > 0 }
    );

  const sendTest = trpc.emailVorschau.sendTestEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) toast.success(`Test-E-Mail gesendet an ${testEmail}`);
      else toast.error("Versand fehlgeschlagen");
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const sendeAnGruppe = trpc.emailVorschau.sendeAnGruppe.useMutation({
    onSuccess: (data, variables) => {
      toast.success(`Gesendet: ${data.gesendet} / ${data.empfaengerAnzahl} Empfänger (dedupliziert)`);
      setVersandListe(data.empfaengerListe ?? []);
      const gruppenLabels = variables.gruppen
        .map((k) => GRUPPEN.find((g) => g.key === k)?.label ?? k)
        .join(" + ");
      setVersandInfo({
        gesendet: data.gesendet,
        fehlgeschlagen: data.fehlgeschlagen,
        gruppen: gruppenLabels,
      });
      setConfirmOpen(false);
    },
    onError: (err) => {
      toast.error(`Fehler: ${err.message}`);
      setConfirmOpen(false);
    },
  });

  const selected = templates?.find((t) => t.id === selectedId);
  const isNeuigkeit = selectedId === "raum36_neuigkeit";

  function handleFieldChange(key: string, value: string) {
    setFieldValues((prev) => ({ ...prev, [key]: value }));
  }

  function downloadCsv() {
    if (!versandListe) return;
    const header = "Name,E-Mail,Gruppen";
    const rows = versandListe.map(
      (e) => `"${e.name}","${e.email}","${e.gruppen.join(" | ")}"`
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `empfaenger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function getAnzahl(key: GruppeKey): number {
    if (!empfaengerAnzahl) return 0;
    if (key === "raum36") return empfaengerAnzahl.raum36Count;
    if (key === "kiich") return empfaengerAnzahl.kiichCount;
    return empfaengerAnzahl.newsletterCount;
  }

  function toggleGruppe(key: GruppeKey) {
    setSelectedGruppen((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* Header */}
      <div className="border-b border-white/10 bg-[#0d0d18] px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
              <ChevronLeft className="w-4 h-4" />
              Admin
            </button>
          </Link>
          <div className="w-px h-4 bg-white/20" />
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-orange-400" />
            <h1 className="text-lg font-bold tracking-wider">E-MAIL VORSCHAU</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Linke Spalte: Template-Liste */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">
              Templates ({templates?.length ?? 0})
            </p>
            {loadingTemplates && (
              <div className="flex items-center gap-2 text-white/40 text-sm">
                <Loader2 className="w-4 h-4 animate-spin" />
                Lade Templates…
              </div>
            )}
            {templates?.map((t) => (
              <button
                key={t.id}
                onClick={() => setSelectedId(t.id)}
                className={`w-full text-left p-4 rounded-lg border transition-all ${
                  selectedId === t.id
                    ? "border-orange-500/60 bg-orange-500/10"
                    : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-semibold text-white leading-tight">{t.label}</p>
                  <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${EMPFAENGER_COLOR[t.empfaenger] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                    {t.empfaenger}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{t.beschreibung}</p>
              </button>
            ))}
          </div>

          {/* Rechte Spalte: Felder + Versand + Vorschau */}
          <div className="lg:col-span-2 space-y-4">
            {!selectedId ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-xl">
                <Eye className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/40 text-sm">Template auswählen um Vorschau zu sehen</p>
              </div>
            ) : (
              <>
                {/* Editierbare Felder */}
                <Card className="bg-[#111118] border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      {selected?.label}
                      <span className={`ml-auto text-xs px-2 py-0.5 rounded border ${EMPFAENGER_COLOR[selected?.empfaenger ?? ""] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                        {selected?.empfaenger}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {templateFields?.map((field) => (
                      <div key={field.key}>
                        <Label className="text-xs text-white/50 mb-1.5 block">{field.label}</Label>
                        {field.type === "textarea" ? (
                          <Textarea
                            value={fieldValues[field.key] ?? field.defaultValue}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="bg-white/5 border-white/20 text-white text-sm resize-none"
                            rows={4}
                          />
                        ) : (
                          <Input
                            type={field.type}
                            value={fieldValues[field.key] ?? field.defaultValue}
                            onChange={(e) => handleFieldChange(field.key, e.target.value)}
                            placeholder={field.placeholder}
                            className="bg-white/5 border-white/20 text-white text-sm h-9"
                          />
                        )}
                      </div>
                    ))}

                    {/* Test-Versand */}
                    <div className="pt-3 border-t border-white/10">
                      <p className="text-xs text-white/40 mb-2">Test-E-Mail senden an:</p>
                      <div className="flex gap-2">
                        <Input
                          value={testEmail}
                          onChange={(e) => setTestEmail(e.target.value)}
                          placeholder="E-Mail-Adresse"
                          className="bg-white/5 border-white/20 text-white text-sm h-9"
                        />
                        <Button
                          size="sm"
                          onClick={() => sendTest.mutate({ templateId: selectedId, empfaengerEmail: testEmail, fields: fieldValues })}
                          disabled={sendTest.isPending || !testEmail}
                          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 whitespace-nowrap"
                        >
                          {sendTest.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                          Test
                        </Button>
                      </div>
                      {sendTest.isSuccess && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                          <CheckCircle2 className="w-3 h-3" /> Test-E-Mail gesendet
                        </div>
                      )}
                      {sendTest.isError && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                          <XCircle className="w-3 h-3" /> Versand fehlgeschlagen
                        </div>
                      )}
                    </div>

                    {/* Massen-Versand – nur bei raum36_neuigkeit */}
                    {isNeuigkeit && (
                      <div className="pt-3 border-t border-white/10 space-y-3">
                        <p className="text-xs text-white/40 flex items-center gap-2">
                          <Users className="w-3 h-3" />
                          Empfänger auswählen (dedupliziert):
                        </p>
                        <div className="grid grid-cols-1 gap-2">
                          {GRUPPEN.map((g) => {
                            const checked = selectedGruppen.includes(g.key);
                            return (
                              <button
                                key={g.key}
                                onClick={() => toggleGruppe(g.key)}
                                disabled={sendeAnGruppe.isPending}
                                className={`flex items-center justify-between px-4 py-3 rounded-lg border transition-all ${
                                  checked
                                    ? g.color + " ring-2 ring-white/20"
                                    : "border-white/10 bg-white/5 text-white/50 hover:bg-white/10"
                                }`}
                              >
                                <span className="flex items-center gap-2 text-sm font-semibold">
                                  <span className={`w-4 h-4 rounded border flex items-center justify-center text-xs ${
                                    checked ? "bg-white/20 border-white/40" : "border-white/20"
                                  }`}>{checked ? "✓" : ""}</span>
                                  {g.label}
                                </span>
                                <span className="text-xs opacity-70">
                                  {empfaengerAnzahl ? `${getAnzahl(g.key)} Empf.` : "…"}
                                </span>
                              </button>
                            );
                          })}
                        </div>
                        <Button
                          className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2 mt-1"
                          disabled={selectedGruppen.length === 0 || sendeAnGruppe.isPending}
                          onClick={() => setConfirmOpen(true)}
                        >
                          <Send className="w-4 h-4" />
                          Senden ({selectedGruppen.length > 0
                            ? selectedGruppen.map((k) => getAnzahl(k)).reduce((a, b) => a + b, 0) + " Empf. (vor Dedup.)"
                            : "Gruppe wählen"})
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* HTML-Vorschau */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs text-white/40 uppercase tracking-widest">Vorschau</p>
                    <button
                      onClick={() => refetchVorschau()}
                      className="flex items-center gap-1.5 text-xs text-white/40 hover:text-white/70 transition-colors"
                    >
                      <RefreshCw className="w-3 h-3" />
                      Aktualisieren
                    </button>
                  </div>
                  {loadingVorschau ? (
                    <div className="flex items-center justify-center py-16 border border-white/10 rounded-xl">
                      <Loader2 className="w-6 h-6 animate-spin text-white/40" />
                    </div>
                  ) : vorschau ? (
                    <div className="rounded-xl overflow-hidden border border-white/10">
                      <iframe
                        srcDoc={vorschau.html}
                        title="E-Mail Vorschau"
                        className="w-full"
                        style={{ height: "600px", border: "none" }}
                        sandbox="allow-same-origin"
                      />
                    </div>
                  ) : null}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Empfänger-Liste nach Versand */}
      {versandListe && versandInfo && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111118] border border-white/20 rounded-2xl p-6 max-w-lg w-full shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                  Versand abgeschlossen
                </p>
                <p className="text-xs text-white/50 mt-1">
                  {versandInfo.gruppen} · {versandInfo.gesendet} gesendet
                  {versandInfo.fehlgeschlagen > 0 && (
                    <span className="text-red-400 ml-2">{versandInfo.fehlgeschlagen} fehlgeschlagen</span>
                  )}
                </p>
              </div>
              <button onClick={() => setVersandListe(null)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center justify-between mb-3">
              <p className="text-xs text-white/40 uppercase tracking-widest">
                {versandListe.length} Empfänger (dedupliziert)
              </p>
              <button
                onClick={downloadCsv}
                className="flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition-colors border border-orange-500/30 rounded px-2 py-1"
              >
                <RefreshCw className="w-3 h-3" />
                CSV herunterladen
              </button>
            </div>

            <div className="overflow-y-auto flex-1 space-y-1 pr-1">
              {versandListe.map((e, i) => (
                <div key={i} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white/5 hover:bg-white/8 transition-colors">
                  <div className="min-w-0">
                    {e.name && <p className="text-xs text-white/70 truncate">{e.name}</p>}
                    <p className="text-sm text-white truncate">{e.email}</p>
                  </div>
                  <div className="flex gap-1 ml-3 flex-shrink-0">
                    {e.gruppen.map((g) => (
                      <span key={g} className={`text-xs px-1.5 py-0.5 rounded border ${
                        g === "RAUM 36" ? "bg-orange-500/20 text-orange-300 border-orange-500/30" :
                        g === "KIICH" ? "bg-blue-500/20 text-blue-300 border-blue-500/30" :
                        "bg-green-500/20 text-green-300 border-green-500/30"
                      }`}>{g}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 border-t border-white/10 mt-4">
              <Button
                className="w-full bg-white/10 hover:bg-white/20 text-white"
                onClick={() => setVersandListe(null)}
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Bestätigungs-Dialog */}
      {confirmOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#111118] border border-white/20 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-orange-400" />
                </div>
                <div>
                  <p className="font-bold text-white">Wirklich senden?</p>
                  <p className="text-xs text-white/50 mt-0.5">
                    {selectedGruppen.map((k) => GRUPPEN.find((g) => g.key === k)?.label).join(" + ")}
                  </p>
                </div>
              </div>
              <button onClick={() => setConfirmOpen(false)} className="text-white/40 hover:text-white transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-white/5 rounded-lg p-3 mb-5 space-y-1">
              <p className="text-xs text-white/50">Betreff:</p>
              <p className="text-sm text-white font-medium">{fieldValues.betreff || "–"}</p>
              <p className="text-xs text-white/50 mt-2">Empfänger (vor Deduplizierung):</p>
              <p className="text-sm text-orange-300 font-bold">
                {selectedGruppen.map((k) => getAnzahl(k)).reduce((a, b) => a + b, 0)} Personen
              </p>
              <p className="text-xs text-white/40">Doppelte Adressen werden automatisch entfernt.</p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1 border-white/20 text-white/70 hover:text-white bg-transparent"
                onClick={() => setConfirmOpen(false)}
                disabled={sendeAnGruppe.isPending}
              >
                Abbrechen
              </Button>
              <Button
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white gap-2"
                onClick={() => sendeAnGruppe.mutate({ gruppen: selectedGruppen, fields: fieldValues })}
                disabled={sendeAnGruppe.isPending}
              >
                {sendeAnGruppe.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Jetzt senden
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
