import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import {
  Play, Pause, RotateCcw, Bell, BellOff, Sunrise, Music, Sparkles,
  Upload, Loader2, Check, Volume2, AlarmClock, Timer, Wind, Heart,
  Star, Moon, Flame, TrendingUp
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WOCHENTAGE = [
  { label: "Mo", bit: 0 }, { label: "Di", bit: 1 }, { label: "Mi", bit: 2 },
  { label: "Do", bit: 3 }, { label: "Fr", bit: 4 }, { label: "Sa", bit: 5 }, { label: "So", bit: 6 },
];

// ─── Streak-Anzeige ───────────────────────────────────────────────────────────

function StreakAnzeige() {
  const { data: streaks, isLoading } = trpc.rituale.streakLaden.useQuery();

  if (isLoading) return null;
  if (!streaks) return null;

  const heuteTypen: string[] = (streaks as any).heuteTypen ?? [];
  const gesamtStreak = (streaks as any).gesamt ?? 0;

  const ritualItems = [
    { typ: "morgen", label: "Morgen", icon: Sunrise, farbe: "text-amber-400", streak: (streaks as any).morgen ?? 0 },
    { typ: "pause", label: "Pausen", icon: Timer, farbe: "text-orange-400", streak: (streaks as any).pause ?? 0 },
    { typ: "atem", label: "Atem", icon: Wind, farbe: "text-teal-400", streak: (streaks as any).atem ?? 0 },
    { typ: "dankbarkeit", label: "Dankbarkeit", icon: Heart, farbe: "text-rose-400", streak: (streaks as any).dankbarkeit ?? 0 },
    { typ: "abend", label: "Abend", icon: Moon, farbe: "text-indigo-400", streak: (streaks as any).abend ?? 0 },
  ];

  return (
    <div className="bg-zinc-900/60 rounded-2xl p-4 border border-zinc-800 space-y-3">
      {/* Gesamt-Streak */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-orange-400" />
          <span className="text-sm font-medium text-white">Ritual-Streak</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-2xl font-bold text-orange-400">{gesamtStreak}</span>
          <span className="text-xs text-zinc-500">Tage</span>
        </div>
      </div>

      {/* Einzelne Rituale */}
      <div className="grid grid-cols-5 gap-1.5">
        {ritualItems.map(({ typ, label, icon: Icon, farbe, streak }) => {
          const heute = heuteTypen.includes(typ);
          return (
            <div key={typ} className={cn(
              "flex flex-col items-center gap-1 p-2 rounded-xl border transition-all",
              heute ? "bg-zinc-800/80 border-zinc-700" : "bg-zinc-900/40 border-zinc-800/50"
            )}>
              <Icon className={cn("w-4 h-4", heute ? farbe : "text-zinc-600")} />
              <span className={cn("text-[9px] font-medium", heute ? "text-zinc-300" : "text-zinc-600")}>{label}</span>
              {streak > 0 && (
                <div className="flex items-center gap-0.5">
                  <Flame className="w-2.5 h-2.5 text-orange-500" />
                  <span className="text-[9px] text-orange-400 font-bold">{streak}</span>
                </div>
              )}
              {heute && <div className="w-1.5 h-1.5 rounded-full bg-green-400" />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Atemübung 4-7-8 ─────────────────────────────────────────────────────────

function AtemUebung() {
  const [phase, setPhase] = useState<"bereit" | "einatmen" | "halten" | "ausatmen" | "fertig">("bereit");
  const [sekunden, setSekunden] = useState(0);
  const [runde, setRunde] = useState(0);
  const [maxRunden] = useState(4);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();
  const logMutation = trpc.rituale.ritualLoggen.useMutation({
    onSuccess: () => utils.rituale.streakLaden.invalidate()
  });

  const PHASEN = { einatmen: 4, halten: 7, ausatmen: 8 };

  const spieleAtemTon = useCallback((freq: number, dauer: number) => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = freq; osc.type = "sine";
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dauer);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + dauer);
    } catch (e) {}
  }, []);

  const naechstePhase = useCallback((aktuellePhase: string, aktuelleRunde: number) => {
    if (aktuellePhase === "einatmen") {
      setPhase("halten"); setSekunden(PHASEN.halten); spieleAtemTon(528, 0.5);
    } else if (aktuellePhase === "halten") {
      setPhase("ausatmen"); setSekunden(PHASEN.ausatmen); spieleAtemTon(396, 0.5);
    } else if (aktuellePhase === "ausatmen") {
      const neueRunde = aktuelleRunde + 1;
      if (neueRunde >= maxRunden) {
        setPhase("fertig");
        const heute = new Date().toISOString().slice(0, 10);
        logMutation.mutate({ typ: "atem", datum: heute });
        toast.success("Atemübung abgeschlossen! 🌬️");
      } else {
        setRunde(neueRunde); setPhase("einatmen"); setSekunden(PHASEN.einatmen); spieleAtemTon(432, 0.5);
      }
    }
  }, [maxRunden, spieleAtemTon, logMutation]);

  useEffect(() => {
    if (phase === "bereit" || phase === "fertig") {
      if (intervalRef.current) clearInterval(intervalRef.current);
      return;
    }
    intervalRef.current = setInterval(() => {
      setSekunden(prev => {
        if (prev <= 1) {
          naechstePhase(phase, runde);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [phase, runde, naechstePhase]);

  const starten = () => {
    setPhase("einatmen"); setSekunden(PHASEN.einatmen); setRunde(0);
    spieleAtemTon(432, 0.5);
  };

  const phasenConfig = {
    bereit: { text: "4-7-8 Atemübung", sub: "4 Sek. einatmen · 7 halten · 8 ausatmen", farbe: "text-teal-400", bg: "bg-teal-950/20 border-teal-800/40" },
    einatmen: { text: "Einatmen", sub: `${sekunden} Sekunden`, farbe: "text-teal-300", bg: "bg-teal-950/30 border-teal-700/50" },
    halten: { text: "Halten", sub: `${sekunden} Sekunden`, farbe: "text-amber-300", bg: "bg-amber-950/20 border-amber-800/40" },
    ausatmen: { text: "Ausatmen", sub: `${sekunden} Sekunden`, farbe: "text-indigo-300", bg: "bg-indigo-950/20 border-indigo-800/40" },
    fertig: { text: "Wunderbar!", sub: "Atemübung abgeschlossen", farbe: "text-green-400", bg: "bg-green-950/20 border-green-800/40" },
  };

  const cfg = phasenConfig[phase];
  const gesamtSek = phase === "einatmen" ? PHASEN.einatmen : phase === "halten" ? PHASEN.halten : PHASEN.ausatmen;
  const fortschritt = phase === "bereit" || phase === "fertig" ? 0 : ((gesamtSek - sekunden) / gesamtSek) * 100;

  return (
    <div className={cn("rounded-2xl p-5 border transition-all space-y-4", cfg.bg)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Wind className={cn("w-5 h-5", cfg.farbe)} />
          <span className="text-sm font-medium text-white">Atemübung 4-7-8</span>
        </div>
        {runde > 0 && phase !== "fertig" && (
          <span className="text-xs text-zinc-500">{runde + 1}/{maxRunden}</span>
        )}
      </div>

      {/* Kreis-Animation */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-28 h-28">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="50" fill="none" stroke="#27272a" strokeWidth="6" />
            <circle cx="60" cy="60" r="50" fill="none" stroke={
              phase === "einatmen" ? "#2dd4bf" : phase === "halten" ? "#fbbf24" : phase === "ausatmen" ? "#818cf8" : "#27272a"
            } strokeWidth="6" strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 50}`}
              strokeDashoffset={`${2 * Math.PI * 50 * (1 - fortschritt / 100)}`}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={cn("text-xl font-bold", cfg.farbe)}>
              {phase === "bereit" ? "🌬️" : phase === "fertig" ? "✓" : sekunden}
            </span>
            {phase !== "bereit" && phase !== "fertig" && <span className="text-[9px] text-zinc-500">sek</span>}
          </div>
        </div>
        <div className="text-center">
          <p className={cn("text-base font-semibold", cfg.farbe)}>{cfg.text}</p>
          <p className="text-xs text-zinc-500">{cfg.sub}</p>
        </div>
      </div>

      <div className="flex justify-center gap-3">
        {(phase === "bereit" || phase === "fertig") ? (
          <Button onClick={starten} className="bg-teal-600 hover:bg-teal-500 gap-2">
            <Play className="w-4 h-4" /> {phase === "fertig" ? "Nochmal" : "Starten"}
          </Button>
        ) : (
          <Button onClick={() => { setPhase("bereit"); if (intervalRef.current) clearInterval(intervalRef.current); }}
            variant="outline" className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 gap-2">
            <RotateCcw className="w-4 h-4" /> Abbrechen
          </Button>
        )}
      </div>
    </div>
  );
}

// ─── Dankbarkeit & Abend-Ritual ───────────────────────────────────────────────

function DankbarkeitRitual({ vorname }: { vorname?: string }) {
  const heute = new Date().toISOString().slice(0, 10);
  const [eintrag1, setEintrag1] = useState("");
  const [eintrag2, setEintrag2] = useState("");
  const [eintrag3, setEintrag3] = useState("");
  const [stimmung, setStimmung] = useState<number>(3);
  const [abendReflexion, setAbendReflexion] = useState("");
  const [maAbschluss, setMaAbschluss] = useState("");
  const [gespeichert, setGespeichert] = useState(false);
  const utils = trpc.useUtils();

  const { data: vorhandenerEintrag } = trpc.rituale.dankbarkeitLaden.useQuery({ datum: heute });

  useEffect(() => {
    if (vorhandenerEintrag) {
      setEintrag1(vorhandenerEintrag.eintrag1 ?? "");
      setEintrag2(vorhandenerEintrag.eintrag2 ?? "");
      setEintrag3(vorhandenerEintrag.eintrag3 ?? "");
      setStimmung(vorhandenerEintrag.stimmung ?? 3);
      setAbendReflexion(vorhandenerEintrag.abendReflexion ?? "");
      setMaAbschluss(vorhandenerEintrag.maAbschluss ?? "");
      setGespeichert(true);
    }
  }, [vorhandenerEintrag]);

  const speichernMutation = trpc.rituale.dankbarkeitSpeichern.useMutation({
    onSuccess: () => {
      setGespeichert(true);
      utils.rituale.streakLaden.invalidate();
      toast.success("Dankbarkeit gespeichert 🙏");
    },
    onError: (err) => toast.error(err.message),
  });

  const abendTextMutation = trpc.rituale.abendTextGenerieren.useMutation({
    onSuccess: (data) => setMaAbschluss(data.text),
    onError: (err) => toast.error(err.message),
  });

  const handleSpeichern = () => {
    speichernMutation.mutate({ datum: heute, eintrag1, eintrag2, eintrag3, stimmung, abendReflexion });
  };

  const stimmungsEmojis = ["", "😔", "😕", "😐", "🙂", "😊"];
  const stimmungsTexte = ["", "Sehr schwer", "Schwer", "Neutral", "Gut", "Ausgezeichnet"];

  return (
    <div className="space-y-4">
      {/* Stimmungsbarometer */}
      <div className="bg-zinc-900/40 rounded-xl p-4 border border-zinc-800 space-y-3">
        <p className="text-xs text-zinc-500 uppercase tracking-wider flex items-center gap-2">
          <TrendingUp className="w-3.5 h-3.5" /> Wie war dein Tag?
        </p>
        <div className="flex justify-between gap-1">
          {[1, 2, 3, 4, 5].map(wert => (
            <button key={wert} onClick={() => setStimmung(wert)}
              className={cn(
                "flex-1 flex flex-col items-center gap-1 py-2 rounded-xl border transition-all",
                stimmung === wert ? "bg-rose-950/40 border-rose-700/50" : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
              )}>
              <span className="text-lg">{stimmungsEmojis[wert]}</span>
              <span className="text-[9px] text-zinc-500">{stimmungsTexte[wert]}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 3 Dankbarkeits-Felder */}
      <div className="bg-rose-950/10 rounded-xl p-4 border border-rose-900/30 space-y-3">
        <p className="text-sm font-medium text-rose-300 flex items-center gap-2">
          <Heart className="w-4 h-4" /> Wofür bin ich heute dankbar?
        </p>
        {[
          { val: eintrag1, set: setEintrag1, nr: 1, placeholder: "Ich bin dankbar für..." },
          { val: eintrag2, set: setEintrag2, nr: 2, placeholder: "Ein schöner Moment heute war..." },
          { val: eintrag3, set: setEintrag3, nr: 3, placeholder: "Was mich heute berührt hat..." },
        ].map(({ val, set, nr, placeholder }) => (
          <div key={nr} className="flex items-start gap-2">
            <span className="text-rose-600 text-sm font-bold mt-2.5 w-4 flex-shrink-0">{nr}.</span>
            <textarea
              value={val}
              onChange={e => set(e.target.value)}
              rows={2}
              placeholder={placeholder}
              className="flex-1 bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-rose-500/50 resize-none"
            />
          </div>
        ))}
      </div>

      {/* Abend-Reflexion */}
      <div className="bg-indigo-950/10 rounded-xl p-4 border border-indigo-900/30 space-y-3">
        <p className="text-sm font-medium text-indigo-300 flex items-center gap-2">
          <Moon className="w-4 h-4" /> Abend-Reflexion
        </p>
        <textarea
          value={abendReflexion}
          onChange={e => setAbendReflexion(e.target.value)}
          rows={3}
          placeholder="Was war heute bedeutsam? Was lasse ich los?"
          className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none"
        />
      </div>

      {/* MA Abschlusstext */}
      {maAbschluss ? (
        <div className="bg-purple-950/20 rounded-xl p-4 border border-purple-800/30 space-y-2">
          <p className="text-xs text-purple-400 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3" /> MA Abschluss
          </p>
          <p className="text-sm text-zinc-300 leading-relaxed italic">"{maAbschluss}"</p>
        </div>
      ) : null}

      {/* Aktionen */}
      <div className="flex gap-2">
        <Button
          onClick={handleSpeichern}
          disabled={speichernMutation.isPending || (!eintrag1 && !eintrag2 && !eintrag3)}
          className="flex-1 bg-rose-600 hover:bg-rose-500 gap-2"
        >
          {speichernMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
          {gespeichert ? "Aktualisieren" : "Speichern"}
        </Button>
        <Button
          onClick={() => abendTextMutation.mutate({ vorname, eintrag1, eintrag2, eintrag3, stimmung, abendReflexion })}
          disabled={abendTextMutation.isPending || (!eintrag1 && !eintrag2 && !eintrag3)}
          variant="outline"
          className="border-purple-800/50 text-purple-300 hover:bg-purple-950/30 gap-2"
        >
          {abendTextMutation.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
          MA Abschluss
        </Button>
      </div>
    </div>
  );
}

// ─── Bewegungspausen-Timer ────────────────────────────────────────────────────

function BewegungsPausenTimer({ einstellungen, onSave }: { einstellungen: any; onSave: (data: any) => void }) {
  const [arbeitsMin, setArbeitsMin] = useState(einstellungen?.arbeitsMinuten ?? 45);
  const [pausenMin, setPausenMin] = useState(einstellungen?.pausenMinuten ?? 5);
  const [pushAktiv, setPushAktiv] = useState(einstellungen?.pausenPushAktiv ?? true);
  const [von, setVon] = useState(einstellungen?.pausenVon ?? "08:00");
  const [bis, setBis] = useState(einstellungen?.pausenBis ?? "18:00");
  const [timerLaeuft, setTimerLaeuft] = useState(false);
  const [istPause, setIstPause] = useState(false);
  const [sekunden, setSekunden] = useState(arbeitsMin * 60);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const utils = trpc.useUtils();
  const logMutation = trpc.rituale.ritualLoggen.useMutation({
    onSuccess: () => utils.rituale.streakLaden.invalidate()
  });

  const spieleGong = useCallback(() => {
    try {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = 432; osc.type = "sine";
      gain.gain.setValueAtTime(0.5, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 3);
      osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 3);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (timerLaeuft) {
      intervalRef.current = setInterval(() => {
        setSekunden(prev => {
          if (prev <= 1) {
            const naechstIstPause = !istPause;
            setIstPause(naechstIstPause);
            spieleGong();
            // Pause als Ritual loggen
            if (naechstIstPause) {
              const heute = new Date().toISOString().slice(0, 10);
              logMutation.mutate({ typ: "pause", datum: heute });
            }
            if (pushAktiv && "Notification" in window && Notification.permission === "granted") {
              new Notification(naechstIstPause ? "🌿 Pause! Bewegen & frische Luft" : "🎯 Fokuszeit", {
                body: naechstIstPause ? `${pausenMin} Minuten Bewegung` : `${arbeitsMin} Minuten Fokus`,
                icon: "/favicon.ico",
              });
            }
            return naechstIstPause ? pausenMin * 60 : arbeitsMin * 60;
          }
          return prev - 1;
        });
      }, 1000);
    } else { if (intervalRef.current) clearInterval(intervalRef.current); }
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [timerLaeuft, istPause, arbeitsMin, pausenMin, pushAktiv, spieleGong, logMutation]);

  const formatZeit = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
  const gesamtSek = istPause ? pausenMin * 60 : arbeitsMin * 60;
  const fortschritt = ((gesamtSek - sekunden) / gesamtSek) * 100;

  return (
    <div className="space-y-5">
      <div className={cn("rounded-2xl p-6 text-center space-y-4 border transition-all", istPause ? "bg-teal-950/30 border-teal-700/40" : "bg-zinc-900/60 border-zinc-800")}>
        <div className="flex items-center justify-center gap-2 text-sm">
          {istPause ? (<><Wind className="w-4 h-4 text-teal-400" /><span className="text-teal-400 font-medium">PAUSE – Bewegen &amp; frische Luft</span></>) : (<><Timer className="w-4 h-4 text-zinc-400" /><span className="text-zinc-400">FOKUSZEIT</span></>)}
        </div>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="#27272a" strokeWidth="8" />
            <circle cx="60" cy="60" r="54" fill="none" stroke={istPause ? "#14b8a6" : "#f97316"} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 54}`} strokeDashoffset={`${2 * Math.PI * 54 * (1 - fortschritt / 100)}`} className="transition-all duration-1000" />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-3xl font-mono font-bold", istPause ? "text-teal-300" : "text-white")}>{formatZeit(sekunden)}</span>
          </div>
        </div>
        <div className="flex justify-center gap-3">
          <Button onClick={() => setTimerLaeuft(!timerLaeuft)} className={cn("gap-2", timerLaeuft ? "bg-zinc-700 hover:bg-zinc-600" : "bg-orange-500 hover:bg-orange-600")}>
            {timerLaeuft ? <><Pause className="w-4 h-4" /> Pausieren</> : <><Play className="w-4 h-4" /> Starten</>}
          </Button>
          <Button variant="outline" onClick={() => { setTimerLaeuft(false); setIstPause(false); setSekunden(arbeitsMin * 60); }} className="border-zinc-700 text-zinc-400 hover:bg-zinc-800 gap-2">
            <RotateCcw className="w-4 h-4" /> Reset
          </Button>
        </div>
      </div>
      <div className="space-y-4 bg-zinc-900/40 rounded-xl p-4 border border-zinc-800">
        <p className="text-xs text-zinc-500 uppercase tracking-wider">Einstellungen</p>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Fokuszeit: <span className="text-white font-medium">{arbeitsMin} min</span></label>
            <Slider value={[arbeitsMin]} onValueChange={([v]) => { setArbeitsMin(v); setSekunden(v * 60); }} min={10} max={120} step={5} />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-zinc-400">Pause: <span className="text-white font-medium">{pausenMin} min</span></label>
            <Slider value={[pausenMin]} onValueChange={([v]) => setPausenMin(v)} min={1} max={30} step={1} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1"><label className="text-xs text-zinc-500">Aktiv von</label><input type="time" value={von} onChange={e => setVon(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white" /></div>
          <div className="space-y-1"><label className="text-xs text-zinc-500">Aktiv bis</label><input type="time" value={bis} onChange={e => setBis(e.target.value)} className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-1.5 text-sm text-white" /></div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {pushAktiv ? <Bell className="w-4 h-4 text-orange-400" /> : <BellOff className="w-4 h-4 text-zinc-600" />}
            <span className="text-sm text-zinc-400">Push-Benachrichtigungen</span>
          </div>
          <div className="flex items-center gap-2">
            {!pushAktiv && <button onClick={async () => { const p = await Notification.requestPermission(); if (p === "granted") { toast.success("Aktiviert!"); setPushAktiv(true); } }} className="text-xs text-orange-400 hover:underline">Aktivieren</button>}
            <Switch checked={pushAktiv} onCheckedChange={setPushAktiv} />
          </div>
        </div>
        <Button onClick={() => onSave({ pausenTimerAktiv: true, arbeitsMinuten: arbeitsMin, pausenMinuten: pausenMin, pausenPushAktiv: pushAktiv, pausenVon: von, pausenBis: bis })} size="sm" variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 gap-2">
          <Check className="w-4 h-4" /> Einstellungen speichern
        </Button>
      </div>
    </div>
  );
}

// ─── Morgenerwachen-Wecker ────────────────────────────────────────────────────

function MorgenerwachenWecker({ einstellungen, onSave, vorname }: { einstellungen: any; onSave: (data: any) => void; vorname?: string }) {
  const [weckerAktiv, setWeckerAktiv] = useState(einstellungen?.weckerAktiv ?? false);
  const [weckzeit, setWeckzeit] = useState(einstellungen?.weckzeit ?? "06:30");
  const [weckTage, setWeckTage] = useState(einstellungen?.weckTage ?? 31);
  const [morgentext, setMorgentext] = useState(einstellungen?.morgentext ?? "");
  const [morgenMusikUrl, setMorgenMusikUrl] = useState(einstellungen?.morgenMusikUrl ?? "");
  const [morgenMusikTitel, setMorgenMusikTitel] = useState(einstellungen?.morgenMusikTitel ?? "");
  const [musikLautstaerke, setMusikLautstaerke] = useState(einstellungen?.musikLautstaerke ?? 40);
  const [maStimmeAktiv, setMaStimmeAktiv] = useState(einstellungen?.maStimmeAktiv ?? true);
  const [generiert, setGeneriert] = useState(false);
  const [musikLaedt, setMusikLaedt] = useState(false);
  const [vorschauLaeuft, setVorschauLaeuft] = useState(false);
  const musikAudioRef = useRef<HTMLAudioElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const morgenTextMutation = trpc.rituale.morgenTextGenerieren.useMutation({
    onSuccess: (data) => { setMorgentext(data.text); setGeneriert(true); }
  });
  const musikHochladenMutation = trpc.rituale.musikHochladen.useMutation({
    onSuccess: (data) => { setMorgenMusikUrl(data.url); setMorgenMusikTitel(data.titel); setMusikLaedt(false); toast.success(`"${data.titel}" hochgeladen`); },
    onError: (err) => { setMusikLaedt(false); toast.error(err.message); }
  });

  // Service-Worker registrieren und Wecker-Konfiguration senden
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/wecker-sw.js").then(reg => {
      if (reg.active) {
        reg.active.postMessage({
          type: "WECKER_KONFIGURIEREN",
          weckzeit, weckTage, aktiv: weckerAktiv
        });
      }
    }).catch(() => {});
  }, [weckerAktiv, weckzeit, weckTage]);

  const toggleTag = (bit: number) => setWeckTage((prev: number) => prev ^ (1 << bit));
  const handleMusikDatei = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    setMusikLaedt(true);
    const base64 = await new Promise<string>((resolve) => { const r = new FileReader(); r.onload = () => resolve((r.result as string).split(",")[1]); r.readAsDataURL(file); });
    musikHochladenMutation.mutate({ dateiname: file.name, mimeType: file.type, base64 });
  };
  const handleVorschau = () => {
    if (vorschauLaeuft) { musikAudioRef.current?.pause(); setVorschauLaeuft(false); return; }
    setVorschauLaeuft(true);
    if (morgenMusikUrl) { const a = new Audio(morgenMusikUrl); a.volume = musikLautstaerke / 100; musikAudioRef.current = a; a.play().catch(() => {}); a.onended = () => setVorschauLaeuft(false); }
    if (maStimmeAktiv && morgentext) setTimeout(() => toast.info("MA: \"" + morgentext.substring(0, 60) + "...\""), 2000);
  };

  return (
    <div className="space-y-5">
      <div className={cn("rounded-2xl p-5 border transition-all space-y-4", weckerAktiv ? "bg-amber-950/20 border-amber-700/40" : "bg-zinc-900/40 border-zinc-800")}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn("p-2 rounded-xl", weckerAktiv ? "bg-amber-500/20" : "bg-zinc-800")}><Sunrise className={cn("w-5 h-5", weckerAktiv ? "text-amber-400" : "text-zinc-500")} /></div>
            <div><p className="text-white font-medium">Morgenerwachen</p><p className="text-xs text-zinc-500">MA begrüßt dich mit deiner Musik</p></div>
          </div>
          <Switch checked={weckerAktiv} onCheckedChange={setWeckerAktiv} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Weckzeit</label>
            <div className="flex items-center gap-2"><AlarmClock className="w-4 h-4 text-amber-400" /><input type="time" value={weckzeit} onChange={e => setWeckzeit(e.target.value)} className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-lg font-mono text-white focus:outline-none focus:border-amber-500/50" /></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500 uppercase tracking-wider">Wochentage</label>
            <div className="flex gap-1 flex-wrap">
              {WOCHENTAGE.map(({ label, bit }) => (<button key={bit} onClick={() => toggleTag(bit)} className={cn("w-8 h-8 rounded-lg text-xs font-medium transition-all", (weckTage & (1 << bit)) !== 0 ? "bg-amber-500 text-black" : "bg-zinc-800 text-zinc-500 hover:bg-zinc-700")}>{label}</button>))}
            </div>
          </div>
        </div>
      </div>
      <div className="space-y-3 bg-zinc-900/40 rounded-xl p-4 border border-zinc-800">
        <div className="flex items-center justify-between">
          <p className="text-sm text-zinc-300 font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-400" /> Morgentext für MA</p>
          <Button size="sm" onClick={() => morgenTextMutation.mutate({ vorname })} disabled={morgenTextMutation.isPending} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-700/40 gap-2 text-xs" variant="outline">
            {morgenTextMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} MA generiert
          </Button>
        </div>
        <textarea value={morgentext} onChange={e => setMorgentext(e.target.value)} rows={4} placeholder="Schreibe deinen persönlichen Morgentext..." className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed" />
        {generiert && <p className="text-xs text-orange-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Von MA generiert – frei bearbeitbar</p>}
        <div className="flex items-center justify-between"><span className="text-xs text-zinc-500">MA-Stimme</span><Switch checked={maStimmeAktiv} onCheckedChange={setMaStimmeAktiv} /></div>
      </div>
      <div className="space-y-3 bg-zinc-900/40 rounded-xl p-4 border border-zinc-800">
        <p className="text-sm text-zinc-300 font-medium flex items-center gap-2"><Music className="w-4 h-4 text-purple-400" /> Hintergrundmusik</p>
        {morgenMusikUrl ? (
          <div className="flex items-center gap-3 bg-zinc-800/60 rounded-lg p-3">
            <Music className="w-4 h-4 text-purple-400 flex-shrink-0" />
            <div className="flex-1 min-w-0"><p className="text-sm text-white truncate">{morgenMusikTitel || "Musik"}</p><p className="text-xs text-zinc-500 truncate">{morgenMusikUrl}</p></div>
            <button onClick={() => { setMorgenMusikUrl(""); setMorgenMusikTitel(""); }} className="text-zinc-600 hover:text-red-400 transition-colors text-xs">Entfernen</button>
          </div>
        ) : (
          <div className="space-y-2">
            <button onClick={() => fileInputRef.current?.click()} disabled={musikLaedt} className="w-full border-2 border-dashed border-zinc-700 hover:border-purple-600/50 rounded-xl p-4 text-center transition-colors group">
              {musikLaedt ? (<div className="flex items-center justify-center gap-2 text-zinc-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Wird hochgeladen...</span></div>) : (<div className="space-y-1"><Upload className="w-6 h-6 text-zinc-600 group-hover:text-purple-400 mx-auto transition-colors" /><p className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Musikdatei hochladen</p><p className="text-xs text-zinc-700">MP3, WAV, OGG, M4A – max. 20 MB</p></div>)}
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleMusikDatei} />
            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-zinc-800" /><span className="text-xs text-zinc-600">oder</span><div className="flex-1 h-px bg-zinc-800" /></div>
            <input type="url" value={morgenMusikUrl} onChange={e => setMorgenMusikUrl(e.target.value)} placeholder="Musik-URL (z.B. https://...mp3)" className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50" />
          </div>
        )}
        {morgenMusikUrl && (
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Lautstärke: <span className="text-white">{musikLautstaerke}%</span></label>
            <div className="flex items-center gap-3"><Volume2 className="w-4 h-4 text-zinc-500" /><Slider value={[musikLautstaerke]} onValueChange={([v]) => setMusikLautstaerke(v)} min={0} max={100} step={5} className="flex-1" /></div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {(morgenMusikUrl || morgentext) && (<Button onClick={handleVorschau} variant="outline" className={cn("gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800", vorschauLaeuft && "border-amber-600/50 text-amber-400")}>{vorschauLaeuft ? <><Pause className="w-4 h-4" /> Stoppen</> : <><Play className="w-4 h-4" /> Vorschau</>}</Button>)}
        <Button onClick={() => onSave({ weckerAktiv, weckzeit, weckTage, morgentext, morgenMusikUrl, morgenMusikTitel, musikLautstaerke, maStimmeAktiv })} className="flex-1 bg-amber-500 hover:bg-amber-600 text-black gap-2 font-medium"><Check className="w-4 h-4" /> Wecker speichern</Button>
      </div>
    </div>
  );
}

// ─── Haupt-Komponente ─────────────────────────────────────────────────────────

export function RitualeTab({ vorname }: { vorname?: string }) {
  const [aktiveSektion, setAktiveSektion] = useState<"pause" | "morgen" | "atem" | "dankbarkeit">("dankbarkeit");
  const utils = trpc.useUtils();
  const { data: einstellungen, isLoading } = trpc.rituale.einstellungenLaden.useQuery();
  const speichernMutation = trpc.rituale.einstellungenSpeichern.useMutation({
    onSuccess: () => { utils.rituale.einstellungenLaden.invalidate(); toast.success("Ritual gespeichert ✨"); },
    onError: (err) => toast.error(err.message),
  });

  if (isLoading) return (
    <div className="flex items-center justify-center py-16 gap-3 text-zinc-500">
      <Loader2 className="w-5 h-5 animate-spin" /><span>Rituale werden geladen...</span>
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Streak-Anzeige */}
      <StreakAnzeige />

      {/* Sektions-Auswahl */}
      <div className="grid grid-cols-4 gap-1.5">
        {[
          { id: "dankbarkeit", label: "Dankbarkeit", icon: Heart, farbe: "text-rose-400", aktivBg: "bg-rose-950/30 border-rose-700/50" },
          { id: "atem", label: "Atemübung", icon: Wind, farbe: "text-teal-400", aktivBg: "bg-teal-950/30 border-teal-700/50" },
          { id: "pause", label: "Pausen", icon: Timer, farbe: "text-orange-400", aktivBg: "bg-orange-950/30 border-orange-700/50" },
          { id: "morgen", label: "Morgen", icon: Sunrise, farbe: "text-amber-400", aktivBg: "bg-amber-950/30 border-amber-700/50" },
        ].map(({ id, label, icon: Icon, farbe, aktivBg }) => (
          <button key={id} onClick={() => setAktiveSektion(id as any)}
            className={cn(
              "flex flex-col items-center gap-1 py-3 px-2 rounded-xl border text-center transition-all",
              aktiveSektion === id ? aktivBg : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700"
            )}>
            <Icon className={cn("w-4 h-4", aktiveSektion === id ? farbe : "text-zinc-600")} />
            <span className={cn("text-[10px] font-medium", aktiveSektion === id ? "text-zinc-200" : "text-zinc-600")}>{label}</span>
          </button>
        ))}
      </div>

      {/* Sektions-Inhalt */}
      {aktiveSektion === "dankbarkeit" && <DankbarkeitRitual vorname={vorname} />}
      {aktiveSektion === "atem" && <AtemUebung />}
      {aktiveSektion === "pause" && <BewegungsPausenTimer einstellungen={einstellungen} onSave={(data) => speichernMutation.mutate(data)} />}
      {aktiveSektion === "morgen" && <MorgenerwachenWecker einstellungen={einstellungen} onSave={(data) => speichernMutation.mutate(data)} vorname={vorname} />}
    </div>
  );
}
