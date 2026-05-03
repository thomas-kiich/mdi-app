import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Upload,
  Star,
  StarOff,
  Music,
} from "lucide-react";
import { Link } from "wouter";

type Episode = {
  id: number;
  episodeNumber: string;
  catchphrase: string;
  subtitle: string;
  audioUrl: string;
  coverImageUrl: string;
  description?: string | null;
  isLatest: boolean;
  sortOrder: number;
  youtubeUrl?: string | null;
  spotifyUrl?: string | null;
};

const EMPTY_FORM = {
  episodeNumber: "",
  catchphrase: "",
  subtitle: "",
  audioUrl: "",
  coverImageUrl: "",
  description: "",
  isLatest: false,
  sortOrder: 0,
  youtubeUrl: "",
  spotifyUrl: "",
};

export default function AdminEpisoden() {
  const { user, isAuthenticated, loading } = useAuth();
  const utils = trpc.useUtils();

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [uploading, setUploading] = useState(false);

  const { data: episodes, isLoading } = trpc.podcastEpisodes.list.useQuery(undefined, {
    enabled: isAuthenticated && user?.role === "admin",
  });

  const createMutation = trpc.podcastEpisodes.create.useMutation({
    onSuccess: () => {
      toast.success("Episode angelegt!");
      utils.podcastEpisodes.list.invalidate();
      utils.podcastEpisodes.latest.invalidate();
      resetForm();
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const updateMutation = trpc.podcastEpisodes.update.useMutation({
    onSuccess: () => {
      toast.success("Episode aktualisiert!");
      utils.podcastEpisodes.list.invalidate();
      utils.podcastEpisodes.latest.invalidate();
      resetForm();
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  const deleteMutation = trpc.podcastEpisodes.delete.useMutation({
    onSuccess: () => {
      toast.success("Episode gelöscht.");
      utils.podcastEpisodes.list.invalidate();
      utils.podcastEpisodes.latest.invalidate();
    },
    onError: (e) => toast.error("Fehler: " + e.message),
  });

  // Direkter Multipart-Upload für große MP3-Dateien (bis 200 MB)
  async function uploadAudioFile(file: File) {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("audio", file);
      const res = await fetch("/api/podcast/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: res.statusText }));
        throw new Error(err.error || "Upload fehlgeschlagen");
      }
      const data = await res.json();
      setForm((f) => ({ ...f, audioUrl: data.url }));
      toast.success("Audio hochgeladen!");
    } catch (e: any) {
      toast.error("Upload-Fehler: " + e.message);
    } finally {
      setUploading(false);
    }
  }

  function resetForm() {
    setForm({ ...EMPTY_FORM });
    setEditingId(null);
    setShowForm(false);
  }

  function startEdit(ep: Episode) {
    setForm({
      episodeNumber: ep.episodeNumber,
      catchphrase: ep.catchphrase,
      subtitle: ep.subtitle,
      audioUrl: ep.audioUrl,
      coverImageUrl: ep.coverImageUrl,
      description: ep.description ?? "",
      isLatest: ep.isLatest,
      sortOrder: ep.sortOrder,
      youtubeUrl: ep.youtubeUrl ?? "",
      spotifyUrl: ep.spotifyUrl ?? "",
    });
    setEditingId(ep.id);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function handleAudioUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 200 * 1024 * 1024) {
      toast.error("Datei zu groß (max. 200 MB)");
      return;
    }
    uploadAudioFile(file);
  }

  function handleSubmit() {
    const payload = {
      episodeNumber: form.episodeNumber.trim(),
      catchphrase: form.catchphrase.trim(),
      subtitle: form.subtitle.trim(),
      audioUrl: form.audioUrl.trim(),
      coverImageUrl: form.coverImageUrl.trim(),
      description: form.description?.trim() || undefined,
      isLatest: form.isLatest,
      sortOrder: Number(form.sortOrder),
      youtubeUrl: form.youtubeUrl?.trim() || undefined,
      spotifyUrl: form.spotifyUrl?.trim() || undefined,
    };

    if (!payload.episodeNumber || !payload.catchphrase || !payload.audioUrl) {
      toast.error("Bitte alle Pflichtfelder ausfüllen (Nummer, Catchphrase, Audio-URL).");
      return;
    }

    if (editingId !== null) {
      updateMutation.mutate({ id: editingId, ...payload });
    } else {
      createMutation.mutate(payload);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <p>Kein Zugriff.</p>
      </div>
    );
  }

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="min-h-screen bg-black text-white p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/">
          <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Zurück
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-orange-400">Episoden-Verwaltung</h1>
          <p className="text-zinc-500 text-sm">Podcast-Episoden anlegen, bearbeiten und verwalten</p>
        </div>
        <div className="ml-auto">
          <Button
            onClick={() => { resetForm(); setShowForm(true); }}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Neue Episode
          </Button>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <Card className="bg-zinc-900 border-orange-800/50 mb-8">
          <CardHeader>
            <CardTitle className="text-orange-400">
              {editingId !== null ? `Episode ${form.episodeNumber} bearbeiten` : "Neue Episode anlegen"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">Episodennummer *</Label>
                <Input
                  placeholder="z.B. 05"
                  value={form.episodeNumber}
                  onChange={(e) => setForm((f) => ({ ...f, episodeNumber: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">Sortierung (höher = weiter oben)</Label>
                <Input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm((f) => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">Catchphrase (Titel) *</Label>
              <Input
                placeholder="z.B. DU BIST DER DIRIGENT"
                value={form.catchphrase}
                onChange={(e) => setForm((f) => ({ ...f, catchphrase: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">Untertitel</Label>
              <Input
                placeholder="z.B. Thema _ Beschreibung"
                value={form.subtitle}
                onChange={(e) => setForm((f) => ({ ...f, subtitle: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white"
              />
            </div>

            {/* Audio Upload */}
            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">Audio-Datei (MP3) *</Label>
              <div className="flex gap-2 items-start">
                <div className="flex-1">
                  <Input
                    placeholder="https://... (CDN-URL)"
                    value={form.audioUrl}
                    onChange={(e) => setForm((f) => ({ ...f, audioUrl: e.target.value }))}
                    className="bg-zinc-800 border-zinc-700 text-white font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="cursor-pointer">
                    <input
                      type="file"
                      accept="audio/mpeg,audio/mp3,.mp3"
                      className="hidden"
                      onChange={handleAudioUpload}
                      disabled={uploading}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      className="border-orange-600 text-orange-400 hover:bg-orange-600/10 pointer-events-none"
                      disabled={uploading}
                    >
                      {uploading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <Upload className="w-4 h-4 mr-1" />
                          MP3 hochladen
                        </>
                      )}
                    </Button>
                  </label>
                </div>
              </div>
              {form.audioUrl && (
                <div className="mt-2">
                  <audio
                    key={form.audioUrl}
                    controls
                    preload="metadata"
                    className="w-full rounded"
                    style={{ height: "40px" }}
                  >
                    <source
                      src={`/api/audio-proxy?url=${encodeURIComponent(form.audioUrl)}&v=2`}
                      type="audio/mpeg"
                    />
                  </audio>
                </div>
              )}
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">Cover-Bild URL *</Label>
              <Input
                placeholder="https://... (CDN-URL)"
                value={form.coverImageUrl}
                onChange={(e) => setForm((f) => ({ ...f, coverImageUrl: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white font-mono text-xs"
              />
            </div>

            <div>
              <Label className="text-zinc-300 text-xs mb-1 block">Inhaltsbeschreibung</Label>
              <Textarea
                placeholder="Zusammenfassung der Episode..."
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="bg-zinc-800 border-zinc-700 text-white min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">YouTube-URL (optional)</Label>
                <Input
                  placeholder="https://youtube.com/..."
                  value={form.youtubeUrl}
                  onChange={(e) => setForm((f) => ({ ...f, youtubeUrl: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
              <div>
                <Label className="text-zinc-300 text-xs mb-1 block">Spotify-URL (optional)</Label>
                <Input
                  placeholder="https://open.spotify.com/..."
                  value={form.spotifyUrl}
                  onChange={(e) => setForm((f) => ({ ...f, spotifyUrl: e.target.value }))}
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="isLatest"
                checked={form.isLatest}
                onChange={(e) => setForm((f) => ({ ...f, isLatest: e.target.checked }))}
                className="w-4 h-4 accent-orange-500"
              />
              <Label htmlFor="isLatest" className="text-zinc-300 cursor-pointer">
                Als <strong className="text-orange-400">aktuelle Episode</strong> markieren (erscheint ganz oben)
              </Label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                onClick={handleSubmit}
                disabled={isSaving || uploading}
                className="bg-orange-600 hover:bg-orange-700 text-white"
              >
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingId !== null ? "Speichern" : "Anlegen"}
              </Button>
              <Button variant="ghost" onClick={resetForm} className="text-zinc-400">
                Abbrechen
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Episode List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
          </div>
        ) : !episodes?.length ? (
          <p className="text-zinc-500 text-center py-12">Noch keine Episoden vorhanden.</p>
        ) : (
          episodes.map((ep) => (
            <Card key={ep.id} className="bg-zinc-900 border-zinc-800 hover:border-orange-800/50 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={ep.coverImageUrl}
                    alt={ep.catchphrase}
                    className="w-12 h-12 rounded object-cover shrink-0"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-orange-400 font-bold font-mono text-sm">EP {ep.episodeNumber}</span>
                      {ep.isLatest && (
                        <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/30 text-xs">
                          <Star className="w-3 h-3 mr-1" />
                          Aktuell
                        </Badge>
                      )}
                      <span className="text-zinc-500 text-xs">Sort: {ep.sortOrder}</span>
                    </div>
                    <p className="text-white font-semibold truncate">{ep.catchphrase}</p>
                    <p className="text-zinc-400 text-xs truncate">{ep.subtitle}</p>
                    {ep.audioUrl && (
                      <div className="mt-2">
                        <audio
                          key={ep.audioUrl}
                          controls
                          preload="none"
                          className="w-full rounded"
                          style={{ height: "36px" }}
                        >
                          <source
                            src={`/api/audio-proxy?url=${encodeURIComponent(ep.audioUrl)}&v=2`}
                            type="audio/mpeg"
                          />
                        </audio>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => startEdit(ep as Episode)}
                      className="text-zinc-400 hover:text-white"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => {
                        if (confirm(`Episode ${ep.episodeNumber} wirklich löschen?`)) {
                          deleteMutation.mutate({ id: ep.id });
                        }
                      }}
                      className="text-zinc-400 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
