export interface AgeBracket {
  key: string;
  label: string;
  newRate: number;
  oldRate: number;
}

/**
 * The rebate schedule either side of Budget 2026.
 *
 * A plain module rather than a constant inside the calculator: the comparison
 * table is a server component, and every export of a `"use client"` module
 * crosses the boundary as a client reference rather than as its value.
 */
export const AGE_BRACKETS: AgeBracket[] = [
  { key: "0", label: "5 years or younger", newRate: 0.3, oldRate: 0.75 },
  { key: "1", label: "More than 5 to 6 years", newRate: 0.25, oldRate: 0.7 },
  { key: "2", label: "More than 6 to 7 years", newRate: 0.2, oldRate: 0.65 },
  { key: "3", label: "More than 7 to 8 years", newRate: 0.15, oldRate: 0.6 },
  { key: "4", label: "More than 8 to 9 years", newRate: 0.1, oldRate: 0.55 },
  { key: "5", label: "More than 9 to 10 years", newRate: 0.05, oldRate: 0.5 },
  { key: "6", label: "Over 10 years", newRate: 0, oldRate: 0 },
];

export const OLD_CAP = 60_000;
export const NEW_CAP = 30_000;

export interface CoePeriod {
  key: string;
  label: string;
  /** The cap on the old schedule, or `null` where it had none. */
  oldCap: number | null;
}

/**
 * When the COE was obtained decides the cap under the old schedule: the
 * $60,000 cap covers COEs from the 2nd February 2023 exercise to the 1st
 * February 2026 exercise, and COEs obtained before that have no cap.
 */
export const COE_PERIODS: CoePeriod[] = [
  { key: "2023", label: "Feb 2023 to Feb 2026", oldCap: OLD_CAP },
  { key: "pre-2023", label: "Before Feb 2023", oldCap: null },
];
