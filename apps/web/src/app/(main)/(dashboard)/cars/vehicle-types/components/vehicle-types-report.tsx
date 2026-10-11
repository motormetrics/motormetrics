import { Typography } from "@heroui/react";
import {
  MonthTable,
  PHONE_COLUMNS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/month-table";
import { VehicleTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-table";
import {
  type VehicleSeries,
  type VehicleTrendPoint,
  VehicleTypesChart,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-chart";
import { MeasureSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-filters";
import { VehicleTypesHeadline } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-headline";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import {
  type CategoryMonthlyPoint,
  getCategoryMonthlySeries,
  getCategoryTotals,
  getElectricShareByVehicleType,
  getTopMakesByCategory,
} from "@web/queries/cars/category-report";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthName,
  formatMonthShortLabel,
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

/**
 * The vehicle-type half of `cars/components/category/category-report.tsx`,
 * split off so this page can follow its own comp while `/cars/fuel-types`
 * keeps the shared report.
 */
const PERIODS = ["month", "ytd"] as const;

export const loadVehicleTypesSearchParams = createLoader({
  measure: parseAsStringLiteral(["share", "volume"] as const).withDefault(
    "share",
  ),
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault("month"),
});

/**
 * The table's description column is authored copy, not data — there is no
 * equivalent of `FUEL_TYPE_LINKS` descriptions for vehicle types, so these are
 * written here. Keys are the values exactly as LTA records them.
 */
const DESCRIPTIONS: Record<string, string> = {
  "Coupe/Convertible": "Two doors, with a fixed or folding roof",
  Hatchback: "Rear door opens onto the cabin, with no separate boot",
  "Multi-purpose Vehicle": "Tall single-volume cabin, usually with a third row",
  "Multi-purpose Vehicle/Station-wagon":
    "MPVs and station-wagons, recorded by LTA as one class",
  Others: "Vehicle types LTA does not report separately",
  Sedan: "Separate enclosed boot behind the cabin",
  "Sports Utility Vehicle": "Raised ride height, often with all-wheel drive",
  "Station-wagon": "Extended roof over the load area, tailgate at the rear",
};

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

/** How far back the trend chart reaches from the selected month. */
const SERIES_MONTHS = 12;

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

function percentageOf(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
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
  const electricByName = new Map(
    electricShares.map(({ electric, name, total: typeTotal }) => [
      name,
      percentageOf(electric, typeTotal),
    ]),
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
  // Phones keep the leading types only; the source note names the rest.
  const phoneHiddenTypes = chartedTypes
    .slice(PHONE_COLUMNS)
    .map(({ name }) => formatVehicleType(name));
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

  const chartData: VehicleTrendPoint[] = monthlyRows.map(
    ({ cells, month: seriesMonth, total: monthTotal }, index) => ({
      label: formatChartMonth(seriesMonth),
      title: formatMonthShortLabel(seriesMonth),
      total: monthTotal,
      year:
        index === 0 || seriesMonth.endsWith("-01")
          ? seriesMonth.slice(0, 4)
          : "",
      ...Object.fromEntries(
        cells.map(({ count, share }, index) => [
          `type${index}`,
          measure === "share" ? Number(share.toFixed(1)) : count,
        ]),
      ),
    }),
  );
  const chartTicks = axisTicks(
    chartData.flatMap((point) =>
      chartSeries.map(({ key }) => Number(point[key])),
    ),
    { zero: true },
  );
  const gridStep = (chartTicks[1] ?? 0) - (chartTicks[0] ?? 0);

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

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${formatMonthLabel(seriesMonths[0])} to ${formatMonthLabel(month)} · hover or tap for each month`}
          eyebrow="Trend"
          title={
            measure === "share"
              ? "Share of registrations by vehicle type"
              : "Registrations by vehicle type"
          }
          trailing={<MeasureSegment />}
        />
        <VehicleTypesChart
          data={chartData}
          measure={measure}
          series={chartSeries}
          ticks={chartTicks}
        />
        <SourceNote>
          {measure === "share"
            ? "Share of each month's new car registrations"
            : "New car registrations by month"}
          . Y-axis starts at zero; gridlines every{" "}
          {measure === "share"
            ? `${gridStep} points`
            : `${gridStep.toLocaleString("en-SG")} cars`}
          . The trend covers {SERIES_MONTHS} months whatever the period switch
          is set to.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${periodLabel} · ${rows.length} recorded by LTA · select a column heading to sort`}
          eyebrow="Registrations"
          title="All vehicle types"
        />
        <VehicleTable
          countLabel={period === "ytd" ? "Year to date" : "Registrations"}
          rows={mix.map(({ color, count, label, name, share }) => ({
            change:
              share - percentageOf(priorByName.get(name) ?? 0, priorTotal),
            color,
            count,
            description: DESCRIPTIONS[name] ?? "—",
            electric: electricByName.get(name) ?? null,
            label,
            name,
            share,
          }))}
          yearAgoLabel={String(year - 1)}
        />
        <SourceNote>
          Electric is the battery-electric share of each type. Change is in
          percentage points of share against the same period in {year - 1}.
          Colour is not used for direction.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${SERIES_MONTHS} months to ${formatMonthLabel(month)}, newest first`}
          eyebrow="Month by month"
          title="Share of each month's registrations"
        />
        <MonthTable
          rows={[...monthlyRows].reverse()}
          selectedMonth={month}
          vehicleTypes={chartedTypes.map(({ name }) => name)}
        />
        <SourceNote>
          Share of each month's new car registrations, with the car count
          beneath on wider screens.
          {phoneHiddenTypes.length > 0
            ? ` ${phoneHiddenTypes.join(", ")} and the monthly total are hidden on small screens.`
            : " The monthly total is hidden on small screens."}
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-7 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-4">
          <SectionHead
            caption={`${periodLabel} · top three makes in each type`}
            eyebrow="Makes"
            title="Leading makes by vehicle type"
          />
          <ul className="flex flex-col">
            {leaders.map(({ makes, name, total: typeTotal }) => (
              <li
                className="flex items-baseline gap-4 border-separator border-b py-3 max-md:flex-col max-md:gap-0.5"
                key={name}
              >
                <span className="w-40 shrink-0 font-semibold text-sm">
                  {formatVehicleType(name)}
                </span>
                <span className="flex min-w-0 flex-col gap-0.5">
                  <span className="text-sm">
                    {makes.map(({ make }) => make).join(", ") || "—"}
                  </span>
                  {makes[0] ? (
                    <span className="text-subtle text-xs tabular-nums">
                      {makes[0].make}{" "}
                      {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of{" "}
                      {formatVehicleType(name)}
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
          </ul>
          <SourceNote>
            Share is the leading make's share of that vehicle type's
            registrations.
          </SourceNote>
        </section>

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
