import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Plus, Edit2, Trash2, GripVertical, Check, X } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

type PraxisProjekt = {
  id: number;
  titel: string;
  beschreibung: string;
  detailbeschreibung: string | null;
  link: string;
  aktiv: boolean;
  sortOrder: number;
};

export default function AdminPraxisProjekte() {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    titel: "",
    beschreibung: "",
    detailbeschreibung: "",
    link: "",
  });

  const { data: projekte = [], isLoading, refetch } = trpc.getPraxisProjekteAdmin.useQuery();
  const createMutation = trpc.createPraxisProjekt.useMutation();
  const updateMutation = trpc.updatePraxisProjekt.useMutation();
  const deleteMutation = trpc.deletePraxisProjekt.useMutation();
  const reorderMutation = trpc.reorderPraxisProjekte.useMutation();

  const handleSubmit = async () => {
    if (!formData.titel || !formData.beschreibung || !formData.link) {
      toast.error("Bitte alle Pflichtfelder ausfüllen");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          ...formData,
        });
        toast.success("Projekt aktualisiert");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Projekt erstellt");
      }
      setFormData({ titel: "", beschreibung: "", detailbeschreibung: "", link: "" });
      setEditingId(null);
      refetch();
    } catch {
      toast.error("Fehler beim Speichern");
    }
  };

  const handleEdit = (projekt: PraxisProjekt) => {
    setEditingId(projekt.id);
    setFormData({
      titel: projekt.titel,
      beschreibung: projekt.beschreibung,
      detailbeschreibung: projekt.detailbeschreibung || "",
      link: projekt.link,
    });
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Projekt wirklich löschen?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Projekt gelöscht");
      refetch();
    } catch {
      toast.error("Fehler beim Löschen");
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0) return;
    const newOrder = [...projekte];
    [newOrder[index - 1], newOrder[index]] = [newOrder[index], newOrder[index - 1]];
    try {
      await reorderMutation.mutateAsync({
        ids: newOrder.map((p: PraxisProjekt) => p.id),
      });
      refetch();
    } catch {
      toast.error("Fehler beim Sortieren");
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === projekte.length - 1) return;
    const newOrder = [...projekte];
    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
    try {
      await reorderMutation.mutateAsync({
        ids: newOrder.map((p: PraxisProjekt) => p.id),
      });
      refetch();
    } catch {
      toast.error("Fehler beim Sortieren");
    }
  };

  if (isLoading) return <div className="text-center py-8 text-white">Lädt...</div>;

  return (
    <div className="space-y-8 max-w-4xl mx-auto p-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">KIICH PRAXIS PROJEKTE</h1>
        <p className="text-zinc-400">Erstelle und verwalte benutzerdefinierte Praxisprojekte</p>
      </div>

      {/* Formular */}
      <Card className="bg-zinc-900/50 border-zinc-800 p-6 space-y-4">
        <h2 className="text-xl font-semibold text-white">
          {editingId ? "Projekt bearbeiten" : "Neues Projekt"}
        </h2>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Titel *</label>
          <Input
            value={formData.titel}
            onChange={(e) => setFormData({ ...formData, titel: e.target.value })}
            placeholder="z.B. KI & Kreativität"
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Kurzbeschreibung *</label>
          <Textarea
            value={formData.beschreibung}
            onChange={(e) => setFormData({ ...formData, beschreibung: e.target.value })}
            placeholder="1-2 Sätze"
            className="bg-zinc-800 border-zinc-700 text-white h-20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Detaillierte Beschreibung</label>
          <Textarea
            value={formData.detailbeschreibung}
            onChange={(e) => setFormData({ ...formData, detailbeschreibung: e.target.value })}
            placeholder="Optionale ausführliche Anleitung"
            className="bg-zinc-800 border-zinc-700 text-white h-32"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">Link *</label>
          <Input
            value={formData.link}
            onChange={(e) => setFormData({ ...formData, link: e.target.value })}
            placeholder="/raum36?tab=methode36 oder https://..."
            className="bg-zinc-800 border-zinc-700 text-white"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={handleSubmit}
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-orange-600 hover:bg-orange-500 text-white"
          >
            <Check className="w-4 h-4 mr-2" />
            {editingId ? "Aktualisieren" : "Erstellen"}
          </Button>
          {editingId && (
            <Button
              onClick={() => {
                setEditingId(null);
                setFormData({ titel: "", beschreibung: "", detailbeschreibung: "", link: "" });
              }}
              variant="outline"
            >
              <X className="w-4 h-4 mr-2" />
              Abbrechen
            </Button>
          )}
        </div>
      </Card>

      {/* Projektliste */}
      <div className="space-y-3">
        <h2 className="text-xl font-semibold text-white">Projekte ({projekte.length})</h2>
        {projekte.length === 0 ? (
          <p className="text-zinc-400">Noch keine Projekte. Erstelle dein erstes Projekt oben.</p>
        ) : (
          <div className="space-y-3">
            {projekte.map((projekt: PraxisProjekt, idx: number) => (
              <Card key={projekt.id} className="bg-zinc-900/50 border-zinc-800 p-4">
                <div className="flex items-start gap-4">
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                      className="p-1 hover:bg-zinc-800 disabled:opacity-50 rounded text-white"
                    >
                      ↑
                    </button>
                    <GripVertical className="w-4 h-4 text-zinc-600" />
                    <button
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === projekte.length - 1}
                      className="p-1 hover:bg-zinc-800 disabled:opacity-50 rounded text-white"
                    >
                      ↓
                    </button>
                  </div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{projekt.titel}</h3>
                    <p className="text-zinc-400 text-sm mt-1">{projekt.beschreibung}</p>
                    <p className="text-zinc-500 text-xs mt-2">Link: {projekt.link}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(projekt)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(projekt.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
