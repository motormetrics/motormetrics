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

export interface ParfResult {
  newCapped: boolean;
  newRebate: number;
  oldCapped: boolean;
  oldRebate: number;
  oldUncapped: number;
  shortfall: number;
}

/** The rebate on an ARF under both schedules, each with its own cap. */
export function calculateParf(arf: number, bracket: AgeBracket): ParfResult {
  const oldUncapped = arf * bracket.oldRate;
  const newUncapped = arf * bracket.newRate;
  const oldRebate = Math.min(oldUncapped, OLD_CAP);
  const newRebate = Math.min(newUncapped, NEW_CAP);

  return {
    newCapped: newUncapped > NEW_CAP,
    newRebate,
    oldCapped: oldUncapped > OLD_CAP,
    oldRebate,
    oldUncapped,
    shortfall: oldRebate - newRebate,
  };
}

/**
 * The cut in percentage points across the brackets that pay a rebate, as one
 * figure when every bracket falls by the same amount, otherwise `null`.
 */
export function uniformRateCut(brackets: readonly AgeBracket[]): number | null {
  const cuts = new Set(
    brackets
      .filter(({ oldRate }) => oldRate > 0)
      .map(({ newRate, oldRate }) => Math.round((oldRate - newRate) * 100)),
  );
  return cuts.size === 1 ? [...cuts][0] : null;
}

/** Whole Singapore dollars, as the calculator's money fields show them. */
export const SGD_FORMAT: Intl.NumberFormatOptions = {
  currency: "SGD",
  currencyDisplay: "narrowSymbol",
  maximumFractionDigits: 0,
  style: "currency",
};
