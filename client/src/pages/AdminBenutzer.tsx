import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Loader2, Search, Trash2, ArrowLeft, Users, ChevronLeft, ChevronRight, Unlock, X, RotateCcw } from "lucide-react";
import { Link } from "wouter";

// Trainingsstruktur
const KATEGORIEN = [
  { id: "befindlichkeit", name: "BEFINDLICHKEITSTRAINING", icon: "🌈", items: [] as {id:string;name:string}[] },
  { id: "breathing", name: "ATEMTRAINING", icon: "🫁", items: [] as {id:string;name:string}[] },
  { id: "voice", name: "STIMMKLANGTRAINING", icon: "🎵", items: [
    { id: "yohn", name: "YOHN-Atmung" },
    { id: "interval", name: "Intervall-Training" },
  ]},
  { id: "movement", name: "BEWEGUNGSTRAINING", icon: "🏃", items: [] as {id:string;name:string}[] },
  { id: "ambient", name: "UMFELDAKTIVIERUNG", icon: "✨", items: [
    { id: "metabolic", name: "STOFFWECHSELATMUNG" },
    { id: "mayerwelle", name: "MAYERWELLE 5,5 / MW" },
  ]},
];

function TrainingFreigabenModal({ userId, userName, onClose }: { userId: number; userName: string; onClose: () => void }) {
  const utils = trpc.useUtils();
  const { data: freigaben, isLoading } = trpc.training.getUserFreigaben.useQuery({ userId });
  const setFreigabe = trpc.training.setUserFreigabe.useMutation({
    onSuccess: () => { utils.training.getUserFreigaben.invalidate({ userId }); utils.training.getFreigaben.invalidate(); },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });
  const resetFreigaben = trpc.training.resetUserFreigaben.useMutation({
    onSuccess: () => { utils.training.getUserFreigaben.invalidate({ userId }); utils.training.getFreigaben.invalidate(); toast.success("Auf globale Einstellungen zurückgesetzt."); },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });
  const isEnabled = (categoryId: string, itemId?: string) =>
    !!(freigaben?.some(f => f.categoryId === categoryId && (itemId ? f.itemId === itemId : !f.itemId) && f.enabled));
  const toggle = (categoryId: string, itemId?: string, label?: string) =>
    setFreigabe.mutate({ userId, categoryId, itemId, enabled: !isEnabled(categoryId, itemId), label });
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-white font-semibold flex items-center gap-2"><Unlock className="w-4 h-4 text-orange-400" />Trainingsfreigaben</h3>
            <p className="text-zinc-500 text-xs mt-0.5">{userName}</p>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white"><X className="w-4 h-4" /></button>
        </div>
        <p className="text-zinc-600 text-xs border border-zinc-800 rounded-lg p-3 bg-zinc-900/40">
          Nutzer-spezifische Freigaben <strong className="text-zinc-400">überschreiben</strong> die globalen Einstellungen.
        </p>
        {isLoading ? (
          <div className="flex justify-center py-8"><Loader2 className="w-5 h-5 text-orange-400 animate-spin" /></div>
        ) : (
          <div className="space-y-4">
            {KATEGORIEN.map(kat => (
              <div key={kat.id} className="border border-zinc-800 rounded-xl p-4 bg-zinc-900/20 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2"><span>{kat.icon}</span><span className="text-sm font-medium text-zinc-200">{kat.name}</span></div>
                  {kat.items.length === 0 && (
                    <Switch checked={isEnabled(kat.id)} onCheckedChange={() => toggle(kat.id, undefined, kat.name)} disabled={setFreigabe.isPending} className="data-[state=checked]:bg-orange-500" />
                  )}
                </div>
                {kat.items.length > 0 && (
                  <div className="space-y-2 pl-6 border-l border-zinc-800">
                    {kat.items.map(item => (
                      <div key={item.id} className="flex items-center justify-between">
                        <span className="text-xs text-zinc-400">{item.name}</span>
                        <Switch checked={isEnabled(kat.id, item.id)} onCheckedChange={() => toggle(kat.id, item.id, item.name)} disabled={setFreigabe.isPending} className="data-[state=checked]:bg-orange-500" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {freigaben && freigaben.length > 0 && (
          <button onClick={() => resetFreigaben.mutate({ userId })} disabled={resetFreigaben.isPending}
            className="w-full flex items-center justify-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-800 rounded-lg py-2 transition-colors hover:bg-zinc-900">
            {resetFreigaben.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <RotateCcw className="w-3 h-3" />}
            Auf globale Einstellungen zurücksetzen
          </button>
        )}
      </div>
    </div>
  );
}

export default function AdminBenutzer() {
  const { user, loading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [page, setPage] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string | null; email: string | null } | null>(null);
  const [trainingTarget, setTrainingTarget] = useState<{ id: number; name: string } | null>(null);

  const isAdmin = user?.role === "admin";

  // Suche (nur wenn activeSearch gesetzt)
  const searchResult = trpc.admin.searchUsers.useQuery(
    { query: activeSearch },
    { enabled: !!activeSearch && isAdmin }
  );

  // Liste (wenn keine Suche aktiv)
  const listResult = trpc.admin.listUsers.useQuery(
    { page },
    { enabled: !activeSearch && isAdmin }
  );

  const utils = trpc.useUtils();
  const deleteMutation = trpc.admin.deleteUser.useMutation({
    onSuccess: (data) => {
      toast.success(`Benutzer #${data.deletedId} wurde gelöscht (inkl. Newsletter-Eintrag).`);
      setDeleteTarget(null);
      utils.admin.listUsers.invalidate();
      utils.admin.searchUsers.invalidate();
      utils.admin.getUserStats.invalidate();
    },
    onError: (err) => {
      toast.error(`Fehler: ${err.message}`);
      setDeleteTarget(null);
    },
  });

  const handleSearch = () => {
    if (searchQuery.trim().length < 1) return;
    setActiveSearch(searchQuery.trim());
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setActiveSearch("");
  };

  const displayedUsers = activeSearch
    ? (searchResult.data ?? [])
    : (listResult.data?.users ?? []);

  const isLoading = activeSearch ? searchResult.isLoading : listResult.isLoading;
  const total = listResult.data?.total ?? 0;
  const pageSize = listResult.data?.pageSize ?? 20;
  const totalPages = Math.ceil(total / pageSize);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <Loader2 className="animate-spin w-8 h-8 text-orange-500" />
    </div>
  );

  if (!isAdmin) return (
    <div className="flex items-center justify-center min-h-screen">
      <p className="text-red-500">Kein Zugriff – nur für Admins.</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 p-4 md:p-8">
      {trainingTarget && (
        <TrainingFreigabenModal userId={trainingTarget.id} userName={trainingTarget.name} onClose={() => setTrainingTarget(null)} />
      )}
      {/* Header */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Link href="/admin">
            <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-zinc-100">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-100 flex items-center gap-2">
              <Users className="w-6 h-6 text-orange-500" />
              Benutzerverwaltung
            </h1>
            <p className="text-zinc-400 text-sm mt-0.5">
              {activeSearch
                ? `Suchergebnisse für „${activeSearch}"`
                : `Alle Benutzer · ${total} gesamt`}
            </p>
          </div>
        </div>

        {/* Suchleiste */}
        <Card className="bg-zinc-900 border-zinc-800 mb-6">
          <CardContent className="pt-4 pb-4">
            <div className="flex gap-2">
              <Input
                placeholder="Name, E-Mail oder Vorname suchen…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 placeholder:text-zinc-500 flex-1"
              />
              <Button
                onClick={handleSearch}
                disabled={!searchQuery.trim()}
                className="bg-orange-600 hover:bg-orange-500 text-white"
              >
                <Search className="w-4 h-4 mr-1" />
                Suchen
              </Button>
              {activeSearch && (
                <Button
                  variant="outline"
                  onClick={handleClearSearch}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Alle anzeigen
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Tabelle */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-zinc-100 text-base">
              {activeSearch
                ? `${displayedUsers.length} Treffer`
                : `Seite ${page + 1} von ${totalPages || 1}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="animate-spin w-6 h-6 text-orange-500" />
              </div>
            ) : displayedUsers.length === 0 ? (
              <p className="text-zinc-500 text-center py-12">
                {activeSearch ? "Keine Benutzer gefunden." : "Noch keine Benutzer registriert."}
              </p>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 hover:bg-transparent">
                      <TableHead className="text-zinc-400">ID</TableHead>
                      <TableHead className="text-zinc-400">Name</TableHead>
                      <TableHead className="text-zinc-400">E-Mail</TableHead>
                      <TableHead className="text-zinc-400">Vorname</TableHead>
                      <TableHead className="text-zinc-400">Rolle</TableHead>
                      <TableHead className="text-zinc-400">Registriert</TableHead>
                      <TableHead className="text-zinc-400">Letzter Login</TableHead>
                      <TableHead className="text-zinc-400 text-right">Aktionen</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedUsers.map((u) => (
                      <TableRow key={u.id} className="border-zinc-800 hover:bg-zinc-800/50">
                        <TableCell className="text-zinc-500 text-xs">{u.id}</TableCell>
                        <TableCell className="text-zinc-200 font-medium">{u.name || "—"}</TableCell>
                        <TableCell className="text-zinc-300 text-sm">{u.email || "—"}</TableCell>
                        <TableCell className="text-zinc-400 text-sm">{u.vorname || "—"}</TableCell>
                        <TableCell>
                          <Badge
                            variant={u.role === "admin" ? "default" : "secondary"}
                            className={u.role === "admin"
                              ? "bg-orange-600 text-white text-xs"
                              : "bg-zinc-700 text-zinc-300 text-xs"}
                          >
                            {u.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs">
                          {new Date(u.createdAt).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-zinc-400 text-xs">
                          {new Date(u.lastSignedIn).toLocaleDateString("de-DE")}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon"
                              onClick={() => setTrainingTarget({ id: u.id, name: u.vorname || u.name || `User #${u.id}` })}
                              className="text-zinc-500 hover:text-orange-400 hover:bg-orange-950/30" title="Trainingsfreigaben">
                              <Unlock className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon"
                              onClick={() => setDeleteTarget({ id: u.id, name: u.name, email: u.email })}
                              className="text-zinc-500 hover:text-red-400 hover:bg-red-950/30" title="Benutzer löschen (DSGVO)">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {/* Pagination (nur ohne aktive Suche) */}
            {!activeSearch && totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-zinc-800">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Zurück
                </Button>
                <span className="text-zinc-500 text-sm">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Weiter
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Lösch-Bestätigungsdialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-700 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-red-400">Benutzer löschen?</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              <strong className="text-zinc-200">{deleteTarget?.name || deleteTarget?.email || `#${deleteTarget?.id}`}</strong>
              {" "}wird unwiderruflich gelöscht – inkl. App-Konto und Newsletter-Eintrag (DSGVO-konform).
              <br /><br />
              Diese Aktion kann nicht rückgängig gemacht werden.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700">
              Abbrechen
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteTarget && deleteMutation.mutate({ userId: deleteTarget.id, confirm: true })}
              disabled={deleteMutation.isPending}
              className="bg-red-700 hover:bg-red-600 text-white"
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : <Trash2 className="w-4 h-4 mr-1" />}
              Endgültig löschen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
