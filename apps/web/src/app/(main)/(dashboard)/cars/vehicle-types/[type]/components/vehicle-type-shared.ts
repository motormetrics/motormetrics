import {
  DEFAULT_PERIOD,
  PERIODS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { checkVehicleTypeIfExist } from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";
import { createLoader, parseAsString, parseAsStringLiteral } from "nuqs/server";

export const loadVehicleTypeSearchParams = createLoader({
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault(DEFAULT_PERIOD),
});

export interface VehicleTypeReportProps {
  params: Promise<{ type: string }>;
  searchParams: Promise<SearchParams>;
}

export function share(part: number, whole: number): number {
  return whole > 0 ? (part / whole) * 100 : 0;
}

export async function resolveVehicleType(
  type: string,
): Promise<string | undefined> {
  return (await checkVehicleTypeIfExist(type))?.vehicleType;
}
