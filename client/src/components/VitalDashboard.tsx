import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  TagesplanItem, TagesplanKategorie
} from '@/lib/vitals';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import {
  Trash2, Activity, Thermometer, Wind, HeartPulse, X, ArrowLeft,
  Plus, Check, Clock, Bluetooth, ChevronDown, ChevronUp, Calendar,
  BarChart2, List, Zap, Shield, ShieldOff, ShieldCheck, Info, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface VitalDashboardProps {
  onClose: () => void;
}

// ─── Kategorien-Konfiguration ────────────────────────────────────────────────
const KATEGORIEN_CONFIG: Record<TagesplanKategorie, { label: string; farbe: string; icon: string }> = {
  atemtraining:  { label: 'Atemtraining',    farbe: 'text-cyan-400',   icon: '🫁' },
  kiich_training:{ label: 'KIICH-Training',  farbe: 'text-orange-400', icon: '✨' },
  bewegung:      { label: 'Bewegung',        farbe: 'text-green-400',  icon: '🏃' },
  schlaf:        { label: 'Schlaf',          farbe: 'text-indigo-400', icon: '🌙' },
  coaching:      { label: 'Coaching',        farbe: 'text-yellow-400', icon: '🎯' },
  sonstiges:     { label: 'Sonstiges',       farbe: 'text-zinc-400',   icon: '📝' },
};

const STANDARD_ITEMS: { kategorie: TagesplanKategorie; label: string }[] = [
  { kategorie: 'atemtraining',   label: 'BT-Test (morgens)' },
  { kategorie: 'atemtraining',   label: 'Apnoe-Messung' },
  { kategorie: 'kiich_training', label: 'BT 3× 7 min' },
  { kategorie: 'kiich_training', label: 'Befindlichkeitstraining' },
  { kategorie: 'bewegung',       label: 'Bewegung 1 (frei)' },
  { kategorie: 'bewegung',       label: 'Bewegung 2 (frei)' },
  { kategorie: 'bewegung',       label: 'Bewegung 3 (frei)' },
  { kategorie: 'schlaf',         label: 'HRV-Messung (morgens)' },
];

const heute = () => new Date().toISOString().split('T')[0];

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────
const wocheVon = (datum: string) => {
  const d = new Date(datum);
  const day = d.getDay() || 7;
  d.setDate(d.getDate() - day + 1);
  return d.toISOString().split('T')[0];
};
const monatVon = (datum: string) => datum.substring(0, 7);

function groupBy<T>(arr: T[], key: (item: T) => string): Record<string, T[]> {
  return arr.reduce((acc, item) => {
    const k = key(item);
    if (!acc[k]) acc[k] = [];
    acc[k].push(item);
    return acc;
  }, {} as Record<string, T[]>);
}

function avg(nums: (number | null | undefined)[]) {
  const valid = nums.filter((n): n is number => typeof n === 'number' && n > 0);
  return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 10) / 10 : 0;
}

// ─── Polar H10 Bluetooth ─────────────────────────────────────────────────────
async function connectPolarH10(onHrv: (ms: number) => void): Promise<() => void> {
  if (!navigator.bluetooth) throw new Error('Web Bluetooth nicht unterstützt');
  const device = await navigator.bluetooth.requestDevice({
    filters: [{ namePrefix: 'Polar' }],
    optionalServices: ['heart_rate'],
  });
  const server = await device.gatt!.connect();
  const service = await server.getPrimaryService('heart_rate');
  const char = await service.getCharacteristic('heart_rate_measurement');
  const handler = (event: Event) => {
    const value = (event.target as BluetoothRemoteGATTCharacteristic).value!;
    const flags = value.getUint8(0);
    const hrFormat = flags & 0x1;
    let offset = hrFormat ? 3 : 2;
    if (flags & 0x10) offset += 2;
    const rrIntervals: number[] = [];
    while (offset + 1 < value.byteLength) {
      rrIntervals.push(value.getUint16(offset, true));
      offset += 2;
    }
    if (rrIntervals.length >= 2) {
      let sumSq = 0;
      for (let i = 1; i < rrIntervals.length; i++) {
        const diff = rrIntervals[i] - rrIntervals[i - 1];
        sumSq += diff * diff;
      }
      const rmssd = Math.round(Math.sqrt(sumSq / (rrIntervals.length - 1)));
      onHrv(rmssd);
    }
  };
  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', handler);
  return () => {
    char.removeEventListener('characteristicvaluechanged', handler);
    server.disconnect();
  };
}

