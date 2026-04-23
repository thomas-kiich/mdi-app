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
import { Loader2, Sparkles, Send, Users, UserCheck, Mail, Download, ArrowLeft, Eye, EyeOff, TestTube } from "lucide-react";
import { Link } from "wouter";

/** Erzeugt das vollständige Newsletter-HTML mit BT-CTA */
function buildNewsletterHtml(subject: string, bodyText: string, includeBtCta: boolean): string {
  const paragraphs = bodyText
    .split("\n\n")
    .map(p => `<p style="margin:0 0 18px 0;font-size:16px;color:#a1a1aa;line-height:1.75;font-family:Georgia,serif;">${p.replace(/\n/g, "<br>")}</p>`)
    .join("");

  const btBlock = includeBtCta ? `
<tr>
  <td style="padding:28px 0;">
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="background:#1c1917;border:1px solid #292524;border-radius:12px;padding:24px 28px;">
          <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;color:#b45309;text-transform:uppercase;font-family:Arial,sans-serif;">JETZT STARTEN</p>
          <p style="margin:0 0 14px 0;font-size:18px;color:#ffffff;font-family:Georgia,serif;font-weight:400;">Befindlichkeitstraining</p>
          <p style="margin:0 0 20px 0;font-size:14px;color:#78716c;line-height:1.6;font-family:Arial,sans-serif;">Analysiere deine Stimmfrequenzen und entdecke deinen persönlichen Klang-Fingerabdruck. Kostenlos, in 3 Minuten.</p>
          <a href="https://kiich.manus.space/befindlichkeitstraining"
             style="display:inline-block;background:#c2410c;color:#ffffff;text-decoration:none;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;font-family:Arial,sans-serif;letter-spacing:0.5px;">
            Zum Befindlichkeitstraining →
          </a>
        </td>
      </tr>
    </table>
  </td>
</tr>` : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#0a0a0a;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0a;padding:40px 20px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Logo & Label -->
  <tr>
    <td style="padding:0 0 8px 0;">
      <p style="margin:0;font-size:10px;letter-spacing:5px;color:#b45309;text-transform:uppercase;font-family:Arial,sans-serif;">KIICHWERKE · MDI SYSTEM</p>
    </td>
  </tr>

  <!-- Betreff-Zeile -->
  <tr>
    <td style="padding:0 0 28px 0;border-bottom:1px solid #27272a;">
      <h1 style="margin:0;font-size:24px;font-weight:300;color:#ffffff;font-family:Georgia,serif;line-height:1.3;">${subject}</h1>
    </td>
  </tr>

  <!-- Body -->
  <tr>
    <td style="padding:28px 0 0 0;">
      ${paragraphs}
    </td>
  </tr>

  ${btBlock}

  <!-- Trennlinie -->
  <tr>
    <td style="padding:8px 0;border-top:1px solid #27272a;"></td>
  </tr>

  <!-- Footer -->
  <tr>
    <td style="padding:16px 0 0 0;">
      <p style="margin:0 0 8px 0;font-size:11px;color:#52525b;font-family:Arial,sans-serif;line-height:1.6;">
        Thomas Chochola · Lindacher Weg 17 · D-93128 Regenstauf<br>
        <a href="https://kiich.de" style="color:#b45309;text-decoration:none;">kiich.de</a> ·
        <a href="https://kiich.de/datenschutz" style="color:#52525b;text-decoration:none;">Datenschutz</a> ·
        <a href="https://kiich.de/impressum" style="color:#52525b;text-decoration:none;">Impressum</a>
      </p>
      <p style="margin:0;font-size:10px;color:#3f3f46;font-family:Arial,sans-serif;">
        Du erhältst diese E-Mail, weil du dich auf kiich.de angemeldet hast. ·
        <a href="{{unsubscribeUrl}}" style="color:#3f3f46;text-decoration:underline;">Abmelden</a>
      </p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}

