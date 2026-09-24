export interface ArfTier {
  /** Upper bound of the OMV band, or `null` for the open top band. */
  upTo: number | null;
  rate: number;
}

export interface ArfSchedule {
  key: string;
  label: string;
  tiers: ArfTier[];
}

/**
 * The car ARF schedules LTA has applied, newest first. Each is keyed to when
 * the car's COE was obtained.
 *
 * A plain module rather than a constant inside the calculator: the tier table
 * is a server component, and every export of a `"use client"` module crosses
 * the boundary as a client reference rather than as its value.
 */
export const ARF_SCHEDULES: ArfSchedule[] = [
  {
    key: "2023",
    label: "From Feb 2023",
    tiers: [
      { upTo: 20_000, rate: 1 },
      { upTo: 40_000, rate: 1.4 },
      { upTo: 60_000, rate: 1.9 },
      { upTo: 80_000, rate: 2.5 },
      { upTo: null, rate: 3.2 },
    ],
  },
  {
    key: "2022",
    label: "Feb 2022 to Feb 2023",
    tiers: [
      { upTo: 20_000, rate: 1 },
      { upTo: 50_000, rate: 1.4 },
      { upTo: 80_000, rate: 1.8 },
      { upTo: null, rate: 2.2 },
    ],
  },
  {
    key: "pre-2022",
    label: "Before Feb 2022",
    tiers: [
      { upTo: 20_000, rate: 1 },
      { upTo: 50_000, rate: 1.4 },
      { upTo: null, rate: 1.8 },
    ],
  },
];

export interface ArfBand {
  from: number;
  to: number;
  rate: number;
  amount: number;
}

/** The ARF on an OMV, band by band. Bands the OMV does not reach are left out. */
export function calculateArf(
  omv: number,
  tiers: ArfTier[],
): { total: number; bands: ArfBand[] } {
  const bands: ArfBand[] = [];
  let from = 0;

  for (const { upTo, rate } of tiers) {
    if (omv <= from) {
      break;
    }

    const to = upTo === null ? omv : Math.min(omv, upTo);
    bands.push({ from, to, rate, amount: (to - from) * rate });
    from = to;
  }

  return {
    total: bands.reduce((total, band) => total + band.amount, 0),
    bands,
  };
}
