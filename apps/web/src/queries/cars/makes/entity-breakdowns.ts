import { db } from "@motormetrics/database/client";
import { cars, type SelectCar } from "@motormetrics/database/schema";
import { and, desc, eq, ilike, sql } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";
import { FUEL_TYPE, type TypeConfig } from "../categories";

export interface MakeDetails {
  total: number;
  data: Partial<SelectCar>[];
}

export interface FuelTypeData {
  total: number;
  data: Array<{
    month: string;
    make: string;
    fuelType: string;
    count: number;
  }>;
}

interface BreakdownConfig extends TypeConfig {
  cachePrefix: string;
}

const FUEL_TYPE_BREAKDOWN: BreakdownConfig = {
  ...FUEL_TYPE,
  cachePrefix: "cars:fuel",
};

async function queryTypeBreakdown(
  config: BreakdownConfig,
  value: string,
  month?: string,
) {
  const pattern = value.replaceAll("-", "%");
  const whereConditions = [ilike(config.column, pattern)];

  if (month) {
    whereConditions.push(eq(cars.month, month));
  }

  const [totalResult, data] = await db.batch([
    db
      .select({
        total: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(and(...whereConditions)),
    db
      .select({
        month: cars.month,
        make: cars.make,
        [config.fieldName]: config.column,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
        // biome-ignore lint/suspicious/noExplicitAny: computed property key requires type assertion for Drizzle's SelectedFields
      } as any)
      .from(cars)
      .where(and(...whereConditions))
      .groupBy(cars.month, cars.make, config.column)
      .orderBy(desc(sql<number>`sum(${cars.number})`)),
  ]);

  return {
    total: totalResult[0]?.total ?? 0,
    data,
  };
}

export async function getMakeDetails(
  make: string,
  month?: string | null,
): Promise<MakeDetails> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:make:${make}`);
  if (month) {
    cacheTag(`cars:month:${month}`);
  }

  const whereConditions = [ilike(cars.make, make)];

  if (month) {
    whereConditions.push(eq(cars.month, month));
  }

  const [totalResult, data] = await db.batch([
    db
      .select({
        total: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(and(...whereConditions)),
    db
      .select({
        month: cars.month,
        fuelType: cars.fuelType,
        vehicleType: cars.vehicleType,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(and(...whereConditions))
      .groupBy(cars.month, cars.fuelType, cars.vehicleType)
      .orderBy(desc(cars.month)),
  ]);

  return {
    total: totalResult[0]?.total ?? 0,
    data,
  };
}

export async function getFuelTypeData(
  fuelType: string,
  month?: string,
): Promise<FuelTypeData> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:fuel:${fuelType}`);
  if (month) {
    cacheTag(`cars:month:${month}`);
  }

  const result = await queryTypeBreakdown(FUEL_TYPE_BREAKDOWN, fuelType, month);
  return result as FuelTypeData;
}
