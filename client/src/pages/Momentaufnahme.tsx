import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { getLoginUrl } from "@/const";
import { cn } from "@/lib/utils";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import {
  Mic,
  MicOff,
  Download,
  Trash2,
  Loader2,
  ChevronDown,
  ChevronUp,
  BookOpen,
  Headphones,
  Sparkles,
  LogIn,
  Play,
  Square,
  ArrowLeft,
  Archive,
  Plug,
  Smartphone,
  CreditCard,
  Plus,
  Check,
  Bell,
  Eye,
  Volume2,
  X,
} from "lucide-react";
import { AppInstallGuide } from "@/components/AppInstallGuide";
import { EinladungsLink } from "@/components/EinladungsLink";
import { WillkommensDialog } from "@/components/WillkommensDialog";
import { TrialBanner } from "@/components/TrialBanner";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Link } from "wouter";

// ─── Gravitationszentren ─────────────────────────────────────────────────────

const KATEGORIE_CONFIG = {
  ICH: { emoji: "👤", farbe: "bg-violet-500/20 text-violet-300 border-violet-500/30" },
  QUELL: { emoji: "⚡", farbe: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30" },
  KONZEPT: { emoji: "🧠", farbe: "bg-blue-500/20 text-blue-300 border-blue-500/30" },
  PROJEKT: { emoji: "🎯", farbe: "bg-green-500/20 text-green-300 border-green-500/30" },
  DIALOG: { emoji: "💬", farbe: "bg-pink-500/20 text-pink-300 border-pink-500/30" },
  WELT: { emoji: "🌍", farbe: "bg-orange-500/20 text-orange-300 border-orange-500/30" },
} as const;

// ─── Wissenschafts-Einschub: Schlaf & Traum ─────────────────────────────────────────────

const SCHLAF_FAKTEN = [
  {
    icon: "🧠",
    titel: "Das glymphatische System – Gehärnreinigung im Schlaf",
    text: "Während des Tiefschlafs aktiviert das Gehirn sein eigenes Reinigungssystem: Das glymphatische System spült Abfallprodukte (u. a. Beta-Amyloid, Tau-Proteine) aus dem Hirngewebe. Dieser Prozess läuft tagseitig kaum ab – Schlaf ist buchstäblich die Gehärnwäsche. Chronischer Schlafmangel erhöht das Risiko für neurodegenerative Erkrankungen wie Alzheimer.",
    quelle: "Nedergaard et al., Science 2013; Alzheimer Deutschland 2024",
  },
  {
    icon: "💤",
    titel: "Hippocampus & Gedächtniskonsolidierung",
    text: "Der Hippocampus speichert tagseitig erlebte Inhalte als Kurzzeit-Gedächtnis. Im Schlaf – besonders im Tiefschlaf (SWS) – werden diese Inhalte in den Neokortex übertragen und als Langzeit-Gedächtnis verankert. Was du abends bewusst formulierst, wird nachts konsolidiert. Was du nicht formulierst, geht verloren.",
    quelle: "Spektrum der Wissenschaft; Uni Lübeck Schlafforschung",
  },
  {
    icon: "🌙",
    titel: "REM-Schlaf & kreative Lösungsfindung",
    text: "Im REM-Schlaf (Traumphase) verknüpft das Gehirn scheinbar unzusammenhängende Informationen zu neuen Mustern. Studien zeigen: Probanden, die ein Problem vor dem Schlafen formulierten, lösten es nach dem Aufwachen signifikant häufiger – ohne bewusst daran gearbeitet zu haben. Der Traum ist ein Kreativlabor.",
    quelle: "Cai et al., Nature 2009; Trends in Cognitive Sciences 2018",
  },
  {
    icon: "✨",
    titel: "MA als Einschlaf-Begleitung – die Wissenschaft dahinter",
    text: "Wenn du dein Tages-Summary am Abend vorliest oder hörst, gibst du deinem Hippocampus ein strukturiertes Konsolidierungsprogramm. Die Inhalte sind bereits kategorisiert, emotional bewertet und auf Essenz reduziert. Das Gehirn arbeitet in der Nacht genau mit diesem Material weiter – reinigt, verknüpft, löst. Du schenkst dir selbst die beste Vorbereitung für eine produktive Nacht.",
    quelle: "KIICH-Konzept: MA als Brücke zwischen Tagesbewusstsein und Traumarbeit",
  },
];

function WissenschaftsEinschub() {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="w-full max-w-sm mx-auto mb-8">
      <button
        onClick={() => setIsOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-gradient-to-r from-indigo-900/30 to-violet-900/20 border border-indigo-500/20 hover:border-indigo-500/40 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-base">🔬</span>
          <span className="text-xs font-semibold text-indigo-300 tracking-wide uppercase">Warum Schlaf alles verändert</span>
        </div>
        <span className="text-indigo-400/60 text-xs">{isOpen ? "▲" : "▼"}</span>
      </button>
      {isOpen && (
        <div className="mt-2 space-y-3 px-1">
          {SCHLAF_FAKTEN.map((fakt, i) => (
            <div key={i} className="p-4 rounded-xl bg-white/3 border border-white/8">
              <div className="flex items-start gap-2 mb-2">
                <span className="text-lg">{fakt.icon}</span>
                <p className="text-xs font-semibold text-white/80 leading-snug">{fakt.titel}</p>
              </div>
              <p className="text-xs text-white/50 leading-relaxed mb-2">{fakt.text}</p>
              <p className="text-[10px] text-indigo-400/50 italic">📚 {fakt.quelle}</p>
            </div>
          ))}
          <p className="text-[10px] text-white/20 text-center px-2 pb-2">
            Quellen: Nedergaard et al. (Science 2013), Alzheimer Deutschland (2024), Spektrum der Wissenschaft, Uni Lübeck, Cai et al. (Nature 2009), Trends in Cognitive Sciences (2018)
          </p>
        </div>
      )}
    </div>
  );
}

// ─── TTS Hook ─────────────────────────────────────────────────────────────────

function useTTS() {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceURI, setSelectedVoiceURI] = useState<string>("");
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Stimmen laden (asynchron – Browser lädt sie verzögert)
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const load = () => {
      const all = window.speechSynthesis.getVoices();
      const de = all.filter(v => v.lang.startsWith("de"));
      const list = de.length > 0 ? de : all.slice(0, 10);
      setVoices(list);
      if (!selectedVoiceURI && list.length > 0) {
        // Bevorzuge lokale deutsche Stimme
        const preferred = list.find(v => v.localService) ?? list[0];
        setSelectedVoiceURI(preferred.voiceURI);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.onvoiceschanged = null; };
  }, [selectedVoiceURI]);

  const speak = useCallback((text: string, onEnd?: () => void) => {
    if (!("speechSynthesis" in window)) {
      toast.error("Text-to-Speech wird von diesem Browser nicht unterstützt.");
      return;
    }
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.85;
    utterance.pitch = 1.0;

    const all = window.speechSynthesis.getVoices();
    const chosen = all.find(v => v.voiceURI === selectedVoiceURI)
      ?? all.find(v => v.lang.startsWith("de") && v.localService)
      ?? all.find(v => v.lang.startsWith("de"));
    if (chosen) utterance.voice = chosen;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => { setIsSpeaking(false); onEnd?.(); };
    utterance.onerror = () => { setIsSpeaking(false); onEnd?.(); };

    utteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  }, [selectedVoiceURI]);

  const stop = useCallback(() => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  }, []);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  return { speak, stop, isSpeaking, voices, selectedVoiceURI, setSelectedVoiceURI };
}

// VAPID Base64 → Uint8Array Konverter (für Push-Subscription)
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

// ─── Hauptkomponente ──────────────────────────────────────────────────────────────

