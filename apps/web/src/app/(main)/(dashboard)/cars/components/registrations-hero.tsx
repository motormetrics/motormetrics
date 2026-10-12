import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  RegistrationsTrendChart,
  type TrendPoint,
} from "@web/app/(main)/(dashboard)/cars/components/registrations-trend-chart";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import {
  axisTicks,
  summariseMonth,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
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

/** "+26.0%", with a true minus for a fall. */
const formatSignedPercent = (ratio: number): string =>
  `${ratio < 0 ? "−" : "+"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * The page's opening figure: the month's registrations, the change on the
 * month before, the year to date and the leading make.
 */
export async function RegistrationsHero({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const [monthlyTotals, makeStats] = await Promise.all([
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getDimensionStats("make", month),
  ]);

  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  if (selectedIndex < 0) {
    return null;
  }

  const history = monthlyTotals.slice(0, selectedIndex + 1);
  const current = history[selectedIndex];
  const previous = history.at(-2);
  const previousTotal = previous?.total ?? 0;
  const difference = current.total - previousTotal;

  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);
  const leader = makeStats[0];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Typography.Paragraph color="muted" size="xs" weight="semibold">
        New cars registered in {formatMonthLabel(month)}
      </Typography.Paragraph>
      <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={current.total}
        />
      </span>
      {previous && previousTotal > 0 ? (
        <Typography.Paragraph className="tabular-nums" color="muted">
          <span className="font-semibold text-foreground">
            {formatSignedPercent(difference / previousTotal)}
          </span>{" "}
          ({difference < 0 ? "−" : "+"}
          {Math.abs(difference).toLocaleString("en-SG")}) vs{" "}
          {formatMonthName(previous.month)} at{" "}
          {previousTotal.toLocaleString("en-SG")}
        </Typography.Paragraph>
      ) : null}
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {yearToDate.toLocaleString("en-SG")} so far in {year}
        {leader
          ? ` · ${leader.name} leads with ${leader.share.toFixed(1)}%`
          : null}
      </Typography.Paragraph>
    </div>
  );
}

/** Months drawn in the trend chart. */
const TREND_MONTHS = 12;

/**
 * The twelve months to the selected one as zero-based columns, under a
 * section head; the selected month is the darker column.
 */
export async function RegistrationsTrend({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const monthlyTotals = await getMonthlyRegistrationTotals(HISTORY_LIMIT);

  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  if (selectedIndex < 0) {
    return null;
  }

  const window = monthlyTotals.slice(
    Math.max(0, selectedIndex + 1 - TREND_MONTHS),
    selectedIndex + 1,
  );
  const data: TrendPoint[] = window.map((row, index) => ({
    label: formatChartMonth(row.month),
    other: row.month === month ? 0 : row.total,
    selected: row.month === month ? row.total : 0,
    title: formatMonthLabel(row.month),
    total: row.total,
    year: index === 0 || row.month.endsWith("-01") ? row.month.slice(0, 4) : "",
  }));
  const ticks = axisTicks(
    window.map((row) => row.total),
    { zero: true },
  );
  // The full history, so "the most since" can reach past the chart window.
  const history = monthlyTotals.slice(0, selectedIndex + 1);
  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);
  const summary = summariseMonth(
    history,
    month,
    "new cars registered",
    `${yearToDate.toLocaleString("en-SG")} so far in ${year}`,
  );

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${window.length} months to ${formatMonthLabel(month)} · hover or tap a bar for its value`}
        eyebrow="Trend"
        title="Registrations by month"
      />
      <RegistrationsTrendChart data={data} ticks={ticks} />
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>New car registrations, all makes and fuel types.</SourceNote>
    </section>
  );
}
