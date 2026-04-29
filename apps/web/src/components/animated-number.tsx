"use client";

import { formatCurrency, formatNumber } from "@motormetrics/utils";
import { motion, useSpring, useTransform } from "framer-motion";
import { useEffect } from "react";

interface AnimatedNumberProps {
  value: number;
  from?: number;
  format?: "number" | "currency";
}

export function AnimatedNumber({
  value,
  from = 0,
  format = "number",
}: AnimatedNumberProps) {
  const spring = useSpring(from, { mass: 0.8, stiffness: 75, damping: 15 });

  const display = useTransform(spring, (current) => {
    const rounded = Math.round(current);
    return format === "currency"
      ? formatCurrency(rounded)
      : formatNumber(rounded);
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return (
    <motion.span
      key={value}
      animate={{ scale: [1, 1.02, 1] }}
      transition={{ duration: 0.3, ease: "easeOut" }}
    >
      {display}
    </motion.span>
  );
}
