import { db } from "@motormetrics/database/client";
import { cars, coe, deregistrations, pqp } from "@motormetrics/database/schema";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  ilike,
  inArray,
  lt,
  type SQL,
  sql,
} from "drizzle-orm";

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
    where: { month, vehicleClass: { in: [...CAR_VEHICLE_CLASSES] } },
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
      and(
        inArray(
          coe.month,
          priorMonths.map(({ month: m }) => m),
        ),
        inArray(coe.vehicleClass, [...CAR_VEHICLE_CLASSES]),
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
 * The newest month every dataset has published, with COE complete.
 *
 * The monthly update is one post covering cars, COE, PQP and deregistrations,
 * so it cannot run until all four have the month. COE additionally needs BOTH
 * bidding exercises — a post claiming to cover the month while the second
 * bidding is outstanding would be wrong within a fortnight.
 *
 * The cadence this produces: PQP for month M publishes at the start of M, the
 * two COE exercises land during M, and cars and deregistrations for M publish
 * in early M+1 — so the update for M becomes available early in M+1, which is
 * when it should go out.
 */
export async function getLatestCompleteMonth(): Promise<string | null> {
  const [row] = await db
    .select({ month: cars.month })
    .from(cars)
    .where(
      and(
        gt(cars.number, 0),
        sql`exists (select 1 from ${deregistrations} d where d.month = ${cars.month})`,
        sql`exists (select 1 from ${pqp} p where p.month = ${cars.month})`,
        sql`(select count(distinct c.bidding_no) from ${coe} c where c.month = ${cars.month}) >= 2`,
      ),
    )
    .groupBy(cars.month)
    .orderBy(desc(cars.month))
    .limit(1);

  return row?.month ?? null;
}

/**
 * The vehicle classes a car-market post covers.
 *
 * LTA runs five COE categories. C is goods vehicles and buses, D is
 * motorcycles, and E is the open category — none of which is the car market
 * this site reports on. Restricting to A and B also keeps a post coherent:
 * PQP is published for A-D only, so a premium quoted for E could never be
 * compared against a renewal price.
 */
const CAR_VEHICLE_CLASSES = ["Category A", "Category B"] as const;

/**
 * The categories the PQP report covers.
 *
 * LTA publishes A, B, C and D. C is goods vehicles and buses, D is
 * motorcycles — neither is a car, which is what the rest of the site covers.
 * This mirrors PQP_REPORTED_CATEGORIES in the web app's PQP page query.
 */
const PQP_REPORTED_CATEGORIES = CAR_VEHICLE_CLASSES;

/** Every PQP published for the month, for the reported categories. */
export function getPqpForMonth(month: string) {
  return db
    .select({
      month: pqp.month,
      vehicleClass: pqp.vehicleClass,
      pqp: pqp.pqp,
    })
    .from(pqp)
    .where(
      and(
        eq(pqp.month, month),
        inArray(pqp.vehicleClass, [...PQP_REPORTED_CATEGORIES]),
      ),
    )
    .orderBy(asc(pqp.vehicleClass));
}

/**
 * The months immediately before `month`, oldest first, so a PQP post can say
 * what the renewal price has done rather than quoting it in isolation.
 */
export async function getPriorMonthsPqpSummary(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const rows = await db
    .select({
      month: pqp.month,
      vehicleClass: pqp.vehicleClass,
      pqp: pqp.pqp,
    })
    .from(pqp)
    .where(
      and(
        lt(pqp.month, month),
        inArray(pqp.vehicleClass, [...PQP_REPORTED_CATEGORIES]),
      ),
    )
    .orderBy(desc(pqp.month), asc(pqp.vehicleClass))
    .limit(months * PQP_REPORTED_CATEGORIES.length);

  return rows.reverse();
}

/**
 * The COE results PQP is derived from.
 *
 * PQP is a trailing average of recent COE premiums, so the bidding results are
 * not background colour here — they are the mechanism. Passing them lets the
 * post show why the renewal price moved, which is the one thing a dealer page
 * quoting the same number cannot do.
 */
export async function getCoePremiumsForPqpWindow(
  month: string,
  months: number = 4,
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
      premium: coe.premium,
    })
    .from(coe)
    .where(
      and(
        inArray(
          coe.month,
          priorMonths.map(({ month: m }) => m),
        ),
        inArray(coe.vehicleClass, [...PQP_REPORTED_CATEGORIES]),
      ),
    )
    .orderBy(asc(coe.month), asc(coe.biddingNo), asc(coe.vehicleClass));
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

/**
 * The fuel types counted as a hybrid in the computed figures.
 *
 * `%electric%` also matches "Electric", which is a BEV and not a hybrid, so
 * the hybrid bucket is spelled out rather than pattern-matched.
 */
