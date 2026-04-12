import { Button } from "@/components/ui/button";
import { ArrowLeft, Send, CheckCircle2, AlertCircle } from "lucide-react";
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
            Wir haben deine Anfrage erhalten und werden sie innerhalb von 30 Tagen bearbeiten (Art. 12 Abs. 3 DSGVO).
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
      <p className="text-xs text-zinc-600 text-center">
        Wir antworten innerhalb von 30 Tagen (Art. 12 Abs. 3 DSGVO).
      </p>
    </form>
  );
}

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

          {/* Datenschutzanfragen-Formular */}
          <section>
            <h2 className="text-white text-xl font-medium mb-2">Datenschutzanfragen (Art. 15–22 DSGVO)</h2>
            <p className="text-base text-zinc-400 mb-5">
              Du kannst deine Datenschutzrechte direkt hier ausüben. Wähle die Art deiner Anfrage
              und wir melden uns innerhalb von 30 Tagen bei dir.
            </p>
            <DatenschutzFormular />
          </section>

        </div>

        <div className="pt-12 border-t border-zinc-800 text-center text-sm text-zinc-600">
          <p>© {new Date().getFullYear()} Thomas Chochola / KIICHwerke. Alle Rechte vorbehalten.</p>
        </div>
      </div>
    </div>
  );
}
