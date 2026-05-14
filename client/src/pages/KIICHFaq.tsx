import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronLeft, ChevronDown } from "lucide-react";

const faqData = [
  {
    category: "Allgemein",
    questions: [
      {
        q: "Was ist KIICH?",
        a: "KIICH ist eine digitale Plattform für Atem, Bewegungstraining und Persönlichkeitsentfaltung im Ki-Zeitalter. Das Angebot ist explizit und ausnahmslos PRIMÄRPRÄVENTIV ausgerichtet – also zur Gesundheitsförderung und Prävention, nicht zur Behandlung von Erkrankungen.",
      },
      {
        q: "Wer steht hinter KIICH?",
        a: "KIICH wurde von Ing. Thomas Chochola entwickelt, einem staatlich geprüften Trainer der Sportakademie Graz (Österreich) und zertifizierten BREATHOLOGY Instructor nach Stig Steversinsen.",
      },
      {
        q: "Ist KIICH eine App?",
        a: "Ja, KIICH ist eine Web-App, die du im Browser öffnen kannst. Sie funktioniert auf allen Geräten (Desktop, Tablet, Smartphone) und erfordert keine Installation.",
      },
      {
        q: "Kostet KIICH etwas?",
        a: "Das hängt von deinem Membership-Status ab. Kontaktiere uns unter yohn@kiich.de für aktuelle Preise und Membership-Optionen.",
      },
    ],
  },
  {
    category: "Training & BOLT",
    questions: [
      {
        q: "Was ist der BOLT-Test?",
        a: "BOLT steht für Body Oxygen Level Test. Es ist ein einfaches Messinstrument, um deine Atemhaltedauer zu bestimmen – ein Indikator für deine Atemeffizienz und Ausdauer. Je höher dein BOLT-Wert, desto besser deine Atemfähigkeit.",
      },
      {
        q: "Wie führe ich den BOLT-Test durch?",
        a: "1) Am Morgen nach dem Aufwachen im Bett auf dem Rücken liegend. 2) Dreimaliges sanftes Atmen durch die Nase. 3) Nach dem dritten Ausatmen die Nasenflügel sanft schließen. 4) Die Zeit messen, bis ein Atemreflex kommt. 5) Normal weiteatmen. Trage deinen Wert im Vitalmonitor ein.",
      },
      {
        q: "Wie oft sollte ich den BOLT-Test machen?",
        a: "Idealerweise täglich morgens nach dem Aufwachen. Dies ermöglicht dir, deinen Fortschritt zu verfolgen und dein Training entsprechend anzupassen.",
      },
      {
        q: "Ist das Atemtraining gefährlich?",
        a: "Nein, wenn es richtig durchgeführt wird. Allerdings: Bei gesundheitlichen Bedenken, Atemwegserkrankungen oder anderen Erkrankungen konsultiere UNBEDINGT vor Trainingsbeginn einen Arzt.",
      },
    ],
  },
  {
    category: "Gesundheit & Sicherheit",
    questions: [
      {
        q: "Kann KIICH meine Krankheit heilen?",
        a: "Nein. KIICH ist ein Angebot zur Gesundheitsförderung und Primärprävention, keine Therapie oder Heilkunde. Es ersetzt keine medizinische Beratung oder Behandlung.",
      },
      {
        q: "Für wen ist KIICH geeignet?",
        a: "KIICH ist geeignet für gesunde Menschen zur Gesundheitsförderung, Sportler zur Leistungsoptimierung und Menschen mit Interesse an Atemtraining. NICHT geeignet für die Behandlung von Erkrankungen oder als Ersatz für medizinische Therapie.",
      },
      {
        q: "Kann ich KIICH während der Schwangerschaft nutzen?",
        a: "Nur mit ausdrücklicher ärztlicher Freigabe. Schwangere sollten vor Trainingsbeginn ihren Arzt konsultieren.",
      },
      {
        q: "Was soll ich tun, wenn ich während des Trainings Schwindel oder Atemnot verspüre?",
        a: "Stoppe sofort das Training und atme normal. Wenn die Symptome anhalten, konsultiere einen Arzt. Dies kann ein Zeichen sein, dass das Training nicht für dich geeignet ist.",
      },
    ],
  },
  {
    category: "Datenschutz & Technisch",
    questions: [
      {
        q: "Sind meine Daten sicher?",
        a: "Ja. KIICH ist vollständig DSGVO-konform. Alle Daten werden verschlüsselt übertragen und gespeichert. Wir geben deine Daten nicht an Dritte weiter.",
      },
      {
        q: "Kann ich meine Daten exportieren?",
        a: "Ja, du kannst deine Daten jederzeit exportieren oder löschen. Kontaktiere uns unter yohn@kiich.de für technische Unterstützung.",
      },
      {
        q: "Welche Browser werden unterstützt?",
        a: "KIICH funktioniert auf allen modernen Browsern: Chrome, Firefox, Safari, Edge. Für beste Erfahrung empfehlen wir die neueste Version deines Browsers.",
      },
      {
        q: "Funktioniert KIICH offline?",
        a: "KIICH benötigt eine Internetverbindung. Einige Funktionen können mit Service Workers offline verfügbar sein, aber das vollständige Erlebnis erfordert Internet.",
      },
    ],
  },
];

export default function KIICHFaq() {
  const [, setLocation] = useLocation();
  const [expandedIndex, setExpandedIndex] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedIndex(expandedIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Häufig gestellte Fragen</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="space-y-12">
          {faqData.map((section, sectionIdx) => (
            <section key={sectionIdx} className="space-y-4">
              <h2 className="text-2xl font-bold text-cyan-500">{section.category}</h2>
              <div className="space-y-3">
                {section.questions.map((item, itemIdx) => {
                  const id = `${sectionIdx}-${itemIdx}`;
                  const isExpanded = expandedIndex === id;

                  return (
                    <div
                      key={id}
                      className="border border-zinc-800 rounded-lg overflow-hidden hover:border-zinc-700 transition"
                    >
                      <button
                        onClick={() => toggleExpand(id)}
                        className="w-full px-6 py-4 flex items-center justify-between bg-zinc-900/50 hover:bg-zinc-900 transition text-left"
                      >
                        <h3 className="font-semibold text-white">{item.q}</h3>
                        <ChevronDown
                          className={`w-5 h-5 text-zinc-500 transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>
                      {isExpanded && (
                        <div className="px-6 py-4 bg-background border-t border-zinc-800">
                          <p className="text-zinc-300 leading-relaxed">{item.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          ))}
        </div>

        {/* Contact CTA */}
        <section className="mt-16 p-8 bg-zinc-900/50 border border-zinc-800 rounded-lg text-center space-y-4">
          <h3 className="text-xl font-bold">Deine Frage ist nicht dabei?</h3>
          <p className="text-zinc-400">
            Kontaktiere uns unter <a href="mailto:yohn@kiich.de" className="text-cyan-500 hover:text-cyan-400">yohn@kiich.de</a>
          </p>
        </section>
      </div>
    </div>
  );
}