const HYBRID_FUEL_TYPES = [
  "Petrol-Electric",
  "Petrol-Electric (Plug-In)",
  "Diesel-Electric",
] as const;

/** The fuel type that is a BEV. "EV" in a post means exactly this. */
const BEV_FUEL_TYPE = "Electric";

/** Exact registration count for the rows matching `condition`. */
const registrationsWhere = (condition: SQL) =>
  sql<number>`cast(coalesce(sum(${cars.number}) filter (where ${condition}), 0) as integer)`;

/**
 * Registrations matching `condition` as a whole-number percentage of
 * registrations across ALL fuel types.
 *
 * Rounded here rather than in the prompt: the posts' voice rules require whole
 * numbers, and a model handed 61.14081996434938 rounds it inconsistently
 * between prose, highlights and charts.
 */
const sharePctOfTotalWhere = (condition: SQL) =>
  sql<number>`cast(coalesce(round(100.0 * sum(${cars.number}) filter (where ${condition}) / nullif(sum(${cars.number}), 0)), 0) as integer)`;

const isBev = () => eq(cars.fuelType, BEV_FUEL_TYPE);
const isHybrid = () => inArray(cars.fuelType, [...HYBRID_FUEL_TYPES]);

/** The headline registration figures for one month, all computed in SQL. */
function selectRegistrationTotals(month: string) {
  return db
    .select({
      month: cars.month,
      totalRegistrationsAllFuelTypes: sql<number>`cast(coalesce(sum(${cars.number}), 0) as integer)`,
      bevRegistrations: registrationsWhere(isBev()),
      bevSharePctOfTotalRegistrations: sharePctOfTotalWhere(isBev()),
      hybridRegistrations: registrationsWhere(isHybrid()),
      hybridSharePctOfTotalRegistrations: sharePctOfTotalWhere(isHybrid()),
      petrolRegistrations: registrationsWhere(eq(cars.fuelType, "Petrol")),
      petrolSharePctOfTotalRegistrations: sharePctOfTotalWhere(
        eq(cars.fuelType, "Petrol"),
      ),
      dieselRegistrations: registrationsWhere(eq(cars.fuelType, "Diesel")),
      dieselSharePctOfTotalRegistrations: sharePctOfTotalWhere(
        eq(cars.fuelType, "Diesel"),
      ),
    })
    .from(cars)
    .where(and(eq(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.month);
}

/**
 * Every headline figure the monthly update quotes, computed in SQL.
 *
 * The prompt tells the model to compute its own totals, and it gets them
 * wrong: on February 2026 both gpt-5-mini and gpt-5.2 reported 4,001
 * registrations against a true 4,007, and both quoted BYD's all-fuel 888 in a
 * BEV section where the BEV figure is 859. `getTotalRegistrationsForMonth`
 * has never been wrong because nothing computes it but Postgres. This extends
 * that to the rest of the post.
 *
 * Two naming rules run through the return shape, because both have already
 * produced published errors:
 *
 * - Every share names its denominator, so a percentage cannot be paired with
 *   the wrong total.
 * - Every all-fuel figure says so, and every BEV-only figure says so, so a
 *   BEV section cannot pick up an all-fuel count.
 */
export async function getMonthlyComputedFigures(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const [
    totalsRows,
    byFuelType,
    byVehicleType,
    topMakesOverallAllFuelTypes,
    topBevMakesElectricOnly,
    deregistrationsByVqsCategory,
    coeByCategory,
    pqpByCategory,
    priorMonths,
  ] = await Promise.all([
    selectRegistrationTotals(month),

    db
      .select({
        fuelType: cars.fuelType,
        registrations: sql<number>`cast(sum(${cars.number}) as integer)`,
        sharePctOfTotalRegistrations: sql<number>`cast(round(100.0 * sum(${cars.number}) / nullif(sum(sum(${cars.number})) over (), 0)) as integer)`,
      })
      .from(cars)
      .where(and(eq(cars.month, month), gt(cars.number, 0)))
      .groupBy(cars.fuelType)
      .orderBy(desc(sql`sum(${cars.number})`)),

    db
      .select({
        vehicleType: cars.vehicleType,
        registrations: sql<number>`cast(sum(${cars.number}) as integer)`,
        sharePctOfTotalRegistrations: sql<number>`cast(round(100.0 * sum(${cars.number}) / nullif(sum(sum(${cars.number})) over (), 0)) as integer)`,
      })
      .from(cars)
      .where(and(eq(cars.month, month), gt(cars.number, 0)))
      .groupBy(cars.vehicleType)
      .orderBy(desc(sql`sum(${cars.number})`)),

    // The window runs over every make before LIMIT, so the denominator is
    // total registrations and not the top ten's subtotal.
    db
      .select({
        rank: sql<number>`cast(row_number() over (order by sum(${cars.number}) desc) as integer)`,
        make: cars.make,
        registrationsAllFuelTypes: sql<number>`cast(sum(${cars.number}) as integer)`,
        sharePctOfTotalRegistrations: sql<number>`cast(round(100.0 * sum(${cars.number}) / nullif(sum(sum(${cars.number})) over (), 0)) as integer)`,
      })
      .from(cars)
      .where(and(eq(cars.month, month), gt(cars.number, 0)))
      .groupBy(cars.make)
      .orderBy(desc(sql`sum(${cars.number})`))
      .limit(10),

    db
      .select({
        rank: sql<number>`cast(row_number() over (order by sum(${cars.number}) desc) as integer)`,
        make: cars.make,
        bevRegistrations: sql<number>`cast(sum(${cars.number}) as integer)`,
        sharePctOfBevRegistrations: sql<number>`cast(round(100.0 * sum(${cars.number}) / nullif(sum(sum(${cars.number})) over (), 0)) as integer)`,
      })
      .from(cars)
      .where(
        and(
          eq(cars.month, month),
          eq(cars.fuelType, BEV_FUEL_TYPE),
          gt(cars.number, 0),
        ),
      )
      .groupBy(cars.make)
      .orderBy(desc(sql`sum(${cars.number})`))
      .limit(10),

    db
      .select({
        vqsCategory: deregistrations.category,
        deregistrations: sql<number>`cast(sum(${deregistrations.number}) as integer)`,
        sharePctOfDeregistrationsTotalAllCategories: sql<number>`cast(round(100.0 * sum(${deregistrations.number}) / nullif(sum(sum(${deregistrations.number})) over (), 0)) as integer)`,
      })
      .from(deregistrations)
      .where(eq(deregistrations.month, month))
      .groupBy(deregistrations.category)
      .orderBy(desc(sql`sum(${deregistrations.number})`)),

    // One row per category with both exercises side by side, so the delta
    // between them is a stored figure rather than a subtraction the model
    // performs while writing a sentence about it.
    db
      .select({
        vehicleClass: coe.vehicleClass,
        quotaExercise1: sql<number>`cast(max(case when ${coe.biddingNo} = 1 then ${coe.quota} end) as integer)`,
        bidsReceivedExercise1: sql<number>`cast(max(case when ${coe.biddingNo} = 1 then ${coe.bidsReceived} end) as integer)`,
        premiumExercise1: sql<number>`cast(max(case when ${coe.biddingNo} = 1 then ${coe.premium} end) as integer)`,
        quotaExercise2: sql<number>`cast(max(case when ${coe.biddingNo} = 2 then ${coe.quota} end) as integer)`,
        bidsReceivedExercise2: sql<number>`cast(max(case when ${coe.biddingNo} = 2 then ${coe.bidsReceived} end) as integer)`,
        premiumExercise2: sql<number>`cast(max(case when ${coe.biddingNo} = 2 then ${coe.premium} end) as integer)`,
        premiumDeltaExercise1ToExercise2: sql<number>`cast(max(case when ${coe.biddingNo} = 2 then ${coe.premium} end) - max(case when ${coe.biddingNo} = 1 then ${coe.premium} end) as integer)`,
      })
      .from(coe)
      .where(
        and(
          eq(coe.month, month),
          inArray(coe.vehicleClass, [...CAR_VEHICLE_CLASSES]),
        ),
      )
      .groupBy(coe.vehicleClass)
      .orderBy(asc(coe.vehicleClass)),

    // Both months in one pass so the month-on-month delta is computed in SQL.
    db
      .select({
        vehicleClass: pqp.vehicleClass,
        pqp: sql<number>`cast(max(case when ${pqp.month} = ${month} then ${pqp.pqp} end) as integer)`,
        pqpPriorMonth: sql<number>`cast(max(case when ${pqp.month} <> ${month} then ${pqp.pqp} end) as integer)`,
        pqpDeltaVsPriorMonth: sql<number>`cast(max(case when ${pqp.month} = ${month} then ${pqp.pqp} end) - max(case when ${pqp.month} <> ${month} then ${pqp.pqp} end) as integer)`,
      })
      .from(pqp)
      .where(
        and(
          inArray(pqp.vehicleClass, [...PQP_REPORTED_CATEGORIES]),
          sql`${pqp.month} in (${month}, (select max(prior.month) from ${pqp} prior where prior.month < ${month}))`,
        ),
      )
      .groupBy(pqp.vehicleClass)
      .orderBy(asc(pqp.vehicleClass)),

    getPriorMonthsComputedFigures(month, months),
  ]);

  const totals = totalsRows[0];
  const totalRegistrationsAllFuelTypes =
    totals?.totalRegistrationsAllFuelTypes ?? 0;
  const deregistrationsTotalAllCategories = deregistrationsByVqsCategory.reduce(
    (total, row) => total + row.deregistrations,
    0,
  );

  const premiumByClass = new Map(
    coeByCategory.map((row) => [row.vehicleClass, row]),
  );

  return {
    month,

    totalRegistrationsAllFuelTypes,
    bevRegistrations: totals?.bevRegistrations ?? 0,
    bevSharePctOfTotalRegistrations:
      totals?.bevSharePctOfTotalRegistrations ?? 0,
    hybridFuelTypesCounted: HYBRID_FUEL_TYPES.join(" + "),
    hybridRegistrations: totals?.hybridRegistrations ?? 0,
    hybridSharePctOfTotalRegistrations:
      totals?.hybridSharePctOfTotalRegistrations ?? 0,
    petrolRegistrations: totals?.petrolRegistrations ?? 0,
    petrolSharePctOfTotalRegistrations:
      totals?.petrolSharePctOfTotalRegistrations ?? 0,
    // Diesel is frequently zero for a month. A zero handed to the prompt reads
    // as a figure worth a sentence, so it is left out entirely instead.
    dieselRegistrations: totals?.dieselRegistrations || undefined,
    dieselSharePctOfTotalRegistrations: totals?.dieselRegistrations
      ? totals.dieselSharePctOfTotalRegistrations
      : undefined,

    registrationsByFuelType: byFuelType,
    registrationsByVehicleType: byVehicleType,
    topMakesOverallAllFuelTypes,
    topBevMakesElectricOnly,

    deregistrationsTotalAllCategories,
    deregistrationsByVqsCategory,

    // Registrations carry no COE or VQS category, so the only valid fleet
    // comparison is total against total. Both models tested compared the
    // month's registrations against Category A + B deregistrations alone.
    netFleetChangeTotalRegistrationsMinusTotalDeregistrations:
      totalRegistrationsAllFuelTypes - deregistrationsTotalAllCategories,

    coeByCategoryAndExercise: coeByCategory,

    pqpByCategory: pqpByCategory.map((row) => {
      const premiums = premiumByClass.get(row.vehicleClass);
      return {
        ...row,
        pqpMinusPremiumExercise1:
          premiums?.premiumExercise1 == null
            ? undefined
            : row.pqp - premiums.premiumExercise1,
        pqpMinusPremiumExercise2:
          premiums?.premiumExercise2 == null
            ? undefined
            : row.pqp - premiums.premiumExercise2,
      };
    }),

    priorMonths,
  };
}

/**
 * The same headline figures for the months before `month`, oldest first, so
 * every comparison the post makes is also pre-computed.
 *
 * `getPriorMonthsCarsSummary` already supplies a prior-month BEV share, but to
 * two decimal places and with no fuel split or deregistration total — a post
 * comparing hybrids or the fleet balance month on month had to derive it.
 */
async function getPriorMonthsComputedFigures(
  month: string,
  months: number = PRIOR_MONTHS,
) {
  const registrationRows = await db
    .select({
      month: cars.month,
      totalRegistrationsAllFuelTypes: sql<number>`cast(coalesce(sum(${cars.number}), 0) as integer)`,
      bevRegistrations: registrationsWhere(isBev()),
      bevSharePctOfTotalRegistrations: sharePctOfTotalWhere(isBev()),
      hybridRegistrations: registrationsWhere(isHybrid()),
      hybridSharePctOfTotalRegistrations: sharePctOfTotalWhere(isHybrid()),
      petrolRegistrations: registrationsWhere(eq(cars.fuelType, "Petrol")),
      petrolSharePctOfTotalRegistrations: sharePctOfTotalWhere(
        eq(cars.fuelType, "Petrol"),
      ),
    })
    .from(cars)
    .where(and(lt(cars.month, month), gt(cars.number, 0)))
    .groupBy(cars.month)
    .orderBy(desc(cars.month))
    .limit(months);

  if (registrationRows.length === 0) {
    return [];
  }

  const deregistrationRows = await db
    .select({
      month: deregistrations.month,
      total: sql<number>`cast(sum(${deregistrations.number}) as integer)`,
    })
    .from(deregistrations)
    .where(
      inArray(
        deregistrations.month,
        registrationRows.map(({ month: m }) => m),
      ),
    )
    .groupBy(deregistrations.month);

  const deregistrationTotals = new Map(
    deregistrationRows.map(({ month: m, total }) => [m, total]),
  );

  return registrationRows.reverse().map((row) => {
    const deregistrationsTotalAllCategories =
      deregistrationTotals.get(row.month) ?? 0;
    return {
      ...row,
      deregistrationsTotalAllCategories,
      netFleetChangeTotalRegistrationsMinusTotalDeregistrations:
        row.totalRegistrationsAllFuelTypes - deregistrationsTotalAllCategories,
    };
  });
}
