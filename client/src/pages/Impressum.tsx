import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, CheckCircle2, AlertCircle, ExternalLink } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { trpc } from "@/lib/trpc";

const ANFRAGE_TYPEN = [
  { value: "auskunft", label: "Auskunft (Art. 15 DSGVO)" },
  { value: "berichtigung", label: "Berichtigung (Art. 16 DSGVO)" },
  { value: "loeschung", label: "Löschung (Art. 17 DSGVO)" },
  { value: "einschraenkung", label: "Einschränkung der Verarbeitung (Art. 18 DSGVO)" },
  { value: "widerspruch", label: "Widerspruch (Art. 21 DSGVO)" },
  { value: "datenuebertragbarkeit", label: "Datenübertragbarkeit (Art. 20 DSGVO)" },
  { value: "sonstiges", label: "Sonstiges" },
] as const;

type AnfrageTyp = (typeof ANFRAGE_TYPEN)[number]["value"];

function DatenschutzFormular() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [anfrageTyp, setAnfrageTyp] = useState<AnfrageTyp>("auskunft");
  const [nachricht, setNachricht] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutation = trpc.kontakt.datenschutzAnfrage.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      setError(null);
    },
    onError: (err) => {
      setError(err.message || "Ein Fehler ist aufgetreten. Bitte versuche es erneut.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    mutation.mutate({ name, email, anfrageTyp, nachricht: nachricht || undefined });
  };

  if (submitted) {
    return (
      <div className="bg-zinc-900/60 border border-green-800/40 rounded-xl p-6 flex gap-4 items-start">
        <CheckCircle2 className="w-6 h-6 text-green-500 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-white font-medium mb-1">Anfrage eingegangen</p>
          <p className="text-zinc-400 text-sm">
            Wir haben deine Anfrage erhalten und werden uns bei dir melden.
            Eine Bestätigung wurde an <span className="text-orange-400">{email}</span> gesendet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">Name *</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Dein vollständiger Name"
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm text-zinc-400">E-Mail-Adresse *</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="deine@email.de"
            className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">Art der Anfrage *</label>
        <select
          value={anfrageTyp}
          onChange={(e) => setAnfrageTyp(e.target.value as AnfrageTyp)}
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors appearance-none"
        >
          {ANFRAGE_TYPEN.map((t) => (
            <option key={t.value} value={t.value} className="bg-zinc-900">
              {t.label}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-sm text-zinc-400">Nachricht (optional)</label>
        <textarea
          value={nachricht}
          onChange={(e) => setNachricht(e.target.value)}
          rows={4}
          maxLength={2000}
          placeholder="Beschreibe dein Anliegen genauer..."
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/20 transition-colors resize-none"
        />
        <p className="text-xs text-zinc-600 text-right">{nachricht.length}/2000</p>
      </div>

      {error && (
        <div className="flex gap-2 items-start text-red-400 text-sm bg-red-900/20 border border-red-800/30 rounded-lg p-3">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <Button
        type="submit"
        disabled={mutation.isPending}
        className="w-full bg-orange-500 hover:bg-orange-600 text-white gap-2"
      >
        {mutation.isPending ? (
          <span className="animate-pulse">Wird gesendet...</span>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Anfrage absenden
          </>
        )}
      </Button>
    </form>
  );
}

export function Impressum() {
  return (
    <div className="min-h-screen bg-black text-zinc-300 font-sans">
      <div className="max-w-3xl mx-auto px-8 py-12 space-y-12">
        <Link href="/">
          <Button variant="ghost" className="text-zinc-500 hover:text-white pl-0 gap-2">
            <ArrowLeft className="w-4 h-4" /> ZUR HAUPTSEITE
          </Button>
        </Link>

        <div className="space-y-4">
          <h1 className="text-4xl font-light text-white tracking-tight">Impressum</h1>
          <p className="text-zinc-500 text-sm uppercase tracking-widest">
            Angaben gemäß § 5 DDG · Stand: April 2026
          </p>
          <p className="text-zinc-600 text-xs">
            Hinweis: Das Telemediengesetz (TMG) wurde am 14. Mai 2024 durch das
            Digitale-Dienste-Gesetz (DDG) ersetzt. Die Impressumspflicht ergibt sich
            nunmehr aus § 5 DDG.
          </p>
        </div>

        <div className="space-y-10 text-base font-light leading-relaxed text-zinc-400">

          {/* 1. Anbieter */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">1. Anbieter (Diensteanbieter gem. § 5 DDG)</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-semibold text-base">Thomas Chochola</p>
              <p className="text-zinc-400">MDI – Multidimensionales Identitätssystem</p>
              <p className="text-zinc-400">KIICHwerke</p>
              <p className="mt-2">Lindacher Weg 17</p>
              <p>D-93128 Regenstauf</p>
              <p>Deutschland</p>
            </div>
          </section>

          {/* 2. Kontakt */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">2. Kontakt</h2>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 min-w-[80px]">Telefon</span>
                <a href="tel:+4915123040661" className="text-zinc-300 hover:text-white transition-colors">
                  +49 151 23040661
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 min-w-[80px]">E-Mail</span>
                <a href="mailto:LKRforschung@gmail.com" className="text-orange-400 hover:underline">
                  LKRforschung@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-zinc-500 min-w-[80px]">Website</span>
                <a href="https://www.kiich.de" target="_blank" rel="noopener noreferrer" className="text-zinc-300 hover:text-white flex items-center gap-1 transition-colors">
                  www.kiich.de <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
            <p className="text-sm text-zinc-500">
              Gemäß § 5 Abs. 1 Nr. 2 DDG ist eine E-Mail-Adresse als schnelle elektronische
              Kontaktmöglichkeit anzugeben. Anfragen werden in der Regel innerhalb von 5 Werktagen
              beantwortet.
            </p>
          </section>

          {/* 3. Tätigkeitsbeschreibung */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">3. Art des Dienstes</h2>
            <p>
              kiich.de / MA ist ein nicht-kommerzieller Forschungs- und Entwicklungsdienst im
              Bereich KI-gestützter Selbstwahrnehmung und Frequenzanalyse. Der Dienst wird als
              Einzelperson (Freiberufler / Privatperson) betrieben. Es liegt kein eingetragenes
              Gewerbe vor. Eine Umsatzsteuer-Identifikationsnummer (USt-IdNr.) ist nicht vorhanden,
              da der Dienst nicht umsatzsteuerpflichtig ist.
            </p>
            <p className="text-sm text-zinc-500">
              Sollte sich der Betriebsstatus ändern (z. B. durch Gewerbeanmeldung), wird dieses
              Impressum entsprechend aktualisiert.
            </p>
          </section>

          {/* 4. Verantwortlich für den Inhalt */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">4. Verantwortlich für den Inhalt</h2>
            <p className="text-sm text-zinc-500">gemäß § 18 Abs. 2 Medienstaatsvertrag (MStV):</p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-sm space-y-1">
              <p className="text-white font-medium">Thomas Chochola</p>
              <p>Lindacher Weg 17</p>
              <p>D-93128 Regenstauf</p>
              <p>Deutschland</p>
            </div>
          </section>

          {/* 5. Plattform der EU-Kommission */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">5. Online-Streitbeilegung (OS-Plattform)</h2>
            <p>
              Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit.
              Diese Plattform dient als Anlaufstelle zur außergerichtlichen Beilegung von Streitigkeiten
              aus Online-Kaufverträgen und Online-Dienstleistungsverträgen.
            </p>
            <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-4 text-sm">
              <a
                href="https://ec.europa.eu/consumers/odr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-400 hover:underline flex items-center gap-2"
              >
                https://ec.europa.eu/consumers/odr
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
            <p className="text-sm text-zinc-500">
              Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer
              Verbraucherschlichtungsstelle teilzunehmen (§ 36 VSBG). Für Nutzer aus der EU besteht
              jedoch die Möglichkeit, die obige Plattform zu nutzen.
            </p>
          </section>

          {/* 6. Haftungsausschluss */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">6. Haftungsausschluss</h2>

            <div className="space-y-4 text-sm text-zinc-400">
              <div>
                <p className="text-zinc-300 font-medium mb-1">Haftung für Inhalte</p>
                <p>
                  Als Diensteanbieter sind wir gemäß § 7 Abs. 1 DDG für eigene Inhalte auf diesen
                  Seiten nach den allgemeinen Gesetzen verantwortlich. Nach §§ 8 bis 10 DDG sind wir
                  als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte fremde
                  Informationen zu überwachen oder nach Umständen zu forschen, die auf eine
                  rechtswidrige Tätigkeit hinweisen. Verpflichtungen zur Entfernung oder Sperrung der
                  Nutzung von Informationen nach den allgemeinen Gesetzen bleiben hiervon unberührt.
                </p>
              </div>

              <div>
                <p className="text-zinc-300 font-medium mb-1">Haftung für Links</p>
                <p>
                  Unser Angebot enthält Links zu externen Webseiten Dritter, auf deren Inhalte wir
                  keinen Einfluss haben. Deshalb können wir für diese fremden Inhalte auch keine
                  Gewähr übernehmen. Für die Inhalte der verlinkten Seiten ist stets der jeweilige
                  Anbieter oder Betreiber der Seiten verantwortlich. Die verlinkten Seiten wurden zum
                  Zeitpunkt der Verlinkung auf mögliche Rechtsverstöße überprüft. Rechtswidrige
                  Inhalte waren zum Zeitpunkt der Verlinkung nicht erkennbar. Eine permanente
                  inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete Anhaltspunkte
                  einer Rechtsverletzung nicht zumutbar. Bei Bekanntwerden von Rechtsverletzungen
                  werden wir derartige Links umgehend entfernen.
                </p>
              </div>

              <div>
                <p className="text-zinc-300 font-medium mb-1">Urheberrecht</p>
                <p>
                  Die durch den Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten
                  unterliegen dem deutschen Urheberrecht (UrhG). Die Vervielfältigung, Bearbeitung,
                  Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes
                  bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
                  Downloads und Kopien dieser Seite sind nur für den privaten, nicht kommerziellen
                  Gebrauch gestattet. Soweit die Inhalte auf dieser Seite nicht vom Betreiber erstellt
                  wurden, werden die Urheberrechte Dritter beachtet. Insbesondere werden Inhalte
                  Dritter als solche gekennzeichnet. Sollten Sie trotzdem auf eine
                  Urheberrechtsverletzung aufmerksam werden, bitten wir um einen entsprechenden
                  Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
                  umgehend entfernen.
                </p>
              </div>

              <div>
                <p className="text-zinc-300 font-medium mb-1">KI-generierte Inhalte</p>
                <p>
                  Teile dieser Website wurden mit Unterstützung von KI-Werkzeugen erstellt oder
                  optimiert. Die inhaltliche Verantwortung und redaktionelle Kontrolle obliegt
                  ausschließlich dem Betreiber (Thomas Chochola). KI-generierte Inhalte werden vor
                  der Veröffentlichung geprüft und freigegeben.
                </p>
              </div>
            </div>
          </section>

          {/* 7. Hinweis zu medizinischen / gesundheitlichen Inhalten */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">7. Medizinischer Haftungsausschluss</h2>
            <div className="bg-amber-950/30 border border-amber-800/30 rounded-xl p-5 text-sm text-amber-200/70">
              <p className="text-amber-300 font-medium mb-2">Wichtiger Hinweis</p>
              <p>
                Die Inhalte dieser Website, insbesondere die MDI-Frequenzanalyse und die
                MA-Funktion, dienen ausschließlich der persönlichen Selbstwahrnehmung und
                Forschung. Sie ersetzen in keinem Fall eine professionelle medizinische,
                psychologische oder therapeutische Beratung, Diagnose oder Behandlung.
                Bei gesundheitlichen Beschwerden wenden Sie sich bitte an einen approbierten
                Arzt oder Therapeuten.
              </p>
            </div>
          </section>

          {/* 8. Datenschutz-Kurzübersicht */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">8. Datenschutz</h2>
            <p>
              Ausführliche Informationen zur Verarbeitung Ihrer personenbezogenen Daten finden Sie
              in unserer Datenschutzerklärung:
            </p>
            <Link href="/datenschutz">
              <div className="bg-zinc-900/60 border border-zinc-800 hover:border-orange-500/40 rounded-xl p-5 text-sm flex items-center justify-between transition-colors cursor-pointer group">
                <div>
                  <p className="text-white font-medium group-hover:text-orange-400 transition-colors">Datenschutzerklärung lesen</p>
                  <p className="text-zinc-500 text-xs mt-0.5">DSGVO · BDSG · Stand: April 2026</p>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-600 group-hover:text-orange-400 transition-colors" />
              </div>
            </Link>
          </section>

          {/* 9. Datenschutzanfragen-Formular */}
          <section className="space-y-3">
            <h2 className="text-white text-xl font-medium">9. Datenschutzanfragen (Art. 15–22 DSGVO)</h2>
            <p>
              Du kannst deine Datenschutzrechte direkt hier ausüben. Wähle die Art deiner Anfrage
              und wir melden uns bei dir.
            </p>
            <DatenschutzFormular />
          </section>

        </div>

        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Thomas Chochola / KIICHwerke. Alle Rechte vorbehalten.</p>
          <p className="mt-1">Stand: April 2026 · § 5 DDG</p>
        </div>
      </div>
    </div>
  );
}
