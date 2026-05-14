import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft, ChevronDown } from "lucide-react";
import { useState } from "react";

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "general" | "training" | "health" | "data";
}

const faqItems: FAQItem[] = [
  // General
  {
    id: "q1",
    category: "general",
    question: "Was ist KIICH?",
    answer: "KIICH ist eine digitale Plattform für Atem, Bewegungstraining und Persönlichkeitsentfaltung im Ki-Zeitalter. Das Angebot ist explizit und ausnahmslos PRIMÄRPRÄVENTIV ausgerichtet – das bedeutet, wir fördern Ihre Gesundheit und Ihr Wohlbefinden, ersetzen aber keine medizinische Behandlung.",
  },
  {
    id: "q2",
    category: "general",
    question: "Wer steht hinter KIICH?",
    answer: "KIICH wurde von Ing. Thomas Chochola entwickelt, einem staatlich geprüften Trainer der Sportakademie Graz (Österreich) und zertifizierten BREATHOLOGY Instructor nach Stig Steversinsen. Thomas hat über 30 Jahre Erfahrung in Klangforschung, Produktentwicklung und Atemtraining.",
  },
  {
    id: "q3",
    category: "general",
    question: "Ist KIICH ein medizinisches Produkt?",
    answer: "Nein. KIICH ist ein Gesundheitsförderungs- und Präventionsangebot, keine medizinische Behandlung. Wir diagnostizieren, heilen oder lindern keine Krankheiten. Bei gesundheitlichen Bedenken konsultieren Sie bitte einen Arzt.",
  },
  {
    id: "q4",
    category: "general",
    question: "Kann KIICH meine Krankheit heilen?",
    answer: "Nein. KIICH macht keine Heilversprechen. Unser Training ist präventiv ausgerichtet – es fördert Ihre Atemqualität, Vitalität und Ihr Wohlbefinden. Für die Behandlung von Krankheiten benötigen Sie ärztliche Beratung.",
  },

  // Training
  {
    id: "q5",
    category: "training",
    question: "Was ist die BOLT-Messung?",
    answer: "BOLT steht für Body Oxygen Level Test. Es ist eine einfache Messung Ihrer Atemkontrolle – Sie messen, wie lange Sie nach dem Ausatmen die Luft anhalten können, bis der erste Atemreflex kommt. Der BOLT-Wert ist ein Indikator für Ihre Atemqualität und Konstitution.",
  },
  {
    id: "q6",
    category: "training",
    question: "Wie oft sollte ich trainieren?",
    answer: "Das hängt von Ihrem Ziel und Ihrer aktuellen Konstitution ab. Wir empfehlen, mit regelmäßigem Training zu beginnen – idealerweise täglich oder mehrmals pro Woche. Der Vitalmonitor hilft Ihnen, Ihren Fortschritt zu verfolgen.",
  },
  {
    id: "q7",
    category: "training",
    question: "Was ist METHODE 36 - YOHNTRAINING?",
    answer: "METHODE 36 ist ein integriertes Atem-, Stimm-, Farb- und Bewegungskonzept, das Ihre Atemqualität, Ihre Stimme und Ihr Wohlbefinden ganzheitlich fördert. YOHN steht für dieses umfassende Trainingskonzept.",
  },
  {
    id: "q8",
    category: "training",
    question: "Kann ich online trainieren?",
    answer: "Ja. KIICH ist eine digitale Plattform – Sie können jederzeit und überall trainieren. Das Trainingscenter, der Vitalmonitor und der Wissenspool sind vollständig online verfügbar.",
  },

  // Health
  {
    id: "q9",
    category: "health",
    question: "Für wen ist KIICH geeignet?",
    answer: "KIICH ist geeignet für Menschen, die ihre Atemqualität, ihr Wohlbefinden und ihre Persönlichkeitsentfaltung fördern möchten. Besonders geeignet für Sportler, Stressabbau-Interessierte und alle, die aktiv an ihrer Gesundheit arbeiten möchten.",
  },
  {
    id: "q10",
    category: "health",
    question: "Wann sollte ich NICHT mit KIICH trainieren?",
    answer: "Sie sollten vor Trainingsbeginn einen Arzt konsultieren, wenn Sie: Bluthochdruck, Herzrhythmusstörungen oder Herzkrankheiten haben; Asthma, COPD oder Atemwegserkrankungen haben; psychische Erkrankungen wie Angststörungen oder Depression haben; vegetative Störungen oder Schwindel erleben; oder sich aktuell in medizinischer Behandlung befinden.",
  },
  {
    id: "q11",
    category: "health",
    question: "Kann ich KIICH nutzen, wenn ich Medikamente nehme?",
    answer: "Das hängt von Ihren Medikamenten und Ihrer Gesundheitssituation ab. Konsultieren Sie vor Trainingsbeginn Ihren Arzt oder Ihre Ärztin, um sicherzustellen, dass KIICH für Sie sicher ist.",
  },
  {
    id: "q12",
    category: "health",
    question: "Was ist der Vitalmonitor?",
    answer: "Der Vitalmonitor ist ein persönliches Tracking-Tool, mit dem Sie täglich Ihre Vitalwerte erfassen: Atembefindlichkeit, Essverhalten, Schlafqualität und ganzheitliches Wohlbefinden. So können Sie Ihren Fortschritt visualisieren und verstehen.",
  },

  // Data & Privacy
  {
    id: "q13",
    category: "data",
    question: "Wie sicher sind meine Daten bei KIICH?",
    answer: "Ihre Daten werden verschlüsselt gespeichert, nicht an Dritte weitergegeben und nach den aktuellen Datenschutzstandards (DSGVO) geschützt. Sie können Ihre Daten jederzeit auf Anfrage löschen.",
  },
  {
    id: "q14",
    category: "data",
    question: "Welche Daten erfasst KIICH?",
    answer: "KIICH erfasst Ihre Gesundheitsdaten wie BOLT-Werte, Vitalmonitor-Einträge (Atemqualität, Essverhalten, Schlaf, Wohlbefinden) und Trainingsfortschritt. Diese Daten sind persönlich und werden sicher gespeichert.",
  },
  {
    id: "q15",
    category: "data",
    question: "Gibt KIICH meine Daten an Dritte weiter?",
    answer: "Nein. Ihre Daten werden nicht an Dritte weitergegeben. Sie sind Ihr Eigentum und bleiben privat.",
  },
  {
    id: "q16",
    category: "data",
    question: "Kann ich meine Daten löschen?",
    answer: "Ja. Sie können jederzeit Ihre Daten auf Anfrage löschen. Kontaktieren Sie uns unter yohn@kiich.de für Datenlöschanfragen.",
  },
];

