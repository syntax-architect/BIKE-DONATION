"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion, useScroll, useSpring } from "framer-motion";
import { Flag, Menu, X } from "lucide-react";
import { useClaimStore } from "@/lib/tvs/store";

const LINKS = [
  { href: "#bike", label: "Bike & Tiers" },
  { href: "#wrap-wall", label: "Wrap Wall" },
  { href: "#ledger", label: "Ledger" },
  { href: "#faq", label: "FAQ" },
];

export function Nav() {
  const openClaim = useClaimStore((s) => s.openClaim);
  const [menuOpen, setMenuOpen] = useState(false);
  const { scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 28, mass: 0.4 });

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      <div className="glass-strong border-b border-white/[0.08]">
        <div className="mx-auto flex h-14 w-full max-w-7xl items-center justify-between gap-2 px-4 sm:h-16 sm:gap-3 sm:px-6 lg:px-8">
          {/* brand */}
          <a
            href="#top"
            onClick={() => setMenuOpen(false)}
            className="flex min-w-0 items-center gap-2 sm:gap-2.5"
            aria-label="Back to top"
          >
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

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                openClaim();
              }}
              className="btn-racing h-9 rounded-full px-3.5 text-xs font-semibold text-white transition-transform active:scale-[0.97] sm:h-10 sm:px-5 sm:text-sm"
            >
              Claim Slot
            </button>
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
              aria-expanded={menuOpen}
              className="grid h-9 w-9 place-items-center rounded-full border border-white/[0.1] bg-[#090A0F]/70 text-[#F8FAFC] transition-colors hover:border-white/25 lg:hidden"
            >
              {menuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>

        {/* mobile navigation drawer */}
        <AnimatePresence>
          {menuOpen && (
            <motion.nav
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              aria-label="Mobile sections"
              className="overflow-hidden border-t border-white/[0.08] bg-[#090A0F]/95 lg:hidden"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1.5 px-4 py-3 sm:grid-cols-5 sm:px-6">
                {LINKS.map((l) => (
                  <a
                    key={l.href}
                    href={l.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex min-h-10 items-center justify-center rounded-xl border border-white/[0.08] bg-[#11131A] px-3 py-2 text-xs font-semibold text-[#F8FAFC] transition-colors active:bg-racing/20"
                  >
                    {l.label}
                  </a>
                ))}
                <Link
                  href="/admin"
                  onClick={() => setMenuOpen(false)}
                  className="col-span-2 flex min-h-10 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-[#F8FAFC] sm:col-span-1"
                >
                  Owner Admin
                </Link>
              </div>
            </motion.nav>
          )}
        </AnimatePresence>

        {/* scroll progress */}
        <motion.div
          className="h-[2px] origin-left bg-racing"
          style={{ scaleX: progress }}
        />
      </div>
    </header>
  );
}
