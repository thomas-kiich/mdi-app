import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { CheckCircle, XCircle, Loader2, UserX, Trash2 } from "lucide-react";
import { Link, useSearch } from "wouter";
import { Button } from "@/components/ui/button";

/**
 * DSGVO: Abmelde- und Datenlöschseite.
 * Aufgerufen via /newsletter/abmelden?token=...
 *
 * Bietet zwei Optionen:
 * 1. Nur abmelden (Daten bleiben für Einwilligungsnachweis erhalten)
 * 2. Alle Daten löschen (Art. 17 DSGVO – Recht auf Vergessenwerden)
 */
export default function NewsletterAbmelden() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const token = params.get("token") ?? "";

  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "no-token">(
    token ? "idle" : "no-token"
  );
  const [message, setMessage] = useState("");
  const [action, setAction] = useState<"unsubscribe" | "delete" | null>(null);

  const unsubscribe = trpc.newsletter.unsubscribe.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message);
    },
  });

  const deleteData = trpc.newsletter.deleteData.useMutation({
    onSuccess: (data) => {
      setStatus("success");
      setMessage(data.message);
    },
    onError: (err) => {
      setStatus("error");
      setMessage(err.message);
    },
  });

  const handleUnsubscribe = () => {
    setAction("unsubscribe");
    setStatus("loading");
    unsubscribe.mutate({ token });
  };

  const handleDelete = () => {
    setAction("delete");
    setStatus("loading");
    deleteData.mutate({ token });
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">

        {status === "no-token" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-zinc-800 flex items-center justify-center mx-auto">
              <UserX className="w-10 h-10 text-zinc-400" />
            </div>
            <h1 className="text-2xl font-bold text-white">Kein gültiger Link</h1>
            <p className="text-zinc-400">Bitte öffne den Abmeldelink aus deiner E-Mail.</p>
            <Link href="/"><Button variant="outline" className="border-zinc-700 text-zinc-300">Zur Startseite</Button></Link>
          </div>
        )}

        {status === "idle" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-orange-500/10 flex items-center justify-center mx-auto">
              <UserX className="w-10 h-10 text-orange-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">Newsletter abmelden</h1>
              <p className="text-zinc-400 text-sm">
                Wähle bitte eine der folgenden Optionen:
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: Nur abmelden */}
              <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5 text-left">
                <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                  <UserX className="w-4 h-4 text-orange-400" />
                  Nur abmelden
                </h3>
                <p className="text-zinc-500 text-sm mb-4">
                  Du erhältst keine E-Mails mehr. Deine Daten bleiben für den gesetzlich
                  vorgeschriebenen Einwilligungsnachweis gespeichert.
                </p>
                <Button
                  onClick={handleUnsubscribe}
                  className="w-full bg-orange-600 hover:bg-orange-500 text-white"
                >
                  Abmelden
                </Button>
              </div>

              {/* Option 2: Alle Daten löschen */}
              <div className="bg-zinc-900/60 border border-red-900/40 rounded-xl p-5 text-left">
                <h3 className="text-white font-medium mb-1 flex items-center gap-2">
                  <Trash2 className="w-4 h-4 text-red-400" />
                  Alle Daten löschen
                  <span className="text-xs bg-red-900/40 text-red-400 px-2 py-0.5 rounded-full">Art. 17 DSGVO</span>
                </h3>
                <p className="text-zinc-500 text-sm mb-4">
                  Deine E-Mail-Adresse und alle gespeicherten Daten werden vollständig und
                  unwiderruflich gelöscht.
                </p>
                <Button
                  onClick={handleDelete}
                  variant="outline"
                  className="w-full border-red-900/60 text-red-400 hover:bg-red-900/20"
                >
                  Alle Daten löschen
                </Button>
              </div>
            </div>

            <Link href="/">
              <p className="text-zinc-600 text-sm hover:text-zinc-400 cursor-pointer transition-colors">
                Abbrechen – ich möchte angemeldet bleiben
              </p>
            </Link>
          </div>
        )}

        {status === "loading" && (
          <div className="space-y-4">
            <Loader2 className="w-12 h-12 text-orange-500 animate-spin mx-auto" />
            <p className="text-zinc-400">
              {action === "delete" ? "Daten werden gelöscht..." : "Abmeldung wird verarbeitet..."}
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="space-y-6">
            <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10 text-green-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {action === "delete" ? "Daten gelöscht" : "Erfolgreich abgemeldet"}
              </h1>
              <p className="text-zinc-400">{message}</p>
            </div>
            <Link href="/">
              <Button className="bg-zinc-800 hover:bg-zinc-700 text-white">
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
              <h1 className="text-2xl font-bold text-white mb-2">Fehler</h1>
              <p className="text-zinc-400">{message}</p>
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
