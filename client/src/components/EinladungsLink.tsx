import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";
import { Copy, Share2, Users, Check } from "lucide-react";

/**
 * Zeigt den persönlichen Einladungslink des eingeloggten Users an.
 * Der Link führt direkt zur Manus-Anmeldung mit dem Einladungscode.
 */
export function EinladungsLink() {
  const { data, isLoading } = trpc.referral.meinCode.useQuery();
  const { data: einladungenData } = trpc.referral.meineEinladungen.useQuery();
  const [kopiert, setKopiert] = useState(false);

  const einladungsUrl = data?.code
    ? getLoginUrl(data.code).replace(window.location.origin, "https://www.kiich.de")
    : null;

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
          text: "Ich lade dich ein, kiich.de auszuprobieren — ein Werkzeug für Selbstwahrnehmung und innere Klarheit.",
          url: einladungsUrl,
        });
      } catch {
        // User hat Teilen abgebrochen
      }
    } else {
      handleKopieren();
    }
  };

  const anzahlEinladungen = einladungenData?.einladungen?.length ?? 0;

  return (
    <div className="bg-gradient-to-br from-violet-950/40 to-indigo-950/40 border border-violet-500/20 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center">
          <Users className="w-5 h-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold text-sm">Freunde einladen</h3>
          <p className="text-white/40 text-xs">
            {anzahlEinladungen === 0
              ? "Noch keine Einladungen"
              : `${anzahlEinladungen} ${anzahlEinladungen === 1 ? "Person" : "Personen"} eingeladen`}
          </p>
        </div>
      </div>

      <p className="text-white/60 text-xs leading-relaxed mb-4">
        Teile deinen persönlichen Einladungslink. Wenn jemand über diesen Link beitritt,
        erhältst du eine Benachrichtigung.
      </p>

      {isLoading ? (
        <div className="h-10 bg-white/5 rounded-xl animate-pulse" />
      ) : einladungsUrl ? (
        <>
          <div className="bg-black/30 border border-white/10 rounded-xl px-3 py-2.5 mb-3">
            <p className="text-white/50 text-[10px] font-mono truncate">{einladungsUrl}</p>
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
        </>
      ) : (
        <p className="text-white/30 text-xs text-center">Einladungslink konnte nicht geladen werden.</p>
      )}
    </div>
  );
}
