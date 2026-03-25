import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function Datenschutz() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Datenschutz</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">Ihre Privatsphäre ist uns wichtig</p>
        </div>

        <div className="space-y-8 text-lg font-light leading-relaxed">
          <section>
            <h2 className="text-white text-xl font-medium mb-4">1. Grundlegendes</h2>
            <p>
              Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften sowie dieser Datenschutzerklärung.
            </p>
            <p className="mt-4">
              <strong>Wichtiger Hinweis zur Sprachanalyse:</strong><br/>
              Die Analyse Ihrer Stimme erfolgt ausschließlich lokal in Ihrem Browser ("Client-Side Processing"). Es werden keine Audioaufnahmen auf unsere Server hochgeladen oder dort gespeichert. Sobald Sie das Browserfenster schließen, sind alle Aufnahmen und Analysedaten gelöscht.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">2. Datenerfassung auf unserer Website</h2>
            <div className="space-y-4 text-base text-zinc-400">
                <p>
                    <strong>Server-Log-Dateien</strong><br/>
                    Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                        <li>Browsertyp und Browserversion</li>
                        <li>Verwendetes Betriebssystem</li>
                        <li>Referrer URL</li>
                        <li>Hostname des zugreifenden Rechners</li>
                        <li>Uhrzeit der Serveranfrage</li>
                        <li>IP-Adresse</li>
                    </ul>
                    Eine Zusammenführung dieser Daten mit anderen Datenquellen wird nicht vorgenommen.
                </p>
            </div>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">3. Ihre Rechte</h2>
            <p className="text-base text-zinc-400">
              Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
            </p>
          </section>

          <section>
            <h2 className="text-white text-xl font-medium mb-4">4. SSL- bzw. TLS-Verschlüsselung</h2>
            <p className="text-base text-zinc-400">
              Diese Seite nutzt aus Sicherheitsgründen und zum Schutz der Übertragung vertraulicher Inhalte eine SSL-bzw. TLS-Verschlüsselung. Eine verschlüsselte Verbindung erkennen Sie daran, dass die Adresszeile des Browsers von “http://” auf “https://” wechselt und an dem Schloss-Symbol in Ihrer Browserzeile.
            </p>
          </section>
        </div>
        
        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
            <p>© {new Date().getFullYear()} MDI System. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
