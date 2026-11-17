import { CategoryTable } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/category-table";
import { DeregistrationsChart } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-chart";
import {
  CATEGORIES,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import { stackedPoints } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { type KpiTile, KpiTiles } from "@web/components/shared/kpi-tiles";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

/** The categories after the total in the KPI row, by their place in `CATEGORIES`. */
const KPI_CATEGORIES = [0, 1, 3];

/** "LTA data to October 2026"; reads only cached data. */
export async function DeregistrationsAsOf() {
  return (
    <>LTA data to {formatMonthLabel(await getLatestMonth("deregistrations"))}</>
  );
}

/** "August 2026", wherever a label names the selected month. */
export async function ReportMonth({ report }: ReportProps) {
  const { month } = await report;
  return formatMonthLabel(month);
}

/**
 * The month's total, then Categories A, B and D, each against the month
 * before with the twelve months to it as a sparkline.
 */
export async function DeregistrationsKpis({ report }: ReportProps) {
  const { month, monthlyRows, priorMonth } = await report;
  const note = formatMonthLabel(month);
  const label = `vs ${formatMonthName(priorMonth)}`;
  // Months before the feed begins total zero; they are gaps, not lows.
  const rows = monthlyRows.filter((row) => row.total > 0);
  const [current, previous] = [rows.at(-1), rows.at(-2)];
  if (!current) {
    return null;
  }

  const tile = (title: string, values: number[]): KpiTile => {
    const [value, before] = [values.at(-1) ?? 0, values.at(-2)];
    return {
      change:
        previous && before
          ? { label, value: changeRatio(value, before) * 100 }
          : undefined,
      format: "count",
      note,
      title,
      trend: values,
      value,
    };
  };

  return (
    <KpiTiles
      tiles={[
        tile(
          "Vehicles deregistered",
          rows.map((row) => row.total),
        ),
        ...KPI_CATEGORIES.map((index) =>
          tile(
            CATEGORIES[index].label,
            rows.map((row) => row.counts[index] ?? 0),
          ),
        ),
      ]}
    />
  );
}

export async function TrendChart({ report }: ReportProps) {
  const { month, monthlyRows } = await report;

  return (
    <DeregistrationsChart
      data={stackedPoints(monthlyRows, month)}
      series={CATEGORIES.map(({ color, label }) => ({ color, label }))}
      ticks={axisTicks(
        monthlyRows.map(({ total }) => total),
        { zero: true },
      )}
    />
  );
}

/** "Against August 2025". */
export async function CategoriesPeriod({ report }: ReportProps) {
  const { month, yearAgoMonth } = await report;
  return `${formatMonthLabel(month)} · change on ${formatMonthLabel(yearAgoMonth)}`;
}

export async function Categories({ report }: ReportProps) {
  const { categories, yearAgoMonth } = await report;

  return (
    <CategoryTable rows={categories} yearAgoLabel={yearAgoMonth.slice(0, 4)} />
  );
}
