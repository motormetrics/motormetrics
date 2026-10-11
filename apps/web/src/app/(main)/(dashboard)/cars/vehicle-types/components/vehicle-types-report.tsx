import { Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import {
  type CategorySeries,
  CategoryShareChart,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-share-chart";
import { MeasureSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-filters";
import { VehicleTypesHeadline } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-headline";
import { Hairline } from "@web/components/shared/overview";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
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
} from "@web/utils/dates/format-month";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
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

const URL_PATH = "/cars/vehicle-types";

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

  const formattedMonth = formatDateToMonthYear(month);
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

  // The chart and the month-by-month table plot the same leading types, and
  // each keeps one colour wherever it appears.
  const chartedTypes = rows.slice(0, CHARTED_TYPES);
  const chartSeries: CategorySeries[] = chartedTypes.map(({ name }, index) => ({
    color: vehicleColour(name),
    key: `type${index}`,
    label: formatVehicleType(name),
  }));

  const byMonth = new Map<string, CategoryMonthlyPoint[]>();
  for (const point of series) {
    byMonth.set(point.month, [...(byMonth.get(point.month) ?? []), point]);
  }

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

  const chartData = monthlyRows.map(({ cells, month: seriesMonth }) => ({
    label: formatChartMonth(seriesMonth),
    ...Object.fromEntries(
      cells.map(({ count, share }, index) => [
        `type${index}`,
        measure === "share" ? Number(share.toFixed(1)) : count,
      ]),
    ),
  }));

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

      <div className="flex">
        <MeasureSegment />
      </div>
      <CategoryShareChart
        data={chartData}
        measure={measure}
        series={chartSeries}
      />

      <ReportSection
        caption={`${periodLabel} · ${rows.length} recorded by LTA`}
        title="All vehicle types"
      >
        <ReportTable
          columns={[
            { label: "Vehicle type" },
            { label: "Description" },
            {
              align: "end",
              label: period === "ytd" ? "Year to date" : "Registrations",
            },
            { align: "end", label: "Share" },
            { label: "", width: "200px" },
            { align: "end", label: "Electric" },
            { align: "end", label: `Vs ${year - 1}`, width: "120px" },
          ]}
        >
          {rows.map(({ count, name }, index) => {
            const share = percentageOf(count, total);
            const priorShare = percentageOf(
              priorByName.get(name) ?? 0,
              priorTotal,
            );
            const electricShare = electricByName.get(name);

            return (
              <ReportRow key={name}>
                <ReportCell className="font-bold text-base">
                  <span className="flex items-center gap-3">
                    <span
                      className="size-3.5 shrink-0 rounded"
                      style={{
                        backgroundColor: vehicleColour(name),
                      }}
                    />
                    <Link
                      className="text-foreground hover:text-accent-strong"
                      href={`${URL_PATH}/${slugify(name)}`}
                    >
                      {formatVehicleType(name)}
                    </Link>
                  </span>
                </ReportCell>
                <ReportCell className="font-medium text-muted-strong text-sm">
                  {DESCRIPTIONS[name] ?? "—"}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  <Count value={count} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {share.toFixed(1)}%
                </ReportCell>
                <ReportCell>
                  <ShareBar isLeader={index === 0} share={share} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {electricShare === undefined
                    ? "—"
                    : `${electricShare.toFixed(1)}%`}
                </ReportCell>
                <ReportCell align="end">
                  <DeltaText unit="pp" value={share - priorShare} />
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <ReportSection
        caption={`Share of each month's registrations · ${SERIES_MONTHS} months to ${formattedMonth}`}
        title="Month by month"
      >
        <ReportTable
          columns={[
            { label: "Month" },
            { align: "end", label: "Total" },
            ...chartedTypes.map(({ name }) => ({
              align: "end" as const,
              label: formatVehicleType(name),
            })),
          ]}
        >
          {[...monthlyRows].reverse().map((row) => (
            <ReportRow isActive={row.month === month} key={row.month}>
              <ReportCell className="font-bold text-base">
                {formatDateToMonthYear(row.month)}
              </ReportCell>
              <ReportCell align="end" className="font-semibold text-muted">
                <Count value={row.total} />
              </ReportCell>
              {row.cells.map(({ count, share }, index) => (
                <ReportCell
                  align="end"
                  key={chartedTypes[index].name}
                  className="whitespace-nowrap"
                >
                  <span className="font-extrabold text-base">
                    {share.toFixed(1)}%
                  </span>
                  <span className="ml-2 font-medium text-muted text-xs">
                    <Count value={count} />
                  </span>
                </ReportCell>
              ))}
            </ReportRow>
          ))}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection
          caption={periodLabel}
          title="Leading makes by vehicle type"
        >
          <div className="flex flex-col">
            {leaders.map(({ makes, name, total: typeTotal }) => (
              <div
                className="flex flex-wrap items-baseline gap-5 border-border border-b py-4"
                key={name}
              >
                <span className="w-[150px] shrink-0 font-bold text-base">
                  {formatVehicleType(name)}
                </span>
                <span className="font-semibold text-base text-muted-strong">
                  {makes.map(({ make }) => make).join(", ") || "—"}
                </span>
                {makes[0] ? (
                  <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
                    {makes[0].make}{" "}
                    {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of{" "}
                    {formatVehicleType(name)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportNote title="How LTA classifies vehicle types">
          <Typography.Paragraph>
            LTA records the vehicle type at registration, so every car counts
            once, under the class on its registration record.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Vehicle type does not determine COE category — engine capacity and
            power output do.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/vehicle-types/hatchback"
          >
            Hatchbacks in detail →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/fuel-types"
          >
            Fuel types →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
