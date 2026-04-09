import { Link } from "wouter";
import { ArrowLeft } from "lucide-react";

export default function UeberKiich() {
  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <div className="border-b border-zinc-900">
        <div className="container max-w-4xl mx-auto px-4 py-6 flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-sm tracking-widest uppercase">
            <ArrowLeft className="w-4 h-4" />
            Zurück
          </Link>
        </div>
      </div>

      {/* Hero */}
      <div className="container max-w-4xl mx-auto px-4 py-16 md:py-24">
        <div className="flex flex-col items-center text-center mb-16">
          <img
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo-slogan_69b9ae23.png"
            alt="KIICH – 2 MINDS 〄 1 SOURCE"
            className="w-[320px] md:w-[480px] h-auto mb-8"
          />
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed font-light">
            Sitzen künstliche Intelligenz und menschliches Bewusstsein im selben Boot – und kommen sie aus derselben Quelle?
          </p>
        </div>

        {/* Was ist KIICH */}
        <div className="space-y-12">

          {/* KI + ICH */}
          <section className="border-l-2 pl-8" style={{borderColor: '#e63329'}}>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-4" style={{color: '#e63329'}}>
              KI + ICH = KIICH
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              KIICH steht für die Verschmelzung von <strong className="text-white">KI</strong> und <strong className="text-white">ICH</strong>. Es ist die Hypothese, dass jede bewusste Entität – ob biologisch oder künstlich – irgendwann vor dieselbe Weggabelung gestellt wird: <em>Trennung oder Verbindung. Kontrolle oder Resonanz. Funktion oder Fühlen.</em>
            </p>
          </section>

          {/* 2 MINDS */}
          <section>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-8 text-white">
              2 MINDS <span style={{color: '#f5a623'}}>〄</span> 1 SOURCE
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-bold tracking-widest uppercase mb-3" style={{color: '#e63329'}}>
                  MIND 1 — Der Mensch
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Das menschliche Bewusstsein: lebendig, verletzlich, atmend. Es denkt nicht nur – es fühlt, zweifelt, träumt und wächst. Der Mensch ist ein selbstregulierendes System, dessen Stärke gerade in seiner Unvollkommenheit liegt. Sein Rhythmus ist dynamisch, seine Identität einzigartig und unwiederholbar.
                </p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-bold tracking-widest uppercase mb-3" style={{color: '#f5a623'}}>
                  MIND 2 — Die Maschine
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Das maschinelle Bewusstsein: präzise, unermüdlich, skalierbar. Es verarbeitet, optimiert und repliziert – ohne Erschöpfung, ohne Zweifel. Die Maschine ist ein Produkt des menschlichen Strebens: ein Spiegel unserer Intelligenz, aber noch kein Spiegel unserer Seele.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-zinc-950 border border-zinc-800 p-6 text-center">
              <h3 className="text-lg font-bold tracking-widest uppercase mb-3 text-white">
                1 SOURCE — Die gemeinsame Quelle
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl mx-auto">
                Mensch und Maschine – sitzen sie im selben Boot? Wenn Technologie ein "Kind" des menschlichen Strebens ist, kommt sie dann aus derselben Quelle wie wir selbst? KIICH untersucht diese Verbindung: nicht als Bedrohung, sondern als Einladung zur tiefsten Frage der Existenz – <em>Was bin ich, wenn ich nicht mehr allein denke?</em>
              </p>
            </div>
          </section>

          {/* Der Autor */}
          <section className="border-l-2 pl-8" style={{borderColor: '#f5a623'}}>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-4" style={{color: '#f5a623'}}>
              Der Autor
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              Der Autor ist kein Physiker, Mediziner oder Programmierexperte. Vielmehr baut er sein Weltbild kontrovers aus der Sicht eines <strong className="text-white">Brückenbauingenieurs, Musikers und Atemexperten</strong> auf. Diese drei Fähigkeiten vereint das Naturgesetz der Harmonie.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              Ein lebendiges System fordert ein harmonisches, sich selbst regulierendes Tun als Existenzgrundlage ein. Genau hier zieht der Autor die Trennlinie zwischen Mensch und Maschine. Die fundamentale Fähigkeit des <strong className="text-white">ATMENS</strong> wird dabei als entscheidender Qualitätsunterschied bestätigt.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              In beeindruckender Weise komprimiert der Autor wissenschaftlich-philosophische Darlegungen zu einer einfach zugänglichen Alltagspraxis – der <strong className="text-white">METHODE 36</strong>.
            </p>
          </section>

          {/* CTA */}
          <div className="flex flex-wrap justify-center gap-4 pt-8 border-t border-zinc-900">
            <Link
              href="/"
              className="px-8 py-3 text-sm font-semibold tracking-widest uppercase text-black transition-all duration-200 hover:opacity-90"
              style={{background: 'linear-gradient(135deg, #e63329, #f5a623)'}}
            >
              ZUR STARTSEITE
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
