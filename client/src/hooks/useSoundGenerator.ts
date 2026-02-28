import { useCallback, useEffect, useRef, useState } from 'react';

export function useSoundGenerator() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeOscillatorsRef = useRef<OscillatorNode[]>([]);
  const activeGainNodesRef = useRef<GainNode[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);

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
  }, []);

  const playTone = useCallback((frequency: number) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    
    console.log(`Playing tone at: ${frequency} Hz`);

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(frequency, ctx.currentTime);

    const now = ctx.currentTime;
    const duration = 4; // Longer duration for better listening experience
    
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

    // Cleanup after end
    setTimeout(() => {
        setIsPlaying(false);
    }, duration * 1000);

  }, [initAudioContext, stopAllSounds]);

  const playChord = useCallback((fundamentalFreq: number) => {
    const ctx = initAudioContext();
    if (!ctx) return;

    stopAllSounds();
    setIsPlaying(true);
    
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
      osc.type = index === 0 ? 'triangle' : 'sine'; // Fundamental as triangle for more body
      
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
    isPlaying 
  };
}
