/**
 * TrainingEinheitenView – Zeigt vom Admin angelegte Trainingseinheiten
 * gruppiert nach Kategorie als Kacheln an.
 * Beim Anklicken einer Kachel öffnet sich das Detailfenster mit Dauer-Auswahl,
 * Beschreibung, Audio, Video, Infografik und Audiobeschreibung.
 */
import { useState, useEffect } from "react";
import { RichTextDisplay } from "@/components/RichTextEditor";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft, Play, Pause, Music2, Video, Image, Headphones, Clock } from "lucide-react";

const KATEGORIEN = [
  { id: "befindlichkeit", label: "BEFINDLICHKEITSTRAINING", color: "text-rose-300", border: "border-rose-500/30", bg: "bg-rose-500/10", dot: "bg-rose-400" },
  { id: "atemtraining", label: "ATEMTRAINING", color: "text-blue-300", border: "border-blue-500/30", bg: "bg-blue-500/10", dot: "bg-blue-400" },
  { id: "stimmklangtraining", label: "STIMMKLANGTRAINING", color: "text-purple-300", border: "border-purple-500/30", bg: "bg-purple-500/10", dot: "bg-purple-400" },
  { id: "bewegungstraining", label: "BEWEGUNGSTRAINING", color: "text-green-300", border: "border-green-500/30", bg: "bg-green-500/10", dot: "bg-green-400" },
  { id: "umfeldaktivierung", label: "UMFELDAKTIVIERUNG", color: "text-amber-300", border: "border-amber-500/30", bg: "bg-amber-500/10", dot: "bg-amber-400" },
] as const;

type Einheit = {
  id: number;
  kategorie: string;
  titel: string;
  kurzbeschreibung: string;
  beschreibung: string | null;
  dauern: string;
  audioUrl: string | null;
  videoUrl: string | null;
  infografikUrl: string | null;
  audioBeschreibungUrl: string | null;
  sortOrder: number;
  aktiv: boolean;
};

function getYoutubeEmbedUrl(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/);
  if (match) return `https://www.youtube.com/embed/${match[1]}`;
  return null;
}

