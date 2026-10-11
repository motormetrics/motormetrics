/** One make in the vehicle type's by-make table. */
export interface MakeRow {
  /** Percentage change against the same months a year earlier. */
  change: number;
  count: number;
  logoUrl: string | null;
  make: string;
  /** 1-based position by registrations, kept whichever way the table sorts. */
  rank: number;
}

export type MakeSortKey = "change" | "count" | "make";
export type MakeSortDirection = "asc" | "desc";

/** The make column opens A to Z; figures open largest first. */
export function defaultMakeDirection(key: MakeSortKey): MakeSortDirection {
  return key === "make" ? "asc" : "desc";
}

export function sortMakeRows(
  rows: readonly MakeRow[],
  key: MakeSortKey,
  direction: MakeSortDirection,
): MakeRow[] {
  return [...rows].sort((a, b) => {
    const order =
      key === "make" ? a.make.localeCompare(b.make) : a[key] - b[key];
    return direction === "asc" ? order : -order;
  });
}
