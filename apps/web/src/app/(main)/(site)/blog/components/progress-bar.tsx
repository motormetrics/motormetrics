"use client";

import { motion, useScroll } from "motion/react";

export function ProgressBar() {
  const { scrollYProgress } = useScroll();

  return (
    <motion.div
      className="fixed inset-x-0 top-16 z-20 h-1 origin-[0%] bg-accent"
      style={{
        scaleX: scrollYProgress,
      }}
    />
  );
}
