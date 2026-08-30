/**
 * Queries backing the fuel type and vehicle type detail pages.
 *
 * `cars` is a month × make × fuelType × vehicleType cross-tab, so everything
 * these pages show — one type's monthly series against the whole market, its
 * makes, its peers, and its mix on the *other* dimension — falls out of the
 * same table with a different grouping. The dimension is a parameter rather
 * than a separate query per column, because the two pages render one component.
 *
 * Windows are inclusive `YYYY-MM` bounds. Month strings sort lexicographically
 * in this format, so range comparisons on the stored text are chronological.
 */

import {
  and,
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

/** The two columns these pages pivot on, named as the schema names them. */
export type TypeDimension = "fuelType" | "vehicleType";

const DIMENSION_COLUMNS = {
  fuelType: cars.fuelType,
  vehicleType: cars.vehicleType,
} as const;

/** Cache tag family per dimension, matching the tags the existing queries set. */
const DIMENSION_TAGS = {
  fuelType: "fuel",
  vehicleType: "vehicle",
} as const;

/** A fresh expression per call: Drizzle mutates `sql` fragments when decorated. */
const registrationTotal = () =>
  sql<number>`cast(sum(${cars.number}) as int)`.mapWith(Number);

function otherDimension(dimension: TypeDimension): TypeDimension {
  return dimension === "fuelType" ? "vehicleType" : "fuelType";
}

export interface TypeCount {
  count: number;
  name: string;
}

export interface TypeMonthlyPoint {
  /** Registrations of this type in the month. */
  count: number;
  month: string;
  /** Registrations of every type in the month, for the share column. */
  total: number;
}

/**
 * The type's monthly series alongside the whole-market total, newest `limit`
 * months ending at `month`, oldest first.
 *
 * One grouped query rather than two: the share column needs both figures for
 * the same months, and a conditional sum gets them in a single pass.
 */
export async function getTypeMonthlySeries(
  dimension: TypeDimension,
  value: string,
  month: string,
  limit = 12,
): Promise<TypeMonthlyPoint[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${month}`, `cars:${DIMENSION_TAGS[dimension]}:${value}`);

  const column = DIMENSION_COLUMNS[dimension];

  const rows = await db
    .select({
      month: cars.month,
      count:
        sql<number>`cast(sum(case when ${column} = ${value} then ${cars.number} else 0 end) as int)`.mapWith(
          Number,
        ),
      total: registrationTotal(),
    })
    .from(cars)
    .where(lte(cars.month, month))
    .groupBy(cars.month)
    .orderBy(desc(cars.month))
    .limit(limit);

  return rows.reverse();
}

/**
 * Every value of the dimension over the window, largest first.
 *
 * Backs three things at once: the type's own total, its share and rank against
 * the whole market, and the peer bars at the foot of the page. Called a second
 * time over the window a year earlier to produce the headline's change.
 */
export async function getTypeDistributionInWindow(
  dimension: TypeDimension,
  from: string,
  to: string,
): Promise<TypeCount[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${to}`, "cars:annual");

  const column = DIMENSION_COLUMNS[dimension];

  const rows = await db
    .select({ name: column, count: registrationTotal() })
    .from(cars)
    .where(and(gte(cars.month, from), lte(cars.month, to)))
    .groupBy(column)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(registrationTotal()));

  return rows.filter((row) => row.name !== null);
}

/** Registrations of one type by make over the window, largest first. */
export async function getTypeMakesInWindow(
  dimension: TypeDimension,
  value: string,
  from: string,
  to: string,
): Promise<{ count: number; make: string }[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${to}`, `cars:${DIMENSION_TAGS[dimension]}:${value}`);

  const column = DIMENSION_COLUMNS[dimension];

  return db
    .select({ make: cars.make, count: registrationTotal() })
    .from(cars)
    .where(
      and(
        sql`${column} = ${value}`,
        gte(cars.month, from),
        lte(cars.month, to),
      ),
    )
    .groupBy(cars.make)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(registrationTotal()));
}

/**
 * How one type splits across the *other* dimension over the window — a fuel
 * type's vehicle types, or a vehicle type's fuel types.
 *
 * The cross-tab makes this free, and it is the one figure on the page neither
 * index route can show.
 */
export async function getTypeCrossMixInWindow(
  dimension: TypeDimension,
  value: string,
  from: string,
  to: string,
): Promise<TypeCount[]> {
  "use cache";
  cacheLife("max");
  cacheTag(`cars:month:${to}`, `cars:${DIMENSION_TAGS[dimension]}:${value}`);

  const column = DIMENSION_COLUMNS[dimension];
  const crossColumn = DIMENSION_COLUMNS[otherDimension(dimension)];

  const rows = await db
    .select({ name: crossColumn, count: registrationTotal() })
    .from(cars)
    .where(
      and(
        sql`${column} = ${value}`,
        gte(cars.month, from),
        lte(cars.month, to),
      ),
    )
    .groupBy(crossColumn)
    .having(gt(sum(cars.number), 0))
    .orderBy(desc(registrationTotal()));

  return rows.filter((row) => row.name !== null);
}
