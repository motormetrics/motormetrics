"use client";

import { staggerItemVariants } from "@web/config/animations";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
  /** Optional order for standalone stagger delay (used when not inside AnimatedGrid) */
  order?: number;
}

export function AnimatedSection({
  children,
  className,
  order,
}: AnimatedSectionProps) {
  // When order is provided, animate standalone with custom delay
  // When order is undefined, rely on parent AnimatedGrid for orchestration
  const isStandalone = order !== undefined;

  return (
    <motion.div
      className={className}
      variants={staggerItemVariants}
      {...(isStandalone && {
        initial: "hidden",
        animate: "visible",
        transition: { delay: order * 0.05 },
      })}
    >
      {children}
    </motion.div>
  );
}
