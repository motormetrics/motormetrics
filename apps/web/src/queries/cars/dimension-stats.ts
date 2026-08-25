import {
  and,
  asc,
  cars,
  db,
  desc,
  gt,
  gte,
  lte,
  sql,
  sum,
} from "@motormetrics/database";
import { cacheLife, cacheTag } from "next/cache";

/**
 * Kept as a bare union rather than a `const` array so client components can
 * import it without dragging this module — and the database client with it —
 * into their bundle. The runtime list lives in the Cars overview components.
 */
export type CarDimension = "make" | "vehicleType" | "fuelType";

export interface DimensionStat {
  /** The dimension value itself — a make, a vehicle type or a fuel type. */
  name: string;
  /** Registrations from January through the requested month. */
  count: number;
  /** Percentage of the dimension's year-to-date total. */
  share: number;
  /** Rolling twelve months ending at the requested month, oldest first. */
  trend: { value: number }[];
  /**
   * Percentage change against the same January-to-month window a year earlier.
   * `null` when there were no registrations in that window, which would make
   * the change infinite rather than merely large.
   */
  yoyChange: number | null;
}

const DIMENSION_COLUMNS = {
  make: cars.make,
  vehicleType: cars.vehicleType,
  fuelType: cars.fuelType,
} as const;

/** A fresh expression per call: Drizzle mutates `sql` fragments when decorated. */
const registrationTotal = () =>
  sql<number>`cast(sum(${cars.number}) as integer)`.mapWith(Number);

/**
 * Year-to-date registrations, share and year-over-year change for one dimension.
 *
 * Generalises `getMakeRegistrationStats` so the Cars overview table can pivot
 * between makes, vehicle types and fuel types without a query per tab. The
 * year-over-year comparison is window-to-window (January through the requested
 * month, both years) rather than full-year, so a part-complete year is never
 * measured against a complete one.
 *
 * @param dimension Column to group by.
 * @param month Latest month to include, as `YYYY-MM`.
 */
export async function getDimensionStats(
  dimension: CarDimension,
  month: string,
): Promise<DimensionStat[]> {
  "use cache";
  cacheLife("max");
  // `cars:annual` as well as the month: these totals are year to date, so a new
  // month changes every cached dimension, not only the one just loaded.
  cacheTag(`cars:month:${month}`, "cars:annual");

  const column = DIMENSION_COLUMNS[dimension];
  const [year, monthNumber] = month.split("-").map(Number);
  const previousYear = year - 1;
  const paddedMonth = String(monthNumber).padStart(2, "0");

  // The rolling cutoff is worked out in JavaScript because "YYYY-MM" is not a
  // valid Postgres date literal without a day component. Comparisons on the
  // stored text are lexicographic, which is chronological for this format.
  const cutoffDate = new Date(year, monthNumber - 1 - 12);
  const trendCutoff = `${cutoffDate.getFullYear()}-${String(cutoffDate.getMonth() + 1).padStart(2, "0")}`;

  const yearToDateQuery = db
    .select({ name: column, count: registrationTotal() })
    .from(cars)
    .where(and(gte(cars.month, `${year}-01`), lte(cars.month, month)))
    .groupBy(column)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(registrationTotal()));

  const previousYearQuery = db
    .select({ name: column, count: registrationTotal() })
    .from(cars)
    .where(
      and(
        gte(cars.month, `${previousYear}-01`),
        lte(cars.month, `${previousYear}-${paddedMonth}`),
      ),
    )
    .groupBy(column)
    .having(gt(sum(cars.number), 0));

  const trendQuery = db
    .select({ name: column, month: cars.month, count: registrationTotal() })
    .from(cars)
    .where(and(gt(cars.month, trendCutoff), lte(cars.month, month)))
    .groupBy(column, cars.month)
    .orderBy(asc(cars.month));

  const [yearToDateRows, previousYearRows, trendRows] = await db.batch([
    yearToDateQuery,
    previousYearQuery,
    trendQuery,
  ]);

  const grandTotal = yearToDateRows.reduce(
    (total, row) => total + row.count,
    0,
  );

  const previousYearByName = new Map(
    previousYearRows.map((row) => [row.name, row.count]),
  );

  const trendByName = trendRows.reduce<Map<string, { value: number }[]>>(
    (accumulator, row) => {
      const series = accumulator.get(row.name) ?? [];
      series.push({ value: row.count });
      accumulator.set(row.name, series);
      return accumulator;
    },
    new Map(),
  );

  return yearToDateRows.map((row) => {
    const previousCount = previousYearByName.get(row.name);

    return {
      name: row.name,
      count: row.count,
      share: grandTotal > 0 ? (row.count / grandTotal) * 100 : 0,
      trend: trendByName.get(row.name) ?? [],
      yoyChange:
        previousCount !== undefined && previousCount > 0
          ? ((row.count - previousCount) / previousCount) * 100
          : null,
    };
  });
}
