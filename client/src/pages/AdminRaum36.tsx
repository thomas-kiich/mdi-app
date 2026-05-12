/**
 * Admin-Seite: RAUM 36 Verwaltung
 * - Wissenspool: Einträge anlegen, bearbeiten, löschen, Audio-Upload
 * - Wochenvideos (Posts): anlegen, bearbeiten, löschen
 * - Fragen: anzeigen, beantworten, löschen
 */
import { useState, useRef } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Plus,
  Pencil,
  Trash2,
  Upload,
  Play,
  Pause,
  CheckCircle,
  MessageSquare,
  Video,
  BookOpen,
  Loader2,
  X,
} from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";

// ─── Typen ───────────────────────────────────────────────────────────────────

type WissenTyp = "podcast" | "artikel" | "fakt" | "video" | "tool" | "audio" | "sonstiges";

interface WissenForm {
  titel: string;
  beschreibung: string;
  typ: WissenTyp;
  url: string;
  audioUrl: string;
  published: boolean;
}

interface PostForm {
  titel: string;
  beschreibung: string;
  videoUrl: string;
  thumbnailUrl: string;
  published: boolean;
}

const WISSEN_TYP_LABELS: Record<WissenTyp, string> = {
  podcast: "Podcast",
  artikel: "Artikel",
  fakt: "Fakt",
  video: "Video",
  tool: "Tool",
  audio: "Audio",
  sonstiges: "Sonstiges",
};

