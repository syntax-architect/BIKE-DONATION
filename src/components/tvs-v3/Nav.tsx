"use client";

import { motion, useScroll, useSpring } from "framer-motion";
import { useTheme } from "next-themes";
import { Moon, Sun, Flag } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";

const LINKS = [
  { href: "#bike", label: "The Bike" },
  { href: "#zones", label: "Zones" },
  { href: "#pricing", label: "Pricing" },
  { href: "#live", label: "Live" },
  { href: "#transparency", label: "Ledger" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const { resolvedTheme, setTheme } = useTheme();
  const openClaim = useClaimStore((s) => s.openClaim);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass-strong border-b">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6 lg:px-8">
          {/* brand */}
          <a href="#top" className="flex min-w-0 items-center gap-2.5" aria-label="Back to top">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-racing text-white shadow-[0_6px_16px_-6px_rgba(225,29,72,0.7)]">
              <Flag className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <span className="min-w-0 truncate font-display text-sm font-bold tracking-tight sm:text-base">
              PEOPLE&rsquo;S <span className="text-racing">RR310</span>
            </span>
          </a>

          {/* desktop links */}
          <nav className="hidden items-center gap-1 lg:flex" aria-label="Sections">
            {LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="rounded-full px-3.5 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* theme toggle */}
            <button
              type="button"
              onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="grid h-9 w-9 place-items-center rounded-full border bg-card text-foreground transition-colors hover:bg-muted"
              aria-label="Toggle dark / light mode"
            >
              <Sun className="hidden h-4 w-4 dark:block" />
              <Moon className="h-4 w-4 dark:hidden" />
            </button>

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
          className="h-[2px] origin-left bg-gradient-to-r from-racing via-racing-soft to-volt-bright"
          style={{ scaleX: progress }}
        />
      </div>
    </header>
  );
}
