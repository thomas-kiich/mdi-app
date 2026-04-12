import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function Impressum() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Impressum</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Angaben gemäß § 5 TMG (DE) · ECG (AT) · UWG (CH)</p>
        </div>

        <div className="space-y-8 text-lg font-light leading-relaxed">

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Betreiber der Website</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-base space-y-1">
              <p className="text-white font-medium">Thomas Chochola</p>
              <p>Lindacher Weg 17</p>
              <p>D-93128 Regenstauf</p>
                <p>Deutschland</p>
              <p className="text-zinc-500 text-xs mt-2">Dieses Impressum gilt auch für Nutzer aus Österreich (gemäß § 5 ECG) und der Schweiz (gemäß Art. 3 UWG).</p>
            </div>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Kontakt</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-base space-y-2">
              <p>
                <span className="text-zinc-500">Telefon:</span>{" "}
                <a href="tel:+4915123040661" className="text-zinc-300 hover:text-white">
                  +49 151 23040661
                </a>
              </p>
              <p>
                <span className="text-zinc-500">E-Mail:</span>{" "}
                <a href="mailto:LKRforschung@gmail.com" className="text-orange-400 hover:underline">
                  LKRforschung@gmail.com
                </a>
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Verantwortlich für den Inhalt</h2>
            <p className="text-sm text-zinc-500 mb-3">nach § 18 Abs. 2 MStV:</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-base space-y-1">
              <p className="text-white font-medium">Thomas Chochola</p>
              <p>Lindacher Weg 17</p>
              <p>D-93128 Regenstauf</p>
            </div>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">Haftungsausschluss</h2>
            <div className="space-y-4 text-base text-zinc-400">
              <p>
                <strong className="text-zinc-300">Haftung für Inhalte</strong><br />
                Als Diensteanbieter sind wir gemäß § 7 Abs. 1 TMG (DE) / § 16 ECG (AT) für eigene Inhalte auf diesen
                Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 TMG (DE) / §§ 13 ff. ECG (AT) sind wir
                als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                rechtswidrige Tätigkeit hinweisen.
              </p>
              <p>
                <strong className="text-zinc-300">Haftung für Links</strong><br />
                Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
                keinen Einfluss haben. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                Anbieter oder Betreiber der Seiten verantwortlich.
              </p>
              <p>
                <strong className="text-zinc-300">Urheberrecht</strong><br />
                Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                unterliegen dem deutschen Urheberrecht (UrhG) sowie dem österreichischen Urheberrechtsgesetz (UrhG AT). Die Vervielfältigung, Bearbeitung,
                Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
              </p>
            </div>
          </section>

        </div>

        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Thomas Chochola / KIICHwerke. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
