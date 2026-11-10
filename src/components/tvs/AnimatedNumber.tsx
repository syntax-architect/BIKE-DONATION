"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedNumber({
  value,
  format,
  className,
}: {
  value: number;
  format?: (n: number) => string;
  className?: string;
}) {
  const spring = useSpring(value, { stiffness: 90, damping: 24, mass: 0.9 });
  useEffect(() => {
    spring.set(value);
  }, [spring, value]);
  const display = useTransform(spring, (v) =>
    format ? format(v) : Math.round(v).toLocaleString("en-IN"),
  );
  return <motion.span className={className}>{display}</motion.span>;
}
