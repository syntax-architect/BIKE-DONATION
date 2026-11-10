"use client";

import {
  Camera,
  Flag,
  Lock,
  Users,
  Video,
} from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Reveal, SectionHeader } from "./Reveal";
import { FAQS, PROMISES } from "@/lib/tvs/constants";

const PROMISE_ICONS = { video: Video, camera: Camera, users: Users, lock: Lock } as const;

export function FaqPromise() {
  return (
    <section id="faq" className="relative py-20 md:py-28 scroll-mt-16">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      <div className="mx-auto max-w-7xl px-4 md:px-6">
        <SectionHeader
          index="05"
          kicker="FAQ & The Promise"
          title={
            <>
              Questions, Answered.{" "}
              <span className="text-volt italic text-glow-volt">Promise, Kept.</span>
            </>
          }
        />

        {/* THE PROMISE */}
        <Reveal>
          <div id="promise" className="scroll-mt-24 relative overflow-hidden rounded-3xl border border-racing/35 bg-gradient-to-br from-racing/[0.09] via-transparent to-transparent p-6 md:p-9">
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-racing/15 blur-[100px] pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2.5">
                <span className="grid place-items-center w-9 h-9 rounded-lg bg-racing text-white shadow-[0_0_24px_rgba(225,29,72,0.5)]">
                  <Flag className="w-4.5 h-4.5" />
                </span>
                <div>
                  <div className="font-display text-xl md:text-2xl font-bold text-zinc-50">The Promise</div>
                  <div className="font-mono text-[9.5px] tracking-[0.26em] text-racing-soft">
                    FOUR THINGS THAT WILL 100% HAPPEN
                  </div>
                </div>
              </div>

              <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {PROMISES.map((p, i) => {
                  const Icon = PROMISE_ICONS[p.icon as keyof typeof PROMISE_ICONS];
                  return (
                    <Reveal key={p.title} delay={i * 0.08}>
                      <div className="h-full rounded-2xl border border-white/8 bg-black/30 p-4 hover:border-volt/30 transition-colors">
                        <span className="grid place-items-center w-9 h-9 rounded-lg bg-volt/12 text-volt">
                          <Icon className="w-4.5 h-4.5" />
                        </span>
                        <div className="mt-3.5 text-[14px] font-bold text-zinc-100">{p.title}</div>
                        <p className="mt-1.5 text-[12px] leading-relaxed text-zinc-500">{p.text}</p>
                      </div>
                    </Reveal>
                  );
                })}
              </div>

              <p className="mt-6 text-[13px] leading-relaxed text-zinc-400">
                If the bike never gets wrapped, the ledger proves exactly where every rupee sat —
                and it comes back. <span className="text-zinc-200 font-medium">That&apos;s the deal.</span>
              </p>
            </div>
          </div>
        </Reveal>

        {/* FAQ */}
        <div className="mt-12 grid gap-8 lg:grid-cols-5">
          <Reveal className="lg:col-span-2">
            <h3 className="font-display text-2xl md:text-3xl font-bold text-zinc-50 leading-tight">
              The fine print,
              <br />
              <span className="text-zinc-500">without the fine print.</span>
            </h3>
            <p className="mt-4 text-[14px] leading-relaxed text-zinc-500">
              This is an internet experiment run in the open. Ask anything — the answers live
              here, and the receipts live in the ledger.
            </p>
            <div className="mt-6 rounded-2xl border border-white/8 bg-white/[0.02] p-4 font-mono text-[10.5px] leading-relaxed tracking-wide text-zinc-500">
              <span className="text-volt">▸ STATUS:</span> FUNDING
              <br />
              <span className="text-bolt">▸ EXPERIMENT:</span> #01 — RR310 WRAP
              <br />
              <span className="text-racing-soft">▸ VERIFICATION:</span> UTR ↔ LEDGER MATCH
            </div>
          </Reveal>

          <Reveal delay={0.1} className="lg:col-span-3">
            <Accordion type="single" collapsible className="space-y-3">
              {FAQS.map((f, i) => (
                <AccordionItem
                  key={f.q}
                  value={`faq-${i}`}
                  className="rounded-2xl border border-white/8 bg-white/[0.02] px-5 border-b"
                >
                  <AccordionTrigger className="py-4 text-left text-[14.5px] font-semibold text-zinc-100 hover:no-underline hover:text-white [&>svg]:text-zinc-500">
                    <span className="flex items-baseline gap-3">
                      <span className="font-mono text-[10px] text-racing-soft">{String(i + 1).padStart(2, "0")}</span>
                      {f.q}
                    </span>
                  </AccordionTrigger>
                  <AccordionContent className="pb-5 text-[13px] leading-relaxed text-zinc-400 pl-0">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
