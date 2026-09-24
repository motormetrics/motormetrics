import { db } from "@motormetrics/database/client";
import { cars } from "@motormetrics/database/schema";
import { desc, eq, gt, sum } from "drizzle-orm";
import { cacheLife, cacheTag } from "next/cache";

export async function getDistinctMakes() {
  "use cache";
  cacheLife("max");
  cacheTag("cars:makes");

  return db.selectDistinct({ make: cars.make }).from(cars).orderBy(cars.make);
}

/** Restricts to one month when given, and drops values with no registrations. */
const monthFilter = (month?: string) =>
  month ? eq(cars.month, month) : undefined;

const hasRegistrations = gt(sum(cars.number), 0);

export async function getDistinctFuelTypes(
  month?: string,
): Promise<{ fuelType: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(month ? `cars:month:${month}` : "cars:annual");

  return db
    .select({ fuelType: cars.fuelType })
    .from(cars)
    .where(monthFilter(month))
    .groupBy(cars.fuelType)
    .having(hasRegistrations)
    .orderBy(cars.fuelType);
}

export async function getDistinctVehicleTypes(
  month?: string,
): Promise<{ vehicleType: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(month ? `cars:month:${month}` : "cars:annual");

  return db
    .select({ vehicleType: cars.vehicleType })
    .from(cars)
    .where(monthFilter(month))
    .groupBy(cars.vehicleType)
    .having(hasRegistrations)
    .orderBy(cars.vehicleType);
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
