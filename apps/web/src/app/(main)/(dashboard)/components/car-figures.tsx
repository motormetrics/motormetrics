import {
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  FuelMixChart,
  type FuelMixPoint,
  type FuelMixSeries,
} from "@web/app/(main)/(dashboard)/components/fuel-mix-chart";
import {
  axisTicks,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { TopMakesTable } from "@web/app/(main)/(dashboard)/components/top-makes-table";
import { FigureCard } from "@web/components/shared/figure-card";
import {
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
} from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const CHART_MONTHS = 12;
/** Matches the KPI row's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;
const TOP_MAKES = 10;

/**
 * The fuel types the chart stacks, bottom first, keyed by LTA's own names.
 * Diesel and the rarer fuels are a handful of cars a month and are left out.
 */
const FUEL_SERIES: (FuelMixSeries & { name: string })[] = [
  {
    color: "var(--chart-1)",
    key: "electric",
    label: "Electric",
    name: "Electric",
  },
  {
    color: "var(--chart-3)",
    key: "hybrid",
    label: "Petrol-electric hybrid",
    name: "Petrol-Electric",
  },
  {
    color: "var(--chart-4)",
    key: "plugIn",
    label: "Plug-in hybrid",
    name: "Petrol-Electric (Plug-In)",
  },
  {
    color: "var(--chart-2)",
    key: "petrol",
    label: "Petrol",
    name: "Petrol",
  },
];

/** New cars by month over the last year, stacked by fuel type. */
export async function FuelMixCard() {
  const month = await getLatestMonth("cars");
  const [totals, ...byFuel] = await Promise.all([
    getMonthlyRegistrationTotals(HISTORY_LIMIT),
    ...FUEL_SERIES.map(({ name }) =>
      getMonthlyRegistrationTotalsByFuelType(name, HISTORY_LIMIT),
    ),
  ]);

  const months = windowEndingAt(totals, month, CHART_MONTHS);
  if (months.length === 0) {
    return null;
  }
  const counts = byFuel.map(
    (series) => new Map(series.map((row) => [row.month, row.total])),
  );
  const data: FuelMixPoint[] = months.map((row, index) => ({
    label: formatChartMonth(row.month),
    title: formatMonthLabel(row.month),
    total: row.total,
    year: index === 0 || row.month.endsWith("-01") ? row.month.slice(0, 4) : "",
    ...Object.fromEntries(
      FUEL_SERIES.map(({ key }, position) => [
        key,
        counts[position].get(row.month) ?? 0,
      ]),
    ),
  }));
  const ticks = axisTicks(
    data.map((point) =>
      FUEL_SERIES.reduce((sum, { key }) => sum + Number(point[key]), 0),
    ),
    { zero: true },
  );

  return (
    <FigureCard
      description={<>Last {CHART_MONTHS} months</>}
      link={{ href: "/cars?dimension=fuelType", label: "All fuel types" }}
      title="New cars by fuel type"
    >
      <ul className="flex flex-wrap gap-x-4 gap-y-2 text-foreground text-xs">
        {FUEL_SERIES.map(({ color, key, label }) => (
          <li className="inline-flex items-center gap-2" key={key}>
            <span
              aria-hidden
              className="block size-2.5 rounded-xs"
              style={{ backgroundColor: color }}
            />
            {label}
          </li>
        ))}
      </ul>
      <FuelMixChart data={data} series={FUEL_SERIES} ticks={ticks} />
    </FigureCard>
  );
}

/** The ten leading makes year to date, as a table. */
export async function TopMakesCard() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  if (!latestMonth || rows.length === 0) {
    return null;
  }

  const period = periodLabel(latestMonth, "ytd");

  return (
    <FigureCard
      description={
        <>New cars, {period}; change on the same months a year earlier</>
      }
      link={{ href: "/cars/makes", label: `All ${rows.length} makes` }}
      title={<>Top {TOP_MAKES} makes</>}
    >
      <TopMakesTable
        label={`Top ${TOP_MAKES} makes, ${period}`}
        rows={rows
          .slice(0, TOP_MAKES)
          .map(({ count, logoUrl, make, rank, share, slug, yoyChange }) => ({
            count,
            logoUrl,
            make,
            rank,
            share,
            slug,
            yoyChange,
          }))}
      />
    </FigureCard>
  );
}
