import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";
import { useState } from "react";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Copy,
  Check,
  Loader2,
  LogIn,
  Eye,
  EyeOff,
  Plug,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";
import { getLoginUrl } from "@/const";

// ─── Hauptseite ───────────────────────────────────────────────────────────────

export default function ObsidianVerbinden() {
  const { loading, isAuthenticated } = useAuth();

  const { data: tokens, refetch: refetchTokens } = trpc.apiTokens.list.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );

  const generateMutation = trpc.apiTokens.generate.useMutation({
    onSuccess: () => refetchTokens(),
  });

  const revokeMutation = trpc.apiTokens.revoke.useMutation({
    onSuccess: () => refetchTokens(),
  });

  const [newTokenName, setNewTokenName] = useState("Obsidian");
  const [newlyCreatedToken, setNewlyCreatedToken] = useState<string | null>(null);
  const [showToken, setShowToken] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleGenerateToken = async () => {
    if (!newTokenName.trim()) {
      toast.error("Bitte gib einen Namen für den Token ein.");
      return;
    }
    try {
      const result = await generateMutation.mutateAsync({ name: newTokenName.trim() });
      setNewlyCreatedToken(result.token);
      setShowToken(true);
      setNewTokenName("Obsidian");
      toast.success("API-Token erstellt – bitte jetzt kopieren!");
    } catch {
      toast.error("Fehler beim Erstellen des Tokens.");
    }
  };

  const handleCopy = async () => {
    if (!newlyCreatedToken) return;
    await navigator.clipboard.writeText(newlyCreatedToken);
    setCopied(true);
    toast.success("Token in die Zwischenablage kopiert");
    setTimeout(() => setCopied(false), 3000);
  };

  const handleRevoke = async (id: number, name: string) => {
    if (!confirm(`Token "${name}" wirklich widerrufen? Das Obsidian-Plugin kann danach nicht mehr synchronisieren.`)) return;
    try {
      await revokeMutation.mutateAsync({ id });
      toast.success(`Token "${name}" widerrufen.`);
    } catch {
      toast.error("Fehler beim Widerrufen.");
    }
  };

  // ─── Login-Gate ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">🔌</div>
        <h1 className="text-2xl font-bold text-white mb-2">OBSIDIAN VERBINDEN</h1>
        <p className="text-white/50 mb-8 max-w-xs">
          Melde dich an um dein Obsidian-Plugin zu konfigurieren.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <LogIn className="w-4 h-4" />
          Anmelden
        </Button>
      </div>
    );
  }

  // ─── Hauptansicht ─────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-5 pt-6 pb-4 flex items-center gap-3 border-b border-white/5">
        <Link href="/momentaufnahme">
          <button className="p-1.5 rounded-full hover:bg-white/10 transition-colors text-white/40 hover:text-white/70">
            <ArrowLeft className="w-4 h-4" />
          </button>
        </Link>
        <div>
          <h1 className="text-lg font-bold tracking-wide flex items-center gap-2">
            <Plug className="w-4 h-4 text-violet-400" />
            OBSIDIAN VERBINDEN
          </h1>
          <p className="text-xs text-white/40">API-Token für automatischen Vault-Sync</p>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-5 py-6 space-y-8 max-w-2xl mx-auto w-full">

        {/* Erklärung */}
        <div className="rounded-2xl bg-violet-500/10 border border-violet-500/20 p-5">
          <h2 className="text-sm font-semibold text-violet-300 mb-2">So funktioniert der Sync</h2>
          <ol className="text-sm text-white/60 space-y-1.5 list-decimal list-inside">
            <li>Erstelle hier einen API-Token (einmalig)</li>
            <li>Installiere das KIICH-Plugin in Obsidian</li>
            <li>Füge den Token in den Plugin-Einstellungen ein</li>
            <li>Obsidian synchronisiert automatisch beim Start</li>
          </ol>
          <p className="text-xs text-white/30 mt-3">
            Jede Aufnahme wird als eigene Notiz in deinem Vault gespeichert,
            gruppiert nach Datum und Gravitationszentrum.
          </p>
        </div>

        {/* Neuen Token erstellen */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white/70">Neuen Token erstellen</h2>
          <div className="flex gap-2">
            <input
              type="text"
              value={newTokenName}
              onChange={(e) => setNewTokenName(e.target.value)}
              placeholder="Name (z.B. Obsidian MacBook)"
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-violet-500/50"
              maxLength={64}
            />
            <button
              onClick={handleGenerateToken}
              disabled={generateMutation.isPending}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
            >
              {generateMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              Erstellen
            </button>
          </div>
        </div>

        {/* Neu erstellter Token – einmalige Anzeige */}
        {newlyCreatedToken && (
          <div className="rounded-2xl bg-amber-500/10 border border-amber-500/30 p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-amber-400 text-sm font-semibold">⚠️ Token nur einmal sichtbar – jetzt kopieren!</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex-1 bg-black/40 rounded-xl px-4 py-2.5 font-mono text-xs text-amber-200 break-all">
                {showToken ? newlyCreatedToken : "kiich_" + "•".repeat(64)}
              </div>
              <button
                onClick={() => setShowToken(!showToken)}
                className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                onClick={handleCopy}
                className={cn(
                  "p-2 rounded-lg transition-colors",
                  copied
                    ? "bg-green-500/20 text-green-400"
                    : "bg-white/5 hover:bg-white/10 text-white/40 hover:text-white/70"
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-xs text-white/30">
              Nach dem Schließen dieser Seite ist der Token nicht mehr einsehbar.
              Du kannst jederzeit einen neuen erstellen.
            </p>
            <button
              onClick={() => setNewlyCreatedToken(null)}
              className="text-xs text-white/30 hover:text-white/50 transition-colors"
            >
              Verstanden – schließen
            </button>
          </div>
        )}

        {/* Aktive Tokens */}
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-white/70">
            Aktive Tokens {tokens && tokens.length > 0 && `(${tokens.length})`}
          </h2>
          {!tokens || tokens.length === 0 ? (
            <p className="text-sm text-white/30 py-4 text-center">
              Noch keine Tokens erstellt.
            </p>
          ) : (
            <div className="space-y-2">
              {tokens.map((token) => (
                <div
                  key={token.id}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5 border border-white/10"
                >
                  <div>
                    <p className="text-sm text-white font-medium">{token.name}</p>
                    <p className="text-xs text-white/30 mt-0.5">
                      Erstellt: {new Date(token.createdAt).toLocaleDateString("de-DE")}
                      {token.lastUsedAt && (
                        <> · Zuletzt: {new Date(token.lastUsedAt).toLocaleDateString("de-DE")}</>
                      )}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRevoke(token.id, token.name)}
                    disabled={revokeMutation.isPending}
                    className="p-1.5 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                    title="Token widerrufen"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Schritt-für-Schritt Installationsanleitung */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white/70">Plugin installieren – Schritt für Schritt</h2>
            <a
              href="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-obsidian-plugin_e8887188.zip"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-xs font-medium transition-colors"
            >
              Plugin (.zip)
            </a>
          </div>

          {/* Schritt 1 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">1</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Plugin herunterladen</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Klicke oben auf „Plugin (.zip)“ und speichere die Datei auf deinem Computer.
              </p>
            </div>
          </div>

          {/* Schritt 2 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">2</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">ZIP entpacken und in Vault kopieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Entpacke die ZIP-Datei. Den entstandenen Ordner{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">kiich-momentaufnahme</code>{" "}
                kopierst du in deinen Obsidian-Vault-Ordner unter:
              </p>
              <div className="mt-2 bg-black/40 rounded-lg px-3 py-2 font-mono text-xs text-violet-200 break-all">
                .obsidian/plugins/kiich-momentaufnahme/
              </div>
              <p className="text-xs text-white/30 mt-1.5">
                Den Vault-Ordner findest du in Obsidian unter: Einstellungen → Über → Vault-Pfad
              </p>
            </div>
          </div>

          {/* Schritt 3 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">3</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Plugin in Obsidian aktivieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Öffne Obsidian → Einstellungen (⚙️) → Community Plugins → Installierte Plugins.
                Suche nach „KIICH MOMENTAUFNAHME“ und aktiviere den Schalter.
              </p>
              <p className="text-xs text-white/30 mt-1.5">
                Falls Community Plugins deaktiviert sind: Einstellungen → Community Plugins → „Sicherer Modus“ ausschalten.
              </p>
            </div>
          </div>

          {/* Schritt 4 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">4</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">API-Token eintragen</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Einstellungen → KIICH MOMENTAUFNAHME → API-Token eintragen (den du oben erstellt hast).
                Klicke auf „Verbindung testen“ – bei Erfolg erscheint ein grünes Häkchen.
              </p>
            </div>
          </div>

          {/* Schritt 5 */}
          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600/30 border border-green-500/40 flex items-center justify-center text-xs font-bold text-green-300">✓</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Fertig – automatischer Sync aktiv</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Ab sofort synchronisiert Obsidian beim Start automatisch alle neuen Aufnahmen.
                Du findest sie im Ordner{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">KIICH/Momentaufnahmen/</code>{" "}
                in deinem Vault.
              </p>
              <p className="text-xs text-white/30 mt-1.5">
                Manueller Sync: Ribbon-Symbol 🔌 in der linken Seitenleiste von Obsidian.
              </p>
            </div>
          </div>

          {/* Hinweis für iPhone-Nutzer */}
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 p-3">
            <p className="text-xs text-amber-300/80 font-medium mb-1">📱 Hinweis für iPhone/iPad-Nutzer</p>
            <p className="text-xs text-white/40 leading-relaxed">
              Das Obsidian-Plugin läuft auf dem Desktop (Mac/Windows/Linux).
              Auf dem iPhone nutze den manuellen Export (↓ Symbol in MA) und lege die .md-Datei
              über iCloud Drive in deinen Obsidian-Vault.
            </p>
          </div>
        </div>

        {/* KIICH Dark Theme für Obsidian */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-white/70">KIICH Dark Theme installieren</h2>
              <p className="text-xs text-white/30 mt-0.5">Blauviolettes Farbschema – passend zu MOMENTAUFNAHME</p>
            </div>
            <a
              href="https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/kiich-obsidian-plugin_e8887188.zip"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-600/50 hover:bg-violet-600 text-white text-xs font-medium transition-colors"
            >
              Paket (.zip)
            </a>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">1</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">KIICH-Paket herunterladen und entpacken</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Klicke auf „Paket (.zip)" und entpacke die Datei. Du erhältst einen Ordner mit{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">theme.css</code>,{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">manifest.json</code> und einem{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">snippets/</code>-Ordner.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">2</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Theme-Dateien in den Vault kopieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Kopiere <code className="text-violet-300 bg-violet-500/10 px-1 rounded">theme.css</code> und{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">manifest.json</code> in:
              </p>
              <div className="mt-1.5 bg-black/40 rounded-lg px-3 py-2 font-mono text-xs text-violet-200">.obsidian/themes/KIICH-Dark/</div>
              <p className="text-xs text-white/40 leading-relaxed mt-2">
                Kopiere den Inhalt des <code className="text-violet-300 bg-violet-500/10 px-1 rounded">snippets/</code>-Ordners in:
              </p>
              <div className="mt-1.5 bg-black/40 rounded-lg px-3 py-2 font-mono text-xs text-violet-200">.obsidian/snippets/</div>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">3</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Theme in Obsidian aktivieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Obsidian → Einstellungen → Erscheinungsbild → Theme → „KIICH Dark" auswählen.
                Dann unter CSS-Snippets „kiich-farben" aktivieren.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600/30 border border-green-500/40 flex items-center justify-center text-xs font-bold text-green-300">✓</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Obsidian erscheint jetzt in KIICH-Farben</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Akzentfarben, Links, Buttons und Highlights erscheinen in Blauviolett –
                konsistent mit dem MOMENTAUFNAHME-Design.
              </p>
            </div>
          </div>
        </div>

        {/* Dataview – automatische Tabellen */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-5 space-y-5">
          <div>
            <h2 className="text-sm font-semibold text-white/70">Dataview – automatische Tabellen</h2>
            <p className="text-xs text-white/30 mt-0.5">Deine Aufnahmen nach Gravitationszentrum automatisch strukturiert</p>
          </div>

          <div className="rounded-xl bg-violet-500/10 border border-violet-500/20 p-4">
            <p className="text-xs text-white/60 leading-relaxed">
              Jede von MA exportierte Note enthält Metadaten (Frontmatter) wie{" "}
              <code className="text-violet-300 bg-violet-500/10 px-1 rounded">dominantes_zentrum</code>,{" "}
              <code className="text-violet-300 bg-violet-500/10 px-1 rounded">datum_iso</code> und{" "}
              <code className="text-violet-300 bg-violet-500/10 px-1 rounded">anzahl_aufnahmen</code>.
              Das Dataview-Plugin liest diese Metadaten und erstellt automatisch Tabellen und Übersichten –
              ohne dass du auch nur eine Zeile tippst.
            </p>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">1</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Dataview-Plugin installieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Obsidian → Einstellungen → Community Plugins → Browse → „Dataview" suchen → Installieren → Aktivieren.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-violet-600/30 border border-violet-500/40 flex items-center justify-center text-xs font-bold text-violet-300">2</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">Dataview-Vorlage in deinen Vault kopieren</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Im KIICH-Paket findest du die Datei{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">KIICH-Dataview-Vorlage.md</code>.
                Kopiere sie in deinen Vault-Ordner{" "}
                <code className="text-violet-300 bg-violet-500/10 px-1 rounded">KIICH/</code>.
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-600/30 border border-green-500/40 flex items-center justify-center text-xs font-bold text-green-300">✓</div>
            <div>
              <p className="text-sm font-medium text-white/80 mb-1">7 automatische Tabellen sofort verfügbar</p>
              <p className="text-xs text-white/40 leading-relaxed">
                Die Vorlage enthält Abfragen für alle 6 Gravitationszentren, eine Tagesübersicht
                und eine Wochenstatistik. Alle Tabellen befüllen sich automatisch sobald du
                MA-Exporte in deinen Vault synchronisierst.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
