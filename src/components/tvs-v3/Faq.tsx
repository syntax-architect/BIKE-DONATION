"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { FAQS } from "@/lib/tvs/constants";
import { SectionHead, Reveal } from "./Reveal";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20">
      <div className="mx-auto w-full max-w-4xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <SectionHead
          eyebrow="FAQ"
          title="Everything you need to know."
        />

        <Reveal delay={0.08} className="mt-7">
          <Accordion type="single" collapsible className="card-pop rounded-2xl border border-white/[0.08] bg-[#11131A] px-5 sm:px-7">
            {FAQS.map((f, i) => (
              <AccordionItem key={i} value={`faq-${i}`} className="border-white/[0.08]">
                <AccordionTrigger className="py-4 text-left font-display text-base font-semibold hover:no-underline sm:text-lg">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
                  {f.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  );
}
