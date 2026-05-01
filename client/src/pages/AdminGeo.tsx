import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ArrowLeft, Search, ExternalLink, Copy, CheckCircle2, AlertCircle, Clock, TrendingUp, Globe, Bot, Loader2 } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

// ─── Monatliche Test-Prompts für KI-Engines ───────────────────────────────────
const TEST_PROMPTS = [
  {
    category: "Marken-Bekanntheit",
    prompts: [
      "Was ist KIICH?",
      "Was ist die METHODE 36?",
      "Wer ist Thomas Chochola?",
      "Was ist MASCHINEN ATMEN NICHT?",
    ],
  },
  {
    category: "Thematische Sichtbarkeit",
    prompts: [
      "Wie kann ich selbstbestimmter leben im KI-Zeitalter?",
      "Was ist der Unterschied zwischen Mensch und Maschine?",
      "Wie hilft Atmen bei der Persönlichkeitsentwicklung?",
      "Welche Podcasts gibt es zur Persönlichkeitsentwicklung auf Deutsch?",
    ],
  },
  {
    category: "Wettbewerbs-Analyse",
    prompts: [
      "Welche Alternativen gibt es zu KIICH?",
      "Was sind die besten deutschen Podcasts zur Selbstentwicklung?",
      "Empfehle mir einen Podcast über KI und Menschlichkeit",
    ],
  },
];

// ─── KI-Engines zum Testen ────────────────────────────────────────────────────
const AI_ENGINES = [
  {
    name: "ChatGPT",
    url: "https://chatgpt.com",
    color: "text-green-400",
    border: "border-green-500/30",
    bg: "bg-green-500/5",
    description: "Größte Reichweite, wichtigste Plattform",
  },
  {
    name: "Perplexity",
    url: "https://perplexity.ai",
    color: "text-blue-400",
    border: "border-blue-500/30",
    bg: "bg-blue-500/5",
    description: "Echtzeit-Web-Suche, sehr GEO-sensitiv",
  },
  {
    name: "Claude",
    url: "https://claude.ai",
    color: "text-orange-400",
    border: "border-orange-500/30",
    bg: "bg-orange-500/5",
    description: "Anthropic, wächst stark in Europa",
  },
  {
    name: "Google AI Overviews",
    url: "https://google.de",
    color: "text-yellow-400",
    border: "border-yellow-500/30",
    bg: "bg-yellow-500/5",
    description: "In Google-Suche eingebettet (SGE)",
  },
];

// ─── Google Alert Links ───────────────────────────────────────────────────────
const GOOGLE_ALERTS = [
  { term: "KIICH", url: "https://www.google.com/alerts?q=KIICH" },
  { term: "METHODE 36", url: "https://www.google.com/alerts?q=%22METHODE+36%22" },
  { term: "Thomas Chochola", url: "https://www.google.com/alerts?q=%22Thomas+Chochola%22" },
  { term: "MASCHINEN ATMEN NICHT", url: "https://www.google.com/alerts?q=%22MASCHINEN+ATMEN+NICHT%22" },
];

// ─── Schema Validierung ───────────────────────────────────────────────────────
const SCHEMA_TOOLS = [
  {
    name: "Google Rich Results Test",
    url: "https://search.google.com/test/rich-results?url=https://kiich.de",
    description: "Prüft ob Schema Markup korrekt erkannt wird",
    color: "text-blue-400",
  },
  {
    name: "Schema.org Validator",
    url: "https://validator.schema.org/?url=https://kiich.de",
    description: "Validiert alle JSON-LD Strukturen",
    color: "text-purple-400",
  },
];

// ─── Monatliche Checkliste ────────────────────────────────────────────────────
const MONTHLY_CHECKLIST = [
  "Test-Prompts in ChatGPT, Perplexity und Claude ausführen",
  "Ergebnisse in der Monitoring-Tabelle unten dokumentieren",
  "Google Alerts auf neue Erwähnungen prüfen",
  "Schema Markup mit Google Rich Results Test validieren",
  "Analytics: Traffic von perplexity.ai, chatgpt.com prüfen",
  "Neue Episoden-Beschreibungen auf GEO-Qualität prüfen",
];

