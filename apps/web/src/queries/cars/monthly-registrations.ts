import { cars, db, desc, eq, gt, sql, sum } from "@motormetrics/database";
import type { Comparison, Registration } from "@web/types/cars";
import { format, subMonths } from "date-fns";
import { cacheLife, cacheTag } from "next/cache";

export async function getCarsData(month: string): Promise<Registration> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const fuelTypeQuery = db
    .select({
      name: cars.fuelType,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.fuelType)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  const vehicleTypeQuery = db
    .select({
      name: cars.vehicleType,
      count: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month))
    .groupBy(cars.vehicleType)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(sql<number>`sum(${cars.number})`));

  const totalQuery = db
    .select({
      total: sql<number>`sum(${cars.number})`.mapWith(Number),
    })
    .from(cars)
    .where(eq(cars.month, month));

  const [fuelType, vehicleType, totalResult] = await db.batch([
    fuelTypeQuery,
    vehicleTypeQuery,
    totalQuery,
  ]);

  const total = totalResult[0]?.total ?? 0;

  return {
    month,
    total,
    fuelType,
    vehicleType,
  };
}

export async function getCarsComparison(month: string): Promise<Comparison> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`);

  const currentDate = new Date(`${month}-01`);
  const previousMonthDate = subMonths(currentDate, 1);
  const previousMonthStr = format(previousMonthDate, "yyyy-MM");
  const previousYearDate = subMonths(currentDate, 12);
  const previousYearStr = format(previousYearDate, "yyyy-MM");

  const createFuelTypeQuery = (m: string) =>
    db
      .select({
        label: cars.fuelType,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(eq(cars.month, m))
      .groupBy(cars.fuelType)
      .orderBy(desc(sql<number>`sum(${cars.number})`));

  const createVehicleTypeQuery = (m: string) =>
    db
      .select({
        label: cars.vehicleType,
        count: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(eq(cars.month, m))
      .groupBy(cars.vehicleType)
      .orderBy(desc(sql<number>`sum(${cars.number})`));

  const createTotalQuery = (m: string) =>
    db
      .select({
        total: sql<number>`sum(${cars.number})`.mapWith(Number),
      })
      .from(cars)
      .where(eq(cars.month, m));

  // Execute all 9 queries in a single batch (3 months × 3 query types)
  const [
    currentFuelType,
    currentVehicleType,
    currentTotal,
    previousMonthFuelType,
    previousMonthVehicleType,
    previousMonthTotal,
    previousYearFuelType,
    previousYearVehicleType,
    previousYearTotal,
  ] = await db.batch([
    createFuelTypeQuery(month),
    createVehicleTypeQuery(month),
    createTotalQuery(month),
    createFuelTypeQuery(previousMonthStr),
    createVehicleTypeQuery(previousMonthStr),
    createTotalQuery(previousMonthStr),
    createFuelTypeQuery(previousYearStr),
    createVehicleTypeQuery(previousYearStr),
    createTotalQuery(previousYearStr),
  ]);

  return {
    currentMonth: {
      period: month,
      total: currentTotal[0]?.total ?? 0,
      fuelType: currentFuelType,
      vehicleType: currentVehicleType,
    },
    previousMonth: {
      period: previousMonthStr,
      total: previousMonthTotal[0]?.total ?? 0,
      fuelType: previousMonthFuelType,
      vehicleType: previousMonthVehicleType,
    },
    previousYear: {
      period: previousYearStr,
      total: previousYearTotal[0]?.total ?? 0,
      fuelType: previousYearFuelType,
      vehicleType: previousYearVehicleType,
    },
  };
}
