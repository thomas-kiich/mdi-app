export class WaterSound {
  private ctx: AudioContext;
  private masterGain: GainNode;
  private noiseNode: AudioBufferSourceNode | null = null;
  private filter1: BiquadFilterNode | null = null;
  private filter2: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private isPlaying: boolean = false;

  constructor(ctx: AudioContext, destination: AudioNode) {
    this.ctx = ctx;
    this.masterGain = ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(destination);
  }

  start() {
    if (this.isPlaying) return;

    // 1. Create Pink Noise
    const bufferSize = 2 * this.ctx.sampleRate;
    const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + white * 0.0555179;
      b1 = 0.99332 * b1 + white * 0.0750759;
      b2 = 0.96900 * b2 + white * 0.1538520;
      b3 = 0.86650 * b3 + white * 0.3104856;
      b4 = 0.55000 * b4 + white * 0.5329522;
      b5 = -0.7616 * b5 - white * 0.0168980;
      output[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
      output[i] *= 0.11;
      b6 = white * 0.115926;
    }

    this.noiseNode = this.ctx.createBufferSource();
    this.noiseNode.buffer = noiseBuffer;
    this.noiseNode.loop = true;

    // 2. Create Dynamic Filters
    this.filter1 = this.ctx.createBiquadFilter();
    this.filter1.type = 'lowpass';
    this.filter1.frequency.value = 800;
    this.filter1.Q.value = 0.5;

    this.filter2 = this.ctx.createBiquadFilter();
    this.filter2.type = 'bandpass';
    this.filter2.frequency.value = 400;
    this.filter2.Q.value = 1.5;

    // 3. LFO for modulation
    this.lfo = this.ctx.createOscillator();
    this.lfo.type = 'sine';
    this.lfo.frequency.value = 0.3;

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 300;

    this.lfo.connect(this.lfoGain);
    this.lfoGain.connect(this.filter2.frequency);

    // 4. Routing
    this.noiseNode.connect(this.filter1);
    this.filter1.connect(this.filter2);
    this.filter2.connect(this.masterGain);

    this.noiseNode.start();
    this.lfo.start();

    this.masterGain.gain.setTargetAtTime(0.15, this.ctx.currentTime, 2);
    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.5);
    setTimeout(() => {
      if (this.noiseNode) this.noiseNode.stop();
      if (this.lfo) this.lfo.stop();
      this.noiseNode = null;
      this.lfo = null;
      this.isPlaying = false;
    }, 600);
  }

  setVolume(volume: number) {
    if (this.isPlaying) {
      this.masterGain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.5);
    }
  }
}
