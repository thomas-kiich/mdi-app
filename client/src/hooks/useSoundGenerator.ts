import { useCallback, useEffect, useRef, useState } from 'react';

export function useSoundGenerator() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);
  const [octaveShift, setOctaveShift] = useState(0);
  const [fineTune, setFineTune] = useState(0); // in cents
  const [usePureSine, setUsePureSine] = useState(false);
  const [referencePitch, setReferencePitch] = useState(440); // 440 or 432

  // Initialize AudioContext on user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      audioContextRef.current = new AudioContextClass();
    }
    if (audioContextRef.current.state === 'suspended') {
      audioContextRef.current.resume();
    }
    return audioContextRef.current;
  }, []);

  const stopAllSounds = useCallback(() => {
    // Stop only active oscillators
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
    setIsPlaying(false);
    setPlayingFreq(null);
  }, []);

  const playTone = useCallback((baseFrequency: number, shift: number = 0, fineTuneCents: number = 0, isPureSine: boolean = false) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    setOctaveShift(shift);
    setFineTune(fineTuneCents);
    setUsePureSine(isPureSine);
    
    // Apply octave shift
    let frequency = baseFrequency * Math.pow(2, shift);
    
    // Apply fine tuning (cents)
    // Formula: f_new = f_old * 2^(cents/1200)
    frequency = frequency * Math.pow(2, fineTuneCents / 1200);

    setPlayingFreq(frequency);
    
    console.log(`Playing tone at: ${frequency} Hz (Shift: ${shift}, Fine: ${fineTuneCents}, Sine: ${isPureSine})`);

    const masterGain = ctx.createGain();
    const now = ctx.currentTime;
    const duration = 10; // Long duration for tuning
    
    if (isPureSine) {
        // EXPERT MODE: Pure Sine for Tuner Calibration
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(frequency, now);
        
        masterGain.gain.setValueAtTime(0, now);
        masterGain.gain.linearRampToValueAtTime(0.8, now + 0.1); 
        masterGain.gain.setValueAtTime(0.8, now + duration - 0.5); 
        masterGain.gain.linearRampToValueAtTime(0, now + duration);

        osc.connect(masterGain);
        masterGain.connect(ctx.destination);
        
        osc.start(now);
        osc.stop(now + duration + 0.1);
        activeOscillatorsRef.current.push(osc);
    } else {
        // STANDARD MODE: Richer Tone
        // Fundamental: Triangle wave (more body than sine)
        const osc1 = ctx.createOscillator();
        osc1.type = 'triangle';
        osc1.frequency.setValueAtTime(frequency, ctx.currentTime);

        // Overtone 1: Sawtooth (adds brilliance), 1 octave up, lower volume
        const osc2 = ctx.createOscillator();
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(frequency * 2, ctx.currentTime);
        osc2.detune.value = 5; // Slight detune for warmth

        const gainNode1 = ctx.createGain();
        const gainNode2 = ctx.createGain();

        // Envelope for Fundamental
        gainNode1.gain.setValueAtTime(0, now);
        gainNode1.gain.linearRampToValueAtTime(0.6, now + 0.1); // Attack
        gainNode1.gain.setValueAtTime(0.6, now + duration - 0.5); // Sustain
        gainNode1.gain.linearRampToValueAtTime(0, now + duration); // Release

        // Envelope for Overtone (Subtler)
        gainNode2.gain.setValueAtTime(0, now);
        gainNode2.gain.linearRampToValueAtTime(0.15, now + 0.1); 
        gainNode2.gain.setValueAtTime(0.15, now + duration - 0.5); 
        gainNode2.gain.linearRampToValueAtTime(0, now + duration);

        osc1.connect(gainNode1);
        osc2.connect(gainNode2);
        
        gainNode1.connect(masterGain);
        gainNode2.connect(masterGain);
        
        masterGain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        
        osc1.stop(now + duration + 0.1);
        osc2.stop(now + duration + 0.1);

        activeOscillatorsRef.current.push(osc1, osc2);
        activeGainNodesRef.current.push(gainNode1, gainNode2);
    }
    
    activeGainNodesRef.current.push(masterGain);

    // Cleanup after end
    setTimeout(() => {
        setIsPlaying(false);
        setPlayingFreq(null);
    }, duration * 1000);

  }, [initAudioContext, stopAllSounds]);

  const playChord = useCallback((baseFrequency: number, shift: number = 0, fineTuneCents: number = 0) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    
    let fundamentalFreq = baseFrequency * Math.pow(2, shift);
    fundamentalFreq = fundamentalFreq * Math.pow(2, fineTuneCents / 1200);

    setPlayingFreq(fundamentalFreq); // Show base freq
    setOctaveShift(shift);
    setFineTune(fineTuneCents);
    
    console.log(`Playing chord based on fundamental: ${fundamentalFreq} Hz`);

    // Create a major chord based on the fundamental frequency
    // Fundamental, Major Third (5/4), Perfect Fifth (3/2), Octave (2/1)
    // Using Equal Temperament Ratios
    const frequencies = [
      fundamentalFreq,
      fundamentalFreq * 1.2599, // Major Third
      fundamentalFreq * 1.4983, // Perfect Fifth
      fundamentalFreq * 2       // Octave
    ];

    const masterGain = ctx.createGain();
    masterGain.connect(ctx.destination);
    activeGainNodesRef.current.push(masterGain);

    const now = ctx.currentTime;
    const duration = 6; // Longer chord
    
    // Master Envelope for the chord
    masterGain.gain.setValueAtTime(0, now);
    masterGain.gain.linearRampToValueAtTime(0.3, now + 1); // Slow Attack
    masterGain.gain.setValueAtTime(0.3, now + duration - 2);
    masterGain.gain.linearRampToValueAtTime(0, now + duration);

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      // Mix waveforms for richer texture
      osc.type = index === 0 ? 'triangle' : 'sine'; 
      
      // Detune for chorus effect (more organic)
      const detune = (Math.random() - 0.5) * 8; 
      osc.detune.value = detune;

      osc.frequency.setValueAtTime(freq, now);
      osc.connect(masterGain);
      osc.start(now);
      osc.stop(now + duration + 0.1);
      
      activeOscillatorsRef.current.push(osc);
    });
    
    setTimeout(() => {
        setIsPlaying(false);
        setPlayingFreq(null);
    }, duration * 1000);

  }, [initAudioContext, stopAllSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAllSounds();
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [stopAllSounds]);

  return { 
    playTone, 
    playChord, 
    stopAllSounds,
    stopTone: stopAllSounds, // Alias for consistency with Home.tsx
    isPlaying,
    playingFreq,
    octaveShift,
    fineTune,
    usePureSine,
    referencePitch,
    setReferencePitch
  };
}
