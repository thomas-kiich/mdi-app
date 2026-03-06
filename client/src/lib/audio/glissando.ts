import { TONES } from "@/lib/tones";

export class GlissandoSynth {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isPlaying: boolean = false;

  constructor() {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    this.audioCtx = new AudioContextClass();
  }

  public async play(startFreq: number, endFreq: number, duration: number) {
    if (!this.audioCtx) return;
    
    // Resume context if suspended (browser policy)
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }

    // Stop previous sound if any
    this.stop();

    this.oscillator = this.audioCtx.createOscillator();
    this.gainNode = this.audioCtx.createGain();

    this.oscillator.type = 'sine';
    this.oscillator.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
    
    // Glissando: Exponential ramp to end frequency
    // We use exponentialRampToValueAtTime for natural sounding pitch shift
    this.oscillator.frequency.exponentialRampToValueAtTime(
      endFreq, 
      this.audioCtx.currentTime + duration
    );

    // Envelope: Attack, Sustain, Release
    this.gainNode.gain.setValueAtTime(0, this.audioCtx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(0.5, this.audioCtx.currentTime + 0.1); // Attack
    this.gainNode.gain.setValueAtTime(0.5, this.audioCtx.currentTime + duration - 0.1); // Sustain
    this.gainNode.gain.linearRampToValueAtTime(0, this.audioCtx.currentTime + duration); // Release

    this.oscillator.connect(this.gainNode);
    this.gainNode.connect(this.audioCtx.destination);

    this.oscillator.start();
    this.oscillator.stop(this.audioCtx.currentTime + duration);
    
    this.isPlaying = true;

    // Cleanup after duration
    setTimeout(() => {
      this.isPlaying = false;
    }, duration * 1000);
  }

  public stop() {
    if (this.oscillator) {
      try {
        this.oscillator.stop();
        this.oscillator.disconnect();
      } catch (e) {
        // Ignore if already stopped
      }
      this.oscillator = null;
    }
    if (this.gainNode) {
      this.gainNode.disconnect();
      this.gainNode = null;
    }
    this.isPlaying = false;
  }
}