function DetailView({ einheit, onBack }: { einheit: Einheit; onBack: () => void }) {
  const dauernList = einheit.dauern.split(",").map((d) => parseInt(d.trim())).filter(Boolean);
  const [selectedDauer, setSelectedDauer] = useState(dauernList[0] || 7);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioBeschrPlaying, setAudioBeschrPlaying] = useState(false);

  const kat = KATEGORIEN.find((k) => k.id === einheit.kategorie) || KATEGORIEN[0];
  const youtubeEmbed = einheit.videoUrl ? getYoutubeEmbedUrl(einheit.videoUrl) : null;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="text-zinc-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <span className={`text-xs font-bold ${kat.color}`}>{kat.label}</span>
          <h2 className="text-white font-bold text-lg leading-tight">{einheit.titel}</h2>
        </div>
      </div>

      {/* Dauer-Auswahl */}
      <div>
        <p className="text-zinc-400 text-xs mb-2 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> DAUER WÄHLEN
        </p>
        <div className="flex gap-2 flex-wrap">
          {dauernList.map((d) => (
            <button
              key={d}
              onClick={() => setSelectedDauer(d)}
              className={`px-4 py-2 rounded-lg text-sm font-bold border transition-all ${
                selectedDauer === d
                  ? `${kat.bg} ${kat.border} ${kat.color} ring-1 ring-white/20`
                  : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-500"
              }`}
            >
              {d} min
            </button>
          ))}
        </div>
      </div>

      {/* Beschreibung */}
      {einheit.beschreibung && (
        <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
          <RichTextDisplay html={einheit.beschreibung} className="text-sm" />
        </div>
      )}

      {/* Audio */}
      {einheit.audioUrl && (
        <div className={`rounded-xl p-4 border ${kat.border} ${kat.bg}`}>
          <p className={`text-xs font-bold mb-3 flex items-center gap-1.5 ${kat.color}`}>
            <Music2 className="w-3.5 h-3.5" /> AUDIO – {selectedDauer} min Training
          </p>
          <audio
            controls
            className="w-full"
            onPlay={() => setAudioPlaying(true)}
            onPause={() => setAudioPlaying(false)}
            onEnded={() => setAudioPlaying(false)}
          >
            <source src={`/api/audio-proxy?url=${encodeURIComponent(einheit.audioUrl)}`} type="audio/mpeg" />
            Dein Browser unterstützt kein Audio.
          </audio>
        </div>
      )}

      {/* Video */}
      {einheit.videoUrl && (
        <div className="rounded-xl overflow-hidden border border-zinc-700">
          <p className="text-xs font-bold text-red-300 flex items-center gap-1.5 px-4 pt-3 pb-2">
            <Video className="w-3.5 h-3.5" /> VIDEO
          </p>
          {youtubeEmbed ? (
            <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
              <iframe
                src={youtubeEmbed}
                className="absolute inset-0 w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <video controls className="w-full">
              <source src={einheit.videoUrl} />
            </video>
          )}
        </div>
      )}

      {/* Infografik */}
      {einheit.infografikUrl && (
        <div className="rounded-xl border border-amber-500/30 overflow-hidden">
          <p className="text-xs font-bold text-amber-300 flex items-center gap-1.5 px-4 pt-3 pb-2">
            <Image className="w-3.5 h-3.5" /> INFOGRAFIK
          </p>
          <img src={einheit.infografikUrl} alt="Infografik" className="w-full object-contain bg-zinc-900 max-h-96" />
        </div>
      )}

      {/* Audiobeschreibung */}
      {einheit.audioBeschreibungUrl && (
        <div className="rounded-xl p-4 border border-purple-500/30 bg-purple-500/10">
          <p className="text-xs font-bold text-purple-300 mb-3 flex items-center gap-1.5">
            <Headphones className="w-3.5 h-3.5" /> AUDIOBESCHREIBUNG / PODCAST
          </p>
          <audio
            controls
            className="w-full"
            onPlay={() => setAudioBeschrPlaying(true)}
            onPause={() => setAudioBeschrPlaying(false)}
            onEnded={() => setAudioBeschrPlaying(false)}
          >
            <source src={`/api/audio-proxy?url=${encodeURIComponent(einheit.audioBeschreibungUrl)}`} type="audio/mpeg" />
            Dein Browser unterstützt kein Audio.
          </audio>
        </div>
      )}
    </div>
  );
}

interface TrainingEinheitenViewProps {
  initialKategorie?: string;
  initialTrainingId?: number;
  /** Externer Filter – wird gesetzt wenn eine leere Kategorie im alten System angeklickt wird */
  externalFilterKat?: string;
}

