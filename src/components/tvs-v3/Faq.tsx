"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/tvs/constants";
import { useClaimStore } from "@/lib/tvs/store";
import { SectionHead, Reveal } from "./Reveal";

export function Faq() {
  const openClaim = useClaimStore((s) => s.openClaim);

  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="Skeptical? Good."
          title={
            <>
              Questions everyone <span className="text-racing">asks first</span>.
            </>
          }
        />

        <Reveal delay={0.1} className="mt-8">
          <Accordion type="single" collapsible className="glass card-pop rounded-2xl px-5 sm:px-7">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-border/70">
                <AccordionTrigger className="py-4.5 text-left font-display text-base font-semibold hover:no-underline sm:text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-6 flex flex-col items-center justify-between gap-4 rounded-2xl border bg-card/60 p-5 text-center sm:flex-row sm:text-left">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">Convinced already?</strong> ₹10 is one tap away
              from being on the bike forever.
            </p>
            <button
              type="button"
              onClick={() => openClaim()}
              className="btn-racing h-11 shrink-0 rounded-xl px-6 text-sm font-bold text-white active:scale-[0.98]"
            >
              Claim Your Spot
            </button>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