const categories = [
  { id: "general", label: "Allgemein", color: "text-cyan-400" },
  { id: "training", label: "Training", color: "text-orange-400" },
  { id: "health", label: "Gesundheit", color: "text-green-400" },
  { id: "data", label: "Datenschutz", color: "text-purple-400" },
];

export default function KIICHFaq() {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("general");

  const filteredItems = faqItems.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Häufig gestellte Fragen</h1>
          <Link href="/">
            <Button variant="ghost" size="sm" className="text-slate-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        {/* Intro */}
        <section className="mb-12">
          <p className="text-lg text-slate-300 leading-relaxed">
            Hier findest du Antworten auf häufig gestellte Fragen zu KIICH. Wähle eine Kategorie oder durchsuche alle Fragen.
          </p>
        </section>

        {/* Category Filter */}
        <section className="mb-8">
          <div className="flex flex-wrap gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-lg font-semibold transition ${
                  selectedCategory === cat.id
                    ? "bg-slate-700 text-white border border-slate-600"
                    : "bg-slate-800 text-slate-300 border border-slate-700 hover:border-slate-600"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* FAQ Items */}
        <section className="space-y-4">
          {filteredItems.map((item) => {
            const category = categories.find((c) => c.id === item.category);
            const isExpanded = expandedId === item.id;

            return (
              <div
                key={item.id}
                className="border border-slate-700 rounded-lg overflow-hidden hover:border-slate-600 transition"
              >
                <button
                  onClick={() => setExpandedId(isExpanded ? null : item.id)}
                  className="w-full px-6 py-4 flex items-center justify-between bg-slate-800/50 hover:bg-slate-800 transition text-left"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-mono uppercase tracking-widest ${category?.color}`}>
                        {category?.label}
                      </span>
                    </div>
                    <h3 className="font-semibold text-white text-lg">{item.question}</h3>
                  </div>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 ml-4 transition-transform ${
                      isExpanded ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isExpanded && (
                  <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-700">
                    <p className="text-slate-300 leading-relaxed">{item.answer}</p>
                  </div>
                )}
              </div>
            );
          })}
        </section>

        {/* Contact */}
        <section className="mt-16 p-8 bg-slate-800/50 border border-slate-700 rounded-lg text-center">
          <h2 className="text-xl font-bold text-white mb-3">Hast du weitere Fragen?</h2>
          <p className="text-slate-300 mb-6">
            Kontaktiere uns jederzeit unter{" "}
            <a href="mailto:yohn@kiich.de" className="text-cyan-400 hover:text-cyan-300 font-semibold">
              yohn@kiich.de
            </a>
          </p>
          <Link href="/was-ist-kiich">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              Mehr über KIICH erfahren
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
