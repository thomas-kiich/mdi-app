import { useEffect, useRef, useCallback } from "react";

/**
 * useWaterSound – sanftes Wasserplätschern via Web Audio API.
 * Kein externes File nötig. Funktioniert in allen modernen Browsern.
 *
 * Architektur: Der AudioContext bleibt beim stop() offen und faded nur den Gain aus.
 * stopAndClose() wird exklusiv über einen internen Timeout aufgerufen – niemals doppelt.
 */
export function useWaterSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stateRef = useRef<"idle" | "playing" | "fading">("idle");

  const stopAndClose = useCallback(() => {
    if (fadeTimerRef.current) {
      clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }
    try { sourceRef.current?.stop(); } catch (_) {}
    try { lfoRef.current?.stop(); } catch (_) {}
    try { ctxRef.current?.close(); } catch (_) {}
    ctxRef.current = null;
    masterGainRef.current = null;
    sourceRef.current = null;
    lfoRef.current = null;
    stateRef.current = "idle";
  }, []);

  const stop = useCallback(() => {
    // Bereits im Fade oder idle → nichts tun
    if (stateRef.current !== "playing") return;
    stateRef.current = "fading";

    const ctx = ctxRef.current;
    const gain = masterGainRef.current;
    if (!ctx || !gain) { stopAndClose(); return; }

    // Fließendes Fade-out über 6 Sekunden
    const now = ctx.currentTime;
    const currentGain = Math.max(gain.gain.value, 0.001);
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(currentGain, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 6.0);
    gain.gain.linearRampToValueAtTime(0, now + 6.1);

    // Exakt einmal nach 6.2 Sekunden schließen
    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      stopAndClose();
    }, 6200);
  }, [stopAndClose]);

  const start = useCallback(() => {
    // Bereits aktiv → nichts tun
    if (stateRef.current !== "idle") return;

    try {
      const ctx = new AudioContext();
      ctxRef.current = ctx;

      // White Noise Buffer (2 Sekunden, looped)
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

      // Filter 1: Bandpass ~600 Hz
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 600;
      bp.Q.value = 0.8;

      // Filter 2: Lowpass ~1400 Hz
      const lp = ctx.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 1400;
      lp.Q.value = 0.5;

      // Filter 3: Highpass ~150 Hz
      const hp = ctx.createBiquadFilter();
      hp.type = "highpass";
      hp.frequency.value = 150;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.value = 0;
      masterGainRef.current = masterGain;

      // LFO für sanfte Lautstärke-Modulation
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 0.08;
      lfoRef.current = lfo;

      const lfoGain = ctx.createGain();
      lfoGain.gain.value = 0.12;

      // Routing
      source.connect(bp);
      bp.connect(lp);
      lp.connect(hp);
      hp.connect(masterGain);
      masterGain.connect(ctx.destination);
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);

      source.start();
      lfo.start();
      stateRef.current = "playing";

      // Fade-in über 2 Sekunden
      const now = ctx.currentTime;
      masterGain.gain.setValueAtTime(0, now);
      masterGain.gain.linearRampToValueAtTime(0.35, now + 2.0);

    } catch (err) {
      console.error("[useWaterSound] Fehler:", err);
      stateRef.current = "idle";
    }
  }, []);

  // Cleanup beim Unmount – sofort stoppen ohne Fade
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      try { sourceRef.current?.stop(); } catch (_) {}
      try { lfoRef.current?.stop(); } catch (_) {}
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  return { start, stop };
}
