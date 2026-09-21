import { db } from "@motormetrics/database/client";
import { cars, coe, deregistrations } from "@motormetrics/database/schema";
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
    where: { month },
    orderBy: { biddingNo: "asc", vehicleClass: "asc" },
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

/**
 * Total car registrations for the month across every fuel type.
 *
 * `getEvDataForMonth` returns only the electrified subset, so the EV post has
 * no way to compute a true market share from its own data. Pass this alongside
 * it as the denominator.
 */
export async function getTotalRegistrationsForMonth(month: string) {
  const [row] = await db
    .select({
      total: sql<number>`cast(coalesce(sum(${cars.number}), 0) as integer)`,
    })
    .from(cars)
    .where(and(eq(cars.month, month), gt(cars.number, 0)));

  return row?.total ?? 0;
}

/**
 * The electrified subset for the month.
 *
 * Note the `%electric%` match is deliberately wide: it returns Electric,
 * Petrol-Electric, Petrol-Electric (Plug-In) and Diesel-Electric, not BEVs
 * alone. Anything computing a BEV figure must filter on the exact fuel type.
 */
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
