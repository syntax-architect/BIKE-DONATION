"use client";

import { Flag } from "lucide-react";

export function Footer() {
  return (
    <footer className="mt-auto border-t bg-card/50">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-5 sm:flex-row">
          <div className="flex items-center gap-2.5">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-racing text-white">
              <Flag className="h-4 w-4" strokeWidth={2.5} />
            </span>
            <div>
              <div className="font-display text-sm font-bold">
                PEOPLE&rsquo;S <span className="text-racing">RR310</span>
              </div>
              <div className="text-[11px] text-muted-foreground">
                Experiment #01 — funded by 40,000 internet strangers
              </div>
            </div>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground" aria-label="Footer">
            <a href="#bike" className="transition-colors hover:text-foreground">The Bike</a>
            <a href="#zones" className="transition-colors hover:text-foreground">Zones</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Pricing</a>
            <a href="#live" className="transition-colors hover:text-foreground">Live</a>
            <a href="#transparency" className="transition-colors hover:text-foreground">Ledger</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>
        </div>

        <div className="mt-6 border-t pt-5 text-center text-[11px] leading-relaxed text-muted-foreground sm:text-left">
          A community art &amp; funding experiment. Not affiliated with, endorsed by, or sponsored by
          TVS Motor Company. Apache RR 310 is a trademark of its respective owner. Contributions
          fund the purchase and wrap of one motorcycle; this is not an investment, equity, or
          ownership scheme.
          <div className="mt-1.5">Built by the internet, for the internet. © {new Date().getFullYear()} Experiment #01.</div>
        </div>
      </div>
    </footer>
  );
}
