import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { toast } from "sonner";
import { CheckCircle, Clock, Eye, EyeOff, MessageSquare, ChevronDown, ChevronUp, Archive } from "lucide-react";
import { Link } from "wouter";

type FaqFrage = {
  id: number;
  frage: string;
  antwort: string | null;
  name: string | null;
  email: string | null;
  status: string;
  oeffentlich: boolean;
  createdAt: number;
};

export default function AdminFaq() {
  const { user, loading } = useAuth();
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [antworten, setAntworten] = useState<Record<number, string>>({});

  const { data: fragen, isLoading, refetch } = trpc.faq.getAlleFragen.useQuery(undefined, {
    enabled: !!user && user.role === "admin",
  });

  const beantwortenMutation = trpc.faq.frageBeantwortenUndVeroeffentlichen.useMutation({
    onSuccess: () => {
      toast.success("Antwort gespeichert");
      refetch();
    },
    onError: (err: unknown) => toast.error((err as Error).message),
  });

  const archivierenMutation = trpc.faq.frageArchivieren.useMutation({
    onSuccess: () => {
      toast.success("Frage archiviert");
      refetch();
    },
    onError: (err: unknown) => toast.error((err as Error).message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user || user.role !== "admin") {
    return (
      <div className="min-h-screen bg-[#0a0a10] flex items-center justify-center">
        <div className="text-center">
          <p className="text-zinc-400 mb-4">Kein Zugriff. Diese Seite ist nur für Administratoren.</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700 text-zinc-300">Zurück zur Startseite</Button>
          </Link>
        </div>
      </div>
    );
  }

  const offen = (fragen as FaqFrage[] | undefined)?.filter((f) => f.status === "offen") ?? [];
  const beantwortet = (fragen as FaqFrage[] | undefined)?.filter((f) => f.status === "beantwortet") ?? [];
  const archiviert = (fragen as FaqFrage[] | undefined)?.filter((f) => f.status === "archiviert") ?? [];

  const handleAntworten = (id: number, oeffentlich: boolean) => {
    const antwort = antworten[id]?.trim();
    if (!antwort) {
      toast.error("Bitte eine Antwort eingeben");
      return;
    }
    beantwortenMutation.mutate({ id, antwort, oeffentlich });
  };

  const formatDatum = (ts: number) =>
    new Date(ts).toLocaleDateString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const FrageKarte = ({ frage, offen: istOffen }: { frage: FaqFrage; offen: boolean }) => (
    <Card
      key={frage.id}
      className={`border transition-colors ${istOffen ? "bg-zinc-900/60 border-amber-500/20 hover:border-amber-500/40" : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"}`}
    >
      <CardHeader
        className="pb-2 cursor-pointer"
        onClick={() => setExpandedId(expandedId === frage.id ? null : frage.id)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className={`text-sm leading-relaxed ${istOffen ? "text-white font-medium" : "text-zinc-300"}`}>
              {frage.frage}
            </p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              {frage.name && <span className="text-zinc-500 text-xs">{frage.name}</span>}
              {frage.email && <span className="text-zinc-600 text-xs">{frage.email}</span>}
              <span className="text-zinc-700 text-xs">{formatDatum(frage.createdAt)}</span>
              {!istOffen && (
                <Badge
                  variant="outline"
                  className={`text-[10px] px-2 py-0 flex items-center gap-1 ${frage.oeffentlich ? "border-green-500/40 text-green-400" : "border-zinc-600 text-zinc-500"}`}
                >
                  {frage.oeffentlich ? (
                    <><Eye className="w-2.5 h-2.5" />Öffentlich</>
                  ) : (
                    <><EyeOff className="w-2.5 h-2.5" />Intern</>
                  )}
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!istOffen && frage.status !== "archiviert" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  beantwortenMutation.mutate({
                    id: frage.id,
                    antwort: frage.antwort ?? "",
                    oeffentlich: !frage.oeffentlich,
                  });
                }}
                className="text-zinc-600 hover:text-zinc-400 transition-colors p-1"
                title={frage.oeffentlich ? "Verbergen" : "Öffentlich schalten"}
              >
                {frage.oeffentlich ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            )}
            {frage.status !== "archiviert" && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  archivierenMutation.mutate({ id: frage.id });
                }}
                className="text-zinc-700 hover:text-zinc-500 transition-colors p-1"
                title="Archivieren"
              >
                <Archive className="w-4 h-4" />
              </button>
            )}
            {expandedId === frage.id ? (
              <ChevronUp className="w-4 h-4 text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-500" />
            )}
          </div>
        </div>
      </CardHeader>

      {expandedId === frage.id && (
        <CardContent className="pt-0">
          <div className="border-t border-zinc-800 pt-4 mt-1">
            {frage.antwort && (
              <div className="mb-4 bg-zinc-800/40 rounded-lg p-3">
                <p className="text-zinc-500 text-xs mb-1 font-medium">Aktuelle Antwort:</p>
                <p className="text-zinc-300 text-sm leading-relaxed">{frage.antwort}</p>
              </div>
            )}
            {frage.status !== "archiviert" && (
              <>
                <p className="text-zinc-400 text-xs mb-2 font-medium">
                  {frage.antwort ? "Antwort bearbeiten:" : "Antwort eingeben:"}
                </p>
                <Textarea
                  value={antworten[frage.id] ?? frage.antwort ?? ""}
                  onChange={(e) => setAntworten((prev) => ({ ...prev, [frage.id]: e.target.value }))}
                  placeholder="Antwort eingeben..."
                  className="bg-zinc-800/60 border-zinc-700 text-white text-sm resize-none min-h-[100px] mb-3"
                />
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    onClick={() => handleAntworten(frage.id, true)}
                    disabled={beantwortenMutation.isPending}
                    className="bg-violet-600 hover:bg-violet-500 text-white text-xs"
                  >
                    <CheckCircle className="w-3 h-3 mr-1.5" />
                    Speichern & öffentlich
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleAntworten(frage.id, false)}
                    disabled={beantwortenMutation.isPending}
                    className="border-zinc-700 text-zinc-400 hover:text-white text-xs"
                  >
                    Nur intern speichern
                  </Button>
                </div>
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );

  return (
    <div className="min-h-screen bg-[#0a0a10] text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-[#0d0d14]">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/momentaufnahme">
              <button className="text-zinc-500 hover:text-zinc-300 transition-colors text-sm">← Zurück</button>
            </Link>
            <span className="text-zinc-700">|</span>
            <h1 className="text-white font-bold tracking-wide">FAQ-Verwaltung</h1>
            <Badge variant="outline" className="border-violet-500/40 text-violet-400 text-xs">
              Admin
            </Badge>
          </div>
          <Link href="/faq">
            <Button variant="outline" size="sm" className="border-zinc-700 text-zinc-400 hover:text-white text-xs">
              Öffentliche FAQ
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Statistik */}
        <div className="grid grid-cols-4 gap-3 mb-8">
          {[
            { label: "Gesamt", value: fragen?.length ?? 0, color: "text-white" },
            { label: "Offen", value: offen.length, color: "text-amber-400" },
            { label: "Beantwortet", value: beantwortet.length, color: "text-green-400" },
            { label: "Archiviert", value: archiviert.length, color: "text-zinc-500" },
          ].map((s) => (
            <div key={s.label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-center">
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-zinc-500 text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {isLoading && (
          <div className="text-center py-12">
            <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-zinc-500 text-sm">Lade Fragen...</p>
          </div>
        )}

        {/* Offene Fragen */}
        {offen.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-amber-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Offene Fragen ({offen.length})
            </h2>
            <div className="space-y-3">
              {offen.map((frage) => (
                <FrageKarte key={frage.id} frage={frage} offen={true} />
              ))}
            </div>
          </div>
        )}

        {/* Beantwortete Fragen */}
        {beantwortet.length > 0 && (
          <div className="mb-8">
            <h2 className="text-sm font-bold text-green-400 tracking-widest uppercase mb-4 flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Beantwortete Fragen ({beantwortet.length})
            </h2>
            <div className="space-y-3">
              {beantwortet.map((frage) => (
                <FrageKarte key={frage.id} frage={frage} offen={false} />
              ))}
            </div>
          </div>
        )}

        {/* Archivierte Fragen */}
        {archiviert.length > 0 && (
          <div>
            <h2 className="text-sm font-bold text-zinc-600 tracking-widest uppercase mb-4 flex items-center gap-2">
              <Archive className="w-4 h-4" />
              Archiviert ({archiviert.length})
            </h2>
            <div className="space-y-3">
              {archiviert.map((frage) => (
                <FrageKarte key={frage.id} frage={frage} offen={false} />
              ))}
            </div>
          </div>
        )}

        {!isLoading && (!fragen || fragen.length === 0) && (
          <div className="text-center py-16">
            <MessageSquare className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
            <p className="text-zinc-500">Noch keine Fragen eingegangen.</p>
            <p className="text-zinc-600 text-sm mt-2">
              Fragen erscheinen hier sobald Nutzer das Formular auf der FAQ-Seite ausfüllen.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
