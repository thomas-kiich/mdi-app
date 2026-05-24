import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft, Plus, Pencil, Trash2, Loader2, Upload,
  Music2, Video, Image, Headphones, ChevronDown, ChevronUp, Eye, EyeOff
} from "lucide-react";
import { Link } from "wouter";
import { RichTextEditor } from "@/components/RichTextEditor";

const KATEGORIEN = [
  { id: "befindlichkeit", label: "BEFINDLICHKEITSTRAINING", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" },
  { id: "atemtraining", label: "ATEMTRAINING", color: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  { id: "stimmklangtraining", label: "STIMMKLANGTRAINING", color: "bg-purple-500/20 text-purple-300 border-purple-500/30" },
  { id: "bewegungstraining", label: "BEWEGUNGSTRAINING", color: "bg-green-500/20 text-green-300 border-green-500/30" },
  { id: "umfeldaktivierung", label: "UMFELDAKTIVIERUNG", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" },
] as const;

type Kategorie = typeof KATEGORIEN[number]["id"];

const EMPTY_FORM = {
  kategorie: "befindlichkeit" as Kategorie,
  titel: "",
  kurzbeschreibung: "",
  beschreibung: "",
  dauern: "7,12,21",
  audioUrl: "",
  videoUrl: "",
  infografikUrl: "",
  audioBeschreibungUrl: "",
  sortOrder: 0,
  aktiv: false,
};

export default function AdminTrainingEinheiten() {
  const { user, isAuthenticated } = useAuth();
  const utils = trpc.useUtils();
  const { toast } = useToast();

  const { data: einheiten, isLoading } = trpc.trainingEinheiten.getAllAdmin.useQuery();

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploadingField, setUploadingField] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploadSuccess, setUploadSuccess] = useState<string | null>(null);
  const [filterKat, setFilterKat] = useState<string>("alle");

  const createMutation = trpc.trainingEinheiten.create.useMutation({
    onSuccess: () => {
      utils.trainingEinheiten.getAllAdmin.invalidate();
      utils.trainingEinheiten.getAll.invalidate();
      toast({ title: "Training erstellt", description: `„${form.titel}" wurde angelegt.` });
      setShowForm(false);
      setForm({ ...EMPTY_FORM });
    },
    onError: (e) => toast({ title: "Fehler", description: e.message }),
  });

  const updateMutation = trpc.trainingEinheiten.update.useMutation({
    onSuccess: () => {
      utils.trainingEinheiten.getAllAdmin.invalidate();
      utils.trainingEinheiten.getAll.invalidate();
      toast({ title: "Gespeichert", description: `„${form.titel}" wurde aktualisiert.` });
      setShowForm(false);
      setEditId(null);
      setForm({ ...EMPTY_FORM });
    },
    onError: (e) => toast({ title: "Fehler", description: e.message }),
  });

  const deleteMutation = trpc.trainingEinheiten.delete.useMutation({
    onSuccess: () => {
      utils.trainingEinheiten.getAllAdmin.invalidate();
      utils.trainingEinheiten.getAll.invalidate();
      toast({ title: "Gelöscht" });
    },
    onError: (e) => toast({ title: "Fehler", description: e.message }),
  });

  const toggleMutation = trpc.trainingEinheiten.toggleAktiv.useMutation({
    onSuccess: () => {
      utils.trainingEinheiten.getAllAdmin.invalidate();
      utils.trainingEinheiten.getAll.invalidate();
    },
    onError: (e) => toast({ title: "Fehler", description: e.message }),
  });

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-white/60">Kein Zugriff. Nur für Admins.</p>
      </div>
    );
  }

  const handleEdit = (e: any) => {
    setForm({
      kategorie: e.kategorie as Kategorie,
      titel: e.titel,
      kurzbeschreibung: e.kurzbeschreibung,
      beschreibung: e.beschreibung || "",
      dauern: e.dauern || "7,12,21",
      audioUrl: e.audioUrl || "",
      videoUrl: e.videoUrl || "",
      infografikUrl: e.infografikUrl || "",
      audioBeschreibungUrl: e.audioBeschreibungUrl || "",
      sortOrder: e.sortOrder,
      aktiv: e.aktiv,
    });
    setEditId(e.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = () => {
    if (!form.titel.trim() || !form.kurzbeschreibung.trim()) {
      toast({ title: "Pflichtfelder fehlen", description: "Titel und Kurzbeschreibung sind erforderlich." });
      return;
    }
    if (editId !== null) {
      updateMutation.mutate({ ...form, id: editId });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditId(null);
    setForm({ ...EMPTY_FORM });
  };

  // Upload Funktion mit Fortschrittsanzeige
  // Wählt je nach Dateityp die richtige Upload-Route
  const handleFileUpload = (field: keyof typeof EMPTY_FORM, accept: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;
    input.onchange = async (e: any) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setUploadingField(field);
      setUploadProgress(0);
      setUploadSuccess(null);
      try {
        const isImage = accept.startsWith("image");
        // Audio → /api/podcast/upload, Bild → /api/training/upload-image
        const uploadUrl = isImage ? "/api/training/upload-image" : "/api/podcast/upload";
        const fieldName = isImage ? "image" : "audio";
        const formData = new FormData();
        formData.append(fieldName, file);
        // XHR für Fortschrittsanzeige
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open("POST", uploadUrl);
          xhr.withCredentials = true;
          xhr.upload.onprogress = (ev) => {
            if (ev.lengthComputable) setUploadProgress(Math.round((ev.loaded / ev.total) * 100));
          };
          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              const data = JSON.parse(xhr.responseText);
              // Beide Routen geben { url } zurück
              const url = data.url || data.audioUrl;
              setForm((f) => ({ ...f, [field]: url }));
              setUploadSuccess(field);
              setUploadProgress(100);
              toast({ title: "✓ Hochgeladen", description: `${file.name} wurde erfolgreich hochgeladen.` });
              setTimeout(() => setUploadSuccess(null), 3000);
              resolve();
            } else {
              let errMsg = "Upload fehlgeschlagen (" + xhr.status + ")";
              try { errMsg = JSON.parse(xhr.responseText)?.error || errMsg; } catch {}
              reject(new Error(errMsg));
            }
          };
          xhr.onerror = () => reject(new Error("Netzwerkfehler beim Upload"));
          xhr.send(formData);
        });
      } catch (err: any) {
        toast({ title: "Upload-Fehler", description: err.message });
      } finally {
        setUploadingField(null);
      }
    };
    input.click();
  };

  const filteredEinheiten = (einheiten || []).filter(
    (e) => filterKat === "alle" || e.kategorie === filterKat
  );

  const katInfo = (id: string) => KATEGORIEN.find((k) => k.id === id) || KATEGORIEN[0];

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 bg-zinc-900/80 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href="/admin">
            <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
              <ArrowLeft className="w-4 h-4 mr-1" /> Admin
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-emerald-400 tracking-wider">NEUES TRAINING</h1>
            <p className="text-xs text-zinc-500">Trainingseinheiten anlegen und verwalten</p>
          </div>
          <Button
            onClick={() => { setShowForm(true); setEditId(null); setForm({ ...EMPTY_FORM }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm"
          >
            <Plus className="w-4 h-4 mr-1" /> Neue Einheit
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">

        {/* Formular */}
        {showForm && (
          <div className="bg-zinc-900 border border-emerald-500/30 rounded-xl p-5 space-y-5">
            <h2 className="text-emerald-400 font-bold text-base tracking-wider">
              {editId !== null ? "TRAINING BEARBEITEN" : "NEUES TRAINING ANLEGEN"}
            </h2>

            {/* Kategorie */}
            <div>
              <Label className="text-zinc-300 text-xs mb-2 block">KATEGORIE *</Label>
              <div className="flex flex-wrap gap-2">
                {KATEGORIEN.map((k) => (
                  <button
                    key={k.id}
                    onClick={() => setForm((f) => ({ ...f, kategorie: k.id }))}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                      form.kategorie === k.id
                        ? k.color + " ring-2 ring-white/20"
                        : "bg-zinc-800 text-zinc-400 border-zinc-700 hover:border-zinc-500"
                    }`}
                  >
                    {k.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Titel + Kurzbeschreibung */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">TITEL der Kachel *</Label>
                <Input
                  placeholder="z.B. MORGENATMUNG"
                  value={form.titel}
                  onChange={(e) => setForm((f) => ({ ...f, titel: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">DAUERN (Minuten, kommagetrennt) *</Label>
                <Input
                  placeholder="7,12,21"
                  value={form.dauern}
                  onChange={(e) => setForm((f) => ({ ...f, dauern: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white font-mono"
                />
                <p className="text-zinc-500 text-xs mt-1">Standard: 7,12,21 – beliebige Werte möglich</p>
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">KURZBESCHREIBUNG (Kachel-Text) *</Label>
              <Textarea
                placeholder="Kurze Beschreibung für die Kachel (1–2 Sätze)"
                value={form.kurzbeschreibung}
                onChange={(e) => setForm((f) => ({ ...f, kurzbeschreibung: e.target.value }))}
                rows={2}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">DETAILBESCHREIBUNG (Hauptfenster) – mit Formatierung &amp; Farben</Label>
              <RichTextEditor
                value={form.beschreibung}
                onChange={(html) => setForm((f) => ({ ...f, beschreibung: html }))}
                placeholder="Detaillierte Anleitung und Beschreibung des Trainings..."
                minHeight="180px"
              />
            </div>

            {/* Medien-Felder */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* Audio */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                <Label className="text-zinc-300 text-xs mb-2 flex items-center gap-1.5">
                  <Music2 className="w-3.5 h-3.5 text-blue-400" /> AUDIO
                </Label>
                {form.audioUrl ? (
                  <div className="space-y-2">
                    <audio controls className="w-full rounded" style={{ height: "36px" }}>
                      <source src={`/api/audio-proxy?url=${encodeURIComponent(form.audioUrl)}`} type="audio/mpeg" />
                    </audio>
                    <div className="flex gap-2">
                      <Input value={form.audioUrl} onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="CDN-URL" />
                      <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, audioUrl: "" }))} className="text-zinc-400 hover:text-red-400 shrink-0">✕</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload("audioUrl", "audio/*")} disabled={uploadingField === "audioUrl"} className="w-full border-zinc-600 text-zinc-300 hover:text-white">
                      {uploadingField === "audioUrl" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                      MP3 hochladen
                    </Button>
                    <Input value={form.audioUrl} onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="oder URL einfügen" />
                  </div>
                )}
              </div>

              {/* Audiobeschreibung */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                <Label className="text-zinc-300 text-xs mb-2 flex items-center gap-1.5">
                  <Headphones className="w-3.5 h-3.5 text-purple-400" /> AUDIOBESCHREIBUNG / PODCAST
                </Label>
                {form.audioBeschreibungUrl ? (
                  <div className="space-y-2">
                    <audio controls className="w-full rounded" style={{ height: "36px" }}>
                      <source src={`/api/audio-proxy?url=${encodeURIComponent(form.audioBeschreibungUrl)}`} type="audio/mpeg" />
                    </audio>
                    <div className="flex gap-2">
                      <Input value={form.audioBeschreibungUrl} onChange={(e) => setForm((f) => ({ ...f, audioBeschreibungUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="CDN-URL" />
                      <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, audioBeschreibungUrl: "" }))} className="text-zinc-400 hover:text-red-400 shrink-0">✕</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload("audioBeschreibungUrl", "audio/*")} disabled={uploadingField === "audioBeschreibungUrl"} className="w-full border-zinc-600 text-zinc-300 hover:text-white">
                      {uploadingField === "audioBeschreibungUrl" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                      MP3 hochladen
                    </Button>
                    <Input value={form.audioBeschreibungUrl} onChange={(e) => setForm((f) => ({ ...f, audioBeschreibungUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="oder URL einfügen" />
                  </div>
                )}
              </div>

              {/* Video */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                <Label className="text-zinc-300 text-xs mb-2 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-red-400" /> VIDEO
                </Label>
                <Input
                  value={form.videoUrl}
                  onChange={(e) => setForm((f) => ({ ...f, videoUrl: e.target.value }))}
                  className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono"
                  placeholder="YouTube-URL oder direkte Video-URL"
                />
                <p className="text-zinc-500 text-xs mt-1">z.B. https://youtu.be/...</p>
              </div>

              {/* Infografik */}
              <div className="bg-zinc-800/50 rounded-lg p-3 border border-zinc-700">
                <Label className="text-zinc-300 text-xs mb-2 flex items-center gap-1.5">
                  <Image className="w-3.5 h-3.5 text-amber-400" /> INFOGRAFIK (Bild)
                </Label>
                {form.infografikUrl ? (
                  <div className="space-y-2">
                    <img src={form.infografikUrl} alt="Infografik" className="w-full rounded max-h-32 object-contain bg-zinc-900" />
                    <div className="flex gap-2">
                      <Input value={form.infografikUrl} onChange={(e) => setForm((f) => ({ ...f, infografikUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="CDN-URL" />
                      <Button variant="ghost" size="sm" onClick={() => setForm((f) => ({ ...f, infografikUrl: "" }))} className="text-zinc-400 hover:text-red-400 shrink-0">✕</Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Button variant="outline" size="sm" onClick={() => handleFileUpload("infografikUrl", "image/*")} disabled={uploadingField === "infografikUrl"} className="w-full border-zinc-600 text-zinc-300 hover:text-white">
                      {uploadingField === "infografikUrl" ? <Loader2 className="w-3.5 h-3.5 animate-spin mr-1" /> : <Upload className="w-3.5 h-3.5 mr-1" />}
                      Bild hochladen
                    </Button>
                    <Input value={form.infografikUrl} onChange={(e) => setForm((f) => ({ ...f, infografikUrl: e.target.value }))} className="bg-zinc-900 border-zinc-600 text-white text-xs font-mono" placeholder="oder URL einfügen" />
                  </div>
                )}
              </div>
            </div>

            {/* Sortierung + Aktiv */}
            <div className="flex items-center gap-6 pt-2">
              <div className="flex items-center gap-2">
                <Label className="text-zinc-300 text-xs">Sortierung:</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: parseInt(e.target.value) || 0 }))}
                  className="bg-zinc-800 border-zinc-700 text-white w-20 text-center"
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={form.aktiv}
                  onCheckedChange={(v) => setForm((f) => ({ ...f, aktiv: v }))}
                />
                <Label className={`text-xs font-bold ${form.aktiv ? "text-emerald-400" : "text-zinc-500"}`}>
                  {form.aktiv ? "AKTIV – für Nutzer sichtbar" : "INAKTIV – nur Entwurf"}
                </Label>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={createMutation.isPending || updateMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
              >
                {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="w-4 h-4 animate-spin mr-2" />}
                {editId !== null ? "Änderungen speichern" : "Training anlegen"}
              </Button>
              <Button variant="ghost" onClick={handleCancel} className="text-zinc-400 hover:text-white">
                Abbrechen
              </Button>
            </div>
          </div>
        )}

        {/* Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterKat("alle")}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${filterKat === "alle" ? "bg-zinc-700 text-white border-zinc-500" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}
          >
            ALLE ({(einheiten || []).length})
          </button>
          {KATEGORIEN.map((k) => {
            const count = (einheiten || []).filter((e) => e.kategorie === k.id).length;
            return (
              <button
                key={k.id}
                onClick={() => setFilterKat(k.id)}
                className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${filterKat === k.id ? k.color + " ring-1 ring-white/20" : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"}`}
              >
                {k.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Liste */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
          </div>
        ) : filteredEinheiten.length === 0 ? (
          <div className="text-center py-12 text-zinc-500">
            <p className="text-lg mb-2">Noch keine Trainingseinheiten</p>
            <p className="text-sm">Klicke auf „Neue Einheit" um das erste Training anzulegen.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredEinheiten.map((e) => {
              const kat = katInfo(e.kategorie);
              return (
                <div key={e.id} className={`bg-zinc-900 border rounded-xl p-4 transition-all ${e.aktiv ? "border-zinc-700" : "border-zinc-800 opacity-70"}`}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded border ${kat.color}`}>{kat.label}</span>
                        {e.aktiv ? (
                          <span className="text-xs text-emerald-400 font-bold flex items-center gap-1"><Eye className="w-3 h-3" /> AKTIV</span>
                        ) : (
                          <span className="text-xs text-zinc-500 flex items-center gap-1"><EyeOff className="w-3 h-3" /> Entwurf</span>
                        )}
                        <span className="text-xs text-zinc-500">Dauer: {e.dauern} min</span>
                        <span
                          className="text-xs font-mono bg-zinc-800 border border-zinc-600 text-orange-400 px-2 py-0.5 rounded cursor-pointer hover:bg-zinc-700 select-all"
                          title="Vollständigen Link für E-Mail kopieren"
                          onClick={() => {
                            const fullUrl = `https://www.kiich.de/raum36?tab=methode&training=${e.id}`;
                            navigator.clipboard.writeText(fullUrl).then(() => {
                              toast({ title: "✓ Link kopiert", description: fullUrl });
                            });
                          }}
                        >
                          #{e.id} — /raum36?tab=methode&training={e.id}
                        </span>
                      </div>
                      <h3 className="text-white font-bold text-sm">{e.titel}</h3>
                      <p className="text-zinc-400 text-xs mt-0.5 line-clamp-2">{e.kurzbeschreibung}</p>
                      <div className="flex gap-3 mt-2 text-zinc-600 text-xs">
                        {e.audioUrl && <span className="flex items-center gap-1 text-blue-400/70"><Music2 className="w-3 h-3" /> Audio</span>}
                        {e.videoUrl && <span className="flex items-center gap-1 text-red-400/70"><Video className="w-3 h-3" /> Video</span>}
                        {e.infografikUrl && <span className="flex items-center gap-1 text-amber-400/70"><Image className="w-3 h-3" /> Infografik</span>}
                        {e.audioBeschreibungUrl && <span className="flex items-center gap-1 text-purple-400/70"><Headphones className="w-3 h-3" /> Audiobeschr.</span>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Switch
                        checked={e.aktiv}
                        onCheckedChange={(v) => toggleMutation.mutate({ id: e.id, aktiv: v })}
                      />
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(e)} className="text-zinc-400 hover:text-white">
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost" size="sm"
                        onClick={() => { if (confirm(`„${e.titel}" wirklich löschen?`)) deleteMutation.mutate({ id: e.id }); }}
                        className="text-zinc-400 hover:text-red-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
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
