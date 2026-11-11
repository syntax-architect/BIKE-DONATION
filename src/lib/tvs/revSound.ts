"use client";

/** Synthesize a crisp 1.1s 312cc single-cylinder exhaust rev on explicit user click. */
export function playRevSound(): void {
  if (typeof window === "undefined") return;
  try {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;

    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const osc2 = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc1.type = "sawtooth";
    osc2.type = "triangle";

    // Idle -> redline blip -> settle
    osc1.frequency.setValueAtTime(52, now);
    osc1.frequency.exponentialRampToValueAtTime(175, now + 0.34);
    osc1.frequency.exponentialRampToValueAtTime(140, now + 0.56);
    osc1.frequency.exponentialRampToValueAtTime(62, now + 1.05);

    osc2.frequency.setValueAtTime(104, now);
    osc2.frequency.exponentialRampToValueAtTime(350, now + 0.34);
    osc2.frequency.exponentialRampToValueAtTime(124, now + 1.05);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(240, now);
    filter.frequency.exponentialRampToValueAtTime(1100, now + 0.34);
    filter.frequency.exponentialRampToValueAtTime(310, now + 1.05);
    filter.Q.value = 3.2;

    gain.gain.setValueAtTime(0.001, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.08);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.36);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 1.08);

    osc1.connect(filter);
    osc2.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc1.start(now);
    osc2.start(now);
    osc1.stop(now + 1.1);
    osc2.stop(now + 1.1);
    setTimeout(() => {
      void ctx.close().catch(() => {});
    }, 1250);
  } catch {
    /* Web Audio blocked or unavailable */
  }
}
