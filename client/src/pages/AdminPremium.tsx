import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Lock, Unlock, Zap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

const FEATURES = [
  {
    key: "momentaufnahme" as const,
    label: "MOMENTAUFNAHME",
    description: "Sprachaufnahme & KI-Analyse — der persönliche Klang-Spiegel",
    color: "text-amber-400",
  },
  {
    key: "befindlichkeitstraining" as const,
    label: "BEFINDLICHKEITSTRAINING",
    description: "Tägliche Selbstwahrnehmung als strukturierte Praxis",
    color: "text-orange-400",
  },
  {
    key: "trainingscenter" as const,
    label: "TRAININGSCENTER",
    description: "METHODE 36 — 7 Minuten täglich, selbstbestimmt",
    color: "text-red-400",
  },
];

export default function AdminPremium() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const { data: settings, isLoading } = trpc.premium.getSettings.useQuery();

  const toggle = trpc.premium.toggleFeature.useMutation({
    onSuccess: () => {
      utils.premium.getSettings.invalidate();
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

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/admin/newsletter" className="text-amber-400/60 hover:text-amber-400 text-sm mb-4 inline-block">
            ← Zurück zum Newsletter-Admin
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-6 h-6 text-amber-400" />
            <h1 className="text-2xl font-bold tracking-wider">PREMIUM-STEUERUNG</h1>
          </div>
          <p className="text-white/50 text-sm">
            Schalte Premium-Bereiche per Klick frei oder sperre sie — ohne Code-Änderung.
          </p>
        </div>

        {/* Feature Cards */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
          </div>
        ) : (
          <div className="space-y-4">
            {FEATURES.map((feature) => {
              const isEnabled = settings?.[feature.key] ?? false;
              const isPending = toggle.isPending;

              return (
                <Card
                  key={feature.key}
                  className={`bg-white/5 border transition-all duration-300 ${
                    isEnabled ? "border-amber-500/40" : "border-white/10"
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {isEnabled ? (
                          <Unlock className="w-4 h-4 text-green-400" />
                        ) : (
                          <Lock className="w-4 h-4 text-white/30" />
                        )}
                        <CardTitle className={`text-sm font-bold tracking-widest ${feature.color}`}>
                          {feature.label}
                        </CardTitle>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            isEnabled
                              ? "border-green-500/50 text-green-400 bg-green-500/10"
                              : "border-white/20 text-white/40"
                          }
                        >
                          {isEnabled ? "FREIGESCHALTET" : "GESPERRT"}
                        </Badge>
                        <Switch
                          checked={isEnabled}
                          disabled={isPending}
                          onCheckedChange={(checked) =>
                            toggle.mutate({ feature: feature.key, enabled: checked })
                          }
                          className="data-[state=checked]:bg-amber-500"
                        />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-white/40 text-xs">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Link zu Training-Freigaben */}
        <div className="mt-6">
          <Link
            href="/admin/training"
            className="flex items-center justify-between p-4 rounded-lg bg-zinc-900/50 border border-zinc-700 hover:border-amber-500/50 transition-colors group"
          >
            <div>
              <p className="text-white font-medium">TRAINING FREIGABEN</p>
              <p className="text-zinc-400 text-sm">Einzelne Trainingseinheiten granular freischalten</p>
            </div>
            <span className="text-amber-400 group-hover:text-amber-300">→</span>
          </Link>
        </div>
        {/* Hinweis */}
        <div className="mt-6 p-4 rounded-lg bg-amber-500/5 border border-amber-500/20">
          <p className="text-amber-400/70 text-xs leading-relaxed">
            <strong className="text-amber-400">Häppchenprinzip:</strong> Schalte Bereiche schrittweise mit den Episoden frei.
            Gesperrte Bereiche zeigen weiterhin den Einführungstext — sie wirken als Neugier-Anker für zukünftige Abonnenten.
          </p>
        </div>
      </div>
    </div>
  );
}
