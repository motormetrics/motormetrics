import { and, cars, db, desc, eq, gt, sql } from "@motormetrics/database";
import {
  calculateMarketShareData,
  findDominantType,
} from "@web/lib/cars/calculations";
import { getCarsData } from "@web/queries/cars/monthly-registrations";
import type { FuelType, TopType } from "@web/types/cars";
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

export async function getTopTypes(month: string): Promise<TopType> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const topFuelTypeQuery = db
    .select({
      name: cars.fuelType,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.fuelType)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(1);

  const topVehicleTypeQuery = db
    .select({
      name: cars.vehicleType,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.vehicleType)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(1);

  const [topFuelTypeResult, topVehicleTypeResult] = await db.batch([
    topFuelTypeQuery,
    topVehicleTypeQuery,
  ]);

  const topFuelType = topFuelTypeResult[0] ?? { name: "N/A", total: 0 };
  const topVehicleType = topVehicleTypeResult[0] ?? { name: "N/A", total: 0 };

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

  return db
    .select({
      make: cars.make,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.make)
    .orderBy(desc(sql<number>`sum(${cars.number})`))
    .limit(10);
}

export async function getTopMakesByFuelType(
  month: string,
): Promise<FuelType[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const fuelTypeResults = await db
    .select({
      fuelType: cars.fuelType,
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(and(eq(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.fuelType)
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  if (fuelTypeResults.length === 0) {
    return [];
  }

  const topMakesQueries = fuelTypeResults.map(({ fuelType }) =>
    db
      .select({
        make: cars.make,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(and(eq(cars.month, month), eq(cars.fuelType, fuelType)))
      .groupBy(cars.make)
      .orderBy(desc(sql<number>`sum(${cars.number})`))
      .limit(5),
  );

  // Use db.batch() for single network round-trip
  const topMakesResults = await db.batch(
    topMakesQueries as [
      (typeof topMakesQueries)[0],
      ...(typeof topMakesQueries)[number][],
    ],
  );

  return fuelTypeResults.map(({ fuelType, total }, index) => ({
    fuelType,
    total,
    makes: topMakesResults[index].map(({ make, count }) => ({ make, count })),
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