// ─── Einwilligungstext ────────────────────────────────────────────────────────
const EINWILLIGUNGSTEXT = `Ich willige hiermit ausdrücklich ein, dass meine im KIICH Vitalmonitor erfassten Gesundheitsdaten (Ruhepuls, HRV, Apnoe-Werte, BOLT-Score, Körpertemperatur, Gewicht, Tagesplan und Befindlichkeitsnotizen) an meinen Coach Thomas Chochola übermittelt und von ihm im Rahmen des persönlichen Einzelcoachings eingesehen werden dürfen.

Diese Einwilligung erfolgt freiwillig auf Basis von Art. 9 Abs. 2 lit. a DSGVO. Ich kann diese Einwilligung jederzeit ohne Angabe von Gründen widerrufen. Ein Widerruf berührt nicht die Rechtmäßigkeit der bis dahin erfolgten Verarbeitung.

Die Daten werden ausschließlich für Coaching-Zwecke verwendet und nicht an Dritte weitergegeben.`;

// ─── Coaching-Einwilligungs-Modal ─────────────────────────────────────────────
const CoachingConsentModal: React.FC<{
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}> = ({ onConfirm, onCancel, isLoading }) => {
  const [confirmed, setConfirmed] = useState(false);

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-zinc-900 border border-zinc-700 rounded-2xl max-w-lg w-full p-6 space-y-5"
      >
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-orange-400 shrink-0" />
          <h3 className="text-lg font-semibold text-white">Coaching-Modus aktivieren</h3>
        </div>

        <div className="bg-zinc-800/60 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider">DSGVO Art. 9 – Einwilligungserklärung</p>
          <p className="text-sm text-zinc-300 leading-relaxed whitespace-pre-line">{EINWILLIGUNGSTEXT}</p>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={confirmed}
            onChange={e => setConfirmed(e.target.checked)}
            className="mt-0.5 w-4 h-4 accent-orange-500 shrink-0"
          />
          <span className="text-sm text-zinc-300">
            Ich habe die Einwilligungserklärung gelesen und stimme der Verarbeitung meiner Gesundheitsdaten durch meinen Coach zu.
          </span>
        </label>

        <div className="flex gap-3 justify-end">
          <Button variant="ghost" onClick={onCancel} disabled={isLoading} className="text-zinc-400 hover:text-white">
            Abbrechen
          </Button>
          <Button
            onClick={onConfirm}
            disabled={!confirmed || isLoading}
            className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Einwilligung erteilen
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export const VitalDashboard: React.FC<VitalDashboardProps> = ({ onClose }) => {
  const { user } = useAuth();
  const utils = trpc.useUtils();

  const [activeTab, setActiveTab] = useState<'heute' | 'statistik' | 'verlauf' | 'coaching'>('heute');
  const [statsZeitraum, setStatsZeitraum] = useState<'woche' | 'monat'>('woche');
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showConsentModal, setShowConsentModal] = useState(false);
  const [polarConnected, setPolarConnected] = useState(false);
  const [polarDisconnect, setPolarDisconnect] = useState<(() => void) | null>(null);
  const [liveHrv, setLiveHrv] = useState<number | null>(null);

  // Tagesplan-State (lokal, wird mit DB synchronisiert)
  const [tagesplan, setTagesplan] = useState<{ datum: string; items: TagesplanItem[] }>({ datum: heute(), items: [] });

  // Formular-State
  const [bolt, setBolt]         = useState('');
  const [temp, setTemp]         = useState('');
  const [hrv, setHrv]           = useState('');
  const [ruhepuls, setRuhepuls] = useState('');
  const [apnoeAus, setApnoeAus] = useState('');
  const [apnoeEin, setApnoeEin] = useState('');
  const [gewicht, setGewicht]   = useState('');
  const [mood, setMood]         = useState(5);
  const [notes, setNotes]       = useState('');

  // Neues Tagesplan-Item
  const [newKat, setNewKat]     = useState<TagesplanKategorie>('kiich_training');
  const [newLabel, setNewLabel] = useState('');

  // ─── tRPC Queries ───────────────────────────────────────────────────────────
  const { data: eintraege = [], isLoading: isLoadingEintraege } = trpc.vital.getMyEintraege.useQuery(
    { limit: 90 },
    { enabled: !!user }
  );

  const heuteDatum = useMemo(() => heute(), []);

  const { data: heutigerEintrag, isLoading: isLoadingHeute } = trpc.vital.getEintragByDatum.useQuery(
    { datum: heuteDatum },
    { enabled: !!user }
  );

  // Coach-ID: Thomas ist der Owner/Admin – wir lesen seine ID aus dem Profil
  // Fallback: wenn user.id === coachId, dann ist man selbst der Coach
  // Für Tamino: coachId muss Thomas' userId sein
  // Wir nutzen einen festen Wert aus der Umgebung – da wir die ID nicht direkt kennen,
  // fragen wir den Status mit coachId=0 ab und zeigen den Opt-in nur für Nicht-Admins
  const isAdmin = user?.role === 'admin';

  // Coaching-Status (nur für nicht-Admins relevant)
  // coachId wird vom Server aus dem OWNER_OPEN_ID aufgelöst – wir nutzen coachId=1 als Platzhalter
  // und der Server gibt den richtigen Status zurück
  const { data: coachingStatus, isLoading: isLoadingCoaching } = trpc.vital.getMyCoachingStatus.useQuery(
    { coachId: -1 }, // -1 = "finde den Owner-Coach automatisch" – wird im Router aufgelöst
    { enabled: !!user && !isAdmin }
  );

  // ─── tRPC Mutations ─────────────────────────────────────────────────────────
  const saveEintrag = trpc.vital.saveEintrag.useMutation({
    onSuccess: () => {
      utils.vital.getMyEintraege.invalidate();
      utils.vital.getEintragByDatum.invalidate({ datum: heuteDatum });
      toast.success('Vitalwerte gespeichert.');
      setShowVitalForm(false);
      setBolt(''); setTemp(''); setHrv(''); setRuhepuls('');
      setApnoeAus(''); setApnoeEin(''); setGewicht(''); setMood(5); setNotes('');
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const activateCoaching = trpc.vital.activateCoachingMode.useMutation({
    onSuccess: () => {
      utils.vital.getMyCoachingStatus.invalidate();
      setShowConsentModal(false);
      toast.success('Coaching-Modus aktiviert. Thomas kann jetzt deine Vitalwerte sehen.');
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  const revokeCoaching = trpc.vital.revokeCoachingMode.useMutation({
    onSuccess: () => {
      utils.vital.getMyCoachingStatus.invalidate();
      toast.success('Einwilligung widerrufen. Thomas hat keinen Zugriff mehr auf deine Daten.');
    },
    onError: (err) => toast.error(`Fehler: ${err.message}`),
  });

  // ─── Tagesplan aus heutigem Eintrag laden ───────────────────────────────────
  useEffect(() => {
    if (heutigerEintrag?.tagesplan) {
      try {
        const parsed = JSON.parse(heutigerEintrag.tagesplan);
        setTagesplan({ datum: heuteDatum, items: parsed });
      } catch {
        initDefaultTagesplan();
      }
    } else if (!isLoadingHeute) {
      initDefaultTagesplan();
    }
  }, [heutigerEintrag, isLoadingHeute, heuteDatum]);

  function initDefaultTagesplan() {
    const defaults: TagesplanItem[] = STANDARD_ITEMS.map(s => ({
      id: crypto.randomUUID(),
      kategorie: s.kategorie,
      label: s.label,
      geplant: true,
      durchgefuehrt: false,
    }));
    setTagesplan({ datum: heuteDatum, items: defaults });
  }

  // Live-HRV vom Polar H10 in Formular übernehmen
  useEffect(() => {
    if (liveHrv !== null) setHrv(String(liveHrv));
  }, [liveHrv]);

  // ─── Tagesplan speichern (Debounce via Mutation) ────────────────────────────
  const saveTagesplanToDB = useCallback((items: TagesplanItem[]) => {
    // Wir speichern den Tagesplan als Teil des Vital-Eintrags
    saveEintrag.mutate({
      datum: heuteDatum,
      ruhepuls: heutigerEintrag?.ruhepuls ?? null,
      hrv: heutigerEintrag?.hrv ?? null,
      apnoeAus: heutigerEintrag?.apnoeAus ?? null,
      apnoeEin: heutigerEintrag?.apnoeEin ?? null,
      bolt: heutigerEintrag?.bolt ?? null,
      temperatur: heutigerEintrag?.temperatur ?? null,
      gewicht: heutigerEintrag?.gewicht ?? null,
      anmerkungen: heutigerEintrag?.anmerkungen ?? null,
      tagesplan: JSON.stringify(items),
    });
  }, [heuteDatum, heutigerEintrag, saveEintrag]);

  // ─── Vital-Formular absenden ─────────────────────────────────────────────────
  const handleVitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolt && !temp && !hrv && !ruhepuls && !apnoeAus && !apnoeEin && !gewicht) {
      toast.error('Bitte mindestens einen Wert eingeben.');
      return;
    }
    saveEintrag.mutate({
      datum: heuteDatum,
      ruhepuls: Number(ruhepuls) || null,
      hrv: Number(hrv) || null,
      apnoeAus: apnoeAus || null,
      apnoeEin: apnoeEin || null,
      bolt: Number(bolt) || null,
      temperatur: temp || null,
      gewicht: gewicht || null,
      anmerkungen: notes || null,
      tagesplan: JSON.stringify(tagesplan.items),
    });
  };

  // ─── Tagesplan-Aktionen ──────────────────────────────────────────────────────
  const toggleDurchgefuehrt = useCallback((itemId: string) => {
    setTagesplan(prev => {
      const updated = { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, durchgefuehrt: !i.durchgefuehrt } : i) };
      saveTagesplanToDB(updated.items);
      return updated;
    });
  }, [saveTagesplanToDB]);

  const toggleGeplant = useCallback((itemId: string) => {
    setTagesplan(prev => {
      const updated = { ...prev, items: prev.items.map(i => i.id === itemId ? { ...i, geplant: !i.geplant } : i) };
      saveTagesplanToDB(updated.items);
      return updated;
    });
  }, [saveTagesplanToDB]);

  const addTagesplanItem = () => {
    if (!newLabel.trim()) return;
    const item: TagesplanItem = {
      id: crypto.randomUUID(),
      kategorie: newKat,
      label: newLabel.trim(),
      geplant: true,
      durchgefuehrt: false,
    };
    const updated = { ...tagesplan, items: [...tagesplan.items, item] };
    setTagesplan(updated);
    saveTagesplanToDB(updated.items);
    setNewLabel('');
    setShowAddItem(false);
  };

  const deleteTagesplanItem = (itemId: string) => {
    const updated = { ...tagesplan, items: tagesplan.items.filter(i => i.id !== itemId) };
    setTagesplan(updated);
    saveTagesplanToDB(updated.items);
  };

  // ─── Polar H10 ───────────────────────────────────────────────────────────────
  const connectPolar = async () => {
    try {
      toast.info('Suche Polar H10...');
      const disconnect = await connectPolarH10((ms) => setLiveHrv(ms));
      setPolarDisconnect(() => disconnect);
      setPolarConnected(true);
      toast.success('Polar H10 verbunden! HRV wird live gemessen.');
    } catch (err: any) {
      toast.error(`Verbindung fehlgeschlagen: ${err.message}`);
    }
  };

  const disconnectPolar = () => {
    polarDisconnect?.();
    setPolarConnected(false);
    setPolarDisconnect(null);
    setLiveHrv(null);
    toast.info('Polar H10 getrennt.');
  };

  // ─── Statistik-Daten ─────────────────────────────────────────────────────────
  const statsData = useMemo(() => {
    const sorted = [...eintraege].sort((a, b) => a.datum.localeCompare(b.datum));
    const grouped = statsZeitraum === 'woche'
      ? groupBy(sorted, e => wocheVon(e.datum))
      : groupBy(sorted, e => monatVon(e.datum));

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        label: statsZeitraum === 'woche'
          ? `KW ${new Date(key).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`
          : new Date(key + '-01').toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        bolt:     avg(vals.map(v => v.bolt)),
        hrv:      avg(vals.map(v => v.hrv)),
        ruhepuls: avg(vals.map(v => v.ruhepuls)),
        apnoeAus: avg(vals.map(v => v.apnoeAus ? parseFloat(v.apnoeAus) : 0)),
        apnoeEin: avg(vals.map(v => v.apnoeEin ? parseFloat(v.apnoeEin) : 0)),
        anzahl:   vals.length,
      }));
  }, [eintraege, statsZeitraum]);

  const chartData = useMemo(() =>
    [...eintraege]
      .sort((a, b) => a.datum.localeCompare(b.datum))
      .map(e => ({
        ...e,
        displayDate: new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        boltNum: e.bolt ?? 0,
        hrvNum: e.hrv ?? 0,
        ruhepulsNum: e.ruhepuls ?? 0,
        apnoeAusNum: e.apnoeAus ? parseFloat(e.apnoeAus) : 0,
        apnoeEinNum: e.apnoeEin ? parseFloat(e.apnoeEin) : 0,
      })),
    [eintraege]
  );

  const letzterEintrag = heutigerEintrag;
  const geplantCount = tagesplan.items.filter(i => i.geplant).length;
  const durchgefuehrtCount = tagesplan.items.filter(i => i.durchgefuehrt).length;

  const tabs = [
    { id: 'heute',    icon: <Calendar className="w-4 h-4" />,    label: 'Heute' },
    { id: 'statistik',icon: <BarChart2 className="w-4 h-4" />,   label: 'Statistik' },
    { id: 'verlauf',  icon: <List className="w-4 h-4" />,         label: 'Verlauf' },
    ...(!isAdmin ? [{ id: 'coaching', icon: <Shield className="w-4 h-4" />, label: 'Coaching' }] : []),
  ] as const;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden text-white">
      {/* Consent Modal */}
      <AnimatePresence>
        {showConsentModal && (
          <CoachingConsentModal
            onConfirm={() => activateCoaching.mutate({ coachId: -1 })}
            onCancel={() => setShowConsentModal(false)}
            isLoading={activateCoaching.isPending}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={onClose} className="text-zinc-400 hover:text-white p-0 hover:bg-transparent">
            <ArrowLeft className="mr-1 h-5 w-5" />
            <span className="hidden sm:inline">ZUR HAUPTSEITE</span>
          </Button>
          <h2 className="text-xl md:text-2xl font-light tracking-wider flex items-center gap-2">
            <Activity className="w-5 h-5 text-orange-500" />
            VITAL MONITOR
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={polarConnected ? disconnectPolar : connectPolar}
            className={`text-xs gap-1 ${polarConnected ? 'border-blue-500 text-blue-400' : 'border-zinc-700 text-zinc-400'}`}
          >
            <Bluetooth className="w-3 h-3" />
            {polarConnected ? `Polar ● ${liveHrv ? liveHrv + 'ms' : '…'}` : 'Polar H10'}
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-white/10 shrink-0 overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-orange-500 text-orange-400'
                : 'border-transparent text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {tab.icon}{tab.label}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-6 max-w-7xl mx-auto w-full">

        {/* ─── TAB: HEUTE ─────────────────────────────────────────────────── */}
        {activeTab === 'heute' && (
          <div className="space-y-6">
            {/* Schnellübersicht heutige Werte */}
            {letzterEintrag && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { label: 'Ruhepuls', value: letzterEintrag.ruhepuls ? `${letzterEintrag.ruhepuls} bpm` : '–', color: 'text-pink-400' },
                  { label: 'HRV', value: letzterEintrag.hrv ? `${letzterEintrag.hrv} ms` : '–', color: 'text-red-400' },
                  { label: 'BOLT', value: letzterEintrag.bolt ? `${letzterEintrag.bolt} s` : '–', color: 'text-orange-400' },
                  { label: 'Apnoe aus', value: letzterEintrag.apnoeAus ? `${letzterEintrag.apnoeAus} min` : '–', color: 'text-cyan-400' },
                  { label: 'Apnoe ein', value: letzterEintrag.apnoeEin ? `${letzterEintrag.apnoeEin} min` : '–', color: 'text-teal-400' },
                  { label: 'Temp', value: letzterEintrag.temperatur ? `${letzterEintrag.temperatur}°C` : '–', color: 'text-blue-400' },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                    <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{item.label}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Vital-Werte erfassen */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Vitalwerte erfassen</h3>
                <Button size="sm" onClick={() => setShowVitalForm(!showVitalForm)} className="bg-orange-500 hover:bg-orange-600 text-white text-xs">
                  {showVitalForm ? 'Abbrechen' : letzterEintrag ? '✏️ Aktualisieren' : '+ Neuer Eintrag'}
                </Button>
              </div>

              <AnimatePresence>
                {showVitalForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-5">
                        <form onSubmit={handleVitalSubmit} className="space-y-4">
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-pink-400 text-xs">
                                <HeartPulse className="w-3.5 h-3.5" /> Ruhepuls (bpm)
                              </Label>
                              <Input type="number" value={ruhepuls} onChange={e => setRuhepuls(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 58"
                                defaultValue={letzterEintrag?.ruhepuls ?? ''} />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-red-400 text-xs">
                                <Zap className="w-3.5 h-3.5" /> HRV (ms)
                                {polarConnected && <span className="text-blue-400 text-xs">● live</span>}
                              </Label>
                              <Input type="number" value={hrv} onChange={e => setHrv(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 65" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-cyan-400 text-xs">
                                <Wind className="w-3.5 h-3.5" /> Apnoe AUS (min)
                              </Label>
                              <Input type="number" step="0.1" value={apnoeAus} onChange={e => setApnoeAus(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 2.5" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-teal-400 text-xs">
                                <Wind className="w-3.5 h-3.5" /> Apnoe EIN (min)
                              </Label>
                              <Input type="number" step="0.1" value={apnoeEin} onChange={e => setApnoeEin(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 1.5" />
                            </div>
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-orange-400 text-xs">
                                <Wind className="w-3.5 h-3.5" /> BOLT (sek)
                              </Label>
                              <Input type="number" value={bolt} onChange={e => setBolt(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 25" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-blue-400 text-xs">
                                <Thermometer className="w-3.5 h-3.5" /> Temp (°C)
                              </Label>
                              <Input type="number" step="0.1" value={temp} onChange={e => setTemp(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 36.6" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-green-400 text-xs">
                                Gewicht (kg)
                              </Label>
                              <Input type="number" step="0.1" value={gewicht} onChange={e => setGewicht(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 78.5" />
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-zinc-400 text-xs">Stimmung (1–10): {mood}</Label>
                              <div className="flex items-center gap-3 h-9">
                                <span className="text-xs text-zinc-600">1</span>
                                <Slider value={[mood]} onValueChange={v => setMood(v[0])} max={10} min={1} step={1} className="flex-1" />
                                <span className="text-xs text-zinc-600">10</span>
                              </div>
                            </div>
                          </div>
                          <div className="space-y-1.5">
                            <Label className="text-zinc-400 text-xs">Befindlichkeit / Auffälligkeiten / Anmerkungen</Label>
                            <textarea
                              value={notes}
                              onChange={e => setNotes(e.target.value)}
                              placeholder="Wie fühlst du dich heute? Besonderheiten, Auffälligkeiten, Gedanken..."
                              rows={3}
                              className="w-full bg-black/50 border border-white/20 rounded-md px-3 py-2 text-sm text-white placeholder:text-zinc-600 resize-none focus:outline-none focus:ring-1 focus:ring-orange-500"
                            />
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" disabled={saveEintrag.isPending} className="bg-white text-black hover:bg-white/90 gap-2">
                              {saveEintrag.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                              Speichern
                            </Button>
                          </div>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Tagesplaner */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Tagesplaner</h3>
                  <span className="text-xs text-zinc-600">{durchgefuehrtCount}/{geplantCount} erledigt</span>
                  {geplantCount > 0 && (
                    <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(durchgefuehrtCount / geplantCount) * 100}%` }} />
                    </div>
                  )}
                </div>
                <Button size="sm" variant="ghost" onClick={() => setShowAddItem(!showAddItem)}
                  className="text-zinc-400 hover:text-white text-xs gap-1">
                  <Plus className="w-3.5 h-3.5" /> Hinzufügen
                </Button>
              </div>

              <AnimatePresence>
                {showAddItem && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-3">
                    <div className="flex gap-2 p-3 bg-white/5 rounded-xl border border-white/10">
                      <select value={newKat} onChange={e => setNewKat(e.target.value as TagesplanKategorie)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2 py-1.5 text-sm">
                        {Object.entries(KATEGORIEN_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                      <Input value={newLabel} onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTagesplanItem()}
                        placeholder="Beschreibung..." className="bg-black/50 border-white/20 text-white flex-1 h-9" />
                      <Button size="sm" onClick={addTagesplanItem} className="bg-orange-500 hover:bg-orange-600 text-white">
                        <Check className="w-4 h-4" />
                      </Button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                {Object.entries(KATEGORIEN_CONFIG).map(([kat, cfg]) => {
                  const items = tagesplan.items.filter(i => i.kategorie === kat);
                  if (items.length === 0) return null;
                  return (
                    <div key={kat}>
                      <div className={`text-xs font-semibold ${cfg.farbe} mb-1.5 flex items-center gap-1`}>
                        <span>{cfg.icon}</span> {cfg.label}
                      </div>
                      <div className="space-y-1.5 pl-4">
                        {items.map(item => (
                          <div key={item.id} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg border border-white/5 group">
                            <button onClick={() => toggleGeplant(item.id)}
                              className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                item.geplant ? 'border-zinc-500 bg-zinc-700' : 'border-zinc-700 bg-transparent'
                              }`} title="Geplant">
                              {item.geplant && <div className="w-2 h-2 rounded-sm bg-zinc-400" />}
                            </button>
                            <span className={`flex-1 text-sm ${item.durchgefuehrt ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                              {item.label}
                            </span>
                            <button onClick={() => toggleDurchgefuehrt(item.id)}
                              className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                                item.durchgefuehrt ? 'bg-green-500 text-white' : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                              }`} title="Als erledigt markieren">
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => deleteTagesplanItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
                {tagesplan.items.length === 0 && (
                  <div className="text-center py-8 text-zinc-600 text-sm border border-dashed border-zinc-800 rounded-xl">
                    Noch keine Einträge. Füge dein erstes Tagesplan-Item hinzu.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB: STATISTIK ─────────────────────────────────────────────── */}
        {activeTab === 'statistik' && (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <span className="text-sm text-zinc-400">Zeitraum:</span>
              {(['woche', 'monat'] as const).map(z => (
                <button key={z} onClick={() => setStatsZeitraum(z)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    statsZeitraum === z ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}>
                  {z === 'woche' ? 'Wöchentlich' : 'Monatlich'}
                </button>
              ))}
            </div>

            {isLoadingEintraege ? (
              <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-zinc-600" /></div>
            ) : statsData.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                Noch keine Daten für die Statistik. Erfasse zuerst einige Werte.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-sm font-light text-zinc-400">Atemwerte – BOLT & Apnoe (Ø)</CardTitle></CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                        <Bar dataKey="bolt"     fill="#f97316" name="BOLT (s)"        radius={[3,3,0,0]} />
                        <Bar dataKey="apnoeAus" fill="#06b6d4" name="Apnoe AUS (min)" radius={[3,3,0,0]} />
                        <Bar dataKey="apnoeEin" fill="#14b8a6" name="Apnoe EIN (min)" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-sm font-light text-zinc-400">Herzwerte – HRV & Ruhepuls (Ø)</CardTitle></CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="hrv"      stroke="#ef4444" strokeWidth={2} name="HRV (ms)"      dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="ruhepuls" stroke="#ec4899" strokeWidth={2} name="Ruhepuls (bpm)" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}

        {/* ─── TAB: VERLAUF ───────────────────────────────────────────────── */}
        {activeTab === 'verlauf' && (
          <div className="space-y-6">
            {chartData.length > 1 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-sm font-light text-zinc-400">Atemwerte täglich</CardTitle></CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="displayDate" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="boltNum"     stroke="#f97316" strokeWidth={2} name="BOLT (s)"        dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="apnoeAusNum" stroke="#06b6d4" strokeWidth={2} name="Apnoe AUS (min)" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="apnoeEinNum" stroke="#14b8a6" strokeWidth={2} name="Apnoe EIN (min)" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                <Card className="bg-white/5 border-white/10">
                  <CardHeader><CardTitle className="text-sm font-light text-zinc-400">Herzwerte täglich</CardTitle></CardHeader>
                  <CardContent className="h-[260px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="displayDate" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Legend />
                        <Line type="monotone" dataKey="hrvNum"      stroke="#ef4444" strokeWidth={2} name="HRV (ms)"       dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="ruhepulsNum" stroke="#ec4899" strokeWidth={2} name="Ruhepuls (bpm)" dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Alle Einträge</h3>
              {isLoadingEintraege ? (
                <div className="flex items-center justify-center py-16"><Loader2 className="w-8 h-8 animate-spin text-zinc-600" /></div>
              ) : eintraege.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                  Noch keine Daten. Starte mit deinem ersten Eintrag!
                </div>
              ) : (
                [...eintraege].reverse().map(entry => (
                  <div key={entry.id} className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-mono text-xs">{entry.datum}</div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {entry.ruhepuls  && <span className="text-pink-400">Ruhepuls: <b>{entry.ruhepuls} bpm</b></span>}
                        {entry.hrv       && <span className="text-red-400">HRV: <b>{entry.hrv} ms</b></span>}
                        {entry.bolt      && <span className="text-orange-400">BOLT: <b>{entry.bolt} s</b></span>}
                        {entry.apnoeAus  && <span className="text-cyan-400">Apnoe AUS: <b>{entry.apnoeAus} min</b></span>}
                        {entry.apnoeEin  && <span className="text-teal-400">Apnoe EIN: <b>{entry.apnoeEin} min</b></span>}
                        {entry.temperatur && <span className="text-blue-400">Temp: <b>{entry.temperatur}°C</b></span>}
                        {entry.gewicht   && <span className="text-green-400">Gewicht: <b>{entry.gewicht} kg</b></span>}
                      </div>
                      {entry.anmerkungen && (
                        <div className="text-xs text-zinc-500 italic mt-1 border-l-2 border-zinc-700 pl-2">{entry.anmerkungen}</div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB: COACHING ──────────────────────────────────────────────── */}
        {activeTab === 'coaching' && !isAdmin && (
          <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <Shield className="w-5 h-5 text-orange-400" />
                Coaching-Modus
              </h3>
              <p className="text-sm text-zinc-400">
                Wenn du den Coaching-Modus aktivierst, kann dein Coach Thomas Chochola deine Vitalwerte im Coaching-Dashboard einsehen.
                Dies ist die Grundlage für datenbasiertes Einzelcoaching.
              </p>
            </div>

            {isLoadingCoaching ? (
              <div className="flex items-center gap-2 text-zinc-500"><Loader2 className="w-4 h-4 animate-spin" /> Lade Status...</div>
            ) : coachingStatus?.isActive ? (
              <Card className="bg-green-500/10 border-green-500/30">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-6 h-6 text-green-400" />
                    <div>
                      <p className="text-sm font-semibold text-green-400">Coaching-Modus aktiv</p>
                      <p className="text-xs text-zinc-400">
                        Eingewilligt am {coachingStatus.einwilligung
                          ? new Date(coachingStatus.einwilligung.eingewilligtAtMs).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' })
                          : '–'}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Thomas Chochola hat Zugriff auf deine Vitalwerte. Du kannst die Einwilligung jederzeit widerrufen.
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => revokeCoaching.mutate({ coachId: -1 })}
                    disabled={revokeCoaching.isPending}
                    className="border-red-500/50 text-red-400 hover:bg-red-500/10 gap-2"
                  >
                    {revokeCoaching.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                    <ShieldOff className="w-3.5 h-3.5" />
                    Einwilligung widerrufen
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Shield className="w-6 h-6 text-zinc-500" />
                    <div>
                      <p className="text-sm font-semibold text-zinc-300">Coaching-Modus inaktiv</p>
                      <p className="text-xs text-zinc-500">Deine Daten sind privat und nur für dich sichtbar.</p>
                    </div>
                  </div>

                  <div className="bg-zinc-800/50 rounded-xl p-4 space-y-2">
                    <p className="text-xs font-semibold text-orange-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" /> Was wird geteilt?
                    </p>
                    <ul className="text-xs text-zinc-400 space-y-1 list-disc list-inside">
                      <li>Ruhepuls, HRV, BOLT-Score</li>
                      <li>Apnoe-Werte (AUS & EIN)</li>
                      <li>Körpertemperatur & Gewicht</li>
                      <li>Tagesplan (Plan vs. Durchgeführt)</li>
                      <li>Befindlichkeitsnotizen</li>
                    </ul>
                  </div>

                  <Button
                    onClick={() => setShowConsentModal(true)}
                    className="bg-orange-500 hover:bg-orange-600 text-white gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Coaching-Modus aktivieren
                  </Button>
                  <p className="text-xs text-zinc-600">
                    Durch Aktivierung erteilst du eine explizite Einwilligung gemäß DSGVO Art. 9 Abs. 2 lit. a.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

      </div>

      {/* Disclaimer */}
      <div className="shrink-0 px-6 py-2 border-t border-white/5 text-center">
        <p className="text-zinc-700 text-xs">KIICH ist kein Medizinprodukt und ersetzt keine ärztliche Beratung. Die Werte dienen der persönlichen Orientierung.</p>
      </div>
    </div>
  );
};
