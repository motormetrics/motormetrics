/** One fuel type × vehicle type cell of the mix table. */
export interface MixRow {
  /** Percentage change against the same months a year earlier. */
  change: number;
  count: number;
  fuelType: string;
  /** 1-based position by registrations, kept whichever way the table sorts. */
  rank: number;
  /** Already formatted for display, e.g. "Hatchback". */
  vehicleType: string;
}

export type MixSortKey = "change" | "count" | "fuelType" | "vehicleType";
export type MixSortDirection = "asc" | "desc";

/** Text columns open A to Z; figures open largest first. */
export function defaultMixDirection(key: MixSortKey): MixSortDirection {
  return key === "fuelType" || key === "vehicleType" ? "asc" : "desc";
}

export function sortMixRows(
  rows: readonly MixRow[],
  key: MixSortKey,
  direction: MixSortDirection,
): MixRow[] {
  return [...rows].sort((a, b) => {
    const order =
      key === "fuelType" || key === "vehicleType"
        ? a[key].localeCompare(b[key])
        : a[key] - b[key];
    return direction === "asc" ? order : -order;
  });
}
