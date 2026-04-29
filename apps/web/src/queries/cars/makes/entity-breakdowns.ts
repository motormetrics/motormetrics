import {
  and,
  cars,
  db,
  desc,
  eq,
  ilike,
  type SelectCar,
  sql,
} from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";
import { FUEL_TYPE, type TypeConfig, VEHICLE_TYPE } from "../categories";

export interface MakeDetails {
  total: number;
  data: Partial<SelectCar>[];
}

export interface MakeMonthlyTotal {
  month: string;
  count: number;
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

interface VehicleTypeData {
  total: number;
  data: Array<{
    month: string;
    make: string;
    vehicleType: string;
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

const VEHICLE_TYPE_BREAKDOWN: BreakdownConfig = {
  ...VEHICLE_TYPE,
  cachePrefix: "cars:vehicle",
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

export async function getMakeFuelTypeBreakdown(
  make: string,
  month?: string | null,
): Promise<{ name: string; value: number }[]> {
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

  const rows = await db
    .select({
      name: cars.fuelType,
      value: sql<number>`cast(sum(${cars.number}) as int)`,
    })
    .from(cars)
    .where(and(...whereConditions))
    .groupBy(cars.fuelType)
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  return rows
    .filter((row) => row.name)
    .map((row) => ({ name: row.name!, value: row.value }));
}

export async function getMakeVehicleTypeBreakdown(
  make: string,
  month?: string | null,
): Promise<{ name: string; value: number }[]> {
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

  const rows = await db
    .select({
      name: cars.vehicleType,
      value: sql<number>`cast(sum(${cars.number}) as int)`,
    })
    .from(cars)
    .where(and(...whereConditions))
    .groupBy(cars.vehicleType)
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  return rows
    .filter((row) => row.name)
    .map((row) => ({ name: row.name!, value: row.value }));
}

export async function getVehicleTypeData(
  vehicleType: string,
  month?: string,
): Promise<VehicleTypeData> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:vehicle:${vehicleType}`);
  if (month) {
    cacheTag(`cars:month:${month}`);
  }

  const result = await queryTypeBreakdown(
    VEHICLE_TYPE_BREAKDOWN,
    vehicleType,
    month,
  );
  return result as VehicleTypeData;
}

export async function getMakeMonthlyTotals(
  make: string,
): Promise<MakeMonthlyTotal[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:make:${make}`);

  return db
    .select({
      month: cars.month,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(ilike(cars.make, make))
    .groupBy(cars.month)
    .orderBy(desc(cars.month));
}
