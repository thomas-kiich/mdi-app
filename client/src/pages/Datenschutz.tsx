import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export function Datenschutz() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans">
      <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Datenschutzerklärung</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            Gemäß DSGVO (EU) 2016/679 und BDSG (DE) · Stand: Mai 2026
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

          </section>

          {/* 2. Übersicht der verarbeiteten Daten */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">2. Übersicht der verarbeiteten Daten</h2>
            <p>
              Die folgende Tabelle gibt einen vollständigen Überblick über alle personenbezogenen
              Daten, die wir im Rahmen der Nutzung von kiich.de / MA verarbeiten, einschließlich
              Zweck, Rechtsgrundlage und Speicherdauer.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-zinc-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <th className="text-left p-3">Datenkategorie</th>
                    <th className="text-left p-3">Zweck</th>
                    <th className="text-left p-3">Rechtsgrundlage</th>
                    <th className="text-left p-3">Speicherdauer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr>
                    <td className="p-3 text-zinc-300">Name, E-Mail-Adresse, Nutzer-ID</td>
                    <td className="p-3">Kontoverwaltung, Authentifizierung</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    <td className="p-3">Bis zur Kontolöschung</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Audiodaten (Sprachaufnahmen)</td>
                    <td className="p-3">Lokale MDI-Frequenzanalyse (nur im Browser)</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. a DSGVO (Einwilligung)</td>
                    <td className="p-3">Nur für Dauer der Sitzung; kein Upload</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Sprachtranskriptionen (MA-Funktion)</td>
                    <td className="p-3">Sprachsteuerung, Erinnerungen, Einkaufsliste</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    <td className="p-3">Bis zur manuellen Löschung</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Notizen, Aufgaben, Erinnerungen, Einkaufsliste</td>
                    <td className="p-3">Kernfunktion des Dienstes</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    <td className="p-3">Bis zur manuellen Löschung oder Kontolöschung</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">IP-Adresse, Gerätekennungen, Browser-Typ</td>
                    <td className="p-3">Sicherheit, Fehlerdiagnose, Server-Logs</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. f DSGVO</td>
                    <td className="p-3">Max. 7 Tage</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Name, E-Mail (Voranmeldung Stimmklanganalyse)</td>
                    <td className="p-3">Kontaktaufnahme auf Anfrage des Nutzers (vorvertragliche Maßnahme)</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                    <td className="p-3">Bis zur Kontaktaufnahme, max. 6 Monate</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">E-Mail-Adresse (Newsletter)</td>
                    <td className="p-3">Newsletter-Versand</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. a DSGVO</td>
                    <td className="p-3">Bis zur Abmeldung</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Push-Subscription (Endpoint, Schlüssel)</td>
                    <td className="p-3">Web-Push-Benachrichtigungen (Erinnerungen)</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. a DSGVO</td>
                    <td className="p-3">Bis zur Abmeldung vom Push-Dienst</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Session-Cookie</td>
                    <td className="p-3">Authentifizierung (technisch notwendig)</td>
                    <td className="p-3">§ 25 Abs. 2 TDDDG</td>
                    <td className="p-3">Bis zum Logout / Browser-Schließen</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* 3. Sprachanalyse */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">3. Sprachanalyse – Lokale Verarbeitung (MDI-Frequenzanalyse)</h2>
            <p>
              Die Analyse Ihrer Stimme im Rahmen der MDI-Frequenzanalyse erfolgt ausschließlich
              lokal in Ihrem Browser (<em>Client-Side Processing</em>). Es werden keine
              Audioaufnahmen auf unsere Server übertragen oder dort gespeichert. Sobald Sie das
              Browserfenster schließen, sind alle Aufnahmen und Analysedaten unwiderruflich gelöscht.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung). Sie werden vor der ersten Aufnahme um Ihre ausdrückliche Zustimmung
              gebeten. Diese Einwilligung kann jederzeit widerrufen werden (siehe Abschnitt 12).
            </p>
            <p>
              <strong className="text-white">Besonderer Hinweis zu Gesundheitsdaten:</strong> Stimm-
              und Frequenzdaten können unter Umständen als besondere Kategorie personenbezogener
              Daten gemäß Art. 9 DSGVO eingestuft werden. Wir verarbeiten diese Daten ausschließlich
              auf Basis Ihrer ausdrücklichen Einwilligung (Art. 9 Abs. 2 lit. a DSGVO) und
              ausschließlich lokal in Ihrem Browser – ohne Übertragung an unsere Server.
            </p>
          </section>

          {/* 3b. Stimmklanganalyse */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">3b. Stimmklanganalyse – Persönliches Coaching-Produkt</h2>
            <p>
              Die <strong className="text-white">Stimmklanganalyse</strong> ist ein kostenpflichtiges
              Einzelprodukt (Einmalzahlung). Die Verarbeitung personenbezogener Daten erfolgt
              ausschließlich zur Erfüllung dieses Vertrags. Im Rahmen dieses Angebots werden
              folgende personenbezogene Daten verarbeitet:
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4 text-sm">
              <div>
                <p className="text-white font-medium mb-1">Verarbeitete Daten</p>
                <p className="text-zinc-400">
                  Stimmfrequenzanalysen über 3 aufeinanderfolgende Tage (berechnete Klangparameter:
                  Lebensklang, Wurzelklang), Name und E-Mail-Adresse zur Terminvereinbarung.
                  Die Rohaudioaufnahmen werden <strong className="text-zinc-300">nicht</strong> gespeichert –
                  nur die daraus berechneten Frequenzwerte.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Zugriff</p>
                <p className="text-zinc-400">
                  Ihre Analysedaten sind ausschließlich Ihnen und Thomas Chochola (Verantwortlicher)
                  zugänglich. Eine Weitergabe an Dritte findet nicht statt.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Zweck</p>
                <p className="text-zinc-400">
                  Auswertung Ihres persönlichen Stimmklangs und Durchführung des abschließenden
                  Coaching-Gesprächs mit Thomas Chochola. Nach dem Coaching erhalten Sie eine
                  dauerhafte Dokumentation Ihrer Ergebnisse in Ihrem KIICH-Konto.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Speicherdauer</p>
                <p className="text-zinc-400">
                  Ihre Analysedaten werden dauerhaft in Ihrem KIICH-Konto gespeichert, damit Sie
                  jederzeit auf Ihre Ergebnisse zugreifen können. Sie können die Löschung Ihrer
                  Daten jederzeit unter{" "}
                  <a href="mailto:lkrforschung@gmail.com" className="text-orange-400 hover:underline">
                    lkrforschung@gmail.com
                  </a>{" "}
                  beantragen (Art. 17 DSGVO).
                </p>
              </div>
            </div>

            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung). Stimm- und Frequenzdaten können als besondere Kategorie
              personenbezogener Daten gemäß Art. 9 DSGVO eingestuft werden; die Verarbeitung
              ist für die Erbringung der gebuchten Leistung erforderlich
              (Art. 9 Abs. 2 lit. b DSGVO).
            </p>
          </section>

          {/* 4. KI-Verarbeitung */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">4. KI-gestützte Verarbeitung (MA-Assistent)</h2>
            <p>
              Die MA-Funktion (Sprachsteuerung, Erinnerungen per Sprache, Tages-Zusammenfassung)
              nutzt KI-Sprachmodelle zur Verarbeitung Ihrer Eingaben. Dabei werden folgende
              Verarbeitungsschritte durchgeführt:
            </p>

            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-4 text-sm">
              <div>
                <p className="text-white font-medium mb-1">Sprachtranskription (Whisper API)</p>
                <p className="text-zinc-400">
                  Wenn Sie die Sprach-Upload-Funktion nutzen, wird Ihre Audioaufnahme zur
                  Transkription an die Whisper API des Plattformanbieters übermittelt. Die
                  Audioaufnahme wird nach Abschluss der Transkription gelöscht. Protokolldaten
                  werden gemäß den Nutzungsbedingungen des Anbieters nach 30 Tagen gelöscht.
                  Die Transkription wird <strong className="text-zinc-300">nicht</strong> mit
                  Ihrem Konto verknüpft und <strong className="text-zinc-300">nicht</strong> für
                  das Training von KI-Modellen verwendet.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">Sprachmodell-Verarbeitung (LLM)</p>
                <p className="text-zinc-400">
                  Texteingaben (z. B. Sprachbefehle für Erinnerungen, Tages-Zusammenfassung) werden
                  zur Verarbeitung an ein Large Language Model (LLM) des Plattformanbieters
                  übermittelt. Diese Verarbeitung erfolgt auf Basis Ihres Nutzungsvertrags.
                  Ihre Inhalte werden <strong className="text-zinc-300">nicht</strong> für das
                  Training von KI-Modellen Dritter verwendet.
                </p>
              </div>
              <div>
                <p className="text-white font-medium mb-1">KI-Training – Opt-out</p>
                <p className="text-zinc-400">
                  Wir verwenden Ihre personenbezogenen Daten und Inhalte
                  <strong className="text-zinc-300"> nicht</strong> für das Training eigener oder
                  fremder KI-Modelle. Sollte sich dies in Zukunft ändern, werden wir Sie vorab
                  informieren und Ihre ausdrückliche Einwilligung einholen (Art. 6 Abs. 1 lit. a
                  DSGVO). Sie haben jederzeit das Recht, einer solchen Nutzung zu widersprechen.
                </p>
              </div>
            </div>

            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung – die KI-Verarbeitung ist für die Bereitstellung der MA-Funktion
              technisch notwendig).
            </p>
          </section>

          {/* 5. Auftragsverarbeiter / Drittanbieter */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">5. Auftragsverarbeiter und Drittanbieter</h2>
            <p>
              Wir setzen folgende Dienstleister als Auftragsverarbeiter gemäß Art. 28 DSGVO ein.
              Mit jedem Auftragsverarbeiter besteht ein Datenverarbeitungsvertrag (AVV), der die
              Einhaltung der DSGVO sicherstellt.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-xs border border-zinc-800 rounded-xl overflow-hidden">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <th className="text-left p-3">Anbieter</th>
                    <th className="text-left p-3">Zweck</th>
                    <th className="text-left p-3">Sitz / Datentransfer</th>
                    <th className="text-left p-3">Datenschutz</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Manus Platform</td>
                    <td className="p-3">Hosting, Authentifizierung (OAuth), LLM, Whisper API, Datenbankbetrieb</td>
                    <td className="p-3">USA / EU-SCCs</td>
                    <td className="p-3">
                      <a href="https://manus.im/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">manus.im/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Brevo (Sendinblue)</td>
                    <td className="p-3">Newsletter-Versand (E-Mail-Marketing)</td>
                    <td className="p-3">EU (Frankreich)</td>
                    <td className="p-3">
                      <a href="https://www.brevo.com/de/legal/privacypolicy/" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">brevo.com/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">ElevenLabs</td>
                    <td className="p-3">Text-to-Speech (MA-Stimme, optional)</td>
                    <td className="p-3">USA / EU-SCCs</td>
                    <td className="p-3">
                      <a href="https://elevenlabs.io/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">elevenlabs.io/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Google Cloud TTS</td>
                    <td className="p-3">Text-to-Speech (MA-Stimme, optional)</td>
                    <td className="p-3">USA / EU-SCCs, Standardvertragsklauseln</td>
                    <td className="p-3">
                      <a href="https://cloud.google.com/terms/data-processing-terms" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">cloud.google.com/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Mistral AI</td>
                    <td className="p-3">Text-to-Speech / Sprachsynthese (Voxtral TTS, MA-Stimme)</td>
                    <td className="p-3">EU (Frankreich, Paris) – kein Drittlandtransfer</td>
                    <td className="p-3">
                      <a href="https://legal.mistral.ai/terms/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">legal.mistral.ai/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Stripe, Inc.</td>
                    <td className="p-3">Zahlungsabwicklung (RAUM 36 Abo, Stimmklanganalyse). Stripe verarbeitet Zahlungsdaten (Kartendaten, Rechnungsadresse) als eigenverantwortlicher Verantwortlicher gemäß Art. 4 Nr. 7 DSGVO. Wir übermitteln Name, E-Mail-Adresse und Bestellbetrag.</td>
                    <td className="p-3">USA / EU-SCCs, EU-US Data Privacy Framework</td>
                    <td className="p-3">
                      <a href="https://stripe.com/de/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">stripe.com/privacy</a>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300 font-medium">Google Fonts</td>
                    <td className="p-3">Einbindung von Schriftarten (Inter, Playfair Display, Cinzel). Beim Seitenaufruf wird Ihre IP-Adresse an Google-Server übertragen, um die Schriftdateien zu laden.</td>
                    <td className="p-3">USA / EU-SCCs, EU-US Data Privacy Framework</td>
                    <td className="p-3">
                      <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">policies.google.com/privacy</a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-zinc-500">
              Alle Drittanbieter mit Sitz außerhalb der EU/EWR werden auf Basis von
              EU-Standardvertragsklauseln (SCCs) gemäß Art. 46 Abs. 2 lit. c DSGVO eingesetzt,
              um ein angemessenes Schutzniveau für internationale Datentransfers zu gewährleisten.
            </p>
          </section>

          {/* 6. Newsletter */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">6. Newsletter (Double-Opt-In)</h2>
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
          </section>

          {/* 7. Nutzerkonto */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">7. Nutzerkonto (Manus OAuth)</h2>
            <p>
              Für die Nutzung bestimmter Funktionen (z. B. gespeicherte Analysen, Planer,
              Einkaufsliste) können Sie sich über Manus OAuth anmelden. Dabei werden Name,
              E-Mail-Adresse und eine eindeutige Nutzer-ID gespeichert. Die Authentifizierung
              erfolgt über einen verschlüsselten Session-Cookie (JWT). Es werden keine Passwörter
              auf unseren Servern gespeichert.
            </p>
            <p>
              <strong className="text-white">Datenlöschung:</strong> Sie können Ihr Konto und alle
              damit verbundenen Daten jederzeit durch eine E-Mail an{" "}
              <a href="mailto:LKRforschung@gmail.com" className="text-orange-400 hover:underline">
                LKRforschung@gmail.com
              </a>{" "}
              löschen lassen. Wir werden Ihr Konto und alle personenbezogenen Daten innerhalb von
              30 Tagen nach Eingang Ihrer Anfrage vollständig löschen (Art. 17 DSGVO).
            </p>
            <p>
              <strong className="text-white">Datenexport:</strong> Sie haben das Recht, Ihre
              gespeicherten Daten in einem maschinenlesbaren Format (JSON) zu erhalten
              (Art. 20 DSGVO). Bitte wenden Sie sich dazu per E-Mail an uns.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. b DSGVO
              (Vertragserfüllung).
            </p>
          </section>

          {/* 8. Push-Benachrichtigungen */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">8. Web-Push-Benachrichtigungen</h2>
            <p>
              Wenn Sie die Erinnerungsfunktion aktivieren, können Sie Web-Push-Benachrichtigungen
              abonnieren. Dafür wird ein Push-Subscription-Objekt (bestehend aus Endpoint-URL,
              öffentlichem und privatem Schlüssel) in unserer Datenbank gespeichert. Diese Daten
              werden ausschließlich für den Versand von Erinnerungen verwendet, die Sie selbst
              eingestellt haben.
            </p>
            <p>
              Sie können Push-Benachrichtigungen jederzeit in den Einstellungen Ihres Browsers
              oder in der App deaktivieren. Nach der Deaktivierung wird Ihre Subscription aus
              unserer Datenbank gelöscht.
            </p>
            <p>
              <strong className="text-white">Rechtsgrundlage:</strong> Art. 6 Abs. 1 lit. a DSGVO
              (Einwilligung).
            </p>
          </section>

          {/* 9. Cookies */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">9. Cookies und ähnliche Technologien</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies (Session-Cookie
              für die Authentifizierung). Es werden keine Tracking-, Werbe- oder
              Analyse-Cookies eingesetzt. Technisch notwendige Cookies bedürfen gemäß § 25 Abs. 2
              TDDDG (ehemals TTDSG) keiner gesonderten Einwilligung.
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-zinc-500 border-b border-zinc-800">
                    <th className="text-left pb-2">Cookie-Name</th>
                    <th className="text-left pb-2">Zweck</th>
                    <th className="text-left pb-2">Typ</th>
                    <th className="text-left pb-2">Laufzeit</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="py-2 text-zinc-300">app_session_id</td>
                    <td className="py-2">Anmeldestatus (signiertes JWT mit Nutzer-ID)</td>
                    <td className="py-2">Technisch notwendig</td>
                    <td className="py-2">1 Jahr (wird bei jedem Besuch automatisch verlängert)</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-zinc-500">
              Wir verwenden keine Analyse-Dienste wie Google Analytics, keine Werbenetzwerke und
              keine Social-Media-Tracking-Pixel. Ihre Nutzung dieser Website wird nicht für
              Werbezwecke ausgewertet.
            </p>
          </section>

          {/* 10. Server-Log-Dateien */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">10. Server-Log-Dateien</h2>
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

          {/* 11. Datensicherheit */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">11. Datensicherheit</h2>
            <p>
              Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten gegen
              unbefugten Zugriff, Verlust oder Missbrauch zu schützen:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2 text-sm">
              {[
                ["SSL/TLS-Verschlüsselung", "Alle Datenübertragungen zwischen Ihrem Browser und unseren Servern sind verschlüsselt (HTTPS)."],
                ["Verschlüsselung in Ruhe", "Alle in der Datenbank gespeicherten Daten werden verschlüsselt gespeichert (AES-256)."],
                ["JWT-Authentifizierung", "Session-Tokens werden kryptografisch signiert und haben eine begrenzte Laufzeit."],
                ["Zugriffskontrolle", "Jeder Nutzer kann ausschließlich auf seine eigenen Daten zugreifen. Serverseitige Autorisierung bei jedem API-Aufruf."],
                ["Keine Passwortspeicherung", "Wir speichern keine Passwörter. Die Authentifizierung erfolgt über Manus OAuth."],
                ["Datensparsamkeit", "Wir erheben nur die Daten, die für die jeweilige Funktion technisch notwendig sind (Art. 5 Abs. 1 lit. c DSGVO)."],
              ].map(([title, desc]) => (
                <div key={title} className="flex gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="min-w-[200px]">
                    <p className="text-zinc-300 font-medium">{title}</p>
                  </div>
                  <p className="text-zinc-500">{desc}</p>
                </div>
              ))}
            </div>
            <p className="text-sm text-zinc-500">
              Im Falle einer Datenschutzverletzung, die voraussichtlich zu einem Risiko für Ihre
              Rechte und Freiheiten führt, werden wir die zuständige Aufsichtsbehörde innerhalb
              von 72 Stunden gemäß Art. 33 DSGVO benachrichtigen und Sie unverzüglich informieren,
              sofern ein hohes Risiko besteht (Art. 34 DSGVO).
            </p>
          </section>

          {/* 12. Ihre Rechte */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">12. Ihre Rechte (Art. 15–22 DSGVO)</h2>
            <p>
              Sie haben gegenüber uns folgende Rechte hinsichtlich Ihrer personenbezogenen Daten:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 space-y-2 text-sm">
              {[
                ["Recht auf Auskunft", "Art. 15 DSGVO", "Welche Daten wir über Sie gespeichert haben, woher sie stammen und zu welchem Zweck sie verarbeitet werden."],
                ["Recht auf Berichtigung", "Art. 16 DSGVO", "Korrektur unrichtiger oder unvollständiger Daten."],
                ["Recht auf Löschung", "Art. 17 DSGVO", "Vollständige Datenlöschung auf Anfrage (\"Recht auf Vergessenwerden\")."],
                ["Recht auf Einschränkung", "Art. 18 DSGVO", "Einschränkung der Verarbeitung in bestimmten Fällen."],
                ["Recht auf Widerspruch", "Art. 21 DSGVO", "Widerspruch gegen die Verarbeitung auf Basis berechtigter Interessen."],
                ["Recht auf Datenübertragbarkeit", "Art. 20 DSGVO", "Export Ihrer Daten in maschinenlesbarem Format (JSON/CSV)."],
                ["Recht auf Widerruf der Einwilligung", "Art. 7 Abs. 3 DSGVO", "Jederzeit widerrufbar, ohne Angabe von Gründen."],
                ["Recht auf Beschwerde", "Art. 77 DSGVO", "Beschwerde bei der zuständigen Datenschutz-Aufsichtsbehörde."],
              ].map(([right, article, desc]) => (
                <div key={right} className="flex gap-3 py-2 border-b border-zinc-800/50 last:border-0">
                  <div className="min-w-[200px]">
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

          {/* 13. Beschwerderecht */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">13. Beschwerderecht bei der Aufsichtsbehörde</h2>
            <p>
              Sie haben das Recht, sich bei einer nationalen Datenschutz-Aufsichtsbehörde über die
              Verarbeitung Ihrer personenbezogenen Daten durch uns zu beschweren (Art. 77 DSGVO
              i. V. m. § 19 BDSG).
            </p>
            <p>
              Zuständig ist die Aufsichtsbehörde des Bundeslandes, in dem Sie Ihren Wohnsitz haben,
              oder – für bundesweite Angelegenheiten – der:
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Bundesbeauftragte für den Datenschutz und die Informationsfreiheit (BfDI)</p>
              <p>Graurheindorfer Str. 153, 53117 Bonn</p>
              <p>
                Web:{" "}
                <a href="https://www.bfdi.bund.de" target="_blank" rel="noopener noreferrer" className="text-orange-400 hover:underline">
                  www.bfdi.bund.de
                </a>
              </p>
            </div>
          </section>

          {/* 14. Cookies */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">14. Cookies und lokale Speicherung</h2>
            <p>
              Diese Website verwendet ausschließlich technisch notwendige Cookies und
              Browser-Speichermechanismen. Es werden keine Tracking-, Werbe- oder
              Analyse-Cookies eingesetzt.
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-zinc-900 text-zinc-400 border-b border-zinc-800">
                    <th className="text-left p-3">Name / Typ</th>
                    <th className="text-left p-3">Zweck</th>
                    <th className="text-left p-3">Speicherdauer</th>
                    <th className="text-left p-3">Rechtsgrundlage</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  <tr>
                    <td className="p-3 text-zinc-300">app_session_id<br/><span className="text-zinc-500 text-xs">HTTP-Cookie, HttpOnly, Secure</span></td>
                    <td className="p-3">Authentifizierung und Sitzungsverwaltung nach Login (signiertes JWT)</td>
                    <td className="p-3">1 Jahr; wird bei jedem Besuch automatisch verlängert (ITP-Schutz für iOS Safari)</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">sidebar_state<br/><span className="text-zinc-500 text-xs">HTTP-Cookie</span></td>
                    <td className="p-3">Speichert den Zustand der Navigationsleiste (auf- oder zugeklappt)</td>
                    <td className="p-3">7 Tage</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b DSGVO</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">localStorage (Browser)</td>
                    <td className="p-3">Einwilligungsstatus Sprachverarbeitung, App-Einstellungen (z. B. Weckzeit, Rituale)</td>
                    <td className="p-3">Bis zur manuellen Löschung im Browser</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. b / lit. a DSGVO</td>
                  </tr>
                  <tr>
                    <td className="p-3 text-zinc-300">Push-Subscription (Browser)</td>
                    <td className="p-3">Web-Push-Benachrichtigungen für Erinnerungen</td>
                    <td className="p-3">Bis zur Abmeldung vom Push-Dienst</td>
                    <td className="p-3">Art. 6 Abs. 1 lit. a DSGVO</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="text-sm text-zinc-500">
              Da ausschließlich technisch notwendige Cookies verwendet werden, ist keine
              Cookie-Einwilligung (Consent-Banner) erforderlich (§ 25 Abs. 2 Nr. 2 TTDSG).
              Sie können Cookies und lokale Speicherdaten jederzeit über die
              Einstellungen Ihres Browsers löschen.
            </p>
          </section>

        </div>

        {/* DSGVO-Einwilligung widerrufen */}
        <section className="space-y-3 bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
          <h2 className="text-white text-xl font-medium">Einwilligung zur Sprachverarbeitung widerrufen</h2>
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
