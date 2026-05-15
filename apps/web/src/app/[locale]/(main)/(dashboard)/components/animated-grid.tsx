"use client";

import { staggerContainerVariants } from "@web/config/animations";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedGridProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedGrid({ children, className }: AnimatedGridProps) {
  return (
    <motion.div
      className={className}
      variants={staggerContainerVariants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
}
