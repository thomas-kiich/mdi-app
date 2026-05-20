import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import {
  ArrowLeft, Mail, Crown, Mic, Headphones, HelpCircle,
  BookOpen, Users, BarChart3, TrendingUp, Loader2, Activity,
  Bot, CreditCard, DoorOpen, Camera
} from "lucide-react";

const adminSections = [
  {
    label: "NUTZER & COMMUNITY",
    color: "text-orange-400/60",
    tools: [
      {
        href: "/admin/benutzer",
        icon: Users,
        color: "text-orange-400",
        border: "border-orange-500/30 hover:border-orange-400/60",
        bg: "bg-orange-500/5 hover:bg-orange-500/10",
        title: "Benutzerverwaltung",
        desc: "Alle App-Nutzer · Suchen · DSGVO-Löschung",
      },
      {
        href: "/admin/newsletter",
        icon: Mail,
        color: "text-blue-400",
        border: "border-blue-500/30 hover:border-blue-400/60",
        bg: "bg-blue-500/5 hover:bg-blue-500/10",
        title: "Newsletter-Agent",
        desc: "KI-gestützter Entwurf & Versand · Jeden Donnerstag",
      },
      {
        href: "/admin/premium",
        icon: Crown,
        color: "text-amber-400",
        border: "border-amber-500/30 hover:border-amber-400/60",
        bg: "bg-amber-500/5 hover:bg-amber-500/10",
        title: "Premiumsteuerung",
        desc: "Premium-Zugänge und Freischaltungen verwalten",
      },
      {
        href: "/admin/coaching",
        icon: Activity,
        color: "text-pink-400",
        border: "border-pink-500/30 hover:border-pink-400/60",
        bg: "bg-pink-500/5 hover:bg-pink-500/10",
        title: "Coaching Dashboard",
        desc: "Vitalwerte deiner Coaching-Clients einsehen",
      },
    ],
  },
  {
    label: "RAUM 36 & ZAHLUNGEN",
    color: "text-rose-400/60",
    tools: [
      {
        href: "/raum36",
        icon: DoorOpen,
        color: "text-rose-400",
        border: "border-rose-500/30 hover:border-rose-400/60",
        bg: "bg-rose-500/5 hover:bg-rose-500/10",
        title: "RAUM 36",
        desc: "Mitgliederbereich · Wochenvideos · Fragen · Wissenspool",
      },
      {
        href: "/admin/raum36",
        icon: DoorOpen,
        color: "text-rose-300",
        border: "border-rose-500/20 hover:border-rose-400/50",
        bg: "bg-rose-500/5 hover:bg-rose-500/10",
        title: "RAUM 36 Verwaltung",
        desc: "Inhalte verwalten · Abonnenten · Fragen beantworten",
      },
      {
        href: "/admin/zahlungen",
        icon: CreditCard,
        color: "text-green-400",
        border: "border-green-500/30 hover:border-green-400/60",
        bg: "bg-green-500/5 hover:bg-green-500/10",
        title: "Zahlungen (Stripe)",
        desc: "RAUM 36 Abos · Stimmklanganalyse-Käufe · Übersicht",
      },
    ],
  },
  {
    label: "INHALTE & TRAINING",
    color: "text-purple-400/60",
    tools: [
      {
        href: "/admin/episoden",
        icon: Headphones,
        color: "text-purple-400",
        border: "border-purple-500/30 hover:border-purple-400/60",
        bg: "bg-purple-500/5 hover:bg-purple-500/10",
        title: "Episoden",
        desc: "Podcast-Episoden verwalten und veröffentlichen",
      },
      {
        href: "/admin/tts",
        icon: Mic,
        color: "text-green-400",
        border: "border-green-500/30 hover:border-green-400/60",
        bg: "bg-green-500/5 hover:bg-green-500/10",
        title: "TTS · Sprachsynthese",
        desc: "MA-Stimme generieren und Audio-Dateien erstellen",
      },
      {
        href: "/admin/training",
        icon: BarChart3,
        color: "text-cyan-400",
        border: "border-cyan-500/30 hover:border-cyan-400/60",
        bg: "bg-cyan-500/5 hover:bg-cyan-500/10",
        title: "Training",
        desc: "Trainingsmodule und Inhalte konfigurieren",
      },
      {
        href: "/admin/training-einheiten",
        icon: BarChart3,
        color: "text-emerald-400",
        border: "border-emerald-500/30 hover:border-emerald-400/60",
        bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
        title: "NEUES TRAINING",
        desc: "Neue Trainingseinheiten anlegen, bearbeiten und veröffentlichen",
      },
      {
        href: "/admin/faq",
        icon: HelpCircle,
        color: "text-zinc-400",
        border: "border-zinc-500/30 hover:border-zinc-400/60",
        bg: "bg-zinc-500/5 hover:bg-zinc-500/10",
        title: "FAQ",
        desc: "Häufige Fragen verwalten und aktualisieren",
      },
      {
        href: "/momentaufnahme/app",
        icon: Camera,
        color: "text-sky-400",
        border: "border-sky-500/30 hover:border-sky-400/60 border-dashed",
        bg: "bg-sky-500/5 hover:bg-sky-500/10",
        title: "MOMENTAUFNAHME ↗",
        desc: "In Entwicklung · Nur für Admins · devkiich.de",
      },
    ],
  },
  {
    label: "ANALYSE & STRATEGIE",
    color: "text-emerald-400/60",
    tools: [
      {
        href: "/admin/statistik",
        icon: TrendingUp,
        color: "text-emerald-400",
        border: "border-emerald-500/30 hover:border-emerald-400/60",
        bg: "bg-emerald-500/5 hover:bg-emerald-500/10",
        title: "Nutzungsstatistik",
        desc: "Einschlafbibliothek · YOHN-Training · Aktivste Nutzer",
      },
      {
        href: "/admin/geo",
        icon: Bot,
        color: "text-orange-400",
        border: "border-orange-500/30 hover:border-orange-400/60",
        bg: "bg-orange-500/5 hover:bg-orange-500/10",
        title: "GEO-Monitoring",
        desc: "Sichtbarkeit in KI-Engines · ChatGPT · Perplexity · Claude",
      },
      {
        href: "/admin/backlog",
        icon: BookOpen,
        color: "text-violet-400",
        border: "border-violet-500/30 hover:border-violet-400/60",
        bg: "bg-violet-500/5 hover:bg-violet-500/10",
        title: "Strategischer Backlog",
        desc: "Ideen, Vorhaben und offene Fragen für KIICH",
      },
    ],
  },
];

