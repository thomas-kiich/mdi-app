import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Link } from "wouter";

export function Nutzungsbedingungen() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 p-8 md:p-12 font-sans">
      <div className="max-w-3xl mx-auto space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Nutzungsbedingungen</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            kiich.de · MA – Mein Assistent · Stand: April 2026
          </p>
          <p className="text-zinc-600 text-xs">
            Diese Nutzungsbedingungen gelten für die Nutzung der Website kiich.de sowie der
            darin enthaltenen Dienste (MDI-Frequenzanalyse, MA-Funktion, Planer, Einkaufsliste
            u. a.). Bitte lies sie sorgfältig durch, bevor du den Dienst verwendest.
          </p>
        </div>

        <div className="space-y-10 text-base font-light leading-relaxed text-zinc-400">

          {/* 1. Geltungsbereich */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">1. Geltungsbereich und Vertragspartner</h2>
            <p>
              Diese Nutzungsbedingungen regeln das Verhältnis zwischen dem Betreiber des Dienstes
              (Thomas Chochola, Lindacher Weg 17, D-93128 Regenstauf, nachfolgend „Betreiber")
              und den Nutzern der Website kiich.de sowie aller damit verbundenen Dienste
              (nachfolgend „Dienst").
            </p>
            <p>
              Mit der Nutzung des Dienstes erklärt der Nutzer sein Einverständnis mit diesen
              Nutzungsbedingungen. Abweichende Bedingungen des Nutzers werden nicht anerkannt,
              es sei denn, der Betreiber stimmt ihrer Geltung ausdrücklich schriftlich zu.
            </p>
          </section>

          {/* 2. Leistungsbeschreibung */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">2. Leistungsbeschreibung</h2>
            <p>
              Der Dienst stellt folgende Funktionen zur Verfügung, die sich im laufenden
              Forschungs- und Entwicklungsbetrieb befinden:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800 bg-zinc-900/80">
                    <th className="p-3 text-left text-zinc-400 font-medium">Funktion</th>
                    <th className="p-3 text-left text-zinc-400 font-medium">Beschreibung</th>
                    <th className="p-3 text-left text-zinc-400 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">MDI-Frequenzanalyse</td>
                    <td className="p-3">Akustische Stimmanalyse zur Selbstwahrnehmung</td>
                    <td className="p-3"><span className="text-amber-400 text-xs">Beta</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">MA – Mein Assistent</td>
                    <td className="p-3">KI-gestützter persönlicher Assistent (Sprache + Text)</td>
                    <td className="p-3"><span className="text-amber-400 text-xs">Beta</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Planer / Momentaufnahme</td>
                    <td className="p-3">Persönlicher Tagesplaner mit Erledigungen, Erinnerungen, Einkaufsliste</td>
                    <td className="p-3"><span className="text-green-400 text-xs">Aktiv</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Methode 36</td>
                    <td className="p-3">Atemübung mit Frequenztraining</td>
                    <td className="p-3"><span className="text-green-400 text-xs">Aktiv</span></td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Live-Spektralscanner</td>
                    <td className="p-3">Echtzeit-Frequenzvisualisierung via Mikrofon</td>
                    <td className="p-3"><span className="text-green-400 text-xs">Aktiv</span></td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-zinc-500">
              Der Betreiber behält sich vor, den Funktionsumfang jederzeit zu erweitern,
              einzuschränken oder zu ändern. Ein Anspruch auf dauerhaften Betrieb einzelner
              Funktionen besteht nicht.
            </p>
          </section>

          {/* 3. Nutzungsvoraussetzungen */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">3. Nutzungsvoraussetzungen und Mindestalter</h2>
            <p>
              Die Nutzung des Dienstes ist ab einem Mindestalter von <strong className="text-zinc-300">16 Jahren</strong> gestattet.
              Personen unter 16 Jahren dürfen den Dienst nur mit ausdrücklicher Zustimmung
              eines Erziehungsberechtigten nutzen. Der Betreiber kann jederzeit einen
              Altersnachweis verlangen.
            </p>
            <p>
              Für die Nutzung bestimmter Funktionen (z. B. MA-Assistent, Planer) ist eine
              Registrierung über Manus OAuth erforderlich. Der Nutzer ist verpflichtet,
              wahrheitsgemäße Angaben zu machen und seine Zugangsdaten vertraulich zu behandeln.
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-2">
              <p className="text-zinc-300 font-medium">Technische Voraussetzungen</p>
              <p>Moderner Webbrowser mit aktiviertem JavaScript (Chrome, Firefox, Safari, Edge – aktuelle Version)</p>
              <p>Für Sprachfunktionen: Mikrofon und HTTPS-Verbindung erforderlich</p>
              <p>Für Push-Benachrichtigungen: Browser-Berechtigung erforderlich (optional)</p>
            </div>
          </section>

          {/* 4. Nutzungsrechte */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">4. Nutzungsrechte und Urheberrecht</h2>
            <p>
              Der Betreiber räumt dem Nutzer ein einfaches, nicht übertragbares, nicht
              unterlizenzierbares Recht zur privaten, nicht-kommerziellen Nutzung des Dienstes ein.
              Eine gewerbliche Nutzung, Vervielfältigung, Verbreitung oder öffentliche
              Zugänglichmachung von Inhalten des Dienstes bedarf der ausdrücklichen schriftlichen
              Zustimmung des Betreibers.
            </p>
            <p>
              Alle durch den Betreiber erstellten Inhalte (Texte, Grafiken, Visualisierungen,
              Algorithmen, Konzepte) sind urheberrechtlich geschützt. Die MDI-Methodik,
              die Frequenzzuordnungen und das KIICHwerke-Konzept sind geistiges Eigentum
              von Thomas Chochola.
            </p>
          </section>

          {/* 5. KI-Ausgaben und Haftung */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">5. KI-generierte Ausgaben und Haftungsbeschränkung</h2>
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-5 text-sm text-amber-200/70 space-y-2">
              <p className="text-amber-300 font-medium">Wichtiger Hinweis zu KI-Ausgaben</p>
              <p>
                Die MA-Funktion und andere KI-gestützte Dienste erzeugen automatisch generierte
                Ausgaben, die <strong className="text-amber-200">fehlerhaft, unvollständig oder irreführend</strong> sein können.
                KI-Ausgaben stellen keine professionelle Beratung (medizinisch, rechtlich,
                psychologisch, finanziell) dar und ersetzen diese nicht.
              </p>
              <p>
                Der Nutzer ist verpflichtet, KI-Ausgaben kritisch zu prüfen und eigenverantwortlich
                zu handeln. Der Betreiber übernimmt keine Haftung für Schäden, die aus der
                Verwendung von KI-Ausgaben entstehen.
              </p>
            </div>
            <p>
              Die Haftung des Betreibers ist – soweit gesetzlich zulässig – auf Vorsatz und
              grobe Fahrlässigkeit beschränkt. Für leichte Fahrlässigkeit haftet der Betreiber
              nur bei Verletzung wesentlicher Vertragspflichten (Kardinalpflichten), und auch
              dann nur in Höhe des vorhersehbaren, typischen Schadens.
            </p>
          </section>

          {/* 6. Aufnahmen und Nutzungsrechte */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">6. Sprachaufnahmen und Nutzungsrechte</h2>
            <p>
              Für die Frequenzanalyse und die MA-Sprachsteuerung werden Sprachaufnahmen des
              Nutzers verarbeitet. Der Nutzer räumt dem Betreiber hiermit das Recht ein,
              diese Aufnahmen ausschließlich zum Zweck der Bereitstellung des Dienstes
              (Analyse, Transkription, KI-Verarbeitung) zu verwenden.
            </p>
            <p>
              Sprachaufnahmen werden <strong className="text-zinc-300">nicht dauerhaft gespeichert</strong> und
              nicht für das Training von KI-Modellen verwendet, sofern der Nutzer nicht
              ausdrücklich zugestimmt hat (Opt-in). Eine Weitergabe an Dritte erfolgt nur
              im Rahmen der in der Datenschutzerklärung genannten Auftragsverarbeiter
              (Whisper-Transkription, Mistral AI TTS).
            </p>
          </section>

          {/* 7. Verbotene Nutzung */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">7. Verbotene Nutzung</h2>
            <p>Dem Nutzer ist es untersagt:</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-2 text-zinc-400">
              <p>Den Dienst für rechtswidrige Zwecke zu nutzen oder rechtswidrige Inhalte zu übermitteln</p>
              <p>Den Dienst automatisiert abzufragen (Scraping, Bots) ohne ausdrückliche Genehmigung</p>
              <p>Sicherheitsmechanismen zu umgehen oder zu deaktivieren</p>
              <p>Den Dienst in einer Weise zu nutzen, die andere Nutzer oder den Betreiber schädigt</p>
              <p>Inhalte zu übermitteln, die Rechte Dritter (Urheberrecht, Persönlichkeitsrecht) verletzen</p>
              <p>Den Dienst für kommerzielle Zwecke ohne schriftliche Genehmigung zu nutzen</p>
            </div>
          </section>

          {/* 8. Verfügbarkeit */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">8. Verfügbarkeit und Wartung</h2>
            <p>
              Der Betreiber strebt eine möglichst hohe Verfügbarkeit des Dienstes an, kann
              jedoch keine ununterbrochene Verfügbarkeit garantieren. Wartungsarbeiten,
              technische Störungen oder Ausfälle bei Drittanbietern (Manus Platform, KI-Dienste)
              können zu vorübergehenden Einschränkungen führen.
            </p>
            <p>
              Da der Dienst sich im Beta-Stadium befindet, können jederzeit Änderungen,
              Unterbrechungen oder die Einstellung einzelner Funktionen erfolgen. Ein Anspruch
              auf Schadensersatz bei Nichtverfügbarkeit besteht nicht.
            </p>
          </section>

          {/* 9. Änderungen */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">9. Änderungen der Nutzungsbedingungen</h2>
            <p>
              Der Betreiber behält sich vor, diese Nutzungsbedingungen jederzeit zu ändern.
              Wesentliche Änderungen werden den registrierten Nutzern per E-Mail oder über
              eine Benachrichtigung innerhalb des Dienstes mitgeteilt. Die weitere Nutzung
              des Dienstes nach Inkrafttreten der geänderten Bedingungen gilt als Zustimmung.
            </p>
          </section>

          {/* 10. Anwendbares Recht */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">10. Anwendbares Recht und Gerichtsstand</h2>
            <p>
              Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des
              UN-Kaufrechts (CISG). Für Verbraucher aus der EU gilt ergänzend das
              zwingende Verbraucherschutzrecht ihres Wohnsitzlandes.
            </p>
            <p>
              Gerichtsstand für Streitigkeiten mit Kaufleuten, juristischen Personen des
              öffentlichen Rechts oder öffentlich-rechtlichen Sondervermögen ist
              Regensburg, Deutschland. Für Verbraucher gilt der gesetzliche Gerichtsstand.
            </p>
          </section>

          {/* 11. Schlussbestimmungen */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">11. Schlussbestimmungen</h2>
            <p>
              Sollten einzelne Bestimmungen dieser Nutzungsbedingungen unwirksam sein oder
              werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. An die
              Stelle der unwirksamen Bestimmung tritt eine wirksame Regelung, die dem
              wirtschaftlichen Zweck der unwirksamen Bestimmung am nächsten kommt.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <Link href="/datenschutz">
                <div className="bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/40 rounded-xl p-4 text-sm flex items-center justify-between transition-colors cursor-pointer group">
                  <div>
                    <p className="text-white font-medium group-hover:text-orange-400 transition-colors">Datenschutzerklärung</p>
                    <p className="text-zinc-500 text-xs mt-0.5">DSGVO · BDSG · DSG · nDSG</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
              <Link href="/impressum">
                <div className="bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/40 rounded-xl p-4 text-sm flex items-center justify-between transition-colors cursor-pointer group">
                  <div>
                    <p className="text-white font-medium group-hover:text-orange-400 transition-colors">Impressum</p>
                    <p className="text-zinc-500 text-xs mt-0.5">§ 5 DDG · § 5 ECG · Art. 3 UWG</p>
                  </div>
                  <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
            </div>
          </section>

        </div>

        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Thomas Chochola / KIICHwerke. Alle Rechte vorbehalten.</p>
          <p className="mt-1">Stand: April 2026 · Version 1.0</p>
        </div>
      </div>
    </div>
  );
}
