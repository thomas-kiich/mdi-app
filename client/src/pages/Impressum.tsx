import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function Impressum() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> Zurück
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Impressum</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Angaben gemäß § 5 TMG</p>
        </div>

        <div className="space-y-8 text-lg font-light leading-relaxed">
          <section>
            <h2 className="text-white text-xl font-medium mb-4">Betreiber der Website</h2>
            <p>
              Ing. Thomas Chochola<br />
              Lindacher Weg 17<br />
              D-93128 Regenstauf<br />
              Deutschland
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Kontakt</h2>
            <p>
              Telefon: 0049 151 23040661<br />
              E-Mail: lkrforschung@gmail.com
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Verantwortlich für den Inhalt</h2>
            <p className="text-sm text-zinc-400 mb-2">nach § 55 Abs. 2 RStV:</p>
            <p>
              Ing. Thomas Chochola<br />
              Lindacher Weg 17<br />
              D-93128 Regenstauf
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Haftungsausschluss</h2>
            <div className="space-y-4 text-base text-zinc-400">
                <p>
                    <strong>Haftung für Inhalte</strong><br/>
                    Als Diensteanbieter sind wir gemäß § 7 Abs.1 TMG für eigene Inhalte auf diesen Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit hinweisen.
                </p>
                <p>
                    <strong>Haftung für Links</strong><br/>
                    Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige Anbieter oder Betreiber der Seiten verantwortlich.
                </p>
                <p>
                    <strong>Urheberrecht</strong><br/>
                    Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem deutschen Urheberrecht. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                </p>
            </div>
          </section>
        </div>
        
        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
            <p>© {new Date().getFullYear()} MDI System. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
