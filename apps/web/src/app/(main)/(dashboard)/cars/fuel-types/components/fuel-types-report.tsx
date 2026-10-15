import { Typography } from "@heroui/react";
import type { FuelSeries } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-chart";
import { PeriodSegment } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-filters";
import { FuelTypesHeadline } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-headline";
import { FuelTypesLeaders } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-leaders";
import { FuelTypesMonthly } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-monthly";
import { FuelTypesRegistrations } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-registrations";
import {
  percentageOf,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-shared";
import { FuelTypesTrend } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-trend";
import {
  Hairline,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import {
  type CategoryMonthlyPoint,
  getCategoryMonthlySeries,
  getCategoryTotals,
  getTopMakesByCategory,
} from "@web/queries/cars/category-report";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type SearchParams,
} from "nuqs/server";

const PERIODS = ["month", "ytd"] as const;

const loadFuelTypesSearchParams = createLoader({
  measure: parseAsStringLiteral(["share", "volume"] as const).withDefault(
    "share",
  ),
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault("month"),
});

/**
 * The comp's colour for each LTA fuel label, shared by the mix bar, the trend
 * and the tables; anything else takes the lightest ramp step.
 */
const FUEL_COLOURS: Record<string, string> = {
  Diesel: "var(--muted)",
  Electric: "var(--chart-1)",
  Petrol: "var(--chart-sand)",
  "Petrol-Electric": "var(--chart-3)",
  "Petrol-Electric (Plug-In)": "var(--chart-5)",
};

const FALLBACK_COLOUR = "var(--chart-6)";

const fuelColour = (name: string): string =>
  FUEL_COLOURS[name] ?? FALLBACK_COLOUR;

/** The fuel type the headline features, when the period has any. */
const FEATURED_FUEL = "Electric";

/**
 * How many fuel types the chart plots and the month-by-month table columns:
 * the four with the most registrations over the twelve months, as the comp
 * draws Electric, both petrol hybrids and Petrol. The rest are a handful of
 * cars a month and would lie flat along the axis.
 */
const CHARTED_TYPES = 4;

/** The comp's series order; a fuel type outside it sorts after these. */
const FUEL_ORDER = [
  "Electric",
  "Petrol-Electric",
  "Petrol-Electric (Plug-In)",
  "Petrol",
  "Diesel",
];

const fuelRank = (name: string): number => {
  const rank = FUEL_ORDER.indexOf(name);
  return rank === -1 ? FUEL_ORDER.length : rank;
};

/** January through `month`, for the year-to-date view. */
function yearToDateMonths(month: string): string[] {
  const year = month.slice(0, 4);
  const lastMonth = Number(month.slice(5, 7));

  return Array.from(
    { length: lastMonth },
    (_, index) => `${year}-${String(index + 1).padStart(2, "0")}`,
  );
}

/** The same span a year earlier, for the year-on-year column. */
function shiftedBackAYear(months: string[]): string[] {
  return months.map((month) => shiftMonth(month, -12));
}

function sumCounts(rows: { count: number }[]): number {
  return rows.reduce((total, { count }) => total + count, 0);
}

export async function FuelTypesReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    measure,
    month: parsedMonth,
    period,
  } = await loadFuelTypesSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const year = Number(month.slice(0, 4));
  const periodMonths = period === "ytd" ? yearToDateMonths(month) : [month];
  const priorMonths = shiftedBackAYear(periodMonths);
  const seriesMonths = trailingMonths(month, SERIES_MONTHS);

  const [totals, priorTotals, series, leaders] = await Promise.all([
    getCategoryTotals("fuelType", periodMonths),
    getCategoryTotals("fuelType", priorMonths),
    getCategoryMonthlySeries("fuelType", seriesMonths),
    getTopMakesByCategory("fuelType", periodMonths),
  ]);

  const periodLabel =
    period === "ytd" ? `${year} year to date` : formatMonthLabel(month);

  const rows = totals.filter(({ count }) => count > 0);

  if (rows.length === 0) {
    return (
      <Typography.Paragraph>
        No fuel types data available for {periodLabel}
      </Typography.Paragraph>
    );
  }

  const total = sumCounts(rows);
  const priorTotal = sumCounts(priorTotals);
  const priorByName = new Map(
    priorTotals.map(({ count, name }) => [name, count]),
  );

  const mix = rows.map(({ count, name }) => ({
    color: fuelColour(name),
    count,
    name,
    share: percentageOf(count, total),
  }));
  // Electric is the comp's subject; a period without any falls back to the
  // largest fuel type so the headline still reads.
  const featured = mix.find(({ name }) => name === FEATURED_FUEL) ?? mix[0];
  const featuredPriorShare = percentageOf(
    priorByName.get(featured.name) ?? 0,
    priorTotal,
  );

  const byMonth = new Map<string, CategoryMonthlyPoint[]>();
  const seriesTotals = new Map<string, number>();
  for (const point of series) {
    byMonth.set(point.month, [...(byMonth.get(point.month) ?? []), point]);
    seriesTotals.set(
      point.name,
      (seriesTotals.get(point.name) ?? 0) + point.count,
    );
  }

  // The chart and the month-by-month table plot the same fuel types, in the
  // comp's order, and each keeps one colour wherever it appears.
  const chartedTypes = [...seriesTotals.entries()]
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, CHARTED_TYPES)
    .map(([name]) => ({ name }))
    .sort((a, b) => fuelRank(a.name) - fuelRank(b.name));
  // Fuel types the chart and month table leave out, and the most any of them
  // registered in a single month, so the note can say why.
  const chartedNames = new Set(chartedTypes.map(({ name }) => name));
  const omittedTypes = [...seriesTotals.entries()]
    .filter(([name, count]) => count > 0 && !chartedNames.has(name))
    .map(([name]) => name);
  const omittedMonthlyMax = Math.max(
    0,
    ...series
      .filter(({ name }) => omittedTypes.includes(name))
      .map(({ count }) => count),
  );
  const chartSeries: FuelSeries[] = chartedTypes.map(({ name }, index) => ({
    color: fuelColour(name),
    key: `type${index}`,
    label: name,
  }));

  const monthlyRows = seriesMonths.map((seriesMonth) => {
    const points = byMonth.get(seriesMonth) ?? [];
    const monthTotal = sumCounts(points);
    const countByName = new Map(points.map(({ count, name }) => [name, count]));

    return {
      cells: chartedTypes.map(({ name }) => {
        const count = countByName.get(name) ?? 0;
        return { count, share: percentageOf(count, monthTotal) };
      }),
      month: seriesMonth,
      total: monthTotal,
    };
  });

  return (
    <>
      <div className="flex flex-col gap-5">
        <div className="flex">
          <PeriodSegment />
        </div>
        <FuelTypesHeadline
          change={featured.share - featuredPriorShare}
          changeLabel={String(year - 1)}
          featured={featured}
          // Rows that round to 0.0% would draw nothing; the table lists them.
          mix={mix.filter(({ share }) => share >= 0.05)}
          periodLabel={periodLabel}
          total={total}
        />
      </div>

      <Hairline />

      <FuelTypesTrend
        chartSeries={chartSeries}
        measure={measure}
        month={month}
        monthlyRows={monthlyRows}
      />

      <Hairline />

      <FuelTypesRegistrations
        mix={mix}
        period={period}
        periodLabel={periodLabel}
        priorByName={priorByName}
        priorTotal={priorTotal}
        total={total}
        year={year}
      />

      <Hairline />

      <FuelTypesMonthly
        fuelTypes={chartedTypes.map(({ name }) => name)}
        month={month}
        monthlyRows={monthlyRows}
        omittedMonthlyMax={omittedMonthlyMax}
        omittedTypes={omittedTypes}
      />

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-7 lg:gap-14">
        <FuelTypesLeaders leaders={leaders} periodLabel={periodLabel} />

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          <SectionHead eyebrow="Method" title="How LTA classifies fuel types" />
          <Typography.Paragraph className="text-muted-strong" size="sm">
            LTA records the fuel type at registration, and reports plug-in
            hybrids separately from the hybrids that only charge themselves.
            Only battery-electric cars count as Electric.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong" size="sm">
            Figures here are new registrations, not the fleet on the road. The
            population mix shifts far more slowly.
          </Typography.Paragraph>
          <div className="flex flex-wrap gap-5">
            <SectionLink className="ml-0" href="/cars/fuel-types/electric">
              Electric in detail
            </SectionLink>
            <SectionLink className="ml-0" href="/cars/vehicle-types">
              Vehicle types
            </SectionLink>
          </div>
        </section>
      </div>
    </>
  );
}
