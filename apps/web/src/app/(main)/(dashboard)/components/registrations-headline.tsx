import { NumberValue } from "@heroui-pro/react";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/app/(main)/(dashboard)/cars/components/format-month";
import { resolveCarsMonth } from "@web/app/(main)/(dashboard)/cars/search-params";
import { changeRatio } from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { getMonthlyRegistrationTotals } from "@web/queries/cars";
import { getVehiclePopulationYearlyTotals } from "@web/queries/vehicle-population";
import type { SearchParams } from "nuqs/server";

/**
 * Deep enough to reach the oldest month the picker offers, so selecting an
 * early month still yields a full run-up rather than an empty series.
 */
const HISTORY_LIMIT = 360;

/** Months drawn in the sparkline under the figure. */
const SPARK_MONTHS = 12;

/** The page's opening figure: new car registrations for the selected month. */
export async function RegistrationsHeadline({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const month = await resolveCarsMonth(searchParams);
  const [monthlyTotals, populationTotals] = await Promise.all([
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    getVehiclePopulationYearlyTotals(),
  ]);

  const selectedIndex = monthlyTotals.findIndex((row) => row.month === month);
  if (selectedIndex < 0) {
    return null;
  }

  const history = monthlyTotals.slice(0, selectedIndex + 1);
  const current = history[selectedIndex];
  const previous = history.at(-2);

  const year = month.slice(0, 4);
  const yearToDate = history
    .filter((row) => row.month.startsWith(year))
    .reduce((total, row) => total + row.total, 0);

  // The population series is yearly and sorted newest first; quote the latest
  // year that is not after the selected one, or the newest on record.
  const fleet =
    populationTotals.find((row) => row.year <= year) ?? populationTotals[0];

  const series = history.slice(-SPARK_MONTHS).map((row) => row.total);

  return (
    <div className="flex flex-col gap-5">
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
            {fleet ? (
              <>
                {" · "}
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={fleet.total}
                />{" "}
                vehicles on the road
              </>
            ) : null}
          </>
        }
        delta={
          <DeltaChip
            value={changeRatio(current.total, previous?.total) * 100}
          />
        }
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
        title={`Monthly registrations over the ${series.length} months to ${formatMonthLabel(month)}`}
        values={series}
      />
    </div>
  );
}
