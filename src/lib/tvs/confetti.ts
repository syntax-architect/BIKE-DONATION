"use client";

const PALETTE = ["#EF4444", "#DC2626", "#F59E0B", "#E2E8F0", "#94A3B8", "#ffffff"];

export async function burstConfetti() {
  const confetti = (await import("canvas-confetti")).default;
  const base = { colors: PALETTE, disableForReducedMotion: true };
  confetti({ ...base, particleCount: 130, spread: 80, startVelocity: 42, origin: { y: 0.6 } });
  setTimeout(
    () => confetti({ ...base, particleCount: 70, angle: 60, spread: 60, origin: { x: 0, y: 0.75 } }),
    180,
  );
  setTimeout(
    () => confetti({ ...base, particleCount: 70, angle: 120, spread: 60, origin: { x: 1, y: 0.75 } }),
    320,
  );
}
