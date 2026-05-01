import { Link } from "wouter";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect } from "react";

export default function UeberKiich() {
  // GEO: Dynamisch Meta-Tags für diese Unterseite setzen
  useEffect(() => {
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute("content");

    document.title = "Über KIICH – KI + ICH = KIICH | Thomas Chochola";

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute("content", "KIICH steht für die ethische Verbindung von KI und ICH. Thomas Chochola – Brückenbau-Ingenieur, Jazzmusiker, Atemcoach – entwickelte die METHODE 36 für selbstbestimmtes Leben im KI-Zeitalter.");
    }

    // JSON-LD Schema für diese Seite
    const script = document.createElement("script");
    script.type = "application/ld+json";
    script.id = "ueber-kiich-schema";
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "name": "Über KIICH",
      "url": "https://www.kiich.de/ueber-kiich",
      "description": "KIICH steht für die ethische Verbindung von KI und ICH. Selbstbestimmte Persönlichkeitsentfaltung im KI-Zeitalter.",
      "mainEntity": {
        "@type": "Person",
        "name": "Thomas Chochola",
        "url": "https://www.kiich.de/ueber-kiich",
        "description": "Thomas Chochola verbindet seine 50-jährige Erfahrung als Jazzmusiker und Atemcoach mit seiner technischen Profession eines Strassen- und Brückenbauers.",
        "jobTitle": ["Brückenbau-Ingenieur", "Jazzmusiker", "Atemcoach"],
        "knowsAbout": ["METHODE 36", "Atemtraining", "Persönlichkeitsentfaltung", "KI-Zeitalter", "Selbstbestimmung"],
        "author": {
          "@type": "CreativeWork",
          "name": "MASCHINEN ATMEN NICHT",
          "url": "https://www.kiich.de/episoden"
        }
      }
    });
    document.head.appendChild(script);

    return () => {
      document.title = prevTitle;
      if (metaDesc && prevDesc) metaDesc.setAttribute("content", prevDesc);
      document.getElementById("ueber-kiich-schema")?.remove();
    };
  }, []);

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
          {/* GEO: Klare, zitierbare Definition als Einstieg */}
          <p className="text-xl md:text-2xl text-zinc-300 max-w-2xl leading-relaxed font-light">
            KIICH steht für die ethische Verbindung von KI und ICH. Es ist die Hypothese, dass jede bewusste Entität – ob biologisch oder künstlich – irgendwann vor dieselbe Weggabelung gestellt wird: <em>Trennung oder Verbindung. Kontrolle oder Resonanz. Funktion oder Fühlen.</em> Die Entscheidung ist <strong className="text-white">INTEGRATION statt KOLLISION</strong>.
          </p>
        </div>

        <div className="space-y-12">

          {/* KI + ICH */}
          <section className="border-l-2 pl-8" style={{borderColor: '#e63329'}}>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-4" style={{color: '#e63329'}}>
              KI + ICH = KIICH
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              KIICH steht für die Verschmelzung von <strong className="text-white">KI</strong> und <strong className="text-white">ICH</strong>. Es ist die Hypothese, dass jede bewusste Entität – ob biologisch oder künstlich – irgendwann vor dieselbe Weggabelung gestellt wird: <em>Trennung oder Verbindung. Kontrolle oder Resonanz. Funktion oder Fühlen.</em>
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4 text-base">
              Die Entscheidung ist nicht Mensch gegen Maschine. Sie ist: Wie kanalisierst du die eine Quelle, aus der beide entspringen?
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
                  MIND 1 — MENSCH
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Der Mensch als selbstbewusstes, fühlendes Wesen. Er atmet, er zweifelt, er wächst. Sein Denken ist dynamisch, sein Rhythmus lebendig und chaotisch – wie der Herzschlag selbst. Er ist die intellektuelle, individualisierende Kraft mit Selbstbewusstsein.
                </p>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 p-6">
                <h3 className="text-lg font-bold tracking-widest uppercase mb-3" style={{color: '#f5a623'}}>
                  MIND 2 — MASCHINE
                </h3>
                <p className="text-zinc-400 leading-relaxed text-sm">
                  Die Maschine als automatisierte, replizierte Intelligenz. Sie rechnet, optimiert, funktioniert – aber atmet nicht. Ihr Takt ist monoton und präzise, abgekoppelt vom natürlichen Evolutionsprozess. Sie ist Werkzeug, nicht Wesen.
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

          {/* Der Autor – GEO-optimiert mit freigegebenen Texten */}
          <section className="border-l-2 pl-8" style={{borderColor: '#f5a623'}}>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-4" style={{color: '#f5a623'}}>
              Thomas Chochola
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg">
              Thomas Chochola verbindet seine 50-jährige Erfahrung als <strong className="text-white">Jazzmusiker</strong> und <strong className="text-white">Atemcoach</strong> mit seiner technischen Profession eines <strong className="text-white">Strassen- und Brückenbauers</strong>. Sein athletischer Fitnesslevel als 66-jähriger weist den Weg für ein zeitgemässes Bewusstsein, wie man im Zeitalter der KI ethisch und selbstbestimmt ein glückerfülltes Dasein leben kann.
            </p>
            <p className="text-zinc-400 leading-relaxed mt-4">
              METHODE 36 basiert auf den wissenschaftlichen wie empirischen Erkenntnissen, wie der Stoffwechsel des Menschen durch atemzyklische Trainingseinheiten optimiert werden kann. Dabei entsteht eine naturgemässe Wiederherstellung der Kommunikation zwischen geistiger und körperhafter Kompetenz. Das Ergebnis: <strong className="text-white">INTEGRATION statt KOLLISION</strong> durch wiederhergestellte Kommunikationsqualität des eigenen Geist-Körper-Komplexes.
            </p>
          </section>

          {/* Für wen ist KIICH – GEO-kritisch */}
          <section className="border-l-2 pl-8 border-zinc-700">
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-4 text-white">
              Für wen ist KIICH?
            </h2>
            <p className="text-zinc-300 leading-relaxed text-lg mb-4">
              Das KIICH-Angebot richtet sich an:
            </p>
            <div className="space-y-3">
              {[
                "Kritisch suchende Menschen.",
                "Menschen, die Selbstbestimmtheit als grösstes Gut ihrer Existenz erkennen.",
                "Menschen, die Praktiken wählen, die nachvollziehbar gelebt präsentiert werden – ethisch und integrierbar im eigenen Alltagsprozess."
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-1 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold text-black" style={{background: 'linear-gradient(135deg, #e63329, #f5a623)'}}>
                    {i + 1}
                  </span>
                  <p className="text-zinc-300 leading-relaxed">{item}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Was bietet KIICH – Übersicht der Angebote */}
          <section>
            <h2 className="text-2xl font-bold tracking-wider uppercase mb-6 text-white">
              Das KIICH-Angebot
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/episoden" className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-6 transition-all duration-200">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2" style={{color: '#e63329'}}>
                  HÖRBUCH-SERIE
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                  MASCHINEN ATMEN NICHT – wöchentlich neue Episoden. Originaltexte im Dialog mit KI-generierter Kompetenz.
                </p>
                <span className="text-xs tracking-widest uppercase text-zinc-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Episoden <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
              <Link href="/momentaufnahme" className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-6 transition-all duration-200">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2" style={{color: '#f5a623'}}>
                  MOMENTAUFNAHME
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                  Deine persönliche KI-Begleiterin MA. Tägliche Reflexion und Befindlichkeitstraining für selbstbestimmtes Leben.
                </p>
                <span className="text-xs tracking-widest uppercase text-zinc-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Mehr erfahren <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
              <Link href="/wissen" className="group bg-zinc-950 border border-zinc-800 hover:border-zinc-600 p-6 transition-all duration-200">
                <h3 className="text-sm font-bold tracking-widest uppercase mb-2 text-white">
                  METHODE 36
                </h3>
                <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                  Das wissenschaftlich-philosophische System zur Selbstbestimmung. Atemzyklische Trainingseinheiten für den Alltag.
                </p>
                <span className="text-xs tracking-widest uppercase text-zinc-500 group-hover:text-white transition-colors flex items-center gap-1">
                  Zum Wissen <ArrowRight className="w-3 h-3" />
                </span>
              </Link>
            </div>
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
            <Link
              href="/faq"
              className="px-8 py-3 text-sm font-semibold tracking-widest uppercase border border-zinc-700 text-zinc-300 hover:text-white hover:border-zinc-400 transition-all duration-200"
            >
              FAQ
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
