import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, Bell } from "lucide-react";
import { Link } from "wouter";

export default function MomentaufnahmeTeaser() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-400/30 border-t-violet-400 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
              <ArrowLeft className="w-4 h-4" />
            </button>
          </Link>
          <div>
            <h1 className="text-lg font-bold tracking-wide">MOMENTAUFNAHME</h1>
            <p className="text-xs text-white/40">Dein zweites Gehirn · demnächst verfügbar</p>
          </div>
        </div>
        {!isAuthenticated && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => (window.location.href = getLoginUrl())}
            className="text-white/50 hover:text-white gap-1.5 text-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            Anmelden
          </Button>
        )}
      </header>

      {/* Hauptinhalt */}
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-12">

        {/* Hero */}
        <div className="w-full max-w-sm text-center mb-8">
          <div className="text-5xl mb-5">📸</div>
          <h2 className="text-2xl font-black tracking-tight text-white mb-3 leading-tight">
            NIE WIEDER VERGESSEN<br />
            <span className="text-violet-400">WAS DU BEHALTEN MÖCHTEST</span>
          </h2>
          <p className="text-white/50 text-sm leading-relaxed">
            Täglich 3 Minuten sprechen. KI analysiert deine Befindlichkeit und erstellt ein persönliches Reflexions-Summary.
          </p>
        </div>

        {/* Zitat-Karte */}
        <div className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-violet-900/30 to-blue-900/20 border border-violet-500/20">
          <p className="text-white/60 text-sm italic leading-relaxed">
            „Die besten Ideen fallen ein, wenn man loslässt – beim Duschen, auf der Toilette,
            beim Spazierengehen, beim Angeln..."
          </p>
          <p className="text-violet-400 text-xs mt-3 font-medium">
            ✦ Der MOMENT entscheidet – erlöse deine wichtigsten Momente in die Zeitlosigkeit.
          </p>
        </div>

        {/* Kühlschrankfoto Marketing-Element */}
        <div className="w-full max-w-sm mx-auto mb-8">
          <div className="grid grid-cols-1 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Bild */}
            <div className="relative overflow-hidden">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/WhatsAppImage2026-04-12at08.29.43_17f89398.jpeg"
                alt="Kühlschranktür mit Zetteln und Post-its"
                className="w-full h-48 object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div className="absolute bottom-3 left-4">
                <span className="bg-black/60 text-white/70 text-xs px-3 py-1 rounded-full border border-white/10">
                  Margos Kühlschranktür · April 2026
                </span>
              </div>
            </div>
            {/* Text */}
            <div className="bg-[#0d0d14] p-6 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-violet-400 text-xs font-black tracking-widest uppercase">Kennst du das?</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                Die Zettelwirtschaft<br />
                <span className="text-violet-400">hat ein Ende.</span>
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                Kühlschranktür, Schreibtisch, Notizbuch — überall Zettel, Post-its und handgeschriebene Listen. Gedanken, die flüchtig sind. Erkenntnisse, die verloren gehen.
              </p>
              <p className="text-zinc-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">MOMENTAUFNAHME</span> gibt deiner inneren Stimme einen würdigen Ort. Einsprechen, hören, verstehen — in Sekunden.
              </p>
            </div>
          </div>
        </div>

        {/* Mobilgeräte-Vorteil */}
        <div className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 flex items-start gap-3">
          <span className="text-2xl mt-0.5">📱</span>
          <div>
            <p className="text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-1">Immer dabei · überall</p>
            <p className="text-white/60 text-sm leading-relaxed">
              MA läuft auf jedem Gerät — Handy, Tablet, Computer. Deine Aufnahmen sind sofort auf allen Geräten sichtbar. Nimm im Wald auf, lies das Summary am Abend am Computer, höre es auf dem Handy beim Einschlafen.
            </p>
            <p className="text-indigo-400/60 text-xs mt-2">
              ✔ Kein Download nötig · einfach kiich.de im Browser öffnen
            </p>
          </div>
        </div>

        {/* MA als Hüterin */}
        <div className="w-full max-w-sm mx-auto mb-10 px-2">
          <p className="text-white/40 text-xs leading-relaxed">
            MA ist wie eine Mutter, die alles für dich bereit hält – behutsam, strukturiert,
            vollständig.{" "}
            <strong className="text-white/80">Am Abend bist du erstaunt und dankbar: ALLES DA! – was schon vergessen war – MA hat es aufbereitet und zusammengefasst.</strong>{" "}
            Die Hüterin deines geistigen Potentials. Dein zweites Gehirn.
            Deine Chefsekretärin. Alles nur dir selbst zugänglich –{" "}
            <strong className="text-white/80">gesichert als Schatz deiner einzigartigen IDENTITÄT.</strong>
          </p>
        </div>

        {/* Coming Soon Badge */}
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-5 py-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-bold tracking-widest uppercase">Demnächst verfügbar</span>
          </div>
          <p className="text-white/30 text-xs mb-6">
            MOMENTAUFNAHME befindet sich in der finalen Entwicklungsphase.<br />
            Sei dabei, wenn es losgeht.
          </p>
          {isAuthenticated ? (
            <div className="flex items-center justify-center gap-2 text-white/30 text-xs">
              <Bell className="w-3.5 h-3.5" />
              <span>Du wirst benachrichtigt, sobald MOMENTAUFNAHME verfügbar ist.</span>
            </div>
          ) : (
            <Button
              onClick={() => (window.location.href = getLoginUrl())}
              className="bg-violet-600 hover:bg-violet-500 text-white gap-2 px-6"
            >
              <LogIn className="w-4 h-4" />
              Jetzt anmelden &amp; informiert bleiben
            </Button>
          )}
        </div>
      </main>
    </div>
  );
}
