import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  getVitals, saveVital, deleteVital, VitalEntry,
  getTagesplan, saveTagesplan, Tagesplan, TagesplanItem, TagesplanKategorie
} from '@/lib/vitals';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';
import {
  Trash2, Activity, Thermometer, Wind, HeartPulse, X, ArrowLeft,
  Plus, Check, Clock, Bluetooth, ChevronDown, ChevronUp, Calendar,
  BarChart2, List, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

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
  { kategorie: 'bewegung',       label: 'Bewegung / Sport' },
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

function avg(nums: number[]) {
  const valid = nums.filter(n => n > 0);
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
    // RR-Intervalle (ms) ab Byte 2 oder 3
    let offset = hrFormat ? 3 : 2;
    if (flags & 0x10) {
      // Energie vorhanden – überspringen
      offset += 2;
    }
    if (flags & 0x10) offset += 2;
    const rrIntervals: number[] = [];
    while (offset + 1 < value.byteLength) {
      rrIntervals.push(value.getUint16(offset, true));
      offset += 2;
    }
    if (rrIntervals.length > 0) {
      // RMSSD aus den RR-Intervallen berechnen
      if (rrIntervals.length >= 2) {
        let sumSq = 0;
        for (let i = 1; i < rrIntervals.length; i++) {
          const diff = rrIntervals[i] - rrIntervals[i - 1];
          sumSq += diff * diff;
        }
        const rmssd = Math.round(Math.sqrt(sumSq / (rrIntervals.length - 1)));
        onHrv(rmssd);
      }
    }
  };

  await char.startNotifications();
  char.addEventListener('characteristicvaluechanged', handler);

  return () => {
    char.removeEventListener('characteristicvaluechanged', handler);
    server.disconnect();
  };
}

