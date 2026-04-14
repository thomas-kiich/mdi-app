import { useState, useEffect, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Play, Pause, RotateCcw, Bell, BellOff, Sunrise, Music, Sparkles, Upload, Loader2, Check, Volume2, AlarmClock, Timer, Wind } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const WOCHENTAGE = [
  { label: "Mo", bit: 0 }, { label: "Di", bit: 1 }, { label: "Mi", bit: 2 },
  { label: "Do", bit: 3 }, { label: "Fr", bit: 4 }, { label: "Sa", bit: 5 }, { label: "So", bit: 6 },
];

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
            if (pushAktiv && "Notification" in window && Notification.permission === "granted") {
              new Notification(naechstIstPause ? "Pause! Bewegen & frische Luft" : "Weiterarbeiten", {
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
  }, [timerLaeuft, istPause, arbeitsMin, pausenMin, pushAktiv, spieleGong]);

  const formatZeit = (s: number) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const gesamtSek = istPause ? pausenMin * 60 : arbeitsMin * 60;
  const fortschritt = ((gesamtSek - sekunden) / gesamtSek) * 100;

  return (
    <div className="space-y-5">
      <div className={cn("rounded-2xl p-6 text-center space-y-4 border transition-all", istPause ? "bg-teal-950/30 border-teal-700/40" : "bg-zinc-900/60 border-zinc-800")}>
        <div className="flex items-center justify-center gap-2 text-sm">
          {istPause ? (<><Wind className="w-4 h-4 text-teal-400" /><span className="text-teal-400 font-medium">PAUSE - Bewegen &amp; frische Luft</span></>) : (<><Timer className="w-4 h-4 text-zinc-400" /><span className="text-zinc-400">FOKUSZEIT</span></>)}
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
            <div><p className="text-white font-medium">Morgenerwachen</p><p className="text-xs text-zinc-500">MA begruest dich mit deiner Musik</p></div>
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
          <p className="text-sm text-zinc-300 font-medium flex items-center gap-2"><Sparkles className="w-4 h-4 text-orange-400" /> Morgentext fuer MA</p>
          <Button size="sm" onClick={() => morgenTextMutation.mutate({ vorname })} disabled={morgenTextMutation.isPending} className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-700/40 gap-2 text-xs" variant="outline">
            {morgenTextMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />} MA generiert
          </Button>
        </div>
        <textarea value={morgentext} onChange={e => setMorgentext(e.target.value)} rows={4} placeholder="Schreibe deinen persoenlichen Morgentext..." className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-orange-500/50 resize-none leading-relaxed" />
        {generiert && <p className="text-xs text-orange-400 flex items-center gap-1"><Sparkles className="w-3 h-3" /> Von MA generiert - frei bearbeitbar</p>}
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
              {musikLaedt ? (<div className="flex items-center justify-center gap-2 text-zinc-400"><Loader2 className="w-5 h-5 animate-spin" /><span className="text-sm">Wird hochgeladen...</span></div>) : (<div className="space-y-1"><Upload className="w-6 h-6 text-zinc-600 group-hover:text-purple-400 mx-auto transition-colors" /><p className="text-sm text-zinc-500 group-hover:text-zinc-300 transition-colors">Musikdatei hochladen</p><p className="text-xs text-zinc-700">MP3, WAV, OGG, M4A - max. 20 MB</p></div>)}
            </button>
            <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleMusikDatei} />
            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-zinc-800" /><span className="text-xs text-zinc-600">oder</span><div className="flex-1 h-px bg-zinc-800" /></div>
            <input type="url" value={morgenMusikUrl} onChange={e => setMorgenMusikUrl(e.target.value)} placeholder="Musik-URL (z.B. https://...mp3)" className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-purple-500/50" />
          </div>
        )}
        {morgenMusikUrl && (
          <div className="space-y-1.5">
            <label className="text-xs text-zinc-500">Lautstaerke: <span className="text-white">{musikLautstaerke}%</span></label>
            <div className="flex items-center gap-3"><Volume2 className="w-4 h-4 text-zinc-500" /><Slider value={[musikLautstaerke]} onValueChange={([v]) => setMusikLautstaerke(v)} min={0} max={100} step={5} className="flex-1" /></div>
          </div>
        )}
      </div>
      <div className="flex gap-3">
        {(morgenMusikUrl || morgentext) && (<Button onClick={handleVorschau} variant="outline" className={cn("gap-2 border-zinc-700 text-zinc-300 hover:bg-zinc-800", vorschauLaeuft && "border-amber-600/50 text-amber-400")}>{vorschauLaeuft ? <><Pause className="w-4 h-4" /> Stoppen</> : <><Play className="w-4 h-4" /> Vorschau</>}</Button>)}
        <Button onClick={() => onSave({ weckerAktiv, weckzeit, weckTage, morgentext, morgenMusikUrl, morgenMusikTitel, musikLautstaerke, maStimmeAktiv })} className="bg-amber-500 hover:bg-amber-600 text-black gap-2 font-medium"><Check className="w-4 h-4" /> Wecker speichern</Button>
      </div>
    </div>
  );
}