export function TrainingEinheitenView({ initialKategorie, initialTrainingId, externalFilterKat }: TrainingEinheitenViewProps = {}) {
  const { data: einheiten, isLoading } = trpc.trainingEinheiten.getAll.useQuery();
  const [selectedEinheit, setSelectedEinheit] = useState<Einheit | null>(null);
  const [filterKat, setFilterKat] = useState<string>(initialKategorie || "alle");
  const [deepLinkHandled, setDeepLinkHandled] = useState(false);

  // Externer Filter: wenn eine leere Kategorie im alten System angeklickt wird
  useEffect(() => {
    if (externalFilterKat) {
      setFilterKat(externalFilterKat);
    }
  }, [externalFilterKat]);

  // Deeplink: Training direkt aufklappen wenn initialTrainingId gesetzt
  // Bei Änderung der initialTrainingId (z.B. interner Link-Klick) deepLinkHandled zurücksetzen
  useEffect(() => {
    setDeepLinkHandled(false);
    if (initialKategorie) setFilterKat(initialKategorie);
  }, [initialTrainingId, initialKategorie]);

  useEffect(() => {
    if (!deepLinkHandled && einheiten && initialTrainingId) {
      const target = einheiten.find((e) => e.id === initialTrainingId);
      if (target) {
        setSelectedEinheit(target);
        setDeepLinkHandled(true);
      }
    }
  }, [einheiten, initialTrainingId, deepLinkHandled]);

  if (isLoading) {
    return (
      <div className="space-y-3 py-2">
        {[1, 2].map((i) => (
          <div key={i} className="bg-zinc-900 border border-zinc-800 rounded-xl p-4 animate-pulse">
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-2">
                <div className="h-3 bg-zinc-800 rounded w-1/4" />
                <div className="h-4 bg-zinc-800 rounded w-2/3" />
                <div className="h-3 bg-zinc-800 rounded w-full" />
              </div>
              <div className="w-8 h-8 bg-zinc-800 rounded-lg shrink-0" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!einheiten || einheiten.length === 0) {
    return (
      <div className="text-center py-12 text-zinc-500">
        <p className="text-sm">Noch keine Trainingseinheiten verfügbar.</p>
        <p className="text-xs mt-1 text-zinc-600">Thomas fügt bald neue Trainings hinzu.</p>
      </div>
    );
  }

  if (selectedEinheit) {
    return <DetailView einheit={selectedEinheit} onBack={() => setSelectedEinheit(null)} />;
  }

  // Welche Kategorien haben Einheiten?
  const vorhandeneKats = KATEGORIEN.filter((k) => einheiten.some((e) => e.kategorie === k.id));
  const filtered = filterKat === "alle" ? einheiten : einheiten.filter((e) => e.kategorie === filterKat);

  return (
    <div className="space-y-5">
      {/* Kategorie-Filter */}
      {vorhandeneKats.length > 1 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterKat("alle")}
            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
              filterKat === "alle"
                ? "bg-zinc-700 text-white border-zinc-500"
                : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
            }`}
          >
            ALLE
          </button>
          {vorhandeneKats.map((k) => (
            <button
              key={k.id}
              onClick={() => setFilterKat(k.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${
                filterKat === k.id
                  ? `${k.bg} ${k.border} ${k.color}`
                  : "bg-zinc-900 text-zinc-400 border-zinc-700 hover:border-zinc-500"
              }`}
            >
              {k.label}
            </button>
          ))}
        </div>
      )}

      {/* Kacheln */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {filtered.map((e) => {
          const kat = KATEGORIEN.find((k) => k.id === e.kategorie) || KATEGORIEN[0];
          const dauernList = e.dauern.split(",").map((d) => parseInt(d.trim())).filter(Boolean);
          return (
            <button
              key={e.id}
              onClick={() => setSelectedEinheit(e)}
              className={`text-left rounded-xl p-4 border transition-all hover:scale-[1.01] active:scale-[0.99] ${kat.border} ${kat.bg} hover:brightness-110`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${kat.dot}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-bold mb-1 ${kat.color}`}>{kat.label}</p>
                  <h3 className="text-white font-bold text-sm leading-tight">{e.titel}</h3>
                  <p className="text-zinc-400 text-xs mt-1 line-clamp-2">{e.kurzbeschreibung}</p>
                  <div className="flex items-center gap-3 mt-2 text-zinc-500 text-xs">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {dauernList.join(" / ")} min
                    </span>
                    {e.audioUrl && <span className="flex items-center gap-1 text-blue-400/60"><Music2 className="w-3 h-3" /></span>}
                    {e.videoUrl && <span className="flex items-center gap-1 text-red-400/60"><Video className="w-3 h-3" /></span>}
                    {e.infografikUrl && <span className="flex items-center gap-1 text-amber-400/60"><Image className="w-3 h-3" /></span>}
                    {e.audioBeschreibungUrl && <span className="flex items-center gap-1 text-purple-400/60"><Headphones className="w-3 h-3" /></span>}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
