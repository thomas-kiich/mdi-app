import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function WasIstKIICH() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-white">Was ist KIICH?</h1>
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
          <p className="text-lg text-slate-300 leading-relaxed mb-4">
            KIICH ist eine digitale Plattform für Atem, Bewegungstraining und Persönlichkeitsentfaltung im Ki-Zeitalter. Das Angebot ist explizit und ausnahmslos <span className="font-semibold text-cyan-400">PRIMÄRPRÄVENTIV ausgerichtet.</span> Wir bieten wissenschaftlich fundierte Atem- und Bewegungstechniken zur Förderung Ihres grundlegenden Wohlbefindens an.
          </p>
        </section>

        {/* Was KIICH bietet */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Was KIICH bietet</h2>
          <div className="space-y-6">
            {/* Atemtraining */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                <span className="text-2xl mr-3">🫁</span>
                Atemtraining & Atemqualität
              </h3>
              <p className="text-slate-300 mb-3">
                Wir unterstützen Sie durch gezieltes Atemtraining, Ihre Atemqualität zu verbessern und die Atemkontrolle zu optimieren. Unser Training kann fördern:
              </p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>✓ Entspannungsfähigkeit und Stressregulation</li>
                <li>✓ Besseres Körpergefühl und Atemwahrnehmung</li>
                <li>✓ Vitalität und Wohlbefinden</li>
                <li>✓ Ressourcenerweiterung durch Atem- und Bewegungspädagogik</li>
              </ul>
            </div>

            {/* Vitalmonitor */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                <span className="text-2xl mr-3">📊</span>
                Vitalmonitor & Selbsttracking
              </h3>
              <p className="text-slate-300 mb-3">
                Mit unserem Vitalmonitor können Sie tägliche Vitalwerte erfassen und Ihren Fortschritt visualisieren:
              </p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>✓ Atembefindlichkeit und Bewegungsfreude</li>
                <li>✓ Essverhalten und Ernährungsmanagement</li>
                <li>✓ Schlafqualität und Regeneration</li>
                <li>✓ Ganzheitliches Wohlbefinden</li>
              </ul>
            </div>

            {/* Wissenspool */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                <span className="text-2xl mr-3">🎓</span>
                Wissenspool & Lernressourcen
              </h3>
              <p className="text-slate-300 mb-3">
                Vertiefen Sie Ihr Verständnis durch:
              </p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>✓ Wissenschaftliche Artikel und Studien</li>
                <li>✓ Podcast-Inhalte</li>
                <li>✓ Trainingsempfehlungen und Techniken</li>
                <li>✓ Hintergrundinformationen zu Atemphysiologie, Bewegungslehre und Bewusstseinsentfaltung</li>
              </ul>
            </div>

            {/* Trainingscenter */}
            <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg hover:border-cyan-500/50 transition">
              <h3 className="text-xl font-semibold text-cyan-400 mb-3 flex items-center">
                <span className="text-2xl mr-3">🏋️</span>
                Trainingscenter & Coaching
              </h3>
              <p className="text-slate-300 mb-3">
                Persönlich optimiertes Training mit:
              </p>
              <ul className="space-y-2 text-slate-400 text-sm">
                <li>✓ Individualisierten Atem- und Stimmklangpraktiken</li>
                <li>✓ Personalisierten Trainingsempfehlungen</li>
                <li>✓ METHODE 36 - YOHNTRAINING (Integriertes Atem- Stimm- Farb- Bewegungskonzept)</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Was KIICH NICHT ist */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Was KIICH NICHT ist</h2>
          <div className="space-y-4">
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Keine medizinische Behandlung</h3>
              <p className="text-slate-300 text-sm">
                KIICH ersetzt <span className="font-semibold">keine ärztliche Beratung oder medizinische Behandlung</span>. Wir diagnostizieren, heilen oder lindern keine Krankheiten.
              </p>
            </div>
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Keine Heilversprechen</h3>
              <p className="text-slate-300 text-sm">
                Wir machen <span className="font-semibold">keine Heilversprechen</span>. Unser Training ist präventiv ausgerichtet – es fördert Gesundheit und Wohlbefinden, nicht die Behandlung von Krankheiten.
              </p>
            </div>
            <div className="p-4 bg-red-900/20 border border-red-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-red-400 mb-2">❌ Keine Diagnose</h3>
              <p className="text-slate-300 text-sm">
                KIICH stellt <span className="font-semibold">keine medizinischen Diagnosen</span>. Der BOLT-Wert ist ein Indikator für Atemqualität – kein diagnostisches Instrument für Krankheiten.
              </p>
            </div>
          </div>
        </section>

        {/* Wissenschaftliche Grundlagen */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Wissenschaftliche und empirische Grundlagen</h2>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">•</span>
                <span>Atem als Grundlage biologischen Lebens</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">•</span>
                <span>Moderne Atem- und Bewegungsphysiologie – Aktuelle wissenschaftliche Erkenntnisse</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">•</span>
                <span>Jahrzehntelange Erfahrungen als Atemexperte, Musikpädagoge, Klangforscher</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Über den Trainer */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Über den Trainer</h2>
          <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-transparent border border-cyan-500/30 rounded-lg">
            <h3 className="text-xl font-semibold text-white mb-4">Ing. Thomas Chochola</h3>
            <ul className="space-y-3 text-slate-300">
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span>Gelernter Bauingenieur für Straßen- und Brückenbau</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span>Staatlich geprüfter Trainer der Sportakademie Graz – Österreich</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span>Zertifizierter BREATHOLOGY Instructor nach Stig Steversinsen</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span>30 Jahre Klangforschung, Produktentwicklung und Unterrichtstätigkeit</span>
              </li>
              <li className="flex items-start">
                <span className="text-cyan-400 mr-3 mt-1">✓</span>
                <span>Spezialist für Atemtraining und Bewusstseinsförderung</span>
              </li>
            </ul>
          </div>
        </section>

        {/* Für wen geeignet */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Für wen ist KIICH geeignet?</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="p-6 bg-green-900/20 border border-green-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-green-400 mb-4">✅ Geeignet für:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Menschen, die ihre geistige, emotionale und haptische Konstitution optimieren möchten</li>
                <li>• Personen, die aktiv Atem-, Bewegungs- und Bewusstseinstraining nutzen möchten</li>
                <li>• Menschen, die ihre Persönlichkeitsentfaltung im KI Zeitalter unterstützen möchten</li>
              </ul>
            </div>
            <div className="p-6 bg-amber-900/20 border border-amber-700/50 rounded-lg">
              <h3 className="text-lg font-semibold text-amber-400 mb-4">⚠️ Rücksprache mit Arzt erforderlich:</h3>
              <ul className="space-y-2 text-slate-300 text-sm">
                <li>• Bluthochdruck, Herzrhythmusstörungen, Herzkrankheiten</li>
                <li>• Asthma, COPD, Atemwegserkrankungen</li>
                <li>• Psychische Erkrankungen (Angststörungen, Depression)</li>
                <li>• Vegetative Störungen, Schwindel</li>
                <li>• Aktuelle medizinische Behandlung</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Wichtiger Hinweis */}
        <section className="mb-12">
          <div className="p-6 bg-amber-900/20 border border-amber-700/50 rounded-lg">
            <h3 className="text-lg font-semibold text-amber-300 mb-3">⚠️ Wichtiger Hinweis</h3>
            <p className="text-slate-300 mb-3">
              Die Trainingsempfehlungen auf dieser Plattform basieren auf wissenschaftlichen Erkenntnissen und dienen zu Informationszwecken. Sie ersetzen keine medizinische Beratung.
            </p>
            <p className="text-slate-300 mb-3">
              <span className="font-semibold">Bei gesundheitlichen Gegebenheiten, Bedenken oder Erkrankungen konsultieren Sie vor Trainingsbeginn UNBEDINGT einen Arzt oder qualifizierten Gesundheitsfachmann.</span>
            </p>
            <p className="text-slate-300">
              KIICH übernimmt keine Haftung für Schäden, die durch unsachgemäße Nutzung oder Nichtbeachtung dieser Hinweise entstehen.
            </p>
          </div>
        </section>

        {/* Datenschutz */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Datenschutz & Sicherheit</h2>
          <div className="p-6 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-slate-300 mb-4">
              KIICH verarbeitet Ihre Gesundheitsdaten (BOLT-Werte, Vitalmonitor-Einträge) sicher und DSGVO-konform. Ihre Daten werden:
            </p>
            <ul className="space-y-2 text-slate-400">
              <li>✓ Verschlüsselt gespeichert</li>
              <li>✓ Nicht an Dritte weitergegeben</li>
              <li>✓ Jederzeit auf Anfrage gelöscht</li>
              <li>✓ Nach den aktuellen Datenschutzstandards geschützt</li>
            </ul>
          </div>
        </section>

        {/* Footer */}
        <section className="text-center pt-8 border-t border-slate-700">
          <p className="text-slate-400 text-sm mb-6">
            KIICH – Die Plattform für Atem- und Bewegungsvitalität sowie Bewusstseinsentwicklung im Ki-Zeitalter.
          </p>
          <Link href="/">
            <Button className="bg-cyan-600 hover:bg-cyan-700">
              Zurück zur Startseite
            </Button>
          </Link>
        </section>
      </div>
    </div>
  );
}
