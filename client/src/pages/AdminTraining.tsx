import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Unlock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Alle Kategorien und ihre Items – spiegelt TrainingCategoryStructure.tsx
const KATEGORIEN = [
  {
    id: "befindlichkeit",
    name: "BEFINDLICHKEITSTRAINING",
    icon: "🌈",
    items: [],
  },
  {
    id: "breathing",
    name: "1 – ATEMTRAINING",
    icon: "🫁",
    items: [],
  },
  {
    id: "voice",
    name: "2 – STIMMKLANGTRAINING",
    icon: "🎵",
    items: [
      { id: "yohn", name: "YOHN-Atmung" },
      { id: "interval", name: "Intervall-Training" },
    ],
  },
  {
    id: "movement",
    name: "3 – BEWEGUNGSTRAINING",
    icon: "🏃",
    items: [],
  },
  {
    id: "ambient",
    name: "4 – UMFELDAKTIVIERUNG",
    icon: "✨",
    items: [
      { id: "metabolic", name: "STOFFWECHSELATMUNG" },
      { id: "mayerwelle", name: "MAYERWELLE 5,5 / MW" },
    ],
  },
];

export default function AdminTraining() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const { data: freigaben, isLoading } = trpc.training.getAllFreigaben.useQuery();
  const setFreigabe = trpc.training.setFreigabe.useMutation({
    onSuccess: () => {
      utils.training.getAllFreigaben.invalidate();
      utils.training.getFreigaben.invalidate();
      toast({ title: "Gespeichert", description: "Freigabe aktualisiert." });
    },
    onError: (err) => {
      toast({ title: "Fehler", description: err.message });
    },
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Kein Zugriff. Nur für Admins.</p>
      </div>
    );
  }

  const isEnabled = (categoryId: string, itemId?: string) => {
    if (!freigaben) return false;
    return freigaben.some(
      (f) =>
        f.categoryId === categoryId &&
        (itemId ? f.itemId === itemId : !f.itemId) &&
        f.enabled
    );
  };

  const toggle = (categoryId: string, itemId?: string, label?: string) => {
    const current = isEnabled(categoryId, itemId);
    setFreigabe.mutate({
      categoryId,
      itemId,
      enabled: !current,
      label,
    });
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/premium" className="text-amber-400/60 hover:text-amber-400 text-sm mb-4 inline-block">
            ← Zurück zum Admin-Panel
          </Link>
          <h1 className="text-3xl font-bold text-white">TRAINING FREIGABEN</h1>
          <p className="text-zinc-400 mt-2">
            Steuere granular welche Trainingskategorien und Einheiten für alle Nutzer sichtbar sind.
            Als Admin hast du immer vollen Zugang – unabhängig von diesen Einstellungen.
          </p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="space-y-6">
            {KATEGORIEN.map((kat) => (
              <Card key={kat.id} className="bg-zinc-900/50 border-zinc-800">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <span>{kat.icon}</span>
                      <span>{kat.name}</span>
                    </CardTitle>
                    {kat.items.length === 0 && (
                      <div className="flex items-center gap-3">
                        {isEnabled(kat.id) ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                            <Unlock className="w-3 h-3 mr-1" /> Freigeschaltet
                          </Badge>
                        ) : (
                          <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20">
                            <Lock className="w-3 h-3 mr-1" /> Gesperrt
                          </Badge>
                        )}
                        <Switch
                          checked={isEnabled(kat.id)}
                          onCheckedChange={() => toggle(kat.id, undefined, kat.name)}
                          disabled={setFreigabe.isPending}
                        />
                      </div>
                    )}
                  </div>
                </CardHeader>

                {kat.items.length > 0 && (
                  <CardContent className="pt-0 space-y-3">
                    {/* Gesamte Kategorie */}
                    <div className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                      <div>
                        <p className="text-sm font-medium text-white">Gesamte Kategorie freischalten</p>
                        <p className="text-xs text-zinc-500">Alle Einheiten auf einmal freigeben</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {isEnabled(kat.id) ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                            <Unlock className="w-3 h-3 mr-1" /> Alle frei
                          </Badge>
                        ) : (
                          <Badge className="bg-zinc-700/50 text-zinc-400 border-zinc-600/30 text-xs">
                            Einzeln
                          </Badge>
                        )}
                        <Switch
                          checked={isEnabled(kat.id)}
                          onCheckedChange={() => toggle(kat.id, undefined, kat.name)}
                          disabled={setFreigabe.isPending}
                        />
                      </div>
                    </div>

                    {/* Einzelne Items */}
                    {kat.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-zinc-800/30 border border-zinc-700/30 ml-4"
                      >
                        <div>
                          <p className="text-sm font-medium text-zinc-200">{item.name}</p>
                          <p className="text-xs text-zinc-500">Einzelne Einheit</p>
                        </div>
                        <div className="flex items-center gap-3">
                          {isEnabled(kat.id, item.id) || isEnabled(kat.id) ? (
                            <Badge className="bg-green-500/20 text-green-400 border-green-500/30 text-xs">
                              <Unlock className="w-3 h-3 mr-1" /> Frei
                            </Badge>
                          ) : (
                            <Badge className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                              <Lock className="w-3 h-3 mr-1" /> Gesperrt
                            </Badge>
                          )}
                          <Switch
                            checked={isEnabled(kat.id, item.id)}
                            onCheckedChange={() => toggle(kat.id, item.id, item.name)}
                            disabled={setFreigabe.isPending || isEnabled(kat.id)}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}

        <div className="mt-8 p-4 rounded-lg bg-zinc-900/30 border border-zinc-800">
          <p className="text-xs text-zinc-500">
            <strong className="text-zinc-400">Hinweis:</strong> Als Admin siehst du immer alle Kategorien ohne Schloss –
            diese Einstellungen gelten nur für reguläre Nutzer. Änderungen werden sofort wirksam.
          </p>
        </div>
      </div>
    </div>
  );
}
