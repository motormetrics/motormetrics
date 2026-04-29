import { cars, coe, db, deregistrations } from "@motormetrics/database";
import { and, asc, eq, gt, ilike, sql } from "drizzle-orm";

export function getCarsAggregatedByMonth(month: string) {
  return db
    .select({
      month: cars.month,
      make: cars.make,
      fuelType: cars.fuelType,
      vehicleType: cars.vehicleType,
      number: sql<number>`cast(sum(${cars.number}) as integer)`,
    })
    .from(cars)
    .where(and(eq(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.month, cars.make, cars.fuelType, cars.vehicleType)
    .orderBy(asc(cars.make));
}

export async function getCoeForMonth(month: string) {
  return db.query.coe.findMany({
    columns: { id: false },
    where: eq(coe.month, month),
    orderBy: [asc(coe.biddingNo), asc(coe.vehicleClass)],
  });
}

export function getDeregistrationsForMonth(month: string) {
  return db
    .select({
      month: deregistrations.month,
      category: deregistrations.category,
      number: sql<number>`cast(sum(${deregistrations.number}) as integer)`,
    })
    .from(deregistrations)
    .where(eq(deregistrations.month, month))
    .groupBy(deregistrations.month, deregistrations.category)
    .orderBy(asc(deregistrations.category));
}

export function getEvDataForMonth(month: string) {
  return db
    .select({
      month: cars.month,
      make: cars.make,
      fuelType: cars.fuelType,
      vehicleType: cars.vehicleType,
      number: sql<number>`cast(sum(${cars.number}) as integer)`,
    })
    .from(cars)
    .where(
      and(
        eq(cars.month, month),
        ilike(cars.fuelType, "%electric%"),
        gt(cars.number, 0),
      ),
    )
    .groupBy(cars.month, cars.make, cars.fuelType, cars.vehicleType)
    .orderBy(asc(cars.make));
}
