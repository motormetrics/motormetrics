import { NumberValue } from "@heroui-pro/react";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import {
  getDimensionStats,
  getMonthlyRegistrationTotals,
} from "@web/queries/cars";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

/** Months drawn in the headline sparkline. */
const SPARK_MONTHS = 12;

/**
 * The page's opening figure: the month's registrations, the change on the
 * month before, the year to date and the leading make, over a sparkline of
 * the twelve months to the selected one.
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
  const changeRatio =
    previousTotal > 0 ? (current.total - previousTotal) / previousTotal : 0;

  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);

  const series = history.slice(-SPARK_MONTHS).map((row) => row.total);
  const leader = makeStats[0];

  return (
    <div className="flex flex-col gap-2.5">
      <Headline
        caption={
          <>
            vs{" "}
            {previous ? formatMonthName(previous.month) : "the previous month"}{" "}
            ·{" "}
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={yearToDate}
            />{" "}
            year to date
            {leader ? (
              <>
                {" · "}
                {leader.name} leads with {leader.share.toFixed(1)}%
              </>
            ) : null}
          </>
        }
        delta={<DeltaChip value={changeRatio * 100} />}
        label="New car registrations"
        value={
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={current.total}
          />
        }
      />
      <SparklineChart
        className="mt-2"
        title={`Monthly registrations over the ${series.length} months to ${formatMonthLabel(month)}`}
        values={series}
      />
    </div>
  );
}