export function RitualeTab({ vorname }: { vorname?: string }) {
  const [aktiveSektion, setAktiveSektion] = useState<"pause" | "morgen">("pause");
  const utils = trpc.useUtils();
  const { data: einstellungen, isLoading } = trpc.rituale.einstellungenLaden.useQuery();
  const speichernMutation = trpc.rituale.einstellungenSpeichern.useMutation({
    onSuccess: () => { utils.rituale.einstellungenLaden.invalidate(); toast.success("Rituale gespeichert"); },
    onError: (err) => toast.error(err.message),
  });
  if (isLoading) return (<div className="flex items-center justify-center py-16 gap-3 text-zinc-500"><Loader2 className="w-5 h-5 animate-spin" /><span>Rituale werden geladen...</span></div>);
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3">
        <button onClick={() => setAktiveSektion("pause")} className={cn("rounded-xl p-4 border text-left transition-all space-y-1", aktiveSektion === "pause" ? "bg-orange-950/30 border-orange-700/50" : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700")}>
          <div className="flex items-center gap-2"><Timer className={cn("w-4 h-4", aktiveSektion === "pause" ? "text-orange-400" : "text-zinc-500")} /><span className={cn("text-sm font-medium", aktiveSektion === "pause" ? "text-white" : "text-zinc-400")}>Bewegungspausen</span></div>
          <p className="text-xs text-zinc-600">Alle {einstellungen?.arbeitsMinuten ?? 45} min - {einstellungen?.pausenMinuten ?? 5} min Pause</p>
        </button>
        <button onClick={() => setAktiveSektion("morgen")} className={cn("rounded-xl p-4 border text-left transition-all space-y-1", aktiveSektion === "morgen" ? "bg-amber-950/30 border-amber-700/50" : "bg-zinc-900/40 border-zinc-800 hover:border-zinc-700")}>
          <div className="flex items-center gap-2"><Sunrise className={cn("w-4 h-4", aktiveSektion === "morgen" ? "text-amber-400" : "text-zinc-500")} /><span className={cn("text-sm font-medium", aktiveSektion === "morgen" ? "text-white" : "text-zinc-400")}>Morgenerwachen</span></div>
          <p className="text-xs text-zinc-600">{einstellungen?.weckerAktiv ? `Wecker: ${einstellungen.weckzeit}` : "Wecker inaktiv"}</p>
        </button>
      </div>
      {aktiveSektion === "pause" && <BewegungsPausenTimer einstellungen={einstellungen} onSave={(data) => speichernMutation.mutate(data)} />}
      {aktiveSektion === "morgen" && <MorgenerwachenWecker einstellungen={einstellungen} onSave={(data) => speichernMutation.mutate(data)} vorname={vorname} />}
    </div>
  );
}
