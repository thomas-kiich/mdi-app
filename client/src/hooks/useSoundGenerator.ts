import { useCallback, useEffect, useRef, useState } from 'react';

export function useSoundGenerator() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playingFreq, setPlayingFreq] = useState<number | null>(null);

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

  const playTone = useCallback((frequency: number) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    setPlayingFreq(frequency);
    
    console.log(`Playing improved tone at: ${frequency} Hz`);

    // Create multiple oscillators for a richer sound
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
    const masterGain = ctx.createGain();

    const now = ctx.currentTime;
    const duration = 4; // Longer duration for better listening experience
    
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
    activeGainNodesRef.current.push(gainNode1, gainNode2, masterGain);

    // Cleanup after end
    setTimeout(() => {
        setIsPlaying(false);
        setPlayingFreq(null);
    }, duration * 1000);

  }, [initAudioContext, stopAllSounds]);

  const playChord = useCallback((fundamentalFreq: number) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    setPlayingFreq(fundamentalFreq); // Show base freq
    
    console.log(`Playing chord based on fundamental: ${fundamentalFreq} Hz`);

    // Create a major chord based on the fundamental frequency
    // Fundamental, Major Third (5/4), Perfect Fifth (3/2), Octave (2/1)
    const frequencies = [
      fundamentalFreq,
      fundamentalFreq * 1.2599, // Major Third (Equal Temperament) - approx 5/4
      fundamentalFreq * 1.4983, // Perfect Fifth (Equal Temperament) - approx 3/2
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
    playingFreq
  };
}
