"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Camera,
  ChevronDown,
  Lock,
  ShieldCheck,
  Users,
  Video,
} from "lucide-react";
import { FAQS, PROMISES } from "@/lib/tvs/constants";
import { Reveal, SectionHead } from "./Reveal";

const PROMISE_ICONS = { video: Video, camera: Camera, users: Users, lock: Lock } as const;

export function FaqPromise() {
  const [open, setOpen] = useState(0);

  return (
    <section id="faq" className="relative scroll-mt-20 py-16 sm:py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          kicker="FAQ & THE PROMISE"
          title={
            <>
              Skeptical? <span className="text-racing">Good. Read this.</span>
            </>
          }
          sub="A crowdfunding experiment only works on radical transparency — so here is exactly what happens to your ₹10 and what you get back."
        />

        <div className="mt-10 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          {/* FAQ accordion */}
          <Reveal>
            <div className="space-y-3">
              {FAQS.map((f, i) => {
                const isOpen = open === i;
                return (
                  <div
                    key={f.q}
                    className={`overflow-hidden rounded-2xl border bg-white transition-colors ${
                      isOpen ? "border-racing/30" : "border-black/[0.08]"
                    } card-pop`}
                  >
                    <button
                      onClick={() => setOpen(isOpen ? -1 : i)}
                      aria-expanded={isOpen}
                      className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                    >
                      <span className="flex items-center gap-3">
                        <span className="tnum font-mono text-[11px] font-bold text-racing">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className="text-[15px] font-bold text-ink">{f.q}</span>
                      </span>
                      <motion.span
                        animate={{ rotate: isOpen ? 180 : 0 }}
                        transition={{ duration: 0.25 }}
                        className="shrink-0"
                      >
                        <ChevronDown
                          className={`h-4.5 w-4.5 ${isOpen ? "text-racing" : "text-muted-foreground"}`}
                        />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        >
                          <p className="px-5 pb-5 pl-[3.4rem] text-[13.5px] leading-relaxed text-muted-foreground">
                            {f.a}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </Reveal>

          {/* The Promise */}
          <Reveal delay={0.08}>
            <div className="flex h-full flex-col rounded-3xl border border-black/[0.07] bg-[linear-gradient(160deg,#ffffff_0%,#fff5f6_100%)] p-6 card-pop sm:p-8">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-racing text-white">
                  <ShieldCheck className="h-4.5 w-4.5" />
                </span>
                <div>
                  <div className="font-display text-lg font-bold text-ink">The Promise</div>
                  <div className="text-[12px] text-muted-foreground">
                    Four locks that make this real.
                  </div>
                </div>
              </div>
              <div className="mt-5 flex-1 space-y-3">
                {PROMISES.map((p, i) => {
                  const Icon = PROMISE_ICONS[p.icon as keyof typeof PROMISE_ICONS];
                  return (
                    <motion.div
                      key={p.title}
                      initial={{ opacity: 0, x: 16 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.06 }}
                      className="flex gap-3.5 rounded-2xl border border-black/[0.05] bg-white p-4"
                    >
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent text-racing">
                        <Icon className="h-4.5 w-4.5" />
                      </span>
                      <div>
                        <div className="text-[14px] font-bold text-ink">{p.title}</div>
                        <div className="mt-0.5 text-[12.5px] leading-snug text-muted-foreground">
                          {p.text}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
              <div className="mt-5 rounded-2xl bg-ink p-4 text-center">
                <p className="font-mono text-[11px] font-bold tracking-[0.14em] text-zinc-300">
                  40,000 STRANGERS • ONE MACHINE • ZERO MIDDLEMEN
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
