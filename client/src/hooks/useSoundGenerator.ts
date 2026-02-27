import { useRef, useEffect, useCallback } from 'react';

export function useSoundGenerator() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);

  // Initialisiere AudioContext bei Bedarf (User Interaction erforderlich)
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopAllSounds = useCallback(() => {
    // Nur aktive Oszillatoren stoppen
    activeOscillatorsRef.current.forEach(osc => {
      try {
        osc.stop();
        osc.disconnect();
      } catch (e) { /* ignore */ }
    });
    activeOscillatorsRef.current = [];

    activeGainNodesRef.current.forEach(gain => {
        try {
            gain.disconnect();
        } catch (e) { /* ignore */ }
    });
    activeGainNodesRef.current = [];
  }, []);

  const playTone = useCallback((frequency: number, type: OscillatorType = 'sine', duration: number = 2) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    // Wir stoppen vorherige Sounds NICHT unbedingt, um Überlappung zu erlauben?
    // Doch, für MDI ist Klarheit besser.
    stopAllSounds();

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const now = ctx.currentTime;
    
    // Envelope
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(0.5, now + 0.1); // Attack
    gainNode.gain.setValueAtTime(0.5, now + duration - 0.5); // Sustain
    gainNode.gain.linearRampToValueAtTime(0, now + duration); // Release

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start(now);
    osc.stop(now + duration + 0.1);

    activeOscillatorsRef.current.push(osc);
    activeGainNodesRef.current.push(gainNode);

    // Cleanup nach Ende (verhindert Memory Leaks bei vielen Tönen)
    setTimeout(() => {
        // Wir entfernen sie nur aus dem Array, wenn sie noch drin sind
        // Da wir stopAllSounds haben, ist das Array evtl. schon leer
    }, (duration + 0.2) * 1000);

  }, [initAudioContext, stopAllSounds]);

  const playChord = useCallback((frequencies: number[], duration: number = 4) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    activeGainNodesRef.current.push(masterGain);

    const now = ctx.currentTime;
    
    // Master Envelope für den Akkord
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.3, now + 0.5); // Langsamer Attack
    masterGain.gain.setValueAtTime(0.3, now + duration - 1);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);

    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine'; // Sinus für reine Obertöne
      
      // Detune für Schwebung (lebendiger)
      const detune = (Math.random() - 0.5) * 5; // +/- 2.5 cents
      osc.detune.value = detune;

      osc.frequency.setValueAtTime(freq, now);
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);
      
      activeOscillatorsRef.current.push(osc);
    });

  }, [initAudioContext, stopAllSounds]);

  // Cleanup beim Unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return { playTone, playChord, stopAllSounds };
}
