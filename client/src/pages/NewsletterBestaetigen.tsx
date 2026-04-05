import { useEffect, useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Loader2, Mail } from "lucide-react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * DSGVO: Double-Opt-In Bestätigungsseite.
 * Aufgerufen via /newsletter/bestaetigen?token=...
 */
export default function NewsletterBestaetigen() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"loading" | "success" | "error" | "no-token">(
    token ? "loading" : "no-token"
  );
  const [message, setMessage] = useState("");

  const confirm = trpc.newsletter.confirm.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message);
    },
  });

  useEffect(() => {
    if (token && status === "loading") {
      confirm.mutate({ token });
    }
  }, [token]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <p className="text-zinc-400">Bestätigung wird verarbeitet...</p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Anmeldung bestätigt!</h1>
              <p className="text-zinc-400">{message}</p>
            </div>
            <Link href="/">
              <Button className="bg-orange-600 hover:bg-orange-500 text-white">
                Zur Startseite
              </Button>
            </Link>
          </div>
        )}

        {status === "error" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
              <XCircle className="w-10 h-10 text-red-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Bestätigung fehlgeschlagen</h1>
              <p className="text-zinc-400">{message}</p>
              <p className="text-zinc-600 text-sm mt-2">
                Der Link ist möglicherweise abgelaufen oder wurde bereits verwendet.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-zinc-700 text-zinc-300">
                Zur Startseite
              </Button>
            </Link>
          </div>
        )}

        {status === "no-token" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <Mail className="w-10 h-10 text-zinc-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Kein Bestätigungslink</h1>
              <p className="text-zinc-400">
                Bitte öffne den Link aus deiner Bestätigungs-E-Mail.
              </p>
            </div>
            <Link href="/">
              <Button variant="outline" className="border-zinc-700 text-zinc-300">
                Zur Startseite
              </Button>
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
