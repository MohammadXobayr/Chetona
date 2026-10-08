// CHETONA Signature Sound Engine
// Audio identity: "চে—তনা!" brand sonic logo with soft digital pop and vocal cadence

export type ChetanaSoundVariant = 'send' | 'new_chat' | 'reward' | 'error';

class ChetanaAudioEngine {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  // Plays the signature sonic logo + subtle vocal reaction
  playSignature(variant: ChetanaSoundVariant = 'send', enabled = true): void {
    if (!enabled || typeof window === 'undefined') return;

    // 1. Play synthesized warm digital audio logo & pop
    this.playSyntheticChimeAndPop(variant);

    // 2. Play subtle speech vocalization "চেতনা"
    this.playVocalCadence(variant);
  }

  private playSyntheticChimeAndPop(variant: ChetanaSoundVariant): void {
    try {
      const ctx = this.getContext();
      if (!ctx) return;

      const now = ctx.currentTime;

      // Master gain for subtle elegance
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.045, now);
      masterGain.connect(ctx.destination);

      if (variant === 'send') {
        // "চে—তনা!" : Rising vocalized formant + crisp pop
        // Tone 1: "চে—"
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(440, now); // A4
        osc1.frequency.exponentialRampToValueAtTime(587.33, now + 0.08); // D5
        gain1.gain.setValueAtTime(0.03, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.09);
        osc1.connect(gain1);
        gain1.connect(masterGain);
        osc1.start(now);
        osc1.stop(now + 0.09);

        // Tone 2: "—তনা!"
        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, now + 0.08); // E5
        osc2.frequency.exponentialRampToValueAtTime(880, now + 0.17); // A5
        gain2.gain.setValueAtTime(0.04, now + 0.08);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start(now + 0.08);
        osc2.stop(now + 0.2);

        // Tiny soft digital pop at finish
        const popOsc = ctx.createOscillator();
        const popGain = ctx.createGain();
        popOsc.type = 'sine';
        popOsc.frequency.setValueAtTime(980, now + 0.18);
        popOsc.frequency.exponentialRampToValueAtTime(320, now + 0.23);
        popGain.gain.setValueAtTime(0.04, now + 0.18);
        popGain.gain.exponentialRampToValueAtTime(0.0001, now + 0.23);
        popOsc.connect(popGain);
        popGain.connect(masterGain);
        popOsc.start(now + 0.18);
        popOsc.stop(now + 0.23);

      } else if (variant === 'new_chat') {
        // "চে...তনা" : Softer, calm gentle glide
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(659.25, now + 0.18); // E5
        gain.gain.setValueAtTime(0.025, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.22);

      } else if (variant === 'reward') {
        // "চেতনা!" + tiny sparkle / pop
        const freqs = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 arpeggio
        freqs.forEach((f, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.04);
          gain.gain.setValueAtTime(0.03, now + i * 0.04);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.12);
          osc.connect(gain);
          gain.connect(masterGain);
          osc.start(now + i * 0.04);
          osc.stop(now + i * 0.04 + 0.12);
        });

      } else if (variant === 'error') {
        // "চে...তনা?" : Inquisitive questioning curve
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(370, now + 0.09);
        osc.frequency.exponentialRampToValueAtTime(493.88, now + 0.19); // question inflection
        gain.gain.setValueAtTime(0.03, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.connect(gain);
        gain.connect(masterGain);
        osc.start(now);
        osc.stop(now + 0.22);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  }

  private playVocalCadence(variant: ChetanaSoundVariant): void {
    try {
      if (!('speechSynthesis' in window)) return;

      const words = variant === 'error' ? 'চেতনা?' : variant === 'new_chat' ? 'চেতনা' : 'চেতনা';
      const utterance = new SpeechSynthesisUtterance(words);

      // Preferred Bengali voices
      const voices = window.speechSynthesis.getVoices();
      const bnVoice = voices.find((v) => v.lang.startsWith('bn'));
      if (bnVoice) {
        utterance.voice = bnVoice;
      }

      utterance.lang = 'bn-BD';
      utterance.volume = 0.28; // Subtle background layer
      utterance.rate = variant === 'new_chat' ? 1.1 : 1.35;
      utterance.pitch = variant === 'error' ? 1.4 : variant === 'reward' ? 1.3 : 1.2;

      // Cancel any stuck utterances and play
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore
    }
  }
}

export const chetonaAudio = new ChetanaAudioEngine();
