import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, CheckCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface NewsletterSignupProps {
  source?: string;
  className?: string;
  /** Compact variant for inline use */
  compact?: boolean;
}

export function NewsletterSignup({ source = "website", className = "", compact = false }: NewsletterSignupProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const subscribe = trpc.newsletter.subscribe.useMutation({
    onSuccess: (data) => {
      setSubmitted(true);
      toast.success(data.message);
    },
    onError: (err) => {
      if (err.message.includes("bereits aktiv")) {
        toast.info("Diese E-Mail-Adresse ist bereits angemeldet.");
      } else {
        toast.error(err.message || "Anmeldung fehlgeschlagen. Bitte versuche es später erneut.");
      }
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    subscribe.mutate({
      email: email.trim(),
      name: name.trim() || undefined,
      source,
      origin: window.location.origin,
    });
  };

  if (submitted) {
    return (
      <div className={`flex flex-col items-center gap-3 py-4 ${className}`}>
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="text-green-400 font-medium text-center">
          Fast geschafft!
        </p>
        <p className="text-zinc-400 text-sm text-center max-w-xs">
          Wir haben dir eine Bestätigungs-E-Mail geschickt – bitte klicke auf den Link darin, um deine Anmeldung abzuschließen.
        </p>
      </div>
    );
  }

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
        <Input
          type="email"
          placeholder="Deine E-Mail-Adresse"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-900 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
        />
        <Button
          type="submit"
          disabled={subscribe.isPending}
          className="bg-orange-600 hover:bg-orange-500 text-white shrink-0"
        >
          {subscribe.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            "Abonnieren"
          )}
        </Button>
      </form>
    );
  }

  return (
    <div className={`bg-zinc-900/60 border border-zinc-800 rounded-2xl p-6 md:p-8 ${className}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
          <Mail className="w-5 h-5 text-orange-400" />
        </div>
        <div>
          <h3 className="text-white font-semibold">Newsletter abonnieren</h3>
          <p className="text-zinc-400 text-sm">Aktuell informiert am Puls der Zeit!</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          type="text"
          placeholder="Dein Name (optional)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
        />
        <Input
          type="email"
          placeholder="Deine E-Mail-Adresse *"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
        />
        <Button
          type="submit"
          disabled={subscribe.isPending || !email.trim()}
          className="w-full bg-orange-600 hover:bg-orange-500 text-white font-medium"
        >
          {subscribe.isPending ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Wird angemeldet...
            </>
          ) : (
            "ABONNIEREN"
          )}
        </Button>
        <p className="text-zinc-600 text-xs text-center">
          Kein Spam. Jederzeit abbestellbar.
        </p>
      </form>
    </div>
  );
}
