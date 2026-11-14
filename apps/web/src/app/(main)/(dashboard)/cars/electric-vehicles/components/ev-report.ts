import {
  batteryElectricShares,
  buildRegistrationSplit,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  COMBUSTION_COLOUR,
  POWERTRAIN_SEGMENTS,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/constants";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/search-params";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/**
 * The selected month, powertrain and range. The page starts it once and hands
 * the promise to each part, which awaits it behind its own boundary, so the
 * headings and labels around the figures stay in the static shell.
 */
export async function loadEvSelection(searchParams: Promise<SearchParams>) {
  const {
    month: requestedMonth,
    powertrain,
    range,
  } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(requestedMonth, "cars");

  return { month, powertrain, range };
}

export type EvSelection = Awaited<ReturnType<typeof loadEvSelection>>;

export interface SelectionProps {
  /** Not awaited by the section itself, only by the parts of it that wait. */
  selection: Promise<EvSelection>;
}

/**
 * The selected month's shares and powertrain split, for the head and the mix
 * figure. Null when the month has no registrations. The queries are
 * `'use cache'`, so each part calling it reads the same entries.
 */
export async function loadEvMonth(month: string) {
  const [trend, marketShare] = await Promise.all([
    getEvMonthlyTrend(),
    getEvMarketShare(),
  ]);

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const point = trend[index];
  if (!point) {
    return null;
  }

  const totals = new Map(marketShare.map((row) => [row.month, row.totalCount]));
  const electrifiedShareAt = (position: number) => {
    const entry = trend[position];
    const total = entry ? totals.get(entry.month) : undefined;
    return entry && total
      ? ((entry.BEV + entry.PHEV + entry.Hybrid) / total) * 100
      : 0;
  };
  const shares = batteryElectricShares(trend, marketShare);
  const total = totals.get(point.month) ?? 0;

  return {
    electrifiedShare: electrifiedShareAt(index),
    index,
    point,
    previousElectrifiedShare:
      index > 0 ? electrifiedShareAt(index - 1) : undefined,
    previousMonth: trend[index - 1]?.month,
    previousShare: index > 0 ? shares[index - 1] : undefined,
    share: shares[index] ?? 0,
    shares,
    split: buildRegistrationSplit(point, total, POWERTRAIN_SEGMENTS, {
      colour: COMBUSTION_COLOUR,
      label: "Petrol and diesel",
    }),
    total,
  };
}
