import { useEffect, useRef, useCallback } from "react";

/**
 * useAmbientSound – generiert synthetische Ambient-Klänge via Web Audio API.
 * Kein externes File nötig. Funktioniert in allen modernen Browsern.
 *
 * Preset-Varianten (über `preset`-Parameter wählbar):
 *   "water"  – sanftes Wasserplätschern (Bandpass 600Hz, LFO 0.08Hz)
 *   "rain"   – gleichmäßiger Regen (Lowpass 800Hz, kein LFO)
 *   "wind"   – sanfter Wind (Bandpass 300Hz, LFO 0.05Hz)
 *   "white"  – neutrales weißes Rauschen (ungefiltert)
 *
 * Verwendung:
 *   const { start, stop } = useAmbientSound("water");
 *   <Button onClick={start}>Starten</Button>
 *   <Button onClick={stop}>Stoppen</Button>
 */

type AmbientPreset = "water" | "rain" | "wind" | "white";

interface PresetConfig {
  bandpassFreq: number | null;
  bandpassQ: number;
  lowpassFreq: number;
  highpassFreq: number;
  lfoFreq: number | null;   // null = kein LFO
  lfoDepth: number;
  masterVolume: number;
  fadeIn: number;
  fadeOut: number;
}

const PRESETS: Record<AmbientPreset, PresetConfig> = {
  water: {
    bandpassFreq: 600,
    bandpassQ: 0.8,
    lowpassFreq: 1400,
    highpassFreq: 150,
    lfoFreq: 0.08,
    lfoDepth: 0.12,
    masterVolume: 0.35,
    fadeIn: 2.0,
    fadeOut: 1.5,
  },
  rain: {
    bandpassFreq: null,
    bandpassQ: 1.0,
    lowpassFreq: 800,
    highpassFreq: 200,
    lfoFreq: null,
    lfoDepth: 0,
    masterVolume: 0.4,
    fadeIn: 1.5,
    fadeOut: 1.0,
  },
  wind: {
    bandpassFreq: 300,
    bandpassQ: 0.5,
    lowpassFreq: 1000,
    highpassFreq: 80,
    lfoFreq: 0.05,
    lfoDepth: 0.18,
    masterVolume: 0.3,
    fadeIn: 3.0,
    fadeOut: 2.0,
  },
  white: {
    bandpassFreq: null,
    bandpassQ: 1.0,
    lowpassFreq: 20000,
    highpassFreq: 20,
    lfoFreq: null,
    lfoDepth: 0,
    masterVolume: 0.25,
    fadeIn: 1.0,
    fadeOut: 1.0,
  },
};

export function useAmbientSound(preset: AmbientPreset = "water") {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const isPlayingRef = useRef(false);

  const stop = useCallback(() => {
    if (!isPlayingRef.current) return;
    isPlayingRef.current = false;

    const ctx = ctxRef.current;
    const gain = masterGainRef.current;
    const cfg = PRESETS[preset];
    if (!ctx || !gain) return;

    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + cfg.fadeOut);

    setTimeout(() => {
      try { sourceRef.current?.stop(); } catch (_) {}
      try { lfoRef.current?.stop(); } catch (_) {}
      try { ctx.close(); } catch (_) {}
      ctxRef.current = null;
      masterGainRef.current = null;
      sourceRef.current = null;
      lfoRef.current = null;
    }, (cfg.fadeOut + 0.1) * 1000);
  }, [preset]);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;
    const cfg = PRESETS[preset];

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // White Noise Buffer (2 Sekunden, stereo, looped)
      const bufferSize = ctx.sampleRate * 2;
      const buffer = ctx.createBuffer(2, bufferSize, ctx.sampleRate);
      for (let ch = 0; ch < 2; ch++) {
        const data = buffer.getChannelData(ch);
        for (let i = 0; i < bufferSize; i++) {
          data[i] = Math.random() * 2 - 1;
        }
      }

      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.loop = true;
      sourceRef.current = source;

      // Filter-Kette aufbauen
      let lastNode: AudioNode = source;

      if (cfg.bandpassFreq !== null) {
        const bp = ctx.createBiquadFilter();
        bp.type = "bandpass";
        bp.frequency.value = cfg.bandpassFreq;
        bp.Q.value = cfg.bandpassQ;
        lastNode.connect(bp);
        lastNode = bp;
      }

      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = cfg.lowpassFreq;
      lastNode.connect(lp);
      lastNode = lp;

      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = cfg.highpassFreq;
      lastNode.connect(hp);
      lastNode = hp;

      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGainRef.current = masterGain;
      lastNode.connect(masterGain);
      masterGain.connect(ctx.destination);

      // Optionaler LFO für Lautstärke-Modulation
      if (cfg.lfoFreq !== null) {
        const lfo = ctx.createOscillator();
        lfo.type = "sine";
        lfo.frequency.value = cfg.lfoFreq;
        lfoRef.current = lfo;

        const lfoGain = ctx.createGain();
        lfoGain.gain.value = cfg.lfoDepth;
        lfo.connect(lfoGain);
        lfoGain.connect(masterGain.gain);
        lfo.start();
      }

      source.start();
      isPlayingRef.current = true;

      // Fade-in
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(cfg.masterVolume, now + cfg.fadeIn);

    } catch (err) {
      console.error("[useAmbientSound] Fehler:", err);
    }
  }, [preset]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => { stop(); };
  }, [stop]);

  return { start, stop };
}
