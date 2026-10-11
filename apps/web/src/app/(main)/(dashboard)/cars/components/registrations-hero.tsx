import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import {
  getDimensionStats,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import {
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
