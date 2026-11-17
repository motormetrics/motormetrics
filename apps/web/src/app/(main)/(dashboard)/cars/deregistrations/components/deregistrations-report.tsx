import { CategoryTable } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/category-table";
import { DeregistrationsChart } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-chart";
import {
  CATEGORIES,
  type ReportProps,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/report-data";
import { stackedPoints } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

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
