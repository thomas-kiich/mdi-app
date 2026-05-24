import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Mail, Send, Eye, ChevronLeft, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Link } from "wouter";

export default function AdminEmailVorschau() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [testEmail, setTestEmail] = useState("lkrforschung@gmail.com");

  const { data: templates, isLoading: loadingTemplates } = trpc.emailVorschau.getTemplates.useQuery();

  const { data: vorschau, isLoading: loadingVorschau } = trpc.emailVorschau.getVorschau.useQuery(
    { templateId: selectedId! },
    { enabled: !!selectedId }
  );

  const sendTest = trpc.emailVorschau.sendTestEmail.useMutation({
    onSuccess: (data) => {
      if (data.success) {
        toast.success(`Test-E-Mail gesendet an ${testEmail}`);
      } else {
        toast.error("Versand fehlgeschlagen – Brevo-Fehler");
      }
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const selected = templates?.find((t) => t.id === selectedId);

  const empfaengerColor: Record<string, string> = {
    "Nutzer": "bg-blue-500/20 text-blue-300 border-blue-500/30",
    "Mitglied": "bg-orange-500/20 text-orange-300 border-orange-500/30",
    "Käufer": "bg-green-500/20 text-green-300 border-green-500/30",
    "Thomas (Admin)": "bg-purple-500/20 text-purple-300 border-purple-500/30",
  };

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
            <p className="text-xs text-white/40 uppercase tracking-widest mb-4">Templates ({templates?.length ?? 0})</p>

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
                  <span className={`text-xs px-2 py-0.5 rounded border whitespace-nowrap ${empfaengerColor[t.empfaenger] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                    {t.empfaenger}
                  </span>
                </div>
                <p className="text-xs text-white/40 leading-relaxed">{t.beschreibung}</p>
              </button>
            ))}
          </div>

          {/* Rechte Spalte: Vorschau + Test-Versand */}
          <div className="lg:col-span-2">
            {!selectedId ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-24 border border-dashed border-white/10 rounded-xl">
                <Eye className="w-12 h-12 text-white/20 mb-4" />
                <p className="text-white/40 text-sm">Template auswählen um Vorschau zu sehen</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Meta-Infos */}
                <Card className="bg-[#111118] border-white/10">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base text-white flex items-center gap-2">
                      <Mail className="w-4 h-4 text-orange-400" />
                      {selected?.label}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div>
                      <p className="text-xs text-white/40 mb-1">Betreff</p>
                      <p className="text-sm text-white/80 font-mono bg-white/5 px-3 py-2 rounded">{selected?.betreff}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/40 mb-1">Empfänger</p>
                      <span className={`text-xs px-2 py-1 rounded border ${empfaengerColor[selected?.empfaenger ?? ""] ?? "bg-white/10 text-white/60 border-white/20"}`}>
                        {selected?.empfaenger}
                      </span>
                    </div>

                    {/* Test-Versand */}
                    <div className="pt-2 border-t border-white/10">
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
                          onClick={() => sendTest.mutate({ templateId: selectedId, empfaengerEmail: testEmail })}
                          disabled={sendTest.isPending || !testEmail}
                          className="bg-orange-500 hover:bg-orange-600 text-white gap-2 whitespace-nowrap"
                        >
                          {sendTest.isPending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Send className="w-4 h-4" />
                          )}
                          Senden
                        </Button>
                      </div>
                      {sendTest.isSuccess && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-green-400">
                          <CheckCircle2 className="w-3 h-3" />
                          Test-E-Mail gesendet
                        </div>
                      )}
                      {sendTest.isError && (
                        <div className="flex items-center gap-2 mt-2 text-xs text-red-400">
                          <XCircle className="w-3 h-3" />
                          Versand fehlgeschlagen
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* HTML-Vorschau im iFrame */}
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-widest mb-3">Vorschau</p>
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
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
