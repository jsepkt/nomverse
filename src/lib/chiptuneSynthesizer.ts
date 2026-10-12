/**
 * NomVerse Procedural 8-Bit Chiptune Synthesizer
 * Generates an upbeat retro arcade soundtrack in real-time via Web Audio API.
 * Zero external audio files required (0 KB network overhead).
 */

class ChiptuneSynthesizer {
  private ctx: AudioContext | null = null;
  private isPlayingState: boolean = false;
  private masterGain: GainNode | null = null;
  private timerId: number | null = null;
  private step: number = 0;
  private tempo: number = 138; // BPM
  private volume: number = 0.12;

  // Melody note frequencies (Hz) in C Major / A Minor retro chiptune scale
  private melodyNotes: number[] = [
    523.25, // C5
    587.33, // D5
    659.25, // E5
    783.99, // G5
    880.00, // A5
    1046.50, // C6
    783.99, // G5
    659.25, // E5
  ];

  // Retro bassline root frequencies
  private bassNotes: number[] = [
    130.81, // C3
    130.81,
    174.61, // F3
    174.61,
    196.00, // G3
    196.00,
    220.00, // A3
    196.00,
  ];

  private init(): boolean {
    if (typeof window === "undefined") return false;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtxClass) return false;
      this.ctx = new AudioCtxClass();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return true;
  }

  public isPlaying(): boolean {
    return this.isPlayingState;
  }

  public setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
    }
  }

  public start(): void {
    if (this.isPlayingState) return;
    if (!this.init()) return;

    this.isPlayingState = true;
    this.step = 0;
    this.scheduleLoop();
    window.dispatchEvent(new CustomEvent("nom_bgm_state", { detail: { isPlaying: true } }));
  }

  public stop(): void {
    if (!this.isPlayingState) return;
    this.isPlayingState = false;
    if (this.timerId !== null) {
      window.clearTimeout(this.timerId);
      this.timerId = null;
    }
    window.dispatchEvent(new CustomEvent("nom_bgm_state", { detail: { isPlaying: false } }));
  }

  public toggle(): boolean {
    if (this.isPlayingState) {
      this.stop();
      return false;
    } else {
      this.start();
      return true;
    }
  }

  private scheduleLoop = (): void => {
    if (!this.isPlayingState || !this.ctx || !this.masterGain) return;

    const secondsPerBeat = 60.0 / this.tempo;
    const sixteenth = secondsPerBeat / 4;
    const now = this.ctx.currentTime;

    // 1. Lead Chiptune Square Oscillator
    const noteIdx = this.step % this.melodyNotes.length;
    const freq = this.melodyNotes[noteIdx];
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "square";
    osc.frequency.setValueAtTime(freq, now);

    // Retro 8-bit envelope (sharp attack, fast decay)
    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + sixteenth * 0.9);

    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(now);
    osc.stop(now + sixteenth);

    // 2. Punchy Triangle Wave Bassline (every 2nd sixteenth note)
    if (this.step % 2 === 0) {
      const bassIdx = Math.floor(this.step / 4) % this.bassNotes.length;
      const bassFreq = this.bassNotes[bassIdx];
      const bassOsc = this.ctx.createOscillator();
      const bassGain = this.ctx.createGain();

      bassOsc.type = "triangle";
      bassOsc.frequency.setValueAtTime(bassFreq, now);

      bassGain.gain.setValueAtTime(0.18, now);
      bassGain.gain.exponentialRampToValueAtTime(0.01, now + sixteenth * 1.8);

      bassOsc.connect(bassGain);
      bassGain.connect(this.masterGain);
      bassOsc.start(now);
      bassOsc.stop(now + sixteenth * 2);
    }

    // 3. Retro Noise Hi-Hat / Snare (every 4th step)
    if (this.step % 4 === 2) {
      this.playRetroNoise(now, sixteenth * 0.6);
    }

    this.step = (this.step + 1) % 64;
    const delayMs = sixteenth * 1000;
    this.timerId = window.setTimeout(this.scheduleLoop, delayMs);
  };

  private playRetroNoise(time: number, duration: number): void {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = "highpass";
    filter.frequency.setValueAtTime(1200, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.04, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration);
  }
}

export const chiptuneBgm = new ChiptuneSynthesizer();
