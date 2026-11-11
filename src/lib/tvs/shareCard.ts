"use client";

import { ZONE_MAP, formatINR, type ClaimMode, type ZoneId } from "@/lib/tvs/constants";
import { badgeFor } from "@/lib/tvs/v3";

export interface WrapPassInput {
  name: string;
  partnerName?: string | null;
  handle?: string | null;
  city?: string | null;
  mode?: ClaimMode | string;
  zone: ZoneId;
  amount: number;
  code: string;
  cm2: number;
  isFounder?: boolean;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, r);
}

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

export function formatStickerTitle(
  name: string,
  partnerName?: string | null,
  mode?: ClaimMode | string,
): string {
  const n1 = (name || "").trim().toUpperCase() || "YOUR NAME";
  if (mode === "COUPLE" && partnerName?.trim()) {
    return `${n1} × ${partnerName.trim().toUpperCase()}`;
  }
  return n1;
}

/** Generate and download a 1080×1350 Instagram / WhatsApp Story wrap certificate PNG. */
export async function downloadWrapPass(input: WrapPassInput): Promise<void> {
  const W = 1080;
  const H = 1350;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const zone = ZONE_MAP[input.zone];
  const badge = badgeFor(input.amount);
  const displayTitle = formatStickerTitle(input.name, input.partnerName, input.mode);

  // Dark stage background
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#090a0f");
  bg.addColorStop(0.55, "#11131a");
  bg.addColorStop(1, "#090a0f");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // Subtle racing red glow
  const glow = ctx.createRadialGradient(W * 0.5, H * 0.42, 40, W * 0.5, H * 0.42, 540);
  glow.addColorStop(0, "rgba(220, 38, 38, 0.24)");
  glow.addColorStop(1, "rgba(220, 38, 38, 0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  // Subtle grid lines
  ctx.strokeStyle = "rgba(255,255,255,0.04)";
  ctx.lineWidth = 1;
  for (let x = 0; x < W; x += 54) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }
  for (let y = 0; y < H; y += 54) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
    ctx.stroke();
  }

  // Real Apache RR 310 transparent studio PNG
  const bikeImg = await loadImage("/bike/studio-dyna-clean.png");
  if (bikeImg) {
    ctx.save();
    const targetW = 540;
    const targetH = (bikeImg.height / bikeImg.width) * targetW;
    ctx.drawImage(bikeImg, (W - targetW) / 2, 235, targetW, targetH);
    ctx.restore();
  }

  // Outer frame
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  roundRect(ctx, 42, 42, W - 84, H - 84, 36);
  ctx.stroke();

  // Top pill
  ctx.fillStyle = "rgba(239, 68, 68, 0.16)";
  roundRect(ctx, 90, 92, 510, 48, 24);
  ctx.fill();
  ctx.strokeStyle = "rgba(239, 68, 68, 0.5)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  ctx.fillStyle = "#F87171";
  ctx.font = "700 20px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    input.mode === "COUPLE"
      ? "OFFICIAL COUPLE / BRO LOCK  •  RR 310"
      : input.mode === "PROMO"
        ? "CREATOR BILLBOARD  •  APACHE RR 310"
        : "OFFICIAL RIDER PASS  •  APACHE RR 310",
    118,
    123,
  );

  // Top-right slot code
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "600 18px monospace";
  ctx.textAlign = "right";
  ctx.fillText(input.isFounder ? "FOUNDER 2× PASS" : "SLOT PASS", W - 96, 108);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px monospace";
  ctx.fillText(input.code, W - 96, 138);
  ctx.textAlign = "left";

  // Headline
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 50px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    input.mode === "COUPLE" ? "LOCKED FOREVER ON THE BIKE." : "MY NAME IS ON THIS BIKE.",
    90,
    212,
  );

  // Decal sticker preview card over lower half
  ctx.fillStyle = "rgba(13, 15, 22, 0.92)";
  roundRect(ctx, 84, 830, W - 168, 295, 28);
  ctx.fill();
  ctx.strokeStyle = zone.color;
  ctx.lineWidth = 2.5;
  ctx.stroke();

  // Zone pill inside card
  ctx.fillStyle = `${zone.color}28`;
  roundRect(ctx, 120, 865, 360, 38, 19);
  ctx.fill();
  ctx.fillStyle = zone.color;
  ctx.font = "700 18px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${zone.short.toUpperCase()}  •  ${input.isFounder ? "FOUNDER 2×" : badge.title.toUpperCase()}`,
    140,
    891,
  );

  if (input.city?.trim()) {
    ctx.fillStyle = "rgba(255,255,255,0.65)";
    ctx.font = "700 20px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "right";
    ctx.fillText(`TURF: ${input.city.trim().toUpperCase()}`, W - 120, 891);
    ctx.textAlign = "left";
  }

  // Printed name / couple lock
  ctx.fillStyle = "#ffffff";
  ctx.font = displayTitle.length > 22
    ? "800 42px system-ui, -apple-system, sans-serif"
    : "800 54px system-ui, -apple-system, sans-serif";
  ctx.fillText(displayTitle.slice(0, 36), 120, 972);

  if (input.handle?.trim()) {
    ctx.fillStyle = "#94a3b8";
    ctx.font = "600 26px monospace";
    ctx.fillText(input.handle.trim(), 120, 1020);
  }

  // Stats row inside card
  ctx.fillStyle = "#EF4444";
  ctx.font = "800 32px system-ui, -apple-system, sans-serif";
  ctx.fillText(
    `${formatINR(input.amount)}  •  ${input.cm2} cm² VINYL${input.isFounder ? " (2× FREE)" : ""}`,
    120,
    1082,
  );

  // Footer CTA
  ctx.fillStyle = "rgba(255,255,255,0.68)";
  ctx.font = "500 26px system-ui, -apple-system, sans-serif";
  ctx.fillText("312.2 cc • 38 HP Track Weapon • 4K Wrap Install", 90, 1190);
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 30px system-ui, -apple-system, sans-serif";
  ctx.fillText("Lock your name or Couple Lock from ₹10 — The People's RR 310", 90, 1240);

  const link = document.createElement("a");
  link.download = `peoples-rr310-${input.code}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
