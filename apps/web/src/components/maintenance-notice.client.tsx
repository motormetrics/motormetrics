"use client";

import { useMaintenance } from "@web/hooks/use-maintenance";
import { motion, type Variants } from "motion/react";
import type { ReactNode } from "react";

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
    },
  },
};

const iconVariants: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: "easeOut",
      type: "spring",
      stiffness: 200,
      damping: 15,
    },
  },
};

const textVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
      delay: 0.2,
    },
  },
};

const cardGridVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      delayChildren: 0.1,
    },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

const spinVariants: Variants = {
  animate: {
    rotate: 360,
    transition: {
      duration: 10,
      ease: "linear",
      repeat: Infinity,
    },
  },
};

export function useMaintenancePolling() {
  useMaintenance();
}

interface AnimatedContainerProps {
  children: ReactNode;
}

export function AnimatedContainer({ children }: AnimatedContainerProps) {
  return (
    <motion.div
      className="mx-auto flex max-w-4xl flex-col gap-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      layout
    >
      {children}
    </motion.div>
  );
}

interface AnimatedSectionProps {
  children: ReactNode;
  className?: string;
}

export function AnimatedSection({ children, className }: AnimatedSectionProps) {
  return (
    <motion.div className={className} variants={itemVariants}>
      {children}
    </motion.div>
  );
}

interface AnimatedIconWrapperProps {
  children: ReactNode;
}

export function AnimatedIconWrapper({ children }: AnimatedIconWrapperProps) {
  return (
    <motion.div className="mb-4" variants={iconVariants} animate="animate">
      <motion.div variants={spinVariants} animate="animate">
        {children}
      </motion.div>
    </motion.div>
  );
}

interface AnimatedTextProps {
  children: ReactNode;
}

export function AnimatedText({ children }: AnimatedTextProps) {
  return <motion.div variants={textVariants}>{children}</motion.div>;
}

interface AnimatedCardGridProps {
  children: ReactNode;
}

export function AnimatedCardGrid({ children }: AnimatedCardGridProps) {
  return (
    <motion.div
      className="grid gap-4 md:grid-cols-2"
      variants={cardGridVariants}
    >
      {children}
    </motion.div>
  );
}

interface AnimatedCardProps {
  children: ReactNode;
}

export function AnimatedCard({ children }: AnimatedCardProps) {
  return <motion.div variants={cardVariants}>{children}</motion.div>;
}

export function MaintenancePollingWrapper({
  children,
}: {
  children: ReactNode;
}) {
  useMaintenance();
  return <>{children}</>;
}