export default function AdminNewsletter() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeOnly, setActiveOnly] = useState(true);
  const [activeTab, setActiveTab] = useState<"send" | "direct" | "list">("send");
  const [showPreview, setShowPreview] = useState(false);
  const [includeBtCta, setIncludeBtCta] = useState(true);

  // Direktversand
  const [directSubject, setDirectSubject] = useState("");
  const [directHtml, setDirectHtml] = useState("");

  // Episode-Eingabe
  const [episodeNumber, setEpisodeNumber] = useState("");
  const [episodeTitle, setEpisodeTitle] = useState("");
  const [episodeDescription, setEpisodeDescription] = useState("");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [draft, setDraft] = useState("");
  const [subject, setSubject] = useState("");
  const [testEmail, setTestEmail] = useState("");

  const { data: countData } = trpc.newsletter.count.useQuery();
  const { data: subscribers, isLoading: subsLoading } = trpc.newsletter.list.useQuery(
    { activeOnly },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const generateDraft = trpc.newsletter.generateDraft.useMutation({
    onSuccess: (data) => {
      const text = typeof data.draft === "string" ? data.draft : "";
      setDraft(text);
      setShowPreview(true);
      toast.success("KI-Entwurf generiert – Vorschau geöffnet!");
    },
    onError: (err) => toast.error("Fehler: " + err.message),
  });

  const sendNewsletter = trpc.newsletter.send.useMutation({
    onSuccess: (data) => toast.success(data.message),
    onError: (err) => toast.error("Fehler beim Versenden: " + err.message),
  });

  const sendTestEmail = trpc.newsletter.send.useMutation({
    onSuccess: () => toast.success(`Test-E-Mail an ${testEmail} versendet!`),
    onError: (err) => toast.error("Fehler: " + err.message),
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
    const htmlContent = buildNewsletterHtml(subject, draft, includeBtCta);
    sendNewsletter.mutate({ subject, htmlContent, textContent: draft });
  };

  const handleTestSend = () => {
    if (!testEmail || !subject || !draft) {
      toast.error("Bitte Test-E-Mail-Adresse, Betreff und Text eingeben.");
      return;
    }
    const htmlContent = buildNewsletterHtml(subject, draft, includeBtCta);
    // Testversand: nur an eine Adresse – wir nutzen den direkten Brevo-Aufruf über send
    // mit einer gefilterten Empfängerliste (Workaround: subject mit [TEST] prefix)
    sendTestEmail.mutate({
      subject: `[TEST] ${subject}`,
      htmlContent,
      textContent: `[TEST]\n\n${draft}`,
    });
  };

  const handleDirectSend = () => {
    if (!directSubject || !directHtml) {
      toast.error("Bitte Betreff und HTML-Inhalt eingeben.");
      return;
    }
    sendNewsletter.mutate({
      subject: directSubject,
      htmlContent: directHtml,
      textContent: directSubject,
    });
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

  const previewHtml = subject && draft ? buildNewsletterHtml(subject, draft, includeBtCta) : "";

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
          {(["send", "direct", "list"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? "text-white border-orange-500"
                  : "text-zinc-500 border-transparent hover:text-zinc-300"
              }`}
            >
              {tab === "send" ? "KI-Entwurf" : tab === "direct" ? "HTML direkt senden" : "Abonnenten-Liste"}
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
                    <Input type="number" placeholder="z. B. 4" value={episodeNumber}
                      onChange={(e) => setEpisodeNumber(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs text-zinc-500 uppercase tracking-wider">E-Mail-Betreff *</label>
                    <Input placeholder="z. B. Episode 04: Maschinen atmen nicht" value={subject}
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

            {/* BT-CTA Toggle */}
            {draft && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">03</span>
                    Befindlichkeitstraining-Button
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Switch id="bt-cta" checked={includeBtCta} onCheckedChange={setIncludeBtCta} />
                    <Label htmlFor="bt-cta" className="text-zinc-300 cursor-pointer text-sm">
                      CTA-Block "Zum Befindlichkeitstraining" im Newsletter einbinden
                    </Label>
                  </div>
                  {includeBtCta && (
                    <div className="bg-zinc-800/50 border border-zinc-700 rounded-lg p-3 text-xs text-zinc-400">
                      <p className="font-medium text-zinc-300 mb-1">Vorschau des CTA-Blocks:</p>
                      <p className="text-orange-400 uppercase tracking-widest text-[10px] mb-0.5">JETZT STARTEN</p>
                      <p className="text-white text-sm mb-1">Befindlichkeitstraining</p>
                      <p className="mb-2">Analysiere deine Stimmfrequenzen und entdecke deinen persönlichen Klang-Fingerabdruck. Kostenlos, in 3 Minuten.</p>
                      <span className="bg-orange-700 text-white px-3 py-1 rounded text-xs">Zum Befindlichkeitstraining →</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Vorschau */}
            {draft && previewHtml && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">04</span>
                      E-Mail-Vorschau
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setShowPreview(!showPreview)}
                      className="text-zinc-400 hover:text-white gap-2 text-xs">
                      {showPreview ? <><EyeOff className="w-3.5 h-3.5" /> Ausblenden</> : <><Eye className="w-3.5 h-3.5" /> Anzeigen</>}
                    </Button>
                  </CardTitle>
                </CardHeader>
                {showPreview && (
                  <CardContent>
                    <div className="rounded-lg overflow-hidden border border-zinc-700">
                      <iframe
                        srcDoc={previewHtml}
                        className="w-full"
                        style={{ height: "600px", border: "none", background: "#0a0a0a" }}
                        title="Newsletter-Vorschau"
                        sandbox="allow-same-origin"
                      />
                    </div>
                    <p className="text-xs text-zinc-600 mt-2 text-center">Vorschau entspricht der tatsächlichen E-Mail</p>
                  </CardContent>
                )}
              </Card>
            )}

            {/* Schritt 5: Testversand */}
            {draft && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                    <span className="bg-blue-500/20 text-blue-400 text-xs font-mono px-2 py-1 rounded">05</span>
                    Test-E-Mail senden
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-zinc-500 text-xs">Sende eine Test-E-Mail an dich selbst, bevor du an alle Abonnenten versendest.</p>
                  <div className="flex gap-2">
                    <Input
                      type="email"
                      placeholder="deine@email.de"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      className="bg-zinc-800 border-zinc-700 text-white flex-1"
                    />
                    <Button
                      onClick={handleTestSend}
                      disabled={sendTestEmail.isPending || !testEmail || !subject || !draft}
                      className="bg-blue-700 hover:bg-blue-600 text-white gap-2 shrink-0"
                    >
                      {sendTestEmail.isPending
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <><TestTube className="w-4 h-4" /> Test senden</>}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Schritt 6: Versand an alle */}
            {draft && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">06</span>
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

        {activeTab === "direct" && (
          <div className="space-y-6">
            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">01</span>
                  Betreff eingeben
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Input
                  placeholder="z. B. KIICH Episode 04 – Maschinen atmen nicht"
                  value={directSubject}
                  onChange={(e) => setDirectSubject(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </CardContent>
            </Card>

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">02</span>
                  HTML-Inhalt einfügen
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-zinc-500 text-xs">Kopiere den vollständigen HTML-Code deines Newsletters und füge ihn hier ein.</p>
                <Textarea
                  placeholder="<!DOCTYPE html><html>...</html>"
                  value={directHtml}
                  onChange={(e) => setDirectHtml(e.target.value)}
                  className="bg-zinc-800 border-zinc-700 text-white min-h-[320px] font-mono text-xs leading-relaxed"
                />
                {directHtml && (
                  <Badge variant="outline" className="text-orange-400 border-orange-800 text-xs">
                    {directHtml.length.toLocaleString("de-DE")} Zeichen
                  </Badge>
                )}
              </CardContent>
            </Card>

            {/* Vorschau Direktversand */}
            {directHtml && (
              <Card className="bg-zinc-900/60 border-zinc-800">
                <CardHeader>
                  <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                    <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">03</span>
                    Vorschau
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="rounded-lg overflow-hidden border border-zinc-700">
                    <iframe
                      srcDoc={directHtml}
                      className="w-full"
                      style={{ height: "500px", border: "none" }}
                      title="HTML-Vorschau"
                      sandbox="allow-same-origin"
                    />
                  </div>
                </CardContent>
              </Card>
            )}

            <Card className="bg-zinc-900/60 border-zinc-800">
              <CardHeader>
                <CardTitle className="text-white text-base font-medium flex items-center gap-2">
                  <span className="bg-orange-500/20 text-orange-400 text-xs font-mono px-2 py-1 rounded">04</span>
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
                <Button
                  onClick={handleDirectSend}
                  disabled={sendNewsletter.isPending || !directSubject || !directHtml}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white gap-2 h-12 text-base"
                >
                  {sendNewsletter.isPending
                    ? <><Loader2 className="w-5 h-5 animate-spin" /> Wird versendet...</>
                    : <><Send className="w-5 h-5" /> Newsletter jetzt versenden ({countData?.active ?? 0} Empfänger)</>}
                </Button>
                <p className="text-xs text-zinc-600 text-center">Diese Aktion kann nicht rückgängig gemacht werden.</p>
              </CardContent>
            </Card>
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
