import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import {
  FuelTypeTabs,
  RangeTabs,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/filters";
import { FuelTypeTable } from "@web/app/(main)/(dashboard)/cars/registrations/components/fuel-type-table";
import {
  TopMakesTable,
  VehicleTypeTable,
} from "@web/app/(main)/(dashboard)/cars/registrations/components/makes-and-types";
import { RegistrationsHeadline } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-headline";
import { RegistrationsTrendChart } from "@web/app/(main)/(dashboard)/cars/registrations/components/registrations-trend-chart";
import { trendPoints } from "@web/app/(main)/(dashboard)/cars/registrations/components/trend-points";
import {
  loadSearchParams,
  RANGE_MONTHS,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/registrations/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { getDistinctFuelTypes } from "@web/queries/cars";
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
  const [{ month }, fuelTypes, yearlyTotals, series] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getDistinctFuelTypes(),
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

  // The headline follows the filter: the fuel type's own count when one is
  // selected, the month's full total otherwise.
  const headlineValue = fuelType
    ? (registrations.fuelType.find(({ name }) => name === fuelType)?.count ?? 0)
    : registrations.total;
  const previousValue = fuelType
    ? lookup(comparison.previousMonth.fuelType, fuelType)
    : comparison.previousMonth.total;

  const lastTwelve = series.slice(-12).map(({ total }) => total);
  const monthlyAverage = lastTwelve.length
    ? Math.round(
        lastTwelve.reduce((sum, total) => sum + total, 0) / lastTwelve.length,
      )
    : 0;
  const bestMonth = lastTwelve.length ? Math.max(...lastTwelve) : 0;
  const yearToDateTotal = series
    .filter(({ month: seriesMonth }) => seriesMonth.startsWith(`${year}-`))
    .reduce((sum, { total }) => sum + total, 0);

  const yearTotal =
    yearlyTotals.find((entry) => entry.year === year)?.total ?? 0;

  return (
    <>
      {/* Fuel type narrows the headline and the chart; range sets the chart
          window. Each label sits over its own control, as in the comp. */}
      <div className="flex flex-wrap items-end gap-6 border-border border-y py-4 max-md:flex-col max-md:items-stretch max-md:gap-4">
        <div className="flex min-w-0 max-w-full flex-col gap-2">
          <span className="font-semibold text-muted text-xs">Fuel type</span>
          <FuelTypeTabs
            fuelTypes={fuelTypes.map(({ fuelType: name }) => name)}
          />
        </div>
        <div className="flex flex-col gap-2 md:ml-auto">
          <span className="font-semibold text-muted text-xs">Range</span>
          <RangeTabs />
        </div>
      </div>

      <RegistrationsHeadline
        label={
          fuelType ? `${fuelType} cars registered` : "All new car registrations"
        }
        previousMonth={comparison.previousMonth.period}
        previousValue={previousValue}
        stats={[
          {
            label: "Previous month",
            note: formatMonthLabel(comparison.previousMonth.period),
            value: previousValue,
          },
          {
            label: `${year} year to date`,
            note: `${series.filter(({ month: m }) => m.startsWith(`${year}-`)).length} months`,
            value: yearToDateTotal,
          },
          {
            label: "Monthly average",
            note: "last 12 months",
            value: monthlyAverage,
          },
          { label: "Best month", note: "last 12 months", value: bestMonth },
        ]}
        sub={`${formatMonthLabel(month)} · ${fuelType ? `${((headlineValue / (registrations.total || 1)) * 100).toFixed(1)}% of the month` : "every fuel type"}`}
        value={headlineValue}
      />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${RANGE_CAPTIONS[range]} to ${formatDateToMonthYear(latestMonth)} · hover or tap a bar for its value`}
          eyebrow="Trend"
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
