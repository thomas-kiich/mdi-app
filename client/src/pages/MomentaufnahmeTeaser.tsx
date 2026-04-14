import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogIn, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "wouter";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";

export default function MomentaufnahmeTeaser() {
  const { isAuthenticated, loading } = useAuth();
  const [teaserOpen, setTeaserOpen] = useState(false);
  const [, navigate] = useLocation();

  // Eingeloggte Nutzer werden automatisch zur vollständigen App weitergeleitet
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate("/momentaufnahme/app");
    }
  }, [loading, isAuthenticated, navigate]);

  if (loading || isAuthenticated) {
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
      <main className="flex-1 flex flex-col items-center px-5 pt-4 pb-16">

        {/* 1) Hero: Kamera-Symbol + Titel + Untertitel */}
        <div className="w-full max-w-sm text-center mb-8">
          <div className="text-5xl mb-4">📸</div>
          {/* MOMENTAUFNAHME in Violett, M und A fett */}
          <h1 className="text-2xl tracking-widest uppercase text-violet-400 mb-3">
            <strong>M</strong>OMENTAUFN<strong>A</strong>HME
          </h1>
          {/* 2) Untertitel */}
          <p className="text-white font-semibold text-base leading-snug">
            Nie wieder vergessen was du behalten möchtest.
          </p>
        </div>

        {/* 4) Zitat-Karte – nur der erste Satz, ohne "Der Moment..." */}
        <div className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-violet-900/30 to-blue-900/20 border border-violet-500/20">
          <p className="text-white/60 text-sm italic leading-relaxed">
            „Die besten Ideen fallen ein, wenn man loslässt – beim Duschen, auf der Toilette,
            beim Spazierengehen, beim Angeln..."
          </p>
        </div>

        {/* 5) Kühlschrankbild – ohne Margos-Label, mit KENNST DU DAS? darunter */}
        <div className="w-full max-w-sm mx-auto mb-8">
          <div className="rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
            {/* Bild ohne Overlay-Text */}
            <div className="relative overflow-hidden">
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/WhatsAppImage2026-04-12at08.29.43_17f89398.jpeg"
                alt="Kühlschranktür mit Zetteln und Post-its"
                className="w-full h-52 object-cover object-center"
              />
            </div>
            {/* Text darunter */}
            <div className="bg-[#0d0d14] p-6 flex flex-col justify-center">
              <div className="mb-2">
                <span className="text-white text-sm font-black tracking-widest uppercase">Kennst du das?</span>
              </div>
              <h3 className="text-lg font-bold text-white mb-2 leading-tight">
                Die Zettelwirtschaft <span className="text-violet-400">hat ein Ende.</span>
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed mb-3">
                Kühlschranktür, Schreibtisch, Notizbuch — überall Zettel, Post-its und handgeschriebene Listen. Gedanken, die flüchtig sind. Erkenntnisse, die verloren gehen.
              </p>
              {/* Letzter Satz mit MA - die MOMENTAUFNAHME */}
              <p className="text-zinc-300 text-sm leading-relaxed">
                <span className="text-white font-semibold">MA – die MOMENTAUFNAHME –</span> gibt deiner inneren Stimme einen würdigen Ort. Einsprechen, hören, verstehen — in Sekunden.
              </p>
            </div>
          </div>
        </div>

        {/* 6) Immer dabei – überall verfügbar */}
        <div className="w-full max-w-sm mx-auto mb-8 p-4 rounded-2xl bg-gradient-to-br from-indigo-900/20 to-violet-900/20 border border-indigo-500/20 flex items-start gap-3">
          <span className="text-2xl mt-0.5">📱</span>
          <div>
            <p className="text-indigo-300 text-xs font-semibold tracking-wide uppercase mb-1">
              Immer dabei · überall verfügbar
            </p>
            <p className="text-white/60 text-sm leading-relaxed">
              MA läuft auf jedem Gerät — Handy, Tablet, Computer. Deine Aufnahmen sind sofort auf allen Geräten sichtbar. Nimm im Wald auf, lies das Summary am Abend am Computer, höre es auf dem Handy beim Einschlafen.
            </p>
            <p className="text-indigo-400/60 text-xs mt-2">
              ✔ Kein Download nötig · einfach kiich.de im Browser öffnen
            </p>
          </div>
        </div>

        {/* 7) MA als Hüterin – etwas größere Schrift */}
        <div className="w-full max-w-sm mx-auto mb-10 px-2">
          <p className="text-white/50 text-sm leading-relaxed">
            MA ist wie eine Mutter, die alles für dich bereit hält – behutsam, strukturiert,
            vollständig.{" "}
            <strong className="text-white/90">Am Abend bist du erstaunt und dankbar: ALLES DA! – was schon vergessen war – MA hat es aufbereitet und zusammengefasst.</strong>{" "}
            Die Hüterin deines geistigen Potentials. Dein zweites Gehirn.
            Deine Chefsekretärin. Alles nur dir selbst zugänglich –{" "}
            <strong className="text-white/90">gesichert als Schatz deiner einzigartigen IDENTITÄT.</strong>
          </p>
          <p
            className="text-violet-400/80 text-sm font-semibold mt-4 tracking-wide cursor-pointer flex items-center gap-2 hover:text-violet-300 transition-colors select-none"
            onClick={() => setTeaserOpen(o => !o)}
          >
            MA kann aber noch vieles mehr.......
            {teaserOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </p>
          {teaserOpen && (
            <div className="mt-4 space-y-3">
              {[
                { icon: "🌙", title: "Schlaf-Modus", text: "MA liest dir deine Tages-Erkenntnisse vor und begleitet dich sanft in den Schlaf – mit Entspannungsmusik und deinen eigenen Gedanken als Einschlaf-Ritual." },
                { icon: "📋", title: "Tages-Summary", text: "Am Abend fasst MA alle deine Momentaufnahmen zu einem persönlichen Tages-Summary zusammen – strukturiert, reflektiert und sofort abrufbar." },
                { icon: "🧲", title: "6 Gravitationszentren", text: "Jede Aufnahme wird automatisch einem der 6 Lebensbereiche zugeordnet: ICH · QUELL · KONZEPT · PROJEKT · DIALOG · WELT. So entsteht ein lebendiges Bild deiner inneren Welt." },
                { icon: "🔗", title: "Obsidian-Export", text: "Alle Aufnahmen lassen sich mit einem Klick in dein Obsidian-Wissensnetz exportieren – als strukturierte Markdown-Dateien, bereit für tiefere Reflexion." },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-xl bg-white/5 border border-violet-500/10">
                  <span className="text-xl mt-0.5">{item.icon}</span>
                  <div>
                    <p className="text-white/80 text-xs font-bold uppercase tracking-wide mb-1">{item.title}</p>
                    <p className="text-white/45 text-xs leading-relaxed">{item.text}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 8) Demnächst verfügbar + Login */}
        <div className="w-full max-w-sm mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-full px-5 py-2.5 mb-4">
            <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
            <span className="text-violet-300 text-xs font-bold tracking-widest uppercase">Demnächst verfügbar</span>
          </div>

          {!isAuthenticated && (
            <div className="flex flex-col gap-3 items-center">
              {/* Bereits registriert / Betatester */}
              <a
                href={getLoginUrl()}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
              >
                <LogIn className="w-4 h-4" />
                Bereits registriert? Hier einloggen
              </a>
              <p className="text-white/30 text-xs">Betatester gelangen direkt zu ihren Aufnahmen</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
