import { db } from "@motormetrics/database/client";
import { cars, coe, deregistrations } from "@motormetrics/database/schema";
import { and, asc, desc, eq, gt, ilike, inArray, lt, sql } from "drizzle-orm";

/**
 * How many months of context the prompts get by default. Enough for "up from
 * 64% in May", not so much that the model starts narrating a year.
 */
const PRIOR_MONTHS = 3;

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
 * The months immediately before `month`, oldest first, with the headline car
 * figures for each.
 *
 * Posts had no continuity — nothing let them say "up from 64.1% in May". Pass
 * this alongside the month's own rows so the prompt can compare. `bevShare` is
 * BEV registrations over registrations across ALL fuel types, the same
 * denominator the post itself must use.
 */
export async function getPriorMonthsCarsSummary(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const rows = await db
    .select({
      month: cars.month,
      total: sql<number>`cast(sum(${cars.number}) as integer)`,
      bev: sql<number>`cast(sum(case when ${cars.fuelType} = 'Electric' then ${cars.number} else 0 end) as integer)`,
      bevShare: sql<number>`cast(round(100.0 * sum(case when ${cars.fuelType} = 'Electric' then ${cars.number} else 0 end) / nullif(sum(${cars.number}), 0), 2) as double precision)`,
    })
    .from(cars)
    .where(and(lt(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.month)
    .orderBy(desc(cars.month))
    .limit(months);

  return rows.reverse();
}

/**
 * The months immediately before `month`, oldest first, with every COE result
 * in each — one row per bidding exercise per category.
 *
 * Two queries because the limit applies to months, not rows.
 */
export async function getPriorMonthsCoeSummary(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const priorMonths = await db
    .selectDistinct({ month: coe.month })
    .from(coe)
    .where(lt(coe.month, month))
    .orderBy(desc(coe.month))
    .limit(months);

  if (priorMonths.length === 0) {
    return [];
  }

  return db
    .select({
      month: coe.month,
      biddingNo: coe.biddingNo,
      vehicleClass: coe.vehicleClass,
      quota: coe.quota,
      bidsReceived: coe.bidsReceived,
      premium: coe.premium,
    })
    .from(coe)
    .where(
      inArray(
        coe.month,
        priorMonths.map(({ month: m }) => m),
      ),
    )
    .orderBy(asc(coe.month), asc(coe.biddingNo), asc(coe.vehicleClass));
}

/**
 * The months immediately before `month`, oldest first, with the total
 * deregistrations for each. Category detail is deliberately left out — the
 * prior months are context for a comparison line, not a second dataset.
 */
export async function getPriorMonthsDeregistrationsSummary(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const rows = await db
    .select({
      month: deregistrations.month,
      total: sql<number>`cast(sum(${deregistrations.number}) as integer)`,
    })
    .from(deregistrations)
    .where(lt(deregistrations.month, month))
    .groupBy(deregistrations.month)
    .orderBy(desc(deregistrations.month))
    .limit(months);

  return rows.reverse();
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