const WISSEN_TYP_COLORS: Record<WissenTyp, string> = {
  podcast: "bg-purple-500/20 text-purple-300",
  artikel: "bg-blue-500/20 text-blue-300",
  fakt: "bg-yellow-500/20 text-yellow-300",
  video: "bg-red-500/20 text-red-300",
  tool: "bg-green-500/20 text-green-300",
  audio: "bg-orange-500/20 text-orange-300",
  sonstiges: "bg-zinc-500/20 text-zinc-300",
};

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export default function AdminRaum36() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"wissenspool" | "videos" | "fragen">("wissenspool");

  if (!user || (user as any).role !== "admin") {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <p className="text-zinc-400">Kein Zugriff.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      {/* Header */}
      <div className="border-b border-zinc-800 px-6 py-4 flex items-center gap-4">
        <Link href="/admin">
          <button className="text-zinc-400 hover:text-white text-sm">← Admin</button>
        </Link>
        <h1 className="text-lg font-bold tracking-wide">RAUM 36 Verwaltung</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-zinc-800 px-6">
        {(["wissenspool", "videos", "fragen"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-orange-500 text-orange-400"
                : "border-transparent text-zinc-400 hover:text-white"
            }`}
          >
            {tab === "wissenspool" ? "Wissenspool" : tab === "videos" ? "Wochenvideos" : "Fragen"}
          </button>
        ))}
      </div>

      <div className="p-6 max-w-5xl mx-auto">
        {activeTab === "wissenspool" && <WissenspoolTab />}
        {activeTab === "videos" && <VideosTab />}
        {activeTab === "fragen" && <FragenTab />}
      </div>
    </div>
  );
}

// ─── Wissenspool Tab ──────────────────────────────────────────────────────────

function WissenspoolTab() {
  const utils = trpc.useUtils();
  const { data: items, isLoading } = trpc.raum36.adminGetWissenspool.useQuery();
  const createMut = trpc.raum36.adminCreateWissenspool.useMutation({
    onSuccess: () => { utils.raum36.adminGetWissenspool.invalidate(); toast.success("Eintrag erstellt"); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.raum36.adminUpdateWissenspool.useMutation({
    onSuccess: () => { utils.raum36.adminGetWissenspool.invalidate(); toast.success("Gespeichert"); setEditItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.raum36.adminDeleteWissenspool.useMutation({
    onSuccess: () => { utils.raum36.adminGetWissenspool.invalidate(); toast.success("Gelöscht"); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);

  const emptyForm: WissenForm = { titel: "", beschreibung: "", typ: "audio", url: "", audioUrl: "", published: true };
  const [form, setForm] = useState<WissenForm>(emptyForm);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ titel: item.titel, beschreibung: item.beschreibung ?? "", typ: item.typ, url: item.url ?? "", audioUrl: item.audioUrl ?? "", published: item.published });
  };

  const handleSave = () => {
    if (editItem) {
      updateMut.mutate({ id: editItem.id, ...form });
    } else {
      createMut.mutate(form);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Wissenspool</h2>
        <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Neuer Eintrag
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
      ) : items?.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Noch keine Einträge. Erstelle den ersten Wissenspool-Eintrag.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items?.map((item) => (
            <div key={item.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${WISSEN_TYP_COLORS[item.typ as WissenTyp]}`}>
                    {WISSEN_TYP_LABELS[item.typ as WissenTyp]}
                  </span>
                  {item.published ? (
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Sichtbar</Badge>
                  ) : (
                    <Badge className="bg-zinc-700 text-zinc-400 border-0 text-xs">Entwurf</Badge>
                  )}
                </div>
                <p className="font-medium text-white">{item.titel}</p>
                {item.beschreibung && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{item.beschreibung}</p>}
                {item.audioUrl && (
                  <div className="mt-2">
                    <audio controls src={item.audioUrl} className="h-8 w-full max-w-sm" />
                  </div>
                )}
                {item.url && <a href={item.url} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline mt-1 block truncate">{item.url}</a>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(item)} className="text-zinc-400 hover:text-white">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: item.id })} className="text-zinc-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formular-Dialog */}
      <Dialog open={showForm || !!editItem} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditItem(null); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Eintrag bearbeiten" : "Neuer Wissenspool-Eintrag"}</DialogTitle>
          </DialogHeader>
          <WissenForm form={form} setForm={setForm} />
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditItem(null); }}>Abbrechen</Button>
            <Button
              onClick={handleSave}
              disabled={!form.titel || createMut.isPending || updateMut.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Wissenspool Formular ─────────────────────────────────────────────────────

function WissenForm({ form, setForm }: { form: WissenForm; setForm: (f: WissenForm) => void }) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAudioUpload = async (file: File) => {
    setUploading(true);
    setUploadProgress(0);
    try {
      const formData = new FormData();
      formData.append("audio", file);

      const xhr = new XMLHttpRequest();
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadProgress(Math.round((e.loaded / e.total) * 100));
      };

      const result = await new Promise<{ audioUrl: string }>((resolve, reject) => {
        xhr.onload = () => {
          if (xhr.status === 200) resolve(JSON.parse(xhr.responseText));
          else reject(new Error(JSON.parse(xhr.responseText).error || "Upload fehlgeschlagen"));
        };
        xhr.onerror = () => reject(new Error("Netzwerkfehler"));
        xhr.open("POST", "/api/raum36/upload-audio");
        xhr.withCredentials = true;
        xhr.send(formData);
      });

      setForm({ ...form, audioUrl: result.audioUrl, typ: "audio" });
      toast.success("Audio hochgeladen!");
    } catch (err: any) {
      toast.error(err.message || "Upload fehlgeschlagen");
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <Label className="text-zinc-300 mb-1 block">Titel *</Label>
        <Input
          value={form.titel}
          onChange={(e) => setForm({ ...form, titel: e.target.value })}
          placeholder="z.B. Warum KI nicht denkt"
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div>
        <Label className="text-zinc-300 mb-1 block">Beschreibung</Label>
        <Textarea
          value={form.beschreibung}
          onChange={(e) => setForm({ ...form, beschreibung: e.target.value })}
          placeholder="Kurze Beschreibung des Inhalts..."
          rows={3}
          className="bg-zinc-800 border-zinc-700 text-white resize-none"
        />
      </div>

      <div>
        <Label className="text-zinc-300 mb-1 block">Typ</Label>
        <Select value={form.typ} onValueChange={(v) => setForm({ ...form, typ: v as WissenTyp })}>
          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            {Object.entries(WISSEN_TYP_LABELS).map(([val, label]) => (
              <SelectItem key={val} value={val} className="text-white hover:bg-zinc-700">{label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Audio-Upload */}
      <div className="border border-dashed border-zinc-700 rounded-lg p-4">
        <Label className="text-zinc-300 mb-2 block">Audio-Datei hochladen (MP3, WAV, max. 100 MB)</Label>
        {form.audioUrl ? (
          <div className="space-y-2">
            <audio controls src={form.audioUrl} className="w-full h-10" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-green-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> Audio hochgeladen</span>
              <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, audioUrl: "" })} className="text-zinc-400 hover:text-red-400 h-6 px-2">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ) : (
          <div>
            <input
              ref={fileRef}
              type="file"
              accept="audio/*"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleAudioUpload(e.target.files[0])}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="border-zinc-600 text-zinc-300 hover:bg-zinc-800 gap-2"
            >
              {uploading ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Lade hoch… {uploadProgress}%</>
              ) : (
                <><Upload className="w-4 h-4" /> Audio auswählen</>
              )}
            </Button>
            {uploading && (
              <div className="mt-2 h-1.5 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-orange-500 transition-all" style={{ width: `${uploadProgress}%` }} />
              </div>
            )}
          </div>
        )}
      </div>

      <div>
        <Label className="text-zinc-300 mb-1 block">Externe URL (optional)</Label>
        <Input
          value={form.url}
          onChange={(e) => setForm({ ...form, url: e.target.value })}
          placeholder="https://..."
          className="bg-zinc-800 border-zinc-700 text-white"
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          checked={form.published}
          onCheckedChange={(v) => setForm({ ...form, published: v })}
          id="published"
        />
        <Label htmlFor="published" className="text-zinc-300 cursor-pointer">
          {form.published ? "Sichtbar für Mitglieder" : "Entwurf (nicht sichtbar)"}
        </Label>
      </div>
    </div>
  );
}

