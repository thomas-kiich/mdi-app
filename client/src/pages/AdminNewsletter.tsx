import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Loader2, Sparkles, Send, Users, UserCheck, Mail, Download, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function AdminNewsletter() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeOnly, setActiveOnly] = useState(true);
  const [activeTab, setActiveTab] = useState<"send" | "list">("send");

  // Episode-Eingabe
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");

  const { data: countData } = trpc.newsletter.count.useQuery();
  const { data: subscribers, isLoading: subsLoading } = trpc.newsletter.list.useQuery(
    { activeOnly },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const generateDraft = trpc.newsletter.generateDraft.useMutation({
    onSuccess: (data) => {
      const text = typeof data.draft === "string" ? data.draft : "";
      setDraft(text);
      toast.success("KI-Entwurf wurde generiert!");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const sendNewsletter = trpc.newsletter.send.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error("Fehler beim Versenden: " + err.message),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-zinc-400">Zugang verweigert. Nur Admins dürfen diese Seite sehen.</p>
        <Link href="/"><Button variant="outline" className="border-zinc-700">Zur Startseite</Button></Link>
      </div>
    );
  }

  const handleGenerateDraft = () => {
    if (!episodeTitle || !episodeDescription || !episodeNumber) {
      toast.error("Bitte fülle alle Pflichtfelder aus.");
      return;
    }
    generateDraft.mutate({
      episodeNumber: parseInt(episodeNumber),
      episodeTitle,
      episodeDescription,
      additionalNotes: additionalNotes || undefined,
    });
  };

  const handleSend = () => {
    if (!subject || !draft) {
      toast.error("Bitte Betreff und Newsletter-Text eingeben.");
      return;
    }
    const htmlContent = `<!DOCTYPE html><html lang="de"><head><meta charset="UTF-8"></head>
<body style="margin:0;padding:0;background:#0a0a0a;font-family:Georgia,serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center"><table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
<tr><td style="padding:0 0 16px 0;"><p style="margin:0;font-size:11px;letter-spacing:4px;color:#b45309;text-transform:uppercase;font-family:Arial,sans-serif;">KIICHWERKE · MDI SYSTEM</p></td></tr>
<tr><td style="padding:0 0 24px 0;border-bottom:1px solid #27272a;"><h1 style="margin:0;font-size:22px;font-weight:300;color:#ffffff;">${subject}</h1></td></tr>
<tr><td style="padding:28px 0;">${draft.split("\n\n").map(p => `<p style="margin:0 0 16px 0;font-size:16px;color:#a1a1aa;line-height:1.7;">${p.replace(/\n/g, "<br>")}</p>`).join("")}</td></tr>
<tr><td style="padding:20px 0 0 0;border-top:1px solid #27272a;"><p style="margin:0;font-size:11px;color:#52525b;font-family:Arial,sans-serif;">Thomas Chochola · Lindacher Weg 17 · D-93128 Regenstauf<br><a href="https://kiich.de" style="color:#b45309;">kiich.de</a> · <a href="https://kiich.de/datenschutz" style="color:#52525b;">Datenschutz</a></p></td></tr>
</table></td></tr></table></body></html>`;
    sendNewsletter.mutate({ subject, htmlContent, textContent: draft });
  };

  const handleExportCSV = () => {
    if (!subscribers) return;
    const header = "ID,E-Mail,Name,Quelle,Aktiv,Erstellt am";
    const rows = subscribers.map(s =>
      [s.id, `"${s.email}"`, `"${s.name ?? ""}"`, s.source ?? "", s.active ? "Ja" : "Nein",
        new Date(s.createdAt).toLocaleDateString("de-DE")].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/">
            <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2 text-xs">
              <ArrowLeft className="w-3 h-3" /> STARTSEITE
            </Button>
          </Link>
          <h1 className="text-3xl font-light text-white tracking-tight">Newsletter-Agent</h1>
          <p className="text-zinc-500 text-sm">KI-gestützter Entwurf & Versand · Jeden Donnerstag</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { icon: Users, color: "text-orange-400", label: "Gesamt", value: countData?.total ?? "–" },
            { icon: UserCheck, color: "text-green-400", label: "Aktiv bestätigt", value: countData?.active ?? "–" },
            { icon: Mail, color: "text-blue-400", label: "Absender", value: "kiich.de" },
          ].map(({ icon: Icon, color, label, value }) => (
            <div key={label} className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${color}`} />
                <span className="text-zinc-500 text-xs">{label}</span>
              </div>
              <p className="text-2xl font-light text-white">{String(value)}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-zinc-800 pb-0">
          {(["send", "list"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-white border-orange-500"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              {tab === "send" ? "Newsletter erstellen & senden" : "Abonnenten-Liste"}
            </button>
          ))}
        </div>

        {activeTab === "send" && (
          <div className="space-y-6">
            {/* Schritt 1 */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">01</span>
                  Episode-Daten eingeben
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider">Episode Nr. *</label>
                    <Input type="number" placeholder="z. B. 12" value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider">E-Mail-Betreff *</label>
                    <Input placeholder="z. B. Episode 12: Der stille Beobachter" value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Episodentitel *</label>
                  <Input placeholder="z. B. Der stille Beobachter" value={episodeTitle}
                    onChange={(e) => setEpisodeTitle(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Episodenbeschreibung *</label>
                  <Textarea placeholder="Worum geht es in dieser Episode? Was ist der Kerngedanke?"
                    value={episodeDescription} onChange={(e) => setEpisodeDescription(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white min-h-[90px]" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs text-zinc-500 uppercase tracking-wider">Zusätzliche Notizen (optional)</label>
                  <Input placeholder="Persönliche Gedanken, besondere Ereignisse..." value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    className="bg-zinc-800 border-zinc-700 text-white" />
                </div>
              </CardContent>
            </Card>

            {/* Schritt 2 */}
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">02</span>
                  KI-Entwurf generieren & bearbeiten
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button onClick={handleGenerateDraft} disabled={generateDraft.isPending}
                  className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
                  {generateDraft.isPending
                    ? <><Loader2 className="w-4 h-4 animate-spin" /> KI schreibt...</>
                    : <><Sparkles className="w-4 h-4" /> Entwurf generieren</>}
                </Button>
                {draft && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-xs text-zinc-500 uppercase tracking-wider">Newsletter-Text (bearbeitbar)</label>
                      <Badge variant="outline" className="text-orange-400 border-orange-800 text-xs">{draft.length} Zeichen</Badge>
                    </div>
                    <Textarea value={draft} onChange={(e) => setDraft(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white min-h-[280px] font-mono text-sm leading-relaxed" />
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Schritt 3 */}
            {draft && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">03</span>
                    Newsletter versenden
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="bg-zinc-800/50 rounded-lg p-4 flex items-center gap-3">
                    <Mail className="w-5 h-5 text-orange-400 flex-shrink-0" />
                    <div>
                      <p className="text-white text-sm font-medium">Bereit zum Versand</p>
                      <p className="text-zinc-500 text-xs">An {countData?.active ?? 0} aktive Abonnenten · Von: newsletter@kiich.de</p>
                    </div>
                  </div>
                  <Button onClick={handleSend} disabled={sendNewsletter.isPending || !subject || !draft}
                    className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-12 text-base">
                    {sendNewsletter.isPending
                      ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird versendet...</>
                      : <><Send className="w-5 h-5" /> Newsletter jetzt versenden ({countData?.active ?? 0} Empfänger)</>}
                  </Button>
                  <p className="text-xs text-zinc-600 text-center">Diese Aktion kann nicht rückgängig gemacht werden.</p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Switch id="active-only" checked={activeOnly} onCheckedChange={setActiveOnly} />
                <Label htmlFor="active-only" className="text-zinc-300 cursor-pointer text-sm">Nur aktive Abonnenten</Label>
              </div>
              <Button onClick={handleExportCSV} disabled={!subscribers || subscribers.length === 0}
                className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white text-sm gap-2">
                <Download className="w-4 h-4" /> CSV exportieren
              </Button>
            </div>

            {subsLoading ? (
              <div className="flex justify-center py-16"><Loader2 className="w-8 h-8 text-orange-500 animate-spin" /></div>
            ) : !subscribers || subscribers.length === 0 ? (
              <div className="text-center py-16 text-zinc-500">
                <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Noch keine Abonnenten vorhanden.</p>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">E-Mail</TableHead>
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400">Quelle</TableHead>
                      <TableHead className="text-zinc-400">Status</TableHead>
                      <TableHead className="text-zinc-400">Angemeldet</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscribers.map((sub) => (
                      <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/30">
                        <TableCell className="text-white font-mono text-sm">{sub.email}</TableCell>
                        <TableCell className="text-zinc-300">{sub.name ?? <span className="text-zinc-600">–</span>}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">{sub.source ?? "website"}</Badge>
                        </TableCell>
                        <TableCell>
                          {sub.active
                            ? <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aktiv</Badge>
                            : <Badge className="bg-zinc-700/50 text-zinc-500 border-zinc-600/30">Abgemeldet</Badge>}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-sm">
                          {new Date(sub.createdAt).toLocaleDateString("de-DE")}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
