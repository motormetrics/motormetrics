import type { MakeFigures } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/figures";
import {
  type Leader,
  leaderOf,
  shareOf,
} from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/summary";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/**
 * The fuel types every comparison lists, by LTA name, with the plain gloss set
 * under each. LTA's names are what readers search for and cite; the gloss is
 * what they mean.
 */
const FUEL_GLOSSES = [
  { fuelType: "Electric", gloss: "Battery electric" },
  { fuelType: "Petrol-Electric", gloss: "Hybrid" },
  { fuelType: "Petrol-Electric (Plug-In)", gloss: "Plug-in hybrid" },
  { fuelType: "Petrol", gloss: "Petrol only" },
] as const;

/** The vehicle types with rows of their own; the rest share "Other". */
const MAIN_VEHICLE_TYPES = [
  { label: "SUV", vehicleType: "Sports Utility Vehicle" },
  { label: "Sedan", vehicleType: "Sedan" },
] as const;

export interface ShareRow {
  /** Share of make A's year-to-date registrations: "12.3%". */
  a: string;
  b: string;
  gloss?: string;
  key: string;
  label: string;
  leader: Leader;
}

type Make = Pick<MakeFigures, "fuelCounts" | "vehicleCounts" | "ytd">;

const sumExcept = (counts: Map<string, number>, excluded: Set<string>) =>
  [...counts].reduce(
    (total, [key, count]) => (excluded.has(key) ? total : total + count),
    0,
  );

function shareRow(
  key: string,
  label: string,
  countA: number,
  countB: number,
  a: Make,
  b: Make,
  gloss?: string,
): ShareRow {
  const shareA = shareOf(countA, a.ytd);
  const shareB = shareOf(countB, b.ytd);
  return {
    a: `${shareA.toFixed(1)}%`,
    b: `${shareB.toFixed(1)}%`,
    gloss,
    key,
    label,
    leader: leaderOf(shareA, shareB, 1),
  };
}

/**
 * Each make's year to date by fuel type, as shares of its own total. The four
 * glossed types always show; any other LTA type (diesel and its hybrids) rolls
 * into one "Other" row, shown only when either make has some.
 */
export function fuelShareRows(a: Make, b: Make): ShareRow[] {
  const rows = FUEL_GLOSSES.map(({ fuelType, gloss }) =>
    shareRow(
      fuelType,
      fuelType,
      a.fuelCounts.get(fuelType) ?? 0,
      b.fuelCounts.get(fuelType) ?? 0,
      a,
      b,
      gloss,
    ),
  );

  const listed = new Set<string>(FUEL_GLOSSES.map(({ fuelType }) => fuelType));
  const otherA = sumExcept(a.fuelCounts, listed);
  const otherB = sumExcept(b.fuelCounts, listed);
  if (otherA > 0 || otherB > 0) {
    rows.push(shareRow("other", "Other", otherA, otherB, a, b));
  }

  return rows;
}

/**
 * Each make's year to date by vehicle type: SUV, Sedan and the rest as
 * "Other", plus the full breakdown of "Other" for the disclosure under the
 * table. The breakdown merges LTA's two MPV types, as `formatVehicleType`
 * does, drops types neither make registered and lists the largest first.
 */
export function vehicleShareRows(
  a: Make,
  b: Make,
): { otherBreakdown: ShareRow[]; rows: ShareRow[] } {
  const listed = new Set<string>(
    MAIN_VEHICLE_TYPES.map(({ vehicleType }) => vehicleType),
  );

  const rows = MAIN_VEHICLE_TYPES.map(({ label, vehicleType }) =>
    shareRow(
      vehicleType,
      label,
      a.vehicleCounts.get(vehicleType) ?? 0,
      b.vehicleCounts.get(vehicleType) ?? 0,
      a,
      b,
    ),
  );
  rows.push(
    shareRow(
      "other",
      "Other",
      sumExcept(a.vehicleCounts, listed),
      sumExcept(b.vehicleCounts, listed),
      a,
      b,
    ),
  );

  const others = new Map<string, { countA: number; countB: number }>();
  const addOthers = (
    counts: Map<string, number>,
    side: "countA" | "countB",
  ) => {
    for (const [vehicleType, count] of counts) {
      if (listed.has(vehicleType)) {
        continue;
      }
      const label = formatVehicleType(vehicleType);
      const entry = others.get(label) ?? { countA: 0, countB: 0 };
      entry[side] += count;
      others.set(label, entry);
    }
  };
  addOthers(a.vehicleCounts, "countA");
  addOthers(b.vehicleCounts, "countB");

  const otherBreakdown = [...others]
    .filter(([, { countA, countB }]) => countA + countB > 0)
    .sort(
      ([, first], [, second]) =>
        second.countA + second.countB - (first.countA + first.countB),
    )
    .map(([label, { countA, countB }]) =>
      shareRow(label, label, countA, countB, a, b),
    );

  return { otherBreakdown, rows };
}
