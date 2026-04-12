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
          <h1 className="text-4xl font-light text-white tracking-tight">Datenschutzerklärung</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            Gemäß DSGVO (EU) 2016/679, BDSG (DE), DSG (AT) und nDSG (CH) · Stand: April 2026
          </p>
        </div>

        <div className="space-y-10 text-base font-light leading-relaxed text-zinc-400">

          {/* 1. Verantwortlicher */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">1. Verantwortlicher</h2>
            <p>
              Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist gemäß
              Art. 4 Nr. 7 DSGVO:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Thomas Chochola</p>
              <p>MDI – Multidimensionales Identitätssystem / KIICHwerke</p>
              <p>Lindacher Weg 17</p>
              <p>D-93128 Regenstauf, Deutschland</p>
              <p>
                Telefon:{" "}
                <a href="tel:+4915123040661" className="text-zinc-300 hover:text-white">
                  +49 151 23040661
                </a>
              </p>
              <p>
                E-Mail:{" "}
                <a href="mailto:LKRforschung@gmail.com" className="text-orange-400 hover:underline">
                  LKRforschung@gmail.com
                </a>
              </p>
            </div>
            <p className="text-sm text-zinc-500">
              Da der Verantwortliche seinen gewöhnlichen Aufenthalt in Deutschland hat, gilt
              deutsches Datenschutzrecht (DSGVO in Verbindung mit dem BDSG) als vorrangiges
              anwendbares Recht. Für Nutzer aus Österreich gilt zusätzlich das österreichische
              Datenschutzgesetz (DSG, BGBl. I Nr. 165/1999 i.d.g.F.), soweit es über die DSGVO
              hinausgehende nationale Regelungen enthält. Für Nutzer aus der Schweiz gilt das
              neue Bundesgesetz über den Datenschutz (nDSG, in Kraft seit 1. September 2023)
              in Verbindung mit der Datenschutzverordnung (DSV).
            </p>
          </section>

          {/* 2. Sprachanalyse */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">2. Sprachanalyse (lokale Verarbeitung)</h2>
            <p>
              Die Analyse Ihrer Stimme im Rahmen der MDI-Frequenzanalyse erfolgt ausschließlich
              lokal in Ihrem Browser (<em>Client-Side Processing</em>). Es werden keine
              Audioaufnahmen auf unsere Server übertragen oder dort gespeichert. Sobald Sie das
              Browserfenster schließen, sind alle Aufnahmen und Analysedaten unwiderruflich gelöscht.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung / Nutzung des Dienstes).
            </p>
          </section>

          {/* 3. Newsletter */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">3. Newsletter (Double-Opt-In)</h2>
            <p>
              Wenn Sie sich für unseren Newsletter anmelden, verwenden wir das sogenannte
              Double-Opt-In-Verfahren gemäß den Anforderungen des deutschen Rechts: Nach der
              Eingabe Ihrer E-Mail-Adresse erhalten Sie eine Bestätigungsmail – bitte klicken Sie auf
              den Link darin, um die Anmeldung rechtlich freizugeben. Erst nach diesem Schritt wird
              Ihre Anmeldung aktiviert.
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-3 text-sm">
              <p className="text-white font-medium">Welche Daten werden gespeichert?</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left pb-2">Datum</th>
                    <th className="text-left pb-2">Zweck</th>
                    <th className="text-left pb-2">Rechtsgrundlage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-300">E-Mail-Adresse</td>
                    <td className="py-2">Newsletter-Versand</td>
                    <td className="py-2">Art. 6 Abs. 1 lit. a DSGVO</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-300">Name (optional)</td>
                    <td className="py-2">Personalisierung</td>
                    <td className="py-2">Art. 6 Abs. 1 lit. a DSGVO</td>
                  </tr>
                  <tr className="border-b border-zinc-800/50">
                    <td className="py-2 text-zinc-300">IP-Adresse bei Anmeldung</td>
                    <td className="py-2">Einwilligungsnachweis</td>
                    <td className="py-2">Art. 7 Abs. 1 DSGVO i. V. m. § 25 BDSG</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-zinc-300">Zeitpunkt der Bestätigung</td>
                    <td className="py-2">Einwilligungsnachweis</td>
                    <td className="py-2">Art. 7 Abs. 1 DSGVO</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <p>
              <strong className="text-white">Speicherdauer:</strong> Ihre Daten werden so lange
              gespeichert, wie Sie den Newsletter abonniert haben. Nach einer Abmeldung werden die
              Protokolldaten (IP, Zeitstempel) für den gesetzlich vorgeschriebenen
              Einwilligungsnachweis aufbewahrt. Auf Ihren ausdrücklichen Wunsch (Recht auf Löschung,
              Art. 17 DSGVO) werden alle Daten vollständig gelöscht.
            </p>

            <p>
              <strong className="text-white">Abmeldung:</strong> Sie können den Newsletter jederzeit
              über den Abmeldelink in jeder E-Mail oder über{" "}
              <Link href="/newsletter/abmelden">
                <span className="text-orange-400 hover:underline cursor-pointer">
                  diese Seite
                </span>
              </Link>{" "}
              abbestellen. Die Rechtmäßigkeit der bis zur Abmeldung erfolgten Verarbeitung bleibt
              davon unberührt (Art. 7 Abs. 3 DSGVO).
            </p>

            <p>
              <strong className="text-white">Datenlöschung (Art. 17 DSGVO):</strong> Über den
              Abmeldelink können Sie zusätzlich zur Abmeldung die vollständige Löschung aller
              gespeicherten personenbezogenen Daten beantragen.
            </p>
          </section>

          {/* 4. Nutzerkonto */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">4. Nutzerkonto (Manus OAuth)</h2>
            <p>
              Für die Nutzung bestimmter Funktionen (z. B. gespeicherte Analysen) können Sie sich
              über Manus OAuth anmelden. Dabei werden Name, E-Mail-Adresse und eine eindeutige
              Nutzer-ID gespeichert. Die Authentifizierung erfolgt über einen verschlüsselten
              Session-Cookie. Es werden keine Passwörter auf unseren Servern gespeichert.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung).
            </p>
          </section>

          {/* 5. Cookies */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">5. Cookies</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookie
              für die Authentifizierung). Es werden keine Tracking-, Werbe- oder
              Analyse-Cookies eingesetzt. Technisch notwendige Cookies bedürfen gemäß § 25 Abs. 2
              TDDDG (ehemals TTDSG) keiner gesonderten Einwilligung.
            </p>
          </section>

          {/* 6. Server-Log-Dateien */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">6. Server-Log-Dateien</h2>
            <p>
              Der Hosting-Anbieter erhebt automatisch Server-Log-Dateien mit folgenden Daten:
              Browsertyp, Betriebssystem, Referrer-URL, IP-Adresse, Uhrzeit der Serveranfrage.
              Diese Daten werden nicht mit anderen Quellen zusammengeführt und nach spätestens
              7 Tagen gelöscht.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. f DSGVO
              (berechtigtes Interesse an der Sicherheit und dem störungsfreien Betrieb des Dienstes).
            </p>
          </section>

          {/* 7. Ihre Rechte */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">7. Ihre Rechte (Art. 15–22 DSGVO)</h2>
            <p>
              Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2 text-sm">
              {[
                ["Recht auf Auskunft", "Art. 15 DSGVO", "Welche Daten wir über Sie gespeichert haben"],
                ["Recht auf Berichtigung", "Art. 16 DSGVO", "Korrektur unrichtiger Daten"],
                ["Recht auf Löschung", "Art. 17 DSGVO", "Vollständige Datenlöschung auf Anfrage"],
                ["Recht auf Einschränkung", "Art. 18 DSGVO", "Einschränkung der Verarbeitung"],
                ["Recht auf Widerspruch", "Art. 21 DSGVO", "Widerspruch gegen die Verarbeitung"],
                ["Recht auf Datenübertragbarkeit", "Art. 20 DSGVO", "Export Ihrer Daten in maschinenlesbarem Format"],
              ].map(([right, article, desc]) => (
                <div key={right} className="flex gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="min-w-[180px]">
                    <p className="text-zinc-300 font-medium">{right}</p>
                    <p className="text-zinc-600 text-xs">{article}</p>
                  </div>
                  <p className="text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
            <p>
              Zur Ausübung Ihrer Rechte wenden Sie sich bitte per E-Mail an:{" "}
              <a href="mailto:LKRforschung@gmail.com" className="text-orange-400 hover:underline">
                LKRforschung@gmail.com
              </a>{" "}
              oder schriftlich an die oben genannte Adresse.
            </p>
          </section>

          {/* 8. Beschwerderecht */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">8. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p>
              Sie haben das Recht, sich bei einer Datenschutz-Aufsichtsbehörde über die Verarbeitung
              Ihrer personenbezogenen Daten durch uns zu beschweren (Art. 77 DSGVO i. V. m. § 19 BDSG).
            </p>
            <p>
              Zuständig ist in Deutschland die Aufsichtsbehörde des Bundeslandes, in dem Sie Ihren
              Wohnsitz haben, oder – für bundesweite Angelegenheiten – der:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)</p>
              <p>Graurheindorfer Str. 153, 53117 Bonn</p>
              <p>
                Web:{" "}
                <a
                  href="https://www.bfdi.bund.de"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  www.bfdi.bund.de
                </a>
              </p>
            </div>
            <p className="mt-3">
              Für Nutzer aus <strong className="text-zinc-300">Österreich</strong> ist die zuständige Aufsichtsbehörde:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Österreichische Datenschutzbehörde (DSB)</p>
              <p>Barichgasse 40–42, 1030 Wien</p>
              <p>
                Web:{" "}
                <a
                  href="https://www.dsb.gv.at"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  www.dsb.gv.at
                </a>
              </p>
            </div>
            <p className="mt-3">
              Für Nutzer aus der <strong className="text-zinc-300">Schweiz</strong> ist die zuständige Aufsichtsbehörde:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Eidgenössischer Datenschutz- und Öffentlichkeitsbeauftragter (EDÖB)</p>
              <p>Feldeggweg 1, 3003 Bern</p>
              <p>
                Web:{" "}
                <a
                  href="https://www.edoeb.admin.ch"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-400 hover:underline"
                >
                  www.edoeb.admin.ch
                </a>
              </p>
            </div>
          </section>

          {/* 9. SSL */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">9. SSL/TLS-Verschlüsselung</h2>
            <p>
              Diese Website nutzt aus Sicherheitsgründen eine SSL/TLS-Verschlüsselung. Eine
              verschlüsselte Verbindung erkennen Sie am „https://" in der Adresszeile und am
              Schloss-Symbol Ihres Browsers.
            </p>
          </section>

        </div>

        {/* DSGVO-Einwilligung widerrufen */}
        <section className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-white text-xl font-medium">10. Einwilligung widerrufen</h2>
          <p className="text-sm text-zinc-400">
            Du kannst deine Einwilligung zur Verarbeitung deiner Spracheingaben (MOMENTAUFNAHME)
            jederzeit widerrufen (Art. 7 Abs. 3 DSGVO). Nach dem Widerruf wird beim nächsten
            Start einer Aufnahme erneut um Zustimmung gebeten. Bereits gespeicherte Aufnahmen
            bleiben bestehen — für eine vollständige Löschung wende dich bitte per E-Mail an uns
            (Art. 17 DSGVO).
          </p>
          <button
            onClick={() => {
              localStorage.removeItem("kiich_ma_consent");
              alert("Einwilligung widerrufen. Beim nächsten Start einer Aufnahme wird erneut um Zustimmung gebeten.");
            }}
            className="mt-2 px-4 py-2 rounded-lg bg-red-900/30 hover:bg-red-900/50 border border-red-700/30 text-red-300 text-sm font-medium transition-colors"
          >
            Einwilligung zur Sprachverarbeitung widerrufen
          </button>
        </section>

        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Thomas Chochola / KIICHwerke. Alle Rechte vorbehalten.</p>
          <p className="mt-1">Stand: April 2026 · Deutsches Recht (DSGVO + BDSG)</p>
        </div>
      </div>
    </div>
  );
}
