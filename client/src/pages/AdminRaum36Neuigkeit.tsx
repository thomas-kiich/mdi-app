import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Link } from "wouter";
import { ArrowLeft, Send, Eye, Zap, Brain, Wrench, Megaphone, CheckCircle, AlertCircle } from "lucide-react";

type Typ = "training" | "wissenspool" | "technik" | "allgemein";

const TYP_CONFIG: Record<Typ, { label: string; color: string; border: string; bg: string; icon: React.ReactNode }> = {
  training: {
    label: "NEUES TRAINING",
    color: "text-orange-400",
    border: "border-orange-500/40",
    bg: "bg-orange-500/10",
    icon: <Zap className="w-4 h-4" />,
  },
  wissenspool: {
    label: "WISSENSPOOL",
    color: "text-purple-400",
    border: "border-purple-500/40",
    bg: "bg-purple-500/10",
    icon: <Brain className="w-4 h-4" />,
  },
  technik: {
    label: "NEUE FUNKTION",
    color: "text-emerald-400",
    border: "border-emerald-500/40",
    bg: "bg-emerald-500/10",
    icon: <Wrench className="w-4 h-4" />,
  },
  allgemein: {
    label: "NEUIGKEIT",
    color: "text-amber-400",
    border: "border-amber-500/40",
    bg: "bg-amber-500/10",
    icon: <Megaphone className="w-4 h-4" />,
  },
};

