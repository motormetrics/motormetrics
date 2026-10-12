export interface FuelRow {
  /** Percentage-point change in share on the same period a year earlier. */
  change: number;
  /** Chart-colour custom property, shared with the trend and the headline. */
  color: string;
  count: number;
  description: string;
  name: string;
  /** Percentage of the period's registrations. */
  share: number;
}

export type FuelSortKey = "change" | "count" | "name";

export type SortDirection = "ascending" | "descending";

/**
 * The fuel table's rows in the chosen order. Ties keep the incoming order,
 * which is largest first.
 */
export function sortFuelRows(
  rows: FuelRow[],
  key: FuelSortKey,
  direction: SortDirection,
): FuelRow[] {
  const sign = direction === "ascending" ? 1 : -1;

  return [...rows].sort((first, second) => {
    if (key === "name") {
      return sign * first.name.localeCompare(second.name);
    }
    return sign * (first[key] - second[key]);
  });
}
