/**
 * COACHING DASHBOARD – nur für Admins (Thomas)
 *
 * Zeigt alle Clients die eine aktive Einwilligung erteilt haben,
 * und ermöglicht die Einsicht in deren Vitalwerte.
 */

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';
import { Link, useLocation } from 'wouter';
import {
  ArrowLeft, Users, Activity, HeartPulse, Wind, Thermometer,
  Zap, Calendar, ChevronRight, Loader2, ShieldCheck, User,
  BarChart2, List, TrendingUp
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar
} from 'recharts';

// ─── Hilfsfunktionen ─────────────────────────────────────────────────────────
function avg(nums: (number | null | undefined)[]) {
  const valid = nums.filter((n): n is number => typeof n === 'number' && n > 0);
  return valid.length ? Math.round(valid.reduce((a, b) => a + b, 0) / valid.length * 10) / 10 : 0;
}

// ─── Client-Detail-Ansicht ────────────────────────────────────────────────────
const ClientDetail: React.FC<{ clientUserId: number; onBack: () => void }> = ({ clientUserId, onBack }) => {
  const [activeTab, setActiveTab] = useState<'verlauf' | 'charts'>('verlauf');

  const { data: profile, isLoading: isLoadingProfile } = trpc.vital.getClientProfile.useQuery({ clientUserId });
  const { data: eintraege = [], isLoading: isLoadingEintraege } = trpc.vital.getClientEintraege.useQuery({
    clientUserId,
    limit: 90,
  });

  const chartData = [...eintraege]
    .sort((a, b) => a.datum.localeCompare(b.datum))
    .map(e => ({
      ...e,
      displayDate: new Date(e.datum).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
      boltNum: e.bolt ?? 0,
      hrvNum: e.hrv ?? 0,
      ruhepulsNum: e.ruhepuls ?? 0,
      apnoeAusNum: e.apnoeAus ? parseFloat(e.apnoeAus) : 0,
      apnoeEinNum: e.apnoeEin ? parseFloat(e.apnoeEin) : 0,
    }));

  // Letzte Werte für Schnellübersicht
  const letzterEintrag = eintraege[0] ?? null;

  if (isLoadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  const clientName = [profile?.user?.vorname, profile?.user?.name].filter(Boolean).join(' ') || profile?.user?.email || `User #${clientUserId}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="text-zinc-400 hover:text-white gap-1">
          <ArrowLeft className="w-4 h-4" /> Zurück
        </Button>
        <div>
          <h2 className="text-xl font-semibold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-orange-400" />
            {clientName}
          </h2>
          {profile?.user?.email && (
            <p className="text-sm text-zinc-500">{profile.user.email}</p>
          )}
        </div>
        <div className="ml-auto flex items-center gap-1.5 text-xs text-green-400 bg-green-500/10 px-3 py-1.5 rounded-full border border-green-500/20">
          <ShieldCheck className="w-3.5 h-3.5" />
          Einwilligung aktiv seit {profile?.einwilligung
            ? new Date(profile.einwilligung.eingewilligtAtMs).toLocaleDateString('de-DE')
            : '–'}
        </div>
      </div>

      {/* Schnellübersicht */}
      {letzterEintrag && (
        <div>
          <p className="text-xs text-zinc-500 mb-2">Letzter Eintrag: {letzterEintrag.datum}</p>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
            {[
              { label: 'Ruhepuls', value: letzterEintrag.ruhepuls ? `${letzterEintrag.ruhepuls} bpm` : '–', color: 'text-pink-400' },
              { label: 'HRV', value: letzterEintrag.hrv ? `${letzterEintrag.hrv} ms` : '–', color: 'text-red-400' },
              { label: 'BOLT', value: letzterEintrag.bolt ? `${letzterEintrag.bolt} s` : '–', color: 'text-orange-400' },
              { label: 'Apnoe AUS', value: letzterEintrag.apnoeAus ? `${letzterEintrag.apnoeAus} min` : '–', color: 'text-cyan-400' },
              { label: 'Apnoe EIN', value: letzterEintrag.apnoeEin ? `${letzterEintrag.apnoeEin} min` : '–', color: 'text-teal-400' },
              { label: 'Temp', value: letzterEintrag.temperatur ? `${letzterEintrag.temperatur}°C` : '–', color: 'text-blue-400' },
            ].map(item => (
              <div key={item.label} className="bg-white/5 rounded-xl p-3 text-center">
                <div className={`text-lg font-bold ${item.color}`}>{item.value}</div>
                <div className="text-xs text-zinc-500 mt-0.5">{item.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-white/10">
        {([
          { id: 'verlauf', icon: <List className="w-4 h-4" />, label: 'Verlauf' },
          { id: 'charts',  icon: <BarChart2 className="w-4 h-4" />, label: 'Charts' },
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

      {/* Verlauf */}
      {activeTab === 'verlauf' && (
        <div className="space-y-3">
          {isLoadingEintraege ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
            </div>
          ) : eintraege.length === 0 ? (
            <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
              Noch keine Einträge vorhanden.
            </div>
          ) : (
            eintraege.map(entry => (
              <div key={entry.id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                <div className="text-zinc-500 font-mono text-xs mb-2">{entry.datum}</div>
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
                  <div className="text-xs text-zinc-500 italic mt-2 border-l-2 border-zinc-700 pl-2">{entry.anmerkungen}</div>
                )}
                {entry.tagesplan && (() => {
                  try {
                    const items = JSON.parse(entry.tagesplan) as Array<{ label: string; geplant: boolean; durchgefuehrt: boolean }>;
                    const geplant = items.filter(i => i.geplant).length;
                    const done = items.filter(i => i.durchgefuehrt).length;
                    return (
                      <div className="mt-2 text-xs text-zinc-500">
                        Tagesplan: <span className="text-zinc-300">{done}/{geplant} Aufgaben erledigt</span>
                      </div>
                    );
                  } catch { return null; }
                })()}
              </div>
            ))
          )}
        </div>
      )}

      {/* Charts */}
      {activeTab === 'charts' && chartData.length > 1 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
        </div>
      )}
      {activeTab === 'charts' && chartData.length <= 1 && (
        <div className="text-center py-16 text-zinc-600 border border-dashed border-zinc-800 rounded-xl">
          Mindestens 2 Einträge für Charts benötigt.
        </div>
      )}
    </div>
  );
};

// ─── Haupt-Coaching-Dashboard ─────────────────────────────────────────────────
export default function CoachingDashboard() {
  const { user, loading } = useAuth();
  const [selectedClientId, setSelectedClientId] = useState<number | null>(null);

  const { data: clients = [], isLoading: isLoadingClients } = trpc.vital.getCoachingClients.useQuery(
    undefined,
    { enabled: !!user && user.role === 'admin' }
  );

  // Zugriff nur für Admins
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <div className="text-center space-y-4">
          <ShieldCheck className="w-12 h-12 text-zinc-600 mx-auto" />
          <p className="text-zinc-400">Kein Zugriff. Nur für Coaches verfügbar.</p>
          <Link href="/">
            <Button variant="outline" className="border-zinc-700 text-zinc-400">Zur Startseite</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-6xl mx-auto p-4 md:p-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white gap-1 p-0 hover:bg-transparent">
                <ArrowLeft className="w-4 h-4" />
                <span className="hidden sm:inline">Zur App</span>
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-light tracking-wider flex items-center gap-2">
                <Activity className="w-6 h-6 text-orange-500" />
                COACHING DASHBOARD
              </h1>
              <p className="text-sm text-zinc-500 mt-0.5">Vitalwerte deiner Coaching-Clients</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-500 bg-zinc-900 px-3 py-1.5 rounded-full border border-zinc-800">
            <Users className="w-3.5 h-3.5" />
            {clients.length} {clients.length === 1 ? 'Client' : 'Clients'} aktiv
          </div>
        </div>

        {/* Inhalt */}
        {selectedClientId !== null ? (
          <ClientDetail
            clientUserId={selectedClientId}
            onBack={() => setSelectedClientId(null)}
          />
        ) : (
          <div className="space-y-4">
            {isLoadingClients ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-zinc-600" />
              </div>
            ) : clients.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl space-y-3">
                <ShieldCheck className="w-12 h-12 text-zinc-700 mx-auto" />
                <p className="text-zinc-500">Noch keine aktiven Coaching-Einwilligungen.</p>
                <p className="text-xs text-zinc-600">
                  Clients können den Coaching-Modus im Vital Monitor aktivieren.
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm text-zinc-500">
                  Folgende Clients haben dir eine aktive Einwilligung zur Einsicht ihrer Vitalwerte erteilt:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {clients.map(client => {
                    const name = [client.userVorname, client.userName].filter(Boolean).join(' ') || client.userEmail || `User #${client.userId}`;
                    return (
                      <button
                        key={client.userId}
                        onClick={() => setSelectedClientId(client.userId)}
                        className="flex items-center justify-between p-5 bg-white/5 hover:bg-white/8 rounded-2xl border border-white/10 hover:border-orange-500/30 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400 font-semibold text-sm">
                            {name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-white">{name}</p>
                            {client.userEmail && (
                              <p className="text-xs text-zinc-500">{client.userEmail}</p>
                            )}
                            <p className="text-xs text-zinc-600 mt-0.5">
                              Einwilligung seit {new Date(client.eingewilligtAtMs).toLocaleDateString('de-DE')}
                            </p>
                          </div>
                        </div>
                        <ChevronRight className="w-5 h-5 text-zinc-600 group-hover:text-orange-400 transition-colors" />
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* DSGVO-Hinweis */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-xs text-zinc-700 text-center">
            Die Einsicht in Vitalwerte ist nur für Clients möglich, die eine explizite Einwilligung gemäß DSGVO Art. 9 Abs. 2 lit. a erteilt haben.
            Jede Einwilligung kann jederzeit widerrufen werden.
          </p>
        </div>
      </div>
    </div>
  );
}
