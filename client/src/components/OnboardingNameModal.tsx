import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles } from "lucide-react";

interface OnboardingNameModalProps {
  open: boolean;
  onComplete: (vorname: string) => void;
}

export function OnboardingNameModal({ open, onComplete }: OnboardingNameModalProps) {
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const setVorname = trpc.profil.setVorname.useMutation({
    onSuccess: (data) => {
      onComplete(data.vorname);
    },
    onError: () => {
      setError("Speichern fehlgeschlagen – bitte nochmal versuchen.");
    },
  });

  const handleSubmit = () => {
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Bitte gib deinen Vornamen ein.");
      return;
    }
    if (trimmed.length > 64) {
      setError("Name darf maximal 64 Zeichen lang sein.");
      return;
    }
    setError("");
    setVorname.mutate({ vorname: trimmed });
  };

  return (
    <Dialog open={open}>
      <DialogContent
        className="bg-zinc-900 border-zinc-800 text-white max-w-sm mx-auto"
        // Kein onInteractOutside / onEscapeKeyDown → Modal kann nicht weggeklickt werden
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader className="text-center space-y-3 pb-2">
          <div className="flex justify-center">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-amber-400 flex items-center justify-center">
              <Sparkles className="w-7 h-7 text-black" />
            </div>
          </div>
          <DialogTitle className="text-xl font-bold text-white text-center">
            Willkommen bei KIICH!
          </DialogTitle>
          <p className="text-zinc-400 text-sm leading-relaxed text-center">
            Wie darf ich dich nennen? Dein Vorname wird für die persönliche Ansprache in der App verwendet.
          </p>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <Input
            value={name}
            onChange={(e) => { setName(e.target.value); setError(""); }}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            placeholder="Dein Vorname..."
            className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 text-center text-lg h-12 focus:border-amber-500"
            autoFocus
            maxLength={64}
          />
          {error && (
            <p className="text-red-400 text-sm text-center">{error}</p>
          )}
          <Button
            onClick={handleSubmit}
            disabled={setVorname.isPending || !name.trim()}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-400 text-black font-bold h-12 text-base hover:opacity-90 disabled:opacity-40"
          >
            {setVorname.isPending ? "Speichern..." : "Los geht's →"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