// ─── Videos Tab ───────────────────────────────────────────────────────────────

function VideosTab() {
  const utils = trpc.useUtils();
  const { data: posts, isLoading } = trpc.raum36.adminGetPosts.useQuery();
  const createMut = trpc.raum36.adminCreatePost.useMutation({
    onSuccess: () => { utils.raum36.adminGetPosts.invalidate(); toast.success("Post erstellt"); setShowForm(false); },
    onError: (e) => toast.error(e.message),
  });
  const updateMut = trpc.raum36.adminUpdatePost.useMutation({
    onSuccess: () => { utils.raum36.adminGetPosts.invalidate(); toast.success("Gespeichert"); setEditItem(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.raum36.adminDeletePost.useMutation({
    onSuccess: () => { utils.raum36.adminGetPosts.invalidate(); toast.success("Gelöscht"); },
    onError: (e) => toast.error(e.message),
  });

  const [showForm, setShowForm] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const emptyForm: PostForm = { titel: "", beschreibung: "", videoUrl: "", thumbnailUrl: "", published: true };
  const [form, setForm] = useState<PostForm>(emptyForm);

  const openCreate = () => { setForm(emptyForm); setShowForm(true); };
  const openEdit = (item: any) => {
    setEditItem(item);
    setForm({ titel: item.titel, beschreibung: item.beschreibung ?? "", videoUrl: item.videoUrl ?? "", thumbnailUrl: item.thumbnailUrl ?? "", published: item.published });
  };

  const handleSave = () => {
    if (editItem) updateMut.mutate({ id: editItem.id, ...form });
    else createMut.mutate(form);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Wochenvideos</h2>
        <Button onClick={openCreate} className="bg-orange-600 hover:bg-orange-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Neues Video
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
      ) : posts?.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <Video className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Noch keine Videos. Erstelle das erste Wochenvideo.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts?.map((post) => (
            <div key={post.id} className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 flex items-start gap-4">
              {post.thumbnailUrl ? (
                <img src={post.thumbnailUrl} alt="" className="w-20 h-14 object-cover rounded shrink-0" />
              ) : (
                <div className="w-20 h-14 bg-zinc-800 rounded flex items-center justify-center shrink-0">
                  <Video className="w-6 h-6 text-zinc-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {post.published ? (
                    <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Sichtbar</Badge>
                  ) : (
                    <Badge className="bg-zinc-700 text-zinc-400 border-0 text-xs">Entwurf</Badge>
                  )}
                </div>
                <p className="font-medium text-white">{post.titel}</p>
                {post.beschreibung && <p className="text-sm text-zinc-400 mt-0.5 line-clamp-2">{post.beschreibung}</p>}
                {post.videoUrl && <a href={post.videoUrl} target="_blank" rel="noreferrer" className="text-xs text-orange-400 hover:underline mt-1 block truncate">{post.videoUrl}</a>}
              </div>
              <div className="flex gap-2 shrink-0">
                <Button size="sm" variant="ghost" onClick={() => openEdit(post)} className="text-zinc-400 hover:text-white">
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: post.id })} className="text-zinc-400 hover:text-red-400">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={showForm || !!editItem} onOpenChange={(o) => { if (!o) { setShowForm(false); setEditItem(null); } }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>{editItem ? "Video bearbeiten" : "Neues Wochenvideo"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="text-zinc-300 mb-1 block">Titel *</Label>
              <Input value={form.titel} onChange={(e) => setForm({ ...form, titel: e.target.value })} placeholder="Titel des Videos" className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 mb-1 block">Beschreibung</Label>
              <Textarea value={form.beschreibung} onChange={(e) => setForm({ ...form, beschreibung: e.target.value })} rows={3} className="bg-zinc-800 border-zinc-700 text-white resize-none" />
            </div>
            <div>
              <Label className="text-zinc-300 mb-1 block">Video-URL (YouTube, Vimeo, …)</Label>
              <Input value={form.videoUrl} onChange={(e) => setForm({ ...form, videoUrl: e.target.value })} placeholder="https://youtube.com/watch?v=..." className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div>
              <Label className="text-zinc-300 mb-1 block">Thumbnail-URL (optional)</Label>
              <Input value={form.thumbnailUrl} onChange={(e) => setForm({ ...form, thumbnailUrl: e.target.value })} placeholder="https://..." className="bg-zinc-800 border-zinc-700 text-white" />
            </div>
            <div className="flex items-center gap-3">
              <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} id="post-published" />
              <Label htmlFor="post-published" className="text-zinc-300 cursor-pointer">
                {form.published ? "Sichtbar für Mitglieder" : "Entwurf"}
              </Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowForm(false); setEditItem(null); }}>Abbrechen</Button>
            <Button onClick={handleSave} disabled={!form.titel || createMut.isPending || updateMut.isPending} className="bg-orange-600 hover:bg-orange-700 text-white">
              {(createMut.isPending || updateMut.isPending) ? <Loader2 className="w-4 h-4 animate-spin" /> : "Speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ─── Fragen Tab ───────────────────────────────────────────────────────────────

function FragenTab() {
  const utils = trpc.useUtils();
  const { data: fragen, isLoading } = trpc.raum36.adminGetFragen.useQuery();
  const antwortenMut = trpc.raum36.adminAntworte.useMutation({
    onSuccess: () => { utils.raum36.adminGetFragen.invalidate(); toast.success("Antwort gespeichert"); setAnswering(null); },
    onError: (e) => toast.error(e.message),
  });
  const deleteMut = trpc.raum36.adminDeleteFrage.useMutation({
    onSuccess: () => { utils.raum36.adminGetFragen.invalidate(); toast.success("Frage gelöscht"); },
    onError: (e) => toast.error(e.message),
  });

  const [answering, setAnswering] = useState<any | null>(null);
  const [antwortText, setAntwortText] = useState("");

  const openAnswer = (frage: any) => {
    setAnswering(frage);
    setAntwortText(frage.antwort ?? "");
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold">Fragen der Mitglieder</h2>
        <span className="text-sm text-zinc-400">{fragen?.length ?? 0} Fragen total</span>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>
      ) : fragen?.length === 0 ? (
        <div className="text-center py-12 text-zinc-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>Noch keine Fragen gestellt.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {fragen?.map((frage) => (
            <div key={frage.id} className={`bg-zinc-900 border rounded-lg p-4 ${frage.antwort ? "border-green-800/50" : "border-zinc-800"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-sm font-medium text-orange-400">{frage.pseudonym || "Anonym"}</span>
                    <span className="text-xs text-zinc-500">{new Date(frage.createdAt).toLocaleDateString("de-AT")}</span>
                    {frage.antwort ? (
                      <Badge className="bg-green-500/20 text-green-400 border-0 text-xs">Beantwortet</Badge>
                    ) : (
                      <Badge className="bg-yellow-500/20 text-yellow-400 border-0 text-xs">Offen</Badge>
                    )}
                  </div>
                  <p className="text-white font-medium">{frage.frage}</p>
                  {frage.antwort && (
                    <div className="mt-3 pl-3 border-l-2 border-orange-500/50">
                      <p className="text-sm text-zinc-300 italic">{frage.antwort}</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Button size="sm" variant="ghost" onClick={() => openAnswer(frage)} className="text-zinc-400 hover:text-white text-xs gap-1">
                    <Pencil className="w-3 h-3" /> {frage.antwort ? "Bearbeiten" : "Antworten"}
                  </Button>
                  <Button size="sm" variant="ghost" onClick={() => deleteMut.mutate({ id: frage.id })} className="text-zinc-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!answering} onOpenChange={(o) => { if (!o) setAnswering(null); }}>
        <DialogContent className="bg-zinc-900 border-zinc-700 text-white max-w-lg">
          <DialogHeader>
            <DialogTitle>Antwort auf Frage</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="bg-zinc-800 rounded p-3">
              <p className="text-sm text-zinc-300 font-medium">{answering?.pseudonym}:</p>
              <p className="text-white mt-1">{answering?.frage}</p>
            </div>
            <div>
              <Label className="text-zinc-300 mb-1 block">Deine Antwort</Label>
              <Textarea
                value={antwortText}
                onChange={(e) => setAntwortText(e.target.value)}
                rows={5}
                placeholder="Schreibe deine Antwort..."
                className="bg-zinc-800 border-zinc-700 text-white resize-none"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAnswering(null)}>Abbrechen</Button>
            <Button
              onClick={() => antwortenMut.mutate({ frageId: answering.id, antwort: antwortText })}
              disabled={!antwortText.trim() || antwortenMut.isPending}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              {antwortenMut.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Antwort speichern"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
