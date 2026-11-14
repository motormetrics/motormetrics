import { Typography } from "@heroui/react";
import {
  changeLabel,
  RangeHero,
  rangeSummary,
} from "@web/app/(main)/(dashboard)/cars/components/range-hero";
import {
  TwoShadeTrendChart,
  type TwoShadeTrendPoint,
} from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  getDimensionStats,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

/** Months the hero's range and the trend chart span. */
const TREND_MONTHS = 12;

interface MonthProps {
  searchParams: Promise<SearchParams>;
}

/** The selected month and the twelve months to it, oldest first. */
async function loadWindow(searchParams: Promise<SearchParams>) {
  const month = await resolveCarsMonth(searchParams);
  const monthlyTotals = await getMonthlyRegistrationTotals(HISTORY_LIMIT);
  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  const history =
    selectedIndex < 0 ? [] : monthlyTotals.slice(0, selectedIndex + 1);
  const window = history.slice(-TREND_MONTHS);
  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);

  return { month, window, year, yearToDate };
}

/** "August 2026", for the eyebrow and the hero. */
export async function CarsMonthLabel({ searchParams }: MonthProps) {
  return formatMonthLabel(await resolveCarsMonth(searchParams));
}

/**
 * The page's answer: the month's registrations, the change on the month
 * before and where the month sits in its twelve-month range.
 */
export async function RegistrationsHero({ searchParams }: MonthProps) {
  const { month, window } = await loadWindow(searchParams);
  const current = window.at(-1);
  const previous = window.at(-2);
  const range = current
    ? rangeSummary(
        window.map((row) => row.total),
        current.total,
        `${TREND_MONTHS} months`,
      )
    : null;

  if (!current || !range) {
    return null;
  }

  return (
    <RangeHero
      change={
        previous
          ? changeLabel(
              current.total,
              previous.total,
              formatMonthName(previous.month),
            )
          : undefined
      }
      label="New cars registered"
      period={formatMonthLabel(month)}
      range={range}
      span={`${TREND_MONTHS}-month`}
    />
  );
}

/** "36,646 new cars were registered in 2026 to August, and BYD leads with 24.6% of them." */
export async function RegistrationsLead({ searchParams }: MonthProps) {
  const { month, year, yearToDate } = await loadWindow(searchParams);
  const [leader] = await getDimensionStats("make", month);

  return (
    <Typography.Paragraph className="max-w-prose tabular-nums">
      {yearToDate.toLocaleString("en-SG")} new cars were registered in {year} to{" "}
      {formatMonthName(month)}
      {leader
        ? `, and ${leader.name} leads with ${leader.share.toFixed(1)}% of them`
        : ""}
      .
    </Typography.Paragraph>
  );
}

/**
 * "Registrations peaked at 6,390 in December 2025; August's 4,549 was 8.2%
 * below July's 4,953."
 */
export async function RegistrationsTrendCaption({ searchParams }: MonthProps) {
  const { window } = await loadWindow(searchParams);
  const current = window.at(-1);
  const previous = window.at(-2);
  const peak = window.reduce<(typeof window)[number] | undefined>(
    (best, row) => (!best || row.total > best.total ? row : best),
    undefined,
  );

  if (!current || !peak) {
    return null;
  }

  const comparison =
    previous && previous.total > 0
      ? `; ${formatMonthName(current.month)}'s ${current.total.toLocaleString("en-SG")} was ${Math.abs(((current.total - previous.total) / previous.total) * 100).toFixed(1)}% ${current.total < previous.total ? "below" : "above"} ${formatMonthName(previous.month)}'s ${previous.total.toLocaleString("en-SG")}`
      : "";

  return `Registrations peaked at ${peak.total.toLocaleString("en-SG")} in ${formatMonthLabel(peak.month)}${comparison}.`;
}

/** The twelve months to the selected one; the selected month is darker. */
export async function RegistrationsTrend({ searchParams }: MonthProps) {
  const { month, window } = await loadWindow(searchParams);

  if (window.length === 0) {
    return null;
  }

  const data: TwoShadeTrendPoint[] = window.map((row, index) => ({
    count: row.total,
    earlier: row.month === month ? 0 : row.total,
    label: formatChartMonth(row.month),
    latest: row.month === month ? row.total : 0,
    title: formatMonthLabel(row.month),
    year: index === 0 || row.month.endsWith("-01") ? row.month.slice(0, 4) : "",
  }));
  const ticks = axisTicks(
    window.map((row) => row.total),
    { zero: true },
  );

  return (
    <TwoShadeTrendChart
      data={data}
      height={260}
      maxBarSize={48}
      ticks={ticks}
      tooltipLabel="New cars"
    />
  );
}
