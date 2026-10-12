export interface VehicleRow {
  /** Percentage-point change in share on the same period a year earlier. */
  change: number;
  /** Chart-colour custom property, shared with the trend and the headline. */
  color: string;
  count: number;
  description: string;
  /** Battery-electric share of the type, or `null` when LTA has no split. */
  electric: number | null;
  /** Display name, e.g. "SUV". */
  label: string;
  /** The value exactly as LTA records it, for the detail page slug. */
  name: string;
  /** Percentage of the period's registrations. */
  share: number;
}

export type VehicleSortKey = "change" | "count" | "electric" | "label";

export type SortDirection = "ascending" | "descending";

/**
 * The vehicle table's rows in the chosen order. Ties keep the incoming order,
 * which is largest first; a type without an electric split sorts lowest.
 */
export function sortVehicleRows(
  rows: VehicleRow[],
  key: VehicleSortKey,
  direction: SortDirection,
): VehicleRow[] {
  const sign = direction === "ascending" ? 1 : -1;

  return [...rows].sort((first, second) => {
    if (key === "label") {
      return sign * first.label.localeCompare(second.label);
    }
    return sign * ((first[key] ?? -1) - (second[key] ?? -1));
  });
}
