"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { Flag } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";

const LINKS = [
  { href: "#bike", label: "Bike & Tiers" },
  { href: "#wrap-wall", label: "Wrap Wall" },
  { href: "#ledger", label: "Ledger" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass-strong border-b border-white/[0.08]">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          {/* brand */}
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Back to top">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-racing text-white shadow-[0_6px_16px_-6px_rgba(220,38,38,0.7)]">
              <Flag className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 truncate font-display text-sm font-bold tracking-tight text-[#F8FAFC] sm:text-base">
              PEOPLE&rsquo;S <span className="text-racing">RR310</span>
            </span>
          </a>

          {/* desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.06] hover:text-[#F8FAFC]"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => openClaim()}
              className="btn-racing h-9 rounded-full px-4 text-sm font-semibold text-white transition-transform active:scale-[0.97] sm:h-10 sm:px-5"
            >
              Claim Your Slot
            </button>
          </div>
        </div>
        {/* scroll progress */}
        <motion.div
          className="h-[2px] origin-left bg-racing"
          style={{ scaleX: progress }}
        />
      </div>
    </header>
  );
}
