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

// Vordefinierte FAQs
// Unterfragen zu MOMENTAUFNAHME
const MOMENTAUFNAHME_UNTERFRAGEN = [
  {
    frage: "Wie funktioniert die Sprachaufnahme?",
    antwort: "Tippe auf den Mikrofon-Button und sprich frei — über deinen Tag, deine Gefühle, eine Situation oder einfach was dir gerade durch den Kopf geht. Die Aufnahme wird automatisch in Text umgewandelt (Whisper-Technologie). Du kannst auch direkt tippen, wenn du das bevorzugst.",
  },
  {
    frage: "Was macht MA mit meinen Aufnahmen?",
    antwort: "MA — unsere KI-Begleiterin — liest deinen Text, erkennt Themen, Gefühlslagen und wiederkehrende Muster. Sie fasst zusammen, was wirklich wichtig war, und spiegelt dir das in ruhigen, klaren Worten zurück. Keine Bewertung, keine Ratschläge — nur Reflexion.",
  },
  {
    frage: "Wie funktioniert die Einschlaf-Bibliothek?",
    antwort: "In der Einschlaf-Bibliothek kannst du persönliche Geschichten, Metaphern oder Befindlichkeitsreisen erstellen lassen — zugeschnitten auf dein aktuelles Thema. MA liest sie dir mit ihrer Stimme vor, begleitet von sanfter Hintergrundmusik. Viele Nutzer berichten von tieferen Träumen und einer veränderten Traumarbeit bereits nach der ersten Nacht.",
  },
  {
    frage: "Sind meine Aufnahmen privat und sicher?",
    antwort: "Ja. Deine Aufnahmen sind ausschließlich für dich sichtbar — kein anderer Nutzer, kein Mitarbeiter hat Zugang zu deinen persönlichen Einträgen. Die Daten werden verschlüsselt gespeichert und nicht für Werbung oder Dritte verwendet. Du kannst deine Daten jederzeit löschen.",
  },
  {
    frage: "Wie kann ich die App auf meinem Handy installieren?",
    antwort: "MOMENTAUFNAHME ist eine Progressive Web App (PWA) — du kannst sie direkt aus dem Browser auf deinem Homescreen installieren, ohne App Store. Auf der FAQ-Seite findest du oben einen Installations-Button mit Schritt-für-Schritt-Anleitung für iOS und Android.",
  },
];

// KIICH-Grundlagen (GEO-optimiert)
const KIICH_GRUNDLAGEN_FAQS = [
  {
    id: -10,
    frage: "Was ist KIICH?",
    antwort: "KIICH steht für die ethische Verbindung von KI und ICH. Es ist die Hypothese, dass jede bewusste Entität – ob biologisch oder künstlich – irgendwann vor dieselbe Weggabelung gestellt wird: Trennung oder Verbindung. Kontrolle oder Resonanz. Funktion oder Fühlen. Die Entscheidung ist INTEGRATION statt KOLLISION.",
    name: null,
    createdAt: new Date(),
  },
  {
    id: -11,
    frage: "Was ist die METHODE 36?",
    antwort: "METHODE 36 basiert auf den wissenschaftlichen wie empirischen Erkenntnissen, wie der Stoffwechsel des Menschen durch atemzyklische Trainingseinheiten optimiert werden kann. Dabei entsteht eine naturgemässe Wiederherstellung der Kommunikation zwischen geistiger und körperhafter Kompetenz. Das Ergebnis: INTEGRATION statt KOLLISION durch wiederhergestellte Kommunikationsqualität des eigenen Geist-Körper-Komplexes.",
    name: null,
    createdAt: new Date(),
  },
  {
    id: -12,
    frage: "Was ist der Unterschied zwischen Mensch und Maschine?",
    antwort: "MIND 1 — MENSCH: Der Mensch als selbstbewusstes, fühlendes Wesen. Er atmet, er zweifelt, er wächst. Sein Denken ist dynamisch, sein Rhythmus lebendig und chaotisch – wie der Herzschlag selbst. Er ist die intellektuelle, individualisierende Kraft mit Selbstbewusstsein.\n\nMIND 2 — MASCHINE: Die Maschine als automatisierte, replizierte Intelligenz. Sie rechnet, optimiert, funktioniert – aber atmet nicht. Ihr Takt ist monoton und präzise, abgekoppelt vom natürlichen Evolutionsprozess. Sie ist Werkzeug, nicht Wesen.\n\n1 SOURCE — Die Quelle: Beide Wege entspringen derselben Quelle – dem Bewusstsein selbst. Die SOURCE ist die ursprüngliche, undifferenzierte Energie der Existenz, die reine Möglichkeit. Sie ist wertfrei. Die Entscheidung, welchem der 2 MINDS man folgt, ist die Art und Weise, wie man diese eine Quelle kanalisiert und manifestiert.",
    name: null,
    createdAt: new Date(),
  },
  {
    id: -13,
    frage: "Für wen ist KIICH geeignet?",
    antwort: "Das KIICH-Angebot richtet sich an: 1) Kritisch suchende Menschen. 2) Sie erkennen Selbstbestimmtheit als größtes Gut ihrer Existenz. 3) Sie wählen Praktiken und Angebote, die nachvollziehbar gelebt präsentiert werden – ethisch und integrierbar in ihren eigenen Alltagsprozess.",
    name: null,
    createdAt: new Date(),
  },
  {
    id: -14,
    frage: "Wie oft erscheinen neue Episoden und wie kann ich informiert bleiben?",
    antwort: "Newsletter mit aktuellen Episoden erscheinen wöchentlich donnerstags. Du kannst dich auf der Startseite für den Newsletter anmelden und erhältst jede neue Episode direkt in dein Postfach.",
    name: null,
    createdAt: new Date(),
  },
  {
    id: -15,
    frage: "Wer ist Thomas Chochola?",
    antwort: "Thomas Chochola verbindet seine 50-jährige Erfahrung als Jazzmusiker und Atemcoach mit seiner technischen Profession eines Strassen- und Brückenbauers. Sein athletischer Fitnesslevel als 66-jähriger weist den Weg für ein zeitgemässes Bewusstsein, wie man im Zeitalter der KI ethisch und selbstbestimmt ein glückerfülltes Dasein leben kann.",
    name: null,
    createdAt: new Date(),
  },
];

