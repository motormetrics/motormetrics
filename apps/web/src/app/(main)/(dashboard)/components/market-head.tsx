import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { biddingOrdinal } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import { windowEndingAt } from "@web/app/(main)/(dashboard)/components/overview-series";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import {
  getEvMarketShare,
  getEvMonthlyTrend,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import { getCategoryExercises } from "@web/queries/coe";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

/** A year of exercises: two a month. */
const EXERCISES = 24;
const MONTHS = 12;
/** Matches the fuel-mix card's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;

/** "1st bidding, November 2026". */
const exerciseName = (exercise: { biddingNo: number; month: string }) =>
  `${biddingOrdinal(exercise.biddingNo)} bidding, ${formatMonthLabel(exercise.month)}`;

/**
 * The four numbers the home page leads with: COE first, as the navigation
 * orders it, then new cars and the battery-electric share. Each tile opens
 * the page that holds its full series. Reads only cached data, so it is part
 * of the static shell.
 */
export async function MarketKpis() {
  const month = await getLatestMonth("cars");
  const [categoryA, categoryB, monthlyTotals, evTrend, evMarketShare] =
    await Promise.all([
      getCategoryExercises("Category A"),
      getCategoryExercises("Category B"),
      getMonthlyRegistrationTotals(HISTORY_LIMIT),
      getEvMonthlyTrend(),
      getEvMarketShare(),
    ]);

  const tiles: KpiTile[] = [];

  for (const [category, history] of [
    ["Category A", categoryA],
    ["Category B", categoryB],
  ] as const) {
    const window = history.slice(-EXERCISES);
    const [latest, previous] = [window.at(-1), window.at(-2)];
    if (!latest) {
      continue;
    }
    tiles.push({
      change: previous
        ? {
            value: changeRatio(latest.premium, previous.premium) * 100,
          }
        : undefined,
      format: "currency",
      href: "/coe/results",
      note: exerciseName(latest),
      title: `COE ${category}`,
      trend: window.map((exercise) => exercise.premium),
      value: latest.premium,
    });
  }

  const registrations = windowEndingAt(monthlyTotals, month, MONTHS);
  const [latestCars, previousCars] = [
    registrations.at(-1),
    registrations.at(-2),
  ];
  if (latestCars) {
    tiles.push({
      change: previousCars
        ? {
            label: `vs ${formatMonthName(previousCars.month)}`,
            value: changeRatio(latestCars.total, previousCars.total) * 100,
          }
        : undefined,
      format: "count",
      href: "/cars/registrations",
      note: formatMonthLabel(latestCars.month),
      title: "New cars",
      trend: registrations.map((row) => row.total),
      value: latestCars.total,
    });
  }

  const evIndex = resolveMonthIndex(
    evTrend.map((point) => point.month),
    month,
  );
  const shares = batteryElectricShares(evTrend, evMarketShare);
  const evShare = evIndex >= 0 ? shares[evIndex] : undefined;
  if (evShare !== undefined) {
    const before = evIndex > 0 ? shares[evIndex - 1] : undefined;
    tiles.push({
      change:
        before !== undefined
          ? {
              label: `vs ${formatMonthName(evTrend[evIndex - 1].month)}`,
              value: evShare - before,
            }
          : undefined,
      format: "percent",
      href: "/cars/electric-vehicles",
      note: `of new cars, ${formatMonthLabel(evTrend[evIndex].month)}`,
      title: "Battery-electric share",
      trend: shares.slice(Math.max(0, evIndex - MONTHS + 1), evIndex + 1),
      value: evShare,
    });
  }

  return <KpiTiles tiles={tiles} />;
}

/** "LTA data to October 2026 · COE to the 1st bidding, November 2026." */
export async function MarketAsOf() {
  const month = await getLatestMonth("cars");
  const latest = (await getCategoryExercises("Category A")).at(-1);
  return (
    <>
      LTA data to {formatMonthLabel(month)}
      {latest ? ` · COE to the ${exerciseName(latest)}` : ""}
    </>
  );
}
