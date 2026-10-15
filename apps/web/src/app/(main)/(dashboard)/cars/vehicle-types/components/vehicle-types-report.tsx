import { Typography } from "@heroui/react";
import type { VehicleSeries } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-chart";
import { VehicleTypesHeadline } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-headline";
import { VehicleTypesLeaders } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-leaders";
import { VehicleTypesMonthly } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-monthly";
import { VehicleTypesRegistrations } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-registrations";
import {
  percentageOf,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-shared";
import { VehicleTypesTrend } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-trend";
import {
  Hairline,
  SectionHead,
  SectionLink,
} from "@web/components/shared/overview";
import {
  type CategoryMonthlyPoint,
  getCategoryMonthlySeries,
  getCategoryTotals,
  getElectricShareByVehicleType,
  getTopMakesByCategory,
} from "@web/queries/cars/category-report";
import {
  formatMonthLabel,
  formatMonthName,
} from "@web/utils/dates/format-month";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type SearchParams,
} from "nuqs/server";

const PERIODS = ["month", "ytd"] as const;

export const loadVehicleTypesSearchParams = createLoader({
  measure: parseAsStringLiteral(["share", "volume"] as const).withDefault(
    "share",
  ),
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault("month"),
});

/**
 * The comp's colour for each LTA vehicle type, shared by the mix bar, the
 * trend and the tables; anything else takes the lightest ramp step.
 */
const VEHICLE_COLOURS: Record<string, string> = {
  "Coupe/Convertible": "var(--chart-5)",
  Hatchback: "var(--muted)",
  "Multi-purpose Vehicle": "var(--chart-3)",
  Sedan: "var(--chart-sand)",
  "Sports Utility Vehicle": "var(--chart-1)",
  // The comp's dark sand has no token; the mid slate step stands in.
  "Station-wagon": "var(--chart-4)",
};

const FALLBACK_COLOUR = "var(--chart-6)";

const vehicleColour = (name: string): string =>
  VEHICLE_COLOURS[name] ?? FALLBACK_COLOUR;

/** The vehicle type the headline features, when the period has any. */
const FEATURED_TYPE = "Sports Utility Vehicle";

/** "August 2026" for a month, "2026 year to date" for the year so far. */
export function periodLabelFor(period: "month" | "ytd", month: string): string {
  return period === "ytd"
    ? `${month.slice(0, 4)} year to date`
    : formatMonthLabel(month);
}

/** How many types the chart plots and the month-by-month table columns. */
const CHARTED_TYPES = 6;

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

export async function VehicleTypesReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const {
    measure,
    month: parsedMonth,
    period,
  } = await loadVehicleTypesSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const year = Number(month.slice(0, 4));
  const periodMonths = period === "ytd" ? yearToDateMonths(month) : [month];
  const priorMonths = shiftedBackAYear(periodMonths);
  const seriesMonths = trailingMonths(month, SERIES_MONTHS);

  const [totals, priorTotals, series, leaders, electricShares] =
    await Promise.all([
      getCategoryTotals("vehicleType", periodMonths),
      getCategoryTotals("vehicleType", priorMonths),
      getCategoryMonthlySeries("vehicleType", seriesMonths),
      getTopMakesByCategory("vehicleType", periodMonths),
      getElectricShareByVehicleType(periodMonths),
    ]);

  const periodLabel = periodLabelFor(period, month);
  // The period in running text, so the year to date names its months.
  const periodSpan =
    period === "ytd"
      ? `January to ${formatMonthName(month)} ${year}`
      : formatMonthLabel(month);

  const rows = totals.filter(({ count }) => count > 0);

  if (rows.length === 0) {
    return (
      <Typography.Paragraph>
        No vehicle types data available for {periodLabel}
      </Typography.Paragraph>
    );
  }

  const total = sumCounts(rows);
  const priorTotal = sumCounts(priorTotals);
  const priorByName = new Map(
    priorTotals.map(({ count, name }) => [name, count]),
  );

  const mix = rows.map(({ count, name }) => ({
    color: vehicleColour(name),
    count,
    label: formatVehicleType(name),
    name,
    share: percentageOf(count, total),
  }));
  // SUVs are the comp's subject; a period without any falls back to the
  // largest vehicle type so the headline still reads.
  const featured = mix.find(({ name }) => name === FEATURED_TYPE) ?? mix[0];
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

  // The chart and the month-by-month table plot the same types — the leaders
  // over the twelve months, whatever the period switch says — and each keeps
  // one colour wherever it appears.
  const chartedTypes = [...seriesTotals.entries()]
    .filter(([, count]) => count > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, CHARTED_TYPES)
    .map(([name]) => ({ name }));
  const chartSeries: VehicleSeries[] = chartedTypes.map(({ name }, index) => ({
    color: vehicleColour(name),
    key: `type${index}`,
    label: formatVehicleType(name),
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
      <VehicleTypesHeadline
        change={featured.share - featuredPriorShare}
        changeLabel={String(year - 1)}
        featured={featured}
        // Rows that round to 0.0% would draw nothing; the table lists them.
        mix={mix.filter(({ share }) => share >= 0.05)}
        periodLabel={periodLabel}
        periodSpan={periodSpan}
        total={total}
      />

      <Hairline />

      <VehicleTypesTrend
        chartSeries={chartSeries}
        measure={measure}
        month={month}
        monthlyRows={monthlyRows}
      />

      <Hairline />

      <VehicleTypesRegistrations
        electricShares={electricShares}
        mix={mix}
        period={period}
        periodLabel={periodLabel}
        periodSpan={periodSpan}
        priorByName={priorByName}
        priorTotal={priorTotal}
        year={year}
      />

      <Hairline />

      <VehicleTypesMonthly
        month={month}
        monthlyRows={monthlyRows}
        vehicleTypes={chartedTypes.map(({ name }) => name)}
      />

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-7 lg:gap-14">
        <VehicleTypesLeaders leaders={leaders} periodLabel={periodLabel} />

        <section className="flex min-w-0 flex-col gap-4 lg:col-span-3">
          <SectionHead
            eyebrow="Method"
            title="How LTA classifies vehicle types"
          />
          <Typography.Paragraph className="text-muted-strong" size="sm">
            LTA records the vehicle type at registration, so every car counts
            once, under the class on its registration record.
          </Typography.Paragraph>
          <Typography.Paragraph className="text-muted-strong" size="sm">
            Vehicle type does not determine COE category. Engine capacity and
            power output do.
          </Typography.Paragraph>
          <div className="flex flex-wrap gap-5">
            <SectionLink className="ml-0" href="/cars/vehicle-types/hatchback">
              Hatchbacks in detail
            </SectionLink>
            <SectionLink className="ml-0" href="/cars/fuel-types">
              Fuel types
            </SectionLink>
          </div>
        </section>
      </div>
    </>
  );
}
