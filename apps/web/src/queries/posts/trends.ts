import type { SelectPost } from "@motormetrics/database/schema";
import {
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
} from "@web/queries/cars/monthly-registrations";
import { getCoeResults } from "@web/queries/coe/historical-results";
import { getPqpRates } from "@web/queries/coe/pqp/rates";
import { getDeregistrations } from "@web/queries/deregistrations/all";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { trailingMonths } from "@web/utils/dates/month-arithmetic";

/** The small chart on a post's card: one figure a month, oldest first. */
export interface PostTrend {
  caption: string;
  values: number[];
  /**
   * A second series on the same months, with a name for each: COE charts
   * show Category A and Category B together.
   */
  second?: { labels: [string, string]; values: number[] };
}

/** Months the chart covers, ending at the month the post reports on. */
const WINDOW = 12;

/** Enough months to reach back from the oldest post. */
const HISTORY = 600;

interface Series {
  label: string;
  load: () => Promise<Map<string, number>>;
  /** A second series drawn beside the first, and the two series' names. */
  second?: {
    labels: [string, string];
    load: () => Promise<Map<string, number>>;
  };
  /**
   * The latest month, when its figure is not final: a COE month that has held
   * its first bidding exercise and not yet its second.
   */
  loadIncompleteMonth?: () => Promise<string | undefined>;
}

const registrations: Series = {
  label: "New car registrations",
  load: async () => {
    const totals = await getMonthlyRegistrationTotals(HISTORY);
    return new Map(totals.map(({ month, total }) => [month, total]));
  },
};

const electricRegistrations: Series = {
  label: "Electric car registrations",
  load: async () => {
    const totals = await getMonthlyRegistrationTotalsByFuelType(
      "Electric",
      HISTORY,
    );
    return new Map(totals.map(({ month, total }) => [month, total]));
  },
};

/** One category's premium by month. */
const loadPremiums = async (category: "Category A" | "Category B") => {
  const results = await getCoeResults();
  // Results come oldest first, so each month ends on its last exercise.
  return new Map(
    results
      .filter(({ vehicleClass }) => vehicleClass === category)
      .map(({ month, premium }) => [month, premium]),
  );
};

/** One category's PQP by month. */
const loadPqp = async (category: "Category A" | "Category B") => {
  const rates = await getPqpRates();
  return new Map(
    Object.entries(rates).map(([month, rate]) => [month, rate[category]]),
  );
};

/** The series each topic's posts are about. A topic not listed gets no chart. */
const SERIES: Record<string, Series> = {
  cars: registrations,
  "electric-vehicles": electricRegistrations,
  "monthly-update": registrations,
  coe: {
    label: "Category A and B premiums",
    load: () => loadPremiums("Category A"),
    second: {
      labels: ["Cat A", "Cat B"],
      load: () => loadPremiums("Category B"),
    },
    loadIncompleteMonth: async () => {
      const latest = (await getCoeResults()).at(-1);
      return latest?.biddingNo === 1 ? latest.month : undefined;
    },
  },
  pqp: {
    label: "Category A and B PQP",
    load: () => loadPqp("Category A"),
    second: {
      labels: ["Cat A", "Cat B"],
      load: () => loadPqp("Category B"),
    },
  },
  deregistrations: {
    label: "Deregistrations",
    load: async () => {
      const rows = await getDeregistrations();
      const totals = new Map<string, number>();
      for (const { month, number } of rows) {
        totals.set(month, (totals.get(month) ?? 0) + (number ?? 0));
      }
      return totals;
    },
  },
};

/**
 * The chart for each post's card, keyed by post id: the series its topic is
 * about, over the months up to the one it reports on. Every series comes from
 * a cached query, so this adds no request-time work. A post with no month, an
 * unlisted topic, a series that failed to load or fewer than two months of
 * data gets no chart.
 */
export async function getPostTrends(
  posts: SelectPost[],
): Promise<Record<string, PostTrend>> {
  const series = [
    ...new Set(
      posts.flatMap(({ dataType }) =>
        dataType && SERIES[dataType] ? [SERIES[dataType]] : [],
      ),
    ),
  ];
  const loaded = new Map(
    await Promise.all(
      series.map(async (entry) => {
        try {
          const [byMonth, secondByMonth, incompleteMonth] = await Promise.all([
            entry.load(),
            entry.second?.load(),
            entry.loadIncompleteMonth?.(),
          ]);
          return [entry, { byMonth, incompleteMonth, secondByMonth }] as const;
        } catch (error) {
          // A chart is an extra: a series that fails to load leaves its
          // posts without one rather than taking the list down with it.
          console.error(`[Blog] Failed to load "${entry.label}"`, error);
          return [entry, undefined] as const;
        }
      }),
    ),
  );

  const trends: Record<string, PostTrend> = {};

  for (const { dataType, id, month } of posts) {
    const entry = dataType ? SERIES[dataType] : undefined;
    const series = entry ? loaded.get(entry) : undefined;

    if (!entry || !series || !month) {
      continue;
    }

    const { byMonth, incompleteMonth, secondByMonth } = series;
    // A month counts only when every series on the chart has a figure for
    // it, so a missing one is left out rather than drawn as zero.
    const months = trailingMonths(month, WINDOW).filter(
      (key) =>
        byMonth.get(key) !== undefined &&
        (!secondByMonth || secondByMonth.get(key) !== undefined),
    );

    const values = months.map((key) => byMonth.get(key) ?? 0);

    if (values.length < 2) {
      continue;
    }

    trends[id] = {
      caption: `${entry.label}, ${values.length} months to ${formatMonthLabel(month)}.${month === incompleteMonth ? ` ${formatMonthName(month)} shows the first bidding exercise only. The second exercise is not complete.` : ""}`,
      values,
      ...(entry.second && secondByMonth
        ? {
            second: {
              labels: entry.second.labels,
              values: months.map((key) => secondByMonth.get(key) ?? 0),
            },
          }
        : {}),
    };
  }

  return trends;
}