export default function Momentaufnahme() {
  const { loading, isAuthenticated } = useAuth();
  const { speak, stop, isSpeaking, voices, selectedVoiceURI, setSelectedVoiceURI } = useTTS();

  // Aufnahme-Konstanten
  const MIN_DAUER_SEK = 2;
  const MAX_DAUER_SEK = 180; // 3 Minuten

  // Aufnahme-State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMaxReached, setIsMaxReached] = useState(false); // 3-Min-Signal
  const [showSummary, setShowSummary] = useState(false);
  const [summaryText, setSummaryText] = useState("");
  const [summaryDatum, setSummaryDatum] = useState("");
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  // Strategisches Summary
  const [summaryModus, setSummaryModus] = useState<"reflexion" | "strategie" | "erledigungen" | "erinnerungen" | "visionen">("reflexion");
  const [strategischesText, setStrategischesText] = useState("");
  const [strategischesDatum, setStrategischesDatum] = useState("");
  const [isStrategischLaden, setIsStrategischLaden] = useState(false);
  // Gravitationszentrum-Filter im Strategie-Modus (alle aktiv = kein Filter)
  const ALLE_GZ = ["ICH", "QUELL", "KONZEPT", "PROJEKT", "DIALOG", "WELT"] as const;
  const [aktiveGZ, setAktiveGZ] = useState<Set<string>>(new Set(ALLE_GZ));
  const toggleGZ = (gz: string) => {
    setAktiveGZ(prev => {
      const next = new Set(prev);
      if (next.has(gz)) {
        // Mindestens 1 muss aktiv bleiben
        if (next.size > 1) next.delete(gz);
      } else {
        next.add(gz);
      }
      return next;
    });
  };
  // Gefilterter Strategie-Text (nur aktive GZ) – wird auch für TTS genutzt
  const gefilterterStrategieText = useMemo(() => {
    if (!strategischesText) return "";
    const zeilen = strategischesText.split("\n");
    const gefiltert: string[] = [];
    let abschnittAktiv = true;
    for (const zeile of zeilen) {
      const gzMatch = ALLE_GZ.find(gz =>
        new RegExp(`\\b${gz}\\b`, "i").test(zeile) &&
        (zeile.startsWith("#") || zeile.includes("**") || zeile.endsWith(":") || /^[A-Z]{3,7}/.test(zeile.trim()))
      );
      if (gzMatch) {
        abschnittAktiv = aktiveGZ.has(gzMatch);
      }
      if (abschnittAktiv) gefiltert.push(zeile);
    }
    return gefiltert.join("\n").trim();
  }, [strategischesText, aktiveGZ]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  // DSGVO-Einwilligung: einmalig pro Session
  const [consentGiven, setConsentGiven] = useState(() => {
    return localStorage.getItem("kiich_ma_consent") === "true";
  });
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [schlafModusAktiv, setSchlafModusAktiv] = useState(false);
  const [schlafMetapherLaedt, setSchlafMetapherLaedt] = useState(false);
  // MA-Tages-Vorlesen: klar, ohne Effekte
  const [isMASpeaking, setIsMASpeaking] = useState(false);
  const maAudioRef = useRef<HTMLAudioElement | null>(null);

  // Schlaf-Modus Hintergrundmusik
  const SCHLAF_MUSIK_URL = "https://d2xsxph8kpxj0f.cloudfront.net/310519663036873684/VyRb5akas5jLZtUDKwE632/schlafmusik_ma_5b2eb01f.mp3";
  const schlafAudioRef = useRef<HTMLAudioElement | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Vorname-Dialog: MA fragt beim ersten Besuch nach dem Namen
  const [showVornameDialog, setShowVornameDialog] = useState(false);
  const [vornameInput, setVornameInput] = useState("");
  const [vorname, setVorname] = useState<string | null>(null);

  // tRPC
  const aufnehmenMutation = trpc.momentaufnahme.aufnehmen.useMutation();
  const tagesSummaryMutation = trpc.momentaufnahme.tagesSummary.useMutation();
  const strategischesSummaryMutation = trpc.momentaufnahme.strategischesSummary.useMutation();
  const loeschenMutation = trpc.momentaufnahme.loeschen.useMutation();
  const schlafMetapherMutation = trpc.momentaufnahme.schlafMetapher.useMutation();
  const { data: profilData } = trpc.profil.getVorname.useQuery(undefined, { enabled: isAuthenticated });
  const setVornameMutation = trpc.profil.setVorname.useMutation();
  const { data: aufnahmen, refetch: refetchAufnahmen } = trpc.momentaufnahme.heuteAbrufen.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: exportData, refetch: refetchExport } = trpc.momentaufnahme.obsidianExport.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: letztesSummaryData } = trpc.momentaufnahme.letztesSummary.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const { data: archivData } = trpc.momentaufnahme.summaryArchiv.useQuery(
    undefined,
    { enabled: isAuthenticated }
  );
  const [showArchiv, setShowArchiv] = useState(false);
  const [archivExpandedId, setArchivExpandedId] = useState<number | null>(null);
  const [showAppInstallGuide, setShowAppInstallGuide] = useState(false);

  // ─── PLANER: Erledigungen, Visionen, Erinnerungen ────────────────────────
  const { data: erledigungenData, refetch: refetchErledigungen } = trpc.planer.erledigungenLaden.useQuery(undefined, { enabled: isAuthenticated });
  const { data: visionenData, refetch: refetchVisionen } = trpc.planer.visionenLaden.useQuery(undefined, { enabled: isAuthenticated });
  const { data: erinnerungenData, refetch: refetchErinnerungen } = trpc.planer.erinnerungenLaden.useQuery(undefined, { enabled: isAuthenticated });
  const erledigungHinzufuegenMutation = trpc.planer.erledigungHinzufuegen.useMutation();
  const erledigungLoeschenMutation = trpc.planer.erledigungLoeschen.useMutation();
  const visionHinzufuegenMutation = trpc.planer.visionHinzufuegen.useMutation();
  const visionLoeschenMutation = trpc.planer.visionLoeschen.useMutation();
  const erinnerungHinzufuegenMutation = trpc.planer.erinnerungHinzufuegen.useMutation();
  const erinnerungDirektHinzufuegenMutation = trpc.planer.erinnerungDirektHinzufuegen.useMutation();
  const erinnerungBestaetigenMutation = trpc.planer.erinnerungBestaetigen.useMutation();
  const erinnerungAusgeloestMutation = trpc.planer.erinnerungAusgeloest.useMutation();
  const [planerNeuerText, setPlanerNeuerText] = useState("");
  const [planerNeueErinnerung, setPlanerNeueErinnerung] = useState("");
  const [planerLaedt, setPlanerLaedt] = useState(false);
  // Sprach-Erinnerung
  const erinnerungPerSpracheMutation = trpc.planer.erinnerungPerSprache.useMutation();
  const [sprachErinnerungAktiv, setSprachErinnerungAktiv] = useState(false);
  const sprachErinnerungRecorderRef = useRef<MediaRecorder | null>(null);

  // ─── WEB PUSH ──────────────────────────────────────────────────────────────
  const { data: vapidData } = trpc.planer.vapidPublicKey.useQuery(undefined, { enabled: isAuthenticated });
  const pushSubscriptionSpeichernMutation = trpc.planer.pushSubscriptionSpeichern.useMutation();
  const [pushErlaubt, setPushErlaubt] = useState<boolean | null>(null);

  // Service Worker registrieren + Push-Subscription anlegen
  useEffect(() => {
    if (!isAuthenticated || !vapidData?.publicKey) return;
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

    const setupPush = async () => {
      try {
        // Service Worker registrieren
        const reg = await navigator.serviceWorker.register('/sw.js');
        await navigator.serviceWorker.ready;

        // Bestehende Subscription prüfen
        let sub = await reg.pushManager.getSubscription();

        if (!sub) {
          // Erlaubnis anfragen (nur wenn noch nicht entschieden)
          const permission = await Notification.requestPermission();
          if (permission !== 'granted') {
            setPushErlaubt(false);
            return;
          }
          // Neue Subscription anlegen
          sub = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidData.publicKey) as unknown as ArrayBuffer,
          });
        }

        setPushErlaubt(true);

        // Subscription auf dem Server speichern
        const subJson = sub.toJSON();
        if (subJson.endpoint && subJson.keys?.p256dh && subJson.keys?.auth) {
          await pushSubscriptionSpeichernMutation.mutateAsync({
            endpoint: subJson.endpoint,
            p256dh: subJson.keys.p256dh,
            auth: subJson.keys.auth,
          });
        }

        // Service Worker Message-Listener: MA spricht beim Öffnen via Push
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data?.type === 'ERINNERUNG_OEFFNEN' && event.data?.text) {
            setErinnerungsPopup({ id: 0, text: event.data.text });
            setSummaryModus('erinnerungen');
          }
        });
      } catch (err) {
        console.warn('[Push] Setup fehlgeschlagen:', err);
      }
    };

    setupPush();
  }, [isAuthenticated, vapidData?.publicKey]);

  // URL-Parameter: Erinnerung beim Öffnen via Push-Klick vorlesen
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const erinnerungText = params.get('erinnerung');
    if (erinnerungText) {
      setErinnerungsPopup({ id: 0, text: decodeURIComponent(erinnerungText) });
      setSummaryModus('erinnerungen');
      // URL bereinigen
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);
  const sprachErinnerungChunksRef = useRef<Blob[]>([]);

  const handleSprachErinnerungStart = useCallback(async () => {
    if (sprachErinnerungAktiv) {
      // Stoppen
      sprachErinnerungRecorderRef.current?.stop();
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      sprachErinnerungChunksRef.current = [];
      recorder.ondataavailable = e => { if (e.data.size > 0) sprachErinnerungChunksRef.current.push(e.data); };
      recorder.onstop = async () => {
        stream.getTracks().forEach(t => t.stop());
        setSprachErinnerungAktiv(false);
        const blob = new Blob(sprachErinnerungChunksRef.current, { type: "audio/webm" });
        if (blob.size < 1000) { toast.error("Aufnahme zu kurz"); return; }
        setPlanerLaedt(true);
        try {
          // Upload zu S3
          const formData = new FormData();
          formData.append("audio", blob, `erinnerung-${Date.now()}.webm`);
          const uploadResp = await fetch("/api/audio/upload", { method: "POST", body: formData, credentials: "include" });
          if (!uploadResp.ok) throw new Error("Upload fehlgeschlagen");
          const { audioUrl } = await uploadResp.json();
          // Transkription + LLM
          const r = await erinnerungPerSpracheMutation.mutateAsync({ audioUrl, jetzt: new Date().toISOString() });
          toast.success(`Erinnerung gesetzt: ${r.text}`);
          await refetchErinnerungen();
        } catch (err: any) {
          toast.error(err?.message ?? "Sprach-Erinnerung fehlgeschlagen");
        } finally {
          setPlanerLaedt(false);
        }
      };
      recorder.start();
      sprachErinnerungRecorderRef.current = recorder;
      setSprachErinnerungAktiv(true);
    } catch {
      toast.error("Mikrofon-Zugriff verweigert");
    }
  }, [sprachErinnerungAktiv, erinnerungPerSpracheMutation, refetchErinnerungen]);
  // Fällige Erinnerungen (Polling alle 30 Sek)
  // jetztMs wird alle 30 Sekunden aktualisiert – damit der Query immer mit der echten Zeit läuft
  const [jetztMs, setJetztMs] = useState(() => Date.now());
  useEffect(() => {
    const interval = setInterval(() => setJetztMs(Date.now()), 30000);
    return () => clearInterval(interval);
  }, []);
  const { data: faelligeErinnerungen, refetch: refetchFaellige } = trpc.planer.faelligeErinnerungen.useQuery(
    { jetztMs },
    { enabled: isAuthenticated, refetchInterval: 30000 }
  );
  const [erinnerungsPopup, setErinnerungsPopup] = useState<{ id: number; text: string } | null>(null);
  // Auto-TTS für Erinnerungen: Ein/Aus-Schalter (persistent im localStorage)
  const [autoTtsErinnerungen, setAutoTtsErinnerungen] = useState<boolean>(() => {
    return localStorage.getItem("kiich_auto_tts_erinnerungen") !== "false";
  });
  const toggleAutoTts = useCallback(() => {
    setAutoTtsErinnerungen(prev => {
      const next = !prev;
      localStorage.setItem("kiich_auto_tts_erinnerungen", next ? "true" : "false");
      return next;
    });
  }, []);

  // ─── MORGEN-BRIEFING ────────────────────────────────────────────────────────
  // briefingZeit: "" = deaktiviert, sonst "HH:MM"
  const [briefingZeit, setBriefingZeit] = useState<string>(() =>
    localStorage.getItem("kiich_briefing_zeit") ?? ""
  );
  const [showBriefingSettings, setShowBriefingSettings] = useState(false);
  const briefingZeitRef = useRef(briefingZeit);
  useEffect(() => { briefingZeitRef.current = briefingZeit; }, [briefingZeit]);
  // Prüft jede Minute ob Briefing-Zeit erreicht
  const briefingAusgeloestRef = useRef<string>(""); // verhindert Doppel-Auslösung
  useEffect(() => {
    if (!briefingZeit) return;
    const interval = setInterval(() => {
      const jetzt = new Date();
      const hhmm = `${String(jetzt.getHours()).padStart(2, "0")}:${String(jetzt.getMinutes()).padStart(2, "0")}`;
      if (hhmm === briefingZeitRef.current && briefingAusgeloestRef.current !== hhmm) {
        briefingAusgeloestRef.current = hhmm;
        // Briefing auslösen – wechselt zu Erledigungen-Tab und liest vor
        setSummaryModus("erledigungen");
        // Kurze Verzögerung damit Tab-Wechsel abgeschlossen ist
        setTimeout(() => {
          handleMASpeakBriefingRef.current?.();
        }, 800);
      }
    }, 15000); // alle 15 Sekunden prüfen
    return () => clearInterval(interval);
  }, [briefingZeit]);

  // Vorname aus Profil laden und ggf. Dialog zeigen
  // Nur einmal fragen — wenn User "Später" geklickt hat, nicht mehr nerven
  useEffect(() => {
    if (profilData !== undefined) {
      if (profilData.vorname) {
        setVorname(profilData.vorname);
      } else {
        // Nur fragen wenn noch nie "Später" gedrückt wurde
        const spaeter = localStorage.getItem("kiich_ma_name_spaeter");
        if (!spaeter) {
          setShowVornameDialog(true);
        }
      }
    }
  }, [profilData]);

  // Fällige Erinnerungen auslösen + ggf. automatisch vorlesen
  // WICHTIG: elevenLabsTTSMutation wird erst weiter unten definiert – wir nutzen einen Callback-Ref
  const autoTtsCallbackRef = useRef<((text: string) => void) | null>(null);

  useEffect(() => {
    if (!faelligeErinnerungen || faelligeErinnerungen.length === 0) return;
    const erste = faelligeErinnerungen[0];
    setErinnerungsPopup({ id: erste.id, text: erste.text });
    erinnerungAusgeloestMutation.mutate({ id: erste.id });
    // Automatisches Vorlesen wenn Schalter aktiv
    if (autoTtsErinnerungen && autoTtsCallbackRef.current) {
      const stunde = new Date().getHours();
      const gruss = stunde >= 5 && stunde < 11 ? "Guten Morgen" : stunde >= 11 && stunde < 18 ? "Hallo" : "Guten Abend";
      autoTtsCallbackRef.current(`${gruss}. Erinnerung: ${erste.text}`);
    }
  }, [faelligeErinnerungen, autoTtsErinnerungen]);

  const handleVornameBestaetigen = useCallback(async () => {
    const name = vornameInput.trim();
    if (!name) return;
    try {
      await setVornameMutation.mutateAsync({ vorname: name });
      setVorname(name);
      setShowVornameDialog(false);
    } catch {
      // Fehler ignorieren — Dialog bleibt offen
    }
  }, [vornameInput, setVornameMutation]);

  // Timer + Auto-Stop bei 3 Minuten
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds(s => {
          const next = s + 1;
          if (next >= MAX_DAUER_SEK) {
            // Maximaldauer erreicht: optisches Signal + Vibration
            setIsMaxReached(true);
            if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            // Auto-Stop nach kurzem Delay damit letztes Chunk noch kommt
            setTimeout(() => stopRecordingRef.current?.(), 300);
          }
          return next;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingSeconds(0);
      setIsMaxReached(false);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  // Ref auf stopRecording für den Auto-Stop-Callback
  const stopRecordingRef = useRef<(() => void) | null>(null);

  // Schlaf-Modus: Musik starten/stoppen
  // Sanfter Fade-Out der Hintergrundmusik
  const fadeOutAudio = useCallback((audio: HTMLAudioElement, durationMs = 5000) => {
    const steps = 40;
    const interval = durationMs / steps;
    const startVol = audio.volume;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      audio.volume = Math.max(0, startVol * (1 - step / steps));
      if (step >= steps) {
        clearInterval(timer);
        audio.pause();
        audio.currentTime = 0;
        audio.volume = startVol; // für nächstes Mal zurücksetzen
        setSchlafModusAktiv(false);
      }
    }, interval);
  }, []);

  const elevenLabsTTSMutation = trpc.momentaufnahme.elevenLabsTTS.useMutation();

  // Auto-TTS Callback-Ref hier befüllen, nachdem elevenLabsTTSMutation definiert ist
  useEffect(() => {
    autoTtsCallbackRef.current = (text: string) => {
      elevenLabsTTSMutation.mutate(
        { text },
        {
          onSuccess: (result: any) => {
            if (result.audioBase64 && !result.fallback) {
              const audio = new Audio(`data:${result.mimeType};base64,${result.audioBase64}`);
              audio.playbackRate = 0.85;
              audio.preservesPitch = true;
              audio.volume = 1.0;
              audio.play().catch(() => {});
            }
          },
        }
      );
    };
  });

  const startSchlafModus = useCallback(async () => {
    if (!summaryText) return;
    setSchlafModusAktiv(true);
    setSchlafMetapherLaedt(true);

    // WICHTIG: Musik und Sprach-Audio-Element SOFORT beim Klick initialisieren
    // (Browser-Autoplay-Policy: audio.play() muss direkt im Klick-Handler aufgerufen werden)
    if (!schlafAudioRef.current) {
      const audio = new Audio(SCHLAF_MUSIK_URL);
      audio.loop = true;
      audio.volume = 0;
      schlafAudioRef.current = audio;
    }
    schlafAudioRef.current.currentTime = 0;
    schlafAudioRef.current.volume = 0;
    // Musik starten und sanft einblenden
    schlafAudioRef.current.play().then(() => {
      // Fade-in auf 0.02 in 3 Sekunden (sehr minimal, Klangteppich)
      const steps = 30;
      const interval = 3000 / steps;
      let step = 0;
      const timer = setInterval(() => {
        step++;
        if (schlafAudioRef.current) schlafAudioRef.current.volume = Math.min(0.02, 0.02 * (step / steps));
        if (step >= steps) clearInterval(timer);
      }, interval);
    }).catch(err => console.warn("[Schlaf-Musik] Autoplay blockiert:", err));

    // Sprach-Audio-Element vorab erstellen (im Klick-Kontext) damit Browser play() später erlaubt
    const sprachAudio = new Audio();
    sprachAudio.volume = 0.9;
    // Kurz abspielen und sofort pausieren — "entsperrt" das Element für spätere Nutzung
    sprachAudio.play().catch(() => {});
    sprachAudio.pause();

    // Schritt 1: KI-Metapher generieren
    let textZumVorlesen = summaryText;
    try {
      const metapher = await schlafMetapherMutation.mutateAsync({ summaryText });
      textZumVorlesen = metapher.text;
    } catch {
      // Fallback: rohes Summary
    } finally {
      setSchlafMetapherLaedt(false);
    }

    // Schritt 2: Voxtral TTS (MA-Stimme), dann Web Speech als Fallback
    const onAudioEnde = () => {
      if (schlafAudioRef.current) fadeOutAudio(schlafAudioRef.current, 5000);
    };

    try {
      const ttsResult = await elevenLabsTTSMutation.mutateAsync({ text: textZumVorlesen });
      if (ttsResult.audioBase64 && !ttsResult.fallback) {
        // Google TTS Audio über vorbereitetes Element abspielen
        const audioSrc = `data:${ttsResult.mimeType};base64,${ttsResult.audioBase64}`;
        sprachAudio.src = audioSrc;
        // Sprechtempo: 0.85 = 15% langsamer, preservesPitch hält Tonhöhe stabil
        sprachAudio.playbackRate = 0.85;
        sprachAudio.preservesPitch = true;
        sprachAudio.onended = onAudioEnde;
        sprachAudio.play().catch(() => {
          // Fallback: Web Speech
          speak(textZumVorlesen, onAudioEnde);
        });
      } else {
        speak(textZumVorlesen, onAudioEnde);
      }
    } catch {
      speak(textZumVorlesen, onAudioEnde);
    }
  }, [summaryText, speak, fadeOutAudio, SCHLAF_MUSIK_URL, schlafMetapherMutation, elevenLabsTTSMutation]);

  const stopSchlafModus = useCallback(() => {
    setSchlafModusAktiv(false);
    stop(); // TTS stoppen
    if (schlafAudioRef.current) {
      // Auch beim manuellen Stopp: sanfter Fade-Out (2 Sekunden)
      fadeOutAudio(schlafAudioRef.current, 2000);
    }
  }, [stop, fadeOutAudio]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      if (schlafAudioRef.current) {
        schlafAudioRef.current.pause();
      }
    };
  }, []);

  // Letztes gespeichertes Summary beim Öffnen sofort anzeigen (Reflexion + Strategie)
  useEffect(() => {
    if (!letztesSummaryData) return;
    if (letztesSummaryData.text && !summaryText) {
      setSummaryText(letztesSummaryData.text);
      setSummaryDatum(letztesSummaryData.datum);
      setShowSummary(true);
    }
    if (letztesSummaryData.strategischesText && !strategischesText) {
      setStrategischesText(letztesSummaryData.strategischesText);
      setStrategischesDatum(letztesSummaryData.datum);
      if (!letztesSummaryData.text) setShowSummary(true);
    }
  }, [letztesSummaryData]); // eslint-disable-line react-hooks/exhaustive-deps

  // Aufnahme starten — mit DSGVO-Einwilligungsprüfung
  const startRecording = useCallback(async () => {
    if (isRecording || isProcessing) return;
    if (!consentGiven) {
      setShowConsentDialog(true);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Firefox unterstützt kein audio/webm — braucht audio/ogg;codecs=opus
      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : MediaRecorder.isTypeSupported("audio/ogg;codecs=opus")
        ? "audio/ogg;codecs=opus"
        : MediaRecorder.isTypeSupported("audio/ogg")
        ? "audio/ogg"
        : "audio/mp4";

      const recorder = new MediaRecorder(stream, { mimeType });
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      recorder.start(250);
      setIsRecording(true);
    } catch {
      toast.error("Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.");
    }
  }, [isRecording, isProcessing]);

  // Aufnahme stoppen und verarbeiten
  const stopRecording = useCallback(() => {
    if (!mediaRecorderRef.current || !isRecording) return;

    // Mindestdauer prüfen
    if (recordingSeconds < MIN_DAUER_SEK) {
      // Aufnahme abbrechen ohne Upload
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.onstop = () => {
        setIsRecording(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
        toast.warning("Zu kurz – bitte mindestens 2 Sekunden sprechen.");
      };
      return;
    }

    const dauer = recordingSeconds;

    mediaRecorderRef.current.onstop = async () => {
      setIsRecording(false);
      setIsProcessing(true);

      try {
        const blob = new Blob(chunksRef.current, {
          type: mediaRecorderRef.current?.mimeType || "audio/webm",
        });

        // Schritt 1: Audio direkt als multipart/form-data hochladen
        const formData = new FormData();
        // Dateiendung an MIME-Type anpassen (Firefox liefert ogg, Chrome webm)
        const ext = blob.type.includes("ogg") ? "ogg" : blob.type.includes("mp4") ? "mp4" : "webm";
        formData.append("audio", blob, `aufnahme.${ext}`);
        formData.append("mimeType", blob.type);

        const uploadRes = await fetch("/api/audio/upload", {
          method: "POST",
          body: formData,
          credentials: "include",
        });

        if (!uploadRes.ok) {
          const errData = await uploadRes.json().catch(() => ({}));
          throw new Error(errData.error || "Audio-Upload fehlgeschlagen");
        }

        const { audioUrl } = await uploadRes.json();

        // Schritt 2: tRPC-Mutation mit S3-URL
        const result = await aufnehmenMutation.mutateAsync({
          audioUrl,
          dauerSekunden: dauer,
        });

        const config = KATEGORIE_CONFIG[result.kategorie as keyof typeof KATEGORIE_CONFIG];
        toast.success(
          `${config?.emoji ?? "📸"} Eingeordnet in ${result.kategorie}`,
          { description: result.zusammenfassung || undefined }
        );

        await refetchAufnahmen();
        await refetchExport();
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Verarbeitung fehlgeschlagen";
        toast.error(msg);
      } finally {
        setIsProcessing(false);
        streamRef.current?.getTracks().forEach(t => t.stop());
      }
    };

    mediaRecorderRef.current.stop();
  }, [isRecording, recordingSeconds, aufnehmenMutation, refetchAufnahmen, refetchExport]);

  // stopRecording-Ref aktuell halten
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // Obsidian-Export herunterladen
  const handleExport = useCallback(() => {
    if (!exportData) return;
    const blob = new Blob([exportData.markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = exportData.filename;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("Obsidian-Datei heruntergeladen");
  }, [exportData]);

  // Tages-Zusammenfassung generieren
  const handleTagesSummary = useCallback(async () => {
    setIsSummaryLoading(true);
    try {
      const result = await tagesSummaryMutation.mutateAsync();
      setSummaryText(typeof result.text === "string" ? result.text : "");
      setSummaryDatum(result.datum);
      setShowSummary(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Zusammenfassung fehlgeschlagen";
      toast.error(msg);
    } finally {
      setIsSummaryLoading(false);
    }
  }, [tagesSummaryMutation]);

  // Strategisches Summary generieren
  const handleStrategischesSummary = useCallback(async () => {
    setIsStrategischLaden(true);
    try {
      const result = await strategischesSummaryMutation.mutateAsync();
      setStrategischesText(typeof result.text === "string" ? result.text : "");
      setStrategischesDatum(result.datum);
      setShowSummary(true);
      setSummaryModus("strategie");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Strategisches Summary fehlgeschlagen";
      toast.error(msg);
    } finally {
      setIsStrategischLaden(false);
    }
  }, [strategischesSummaryMutation]);

  // TTS für Zusammenfassung (Browser-Stimme, Fallback)
  const handleSpeakSummary = useCallback(() => {
    if (isSpeaking) {
      stop();
    } else if (summaryText) {
      speak(summaryText);
    }
  }, [isSpeaking, summaryText, speak, stop]);

  // MA-Stimme für Tages-Summary: klar, ohne Hall, ohne Musik
  const handleMASpeakSummary = useCallback(async () => {
    // Stoppen wenn bereits läuft
    if (isMASpeaking) {
      if (maAudioRef.current) {
        maAudioRef.current.pause();
        maAudioRef.current = null;
      }
      setIsMASpeaking(false);
      return;
    }
    // Tageszeit-abhängige Begrüßung
    const stunde = new Date().getHours();
    const tagesgruss = stunde >= 5 && stunde < 11
      ? "Guten Morgen"
      : stunde >= 11 && stunde < 18
        ? "Hallo"
        : "Guten Abend";
    const namenszusatz = vorname ? `, ${vorname}` : "";

    let basisText = "";
    let einleitung = "";
    if (summaryModus === "strategie") {
      basisText = gefilterterStrategieText;
      einleitung = `${tagesgruss}${namenszusatz}. Hier sind deine offenen Aufgaben für heute:\n\n`;
    } else if (summaryModus === "erledigungen") {
      basisText = (erledigungenData ?? []).map((e, i) => `${i + 1}. ${e.text}`).join("\n");
      einleitung = `${tagesgruss}${namenszusatz}. Hier sind deine Erledigungen:\n\n`;
    } else if (summaryModus === "visionen") {
      basisText = (visionenData ?? []).map((v, i) => `${i + 1}. ${v.text}`).join("\n");
      einleitung = `${tagesgruss}${namenszusatz}. Hier sind deine Visionen:\n\n`;
    } else if (summaryModus === "erinnerungen") {
      basisText = (erinnerungenData ?? []).map((e, i) => {
        const d = new Date(e.faelligkeitMs);
        return `${i + 1}. ${e.text} – ${d.toLocaleString("de-DE", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" })}`;
      }).join("\n");
      einleitung = `${tagesgruss}${namenszusatz}. Hier sind deine Erinnerungen:\n\n`;
    } else {
      basisText = summaryText;
      einleitung = vorname
        ? `${tagesgruss}, ${vorname}. Hier ist deine Tages-Reflexion:\n\n`
        : `${tagesgruss}. Hier ist deine Tages-Reflexion:\n\n`;
    }
    if (!basisText) return;
    const aktiverText = einleitung + basisText;
    setIsMASpeaking(true);
    try {
      const ttsResult = await elevenLabsTTSMutation.mutateAsync({ text: aktiverText });
      if (ttsResult.audioBase64 && !ttsResult.fallback) {
        const audio = new Audio(`data:${ttsResult.mimeType};base64,${ttsResult.audioBase64}`);
        // Klar und direkt: kein Hall, kein Reverb, kein Effekt
        audio.playbackRate = 0.85;
        audio.preservesPitch = true;
        audio.volume = 1.0;
        maAudioRef.current = audio;
        audio.onended = () => setIsMASpeaking(false);
        audio.onerror = () => setIsMASpeaking(false);
        audio.play().catch(() => {
          // Fallback: Browser-Stimme
          setIsMASpeaking(false);
          speak(aktiverText);
        });
      } else {
        setIsMASpeaking(false);
        speak(aktiverText);
      }
    } catch {
      setIsMASpeaking(false);
      speak(aktiverText);
    }
  }, [isMASpeaking, summaryModus, summaryText, gefilterterStrategieText, erledigungenData, visionenData, erinnerungenData, vorname, elevenLabsTTSMutation, speak]);

  // Briefing-Ref: wird nach handleMASpeakSummary gesetzt damit Timer darauf zugreifen kann
  const handleMASpeakBriefingRef = useRef<(() => void) | null>(null);
  // Briefing-Funktion: liest alle Erledigungen charmant vor
  const handleMASpeakBriefing = useCallback(async () => {
    const stunde = new Date().getHours();
    const tagesgruss = stunde >= 5 && stunde < 11 ? "Guten Morgen" : stunde >= 11 && stunde < 18 ? "Hallo" : "Guten Abend";
    const namenszusatz = vorname ? `, ${vorname}` : "";
    const aufgaben = (erledigungenData ?? []);
    if (aufgaben.length === 0) return;
    const liste = aufgaben.map((e, i) => `${i + 1}. ${e.text}`).join("\n");
    const anzahl = aufgaben.length;
    const einleitung = anzahl === 1
      ? `${tagesgruss}${namenszusatz}. Du hast heute eine offene Erledigung:\n\n`
      : `${tagesgruss}${namenszusatz}. Du hast heute ${anzahl} offene Erledigungen:\n\n`;
    const abschluss = "\n\nViel Erfolg heute!";
    const text = einleitung + liste + abschluss;
    setIsMASpeaking(true);
    try {
      const ttsResult = await elevenLabsTTSMutation.mutateAsync({ text });
      if (ttsResult.audioBase64 && !ttsResult.fallback) {
        const audio = new Audio(`data:${ttsResult.mimeType};base64,${ttsResult.audioBase64}`);
        audio.playbackRate = 0.85;
        audio.preservesPitch = true;
        audio.volume = 1.0;
        maAudioRef.current = audio;
        audio.onended = () => setIsMASpeaking(false);
        audio.onerror = () => setIsMASpeaking(false);
        audio.play().catch(() => { setIsMASpeaking(false); speak(text); });
      } else {
        setIsMASpeaking(false);
        speak(text);
      }
    } catch {
      setIsMASpeaking(false);
      speak(text);
    }
  }, [erledigungenData, vorname, elevenLabsTTSMutation, speak]);
  // Ref aktuell halten
  useEffect(() => { handleMASpeakBriefingRef.current = handleMASpeakBriefing; }, [handleMASpeakBriefing]);

  // Aufnahme löschen
  const handleLoeschen = useCallback(async (id: number) => {
    await loeschenMutation.mutateAsync({ id });
    await refetchAufnahmen();
    await refetchExport();
    toast.success("Aufnahme gelöscht");
  }, [loeschenMutation, refetchAufnahmen, refetchExport]);

  const formatZeit = (sek: number) => {
    const m = Math.floor(sek / 60).toString().padStart(2, "0");
    const s = (sek % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // ─── Login-Gate ──────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex flex-col items-center justify-center px-6 text-center">
        <div className="text-6xl mb-6">📸</div>
        <h1 className="text-2xl font-bold text-white mb-2">MOMENTAUFNAHME</h1>
        <p className="text-white/50 mb-8 max-w-xs">
          Halte deine Gedanken fest, bevor sie verschwinden. Melde dich an um zu beginnen.
        </p>
        <Button
          onClick={() => (window.location.href = getLoginUrl())}
          className="bg-white text-black hover:bg-white/90 gap-2"
        >
          <LogIn className="w-4 h-4" />
          Anmelden
        </Button>
      </div>
    );
  }

  // ─── Hauptansicht ─────────────────────────────────────────────────────────────

  const anzahlHeute = aufnahmen?.length ?? 0;

  return (
    <>
    {/* MA-Begrüßungsdialog: "Mit welchem Namen darf ich dich ansprechen?" */}
    {showVornameDialog && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-6">
        <div className="w-full max-w-sm bg-[#12101a] border border-violet-500/20 rounded-2xl p-6 shadow-2xl">
          {/* MA-Avatar */}
          <div className="flex flex-col items-center mb-5">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center text-2xl mb-3 shadow-lg shadow-violet-900/50">
              🌙
            </div>
            <p className="text-[10px] font-semibold tracking-[0.2em] text-violet-400 uppercase mb-1">MA · Momentaufnahme</p>
          </div>
          {/* MA-Frage */}
          <p className="text-white/90 text-center text-base leading-relaxed mb-6">
            Mit welchem Namen darf ich dich ansprechen?
          </p>
          {/* Eingabefeld */}
          <input
            type="text"
            value={vornameInput}
            onChange={e => setVornameInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && handleVornameBestaetigen()}
            placeholder="Dein Vorname ..."
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 text-sm focus:outline-none focus:border-violet-500/50 mb-4"
          />
          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleVornameBestaetigen}
              disabled={!vornameInput.trim() || setVornameMutation.isPending}
              className="flex-1 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {setVornameMutation.isPending ? "..." : "Bestätigen"}
            </button>
            <button
              onClick={() => {
                localStorage.setItem("kiich_ma_name_spaeter", "true");
                setShowVornameDialog(false);
              }}
              className="px-4 py-2.5 rounded-xl border border-white/10 text-white/40 hover:text-white/70 text-sm transition-colors"
            >
              Später
            </button>
          </div>
          <p className="text-center text-white/25 text-xs mt-3">Du kannst deinen Namen jederzeit ändern</p>
        </div>
      </div>
    )}
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Header */}
      <header className="px-3 pt-5 pb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <Link href="/">
            <button className="p-2 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white/80 flex-shrink-0">
              <ArrowLeft className="w-5 h-5" />
            </button>
          </Link>
          <div className="min-w-0">
            <h1 className="text-base font-bold tracking-widest text-white">MA</h1>
            <p className="text-xs text-white/40">
              {anzahlHeute === 0
                ? "Noch keine Aufnahmen heute"
                : `${anzahlHeute} Gedanke${anzahlHeute !== 1 ? "n" : ""} heute`}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {/* App installieren */}
          <button
            onClick={() => setShowAppInstallGuide(true)}
            className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
          >
            <Smartphone className="w-5 h-5" />
            <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">App installieren</span>
          </button>
          {/* Abo-Link */}
          <Link href="/abo">
            <button
              className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <CreditCard className="w-5 h-5" />
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Abo & Ebenen</span>
            </button>
          </Link>
          {/* Einschlaf-Bibliothek-Link */}
          <Link href="/einschlafen">
            <button
              className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <span className="text-base leading-none">🌙</span>
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Einschlaf-Bibliothek</span>
            </button>
          </Link>
          {/* Archiv-Link */}
          <Link href="/momentaufnahme/archiv">
            <button
              className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Archive className="w-5 h-5" />
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Alle Aufnahmen</span>
            </button>
          </Link>
          {/* Obsidian-Verbinden-Link */}
          <Link href="/momentaufnahme/obsidian">
            <button
              className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            >
              <Plug className="w-5 h-5" />
              <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Obsidian Export</span>
            </button>
          </Link>
          {anzahlHeute > 0 && (
            <>
              {/* Neue Aufnahme – immer sichtbar wenn bereits Aufnahmen vorhanden */}
              <button
                onClick={startRecording}
                disabled={isRecording || isProcessing}
                className="group relative p-2.5 rounded-full bg-violet-600 hover:bg-violet-500 transition-colors text-white"
              >
                <Mic className="w-5 h-5" />
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Neue Aufnahme</span>
              </button>
              <button
                onClick={handleExport}
                className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <Download className="w-5 h-5" />
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Als Datei exportieren</span>
              </button>
              <button
                onClick={handleTagesSummary}
                disabled={isSummaryLoading}
                className="group relative p-2.5 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                {isSummaryLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Headphones className="w-5 h-5" />
                )}
                <span className="pointer-events-none absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/80 px-2 py-1 text-[10px] text-white/80 opacity-0 group-hover:opacity-100 transition-opacity z-50">Tages-Summary</span>
              </button>
            </>
          )}
        </div>
      </header>

      {/* Trial-Banner */}
      <div className="px-5 pt-4">
        <TrialBanner />
      </div>



      {/* Tages-Zusammenfassung + Planer-Tabs */}
      {(showSummary && (summaryText || strategischesText)) || isAuthenticated ? (
        <div className="mx-5 mb-4 p-4 rounded-2xl bg-gradient-to-br from-violet-900/40 to-blue-900/40 border border-violet-500/20">
          {/* Vier Tabs: Reflexion / Erledigungen / Erinnerungen / Visionen */}
          <div className="grid grid-cols-4 gap-0.5 mb-3 bg-white/5 rounded-xl p-1">
            <button
              onClick={() => setSummaryModus("reflexion")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                summaryModus === "reflexion"
                  ? "bg-violet-600 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <Sparkles className="w-3 h-3" />
              <span>Reflexion</span>
            </button>
            <button
              onClick={() => setSummaryModus("erledigungen")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                summaryModus === "erledigungen"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <Check className="w-3 h-3" />
              <span>Erledigungen</span>
            </button>
            <button
              onClick={() => setSummaryModus("erinnerungen")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                summaryModus === "erinnerungen"
                  ? "bg-amber-600 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <Bell className="w-3 h-3" />
              <span>Erinnerungen</span>
            </button>
            <button
              onClick={() => setSummaryModus("visionen")}
              className={cn(
                "flex flex-col items-center justify-center gap-0.5 py-1.5 rounded-lg text-[10px] font-medium transition-all",
                summaryModus === "visionen"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-white/40 hover:text-white/70"
              )}
            >
              <Eye className="w-3 h-3" />
              <span>Visionen</span>
            </button>
          </div>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {summaryModus === "reflexion" ? (
                <><Sparkles className="w-4 h-4 text-violet-400" /><span className="text-xs font-medium text-violet-300">Das war mein Tag</span></>
              ) : summaryModus === "erledigungen" ? (
                <><Check className="w-4 h-4 text-emerald-400" /><span className="text-xs font-medium text-emerald-300">Meine Erledigungen</span></>
              ) : summaryModus === "erinnerungen" ? (
                <><Bell className="w-4 h-4 text-amber-400" /><span className="text-xs font-medium text-amber-300">Meine Erinnerungen</span></>
              ) : summaryModus === "visionen" ? (
                <><Eye className="w-4 h-4 text-indigo-400" /><span className="text-xs font-medium text-indigo-300">Meine Visionen</span></>
              ) : (
                <><span className="text-sm">🎯</span><span className="text-xs font-medium text-emerald-300">Meine offenen Aufgaben</span></>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Stimmauswahl */}
              {voices.length > 1 && (
                <select
                  value={selectedVoiceURI}
                  onChange={e => setSelectedVoiceURI(e.target.value)}
                  className="text-[10px] bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-white/50 hover:text-white/80 transition-colors max-w-[120px] truncate"
                  title="Stimme auswählen"
                >
                  {voices
                    .filter((v, i, arr) => arr.findIndex(x => x.voiceURI === v.voiceURI) === i)
                    .map((v, i) => (
                    <option key={`${v.voiceURI}-${i}`} value={v.voiceURI} className="bg-[#1a1a2e]">
                      {v.name.replace(/Microsoft |Google |Apple /, "")}
                    </option>
                  ))}
                </select>
              )}
              {/* MA-Stimme Button: klar, ohne Effekte */}
              <button
                onClick={handleMASpeakSummary}
                disabled={elevenLabsTTSMutation.isPending && !isMASpeaking}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium transition-colors",
                  isMASpeaking
                    ? "bg-violet-500/30 text-violet-300"
                    : "hover:bg-white/10 text-white/40 hover:text-white/70",
                  elevenLabsTTSMutation.isPending && !isMASpeaking && "opacity-50 cursor-wait"
                )}
                title={isMASpeaking ? "MA stoppen" : "MA vorlesen lassen"}
              >
                {elevenLabsTTSMutation.isPending && !isMASpeaking ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isMASpeaking ? (
                  <Square className="w-3 h-3 fill-current" />
                ) : (
                  <Play className="w-3 h-3 fill-current" />
                )}
                <span>MA</span>
              </button>
              <button
                onClick={() => { stop(); setShowSummary(false); }}
                className="text-white/30 hover:text-white/60 text-xs"
              >
                ✕
              </button>
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/60">
              {summaryModus === "strategie" ? strategischesDatum : summaryModus === "reflexion" ? summaryDatum : ""}
            </p>
            {summaryModus === "reflexion" && (
              vorname ? (
                <button
                  onClick={() => setShowVornameDialog(true)}
                  className="text-[10px] text-violet-400/50 hover:text-violet-300 transition-colors"
                  title="Namen ändern"
                >
                  • {vorname} · ändern
                </button>
              ) : (
                <button
                  onClick={() => setShowVornameDialog(true)}
                  className="text-[10px] text-violet-400/60 hover:text-violet-300 transition-colors"
                >
                  + Vorname eingeben
                </button>
              )
            )}
          </div>
          {/* Ladeindikator für strategisches Summary */}
          {summaryModus === "strategie" && isStrategischLaden && (
            <div className="flex items-center justify-center gap-2 py-4">
              <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
              <span className="text-xs text-emerald-300">MA analysiert deine Aufgaben...</span>
            </div>
          )}
          {/* Tab-Inhalte */}

          {/* REFLEXION */}
          {summaryModus === "reflexion" && (
            <div>
              {summaryText ? (
                <p className="text-sm text-white/80 leading-relaxed whitespace-pre-wrap">{summaryText}</p>
              ) : (
                <p className="text-sm text-white/30 italic">Noch kein Tages-Summary vorhanden. Erstelle zuerst eine Aufnahme.</p>
              )}
              {summaryText && (
                <div className="mt-3">
                  <button onClick={handleMASpeakSummary} disabled={elevenLabsTTSMutation.isPending && !isMASpeaking}
                    className={cn("w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all",
                      isMASpeaking ? "bg-violet-500/20 border border-violet-500/40 text-violet-300" : "bg-violet-500/10 hover:bg-violet-500/20 border border-violet-500/20 hover:border-violet-500/40 text-violet-400 hover:text-violet-300",
                      elevenLabsTTSMutation.isPending && !isMASpeaking && "opacity-50 cursor-wait")}>
                    {elevenLabsTTSMutation.isPending && !isMASpeaking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isMASpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isMASpeaking ? "MA stoppen" : "MA liest Reflexion vor"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STRATEGIE */}
          {summaryModus === "strategie" && !isStrategischLaden && (
            <div>
              {strategischesText && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {ALLE_GZ.map(gz => {
                    const cfg = KATEGORIE_CONFIG[gz as keyof typeof KATEGORIE_CONFIG];
                    const aktiv = aktiveGZ.has(gz);
                    return (
                      <button key={gz} onClick={() => toggleGZ(gz)}
                        className={cn("flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border transition-all",
                          aktiv ? cfg.farbe : "bg-white/3 text-white/20 border-white/10 hover:text-white/40")}
                        title={aktiv ? `${gz} ausblenden` : `${gz} einblenden`}>
                        <span>{cfg.emoji}</span><span>{gz}</span>
                      </button>
                    );
                  })}
                  {aktiveGZ.size < ALLE_GZ.length && (
                    <button onClick={() => setAktiveGZ(new Set(ALLE_GZ))}
                      className="px-2 py-0.5 rounded-full text-[10px] text-white/30 hover:text-emerald-300 border border-white/10 hover:border-emerald-500/30 transition-all">Alle</button>
                  )}
                </div>
              )}
              <div className="text-sm text-white/80 leading-relaxed">
                {strategischesText ? (
                  <p className="whitespace-pre-wrap">{gefilterterStrategieText || <span className="text-white/30 italic">Keine Aufgaben für die gewählten Gravitationszentren.</span>}</p>
                ) : (
                  <span className="text-white/30 italic">Noch kein strategisches Summary vorhanden.</span>
                )}
              </div>
              {gefilterterStrategieText && (
                <div className="mt-3">
                  <button onClick={handleMASpeakSummary} disabled={elevenLabsTTSMutation.isPending && !isMASpeaking}
                    className={cn("w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold transition-all",
                      isMASpeaking ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300" : "bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 text-emerald-400 hover:text-emerald-300",
                      elevenLabsTTSMutation.isPending && !isMASpeaking && "opacity-50 cursor-wait")}>
                    {elevenLabsTTSMutation.isPending && !isMASpeaking ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : isMASpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                    <span>{isMASpeaking ? "MA stoppen" : "MA liest Aufgaben vor"}</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ERLEDIGUNGEN */}
          {summaryModus === "erledigungen" && (
            <div className="space-y-2">
              {/* Neue Erledigung hinzufügen */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={planerNeuerText}
                  onChange={e => setPlanerNeuerText(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && planerNeuerText.trim()) {
                      setPlanerLaedt(true);
                      await erledigungHinzufuegenMutation.mutateAsync({ text: planerNeuerText.trim() });
                      setPlanerNeuerText("");
                      await refetchErledigungen();
                      setPlanerLaedt(false);
                    }
                  }}
                  placeholder="Neue Erledigung..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/40"
                />
                <button
                  onClick={async () => {
                    if (!planerNeuerText.trim()) return;
                    setPlanerLaedt(true);
                    await erledigungHinzufuegenMutation.mutateAsync({ text: planerNeuerText.trim() });
                    setPlanerNeuerText("");
                    await refetchErledigungen();
                    setPlanerLaedt(false);
                  }}
                  disabled={planerLaedt || !planerNeuerText.trim()}
                  className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-40 transition-colors"
                >
                  {planerLaedt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              {/* Liste */}
              {(erledigungenData ?? []).length === 0 ? (
                <p className="text-xs text-white/30 italic text-center py-4">Keine offenen Erledigungen. Super!</p>
              ) : (
                (erledigungenData ?? []).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <button
                      onClick={async () => {
                        await erledigungLoeschenMutation.mutateAsync({ id: item.id });
                        await refetchErledigungen();
                        toast.success("Erledigt! ✓");
                      }}
                      className="w-5 h-5 rounded-full border-2 border-emerald-500/50 hover:bg-emerald-500/20 flex items-center justify-center flex-shrink-0 transition-colors"
                      title="Als erledigt markieren"
                    >
                      <Check className="w-3 h-3 text-emerald-400 opacity-0 hover:opacity-100" />
                    </button>
                    <span className="flex-1 text-sm text-white/80">{item.text}</span>
                    {item.kategorie && (
                      <span className={cn("text-[10px] px-1.5 py-0.5 rounded-full border", KATEGORIE_CONFIG[item.kategorie as keyof typeof KATEGORIE_CONFIG]?.farbe ?? "")}>
                        {item.kategorie}
                      </span>
                    )}
                    <button
                      onClick={async () => {
                        await erledigungLoeschenMutation.mutateAsync({ id: item.id });
                        await refetchErledigungen();
                      }}
                      className="p-1 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
              {/* MA Briefing-Bereich */}
              <div className="mt-3 space-y-2">
                {/* Briefing auf Knopfdruck */}
                <button
                  onClick={handleMASpeakBriefing}
                  disabled={(erledigungenData ?? []).length === 0 || (elevenLabsTTSMutation.isPending && !isMASpeaking)}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold transition-all",
                    isMASpeaking
                      ? "bg-emerald-500/20 border border-emerald-500/40 text-emerald-300"
                      : "bg-emerald-600/80 hover:bg-emerald-500 text-white",
                    (erledigungenData ?? []).length === 0 && "opacity-40 cursor-not-allowed"
                  )}
                >
                  {isMASpeaking ? <Square className="w-4 h-4 fill-current" /> : <Volume2 className="w-4 h-4" />}
                  <span>{isMASpeaking ? "MA stoppen" : "MA liest Briefing vor"}</span>
                </button>

                {/* Zeiteinstellung */}
                <button
                  onClick={() => setShowBriefingSettings(s => !s)}
                  className={cn(
                    "w-full flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-semibold transition-all border",
                    briefingZeit
                      ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                      : "bg-white/5 border-white/10 text-white/40"
                  )}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">⏰</span>
                    {briefingZeit
                      ? `Automatisches Briefing um ${briefingZeit} Uhr`
                      : "Automatisches Briefing einrichten"}
                  </span>
                  <span className="text-white/30">{showBriefingSettings ? "▲" : "▼"}</span>
                </button>

                {showBriefingSettings && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-4 space-y-3">
                    <p className="text-xs text-white/40">MA liest deine Erledigungen automatisch vor – jeden Tag zur gewählten Uhrzeit.</p>
                    <div className="flex items-center gap-3">
                      <input
                        type="time"
                        value={briefingZeit}
                        onChange={e => {
                          const val = e.target.value;
                          setBriefingZeit(val);
                          localStorage.setItem("kiich_briefing_zeit", val);
                        }}
                        className="flex-1 bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      {briefingZeit && (
                        <button
                          onClick={() => {
                            setBriefingZeit("");
                            localStorage.removeItem("kiich_briefing_zeit");
                          }}
                          className="px-3 py-2 rounded-xl bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 text-red-400 text-xs font-semibold transition-colors"
                        >
                          Deaktivieren
                        </button>
                      )}
                    </div>
                    {briefingZeit && (
                      <p className="text-xs text-emerald-400/70">
                        ✓ Aktiv – MA meldet sich täglich um {briefingZeit} Uhr
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ERINNERUNGEN */}
          {summaryModus === "erinnerungen" && (
            <div className="space-y-2">
              {/* Neue Erinnerung – Text oder Sprache */}
              {/* Sprach-Button */}
              <button
                onClick={handleSprachErinnerungStart}
                disabled={planerLaedt}
                className={cn(
                  "w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold mb-3 transition-all",
                  sprachErinnerungAktiv
                    ? "bg-red-500/20 border border-red-500/40 text-red-300 animate-pulse"
                    : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 hover:border-amber-500/40 text-amber-400 hover:text-amber-300",
                  planerLaedt && "opacity-50 cursor-wait"
                )}
              >
                {planerLaedt ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /><span>MA verarbeitet...</span></>
                ) : sprachErinnerungAktiv ? (
                  <><Square className="w-4 h-4 fill-current" /><span>Aufnahme beenden</span></>
                ) : (
                  <><Mic className="w-4 h-4" /><span>Erinnerung einsprechen</span></>
                )}
              </button>
              {sprachErinnerungAktiv && (
                <p className="text-[10px] text-amber-400/60 text-center -mt-2 mb-2 animate-pulse">
                  ● Sprich jetzt: "MA, erinnere mich um 15 Uhr, den Arzttermin anzurufen"
                </p>
              )}
              {/* Text-Fallback */}
              <div className="flex gap-2 mb-1">
                <input
                  type="text"
                  value={planerNeueErinnerung}
                  onChange={e => setPlanerNeueErinnerung(e.target.value)}
                  placeholder="Oder schreiben: Erinnere mich um 10 Uhr..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-amber-500/40"
                  onKeyDown={async e => {
                    if (e.key === "Enter" && planerNeueErinnerung.trim()) {
                      setPlanerLaedt(true);
                      try {
                        const r = await erinnerungHinzufuegenMutation.mutateAsync({ sprachbefehl: planerNeueErinnerung.trim(), jetzt: new Date().toISOString() });
                        toast.success(`Erinnerung gesetzt: ${r.text}`);
                        setPlanerNeueErinnerung("");
                        await refetchErinnerungen();
                      } catch { toast.error("Erinnerung konnte nicht gesetzt werden"); }
                      finally { setPlanerLaedt(false); }
                    }
                  }}
                />
                <button
                  onClick={async () => {
                    if (!planerNeueErinnerung.trim()) return;
                    setPlanerLaedt(true);
                    try {
                      const r = await erinnerungHinzufuegenMutation.mutateAsync({ sprachbefehl: planerNeueErinnerung.trim(), jetzt: new Date().toISOString() });
                      toast.success(`Erinnerung gesetzt: ${r.text}`);
                      setPlanerNeueErinnerung("");
                      await refetchErinnerungen();
                    } catch { toast.error("Erinnerung konnte nicht gesetzt werden"); }
                    finally { setPlanerLaedt(false); }
                  }}
                  disabled={planerLaedt || !planerNeueErinnerung.trim()}
                  className="p-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white disabled:opacity-40 transition-colors"
                >
                  {planerLaedt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Bell className="w-4 h-4" />}
                </button>
              </div>
              <p className="text-[10px] text-white/30 mb-2">MA versteht natürliche Sprache – Sprache oder Text</p>
              {/* Liste */}
              {(erinnerungenData ?? []).length === 0 ? (
                <p className="text-xs text-white/30 italic text-center py-4">Keine Erinnerungen gesetzt.</p>
              ) : (
                (erinnerungenData ?? []).map(item => {
                  const faellig = new Date(item.faelligkeitMs);
                  const istFaellig = item.faelligkeitMs <= Date.now();
                  return (
                    <div key={item.id} className={cn("flex items-center gap-2 p-3 rounded-xl border", istFaellig ? "bg-amber-900/20 border-amber-500/30" : "bg-white/5 border-white/10")}>
                      <Bell className={cn("w-4 h-4 flex-shrink-0", istFaellig ? "text-amber-400" : "text-white/30")} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-white/80 truncate">{item.text}</p>
                        <p className="text-[10px] text-white/30">{faellig.toLocaleString("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" })}</p>
                      </div>
                      <button
                        onClick={async () => {
                          await erinnerungBestaetigenMutation.mutateAsync({ id: item.id });
                          await refetchErinnerungen();
                        }}
                        className="p-1 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  );
                })
              )}
              {/* MA vorlesen */}
              {(erinnerungenData ?? []).length > 0 && (
                <button onClick={handleMASpeakSummary} disabled={elevenLabsTTSMutation.isPending && !isMASpeaking}
                  className={cn("w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold mt-2 transition-all",
                    isMASpeaking ? "bg-amber-500/20 border border-amber-500/40 text-amber-300" : "bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400",
                    elevenLabsTTSMutation.isPending && !isMASpeaking && "opacity-50 cursor-wait")}>
                  {isMASpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMASpeaking ? "MA stoppen" : "MA liest Erinnerungen vor"}</span>
                </button>
              )}
            </div>
          )}

          {/* VISIONEN */}
          {summaryModus === "visionen" && (
            <div className="space-y-2">
              {/* Neue Vision hinzufügen */}
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={planerNeuerText}
                  onChange={e => setPlanerNeuerText(e.target.value)}
                  onKeyDown={async e => {
                    if (e.key === "Enter" && planerNeuerText.trim()) {
                      setPlanerLaedt(true);
                      await visionHinzufuegenMutation.mutateAsync({ text: planerNeuerText.trim() });
                      setPlanerNeuerText("");
                      await refetchVisionen();
                      setPlanerLaedt(false);
                    }
                  }}
                  placeholder="Meine Vision..."
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-3 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-indigo-500/40"
                />
                <button
                  onClick={async () => {
                    if (!planerNeuerText.trim()) return;
                    setPlanerLaedt(true);
                    await visionHinzufuegenMutation.mutateAsync({ text: planerNeuerText.trim() });
                    setPlanerNeuerText("");
                    await refetchVisionen();
                    setPlanerLaedt(false);
                  }}
                  disabled={planerLaedt || !planerNeuerText.trim()}
                  className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white disabled:opacity-40 transition-colors"
                >
                  {planerLaedt ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                </button>
              </div>
              {/* Liste */}
              {(visionenData ?? []).length === 0 ? (
                <p className="text-xs text-white/30 italic text-center py-4">Noch keine Visionen eingetragen. Was träumst du dir?</p>
              ) : (
                (visionenData ?? []).map(item => (
                  <div key={item.id} className="flex items-center gap-2 p-3 rounded-xl bg-white/5 border border-white/10">
                    <Eye className="w-4 h-4 text-indigo-400/60 flex-shrink-0" />
                    <span className="flex-1 text-sm text-white/80">{item.text}</span>
                    <button
                      onClick={async () => {
                        await visionLoeschenMutation.mutateAsync({ id: item.id });
                        await refetchVisionen();
                      }}
                      className="p-1 rounded-full hover:bg-red-500/20 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
              {/* MA vorlesen */}
              {(visionenData ?? []).length > 0 && (
                <button onClick={handleMASpeakSummary} disabled={elevenLabsTTSMutation.isPending && !isMASpeaking}
                  className={cn("w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold mt-2 transition-all",
                    isMASpeaking ? "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300" : "bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-indigo-400",
                    elevenLabsTTSMutation.isPending && !isMASpeaking && "opacity-50 cursor-wait")}>
                  {isMASpeaking ? <Square className="w-3.5 h-3.5 fill-current" /> : <Volume2 className="w-3.5 h-3.5" />}
                  <span>{isMASpeaking ? "MA stoppen" : "MA liest Visionen vor"}</span>
                </button>
              )}
            </div>
          )}
          {/* KI-Kennzeichnung (EU AI Act Art. 50) */}
          <div className="mt-3 pt-3 border-t border-violet-500/10 flex items-center gap-1.5">
            <span className="text-[10px] text-violet-400/60 font-medium tracking-wide">✦ KI-GENERIERT</span>
            <span className="text-[10px] text-white/25">· Dieser Text wurde automatisch durch ein KI-Sprachmodell erstellt und dient ausschließlich der persönlichen Reflexion.</span>
          </div>
          {/* Pulsierender Indikator beim Vorlesen */}
          {(isSpeaking || isMASpeaking) && (
            <div className="flex items-center gap-1.5 mt-3">
              {[0, 1, 2, 3].map(i => (
                <span
                  key={i}
                  className="w-1 rounded-full bg-violet-400 animate-pulse"
                  style={{
                    height: `${8 + (i % 3) * 4}px`,
                    animationDelay: `${i * 0.15}s`,
                  }}
                />
              ))}
              <span className="text-xs text-violet-400 ml-1">
                {isMASpeaking ? "MA spricht..." : "wird vorgelesen..."}
              </span>
            </div>
          )}

          {/* Strategie: Aktualisieren-Button */}
          {summaryModus === "strategie" && strategischesText && !isStrategischLaden && (
            <div className="mt-3">
              <button
                onClick={handleStrategischesSummary}
                disabled={isStrategischLaden}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-emerald-500/20 text-white/40 hover:text-emerald-300 text-xs transition-all"
              >
                <Loader2 className={cn("w-3 h-3", isStrategischLaden ? "animate-spin" : "")} />
                Aufgaben neu analysieren
              </button>
            </div>
          )}

          {/* Einschlaf-Bibliothek Link – nur im Reflexions-Modus */}
          {summaryModus === "reflexion" && (
            <div className="mt-3">
              <Link href="/einschlafen">
                <button className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/3 hover:bg-white/6 border border-white/5 hover:border-white/10 transition-all">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">📚</span>
                    <span className="text-xs text-white/50">Einschlaf-Bibliothek</span>
                  </div>
                  <span className="text-[10px] text-white/25">Märchen · Abenteuer · Metaphern ›</span>
                </button>
              </Link>
            </div>
          )}

          {/* Schlaf-Modus Button – nur im Reflexions-Modus */}
          {summaryModus === "reflexion" && (
          <div className="mt-4 pt-3 border-t border-indigo-500/10">
            {!schlafModusAktiv ? (
              <button
                onClick={startSchlafModus}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-900/50 to-violet-900/50 border border-indigo-500/30 hover:border-indigo-400/50 text-indigo-200 text-sm font-medium transition-all hover:scale-[1.01] active:scale-[0.99]"
              >
                <span className="text-base">🌙</span>
                <span>SCHLAF-MODUS starten</span>
                <span className="text-indigo-400/50 text-xs">· Musik + Einschlaf-Botschaft</span>
              </button>
            ) : (
              <div className="space-y-2">
                {schlafMetapherLaedt ? (
                  <div className="flex items-center justify-center gap-2 py-2">
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin" />
                    <span className="text-xs text-indigo-300">Einschlaf-Botschaft wird bereitet...</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 py-2">
                    {[0,1,2,3,4].map(i => (
                      <span
                        key={i}
                        className="w-1 rounded-full bg-indigo-400 animate-pulse"
                        style={{ height: `${6 + (i % 3) * 5}px`, animationDelay: `${i * 0.2}s` }}
                      />
                    ))}
                    <span className="text-xs text-indigo-300 ml-2">
                      {isSpeaking ? "Einschlaf-Botschaft wird vorgelesen..." : "Schlaf-Modus aktiv · Musik läuft"}
                    </span>
                  </div>
                )}
                <button
                  onClick={stopSchlafModus}
                  className="w-full py-2 rounded-xl border border-white/10 text-white/40 hover:text-white/70 text-xs transition-colors"
                >
                  Schlaf-Modus beenden
                </button>
              </div>
            )}
          </div>
          )}
        </div>
      ) : null}

      {/* Summary-Archiv */}
      {archivData && archivData.length > 1 && (
        <div className="mx-5 mb-3">
          <button
            onClick={() => setShowArchiv(v => !v)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-white/3 hover:bg-white/5 border border-white/5 hover:border-white/10 transition-all"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm">📖</span>
              <span className="text-xs text-white/50">Summary-Archiv</span>
              <span className="text-[10px] text-white/25">{archivData.length} Einträge</span>
            </div>
            <span className="text-[10px] text-white/30">{showArchiv ? '▲' : '▼'}</span>
          </button>
          {showArchiv && (
            <div className="mt-2 space-y-2">
              {archivData.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-xl bg-white/3 border border-white/5 overflow-hidden"
                >
                  <button
                    onClick={() => setArchivExpandedId(archivExpandedId === entry.id ? null : entry.id)}
                    className="w-full flex items-center justify-between px-3 py-2.5 text-left hover:bg-white/3 transition-colors"
                  >
                    <div>
                      <p className="text-xs text-violet-300/70 font-medium">{entry.datum}</p>
                      <p className="text-[11px] text-white/40 mt-0.5 line-clamp-1">
                        {entry.text.slice(0, 80)}{entry.text.length > 80 ? '…' : ''}
                      </p>
                    </div>
                    <span className="text-[10px] text-white/20 ml-2 shrink-0">{archivExpandedId === entry.id ? '▲' : '▼'}</span>
                  </button>
                  {archivExpandedId === entry.id && (
                    <div className="px-3 pb-3 border-t border-white/5">
                      <p className="text-xs text-white/60 leading-relaxed pt-2">{entry.text}</p>
                      <p className="text-[10px] text-white/20 mt-2">{entry.anzahlAufnahmen} Aufnahmen · {entry.datum}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Aufnahmeliste */}
      <div className="flex-1 overflow-y-auto px-5 pb-44">
        {anzahlHeute === 0 ? (
          <div className="flex flex-col items-center pt-6 pb-44 text-center">
            {/* Wenn letztes Summary vorhanden: kompakter Hinweis statt langer Werbetexte */}
            {letztesSummaryData ? (
              <div className="w-full max-w-sm mx-auto mb-8 px-2">
                <p className="text-white/40 text-xs text-center mb-6">
                  Noch keine neuen Aufnahmen heute · Dein letztes Summary ist oben sichtbar.
                </p>
                <div className="text-center">
                  <div className="text-4xl mb-3 opacity-40">🎤</div>
                  <p className="text-white/30 text-xs">Tippe auf den Mikrofon-Button und sprich deinen ersten Gedanken.</p>
                  <p className="text-white/20 text-xs mt-1">MA ordnet ihn automatisch in eines der 6 Gravitationszentren ein.</p>
                </div>
              </div>
            ) : null}
            {/* Erster Start — kompakter Willkommenstext */}
            {!letztesSummaryData && (
              <div className="w-full max-w-sm mx-auto px-2">
                <div className="mb-8 p-5 rounded-2xl bg-gradient-to-br from-violet-900/30 to-blue-900/20 border border-violet-500/20 text-center">
                  <p className="text-violet-300 text-xs font-semibold tracking-widest uppercase mb-3">Willkommen bei MA</p>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Sprich deinen ersten Gedanken — MA hört zu, ordnet ein und fasst zusammen.
                  </p>
                  <p className="text-white/40 text-xs mt-3 leading-relaxed">
                    Nach deiner ersten Aufnahme erscheint hier dein persönliches Tages-Summary.
                  </p>
                  {/* Selbstbestimmungs-Prinzip */}
                  <div className="mt-4 pt-4 border-t border-violet-500/15">
                    <p className="text-[11px] text-violet-300/60 font-semibold tracking-wider uppercase mb-2">MA's Grundsatz</p>
                    <p className="text-white/50 text-xs leading-relaxed">
                      MA gibt <span className="text-white/80 font-medium">keine Ratschläge</span>. Sie spiegelt, verdichtet und begleitet — ohne zu lenken.
                    </p>
                    <p className="text-white/30 text-xs mt-2 leading-relaxed italic">
                      „Selbstbestimmt bleiben bei gleichzeitiger optimierter Nutzung aller Qualitäten der Technologie.“
                    </p>
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-4xl mb-3 opacity-40">🎤</div>
                  <p className="text-white/30 text-xs">Tippe auf den Mikrofon-Button und sprich deinen ersten Gedanken.</p>
                  <p className="text-white/20 text-xs mt-1">MA ordnet ihn automatisch in eines der 6 Gravitationszentren ein.</p>
                </div>
                {/* Einladungslink */}
                <div className="mt-8">
                  <EinladungsLink />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {aufnahmen?.map((aufnahme) => {
              const kat = aufnahme.kategorie as keyof typeof KATEGORIE_CONFIG;
              const config = KATEGORIE_CONFIG[kat] ?? KATEGORIE_CONFIG.QUELL;
              const isExpanded = expandedId === aufnahme.id;
              const zeit = new Date(aufnahme.createdAt).toLocaleTimeString("de-DE", {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={aufnahme.id}
                  className="rounded-2xl bg-white/5 border border-white/10 overflow-hidden"
                >
                  <div
                    className="flex items-start gap-3 p-4 cursor-pointer"
                    onClick={() => setExpandedId(isExpanded ? null : aufnahme.id)}
                  >
                    <span className="text-xl mt-0.5">{config.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={cn(
                            "text-xs px-2 py-0.5 rounded-full border font-medium",
                            config.farbe
                          )}
                        >
                          {kat}
                        </span>
                        <span className="text-xs text-white/30">{zeit}</span>
                      </div>
                      <p className="text-sm text-white/70 line-clamp-2">
                        {aufnahme.zusammenfassung || aufnahme.text}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      {/* Audio-Download */}
                      {aufnahme.audioUrl && (
                        <a
                          href={aufnahme.audioUrl}
                          download={`aufnahme-${aufnahme.id}.webm`}
                          onClick={(e) => e.stopPropagation()}
                          className="p-1.5 rounded-full hover:bg-white/10 text-white/20 hover:text-white/60 transition-colors"
                          title="Audio herunterladen"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLoeschen(aufnahme.id);
                        }}
                        className="p-1.5 rounded-full hover:bg-red-500/20 text-white/30 hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-white/30" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-white/30" />
                      )}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 border-t border-white/5">
                      <p className="text-sm text-white/60 leading-relaxed mt-3">{aufnahme.text}</p>
                      {aufnahme.audioUrl && (
                        <div className="mt-3">
                          <audio
                            controls
                            src={aufnahme.audioUrl}
                            className="w-full h-8 opacity-50"
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {/* Prominenter Tages-Summary Button */}
        {aufnahmen && aufnahmen.length > 0 && (
          <div className="mt-6 mb-4 px-2">
            <button
              onClick={handleTagesSummary}
              disabled={isSummaryLoading}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-semibold text-base flex items-center justify-center gap-3 transition-all duration-200 shadow-lg shadow-violet-900/40 active:scale-95 disabled:opacity-60"
            >
              {isSummaryLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Tages-Summary wird erstellt…</>
              ) : summaryText ? (
                <><Sparkles className="w-5 h-5" /> 🔄  Summary aktualisieren</>
              ) : (
                <><Sparkles className="w-5 h-5" /> 🌙  Mein Tages-Summary erstellen</>
              )}
            </button>
            <p className="text-center text-white/30 text-xs mt-2">Vernetzt alle heutigen Aufnahmen · Schlaf-Modus inklusive</p>
            {/* Einladungslink */}
            <div className="mt-6">
              <EinladungsLink />
            </div>
          </div>
        )}
      </div>

      {/* Aufnahme-Button (fixiert unten) */}
      <div className="fixed bottom-0 left-0 right-0 pb-8 flex flex-col items-center gap-3 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/90 to-transparent pt-8">
        {/* Status-Text */}
        {isRecording && (
          <div className="flex flex-col items-center gap-1.5 w-full px-8">
            <div className="flex items-center gap-2 text-sm">
              <span className={cn(
                "w-2 h-2 rounded-full animate-pulse",
                isMaxReached ? "bg-amber-400" : "bg-red-500"
              )} />
              <span className={isMaxReached ? "text-amber-400 font-medium" : "text-white/60"}>
                {isMaxReached
                  ? "3 Minuten erreicht – wird gespeichert..."
                  : `${formatZeit(recordingSeconds)} – Spreche jetzt...`}
              </span>
            </div>
            {/* Fortschrittsbalken */}
            <div className="w-full max-w-xs h-1 rounded-full bg-white/10 overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000",
                  isMaxReached ? "bg-amber-400" : "bg-red-500"
                )}
                style={{ width: `${Math.min((recordingSeconds / MAX_DAUER_SEK) * 100, 100)}%` }}
              />
            </div>
          </div>
        )}
        {isProcessing && (
          <div className="flex items-center gap-2 text-sm text-white/60">
            <Loader2 className="w-4 h-4 animate-spin" />
            KI klassifiziert deinen Gedanken...
          </div>
        )}

        {/* Haupt-Aufnahme-Button – Tap-to-Start / Tap-to-Stop */}
        <button
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center transition-all duration-200 select-none touch-none",
            "shadow-2xl active:scale-95",
            isMaxReached
              ? "bg-amber-500 shadow-amber-500/40 scale-110 animate-pulse"
              : isRecording
              ? "bg-red-500 shadow-red-500/40 scale-110"
              : isProcessing
              ? "bg-white/20 cursor-not-allowed"
              : "bg-white shadow-white/20 hover:scale-105"
          )}
          aria-label={isRecording ? "Aufnahme stoppen" : "Aufnahme starten"}
        >
          {isProcessing ? (
            <Loader2 className="w-8 h-8 text-white animate-spin" />
          ) : isRecording ? (
            <MicOff className="w-8 h-8 text-white" />
          ) : (
            <Mic className="w-8 h-8 text-black" />
          )}
        </button>

        <p className="text-xs text-white/30">
          {isRecording ? "Nochmal tippen zum Stoppen" : "Tippen zum Sprechen"}
        </p>
        {/* Datenschutz-Hinweis unter Button */}
        {!isRecording && !isProcessing && (
          <p className="text-[10px] text-white/15 text-center px-8">
            Aufnahmen werden verschlüsselt verarbeitet und nicht für KI-Training verwendet.
          </p>
        )}

        {/* Obsidian-Hinweis */}
        {anzahlHeute > 0 && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 text-xs text-white/30 hover:text-white/60 transition-colors"
          >
            <BookOpen className="w-3.5 h-3.5" />
            {exportData?.filename || "Obsidian Export"}
          </button>
        )}
      </div>
    </div>
    {/* Erinnerungs-Popup */}
    {erinnerungsPopup && (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-5">
        <div className="w-full max-w-sm bg-[#1a1a0f] border border-amber-500/40 rounded-3xl p-6 shadow-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-amber-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-amber-400/70 font-semibold tracking-wider uppercase">Erinnerung</p>
              <p className="text-white font-semibold text-base leading-snug">{erinnerungsPopup.text}</p>
            </div>
          </div>
          <p className="text-white/40 text-xs mb-4">MA erinnert dich jetzt daran.</p>
          {/* Auto-TTS Schalter */}
          <button
            onClick={toggleAutoTts}
            className={cn(
              "w-full flex items-center justify-between px-4 py-2.5 rounded-xl mb-4 text-xs font-semibold transition-all border",
              autoTtsErinnerungen
                ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
                : "bg-white/5 border-white/10 text-white/40"
            )}
          >
            <span className="flex items-center gap-2">
              <Volume2 className="w-3.5 h-3.5" />
              MA spricht Erinnerungen automatisch vor
            </span>
            <span className={cn(
              "w-8 h-4 rounded-full transition-all relative",
              autoTtsErinnerungen ? "bg-amber-500" : "bg-white/20"
            )}>
              <span className={cn(
                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-all",
                autoTtsErinnerungen ? "left-4.5" : "left-0.5"
              )} />
            </span>
          </button>
          {/* Snooze-Optionen */}
          <div className="mb-3">
            <p className="text-white/30 text-xs mb-2 text-center">Nochmal erinnern in …</p>
            <div className="grid grid-cols-3 gap-2">
              {[10, 30, 60].map((min) => (
                <button
                  key={min}
                  onClick={async () => {
                    await erinnerungBestaetigenMutation.mutateAsync({ id: erinnerungsPopup.id });
                    await erinnerungDirektHinzufuegenMutation.mutateAsync({
                      text: erinnerungsPopup.text,
                      faelligkeitMs: Date.now() + min * 60 * 1000,
                    });
                    toast.success(`Erinnerung in ${min} Minuten wiederholt`);
                    await refetchErinnerungen();
                    setErinnerungsPopup(null);
                  }}
                  className="py-2 rounded-xl bg-white/8 hover:bg-amber-500/20 border border-white/10 hover:border-amber-500/30 text-white/50 hover:text-amber-300 font-semibold text-xs transition-all"
                >
                  ⏰ {min} Min
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={async () => {
              await erinnerungBestaetigenMutation.mutateAsync({ id: erinnerungsPopup.id });
              await refetchErinnerungen();
              setErinnerungsPopup(null);
            }}
            className="w-full py-3 rounded-2xl bg-amber-600 hover:bg-amber-500 text-white font-semibold text-sm transition-colors"
          >
            Verstanden ✓
          </button>
        </div>
      </div>
    )}
    {/* DSGVO-Einwilligungsdialog */}
    {showConsentDialog && (
      <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm">
        <div className="w-full max-w-lg bg-[#0f0f1a] border border-violet-500/30 rounded-t-3xl p-6 pb-10 shadow-2xl">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">🔒</span>
            <h2 className="text-white font-semibold text-base">Datenschutz & Einwilligung</h2>
          </div>
          <p className="text-white/60 text-sm leading-relaxed mb-4">
            Bevor du deine erste Aufnahme machst, benötigen wir deine Einwilligung zur Verarbeitung deiner Spracheingabe.
          </p>
          <div className="bg-white/5 rounded-xl p-4 mb-5 text-xs text-white/40 leading-relaxed space-y-2">
            <p>✦ Deine Sprachaufnahme wird transkribiert und durch ein KI-Sprachmodell analysiert.</p>
            <p>✦ Die Aufnahme wird nach der Verarbeitung nicht dauerhaft gespeichert.</p>
            <p>✦ Deine Daten werden nicht für das Training von KI-Modellen verwendet.</p>
            <p>✦ Du kannst deine Einwilligung jederzeit widerrufen (Einstellungen → Datenschutz).</p>
            <p>❖ Die KI-generierten Auswertungen dienen ausschließlich der persönlichen Reflexion — kein medizinisches Angebot.</p>
            <p className="text-violet-300/60 border-t border-white/10 pt-2 mt-2">❖ MA gibt <span className="text-violet-300/90 font-medium">keine Ratschläge</span>. Sie spiegelt und begleitet — die Entscheidungshoheit bleibt bei dir.</p>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={async () => {
                localStorage.setItem("kiich_ma_consent", "true");
                setConsentGiven(true);
                setShowConsentDialog(false);
                // Aufnahme direkt starten — consentGiven-Closure umgehen
                try {
                  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                  streamRef.current = stream;
                  const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
                    ? "audio/webm;codecs=opus"
                    : MediaRecorder.isTypeSupported("audio/webm")
                    ? "audio/webm"
                    : "audio/mp4";
                  const recorder = new MediaRecorder(stream, { mimeType });
                  mediaRecorderRef.current = recorder;
                  chunksRef.current = [];
                  recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                  };
                  recorder.start(250);
                  setIsRecording(true);
                } catch {
                  toast.error("Mikrofon-Zugriff verweigert. Bitte erlaube den Zugriff in den Browser-Einstellungen.");
                }
              }}
              className="w-full py-3.5 rounded-2xl bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm transition-colors"
            >
              Ich stimme zu — Aufnahme starten
            </button>
            <button
              onClick={() => setShowConsentDialog(false)}
              className="w-full py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white/50 text-sm transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      </div>
    )}
    {showAppInstallGuide && (
      <AppInstallGuide onClose={() => setShowAppInstallGuide(false)} />
    )}
    <WillkommensDialog />
    </>
  );
}
