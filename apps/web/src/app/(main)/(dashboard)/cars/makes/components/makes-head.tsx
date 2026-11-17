import {
  loadElectricOnlyMakes,
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { getCarsLatestMonth } from "@web/queries/cars";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** How many makes "the five largest" counts. */
const LEADERS = 5;

/** "LTA data to October 2026". */
export async function MakesAsOf() {
  const month = await getCarsLatestMonth();

  return month ? <>LTA data to {formatMonthLabel(month)}</> : null;
}

/**
 * The four numbers the page leads with, for the year to date whatever period
 * the table shows, so they read no search params and stay in the static
 * shell.
 */
export async function MakesKpis() {
  const [{ latestMonth, rows, total }, electricOnly] = await Promise.all([
    loadMakeRows("ytd", null),
    loadElectricOnlyMakes(),
  ]);
  const leader = rows[0];

  if (!leader || !latestMonth || total === 0) {
    return null;
  }

  const period = periodLabel(latestMonth, "ytd");
  const leaders = rows.slice(0, LEADERS);
  const leadersCount = leaders.reduce((sum, row) => sum + row.count, 0);

  const tiles: KpiTile[] = [
    {
      format: "count",
      note: period,
      title: "Makes with registrations",
      value: rows.length,
    },
    {
      format: "percent",
      href: `/cars/makes/${leader.slug}`,
      note: `${leader.make}, ${leader.count.toLocaleString("en-SG")} cars`,
      title: "Largest make",
      trend: leader.trend,
      value: leader.share,
    },
    {
      format: "percent",
      note: leaders.map((row) => row.make).join(", "),
      title: "Five largest makes",
      value: (leadersCount / total) * 100,
    },
  ];

  if (electricOnly) {
    tiles.push({
      format: "count",
      href: "/cars/electric-vehicles",
      note: `${electricOnly.sharePercent.toFixed(1)}% of new cars`,
      title: "Electric-only makes",
      value: electricOnly.makes.length,
    });
  }

  return <KpiTiles tiles={tiles} />;
}