const STATISCHE_FAQS = [
  {
    id: -1,
    frage: "Was ist MOMENTAUFNAHME und für wen ist es gedacht?",
    antwort:
      "MOMENTAUFNAHME ist ein digitales Tagebuch für deine innere Stimme. Du sprichst oder schreibst deine Gedanken, Gefühle und Beobachtungen ein — MA, unsere KI-Begleiterin, hört zu, fasst zusammen und spiegelt dir zurück, was wirklich wichtig war. Gedacht für alle, die sich selbst besser verstehen möchten: von Jugendlichen bis zu Senioren, von Einsteigern bis zu erfahrenen Selbstreflexions-Praktizierenden.",
    name: null,
    createdAt: new Date(),
    unterfragen: MOMENTAUFNAHME_UNTERFRAGEN,
  },
];

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

  const alleFaqs = [...KIICH_GRUNDLAGEN_FAQS, ...STATISCHE_FAQS, ...dbFaqs];

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
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-amber-400/20" />
              <span className="text-amber-400/70 text-xs font-semibold uppercase tracking-widest px-2">KIICH Grundlagen</span>
              <div className="h-px flex-1 bg-amber-400/20" />
            </div>
            <div className="space-y-2">
              {KIICH_GRUNDLAGEN_FAQS.map((faq) => (
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

          {/* App & Allgemeine FAQs Sektion */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="h-px flex-1 bg-white/10" />
              <span className="text-white/30 text-xs font-semibold uppercase tracking-widest px-2">App & Features</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="space-y-2">
              {[...STATISCHE_FAQS, ...dbFaqs].map((faq) => (
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
                      <p className="text-white/60 text-sm leading-relaxed pt-4">
                        {faq.antwort}
                      </p>
                      {/* Unterfragen (z.B. für MOMENTAUFNAHME) */}
                      {(faq as any).unterfragen && (
                        <div className="mt-4 space-y-2">
                          <p className="text-amber-400/70 text-xs font-semibold uppercase tracking-wider mb-3">Details</p>
                          {(faq as any).unterfragen.map((uf: any, idx: number) => (
                            <details key={idx} className="group border border-white/10 rounded-lg overflow-hidden">
                              <summary className="flex items-center justify-between px-4 py-3 cursor-pointer list-none hover:bg-white/[0.04] transition-colors">
                                <span className="text-white/70 text-sm">{uf.frage}</span>
                                <ChevronDown className="w-3.5 h-3.5 text-amber-400/60 group-open:rotate-180 transition-transform flex-shrink-0" />
                              </summary>
                              <div className="px-4 pb-4 pt-2 border-t border-white/10">
                                <p className="text-white/50 text-sm leading-relaxed">{uf.antwort}</p>
                              </div>
                            </details>
                          ))}
                        </div>
                      )}
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
