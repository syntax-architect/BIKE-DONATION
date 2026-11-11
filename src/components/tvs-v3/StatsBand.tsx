"use client";

import { useEffect, useState } from "react";
import { Users, IndianRupee, Timer, CircleDot } from "lucide-react";
import { TARGET, ZONES } from "@/lib/tvs/constants";
import { CAMPAIGN_DEADLINE } from "@/lib/tvs/v3";
import { totalRaised, totalBackers, zoneSold, useLiveStore } from "@/lib/tvs/store";
import { AnimatedNumber } from "./AnimatedNumber";
import { Reveal } from "./Reveal";

function useCountdown() {
  const [left, setLeft] = useState<{ d: number; h: number; m: number } | null>(null);
  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, CAMPAIGN_DEADLINE.getTime() - Date.now());
      setLeft({
        d: Math.floor(diff / 86_400_000),
        h: Math.floor((diff % 86_400_000) / 3_600_000),
        m: Math.floor((diff % 3_600_000) / 60_000),
      });
    };
    tick();
    const t = setInterval(tick, 30_000);
    return () => clearInterval(t);
  }, []);
  return left;
}

export function StatsBand() {
  const stats = useLiveStore((s) => s.stats);
  const sim = useLiveStore((s) => s.sim);
  const raised = totalRaised(stats, sim);
  const backers = totalBackers(stats, sim);
  const pct = Math.min(100, Math.round((raised / TARGET) * 1000) / 10);
  const spotsLeft = ZONES.reduce((a, z) => a + Math.max(0, z.capacity - zoneSold(stats, sim, z.id)), 0);
  const cd = useCountdown();

  const items = [
    {
      icon: IndianRupee,
      label: "Raised so far",
      value: <AnimatedNumber value={raised} currency />,
      foot: `${pct}% of ₹4,00,000 target`,
      accent: "text-racing",
    },
    {
      icon: Users,
      label: "Internet strangers in",
      value: <AnimatedNumber value={backers} />,
      foot: "Every one gets printed",
      accent: "text-volt-bright",
    },
    {
      icon: CircleDot,
      label: "Wrap slots left",
      value: <AnimatedNumber value={spotsLeft} />,
      foot: "Across all 5 bike zones",
      accent: "text-bolt-bright",
    },
    {
      icon: Timer,
      label: "Time left to lock",
      value: cd ? (
        <span className="tnum">
          {cd.d}
          <span className="text-base font-medium">d</span> {String(cd.h).padStart(2, "0")}
          <span className="text-base font-medium">h</span> {String(cd.m).padStart(2, "0")}
          <span className="text-base font-medium">m</span>
        </span>
      ) : (
        <span className="opacity-0">00</span>
      ),
      foot: "Then the wrap goes to print",
      accent: "text-vip-bright",
    },
  ];

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        {items.map((it, i) => (
          <Reveal key={it.label} delay={i * 0.07}>
            <div className="glass card-pop group h-full rounded-2xl p-4 transition-transform hover:-translate-y-1 sm:p-5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                <it.icon className={`h-4 w-4 ${it.accent}`} />
                {it.label}
              </div>
              <div className="mt-2.5 font-display text-2xl font-bold tracking-tight sm:text-[1.7rem]">
                {it.value}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">{it.foot}</div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
