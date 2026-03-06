import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { getVitals, saveVital, deleteVital, VitalEntry } from '@/lib/vitals';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Trash2, Activity, Thermometer, Wind, HeartPulse, X, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VitalDashboardProps {
  onClose: () => void;
}

export const VitalDashboard: React.FC<VitalDashboardProps> = ({ onClose }) => {
  const [entries, setEntries] = useState<VitalEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [bolt, setBolt] = useState<string>('');
  const [temp, setTemp] = useState<string>('');
  const [hrv, setHrv] = useState<string>('');
  const [mood, setMood] = useState<number>(5);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    setEntries(getVitals().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bolt && !temp && !hrv) return;

    const newEntry = saveVital({
      date: new Date().toISOString(),
      bolt: Number(bolt) || 0,
      temperature: Number(temp) || 0,
      hrv: Number(hrv) || 0,
      mood,
      notes
    });

    setEntries([...entries, newEntry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    setShowForm(false);
    // Reset form
    setBolt('');
    setTemp('');
    setHrv('');
    setMood(5);
    setNotes('');
  };

  const handleDelete = (id: string) => {
    deleteVital(id);
    setEntries(entries.filter(e => e.id !== id));
  };

  // Format date for chart
  const chartData = entries.map(e => ({
    ...e,
    displayDate: new Date(e.date).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
  }));

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col overflow-hidden text-white">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/10">
        <div className="flex items-center gap-4">
           <Button 
            variant="ghost" 
            size="sm" 
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-0 hover:bg-transparent mr-2"
          >
            <ArrowLeft className="mr-1 h-5 w-5" />
            Zurück zum Menü
          </Button>
          <h2 className="text-2xl font-light tracking-wider flex items-center gap-3">
            <Activity className="w-6 h-6 text-orange-500" />
            VITAL MONITOR
          </h2>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose} className="hover:bg-white/10">
          <X className="w-6 h-6" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8 max-w-7xl mx-auto w-full">
        
        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-white/60 text-sm">
            Erfasse deine täglichen Werte für BOLT, Temperatur und HRV.
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            {showForm ? 'Abbrechen' : '+ Neuer Eintrag'}
          </Button>
        </div>

        {/* Entry Form */}
        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <Card className="bg-white/5 border-white/10">
                <CardContent className="pt-6">
                  <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-orange-400">
                        <Wind className="w-4 h-4" /> BOLT (sek)
                      </Label>
                      <Input 
                        type="number" 
                        value={bolt} 
                        onChange={e => setBolt(e.target.value)}
                        className="bg-black/50 border-white/20 text-white"
                        placeholder="z.B. 25"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-blue-400">
                        <Thermometer className="w-4 h-4" /> Temp (°C)
                      </Label>
                      <Input 
                        type="number" 
                        step="0.1"
                        value={temp} 
                        onChange={e => setTemp(e.target.value)}
                        className="bg-black/50 border-white/20 text-white"
                        placeholder="z.B. 36.6"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="flex items-center gap-2 text-red-400">
                        <HeartPulse className="w-4 h-4" /> HRV (ms)
                      </Label>
                      <Input 
                        type="number" 
                        value={hrv} 
                        onChange={e => setHrv(e.target.value)}
                        className="bg-black/50 border-white/20 text-white"
                        placeholder="z.B. 65"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white/80">Stimmung (1-10)</Label>
                      <div className="flex items-center gap-4 h-10">
                        <span className="text-xs">1</span>
                        <Slider 
                          value={[mood]} 
                          onValueChange={v => setMood(v[0])}
                          max={10} 
                          min={1} 
                          step={1}
                          className="flex-1"
                        />
                        <span className="text-xs">10</span>
                      </div>
                    </div>
                    <div className="md:col-span-2 lg:col-span-4 flex justify-end">
                      <Button type="submit" className="bg-white text-black hover:bg-white/90">
                        Speichern
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Charts */}
        {entries.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* BOLT & HRV Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white/80">Atmung & Herz (BOLT / HRV)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="displayDate" stroke="#666" />
                    <YAxis stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="bolt" stroke="#f97316" strokeWidth={2} name="BOLT (s)" dot={{r: 4}} />
                    <Line type="monotone" dataKey="hrv" stroke="#ef4444" strokeWidth={2} name="HRV (ms)" dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Temperature Chart */}
            <Card className="bg-white/5 border-white/10">
              <CardHeader>
                <CardTitle className="text-lg font-light text-white/80">Körpertemperatur (°C)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis dataKey="displayDate" stroke="#666" />
                    <YAxis domain={['dataMin - 0.5', 'dataMax + 0.5']} stroke="#666" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#000', border: '1px solid #333' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="temperature" stroke="#3b82f6" strokeWidth={2} name="Temp (°C)" dot={{r: 4}} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="text-center py-20 text-white/40 border border-dashed border-white/10 rounded-xl">
            Noch keine Daten vorhanden. Starte mit deinem ersten Eintrag!
          </div>
        )}

        {/* History List */}
        {entries.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-xl font-light text-white/80">Verlauf</h3>
            <div className="grid gap-4">
              {entries.slice().reverse().map(entry => (
                <div key={entry.id} className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-white/5 hover:border-white/20 transition-colors">
                  <div className="flex items-center gap-6">
                    <div className="text-white/60 font-mono text-sm">
                      {new Date(entry.date).toLocaleDateString('de-DE')} <br/>
                      {new Date(entry.date).toLocaleTimeString('de-DE', {hour: '2-digit', minute:'2-digit'})}
                    </div>
                    <div className="flex gap-6 text-sm">
                      {entry.bolt > 0 && <span className="text-orange-400">BOLT: <b>{entry.bolt}s</b></span>}
                      {entry.temperature > 0 && <span className="text-blue-400">Temp: <b>{entry.temperature}°C</b></span>}
                      {entry.hrv > 0 && <span className="text-red-400">HRV: <b>{entry.hrv}ms</b></span>}
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => handleDelete(entry.id)}
                    className="text-white/20 hover:text-red-500 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
