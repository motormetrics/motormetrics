import { formatMonth } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";

/** "Sep 2026 · 2nd", the short name for an exercise. */
export const exerciseStamp = (exercise: { biddingNo: number; month: string }) =>
  `${formatMonth(exercise.month, "short")} · ${exercise.biddingNo === 1 ? "1st" : "2nd"}`;
