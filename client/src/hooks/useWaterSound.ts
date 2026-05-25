import { useEffect, useRef, useCallback } from "react";

/**
 * useWaterSound – spielt die Studio-Wassergeräusch-Datei (rauschen3.mp3).
 * Fade-in: 2 Sek, Fade-out: 6 Sek (exponentiell).
 *
 * Architektur: HTMLAudioElement + Web Audio API GainNode für sauberes Fading.
 * stop() kann beliebig oft aufgerufen werden – nur der erste Aufruf löst den Fade aus.
 */

const AUDIO_URL = "/manus-storage/rauschen3_97bc79d2.mp3";
const FADE_IN_SEC = 2.0;
const FADE_OUT_SEC = 6.0;
const MASTER_GAIN = 0.9;

export function useWaterSound() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const stateRef = useRef<"idle" | "playing" | "fading">("idle");

  const cleanup = useCallback(() => {
    if (fadeTimerRef.current) { clearTimeout(fadeTimerRef.current); fadeTimerRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    try { audioRef.current?.pause(); } catch (_) {}
    try { ctxRef.current?.close(); } catch (_) {}
    audioRef.current = null;
    ctxRef.current = null;
    gainRef.current = null;
    stateRef.current = "idle";
  }, []);

  const stop = useCallback(() => {
    if (stateRef.current !== "playing") return;
    stateRef.current = "fading";

    const ctx = ctxRef.current;
    const gain = gainRef.current;
    if (!ctx || !gain) { cleanup(); return; }

    // Exponentielles Fade-out über FADE_OUT_SEC Sekunden
    const now = ctx.currentTime;
    const currentVal = Math.max(gain.gain.value, 0.001);
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(currentVal, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + FADE_OUT_SEC);
    gain.gain.linearRampToValueAtTime(0, now + FADE_OUT_SEC + 0.1);

    fadeTimerRef.current = setTimeout(() => {
      fadeTimerRef.current = null;
      cleanup();
    }, (FADE_OUT_SEC + 0.2) * 1000);
  }, [cleanup]);

  const start = useCallback(() => {
    if (stateRef.current !== "idle") return;

    try {
      const audio = new Audio(AUDIO_URL);
      audio.loop = true;
      audio.crossOrigin = "anonymous";
      audioRef.current = audio;

      const ctx = new AudioContext();
      ctxRef.current = ctx;

      const source = ctx.createMediaElementSource(audio);
      const gain = ctx.createGain();
      gainRef.current = gain;

      source.connect(gain);
      gain.connect(ctx.destination);

      // Fade-in
      const now = ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(MASTER_GAIN, now + FADE_IN_SEC);

      audio.play().then(() => {
        stateRef.current = "playing";
      }).catch((err) => {
        console.error("[useWaterSound] Wiedergabe fehlgeschlagen:", err);
        cleanup();
      });

    } catch (err) {
      console.error("[useWaterSound] Fehler beim Start:", err);
      stateRef.current = "idle";
    }
  }, [cleanup]);

  // Cleanup beim Unmount – sofort ohne Fade
  useEffect(() => {
    return () => {
      if (fadeTimerRef.current) clearTimeout(fadeTimerRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      try { audioRef.current?.pause(); } catch (_) {}
      try { ctxRef.current?.close(); } catch (_) {}
    };
  }, []);

  return { start, stop };
}
