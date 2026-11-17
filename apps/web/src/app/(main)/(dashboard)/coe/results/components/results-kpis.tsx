import {
  biddingOrdinal,
  changeRatio,
  formatExercise,
  groupByExercise,
} from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { premiumOf } from "@web/app/(main)/(dashboard)/coe/results/components/results-shared";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { getCoeResults } from "@web/queries/coe";
import type { COECategory } from "@web/types";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** The four categories most visitors bid in; C is on the chart and table. */
const KPI_CATEGORIES: COECategory[] = [
  "Category A",
  "Category B",
  "Category D",
  "Category E",
];

/** A year of exercises: two a month. */
const EXERCISES = 24;

/** The whole cached history, so these parts sit in the static shell. */
const loadHistory = async () => groupByExercise(await getCoeResults());

/**
 * The latest closing premium in four categories, each with its change on the
 * exercise before and a year of exercises behind it.
 */
export async function ResultsKpis() {
  const exercises = (await loadHistory()).slice(-EXERCISES);
  const [latest, previous] = [exercises.at(-1), exercises.at(-2)];
  if (!latest) {
    return null;
  }

  const tiles: KpiTile[] = KPI_CATEGORIES.flatMap((category) => {
    const premium = premiumOf(latest, category);
    if (premium === undefined) {
      return [];
    }
    const earlier = previous && premiumOf(previous, category);
    return [
      {
        change: earlier
          ? { value: changeRatio(premium, earlier) * 100 }
          : undefined,
        format: "currency",
        note: formatExercise(latest),
        title: `COE ${category}`,
        trend: exercises.flatMap((exercise) => {
          const value = premiumOf(exercise, category);
          return value === undefined ? [] : [value];
        }),
        value: premium,
      },
    ];
  });

  return <KpiTiles tiles={tiles} />;
}

/** "LTA data to the first bidding, November 2026". */
export async function ResultsAsOf() {
  const latest = (await loadHistory()).at(-1);
  return latest
    ? `LTA data to the ${biddingOrdinal(latest.biddingNo)} bidding, ${formatMonthLabel(latest.month)}`
    : "LTA data";
}
