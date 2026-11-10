"use client";

import { Flame, Github, Heart } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";

const MARQUEE_WORDS = [
  "THE PEOPLE'S APACHE",
  "EXPERIMENT #01",
  "100% COMMUNITY OWNED",
  "40,000 STRANGERS",
  "ONE MACHINE",
  "₹10 AT A TIME",
];

export function Footer() {
  const openClaim = useClaimStore((s) => s.openClaim);

  return (
    <footer className="relative mt-auto border-t border-white/8">
      {/* decorative marquee */}
      <div className="overflow-hidden border-b border-white/6 py-6" aria-hidden="true">
        <div className="flex w-max animate-marquee-fast items-center">
          {[...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS, ...MARQUEE_WORDS].map((w, i) => (
            <span key={i} className="flex items-center whitespace-nowrap">
              <span
                className={`font-display text-4xl md:text-6xl font-bold tracking-tight px-6 ${
                  i % 2 === 0 ? "text-outline" : "text-outline-red"
                }`}
              >
                {w}
              </span>
              <span className="h-2 w-2 rotate-45 bg-racing/50" />
            </span>
          ))}
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 md:px-6 py-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <span className="grid place-items-center w-9 h-9 rounded-lg bg-racing text-white">
              <Flame className="w-5 h-5" strokeWidth={2.4} />
            </span>
            <div>
              <div className="font-display font-bold text-[15px] text-zinc-100">
                PEOPLE&apos;S <span className="text-racing-soft">RR310</span>
              </div>
              <div className="font-mono text-[9px] tracking-[0.26em] text-zinc-600 mt-0.5">
                EXPERIMENT #01 • BY THE INTERNET, FOR THE INTERNET
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => openClaim("BELLY", 10)}
              className="rounded-lg border border-racing/50 bg-racing/10 px-4 py-2 text-[12.5px] font-bold text-racing-soft hover:bg-racing/20 transition-colors"
            >
              Claim from ₹10
            </button>
            <a
              href="#top"
              className="rounded-lg border border-white/10 px-4 py-2 font-mono text-[11px] text-zinc-400 hover:text-white hover:border-white/25 transition-colors"
            >
              BACK TO TOP ↑
            </a>
          </div>
        </div>

        <div className="mt-8 border-t border-white/6 pt-6 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <p className="max-w-2xl text-[11px] leading-relaxed text-zinc-600">
            Demo build — the UPI checkout runs end-to-end but is <span className="text-zinc-400">simulated</span>; no
            real money is processed. Contributor data is illustrative. TVS and Apache RR310 belong
            to their respective owners; this is a fan-made community experiment, not affiliated with
            TVS Motor Company.
          </p>
          <div className="flex items-center gap-4 font-mono text-[10px] text-zinc-600 shrink-0">
            <span className="inline-flex items-center gap-1.5">
              BUILT WITH <Heart className="w-3 h-3 text-racing" /> + NEXT.JS
            </span>
            <Github className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </footer>
  );
}
