"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function Reveal({
  children,
  delay = 0,
  y = 22,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

export function SectionHead({
  eyebrow,
  title,
  sub,
  align = "left",
}: {
  eyebrow: string;
  title: ReactNode;
  sub?: string;
  align?: "center" | "left";
}) {
  return (
    <Reveal className={align === "center" ? "text-center" : "text-left"}>
      <div className="font-mono text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {eyebrow}
      </div>
      <h2 className="mt-2 font-display text-[1.65rem] font-bold leading-[1.15] tracking-tight text-[#F8FAFC] sm:text-4xl lg:leading-[1.1]">
        {title}
      </h2>
      {sub ? (
        <p
          className={`mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base ${
            align === "center" ? "mx-auto" : ""
          }`}
        >
          {sub}
        </p>
      ) : null}
    </Reveal>
  );
}
