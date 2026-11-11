"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 30,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.75, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHeader({
  index,
  kicker,
  title,
  sub,
}: {
  index: string;
  kicker: string;
  title: ReactNode;
  sub?: string;
}) {
  return (
    <Reveal className="mb-10 md:mb-14">
      <div className="flex items-center gap-3 mb-4">
        <span className="font-mono text-[11px] tracking-[0.3em] text-racing-soft">
          {"//"} {index}
        </span>
        <span className="h-px w-10 bg-racing/50" />
        <span className="font-mono text-[11px] tracking-[0.3em] text-zinc-500 uppercase">
          {kicker}
        </span>
      </div>
      <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight text-zinc-50 leading-[1.05]">
        {title}
      </h2>
      {sub ? <p className="mt-4 max-w-2xl text-zinc-400 text-sm md:text-base leading-relaxed">{sub}</p> : null}
    </Reveal>
  );
}
