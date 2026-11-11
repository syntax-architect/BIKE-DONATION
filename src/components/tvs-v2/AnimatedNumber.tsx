"use client";

import { useEffect, useState } from "react";
import { animate, useMotionValue, useTransform, motion } from "framer-motion";
import { formatINR, formatNum } from "@/lib/tvs/constants";

export function AnimatedNumber({
  value,
  format = "plain",
  className,
}: {
  value: number;
  format?: "plain" | "inr";
  className?: string;
}) {
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) => (format === "inr" ? formatINR(Math.round(v)) : formatNum(Math.round(v))));
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const controls = animate(mv, value, { duration: 1.6, ease: [0.22, 1, 0.36, 1] });
    const unsub = rounded.on("change", (v) => setDisplay(v));
    return () => {
      controls.stop();
      unsub();
    };
  }, [value, mv, rounded]);

  return (
    <span className={className} suppressHydrationWarning>
      {display}
    </span>
  );
}