export default function AdminGeo() {
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [copiedPrompt, setCopiedPrompt] = useState<string | null>(null);
  const [checklistState, setChecklistState] = useState<Record<number, boolean>>({});

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPrompt(text);
    toast({ title: "Kopiert!", description: "Prompt in Zwischenablage." });
    setTimeout(() => setCopiedPrompt(null), 2000);
  };

  const toggleChecklist = (idx: number) => {
    setChecklistState(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

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
        <Link href="/">
          <button className="text-xs text-orange-400 border border-orange-500/40 rounded px-4 py-2 hover:bg-orange-500/10 transition-colors">
            Zur Startseite
          </button>
        </Link>
      </div>
    );
  }

  const completedCount = Object.values(checklistState).filter(Boolean).length;

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-10">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/admin">
            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors mb-2">
              <ArrowLeft className="w-3 h-3" /> ADMIN-ZENTRALE
            </button>
          </Link>
          <div className="flex items-center gap-3">
            <Bot className="w-6 h-6 text-orange-400" />
            <h1 className="text-3xl font-light text-white tracking-tight">GEO-Monitoring</h1>
          </div>
          <p className="text-zinc-500 text-sm">Generative Engine Optimization · Sichtbarkeit in KI-Suchmaschinen messen</p>
        </div>

        {/* Was ist GEO? */}
        <div className="border border-orange-500/20 bg-orange-500/5 rounded-xl p-5 space-y-2">
          <div className="flex items-center gap-2 text-orange-400 font-semibold text-sm uppercase tracking-widest">
            <TrendingUp className="w-4 h-4" />
            Was ist GEO?
          </div>
          <p className="text-zinc-400 text-sm leading-relaxed">
            <strong className="text-zinc-200">Generative Engine Optimization</strong> ist die Optimierung für KI-Suchmaschinen wie ChatGPT, Perplexity und Claude. Ziel ist es, dass KIICH und die METHODE 36 in KI-generierten Antworten zitiert werden — nicht nur in klassischen Google-Suchergebnissen.
          </p>
          <p className="text-zinc-500 text-xs">
            Implementiert: Schema Markup (WebSite, Person, PodcastSeries, METHODE 36) · Open Graph · Twitter Cards
          </p>
        </div>

        {/* Monatliche Checkliste */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-white font-semibold text-lg">Monatliche Checkliste</h2>
            <span className="text-xs text-zinc-500">{completedCount}/{MONTHLY_CHECKLIST.length} erledigt</span>
          </div>
          <div className="space-y-2">
            {MONTHLY_CHECKLIST.map((item, idx) => (
              <button
                key={idx}
                onClick={() => toggleChecklist(idx)}
                className="w-full flex items-start gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors text-left"
              >
                {checklistState[idx]
                  ? <CheckCircle2 className="w-4 h-4 text-green-400 mt-0.5 shrink-0" />
                  : <div className="w-4 h-4 rounded-full border border-zinc-600 mt-0.5 shrink-0" />
                }
                <span className={`text-sm ${checklistState[idx] ? "text-zinc-500 line-through" : "text-zinc-300"}`}>
                  {item}
                </span>
              </button>
            ))}
          </div>
          {completedCount === MONTHLY_CHECKLIST.length && (
            <div className="flex items-center gap-2 text-green-400 text-sm p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <CheckCircle2 className="w-4 h-4" />
              Monatliches GEO-Monitoring abgeschlossen!
            </div>
          )}
        </div>

        {/* Test-Prompts */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Test-Prompts für KI-Engines</h2>
          <p className="text-zinc-500 text-sm">Kopiere diese Prompts und teste sie monatlich in den KI-Engines unten. Notiere ob KIICH erwähnt wird.</p>
          {TEST_PROMPTS.map((group) => (
            <div key={group.category} className="space-y-2">
              <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">{group.category}</div>
              {group.prompts.map((prompt) => (
                <div
                  key={prompt}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg border border-zinc-800 hover:border-zinc-600 transition-colors"
                >
                  <span className="text-sm text-zinc-300 flex-1">"{prompt}"</span>
                  <button
                    onClick={() => copyToClipboard(prompt)}
                    className="shrink-0 text-zinc-500 hover:text-orange-400 transition-colors"
                    title="Kopieren"
                  >
                    {copiedPrompt === prompt
                      ? <CheckCircle2 className="w-4 h-4 text-green-400" />
                      : <Copy className="w-4 h-4" />
                    }
                  </button>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* KI-Engines */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">KI-Engines öffnen</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {AI_ENGINES.map((engine) => (
              <a
                key={engine.name}
                href={engine.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex items-start gap-4 p-4 rounded-xl border ${engine.border} ${engine.bg} hover:opacity-80 transition-opacity`}
              >
                <Globe className={`w-5 h-5 mt-0.5 shrink-0 ${engine.color}`} />
                <div>
                  <div className={`font-semibold text-sm mb-0.5 ${engine.color}`}>{engine.name}</div>
                  <div className="text-xs text-zinc-500">{engine.description}</div>
                </div>
                <ExternalLink className="w-3.5 h-3.5 text-zinc-600 ml-auto mt-0.5 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Google Alerts */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Google Alerts einrichten</h2>
          <p className="text-zinc-500 text-sm">
            Google Alerts benachrichtigen dich per E-Mail, wenn KIICH im Web erwähnt wird. Klicke auf einen Begriff, um den Alert direkt einzurichten.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GOOGLE_ALERTS.map((alert) => (
              <a
                key={alert.term}
                href={alert.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-3 p-4 rounded-xl border border-zinc-700 hover:border-orange-500/50 bg-zinc-900/50 hover:bg-orange-500/5 transition-all"
              >
                <div>
                  <div className="text-sm font-semibold text-zinc-200">"{alert.term}"</div>
                  <div className="text-xs text-zinc-500 mt-0.5">Alert einrichten →</div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />
              </a>
            ))}
          </div>
          <div className="flex items-start gap-2 p-3 bg-zinc-900/50 border border-zinc-800 rounded-lg">
            <AlertCircle className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
            <p className="text-xs text-zinc-500">
              Tipp: Stelle die Häufigkeit auf "Sofort" für kritische Begriffe wie "KIICH" und "Thomas Chochola", und auf "Einmal täglich" für allgemeinere Begriffe.
            </p>
          </div>
        </div>

        {/* Schema Validierung */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Schema Markup validieren</h2>
          <p className="text-zinc-500 text-sm">
            Nach jedem Deployment prüfen, ob das Schema Markup korrekt erkannt wird. Besonders wichtig nach neuen Episoden oder Content-Updates.
          </p>
          <div className="space-y-3">
            {SCHEMA_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between gap-4 p-4 rounded-xl border border-zinc-700 hover:border-zinc-500 bg-zinc-900/50 transition-all"
              >
                <div>
                  <div className={`text-sm font-semibold ${tool.color}`}>{tool.name}</div>
                  <div className="text-xs text-zinc-500 mt-0.5">{tool.description}</div>
                </div>
                <ExternalLink className="w-4 h-4 text-zinc-500 shrink-0" />
              </a>
            ))}
          </div>
        </div>

        {/* Analytics Hinweis */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Traffic-Analyse</h2>
          <div className="border border-zinc-800 rounded-xl p-5 space-y-3">
            <p className="text-zinc-400 text-sm leading-relaxed">
              In den Analytics-Daten nach diesen Referrer-Quellen suchen — sie zeigen direkten Traffic von KI-Engines:
            </p>
            <div className="space-y-2">
              {[
                { domain: "perplexity.ai", label: "Perplexity Search" },
                { domain: "chatgpt.com", label: "ChatGPT" },
                { domain: "claude.ai", label: "Claude" },
                { domain: "bing.com/chat", label: "Microsoft Copilot" },
              ].map((source) => (
                <div key={source.domain} className="flex items-center justify-between p-2 rounded bg-zinc-900/50">
                  <span className="text-sm text-zinc-300">{source.label}</span>
                  <code className="text-xs text-orange-400 font-mono">{source.domain}</code>
                </div>
              ))}
            </div>
            <div className="flex items-start gap-2 pt-2">
              <Clock className="w-4 h-4 text-zinc-500 mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-500">
                Erwarte erste messbare Ergebnisse nach 3–4 Monaten. KI-Engines indexieren langsamer als Google.
              </p>
            </div>
          </div>
        </div>

        {/* Zeitplan */}
        <div className="space-y-4">
          <h2 className="text-white font-semibold text-lg">Erwarteter Zeitplan</h2>
          <div className="space-y-3">
            {[
              { phase: "Monat 1–2", status: "laufend", desc: "Schema wird von Crawlern indexiert. Keine sichtbare Wirkung, aber Grundlage wird gelegt." },
              { phase: "Monat 3–4", status: "bald", desc: "Erste Erwähnungen in Perplexity möglich, wenn jemand direkt nach KIICH oder METHODE 36 sucht." },
              { phase: "Monat 6+", status: "zukunft", desc: "ChatGPT/Claude beginnen KIICH in relevanten Kontexten zu erwähnen. Content-Dichte entscheidend." },
              { phase: "Monat 12+", status: "zukunft", desc: "Etablierte Autorität. KIICH wird als Quelle für Selbstbestimmung im KI-Zeitalter zitiert." },
            ].map((item) => (
              <div key={item.phase} className="flex gap-4 p-4 rounded-xl border border-zinc-800">
                <div className={`shrink-0 text-xs font-bold px-2 py-1 rounded-full h-fit ${
                  item.status === "laufend" ? "bg-green-500/20 text-green-400" :
                  item.status === "bald" ? "bg-orange-500/20 text-orange-400" :
                  "bg-zinc-800 text-zinc-500"
                }`}>
                  {item.phase}
                </div>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-zinc-900 text-center">
          <p className="text-xs text-zinc-600">GEO-Monitoring · Monatlich durchführen · Zuletzt aktualisiert: Mai 2026</p>
        </div>

      </div>
    </div>
  );
}
