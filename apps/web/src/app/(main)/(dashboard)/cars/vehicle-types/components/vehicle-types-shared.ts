/** How far back the trend chart reaches from the selected month. */
export const SERIES_MONTHS = 12;

/** One month of the charted vehicle types, in the same order as the columns. */
export interface MonthlyRow {
  cells: { count: number; share: number }[];
  month: string;
  total: number;
}

export function percentageOf(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}
