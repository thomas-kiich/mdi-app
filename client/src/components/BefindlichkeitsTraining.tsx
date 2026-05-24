/**
 * BEFINDLICHKEITSTRAINING
 *
 * Zeigt die 12 Lichtfarben-Archetypen (ungerade Typen 1–23) als auswählbare Kacheln.
 * Der Nutzer wählt die Farbe, die er gerade braucht – Hover spielt den Ton an,
 * Klick öffnet die Detail-Ansicht mit Nutzungs-Beschreibung und YOHN-Start-Button.
 */

import { useState, useRef, useEffect } from "react";
import frequencyData from "@/lib/frequencyData.json";
import { Method36Trainer } from "@/components/Method36Trainer";
import { ArrowLeft, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

// Nur die 12 ungeraden Typen (1, 3, 5, … 23)
const BEFINDLICHKEITS_TYPEN = frequencyData.filter((d) => d.id % 2 === 1);

// Kurzbezeichnungen für die Kacheln (kompakter als der volle Metapher-Text)
const KURZ_LABEL: Record<number, string> = {
  1:  "VERGANGENHEIT",
  3:  "KONSEQUENZ",
  5:  "KOMMUNIKATION",
  7:  "KREATIVITÄT",
  9:  "EMPATHIE",
  11: "KRAFT",
  13: "INTELLEKT",
  15: "STRUKTUR",
  17: "FOKUS",
  19: "AUFTRITT",
  21: "INSPIRATION",
  23: "STILLE",
};

interface BefindlichkeitsTrainingProps {
  onClose?: () => void;
}

export function BefindlichkeitsTraining({ onClose }: BefindlichkeitsTrainingProps) {
  const [selected, setSelected] = useState<typeof BEFINDLICHKEITS_TYPEN[0] | null>(null);
  const [trainerActive, setTrainerActive] = useState(false);

  // Audio
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);

  function getAudioCtx() {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    return audioCtxRef.current;
  }

  function playTone(freq: number) {
    stopTone();
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + 0.1);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    oscRef.current = osc;
    gainRef.current = gain;
  }

  function stopTone() {
    if (gainRef.current && audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      gainRef.current.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.25);
    }
    setTimeout(() => {
      oscRef.current?.stop();
      oscRef.current = null;
      gainRef.current = null;
    }, 300);
  }

  useEffect(() => {
    return () => stopTone();
  }, []);

  // ── Trainer aktiv ──────────────────────────────────────────────────────────
  if (trainerActive && selected) {
    return (
      <Method36Trainer
        frequency={selected.frequency}
        toneName={selected.tone}
        color={selected.hex}
        typeId={selected.id}
        duration={7}
        onClose={() => {
          setTrainerActive(false);
        }}
      />
    );
  }

  // ── Detail-Ansicht ─────────────────────────────────────────────────────────
  if (selected) {
    return (
      <div className="min-h-[60vh] flex flex-col">
        {/* Zurück-Button */}
        <button
          onClick={() => { stopTone(); setSelected(null); }}
          className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Zurück zur Auswahl
        </button>

        {/* Farbblock-Header */}
        <div
          className="rounded-xl p-8 mb-6 relative overflow-hidden"
          style={{ background: `linear-gradient(135deg, ${selected.hex}22 0%, ${selected.hex}08 100%)`, borderColor: `${selected.hex}44`, borderWidth: 1, borderStyle: "solid" }}
        >
          {/* Farbkreis */}
          <div
            className="w-16 h-16 rounded-full mb-4 shadow-lg"
            style={{ background: `radial-gradient(circle at 35% 35%, ${selected.hex}ff, ${selected.hex}88)`, boxShadow: `0 0 32px ${selected.hex}55` }}
          />
          <div className="text-xs font-mono tracking-widest mb-1" style={{ color: selected.hex }}>
            TYPE {selected.id} · {selected.colorName.toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold text-white tracking-wider mb-1">
            {selected.metaphor}
          </h2>
          <div className="text-zinc-400 text-sm">{selected.description}</div>
        </div>

        {/* Wann nutzen? */}
        <div className="mb-6">
          <div className="text-xs font-mono tracking-widest text-zinc-500 mb-3 uppercase">
            Wähle diese Farbe …
          </div>
          <div className="space-y-3">
            {(selected.nutzung ?? []).map((n, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-4 rounded-lg bg-zinc-900/60 border border-zinc-800"
              >
                <div
                  className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                  style={{ background: selected.hex }}
                />
                <p className="text-zinc-300 text-sm leading-relaxed">{n}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Grundgefühl */}
        {selected.grundgefuehl && (
          <div className="mb-6 p-4 rounded-lg border border-zinc-800 bg-zinc-950/60">
            <div className="text-xs font-mono tracking-widest text-zinc-500 mb-2 uppercase">Grundgefühl</div>
            <p className="text-zinc-400 text-sm leading-relaxed italic">{selected.grundgefuehl}</p>
          </div>
        )}

        {/* Frequenz-Info */}
        <div className="flex items-center gap-4 mb-8 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
          <div
            className="w-10 h-10 rounded-full shrink-0"
            style={{ background: selected.hex, opacity: 0.85 }}
          />
          <div>
            <div className="text-white font-semibold text-sm">{selected.frequency} Hz · Ton {selected.tone}</div>
            <div className="text-zinc-500 text-xs">{selected.lightRange} · {selected.toneRange}</div>
          </div>
          <button
            className="ml-auto p-2 rounded-full hover:bg-zinc-800 transition-colors"
            style={{ color: selected.hex }}
            onMouseEnter={() => playTone(selected.frequency)}
            onMouseLeave={stopTone}
            title="Ton anhören"
          >
            <Play className="w-4 h-4" />
          </button>
        </div>

        {/* YOHN STARTEN */}
        <Button
          onClick={() => setTrainerActive(true)}
          className="w-full py-5 h-auto text-sm font-bold tracking-widest uppercase rounded-none"
          style={{ background: selected.hex, color: "#fff" }}
        >
          YOHN TRAINING STARTEN
        </Button>
        <p className="text-zinc-600 text-xs text-center mt-2">
          7 Minuten · Frequenz {selected.frequency} Hz · {selected.colorName}
        </p>
      </div>
    );
  }

  // ── Hauptansicht: Lichtklangtabelle ───────────────────────────────────────
  return (
    <div>
      {/* Intro */}
      <div className="mb-8">
        <div className="text-orange-500 text-xs font-mono uppercase tracking-widest mb-2">
          THEMA 5
        </div>
        <h2 className="text-2xl font-bold text-white tracking-wider mb-3">
          BEFINDLICHKEITSTRAINING
        </h2>
        <p className="text-zinc-400 text-sm leading-relaxed max-w-2xl">
          Jede Lichtfarbe trägt eine spezifische Schwingungsqualität. Wähle die Farbe,
          die du gerade brauchst – und führe das YOHN-Training mit dieser Frequenz durch.
          Hover über eine Kachel um den Ton zu hören. Klick um die Beschreibung zu öffnen.
        </p>
      </div>

      {/* 12 Farb-Kacheln */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {BEFINDLICHKEITS_TYPEN.map((typ) => (
          <button
            key={typ.id}
            className="group relative flex flex-col items-center justify-center p-4 rounded-xl border transition-all duration-200 cursor-pointer text-center hover:scale-[1.03] active:scale-[0.98]"
            style={{
              background: `linear-gradient(135deg, ${typ.hex}18 0%, ${typ.hex}06 100%)`,
              borderColor: `${typ.hex}33`,
            }}
            onMouseEnter={() => playTone(typ.frequency)}
            onMouseLeave={stopTone}
            onClick={() => { stopTone(); setSelected(typ); }}
          >
            {/* Farbkreis */}
            <div
              className="w-12 h-12 rounded-full mb-3 transition-all duration-200 group-hover:scale-110"
              style={{
                background: `radial-gradient(circle at 35% 35%, ${typ.hex}ff, ${typ.hex}88)`,
                boxShadow: `0 0 20px ${typ.hex}44`,
              }}
            />
            {/* Typ-Nummer */}
            <div className="text-xs font-mono mb-0.5" style={{ color: typ.hex }}>
              TYPE {typ.id}
            </div>
            {/* Kurzlabel */}
            <div className="text-white text-xs font-semibold tracking-wider leading-tight">
              {KURZ_LABEL[typ.id] ?? typ.metaphor}
            </div>
            {/* Frequenz */}
            <div className="text-zinc-600 text-xs mt-1">{typ.frequency} Hz</div>

            {/* Hover-Glow */}
            <div
              className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
              style={{ border: `1px solid ${typ.hex}66` }}
            />
          </button>
        ))}
      </div>

      {/* Hinweis */}
      <div className="mt-8 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
        <p className="text-zinc-500 text-xs leading-relaxed">
          Die 12 Lichtfarben entsprechen den ungeraden Typen der MDI-Lichtklangtabelle (TYPE 1–23).
          Jede Farbe aktiviert eine spezifische Qualität in deinem System.
          Das YOHN-Training verstärkt diese Wirkung durch Ton und Atemrhythmus.
        </p>
      </div>
    </div>
  );
}
