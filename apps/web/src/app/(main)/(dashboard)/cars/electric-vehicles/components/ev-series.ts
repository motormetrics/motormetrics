import type {
  Powertrain,
  Range,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import type {
  EvMarketShare,
  EvMonthlyTrend,
  FuelTypeData,
} from "@web/queries/cars";
import type { Make } from "@web/types/cars";

/** Number of months each range keeps; `null` keeps the whole series. */
const RANGE_MONTHS: Record<Range, number | null> = {
  "1Y": 12,
  "3Y": 36,
  All: null,
};

/**
 * Index of `month` in an ascending month series.
 *
 * Falls back to the newest month at or before the requested one, and to the
 * newest month overall — the month picker is fed the full car-registration
 * month list, which runs ahead of the months that carry EV rows.
 */
export function resolveMonthIndex(months: string[], month: string): number {
  if (months.length === 0) {
    return -1;
  }

  const exact = months.indexOf(month);
  if (exact !== -1) {
    return exact;
  }

  let fallback = -1;
  for (const [index, candidate] of months.entries()) {
    if (candidate <= month) {
      fallback = index;
    }
  }

  return fallback === -1 ? months.length - 1 : fallback;
}

/** Registrations for one powertrain in a month, or the electrified total. */
export function powertrainTotal(
  point: EvMonthlyTrend,
  powertrain: Powertrain,
): number {
  switch (powertrain) {
    case "bev":
      return point.BEV;
    case "phev":
      return point.PHEV;
    case "hybrid":
      return point.Hybrid;
    default:
      return point.BEV + point.PHEV + point.Hybrid;
  }
}

/** The window a range tab shows: `range` months ending at `endIndex`. */
export function sliceRange<Item>(
  series: Item[],
  endIndex: number,
  range: Range,
): Item[] {
  if (endIndex < 0) {
    return [];
  }

  const months = RANGE_MONTHS[range];
  const start = months === null ? 0 : Math.max(0, endIndex - months + 1);

  return series.slice(start, endIndex + 1);
}

/** Signed month-over-month change as a ratio, e.g. `0.084` for +8.4%. */
export function changeRatio(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return (current - previous) / previous;
}

/**
 * Battery-electric share of all new car registrations, one entry per month of
 * `trend`.
 *
 * `getEvMarketShare()` already reports a share, but it counts hybrids as EVs.
 * The hero and the adoption chart both headline battery-electric alone, so the
 * share is recomputed from the BEV column against that query's month totals.
 */
export function batteryElectricShares(
  trend: EvMonthlyTrend[],
  marketShare: EvMarketShare[],
): number[] {
  const registrationsByMonth = new Map(
    marketShare.map((row) => [row.month, row.totalCount]),
  );

  return trend.map((point) => {
    const total = registrationsByMonth.get(point.month);
    return total ? (point.BEV / total) * 100 : 0;
  });
}

export interface RegistrationSegment {
  colour: string;
  label: string;
  /** Share of the month's registrations, 0-100. */
  share: number;
  value: number;
}

/**
 * Split a month's car registrations into the powertrains the comp's bar shows.
 *
 * `total` is every registration that month, so the trailing segment absorbs
 * petrol, diesel and anything else LTA reports.
 */
export function buildRegistrationSplit(
  point: EvMonthlyTrend,
  total: number,
  segmentColours: { colour: string; key: Powertrain; label: string }[],
  combustion: { colour: string; label: string },
): RegistrationSegment[] {
  const divisor = total || 1;
  const electrified = point.BEV + point.PHEV + point.Hybrid;

  const segments = segmentColours.map(({ colour, key, label }) => {
    const value = powertrainTotal(point, key);
    return { colour, label, share: (value / divisor) * 100, value };
  });

  const remainder = Math.max(total - electrified, 0);

  return [
    ...segments,
    {
      colour: combustion.colour,
      label: combustion.label,
      share: (remainder / divisor) * 100,
      value: remainder,
    },
  ];
}

/**
 * Battery-electric registrations per make from January of the selected
 * month's year up to and including that month.
 *
 * `getFuelTypeData()` matches its fuel type with a wildcard pattern, so the
 * rows are re-filtered on an exact `fuelType` match before summing.
 */
export function yearToDateMakes(
  rows: FuelTypeData["data"],
  included: readonly string[],
  month: string,
): Make[] {
  const start = `${month.slice(0, 4)}-01`;
  const totals = new Map<string, number>();

  for (const row of rows) {
    if (
      !included.includes(row.fuelType) ||
      row.month < start ||
      row.month > month
    ) {
      continue;
    }
    totals.set(row.make, (totals.get(row.make) ?? 0) + row.count);
  }

  return Array.from(totals, ([make, count]) => ({ make, count }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count || a.make.localeCompare(b.make));
}
