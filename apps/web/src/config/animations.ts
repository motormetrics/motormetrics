import type { Variants } from "motion/react";

// Standard easing curve (Material Design standard)
const EASE_OUT: [number, number, number, number] = [0.4, 0, 0.2, 1];

// --- Stagger animations ---

export const staggerContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

export const staggerItemVariants: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: EASE_OUT } },
};

// --- Small chart marks ---
// Each mark takes its place in the row as `custom`, so the row draws in order.

const markTransition = (index: number) => ({
  delay: index * 0.04,
  duration: 0.4,
  ease: EASE_OUT,
});

/** A bar growing up from its baseline. */
export const growUpVariants: Variants = {
  hidden: { scaleY: 0 },
  visible: (index = 0) => ({ scaleY: 1, transition: markTransition(index) }),
};

/** A segment or line growing from its left end. */
export const growAcrossVariants: Variants = {
  hidden: { scaleX: 0 },
  visible: (index = 0) => ({ scaleX: 1, transition: markTransition(index) }),
};

/** A point fading in. */
export const fadeInVariants: Variants = {
  hidden: { opacity: 0 },
  visible: (index = 0) => ({ opacity: 1, transition: markTransition(index) }),
};
