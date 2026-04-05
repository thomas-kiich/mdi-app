import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Loader2, Download, Users, UserCheck, Mail } from "lucide-react";
import { Link } from "wouter";

export default function AdminNewsletter() {
  const { user, isAuthenticated, loading } = useAuth();
  const [activeOnly, setActiveOnly] = useState(true);

  const { data: subscribers, isLoading, error } = trpc.newsletter.list.useQuery(
    { activeOnly },
    { enabled: isAuthenticated && user?.role === "admin" }
  );

  const { data: countData } = trpc.newsletter.count.useQuery();

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-white">
        <p className="text-zinc-400">Zugang verweigert. Nur Admins dürfen diese Seite sehen.</p>
        <Link href="/">
          <Button variant="outline" className="border-zinc-700">Zur Startseite</Button>
        </Link>
      </div>
    );
  }

  const handleExportCSV = () => {
    if (!subscribers) return;
    const header = "ID,E-Mail,Name,Quelle,Aktiv,Erstellt am";
    const rows = subscribers.map(s =>
      [
        s.id,
        `"${s.email}"`,
        `"${s.name ?? ""}"`,
        s.source ?? "",
        s.active ? "Ja" : "Nein",
        new Date(s.createdAt).toLocaleDateString("de-DE"),
      ].join(",")
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `newsletter-abonnenten-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Link href="/" className="text-zinc-500 hover:text-white text-sm mb-2 inline-block transition-colors">
              ← Zur Startseite
            </Link>
            <h1 className="text-3xl font-bold text-white">Newsletter-Abonnenten</h1>
            <p className="text-zinc-400 mt-1">Admin-Übersicht aller angemeldeten Personen</p>
          </div>
          <Button
            onClick={handleExportCSV}
            disabled={!subscribers || subscribers.length === 0}
            className="bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            CSV exportieren
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Users className="w-5 h-5 text-orange-400" />
              <span className="text-zinc-400 text-sm">Gesamt</span>
            </div>
            <p className="text-3xl font-bold text-white">{countData?.total ?? "–"}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <UserCheck className="w-5 h-5 text-green-400" />
              <span className="text-zinc-400 text-sm">Aktiv</span>
            </div>
            <p className="text-3xl font-bold text-white">{countData?.active ?? "–"}</p>
          </div>
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <Mail className="w-5 h-5 text-blue-400" />
              <span className="text-zinc-400 text-sm">Aktuell angezeigt</span>
            </div>
            <p className="text-3xl font-bold text-white">{subscribers?.length ?? "–"}</p>
          </div>
        </div>

        {/* Filter */}
        <div className="flex items-center gap-3 mb-4">
          <Switch
            id="active-only"
            checked={activeOnly}
            onCheckedChange={setActiveOnly}
          />
          <Label htmlFor="active-only" className="text-zinc-300 cursor-pointer">
            Nur aktive Abonnenten anzeigen
          </Label>
        </div>

        {/* Table */}
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-8 h-8 text-orange-500 animate-spin" />
          </div>
        ) : error ? (
          <div className="text-red-400 text-center py-8">
            Fehler beim Laden der Abonnenten: {error.message}
          </div>
        ) : !subscribers || subscribers.length === 0 ? (
          <div className="text-center py-16 text-zinc-500">
            <Mail className="w-12 h-12 mx-auto mb-4 opacity-30" />
            <p>Noch keine Abonnenten vorhanden.</p>
          </div>
        ) : (
          <div className="bg-zinc-900/40 border border-zinc-800 rounded-xl overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-zinc-800 hover:bg-transparent">
                  <TableHead className="text-zinc-400">E-Mail</TableHead>
                  <TableHead className="text-zinc-400">Name</TableHead>
                  <TableHead className="text-zinc-400">Quelle</TableHead>
                  <TableHead className="text-zinc-400">Status</TableHead>
                  <TableHead className="text-zinc-400">Angemeldet am</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subscribers.map((sub) => (
                  <TableRow key={sub.id} className="border-zinc-800 hover:bg-zinc-800/30">
                    <TableCell className="text-white font-mono text-sm">{sub.email}</TableCell>
                    <TableCell className="text-zinc-300">{sub.name ?? <span className="text-zinc-600">–</span>}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-400 text-xs">
                        {sub.source ?? "website"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {sub.active ? (
                        <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Aktiv</Badge>
                      ) : (
                        <Badge className="bg-zinc-700/50 text-zinc-500 border-zinc-600/30">Abgemeldet</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {new Date(sub.createdAt).toLocaleDateString("de-DE", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "numeric",
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
