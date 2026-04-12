import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Copy, Share2, Users, Check, ChevronDown, ChevronUp, UserPlus } from "lucide-react";

/**
 * Zeigt den persönlichen Einladungslink und die Statistik der eingeladenen Personen.
 */
export function EinladungsLink() {
  const { data, isLoading } = trpc.referral.meinCode.useQuery();
  const { data: einladungenData } = trpc.referral.meineEinladungen.useQuery();
  const [kopiert, setKopiert] = useState(false);
  const [statistikOffen, setStatistikOffen] = useState(false);

  const einladungsUrl = data?.code
    ? getLoginUrl(data.code)
    : null;

  const einladungen = einladungenData?.einladungen ?? [];
  const anzahl = einladungen.length;

  const handleKopieren = async () => {
    if (!einladungsUrl) return;
    try {
      await navigator.clipboard.writeText(einladungsUrl);
      setKopiert(true);
      toast.success("Einladungslink kopiert!");
      setTimeout(() => setKopiert(false), 2000);
    } catch {
      toast.error("Kopieren fehlgeschlagen — bitte manuell kopieren.");
    }
  };

  const handleTeilen = async () => {
    if (!einladungsUrl) return;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Einladung zu kiich.de",
          text: "Ich lade dich ein, kiich.de auszuprobieren — ein stilles Werkzeug für Selbstwahrnehmung und innere Klarheit.",
          url: einladungsUrl,
        });
      } catch {
        // User hat Teilen abgebrochen
      }
    } else {
      handleKopieren();
    }
  };

  return (
    <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-violet-500/20 rounded-2xl p-5">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm">Freunde einladen</h3>
          <p className="text-white/40 text-xs">
            {anzahl === 0
              ? "Noch niemanden eingeladen"
              : `${anzahl} ${anzahl === 1 ? "Person" : "Personen"} beigetreten`}
          </p>
        </div>
        {anzahl > 0 && (
          <button
            onClick={() => setStatistikOffen(v => !v)}
            className="p-1.5 rounded-full hover:bg-white/10 text-white/30 hover:text-white/70 transition-colors"
          >
            {statistikOffen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        )}
      </div>

      {/* Statistik-Liste */}
      {statistikOffen && anzahl > 0 && (
        <div className="mb-4 space-y-2">
          <p className="text-[10px] font-semibold tracking-widest text-violet-400/70 uppercase mb-2">Deine Verbindungen</p>
          {einladungen.map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 py-2 px-3 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-7 h-7 rounded-full bg-violet-500/20 flex items-center justify-center shrink-0">
                <UserPlus className="w-3.5 h-3.5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/80 text-xs font-medium truncate">
                  {e.name ?? "Anonym"}
                </p>
                <p className="text-white/30 text-[10px]">
                  {new Date(e.createdAt).toLocaleDateString("de-DE", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  })}
                </p>
              </div>
              <span className="text-[10px] text-violet-400/60 shrink-0">✓ beigetreten</span>
            </div>
          ))}
        </div>
      )}

      {/* Beschreibung */}
      <p className="text-white/50 text-xs leading-relaxed mb-4">
        Teile deinen persönlichen Einladungslink. Wer darüber beitritt,
        landet direkt bei kiich.de — du erhältst eine Benachrichtigung.
      </p>

      {/* Link-Anzeige und Buttons */}
      {isLoading ? (
        <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
      ) : einladungsUrl ? (
        <>
          <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <p className="text-white/40 text-[10px] font-mono truncate">{einladungsUrl}</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleKopieren}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
            >
              {kopiert ? (
                <>
                  <Check className="w-4 h-4" />
                  Kopiert!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Link kopieren
                </>
              )}
            </button>
            <button
              onClick={handleTeilen}
              className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Teilen"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          {data?.code && (
            <p className="text-center text-white/20 text-[10px] mt-2">
              Dein Code: <span className="font-mono text-violet-400/60">{data.code}</span>
            </p>
          )}
        </>
      ) : (
        <p className="text-white/30 text-xs text-center">Einladungslink konnte nicht geladen werden.</p>
      )}
    </div>
  );
}
