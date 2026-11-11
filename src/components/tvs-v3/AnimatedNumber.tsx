"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { formatINR, formatNum } from "@/lib/tvs/constants";

export function AnimatedNumber({
  value,
  currency = false,
  className,
}: {
  value: number;
  currency?: boolean;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 80, damping: 24, mass: 0.8 });
  useEffect(() => {
    spring.set(value);
  }, [value, spring]);
  const display = useTransform(spring, (v) =>
    currency ? formatINR(Math.round(v)) : formatNum(Math.round(v)),
  );
  return <motion.span className={`tnum ${className ?? ""}`}>{display}</motion.span>;
}
