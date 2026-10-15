import { checkFuelTypeIfExist } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

/**
 * The window every aggregate on the page is measured over, anchored on the
 * month the header's month menu picks.
 */
export const PERIODS = ["month", "ytd", "12m"] as const;
export type Period = (typeof PERIODS)[number];

export const PERIOD_LABELS: Record<Period, string> = {
  "12m": "Last 12 months",
  month: "This month",
  ytd: "Year to date",
};

export const DEFAULT_PERIOD: Period = "ytd";

export const loadFuelTypeSearchParams = createLoader({
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault(DEFAULT_PERIOD),
});

export interface FuelTypeReportProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

export function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export async function resolveFuelType(
  type: string,
): Promise<string | undefined> {
  return (await checkFuelTypeIfExist(type))?.fuelType;
}
