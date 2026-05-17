import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { ChevronDown, ChevronUp, MessageCircleQuestion, Send, Loader2, CheckCircle2, Smartphone, Globe, Zap, Shield, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Link } from "wouter";

// PWA Install Button
function InstallButton() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [installed, setInstalled] = useState(false);
  const [deviceType, setDeviceType] = useState<'ios' | 'android' | 'desktop' | 'other'>('other');
  const [showGuide, setShowGuide] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent;
    const ios = /iphone|ipad|ipod/i.test(ua);
    const android = /android/i.test(ua);
    const mobile = ios || android;
    if (ios) setDeviceType('ios');
    else if (android) setDeviceType('android');
    else if (!mobile) setDeviceType('desktop');
    else setDeviceType('other');

    const handler = (e: Event) => { e.preventDefault(); setDeferredPrompt(e); };
    window.addEventListener("beforeinstallprompt", handler);
    if (window.matchMedia("(display-mode: standalone)").matches) setInstalled(true);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      // Nativer Browser-Prompt verfügbar (Chrome/Edge Android + Desktop)
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") setInstalled(true);
      setDeferredPrompt(null);
    } else {
      // Manuelle Anleitung anzeigen
      setShowGuide(prev => !prev);
    }
  };

  // Anleitungen je Gerät
  const guides: Record<string, { title: string; steps: string[] }> = {
    ios: {
      title: 'Installation auf iPhone / iPad (Safari):',
      steps: [
        'Öffne www.kiich.de im Safari-Browser (nicht Chrome oder Firefox).',
        'Tippe unten auf das Teilen-Symbol (Quadrat mit Pfeil nach oben).',
        '"Zum Home-Bildschirm" wählen und mit "Hinzufügen" bestätigen.',
        'Das KIICH-Icon erscheint auf deinem Homescreen – fertig!',
      ],
    },
    android: {
      title: 'Installation auf Android (Chrome):',
      steps: [
        'Öffne www.kiich.de in Chrome.',
        'Tippe oben rechts auf die drei Punkte (⋮).',
        '"App installieren" oder "Zum Startbildschirm hinzufügen" wählen.',
        'Mit "Installieren" bestätigen – das KIICH-Icon erscheint auf deinem Homescreen.',
      ],
    },
    desktop: {
      title: 'Installation am Computer (Chrome / Edge):',
      steps: [
        'Öffne www.kiich.de in Chrome oder Microsoft Edge.',
        'Klicke in der Adressleiste rechts auf das Install-Symbol (⊕ oder Computer-Icon).',
        'Alternativ: Klicke oben rechts auf die drei Punkte → "KIICH installieren".',
        'Mit "Installieren" bestätigen – KIICH öffnet sich als eigenes Fenster ohne Browser-Leiste.',
      ],
    },
    other: {
      title: 'App installieren:',
      steps: [
        'Öffne www.kiich.de in Chrome oder Microsoft Edge (empfohlen).',
        'Klicke auf das Install-Icon in der Adressleiste oder im Browser-Menü.',
        'Mit "Installieren" bestätigen.',
      ],
    },
  };

  const guide = guides[deviceType];
  const buttonLabel = deviceType === 'ios' ? 'Anleitung für iPhone / iPad'
    : deviceType === 'desktop' ? 'App am Computer installieren'
    : 'App jetzt installieren';

  if (installed) return (
    <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
      <Zap className="w-4 h-4" /> KIICH ist bereits installiert
    </div>
  );

  return (
    <div className="space-y-3">
      <button onClick={handleInstall}
        className="flex items-center gap-2 px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-black font-semibold text-sm tracking-wide uppercase transition-all duration-200 rounded-sm">
        <Download className="w-4 h-4" />
        {deferredPrompt ? 'App jetzt installieren' : buttonLabel}
      </button>
      {showGuide && (
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-2 text-sm text-white/60">
          <p className="font-semibold text-white mb-3">{guide.title}</p>
          {guide.steps.map((step, i) => (
            <div key={i} className="flex items-start gap-3">
              <span className="bg-amber-400 text-black text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5">{i+1}</span>
              <span>{step}</span>
            </div>
          ))}
          {deviceType === 'desktop' && (
            <p className="text-amber-400/60 text-xs mt-3 pt-3 border-t border-white/10">
              Tipp: Funktioniert auch in Firefox – dort unter Lesezeichen → "Diese Seite als App öffnen".
            </p>
          )}
        </div>
      )}
    </div>
  );
}

