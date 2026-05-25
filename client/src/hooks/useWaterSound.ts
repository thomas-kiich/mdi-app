import { useEffect, useRef, useCallback } from "react";

/**
 * useWaterSound – erzeugt ein sanftes Wasserplätschern via Web Audio API.
 * Kein externes File nötig. Funktioniert in allen modernen Browsern.
 *
 * Technik:
 * - White Noise Buffer (2 Sekunden, looped)
 * - BiquadFilter (bandpass ~600 Hz, Q=0.8) → dumpfes Rauschen
 * - Zweiter BiquadFilter (lowpass ~1200 Hz) → weicher Klang
 * - GainNode mit langsamer LFO-Modulation → natürliches Fließen
 * - Fade-in / Fade-out über GainNode
 */
export function useWaterSound() {
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
    if (!ctx || !gain) return;

    // Sanftes Fade-out über 1.5 Sekunden
    const now = ctx.currentTime;
    gain.gain.setValueAtTime(gain.gain.value, now);
    gain.gain.linearRampToValueAtTime(0, now + 1.5);

    setTimeout(() => {
      try { sourceRef.current?.stop(); } catch (_) {}
      try { lfoRef.current?.stop(); } catch (_) {}
      try { ctx.close(); } catch (_) {}
      ctxRef.current = null;
      masterGainRef.current = null;
      sourceRef.current = null;
      lfoRef.current = null;
    }, 1600);
  }, []);

  const start = useCallback(() => {
    if (isPlayingRef.current) return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // White Noise Buffer (2 Sekunden)
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

      // Filter 1: Bandpass ~600 Hz – formt das Rauschen zu Wasser
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 600;
      bp.Q.value = 0.8;

      // Filter 2: Lowpass ~1400 Hz – entfernt harsche Höhen
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      lp.Q.value = 0.5;

      // Filter 3: Highpass ~150 Hz – entfernt tiefes Grummeln
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 150;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGainRef.current = masterGain;

      // LFO für sanfte Lautstärke-Modulation (0.08 Hz = ~12 Sek. Zyklus)
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08;
      lfoRef.current = lfo;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12; // ±12% Modulation

      // Routing: source → bp → lp → hp → masterGain → destination
      source.connect(bp);
      bp.connect(lp);
      lp.connect(hp);
      hp.connect(masterGain);
      masterGain.connect(ctx.destination);

      // LFO moduliert masterGain
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);

      // Starten
      source.start();
      lfo.start();
      isPlayingRef.current = true;

      // Fade-in über 2 Sekunden
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 2.0);

    } catch (err) {
      console.error("[useWaterSound] Fehler:", err);
    }
  }, []);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      stop();
    };
  }, [stop]);

  return { start, stop };
}
