import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import {
  calculateMarketShareData,
  findDominantType,
} from "@web/lib/cars/calculations";
import { getCarsData } from "@web/queries/cars/monthly-registrations";
import type { FuelType, TopType } from "@web/types/cars";
import { and, desc, eq, gt, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export interface CarMarketShareData {
  name: string;
  count: number;
  percentage: number;
  colour: string;
}

export interface CarMarketShareResponse {
  month: string;
  total: number;
  category: "fuelType" | "vehicleType";
  data: CarMarketShareData[];
  dominantType: {
    name: string;
    percentage: number;
  };
}

export interface CarTopTypeData {
  name: string;
  count: number;
  percentage: number;
  rank: number;
}

export interface CarTopMakeData {
  make: string;
  count: number;
  percentage: number;
  rank: number;
  fuelType?: string;
  vehicleType?: string;
}

export interface CarTopPerformersData {
  month: string;
  total: number;
  topFuelTypes: CarTopTypeData[];
  topVehicleTypes: CarTopTypeData[];
  topMakes: CarTopMakeData[];
}

interface TopMake {
  make: string;
  total: number;
}

/** Makes reported per fuel type by `getTopMakesByFuelType()`. */
const TOP_MAKES_PER_FUEL_TYPE = 5;

export async function getTopTypes(month: string): Promise<TopType> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const topFuelTypeQuery = db
    .select({
      name: cars.fuelType,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.fuelType)
    .orderBy(desc(sum(cars.number)))
    .limit(1);

  const topVehicleTypeQuery = db
    .select({
      name: cars.vehicleType,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.vehicleType)
    .orderBy(desc(sum(cars.number)))
    .limit(1);

  const [topFuelTypeResult, topVehicleTypeResult] = await db.batch([
    topFuelTypeQuery,
    topVehicleTypeQuery,
  ]);

  // `sum()` is null only for an empty group, which a GROUP BY cannot produce
  const [topFuelTypeRow] = topFuelTypeResult;
  const [topVehicleTypeRow] = topVehicleTypeResult;

  const topFuelType = topFuelTypeRow
    ? { name: topFuelTypeRow.name, total: topFuelTypeRow.total ?? 0 }
    : { name: "N/A", total: 0 };
  const topVehicleType = topVehicleTypeRow
    ? { name: topVehicleTypeRow.name, total: topVehicleTypeRow.total ?? 0 }
    : { name: "N/A", total: 0 };

  return {
    month,
    topFuelType,
    topVehicleType,
  };
}

export async function getTopMakes(month: string): Promise<TopMake[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const rows = await db
    .select({
      make: cars.make,
      total: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.make)
    .orderBy(desc(sum(cars.number)))
    .limit(10);

  // `sum()` is null only for an empty group, which a GROUP BY cannot produce
  return rows.map(({ make, total }) => ({ make, total: total ?? 0 }));
}

export async function getTopMakesByFuelType(
  month: string,
): Promise<FuelType[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  // One grouped scan, ranked here, rather than a query for the fuel types
  // followed by a batched query per fuel type. The batch was a single
  // round-trip but its statements still ran serially, re-scanning the same
  // month once per fuel type. A month spans a closed set of fuel types and
  // well under a hundred makes, so the grouped rows are cheap to carry.
  const rows = await db
    .select({
      fuelType: cars.fuelType,
      make: cars.make,
      count: sum(cars.number).mapWith(Number),
    })
    .from(cars)
    .where(and(eq(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.fuelType, cars.make);

  const byFuelType = new Map<string, FuelType>();

  for (const row of rows) {
    const entry = byFuelType.get(row.fuelType) ?? {
      fuelType: row.fuelType,
      total: 0,
      makes: [],
    };

    // `sum()` is null only for an empty group, which a GROUP BY cannot produce
    const count = row.count ?? 0;

    entry.total += count;
    entry.makes.push({ make: row.make, count });
    byFuelType.set(row.fuelType, entry);
  }

  return Array.from(byFuelType.values())
    .sort((first, second) => second.total - first.total)
    .map((entry) => ({
      ...entry,
      makes: entry.makes
        .sort((first, second) => second.count - first.count)
        .slice(0, TOP_MAKES_PER_FUEL_TYPE),
    }));
}

export async function getCarMarketShareData(
  month: string,
  category: "fuelType" | "vehicleType",
): Promise<CarMarketShareResponse> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`, `cars:category:${category}`);

  const response = await getCarsData(month);
  const categoryData = response[category];
  const total = response.total;

  const marketShareData = calculateMarketShareData(categoryData, total);
  const dominantType = findDominantType(marketShareData);

  return {
    month: response.month,
    total,
    category,
    data: marketShareData,
    dominantType,
  };
}
