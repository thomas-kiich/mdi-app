/**
 * Stimmklanganalyse – Buchungsseite
 *
 * Einmalzahlung €150 für:
 * - 3-tägige Selbstanalyse mit der KIICH-App
 * - Persönliches Abschluss-Coaching mit Thomas Chochola
 */

import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Mic,
  Calendar,
  MessageSquare,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Shield,
  X,
} from "lucide-react";
import { Link } from "wouter";

export default function Stimmklanganalyse() {
  const { isAuthenticated } = useAuth();
  const [datenschutzOpen, setDatenschutzOpen] = useState(false);

  const checkoutMutation = trpc.raum36.createCheckoutStimmklang.useMutation({
    onSuccess: (data) => {
      if (data.url) {
        toast.info("Du wirst zu Stripe weitergeleitet…");
        window.open(data.url, "_blank");
      }
    },
    onError: (err) => {
      toast.error(err.message);
    },
  });

  // Checkout-Ergebnis aus URL-Params auslesen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success(
        "Vielen Dank! Thomas wird sich in Kürze bei dir melden, um den Coaching-Termin zu vereinbaren."
      );
      window.history.replaceState({}, "", "/stimmklanganalyse");
    } else if (params.get("checkout") === "cancelled") {
      toast.info("Checkout abgebrochen.");
      window.history.replaceState({}, "", "/stimmklanganalyse");
    }
  }, []);

  const handleBuchen = () => {
    if (!isAuthenticated) {
      window.location.href = getLoginUrl("/stimmklanganalyse");
      return;
    }
    checkoutMutation.mutate({ origin: window.location.origin });
  };

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Navigation */}
      <div className="px-6 pt-6">
        <div className="max-w-4xl mx-auto">
          <Link href="/" className="inline-flex items-center gap-1 text-xs font-mono text-zinc-600 hover:text-orange-500 uppercase tracking-widest transition-colors">
            <ArrowLeft className="w-3 h-3" /> Startseite
          </Link>
        </div>
      </div>

      {/* Hero */}
      <section className="border-b border-zinc-800 px-6 py-20 md:py-32">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block border border-orange-600 px-3 py-1 text-xs font-mono text-orange-500 mb-8 uppercase tracking-widest">
            Einmalige Analyse
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-none mb-6">
            Stimmklang&shy;analyse
          </h1>
          <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed mb-4">
            Deine Stimme als Spiegel deiner Identität.
          </p>
          <p className="text-zinc-500 max-w-xl leading-relaxed mb-12">
            3 Tage Selbstanalyse mit der KIICH-App. Danach ein persönliches Coaching-Gespräch
            mit Thomas Chochola – er erklärt dir dein Ergebnis und zeigt dir, was es bedeutet.
          </p>

          <div className="flex flex-col sm:flex-row items-start gap-6">
            <div>
              <Button
                onClick={handleBuchen}
                disabled={checkoutMutation.isPending}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold text-lg px-8 py-6 h-auto rounded-none border-0"
              >
                {checkoutMutation.isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                Jetzt buchen
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <p className="text-zinc-500 text-sm mt-3">€ 150 · Einmalzahlung</p>
            </div>
          </div>
        </div>
      </section>

      {/* Ablaufbeschreibung – Thomas' Text */}
      <section className="px-6 py-20 border-b border-zinc-800 bg-zinc-950">
        <div className="max-w-4xl mx-auto">
          <div className="inline-block border border-orange-600/40 px-3 py-1 text-xs font-mono text-orange-500/80 mb-8 uppercase tracking-widest">
            Hier bestimmst du deinen Stimmklang
          </div>

          <div className="space-y-6 max-w-3xl">
            <p className="text-zinc-300 leading-relaxed text-lg">
              <span className="text-orange-500 font-bold">Voraussetzung:</span> Abschluss der Pubertät.
              Erst danach sind die Hohlraumsysteme in deinem Körper voll ausgebildet. Sie stellen die
              Resonanzräume dar, welche beim aktiven Nützen deiner Stimme die einzigartigen Frequenzen
              hörbar machen.
            </p>

            <p className="text-zinc-400 leading-relaxed">
              Das Prozedere teilt sich in zwei Hauptabschnitte. Im ersten Abschnitt führst du die
              beschriebene Frequenzanalyse deiner Stimme durch. Du wirst detailgenau durch den Ablauf
              geführt. In drei aufeinanderfolgenden Tagen vollziehst du dieses Ritual und erhältst die
              jeweils produzierten Frequenzen deiner Stimme. Alles wird automatisch gespeichert und
              nach den drei Tagen final ausgewertet.
            </p>

            <p className="text-zinc-400 leading-relaxed">
              Danach führst du ein Gespräch mit Thomas. Er bespricht mit dir eingehend das Ergebnis
              und führt eine finale Justierung deines Stimmklangs durch. Als Abschluss erklärt dir
              Thomas die Möglichkeiten, wie du deinen Stimmklang für den Rest deines Lebens im Alltag
              nützen kannst.
            </p>

            {/* Datenschutz-Hinweis */}
            <div className="border border-zinc-700 bg-zinc-900/50 p-5 flex items-start gap-4 mt-8">
              <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-zinc-300 text-sm leading-relaxed">
                  Deine Daten sind nur Dir und Thomas zugänglich.
                </p>
                <button
                  onClick={() => setDatenschutzOpen(true)}
                  className="mt-2 text-orange-500 hover:text-orange-400 text-sm underline underline-offset-2 transition-colors"
                >
                  Zur datenschutzrechtlichen Einverständniserklärung →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ablauf Schritte */}
      <section className="px-6 py-20 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-black mb-12 tracking-tight">So läuft es ab</h2>
          <div className="space-y-0 border border-zinc-800">
            {[
              {
                step: "01",
                icon: <CheckCircle className="w-5 h-5 text-orange-500" />,
                title: "Buchung & Zugang",
                desc: "Nach der Zahlung erhältst du sofort Zugang zur MDI-Stimmklanganalyse in der KIICH-App.",
              },
              {
                step: "02",
                icon: <Mic className="w-5 h-5 text-orange-500" />,
                title: "3 Tage Selbstanalyse",
                desc: "Du führst täglich eine kurze Stimmaufnahme durch. Die App analysiert dein Frequenzspektrum und bestimmt deinen Lebensklang und Wurzelklang.",
              },
              {
                step: "03",
                icon: <Calendar className="w-5 h-5 text-orange-500" />,
                title: "Termin vereinbaren",
                desc: "Thomas kontaktiert dich per E-Mail, um einen 45-minütigen Coaching-Termin zu vereinbaren.",
              },
              {
                step: "04",
                icon: <MessageSquare className="w-5 h-5 text-orange-500" />,
                title: "Finalcoaching",
                desc: "Thomas erklärt dir dein Ergebnis, führt eine finale Justierung deines Stimmklangs durch und zeigt dir, wie du ihn für den Rest deines Lebens im Alltag nützen kannst.",
              },
            ].map((item) => (
              <div
                key={item.step}
                className="border-b border-zinc-800 last:border-b-0 p-6 flex items-start gap-6"
              >
                <div className="text-3xl font-black text-zinc-800 font-mono w-12 flex-shrink-0">
                  {item.step}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {item.icon}
                    <h3 className="font-bold">{item.title}</h3>
                  </div>
                  <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Preis */}
      <section className="px-6 py-20 border-b border-zinc-800">
        <div className="max-w-4xl mx-auto">
          <div className="border border-zinc-700 p-8 md:p-12 max-w-lg">
            <div className="text-orange-500 text-sm font-mono uppercase tracking-widest mb-4">
              Einmalzahlung
            </div>
            <div className="text-5xl font-black mb-2">€ 150</div>
            <div className="text-zinc-400 mb-8">Einmalig · Keine Folgekosten</div>
            <ul className="space-y-3 mb-10">
              {[
                "3-tägige Stimmklanganalyse",
                "Persönlicher Lebensklang & Wurzelklang",
                "45-minütiges Finalcoaching mit Thomas",
                "Finale Justierung deines Stimmklangs",
                "Dauerhafter Zugang zu deinen Ergebnissen",
              ].map((item) => (
                <li key={item} className="flex items-center gap-3 text-sm">
                  <CheckCircle className="w-4 h-4 text-orange-500 flex-shrink-0" />
                  <span className="text-zinc-300">{item}</span>
                </li>
              ))}
            </ul>
            <Button
              onClick={handleBuchen}
              disabled={checkoutMutation.isPending}
              className="w-full bg-orange-600 hover:bg-orange-500 text-white font-bold py-4 h-auto rounded-none"
            >
              {checkoutMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Jetzt buchen
            </Button>
            <p className="text-zinc-600 text-xs mt-4 text-center">
              Sichere Zahlung via Stripe · Kreditkarte, PayPal
            </p>
          </div>
        </div>
      </section>

      {/* Über die Methode */}
      <section className="px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="border-l-2 border-orange-600 pl-6">
            <p className="text-zinc-400 text-sm font-mono uppercase tracking-widest mb-4">
              Die MDI-Methode
            </p>
            <p className="text-xl text-zinc-300 leading-relaxed max-w-2xl mb-6">
              Die Musikalische Diagnose-Instrument (MDI) Methode analysiert das Frequenzspektrum
              deiner Stimme und ordnet es einem von 24 Klangtypen zu.
            </p>
            <p className="text-zinc-500 leading-relaxed max-w-2xl">
              Dein Lebensklang ist die Frequenz, die dein System am stärksten prägt.
              Der Wurzelklang ist die Basis – der tiefste Ton, der deine Erdung bestimmt.
              Beide zusammen ergeben ein Bild deiner aktuellen Schwingungsqualität.
            </p>
          </div>
        </div>
      </section>

      {/* Datenschutz-Modal */}
      {datenschutzOpen && (
        <div
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setDatenschutzOpen(false)}
        >
          <div
            className="bg-zinc-900 border border-zinc-700 max-w-2xl w-full max-h-[80vh] overflow-y-auto p-8 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setDatenschutzOpen(false)}
              className="absolute top-4 right-4 text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-6 h-6 text-orange-500" />
              <h2 className="text-xl font-black">Datenschutzrechtliche Einverständniserklärung</h2>
            </div>

            <div className="space-y-4 text-zinc-400 text-sm leading-relaxed">
              <p>
                Mit der Buchung der Stimmklanganalyse erklärst du dich einverstanden, dass
                Thomas Chochola (KIICH) deine im Rahmen der Analyse aufgezeichneten Stimmfrequenzdaten
                zum Zweck der persönlichen Auswertung und des Finalcoachings verarbeitet.
              </p>
              <p>
                <strong className="text-zinc-300">Welche Daten werden verarbeitet:</strong><br />
                Deine Stimmaufnahmen (Frequenzanalysen über 3 Tage), die daraus berechneten
                Klangparameter (Lebensklang, Wurzelklang) sowie deine Kontaktdaten (Name, E-Mail)
                für die Terminvereinbarung.
              </p>
              <p>
                <strong className="text-zinc-300">Zugriff:</strong><br />
                Deine Daten sind ausschließlich dir und Thomas Chochola zugänglich.
                Sie werden nicht an Dritte weitergegeben.
              </p>
              <p>
                <strong className="text-zinc-300">Speicherdauer:</strong><br />
                Deine Analysedaten werden dauerhaft in deinem KIICH-Konto gespeichert,
                sodass du jederzeit auf deine Ergebnisse zugreifen kannst. Du kannst die
                Löschung deiner Daten jederzeit unter{" "}
                <a href="mailto:lkrforschung@gmail.com" className="text-orange-500 hover:text-orange-400 underline">
                  lkrforschung@gmail.com
                </a>{" "}
                beantragen.
              </p>
              <p>
                <strong className="text-zinc-300">Rechtsgrundlage:</strong><br />
                Die Verarbeitung erfolgt auf Grundlage deiner Einwilligung (Art. 6 Abs. 1 lit. a DSGVO)
                sowie zur Erfüllung des Vertrags (Art. 6 Abs. 1 lit. b DSGVO).
              </p>
              <p>
                Weitere Informationen findest du in unserer{" "}
                <Link href="/datenschutz">
                  <span className="text-orange-500 hover:text-orange-400 underline cursor-pointer">
                    Datenschutzerklärung
                  </span>
                </Link>.
              </p>
            </div>

            <div className="mt-8 flex gap-3">
              <Button
                onClick={() => setDatenschutzOpen(false)}
                className="bg-orange-600 hover:bg-orange-500 text-white font-bold rounded-none flex-1"
              >
                Verstanden & Einverstanden
              </Button>
              <Button
                onClick={() => setDatenschutzOpen(false)}
                variant="outline"
                className="rounded-none border-zinc-700 text-zinc-400 hover:text-white"
              >
                Schließen
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
