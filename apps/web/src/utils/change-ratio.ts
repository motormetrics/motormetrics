/**
 * Signed change as a ratio, e.g. `0.084` for +8.4%. Returns 0 when there is no
 * usable baseline, which every caller renders as "no movement" rather than as
 * an infinite jump.
 */
export function changeRatio(current: number, previous?: number): number {
  if (!previous || previous <= 0) {
    return 0;
  }

  return (current - previous) / previous;
}

/** Percentage change, guarding the division so an absent base reads as flat. */
export function percentageChange(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}
