// Web Audio API Synthesized Chimes (Zero external audio asset dependencies)

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
  if (!AudioContextClass) return null;
  if (!audioCtx || audioCtx.state === 'closed') {
    try {
      audioCtx = new AudioContextClass();
    } catch {
      return null;
    }
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume().catch(() => {});
  }
  return audioCtx;
}

/**
 * Gentle three-chime bell to signal completion of focus session (C5 -> E5 -> G5)
 */
export function playSessionCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [523.25, 659.25, 783.99]; // C5, E5, G5
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);

      gain.gain.setValueAtTime(0, now + idx * 0.15);
      gain.gain.linearRampToValueAtTime(0.2, now + idx * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.85);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted or unsupported:', err);
  }
}

/**
 * Break complete notification tone (A5 -> D5)
 */
export function playBreakCompleteSound(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const notes = [880.00, 587.33];
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now + idx * 0.18);

      gain.gain.setValueAtTime(0, now + idx * 0.18);
      gain.gain.linearRampToValueAtTime(0.15, now + idx * 0.18 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.18 + 0.6);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.18);
      osc.stop(now + idx * 0.18 + 0.65);
    });
  } catch (err) {
    console.warn('Audio chime playback omitted or unsupported:', err);
  }
}
