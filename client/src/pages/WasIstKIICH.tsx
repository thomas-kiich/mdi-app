import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { ChevronLeft } from "lucide-react";

export default function WasIstKIICH() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 sticky top-0 z-40 bg-black/95 backdrop-blur">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-orange-400">Was ist KIICH?</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setLocation("/")}
            className="gap-2 text-orange-400 hover:text-orange-300"
          >
            <ChevronLeft className="w-4 h-4" />
            Zurück
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-8 text-zinc-300">
        {/* Klarstellung */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-orange-400">Klarstellung zum Angebot</h2>
          <p className="text-lg">
            KIICH ist eine digitale Plattform für Atem, Bewegungstraining und Persönlichkeitsentfaltung im Ki-Zeitalter. Das Angebot ist explizit und ausnahmslos <strong>PRIMÄRPRÄVENTIV ausgerichtet.</strong> Wir bieten wissenschaftlich fundierte Atem- und Bewegungstechniken zur Förderung Ihres grundlegenden Wohlbefindens an.
          </p>
        </section>

        {/* Was KIICH bietet */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-orange-400">Was KIICH bietet</h2>
          
          <div className="space-y-6">
            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">🫁 Atemtraining & Atemqualität</h3>
              <p className="mb-3">Wir unterstützen Sie durch gezieltes Atemtraining, Ihre Atemqualität zu verbessern und die Atemkontrolle zu optimieren. Unser Training kann fördern:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Entspannungsfähigkeit und Stressregulation</li>
                <li>Besseres Körpergefühl und Atemwahrnehmung</li>
                <li>Vitalität und Wohlbefinden</li>
                <li>Ressourcenerweiterung durch Atem- und Bewegungspädagogik</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">📊 Vitalmonitor & Selbsttracking</h3>
              <p className="mb-3">Mit unserem Vitalmonitor können Sie tägliche Vitalwerte erfassen und Ihren Fortschritt visualisieren:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Atembefindlichkeit und Bewegungsfreude</li>
                <li>Essverhalten und Ernährungsmanagement</li>
                <li>Schlafqualität und Regeneration</li>
                <li>Ganzheitliches Wohlbefinden</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">🎓 Wissenspool & Lernressourcen</h3>
              <p className="mb-3">Vertiefen Sie Ihr Verständnis durch:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Wissenschaftliche Artikel und Studien</li>
                <li>Podcast-Inhalte</li>
                <li>Trainingsempfehlungen und Techniken</li>
                <li>Hintergrundinformationen zu Atemphysiologie, Bewegungslehre und Bewusstseinsentfaltung</li>
              </ul>
            </div>

            <div className="bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
              <h3 className="text-xl font-semibold text-orange-300 mb-3">🏋️ Trainingscenter & Coaching</h3>
              <p className="mb-3">Persönlich optimiertes Training mit:</p>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Individualisierten Atem- und Stimmklangpraktiken</li>
                <li>Personalisierten Trainingsempfehlungen</li>
                <li>METHODE 36 - YOHNTRAINING (Integriertes Atem- Stimm- Farb- Bewegungskonzept)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Was KIICH NICHT ist */}
        <section className="space-y-4 bg-red-950/30 border border-red-900/50 p-6 rounded-lg">
          <h2 className="text-3xl font-bold text-red-400">Was KIICH NICHT ist</h2>
          
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">❌ Keine medizinische Behandlung</h3>
              <p className="text-sm">KIICH ersetzt <strong>keine ärztliche Beratung oder medizinische Behandlung</strong>. Wir diagnostizieren, heilen oder lindern keine Krankheiten. Bei gesundheitlichen Bedenken oder Erkrankungen konsultieren Sie <strong>vor Trainingsbeginn UNBEDINGT einen Arzt oder qualifizierten Gesundheitsfachmann</strong>.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">❌ Keine Heilversprechen</h3>
              <p className="text-sm">Wir machen <strong>keine Heilversprechen</strong> wie \"heilt Asthma\" oder \"beseitigt Angststörungen\". Unser Training ist präventiv ausgerichtet – es fördert Gesundheit und Wohlbefinden, nicht die Behandlung von Krankheiten.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-red-300 mb-2">❌ Keine Diagnose</h3>
              <p className="text-sm">KIICH stellt <strong>keine medizinischen Diagnosen</strong>. Der BOLT-Wert ist ein Indikator für Atemqualität – kein diagnostisches Instrument für Krankheiten.</p>
            </div>
          </div>
        </section>

        {/* Wissenschaftliche Grundlagen */}
        <section className="space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold text-orange-400">Wissenschaftliche und empirische Grundlagen</h2>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-400">
            <li>Atem als Grundlage biologischen Lebens</li>
            <li>Moderne Atem- und Bewegungsphysiologie – Aktuelle wissenschaftliche Erkenntnisse</li>
            <li>Jahrzehntelange Erfahrungen als Atemexperte, Musikpädagoge, Klangforscher</li>
          </ul>
        </section>

        {/* Über den Trainer */}
        <section className="space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold text-orange-400">Über den Trainer</h2>
          <p className="mb-3">Ing. Thomas Chochola ist:</p>
          <ul className="list-disc list-inside space-y-2 text-sm text-zinc-400">
            <li>Gelernter Bauingenieur für Strassen- und Brückenbau</li>
            <li>Staatlich geprüfter Trainer der Sportakademie Graz – Österreich</li>
            <li>Zertifizierter BREATHOLOGY Instructor nach Stig Steversinsen</li>
            <li>30 Jahre Klangforschung, Produktentwicklung und Unterrichtstätigkeit</li>
            <li>Spezialist für Atemtraining und Bewusstseinsförderung</li>
          </ul>
        </section>

        {/* Wichtiger Hinweis */}
        <section className="space-y-4 bg-amber-950/30 border border-amber-900/50 p-6 rounded-lg">
          <h2 className="text-3xl font-bold text-amber-400">⚠️ Wichtiger Hinweis</h2>
          <div className="space-y-3 text-sm">
            <p>
              Die Trainingsempfehlungen auf dieser Plattform basieren auf wissenschaftlichen Erkenntnissen und dienen zu Informationszwecken. Sie ersetzen <strong>keine medizinische Beratung</strong>.
            </p>
            <p>
              Bei gesundheitlichen Gegebenheiten, Bedenken oder Erkrankungen konsultieren Sie vor Trainingsbeginn <strong>UNBEDINGT einen Arzt oder qualifizierten Gesundheitsfachmann</strong>.
            </p>
            <p>
              KIICH übernimmt keine Haftung für Schäden, die durch unsachgemäße Nutzung oder Nichtbeachtung dieser Hinweise entstehen.
            </p>
          </div>
        </section>

        {/* Für wen geeignet */}
        <section className="space-y-4">
          <h2 className="text-3xl font-bold text-orange-400">Für wen ist KIICH geeignet?</h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div className="bg-green-950/30 border border-green-900/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-3">✅ Geeignet für:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Menschen, die ihre geistige, emotionale und haptische Konstitution optimieren möchten</li>
                <li>Personen, die aktiv Atem-, Bewegungs- und Bewusstseinstraining nützen möchten</li>
                <li>Menschen, die ihre Persönlichkeitsentfaltung im KI Zeitalter unterstützen möchten</li>
              </ul>
            </div>

            <div className="bg-red-950/30 border border-red-900/50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-red-400 mb-3">⚠️ Nicht geeignet / Rücksprache mit Arzt erforderlich:</h3>
              <ul className="list-disc list-inside space-y-1 text-sm text-zinc-400">
                <li>Bluthochdruck, Herzrhythmusstörungen, Herzkrankheiten</li>
                <li>Asthma, COPD, Atemwegserkrankungen</li>
                <li>Psychische Erkrankungen (Angststörungen, Depression)</li>
                <li>Vegetative Störungen, Schwindel</li>
                <li>Aktuelle medizinische Behandlung</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Datenschutz */}
        <section className="space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold text-orange-400">Datenschutz & Sicherheit</h2>
          <div className="space-y-3 text-sm">
            <p>
              KIICH verarbeitet Ihre Gesundheitsdaten (BOLT-Werte, Vitalmonitor-Einträge) sicher und DSGVO-konform. Ihre Daten werden:
            </p>
            <ul className="list-disc list-inside space-y-1 text-zinc-400">
              <li>Verschlüsselt gespeichert</li>
              <li>Nicht an Dritte weitergegeben</li>
              <li>Jederzeit auf Anfrage gelöscht</li>
              <li>Nach den aktuellen Datenschutzstandards geschützt</li>
            </ul>
          </div>
        </section>

        {/* Kontakt */}
        <section className="space-y-4 bg-zinc-900/50 p-6 rounded-lg border border-zinc-800">
          <h2 className="text-3xl font-bold text-orange-400">Kontakt & Support</h2>
          <p className="text-sm">
            Haben Sie Fragen zu KIICH oder unserem Angebot? Kontaktieren Sie uns jederzeit unter{" "}
            <a href="mailto:yohn@kiich.de" className="text-orange-400 hover:text-orange-300 underline">
              yohn@kiich.de
            </a>
          </p>
        </section>

        {/* Footer */}
        <div className="text-center text-sm text-zinc-500 pt-8 border-t border-zinc-800">
          <p>KIICH – Die Plattform für Atem- und Bewegungsvitalität sowie Bewusstseinsentwicklung im Ki-Zeitalter.</p>
        </div>
      </div>
    </div>
  );
}
