import { Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { formatPercentage } from "@motormetrics/utils/format-percentage";
import { slugify } from "@motormetrics/utils/slugify";
import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import { FuelTypeTable } from "@web/app/(main)/(dashboard)/cars/registrations/components/fuel-type-table";
import {
  TopMakesTable,
  VehicleTypeTable,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/makes-and-types";
import { RegistrationsTrendChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-trend-chart";
import { trendPoints } from "@web/app/(main)/(dashboard)/cars/registrations/components/trend-points";
import {
  loadSearchParams,
  RANGE_MONTHS,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import {
  axisTicks,
  summariseMonth,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import {
  getCarsComparison,
  getCarsData,
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
  getYearToDateByFuelType,
} from "@web/queries/cars/monthly-registrations";
import {
  getTopMakesByYear,
  getYearlyRegistrations,
} from "@web/queries/cars/yearly-statistics";
import { getCarLogoMap } from "@web/queries/logos";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import type { SearchParams } from "nuqs/server";

/** What each range covers, for the chart's caption. */
const RANGE_CAPTIONS: Record<Range, string> = {
  "1Y": "Last 12 months",
  "3Y": "Last 3 years",
  All: "Every month on record",
};

function lookup(
  rows: { count: number; label: string }[],
  name: string,
): number {
  return rows.find((row) => row.label === name)?.count ?? 0;
}

export async function RegistrationsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    fuelType,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const [{ month }, yearlyTotals, series] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getYearlyRegistrations(),
    fuelType
      ? getMonthlyRegistrationTotalsByFuelType(fuelType, RANGE_MONTHS[range])
      : getMonthlyRegistrationTotals(RANGE_MONTHS[range]),
  ]);
  const year = Number(month.slice(0, 4));

  const [registrations, comparison, yearToDate, topMakes, logoUrlBySlug] =
    await Promise.all([
      getCarsData(month),
      getCarsComparison(month),
      getYearToDateByFuelType(year),
      getTopMakesByYear(year, 10),
      getCarLogoMap(),
    ]);

  const latestMonth = series.at(-1)?.month ?? month;
  const ticks = axisTicks(
    series.map(({ total }) => total),
    { zero: true },
  );

  const yearTotal =
    yearlyTotals.find((entry) => entry.year === year)?.total ?? 0;

  const leadingFuelType = registrations.fuelType[0];
  const summary = summariseMonth(
    series,
    month,
    fuelType ? `${fuelType} cars registered` : "new cars registered",
    !fuelType && leadingFuelType && registrations.total > 0
      ? `${leadingFuelType.name} cars led with ${formatPercentage((leadingFuelType.count / registrations.total) * 100)}`
      : undefined,
  );

  return (
    <>
      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${RANGE_CAPTIONS[range]} to ${formatDateToMonthYear(latestMonth)} · hover or tap a bar for its value`}
          eyebrow="Trend"
          trailing={<RangeTabs />}
          title={
            fuelType
              ? `${fuelType} registrations by month`
              : "Registrations by month"
          }
        />
        <RegistrationsTrendChart
          data={trendPoints(series, month)}
          seriesName={fuelType ? `${fuelType} cars` : "New cars"}
          ticks={ticks}
        />
        {summary ? (
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {summary}
          </Typography.Paragraph>
        ) : null}
        <SourceNote>
          {fuelType
            ? `New ${fuelType} car registrations, all makes.`
            : "New car registrations, all makes and fuel types."}{" "}
          The chart always runs to the latest month;{" "}
          {formatDateToMonthYear(month)} is highlighted.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${formatMonthLabel(month)} · all makes · select a row to filter`}
          eyebrow="Registrations"
          link={{ href: "/cars/fuel-types", label: "Fuel types in full" }}
          title="By fuel type"
        />
        <FuelTypeTable
          previousMonthName={formatChartMonth(comparison.previousMonth.period)}
          rows={registrations.fuelType.map(({ count, name }) => ({
            change: percentageChange(
              count,
              lookup(comparison.previousMonth.fuelType, name),
            ),
            count,
            name,
            share: (count / (registrations.total || 1)) * 100,
            yearToDate:
              yearToDate.find((entry) => entry.name === name)?.count ?? 0,
          }))}
          year={year}
        />
        <SourceNote>
          Share is of {registrations.total.toLocaleString("en-SG")} new cars in{" "}
          {formatMonthLabel(month)}. Change is against the previous month;
          colour is not used for direction. Year to date covers{" "}
          {latestMonth.startsWith(`${year}-`)
            ? `January to ${formatMonthLabel(latestMonth)}`
            : `the whole of ${year}`}
          .
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-2 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4">
          <SectionHead
            caption={`${year} year to date · all fuel types`}
            eyebrow="Registrations"
            link={{ href: "/cars/makes", label: "All makes" }}
            title="Top makes"
          />
          <TopMakesTable
            makes={topMakes.map(({ make, value }) => ({
              logoUrl: logoUrlBySlug[slugify(make)] ?? null,
              make,
              value,
            }))}
            total={yearTotal}
          />
          <SourceNote>
            New car registrations by make,{" "}
            {latestMonth.startsWith(`${year}-`)
              ? `January to ${formatMonthLabel(latestMonth)}`
              : `the whole of ${year}`}
            . Not affected by the month or fuel filters.
          </SourceNote>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <SectionHead
            caption={`${formatMonthLabel(month)} · against ${formatMonthLabel(comparison.previousYear.period)}`}
            eyebrow="Registrations"
            link={{
              href: "/cars/vehicle-types",
              label: "Vehicle types in full",
            }}
            title="By vehicle type"
          />
          <VehicleTypeTable
            previousYear={year - 1}
            rows={registrations.vehicleType.map(({ count, name }) => ({
              change: percentageChange(
                count,
                lookup(comparison.previousYear.vehicleType, name),
              ),
              count,
              name: formatVehicleType(name),
            }))}
            total={registrations.total}
          />
          <SourceNote>
            A car counts in the month it is registered, which can lag the
            bidding exercise that won its COE by several weeks. Figures cover
            cars only; other vehicle classes are counted separately under their
            own categories.
          </SourceNote>
        </section>
      </div>
    </>
  );
}