export default function AdminRaum36Neuigkeit() {
  const [typ, setTyp] = useState<Typ>("training");
  const [titel, setTitel] = useState("");
  const [text, setText] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkLabel, setLinkLabel] = useState("");
  const [ergebnis, setErgebnis] = useState<{ gesendet: number; fehlgeschlagen: number; empfaengerAnzahl: number } | null>(null);

  const sendeNeuigkeit = trpc.raum36.adminSendeNeuigkeit.useMutation({
    onSuccess: (data) => {
      setErgebnis(data);
      toast.success(`E-Mail an ${data.gesendet} Mitglieder gesendet`);
    },
    onError: (err) => {
      toast.error("Fehler beim Senden: " + err.message);
    },
  });

  const handleSend = (nurTest: boolean) => {
    if (!titel.trim() || !text.trim()) {
      toast.error("Bitte Titel und Text ausfüllen");
      return;
    }
    setErgebnis(null);
    sendeNeuigkeit.mutate({
      typ,
      titel: titel.trim(),
      text: text.trim(),
      linkUrl: linkUrl.trim() || undefined,
      linkLabel: linkLabel.trim() || undefined,
      nurTest,
    });
  };

  const cfg = TYP_CONFIG[typ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/admin">
            <button className="flex items-center gap-2 text-zinc-400 hover:text-white text-sm transition-colors">
              <ArrowLeft className="w-4 h-4" />
              Admin
            </button>
          </Link>
          <span className="text-zinc-700">/</span>
          <span className="text-zinc-300 text-sm">RAUM 36 Neuigkeit</span>
        </div>

        <h1 className="text-2xl font-bold text-white mb-2">RAUM 36 – Neuigkeit versenden</h1>
        <p className="text-zinc-400 text-sm mb-8">
          Informiere alle aktiven RAUM 36-Mitglieder über neue Inhalte. Sende zuerst einen Test an dich selbst.
        </p>

        {/* Typ-Auswahl */}
        <div className="mb-6">
          <p className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-3">Art der Neuigkeit</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {(Object.entries(TYP_CONFIG) as [Typ, typeof TYP_CONFIG[Typ]][]).map(([key, c]) => (
              <button
                key={key}
                onClick={() => setTyp(key)}
                className={`flex flex-col items-center gap-2 p-3 rounded-lg border transition-all text-center ${
                  typ === key
                    ? `${c.border} ${c.bg} ${c.color}`
                    : "border-zinc-800 hover:border-zinc-600 text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {c.icon}
                <span className="text-xs font-semibold tracking-wider">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Formular */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2 block">
              Betreff / Titel *
            </label>
            <Input
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              placeholder="z.B. Neues Faszientraining ist jetzt verfügbar"
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600"
              maxLength={120}
            />
            <p className="text-xs text-zinc-600 mt-1">{titel.length}/120 Zeichen</p>
          </div>

          <div>
            <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2 block">
              Nachrichtentext *
            </label>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Beschreibe kurz was neu ist und warum es für die Mitglieder relevant ist..."
              className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 min-h-[140px] resize-y"
              maxLength={2000}
            />
            <p className="text-xs text-zinc-600 mt-1">{text.length}/2000 Zeichen</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2 block">
                Link-URL (optional)
              </label>
              <Input
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://www.kiich.de/raum36?tab=methode&training=1"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold tracking-widest text-zinc-500 uppercase mb-2 block">
                Button-Beschriftung (optional)
              </label>
              <Input
                value={linkLabel}
                onChange={(e) => setLinkLabel(e.target.value)}
                placeholder="Jetzt Training starten →"
                className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-600 text-sm"
                maxLength={60}
              />
            </div>
          </div>
        </div>

        {/* Vorschau */}
        {titel && text && (
          <div className="mb-6 rounded-lg border border-zinc-800 overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <Eye className="w-3.5 h-3.5 text-zinc-500" />
              <span className="text-xs text-zinc-500 font-semibold tracking-wider uppercase">Vorschau</span>
            </div>
            <div className="p-4 bg-zinc-900/50">
              <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold tracking-widest uppercase mb-3 ${cfg.color} ${cfg.bg} border ${cfg.border}`}>
                {cfg.icon}
                {cfg.label}
              </div>
              <p className="text-white font-bold text-lg mb-2">{titel}</p>
              <p className="text-zinc-400 text-sm leading-relaxed whitespace-pre-line">{text}</p>
              {linkUrl && (
                <div className={`inline-block mt-4 px-5 py-2 rounded text-sm font-bold tracking-wider uppercase ${cfg.bg} border ${cfg.border} ${cfg.color}`}>
                  {linkLabel || "Jetzt ansehen →"}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Ergebnis */}
        {ergebnis && (
          <div className={`mb-6 rounded-lg border p-4 flex items-start gap-3 ${
            ergebnis.fehlgeschlagen === 0
              ? "border-emerald-500/30 bg-emerald-500/10"
              : "border-amber-500/30 bg-amber-500/10"
          }`}>
            {ergebnis.fehlgeschlagen === 0
              ? <CheckCircle className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              : <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
            }
            <div>
              <p className="font-semibold text-sm text-white">
                {ergebnis.gesendet} von {ergebnis.empfaengerAnzahl} E-Mails erfolgreich gesendet
              </p>
              {ergebnis.fehlgeschlagen > 0 && (
                <p className="text-xs text-amber-300 mt-1">{ergebnis.fehlgeschlagen} fehlgeschlagen</p>
              )}
            </div>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            variant="outline"
            onClick={() => handleSend(true)}
            disabled={sendeNeuigkeit.isPending}
            className="flex-1 border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-500"
          >
            <Eye className="w-4 h-4 mr-2" />
            Test an mich senden
          </Button>
          <Button
            onClick={() => handleSend(false)}
            disabled={sendeNeuigkeit.isPending || !titel.trim() || !text.trim()}
            className="flex-1 bg-orange-600 hover:bg-orange-500 text-white font-bold tracking-wider"
          >
            <Send className="w-4 h-4 mr-2" />
            {sendeNeuigkeit.isPending ? "Wird gesendet..." : "An alle Mitglieder senden"}
          </Button>
        </div>

        <p className="text-xs text-zinc-600 mt-3 text-center">
          "Test an mich senden" schickt die E-Mail nur an lkrforschung@gmail.com
        </p>
      </div>
    </div>
  );
}
