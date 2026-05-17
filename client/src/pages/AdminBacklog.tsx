import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import {
  ArrowLeft, Plus, Loader2, CheckCircle2, Clock, Trash2, ChevronDown,
  Zap, FileText, Megaphone, Wrench, Compass, MoreHorizontal, Pencil, X, Check
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

type Kategorie = "feature" | "content" | "marketing" | "technik" | "strategie" | "sonstiges";
type Prioritaet = "hoch" | "mittel" | "niedrig";
type Status = "offen" | "in_arbeit" | "erledigt" | "verworfen";

const KATEGORIE_META: Record<Kategorie, { label: string; icon: any; color: string }> = {
  feature:    { label: "Feature",    icon: Zap,       color: "text-blue-400" },
  content:    { label: "Content",    icon: FileText,  color: "text-purple-400" },
  marketing:  { label: "Marketing",  icon: Megaphone, color: "text-pink-400" },
  technik:    { label: "Technik",    icon: Wrench,    color: "text-cyan-400" },
  strategie:  { label: "Strategie",  icon: Compass,   color: "text-amber-400" },
  sonstiges:  { label: "Sonstiges",  icon: MoreHorizontal, color: "text-zinc-400" },
};

const PRIORITAET_META: Record<Prioritaet, { label: string; color: string; dot: string }> = {
  hoch:     { label: "Hoch",    color: "text-red-400",    dot: "bg-red-400" },
  mittel:   { label: "Mittel",  color: "text-orange-400", dot: "bg-orange-400" },
  niedrig:  { label: "Niedrig", color: "text-zinc-500",   dot: "bg-zinc-500" },
};

const STATUS_META: Record<Status, { label: string; color: string; bg: string }> = {
  offen:      { label: "Offen",      color: "text-zinc-300",   bg: "bg-zinc-800" },
  in_arbeit:  { label: "In Arbeit",  color: "text-blue-400",   bg: "bg-blue-500/20" },
  erledigt:   { label: "Erledigt",   color: "text-green-400",  bg: "bg-green-500/20" },
  verworfen:  { label: "Verworfen",  color: "text-zinc-600",   bg: "bg-zinc-900" },
};

const STATUS_FLOW: Status[] = ["offen", "in_arbeit", "erledigt", "verworfen"];

export default function AdminBacklog() {
  const { user, loading, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const utils = trpc.useUtils();

  const [filterStatus, setFilterStatus] = useState<Status | "alle">("alle");
  const [filterKat, setFilterKat] = useState<Kategorie | "alle">("alle");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);

  // Form state
  const [titel, setTitel] = useState("");
  const [beschreibung, setBeschreibung] = useState("");
  const [kategorie, setKategorie] = useState<Kategorie>("sonstiges");
  const [prioritaet, setPrioitaet] = useState<Prioritaet>("mittel");
  const [zieldatum, setZieldatum] = useState("");

  const { data: items = [], isLoading } = trpc.backlog.list.useQuery({
    status: filterStatus,
    kategorie: filterKat,
  });

  const createMutation = trpc.backlog.create.useMutation({
    onSuccess: () => {
      utils.backlog.list.invalidate();
      toast({ title: "✓ Hinzugefügt" });
      resetForm();
    },
  });

  const updateStatusMutation = trpc.backlog.updateStatus.useMutation({
    onSuccess: () => utils.backlog.list.invalidate(),
  });

  const updateMutation = trpc.backlog.update.useMutation({
    onSuccess: () => {
      utils.backlog.list.invalidate();
      toast({ title: "✓ Gespeichert" });
      setEditId(null);
    },
  });

  const deleteMutation = trpc.backlog.delete.useMutation({
    onSuccess: () => {
      utils.backlog.list.invalidate();
      toast({ title: "Gelöscht" });
    },
  });

  const resetForm = () => {
    setTitel(""); setBeschreibung(""); setKategorie("sonstiges");
    setPrioitaet("mittel"); setZieldatum(""); setShowForm(false); setEditId(null);
  };

  const handleSubmit = () => {
    if (!titel.trim()) return;
    if (editId !== null) {
      updateMutation.mutate({ id: editId, titel, beschreibung, kategorie, prioritaet, zieldatum });
    } else {
      createMutation.mutate({ titel, beschreibung, kategorie, prioritaet, zieldatum });
    }
  };

  const startEdit = (item: typeof items[0]) => {
    setEditId(item.id);
    setTitel(item.titel);
    setBeschreibung(item.beschreibung ?? "");
    setKategorie(item.kategorie as Kategorie);
    setPrioitaet(item.prioritaet as Prioritaet);
    setZieldatum(item.zieldatum ?? "");
    setShowForm(true);
  };

  const nextStatus = (current: Status): Status => {
    const idx = STATUS_FLOW.indexOf(current);
    return STATUS_FLOW[(idx + 1) % STATUS_FLOW.length];
  };

  const offeneCount = items.filter(i => i.status === "offen").length;
  const inArbeitCount = items.filter(i => i.status === "in_arbeit").length;
  const erledigtCount = items.filter(i => i.status === "erledigt").length;

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-4 text-zinc-500">
        <p className="text-sm">Kein Zugriff.</p>
        <Link href="/admin"><button className="text-xs text-orange-400 border border-orange-500/40 rounded px-4 py-2 hover:bg-orange-500/10 transition-colors">Zum Admin-Bereich</button></Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-zinc-300 p-6 md:p-10">
      <div className="max-w-3xl mx-auto space-y-8">

        {/* Header */}
        <div className="space-y-1">
          <Link href="/admin">
            <button className="flex items-center gap-1.5 text-zinc-500 hover:text-white text-xs transition-colors mb-2">
              <ArrowLeft className="w-3 h-3" /> ADMIN-ZENTRALE
            </button>
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-white tracking-tight">Strategischer Backlog</h1>
              <p className="text-zinc-500 text-sm mt-1">Ideen, Vorhaben und offene Fragen für KIICH</p>
            </div>
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-black text-sm font-semibold rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" /> Neu
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: "Offen", count: offeneCount, color: "text-zinc-300" },
            { label: "In Arbeit", count: inArbeitCount, color: "text-blue-400" },
            { label: "Erledigt", count: erledigtCount, color: "text-green-400" },
          ].map(s => (
            <div key={s.label} className="border border-zinc-800 rounded-xl p-4 text-center">
              <div className={`text-2xl font-light ${s.color}`}>{s.count}</div>
              <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Neues Item / Edit Form */}
        {showForm && (
          <div className="border border-orange-500/30 bg-orange-500/5 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-orange-400">{editId ? "Eintrag bearbeiten" : "Neuer Eintrag"}</h3>
              <button onClick={resetForm}><X className="w-4 h-4 text-zinc-500 hover:text-white" /></button>
            </div>
            <input
              value={titel}
              onChange={e => setTitel(e.target.value)}
              placeholder="Titel *"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <textarea
              value={beschreibung}
              onChange={e => setBeschreibung(e.target.value)}
              placeholder="Beschreibung (optional)"
              rows={3}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500 resize-none"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Kategorie</label>
                <select
                  value={kategorie}
                  onChange={e => setKategorie(e.target.value as Kategorie)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {Object.entries(KATEGORIE_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-zinc-500 mb-1 block">Priorität</label>
                <select
                  value={prioritaet}
                  onChange={e => setPrioitaet(e.target.value as Prioritaet)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-orange-500"
                >
                  {Object.entries(PRIORITAET_META).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <input
              value={zieldatum}
              onChange={e => setZieldatum(e.target.value)}
              placeholder="Zieldatum (z.B. Q3 2026) – optional"
              className="w-full bg-zinc-900 border border-zinc-700 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-orange-500"
            />
            <div className="flex gap-2 justify-end">
              <button onClick={resetForm} className="px-4 py-2 text-sm text-zinc-400 hover:text-white transition-colors">Abbrechen</button>
              <button
                onClick={handleSubmit}
                disabled={!titel.trim() || createMutation.isPending || updateMutation.isPending}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 disabled:opacity-50 text-black text-sm font-semibold rounded-lg transition-colors"
              >
                {(createMutation.isPending || updateMutation.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                {editId ? "Speichern" : "Hinzufügen"}
              </button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          {(["alle", "offen", "in_arbeit", "erledigt", "verworfen"] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterStatus === s ? "bg-orange-500 text-black" : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
              }`}
            >
              {s === "alle" ? "Alle" : STATUS_META[s as Status].label}
            </button>
          ))}
          <div className="w-px bg-zinc-800 mx-1" />
          {(["alle", ...Object.keys(KATEGORIE_META)] as const).map(k => (
            <button
              key={k}
              onClick={() => setFilterKat(k as Kategorie | "alle")}
              className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                filterKat === k ? "bg-zinc-600 text-white" : "bg-zinc-900 text-zinc-500 hover:bg-zinc-800"
              }`}
            >
              {k === "alle" ? "Alle Kategorien" : KATEGORIE_META[k as Kategorie].label}
            </button>
          ))}
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="w-6 h-6 text-orange-400 animate-spin" />
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-16 text-zinc-600">
            <Compass className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">Noch keine Einträge. Füge dein erstes Vorhaben hinzu.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map(item => {
              const kat = KATEGORIE_META[item.kategorie as Kategorie];
              const prio = PRIORITAET_META[item.prioritaet as Prioritaet];
              const stat = STATUS_META[item.status as Status];
              const KatIcon = kat.icon;
              const isVerworfen = item.status === "verworfen";
              return (
                <div
                  key={item.id}
                  className={`border rounded-xl p-4 transition-all ${
                    isVerworfen ? "border-zinc-900 opacity-40" : "border-zinc-800 hover:border-zinc-700"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {/* Status-Toggle */}
                    <button
                      onClick={() => updateStatusMutation.mutate({ id: item.id, status: nextStatus(item.status as Status) })}
                      className="mt-0.5 shrink-0"
                      title={`Weiter zu: ${STATUS_META[nextStatus(item.status as Status)].label}`}
                    >
                      {item.status === "erledigt"
                        ? <CheckCircle2 className="w-5 h-5 text-green-400" />
                        : item.status === "in_arbeit"
                        ? <Clock className="w-5 h-5 text-blue-400" />
                        : <div className="w-5 h-5 rounded-full border-2 border-zinc-600 hover:border-orange-400 transition-colors" />
                      }
                    </button>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-sm font-medium ${isVerworfen ? "line-through text-zinc-500" : "text-white"}`}>
                          {item.titel}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${stat.bg} ${stat.color}`}>
                          {stat.label}
                        </span>
                      </div>
                      {item.beschreibung && (
                        <p className="text-xs text-zinc-500 mt-1 leading-relaxed">{item.beschreibung}</p>
                      )}
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <span className={`flex items-center gap-1 text-xs ${kat.color}`}>
                          <KatIcon className="w-3 h-3" />{kat.label}
                        </span>
                        <span className={`flex items-center gap-1 text-xs ${prio.color}`}>
                          <div className={`w-1.5 h-1.5 rounded-full ${prio.dot}`} />{prio.label}
                        </span>
                        {item.zieldatum && (
                          <span className="text-xs text-zinc-600">→ {item.zieldatum}</span>
                        )}
                        <span className="text-xs text-zinc-700">
                          {new Date(item.createdAt).toLocaleDateString("de-DE")}
                        </span>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => startEdit(item)}
                        className="p-1.5 text-zinc-600 hover:text-zinc-300 transition-colors"
                        title="Bearbeiten"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Eintrag löschen?")) deleteMutation.mutate({ id: item.id });
                        }}
                        className="p-1.5 text-zinc-600 hover:text-red-400 transition-colors"
                        title="Löschen"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
