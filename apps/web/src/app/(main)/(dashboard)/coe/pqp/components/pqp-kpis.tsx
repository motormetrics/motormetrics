import { changeRatio } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";
import {
  categoryName,
  loadPqpData,
} from "@web/app/(main)/(dashboard)/coe/pqp/components/pqp-view";
import { PQP_CATEGORY_KEYS } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";

/** Ten years costs the full PQP, five years half of it. */
const TERMS = [
  { factor: 1, label: "10-year" },
  { factor: 0.5, label: "5-year" },
] as const;

/**
 * This month's renewal cost for each category at both terms, with the change
 * on last month and the published months behind it. Reads only cached data,
 * so it is part of the static shell.
 */
export async function PQPKpis() {
  const { ascending } = await loadPqpData();
  const [latest, previous] = [ascending.at(-1), ascending.at(-2)];
  if (!latest) {
    return null;
  }

  const tiles: KpiTile[] = PQP_CATEGORY_KEYS.flatMap((key) => {
    const name = categoryName(key);
    const rate = latest[name];
    if (!(rate > 0)) {
      return [];
    }
    const earlier = previous?.[name];
    return TERMS.map(({ factor, label }) => ({
      change:
        previous && earlier && earlier > 0
          ? {
              label: `vs ${formatMonthName(previous.month)}`,
              value: changeRatio(rate, earlier) * 100,
            }
          : undefined,
      format: "currency" as const,
      note: formatMonthLabel(latest.month),
      title: `Cat ${key}, ${label} renewal`,
      trend: ascending
        .map((point) => point[name] * factor)
        .filter((value) => value > 0),
      value: rate * factor,
    }));
  });

  return <KpiTiles tiles={tiles} />;
}

/** "LTA data to November 2026", the month the latest PQP is for. */
export async function PQPAsOf() {
  const { latestMonth } = await loadPqpData();
  return latestMonth
    ? `LTA data to ${formatMonthLabel(latestMonth)}`
    : "LTA data";
}
