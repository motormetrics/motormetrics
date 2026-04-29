import { and, cars, db, desc, eq, gt, sum } from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";
import { FUEL_TYPE, type TypeConfig, VEHICLE_TYPE } from "./categories";

export async function getDistinctMakes() {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  return db.selectDistinct({ make: cars.make }).from(cars).orderBy(cars.make);
}

function queryDistinctTypeValues(config: TypeConfig, month?: string) {
  const filters = [];

  if (month) {
    filters.push(eq(cars.month, month));
  }

  return (
    db
      // biome-ignore lint/suspicious/noExplicitAny: computed property key requires type assertion for Drizzle's SelectedFields
      .select({ [config.fieldName]: config.column } as any)
      .from(cars)
      .where(filters.length > 0 ? and(...filters) : undefined)
      .groupBy(config.column)
      .having(gt(sum(cars.number), 0))
      .orderBy(config.column)
  );
}

export async function getDistinctFuelTypes(
  month?: string,
): Promise<{ fuelType: string }[]> {
  "use cache";
  cacheLife("max");
  if (month) {
    cacheTag(`cars:month:${month}`);
  }

  const result = await queryDistinctTypeValues(FUEL_TYPE, month);
  return result as { fuelType: string }[];
}

export async function getDistinctVehicleTypes(
  month?: string,
): Promise<{ vehicleType: string }[]> {
  "use cache";
  cacheLife("max");
  if (month) {
    cacheTag(`cars:month:${month}`);
  }

  const result = await queryDistinctTypeValues(VEHICLE_TYPE, month);
  return result as { vehicleType: string }[];
}

export async function getCarsMonths(): Promise<{ month: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag("cars:months");

  return db
    .selectDistinct({ month: cars.month })
    .from(cars)
    .orderBy(desc(cars.month));
}
