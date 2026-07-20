let globalAudioCtx: AudioContext | null = null;

export type SoundType =
  | "select"
  | "jump"
  | "arcade_jump"
  | "coin"
  | "kick"
  | "gameover"
  | "open"
  | "close"
  | "die"
  | "point";

export function playRetroSound(type: SoundType = "select") {
  if (typeof window === "undefined") return;

  try {
    if (!globalAudioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      globalAudioCtx = new AudioContextClass();
    }

    const ctx = globalAudioCtx;
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    const gain = ctx.createGain();
    gain.connect(ctx.destination);

    if (type === "select") {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.connect(gain);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.setValueAtTime(900, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } else if (type === "jump") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.connect(gain);
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.15);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } else if (type === "arcade_jump") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.connect(gain);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(650, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "coin") {
      const osc = ctx.createOscillator();
      osc.type = "square";
      osc.connect(gain);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.35);
      osc.frequency.setValueAtTime(987.77, ctx.currentTime); // B5
      osc.frequency.setValueAtTime(1318.51, ctx.currentTime + 0.08); // E6
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === "kick") {
      const osc = ctx.createOscillator();
      osc.type = "triangle";
      osc.connect(gain);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
      osc.frequency.setValueAtTime(120, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === "gameover") {
      const notes = [392.00, 349.23, 311.13, 261.63]; // G4, F4, D#4, C4
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const noteGain = ctx.createGain();
        osc.type = "square";
        osc.connect(noteGain);
        noteGain.connect(ctx.destination);
        noteGain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.15);
        noteGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + (idx + 1) * 0.15);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.15);
        osc.start(ctx.currentTime + idx * 0.15);
        osc.stop(ctx.currentTime + (idx + 1) * 0.15);
      });
    } else if (type === "open") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.connect(gain);
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(600, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "close") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.connect(gain);
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(300, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === "die") {
      const osc = ctx.createOscillator();
      osc.type = "sawtooth";
      osc.connect(gain);
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === "point") {
      const osc = ctx.createOscillator();
      osc.type = "sine";
      osc.connect(gain);
      osc.frequency.setValueAtTime(880, ctx.currentTime); // High A note
      osc.frequency.setValueAtTime(1046.5, ctx.currentTime + 0.08); // High C note
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.01, ctx.currentTime + 0.2);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    }
  } catch (e) {
    console.warn("Audio Context failed", e);
  }
}
