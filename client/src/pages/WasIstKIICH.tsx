import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function WasIstKIICH() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 z-40 bg-background/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Was ist KIICH?</h1>
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
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-12">
        {/* Intro */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold">Die Plattform für deine Persönlichkeitsentfaltung</h2>
          <p className="text-lg text-zinc-400">
            KIICH ist eine digitale Plattform für Atem, Bewegungstraining und Persönlichkeitsentfaltung im Ki-Zeitalter. Das Angebot ist explizit und ausnahmslos <strong>PRIMÄRPRÄVENTIV</strong> ausgerichtet.
          </p>
        </section>

        {/* Was KIICH bietet */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Was KIICH bietet</h3>
          <div className="space-y-3 text-zinc-300">
            <div>
              <h4 className="font-semibold text-white mb-1">🫁 Atemtraining</h4>
              <p>Wissenschaftlich fundierte Atemtechniken basierend auf der Buteyko-Methode und dem BOLT-Test zur Verbesserung deiner Atemfähigkeit und Ausdauer.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">📊 Vitalmonitor</h4>
              <p>Persönliches Tracking deiner Vitalwerte, Essverhalten und Trainingsfortschritt – täglich aktualisierbar für kontinuierliche Selbstreflexion.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">🎓 Trainingscenter</h4>
              <p>Strukturierte Trainingsmodule mit BOLT-Messung, Atemkontrolle und personalisierten Trainingsempfehlungen basierend auf deinem aktuellen Level.</p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-1">📚 Wissenspool</h4>
              <p>Kuratierte Ressourcen, Podcasts und Artikel aus Thomas Chocholas Arbeit zur Vertiefung deines Verständnisses.</p>
            </div>
          </div>
        </section>

        {/* Was KIICH NICHT ist */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Was KIICH NICHT ist</h3>
          <div className="space-y-2 text-zinc-300">
            <p>❌ <strong>Keine Heilkunde</strong> – KIICH ersetzt keine medizinische Beratung oder Behandlung.</p>
            <p>❌ <strong>Keine Heilversprechen</strong> – Wir versprechen keine Heilung von Krankheiten.</p>
            <p>❌ <strong>Keine Diagnose</strong> – KIICH kann keine medizinischen Diagnosen stellen.</p>
            <p>❌ <strong>Keine Therapie</strong> – Das Angebot ist Gesundheitsförderung und Primärprävention, nicht Therapie.</p>
          </div>
        </section>

        {/* Wissenschaftliche Grundlagen */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Wissenschaftliche Grundlagen</h3>
          <div className="space-y-3 text-zinc-300">
            <p>
              KIICH basiert auf der <strong>Buteyko-Methode</strong>, entwickelt von Dr. Konstantin Buteyko, einem russischen Arzt und Atemphysiologen. Die Methode wurde durch Jahrzehnte von Forschung und praktischer Anwendung validiert.
            </p>
            <p>
              Der <strong>BOLT-Test</strong> (Body Oxygen Level Test) ist ein einfaches Messinstrument, um deine Atemhaltedauer zu bestimmen – ein Indikator für deine Atemeffizienz und Ausdauer.
            </p>
            <p>
              Die Trainingsempfehlungen stammen aus dem Buch <strong>„Erfolgsfaktor Sauerstoff"</strong> von Patrick Keown, der ein Schüler von Dr. Buteyko war.
            </p>
          </div>
        </section>

        {/* Trainer-Qualifikation */}
        <section className="space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <h3 className="text-2xl font-bold">Der Trainer hinter KIICH</h3>
          <p className="text-zinc-300">
            <strong>Ing. Thomas Chochola</strong> ist:
          </p>
          <ul className="space-y-2 text-zinc-300 ml-4">
            <li>✓ Staatlich geprüfter Trainer der Sportakademie Graz – Österreich</li>
            <li>✓ Zertifizierter BREATHOLOGY Instructor nach Stig Steversinsen</li>
            <li>✓ Spezialist für Atemtraining und Gesundheitsförderung</li>
          </ul>
        </section>

        {/* Wichtiger Hinweis */}
        <section className="space-y-4 bg-amber-900/20 border border-amber-700/50 p-6 rounded-lg">
          <h3 className="text-xl font-bold text-amber-300">⚠️ Wichtiger Hinweis</h3>
          <p className="text-zinc-300">
            KIICH ist ein Angebot zur Gesundheitsförderung und Primärprävention. Es ist <strong>NICHT</strong> geeignet als Behandlung von Erkrankungen.
          </p>
          <p className="text-zinc-300">
            <strong>Bei gesundheitlichen Bedenken oder Erkrankungen konsultieren Sie UNBEDINGT vor Trainingsbeginn einen Arzt oder Facharzt.</strong>
          </p>
        </section>

        {/* Für wen KIICH geeignet ist */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Für wen ist KIICH geeignet?</h3>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-green-400 mb-2">✓ Geeignet für:</h4>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li>• Gesunde Menschen zur Gesundheitsförderung</li>
                <li>• Sportler zur Leistungsoptimierung</li>
                <li>• Menschen mit Interesse an Atemtraining</li>
                <li>• Primärprävention und Wellness</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-red-400 mb-2">✗ NICHT geeignet für:</h4>
              <ul className="space-y-1 text-sm text-zinc-300">
                <li>• Behandlung von Erkrankungen</li>
                <li>• Ersatz für medizinische Therapie</li>
                <li>• Schwangere ohne ärztliche Freigabe</li>
                <li>• Menschen mit akuten Atemwegserkrankungen</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Datenschutz */}
        <section className="space-y-4">
          <h3 className="text-2xl font-bold">Datenschutz & Sicherheit</h3>
          <p className="text-zinc-300">
            Deine Daten sind bei uns sicher. KIICH ist vollständig DSGVO-konform und schützt deine Privatsphäre. Alle Daten werden verschlüsselt übertragen und gespeichert.
          </p>
          <p className="text-zinc-300">
            Mehr Informationen findest du in unserer <a href="/datenschutz" className="text-cyan-500 hover:text-cyan-400">Datenschutzerklärung</a>.
          </p>
        </section>

        {/* CTA */}
        <section className="text-center space-y-4 py-8">
          <h3 className="text-2xl font-bold">Bereit zu starten?</h3>
          <p className="text-zinc-400">Entdecke dein Potenzial mit KIICH.</p>
          <Button
            onClick={() => setLocation("/")}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            Zur Startseite
          </Button>
        </section>
      </div>
    </div>
  );
}
