// Web Audio API Procedural Formant Vocal Synthesizer
// Pure DSP: Zero external MP3/WAV files. Real-time vocal tract resonance modeling.

class NomsterVoiceSynthesizer {
  private ctx: AudioContext | null = null;
  public isMuted: boolean = false;

  private initCtx(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.ctx) {
      const AudioCtxClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtxClass) {
        this.ctx = new AudioCtxClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Synthesizes a single syllable with fundamental frequency F0 and dual formants F1 & F2.
   * @param f0 Fundamental pitch of the mascot's vocal cords (e.g., 320 Hz)
   * @param f1 First vowel formant (throat resonance)
   * @param f2 Second vowel formant (mouth/tongue resonance)
   * @param duration Duration in seconds
   * @param startTime AudioContext start time offset
   * @param volume Volume multiplier
   */
  public playPhoneme(
    f0: number,
    f1: number,
    f2: number,
    duration: number = 0.12,
    startTime?: number,
    volume: number = 0.3
  ): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;

    const t = startTime || ctx.currentTime;

    // Glottal pulse excitation source (rich harmonic sawtooth)
    const osc = ctx.createOscillator();
    osc.type = "sawtooth";
    osc.frequency.setValueAtTime(f0, t);
    osc.frequency.linearRampToValueAtTime(f0 * 0.92, t + duration);

    // Formant filter 1 (F1 bandpass)
    const filter1 = ctx.createBiquadFilter();
    filter1.type = "bandpass";
    filter1.frequency.setValueAtTime(f1, t);
    filter1.Q.setValueAtTime(6.0, t);

    // Formant filter 2 (F2 bandpass)
    const filter2 = ctx.createBiquadFilter();
    filter2.type = "bandpass";
    filter2.frequency.setValueAtTime(f2, t);
    filter2.Q.setValueAtTime(8.0, t);

    // Formant gain mixer
    const gainF1 = ctx.createGain();
    const gainF2 = ctx.createGain();
    gainF1.gain.value = 0.6;
    gainF2.gain.value = 0.4;

    // Master syllable envelope
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.001, t);
    masterGain.gain.linearRampToValueAtTime(volume, t + 0.02);
    masterGain.gain.exponentialRampToValueAtTime(0.0001, t + duration);

    // Route audio graph
    osc.connect(filter1);
    osc.connect(filter2);
    filter1.connect(gainF1);
    filter2.connect(gainF2);
    gainF1.connect(masterGain);
    gainF2.connect(masterGain);
    masterGain.connect(ctx.destination);

    osc.start(t);
    osc.stop(t + duration + 0.05);
  }

  // 1. "NOM NOM!" — Two cute percussive chew syllables
  public speakNomNom(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Syllable 1: "NOM" (F0=330Hz, F1=480Hz, F2=1100Hz)
    this.playPhoneme(340, 500, 1150, 0.1, now, 0.28);

    // Syllable 2: "NOM" (Slightly higher pitch F0=390Hz)
    this.playPhoneme(390, 520, 1200, 0.12, now + 0.11, 0.32);
  }

  // 2. "OVERDRIVE!" — 3 digitized robotic ascending syllables
  public speakFever(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // "O-"
    this.playPhoneme(280, 500, 900, 0.1, now, 0.35);
    // "-VER-"
    this.playPhoneme(350, 400, 1800, 0.11, now + 0.11, 0.38);
    // "-DRIVE!"
    this.playPhoneme(440, 300, 2200, 0.16, now + 0.23, 0.42);

    this.speakTTS("Fever Overdrive!");
  }

  // 3. "FUD DETECTED!" — Deep cautionary alarm vocalization
  public speakBossWarning(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // Glitch descending alert phonemes
    this.playPhoneme(220, 300, 800, 0.14, now, 0.4);
    this.playPhoneme(180, 400, 700, 0.16, now + 0.15, 0.4);

    this.speakTTS("Warning! FUD Detected!");
  }

  // 4. "ZOOM!" — High-speed pitch sweep phoneme
  public speakSuperDash(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    // High velocity whoosh phoneme
    this.playPhoneme(480, 300, 2400, 0.14, now, 0.3);
  }

  // 5. "VICTORY!" — Tri-tone celebratory fanfare vocal
  public speakVictory(): void {
    if (this.isMuted) return;
    const ctx = this.initCtx();
    if (!ctx) return;
    const now = ctx.currentTime;

    this.playPhoneme(330, 350, 2000, 0.1, now, 0.35);       // "VIC-"
    this.playPhoneme(392, 450, 1600, 0.1, now + 0.11, 0.38); // "-TO-"
    this.playPhoneme(523, 300, 2200, 0.2, now + 0.22, 0.45); // "-RY!"

    this.speakTTS("Victory! Candy Feast Complete!");
  }

  /**
   * Browser Speech Synthesis fallback/blend for high-clarity robotic voice
   */
  private speakTTS(text: string): void {
    if (typeof window === "undefined" || this.isMuted) return;
    if ("speechSynthesis" in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.pitch = 1.6; // High-pitched cute mascot
        utterance.rate = 1.35; // Fast energetic chipmunk cadence
        utterance.volume = 0.5;
        window.speechSynthesis.speak(utterance);
      } catch {
        // Ignore if restricted by browser policy
      }
    }
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    return this.isMuted;
  }
}

export const nomsterVoice = new NomsterVoiceSynthesizer();
