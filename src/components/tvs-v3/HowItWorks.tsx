"use client";

import { Camera, Lock, MousePointerClick, QrCode, Users, Video } from "lucide-react";
import { PROMISES } from "@/lib/tvs/constants";
import { SectionHead, Reveal } from "./Reveal";

const STEPS = [
  {
    icon: MousePointerClick,
    step: "01",
    title: "Pick your zone",
    text: "Belly pan at ₹10 or the VIP aerocowl at ₹1,000+. Choose the panel your name will call home.",
  },
  {
    icon: QrCode,
    step: "02",
    title: "Pay over UPI",
    text: "Scan the QR or tap the intent link. Paste the 12-digit UTR — the ledger verifies it in seconds.",
  },
  {
    icon: Camera,
    step: "03",
    title: "Your name is printed — forever",
    text: "On wrap day your name goes onto the real vinyl, filmed in 4K. You get the clip. The bike keeps it.",
  },
];

const PROMISE_ICONS: Record<string, typeof Video> = {
  video: Video,
  camera: Camera,
  users: Users,
  lock: Lock,
};

export function HowItWorks() {
  return (
    <section className="bg-muted/40 dark:bg-white/[0.02]">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Three Steps To Immortality"
          title={
            <>
              From ₹10 to <span className="text-racing">on the bike</span> in 3 moves.
            </>
          }
        />

        <div className="relative mt-10 grid gap-4 md:grid-cols-3 md:gap-5">
          <div
            aria-hidden
            className="dash-move absolute left-[16%] right-[16%] top-[52px] hidden border-t-2 border-dashed border-racing/30 md:block"
          />
          {STEPS.map((s, i) => (
            <Reveal key={s.step} delay={i * 0.1}>
              <div className="glass card-pop relative h-full rounded-2xl p-6 text-center sm:p-7">
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-racing/10 text-racing ring-1 ring-racing/20">
                  <s.icon className="h-6 w-6" strokeWidth={2.2} />
                </div>
                <span className="mt-4 inline-block rounded-full bg-muted px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-widest text-muted-foreground dark:bg-white/5">
                  STEP {s.step}
                </span>
                <h3 className="mt-2 font-display text-lg font-bold">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        {/* promises */}
        <div className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {PROMISES.map((p, i) => {
            const Icon = PROMISE_ICONS[p.icon] ?? Lock;
            return (
              <Reveal key={p.title} delay={i * 0.06}>
                <div className="flex h-full items-start gap-3 rounded-xl border bg-card/60 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-volt/10 text-volt dark:bg-volt-bright/10 dark:text-volt-bright">
                    <Icon className="h-4.5 w-4.5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-snug">{p.title}</div>
                    <div className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                      {p.text}
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