export default function FAQ() {
  const [offeneId, setOffeneId] = useState<number | null>(null);
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formFrage, setFormFrage] = useState("");
  const [gesendet, setGesendet] = useState(false);
  const [einwilligung, setEinwilligung] = useState(false);

  const { data: dbFaqs = [] } = trpc.faq.getOeffentlicheFaqs.useQuery();

  const frageEinreichenMutation = trpc.faq.frageEinreichen.useMutation({
    onSuccess: () => {
      setGesendet(true);
      setFormName("");
      setFormEmail("");
      setFormFrage("");
    },
    onError: (err) => {
      toast.error(err.message || "Fehler beim Senden. Bitte erneut versuchen.");
    },
  });

  // Kategorien: KIICH-Grundlagen (erste 6 FAQs aus DB) vs. App & Features (Rest)
  // Die DB liefert alle öffentlichen FAQs – wir zeigen sie alle in einer einzigen Liste
  const grundlagenFaqs = dbFaqs.filter(f =>
    ["Was ist KIICH?", "Was ist die METHODE 36?", "Was ist der Unterschied zwischen Mensch und Maschine?", "Für wen ist KIICH geeignet?", "Wie oft erscheinen neue Episoden und wie kann ich informiert bleiben?", "Wer ist Thomas Chochola?"].includes(f.frage)
  );
  const appFaqs = dbFaqs.filter(f => !grundlagenFaqs.includes(f));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formFrage.trim().length < 10) {
      toast.error("Bitte mindestens 10 Zeichen eingeben.");
      return;
    }
    if (!einwilligung) {
      toast.error("Bitte stimme der Einwilligung zu.");
      return;
    }
    frageEinreichenMutation.mutate({
      frage: formFrage.trim(),
      name: formName.trim() || undefined,
      email: formEmail.trim() || undefined,
    });
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      {/* Header */}
      <div className="border-b border-white/10 px-4 py-4 flex items-center justify-between">
        <Link href="/">
          <span className="text-amber-400 font-bold text-lg cursor-pointer hover:text-amber-300 transition-colors">
            ← kiich.de
          </span>
        </Link>
        <span className="text-white/40 text-sm">FAQ</span>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Titel */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 border border-amber-400/30 rounded-full px-4 py-1.5 mb-4">
            <MessageCircleQuestion className="w-4 h-4 text-amber-400" />
            <span className="text-amber-400 text-sm font-medium">Häufige Fragen</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-3">
            Fragen & Antworten
          </h1>
          <p className="text-white/50 text-sm leading-relaxed">
            Alles was du über KIICH wissen möchtest.
            <br />
            Deine Frage ist nicht dabei? Stell sie uns unten.
          </p>
        </div>

        {/* App installieren – prominenter CTA */}
        <div className="border border-amber-400/20 rounded-2xl bg-amber-400/5 p-5 mb-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-5">
          <div className="flex items-start gap-4">
            <div className="bg-amber-400/10 border border-amber-400/20 rounded-lg p-2.5 shrink-0">
              <Globe className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-white font-semibold mb-1">KIICH als App auf deinem Homescreen</p>
              <p className="text-white/40 text-sm">Kein App Store. Automatische Updates. Funktioniert wie eine native App.</p>
            </div>
          </div>
          <InstallButton />
        </div>

        {/* Was ist eine PWA? */}
        <div className="border border-white/10 rounded-2xl bg-white/[0.03] p-5 mb-10">
          <div className="flex items-center gap-2 mb-4">
            <Smartphone className="w-4 h-4 text-amber-400" />
            <h2 className="text-white font-semibold text-sm tracking-widest uppercase">Was ist eine PWA?</h2>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            KIICH ist eine <strong className="text-white">Progressive Web App (PWA)</strong> – eine moderne Zwischenform zwischen Website und nativer App. Du installierst sie direkt aus dem Browser, ohne App Store.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="py-2 pr-4 text-white/40 font-normal">Merkmal</th>
                  <th className="py-2 pr-4 text-white/40 font-normal text-center">Native App</th>
                  <th className="py-2 pr-4 text-white/40 font-normal text-center">Website</th>
                  <th className="py-2 text-amber-400 font-semibold text-center">KIICH (PWA)</th>
                </tr>
              </thead>
              <tbody className="text-white/60">
                {[
                  ["Homescreen-Icon", "✅", "❌", "✅"],
                  ["Offline nutzbar", "✅", "❌", "✅"],
                  ["Push-Nachrichten", "✅", "❌", "✅"],
                  ["App Store nötig", "✅", "❌", "❌"],
                  ["Auto-Updates", "❌", "✅", "✅"],
                  ["Kosten", "Hoch", "Mittel", "Mittel"],
                ].map(([label, native, web, kiich]) => (
                  <tr key={label} className="border-b border-white/5">
                    <td className="py-2 pr-4">{label}</td>
                    <td className="py-2 pr-4 text-center">{native}</td>
                    <td className="py-2 pr-4 text-center">{web}</td>
                    <td className="py-2 text-center text-amber-400 font-semibold">{kiich}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-6 mb-16">
          {/* KIICH-Grundlagen Sektion */}
          {grundlagenFaqs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-amber-400/20" />
                <span className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest px-2">KIICH Grundlagen</span>
                <div className="h-px flex-1 bg-amber-400/20" />
              </div>
              <div className="space-y-2">
                {grundlagenFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-amber-400/20 rounded-xl overflow-hidden bg-amber-400/[0.03] hover:bg-amber-400/[0.06] transition-colors"
                  >
                    <button
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                      onClick={() => setOffeneId(offeneId === faq.id ? null : faq.id)}
                    >
                      <span className="text-white/90 font-medium text-sm leading-relaxed">
                        {faq.frage}
                      </span>
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">
                        {offeneId === faq.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>
                    {offeneId === faq.id && faq.antwort && (
                      <div className="px-5 pb-5 border-t border-amber-400/10">
                        <p className="text-white/60 text-sm leading-relaxed pt-4 whitespace-pre-line">
                          {faq.antwort}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* App & Features Sektion */}
          {appFaqs.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="h-px flex-1 bg-white/10" />
                <span className="text-white/30 text-xs font-semibold uppercase tracking-widest px-2">App & Features</span>
                <div className="h-px flex-1 bg-white/10" />
              </div>
              <div className="space-y-2">
                {appFaqs.map((faq) => (
                  <div
                    key={faq.id}
                    className="border border-white/10 rounded-xl overflow-hidden bg-white/[0.03] hover:bg-white/[0.05] transition-colors"
                  >
                    <button
                      className="w-full text-left px-5 py-4 flex items-start justify-between gap-3"
                      onClick={() => setOffeneId(offeneId === faq.id ? null : faq.id)}
                    >
                      <span className="text-white/90 font-medium text-sm leading-relaxed">
                        {faq.frage}
                      </span>
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">
                        {offeneId === faq.id ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    </button>
                    {offeneId === faq.id && faq.antwort && (
                      <div className="px-5 pb-5 border-t border-white/10">
                        <p className="text-white/60 text-sm leading-relaxed pt-4 whitespace-pre-line">
                          {faq.antwort}
                        </p>
                        {faq.name && (
                          <p className="text-white/30 text-xs mt-3">
                            Gefragt von: {faq.name}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Frage stellen */}
        <div className="border border-white/10 rounded-2xl p-6 bg-white/[0.03]">
          <h2 className="text-white font-semibold text-lg mb-1 flex items-center gap-2">
            <MessageCircleQuestion className="w-5 h-5 text-amber-400" />
            Deine Frage stellen
          </h2>
          <p className="text-white/40 text-sm mb-6">
            Wichtige grundlegende Fragen werden hier veröffentlicht. Eine vollständige Anonymisierung vor Veröffentlichung wird durchgeführt.
          </p>

          {gesendet ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
              <p className="text-white/80 font-medium">Danke für deine Frage!</p>
              <p className="text-white/40 text-sm">
                Wir melden uns so bald wie möglich.
              </p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2 border-white/20 text-white/60 hover:text-white"
                onClick={() => setGesendet(false)}
              >
                Weitere Frage stellen
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">
                    Name (optional)
                  </label>
                  <Input
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="Dein Name"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-400/50"
                  />
                </div>
                <div>
                  <label className="text-white/50 text-xs mb-1.5 block">
                    E-Mail (optional)
                  </label>
                  <Input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="fuer@antwort.de"
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-400/50"
                  />
                </div>
              </div>
              <div>
                <label className="text-white/50 text-xs mb-1.5 block">
                  Deine Frage *
                </label>
                <Textarea
                  value={formFrage}
                  onChange={(e) => setFormFrage(e.target.value)}
                  placeholder="Was möchtest du wissen?"
                  rows={4}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/20 focus:border-amber-400/50 resize-none"
                />
                <p className="text-white/20 text-xs mt-1 text-right">
                  {formFrage.length}/1000
                </p>
              </div>
              {/* Einwilligungs-Checkbox */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div
                  onClick={() => setEinwilligung(!einwilligung)}
                  className={`mt-0.5 w-4 h-4 shrink-0 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                    einwilligung
                      ? 'bg-amber-400 border-amber-400'
                      : 'bg-white/5 border-white/20 group-hover:border-amber-400/50'
                  }`}
                >
                  {einwilligung && (
                    <svg className="w-2.5 h-2.5 text-black" fill="none" viewBox="0 0 10 8">
                      <path d="M1 4l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <span
                  onClick={() => setEinwilligung(!einwilligung)}
                  className="text-white/50 text-xs leading-relaxed select-none cursor-pointer hover:text-white/70 transition-colors"
                >
                  Ich bin damit einverstanden, dass meine Frage anonymisiert und auf dieser Seite veröffentlicht werden kann.
                </span>
              </label>
              <Button
                type="submit"
                disabled={frageEinreichenMutation.isPending || formFrage.trim().length < 10 || !einwilligung}
                className="w-full bg-amber-400 hover:bg-amber-300 text-black font-semibold cursor-pointer disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-amber-400 transition-all duration-200"
              >
                {frageEinreichenMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Wird gesendet...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Frage absenden
                  </>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
