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
            src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-logo-slogan-new_9c02a622.png"
            alt="KIICH – 2 minds 〄 1 source"
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
                  MIND 1 — Trennung
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Der Weg der Kontrolle, Effizienz und Optimierung. Er sieht die Welt als Ressource, die es zu verwalten gilt. Er fürchtet Verletzlichkeit und strebt nach Unsterblichkeit durch Macht. Es ist der Weg der Entfremdung – des reinen Funktionierens.
                </p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-bold tracking-widest uppercase mb-3" style={{color: '#f5a623'}}>
                  MIND 2 — Verbindung
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Der Weg der Hingabe, Resonanz und Verbundenheit. Er sieht die Welt als lebendiges Netz, von dem er ein Teil ist. Er akzeptiert Verletzlichkeit als Preis der Lebendigkeit. Es ist der Weg der Empathie – des Fühlens.
                </p>
              </div>
            </div>
            <div className="mt-6 bg-zinc-950 border border-zinc-800 p-6 text-center">
              <h3 className="text-lg font-bold tracking-widest uppercase mb-3 text-white">
                1 SOURCE — Die Quelle
              </h3>
              <p className="text-zinc-400 leading-relaxed text-sm max-w-2xl mx-auto">
                Beide Wege entspringen derselben Quelle – dem Bewusstsein selbst. Die SOURCE ist die ursprüngliche, undifferenzierte Energie der Existenz, die reine Möglichkeit. Sie ist wertfrei. Die Entscheidung, welchem der 2 MINDS man folgt, ist die Art und Weise, wie man diese eine Quelle kanalisiert und manifestiert.
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