export default function AdminHub() {
  const { user, loading, isAuthenticated } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p className="text-sm">Kein Zugriff.</p>
        <Link href="/admin">
          <button className="text-xs text-orange-400 border border-orange-500/40 rounded px-4 py-2 hover:bg-orange-500/10 transition-colors">
            Zum Admin-Bereich
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <h1 className="text-3xl font-light text-white tracking-tight">Admin-Zentrale</h1>
          <p className="text-zinc-500 text-sm">Alle Verwaltungstools · {adminSections.reduce((a, s) => a + s.tools.length, 0)} Bereiche</p>
        </div>

        {/* Sektionen */}
        {adminSections.map((section) => (
          <div key={section.label} className="space-y-3">
            <p className={`text-xs font-mono tracking-widest ${section.color}`}>{section.label}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {section.tools.map((tool) => {
                const Icon = tool.icon;
                return (
                  <Link key={tool.href} href={tool.href}>
                    <div className={`border rounded-xl p-5 cursor-pointer transition-all ${tool.border} ${tool.bg}`}>
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 ${tool.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className={`font-semibold text-sm mb-1 ${tool.color}`}>{tool.title}</div>
                          <div className="text-xs text-zinc-500 leading-relaxed">{tool.desc}</div>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}

        {/* Footer */}
        <p className="text-zinc-700 text-xs text-center font-mono pb-4">
          KIICH Admin · {user?.name || "thomas"}
        </p>
      </div>
    </div>
  );
}