// ─── Hauptkomponente ─────────────────────────────────────────────────────────
export const VitalDashboard: React.FC<VitalDashboardProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'heute' | 'statistik' | 'verlauf'>('heute');
  const [statsZeitraum, setStatsZeitraum] = useState<'woche' | 'monat'>('woche');
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [tagesplan, setTagesplan] = useState<Tagesplan>({ datum: heute(), items: [] });
  const [showVitalForm, setShowVitalForm] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [polarConnected, setPolarConnected] = useState(false);
  const [polarDisconnect, setPolarDisconnect] = useState<(() => void) | null>(null);
  const [liveHrv, setLiveHrv] = useState<number | null>(null);

  // Formular-State
  const [bolt, setBolt]           = useState('');
  const [temp, setTemp]           = useState('');
  const [hrv, setHrv]             = useState('');
  const [ruhepuls, setRuhepuls]   = useState('');
  const [apnoeAus, setApnoeAus]   = useState('');
  const [apnoeEin, setApnoeEin]   = useState('');
  const [mood, setMood]           = useState(5);
  const [notes, setNotes]         = useState('');

  // Neues Tagesplan-Item
  const [newKat, setNewKat]       = useState<TagesplanKategorie>('kiich_training');
  const [newLabel, setNewLabel]   = useState('');

  useEffect(() => {
    setEntries(getVitals().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    const plan = getTagesplan(heute());
    // Wenn noch keine Items, Standard-Items als "geplant" vorbelegen
    if (plan.items.length === 0) {
      const defaults: TagesplanItem[] = STANDARD_ITEMS.map(s => ({
        id: crypto.randomUUID(),
        kategorie: s.kategorie,
        label: s.label,
        geplant: true,
        durchgefuehrt: false,
      }));
      const newPlan = { datum: heute(), items: defaults };
      saveTagesplan(newPlan);
      setTagesplan(newPlan);
    } else {
      setTagesplan(plan);
    }
  }, []);

  // Live-HRV vom Polar H10 in Formular übernehmen
  useEffect(() => {
    if (liveHrv !== null) setHrv(String(liveHrv));
  }, [liveHrv]);

  const handleVitalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolt && !temp && !hrv && !ruhepuls && !apnoeAus && !apnoeEin) {
      toast.error('Bitte mindestens einen Wert eingeben.');
      return;
    }
    const newEntry = saveVital({
      date: new Date().toISOString(),
      bolt: Number(bolt) || 0,
      temperature: Number(temp) || 0,
      hrv: Number(hrv) || 0,
      hrvSource: polarConnected ? 'polar_h10' : 'manual',
      ruhepuls: Number(ruhepuls) || 0,
      apnoeAus: Number(apnoeAus) || 0,
      apnoeEin: Number(apnoeEin) || 0,
      mood,
      notes,
    });
    setEntries(prev => [...prev, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setShowVitalForm(false);
    setBolt(''); setTemp(''); setHrv(''); setRuhepuls('');
    setApnoeAus(''); setApnoeEin(''); setMood(5); setNotes('');
    toast.success('Werte gespeichert.');
  };

  const handleDelete = (id: string) => {
    deleteVital(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  const toggleDurchgefuehrt = useCallback((itemId: string) => {
    setTagesplan(prev => {
      const updated = {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, durchgefuehrt: !i.durchgefuehrt } : i),
      };
      saveTagesplan(updated);
      return updated;
    });
  }, []);

  const toggleGeplant = useCallback((itemId: string) => {
    setTagesplan(prev => {
      const updated = {
        ...prev,
        items: prev.items.map(i => i.id === itemId ? { ...i, geplant: !i.geplant } : i),
      };
      saveTagesplan(updated);
      return updated;
    });
  }, []);

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
    saveTagesplan(updated);
    setTagesplan(updated);
    setNewLabel('');
    setShowAddItem(false);
  };

  const deleteTagesplanItem = (itemId: string) => {
    const updated = { ...tagesplan, items: tagesplan.items.filter(i => i.id !== itemId) };
    saveTagesplan(updated);
    setTagesplan(updated);
  };

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

  // ─── Statistik-Daten ────────────────────────────────────────────────────────
  const statsData = (() => {
    const grouped = statsZeitraum === 'woche'
      ? groupBy(entries, e => wocheVon(e.date.split('T')[0]))
      : groupBy(entries, e => monatVon(e.date.split('T')[0]));

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, vals]) => ({
        label: statsZeitraum === 'woche'
          ? `KW ${new Date(key).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })}`
          : new Date(key + '-01').toLocaleDateString('de-DE', { month: 'short', year: '2-digit' }),
        bolt:      avg(vals.map(v => v.bolt)),
        hrv:       avg(vals.map(v => v.hrv)),
        ruhepuls:  avg(vals.map(v => v.ruhepuls)),
        apnoeAus:  avg(vals.map(v => v.apnoeAus)),
        apnoeEin:  avg(vals.map(v => v.apnoeEin)),
        mood:      avg(vals.map(v => v.mood)),
        anzahl:    vals.length,
      }));
  })();

  const chartData = entries.map(e => ({
    ...e,
    displayDate: new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
  }));

  // Heutige Einträge
  const heuteStr = heute();
  const heutigeEintraege = entries.filter(e => e.date.startsWith(heuteStr));
  const letzterEintrag = heutigeEintraege[heutigeEintraege.length - 1];

  const geplantCount = tagesplan.items.filter(i => i.geplant).length;
  const durchgefuehrtCount = tagesplan.items.filter(i => i.durchgefuehrt).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden text-white">
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
          {/* Polar H10 */}
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
      <div className="flex border-b border-white/10 shrink-0">
        {([
          { id: 'heute',    icon: <Calendar className="w-4 h-4" />,  label: 'Heute' },
          { id: 'statistik',icon: <BarChart2 className="w-4 h-4" />, label: 'Statistik' },
          { id: 'verlauf',  icon: <List className="w-4 h-4" />,      label: 'Verlauf' },
        ] as const).map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors border-b-2 ${
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
                  { label: 'Ruhepuls', value: letzterEintrag.ruhepuls > 0 ? `${letzterEintrag.ruhepuls} bpm` : '–', color: 'text-pink-400' },
                  { label: 'HRV', value: letzterEintrag.hrv > 0 ? `${letzterEintrag.hrv} ms` : '–', color: 'text-red-400' },
                  { label: 'BOLT', value: letzterEintrag.bolt > 0 ? `${letzterEintrag.bolt} s` : '–', color: 'text-orange-400' },
                  { label: 'Apnoe aus', value: letzterEintrag.apnoeAus > 0 ? `${letzterEintrag.apnoeAus} min` : '–', color: 'text-cyan-400' },
                  { label: 'Apnoe ein', value: letzterEintrag.apnoeEin > 0 ? `${letzterEintrag.apnoeEin} min` : '–', color: 'text-teal-400' },
                  { label: 'Temp', value: letzterEintrag.temperature > 0 ? `${letzterEintrag.temperature}°C` : '–', color: 'text-blue-400' },
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
                  {showVitalForm ? 'Abbrechen' : '+ Neuer Eintrag'}
                </Button>
              </div>

              <AnimatePresence>
                {showVitalForm && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <Card className="bg-white/5 border-white/10">
                      <CardContent className="pt-5">
                        <form onSubmit={handleVitalSubmit} className="space-y-4">
                          {/* Zeile 1: Morgenruhepuls + HRV */}
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <Label className="flex items-center gap-1.5 text-pink-400 text-xs">
                                <HeartPulse className="w-3.5 h-3.5" /> Ruhepuls (bpm)
                              </Label>
                              <Input type="number" value={ruhepuls} onChange={e => setRuhepuls(e.target.value)}
                                className="bg-black/50 border-white/20 text-white h-9" placeholder="z.B. 58" />
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
                          {/* Zeile 2: BOLT + Temp */}
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
                            <div className="space-y-1.5 md:col-span-2">
                              <Label className="text-zinc-400 text-xs">Stimmung (1–10): {mood}</Label>
                              <div className="flex items-center gap-3 h-9">
                                <span className="text-xs text-zinc-600">1</span>
                                <Slider value={[mood]} onValueChange={v => setMood(v[0])} max={10} min={1} step={1} className="flex-1" />
                                <span className="text-xs text-zinc-600">10</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex justify-end">
                            <Button type="submit" className="bg-white text-black hover:bg-white/90">Speichern</Button>
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
                  <span className="text-xs text-zinc-600">
                    {durchgefuehrtCount}/{geplantCount} erledigt
                  </span>
                  {geplantCount > 0 && (
                    <div className="h-1.5 w-24 bg-zinc-800 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-orange-500 rounded-full transition-all"
                        style={{ width: `${(durchgefuehrtCount / geplantCount) * 100}%` }}
                      />
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
                      <select
                        value={newKat}
                        onChange={e => setNewKat(e.target.value as TagesplanKategorie)}
                        className="bg-zinc-900 border border-zinc-700 text-zinc-200 rounded-lg px-2 py-1.5 text-sm"
                      >
                        {Object.entries(KATEGORIEN_CONFIG).map(([k, v]) => (
                          <option key={k} value={k}>{v.icon} {v.label}</option>
                        ))}
                      </select>
                      <Input
                        value={newLabel}
                        onChange={e => setNewLabel(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && addTagesplanItem()}
                        placeholder="Beschreibung..."
                        className="bg-black/50 border-white/20 text-white flex-1 h-9"
                      />
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
                            {/* Geplant-Toggle */}
                            <button
                              onClick={() => toggleGeplant(item.id)}
                              className={`w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center transition-colors ${
                                item.geplant ? 'border-zinc-500 bg-zinc-700' : 'border-zinc-700 bg-transparent'
                              }`}
                              title="Geplant"
                            >
                              {item.geplant && <div className="w-2 h-2 rounded-sm bg-zinc-400" />}
                            </button>
                            <span className={`flex-1 text-sm ${item.durchgefuehrt ? 'line-through text-zinc-600' : 'text-zinc-200'}`}>
                              {item.label}
                            </span>
                            {/* Durchgeführt-Toggle */}
                            <button
                              onClick={() => toggleDurchgefuehrt(item.id)}
                              className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center transition-all ${
                                item.durchgefuehrt
                                  ? 'bg-green-500 text-white'
                                  : 'bg-zinc-800 text-zinc-600 hover:bg-zinc-700'
                              }`}
                              title="Als erledigt markieren"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteTagesplanItem(item.id)}
                              className="opacity-0 group-hover:opacity-100 text-zinc-700 hover:text-red-500 transition-all"
                            >
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
                <button
                  key={z}
                  onClick={() => setStatsZeitraum(z)}
                  className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                    statsZeitraum === z ? 'bg-orange-500 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
                  }`}
                >
                  {z === 'woche' ? 'Wöchentlich' : 'Monatlich'}
                </button>
              ))}
            </div>

            {statsData.length === 0 ? (
              <div className="text-center py-20 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                Noch keine Daten für die Statistik. Erfasse zuerst einige Werte.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Atemwerte */}
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
                        <Bar dataKey="bolt"     fill="#f97316" name="BOLT (s)"       radius={[3,3,0,0]} />
                        <Bar dataKey="apnoeAus" fill="#06b6d4" name="Apnoe AUS (min)" radius={[3,3,0,0]} />
                        <Bar dataKey="apnoeEin" fill="#14b8a6" name="Apnoe EIN (min)" radius={[3,3,0,0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Herzwerte */}
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
                        <Line type="monotone" dataKey="hrv"      stroke="#ef4444" strokeWidth={2} name="HRV (ms)"     dot={{ r: 4 }} />
                        <Line type="monotone" dataKey="ruhepuls" stroke="#ec4899" strokeWidth={2} name="Ruhepuls (bpm)" dot={{ r: 4 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>

                {/* Stimmung */}
                <Card className="bg-white/5 border-white/10 lg:col-span-2">
                  <CardHeader><CardTitle className="text-sm font-light text-zinc-400">Stimmung (Ø 1–10)</CardTitle></CardHeader>
                  <CardContent className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={statsData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="label" stroke="#666" tick={{ fontSize: 11 }} />
                        <YAxis domain={[0, 10]} stroke="#666" tick={{ fontSize: 11 }} />
                        <Tooltip contentStyle={{ backgroundColor: '#111', border: '1px solid #333' }} itemStyle={{ color: '#fff' }} />
                        <Line type="monotone" dataKey="mood" stroke="#a78bfa" strokeWidth={2} name="Stimmung" dot={{ r: 4 }} />
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
            {/* Tagesverlauf-Charts */}
            {entries.length > 1 && (
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
                        <Line type="monotone" dataKey="bolt"     stroke="#f97316" strokeWidth={2} name="BOLT (s)"       dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="apnoeAus" stroke="#06b6d4" strokeWidth={2} name="Apnoe AUS (min)" dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="apnoeEin" stroke="#14b8a6" strokeWidth={2} name="Apnoe EIN (min)" dot={{ r: 3 }} />
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
                        <Line type="monotone" dataKey="hrv"      stroke="#ef4444" strokeWidth={2} name="HRV (ms)"       dot={{ r: 3 }} />
                        <Line type="monotone" dataKey="ruhepuls" stroke="#ec4899" strokeWidth={2} name="Ruhepuls (bpm)"  dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Eintrags-Liste */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider">Alle Einträge</h3>
              {entries.length === 0 ? (
                <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
                  Noch keine Daten. Starte mit deinem ersten Eintrag!
                </div>
              ) : (
                entries.slice().reverse().map(entry => (
                  <div key={entry.id} className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/15 transition-colors">
                    <div className="space-y-2">
                      <div className="text-zinc-500 font-mono text-xs">
                        {new Date(entry.date).toLocaleDateString('de-DE')} {new Date(entry.date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm">
                        {entry.ruhepuls > 0  && <span className="text-pink-400">Ruhepuls: <b>{entry.ruhepuls} bpm</b></span>}
                        {entry.hrv > 0       && <span className="text-red-400">HRV: <b>{entry.hrv} ms</b>{entry.hrvSource === 'polar_h10' && <span className="text-blue-400 text-xs ml-1">Polar</span>}</span>}
                        {entry.bolt > 0      && <span className="text-orange-400">BOLT: <b>{entry.bolt} s</b></span>}
                        {entry.apnoeAus > 0  && <span className="text-cyan-400">Apnoe AUS: <b>{entry.apnoeAus} min</b></span>}
                        {entry.apnoeEin > 0  && <span className="text-teal-400">Apnoe EIN: <b>{entry.apnoeEin} min</b></span>}
                        {entry.temperature > 0 && <span className="text-blue-400">Temp: <b>{entry.temperature}°C</b></span>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(entry.id)}
                      className="text-zinc-700 hover:text-red-500 hover:bg-red-500/10 shrink-0">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
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
