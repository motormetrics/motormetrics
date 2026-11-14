import { Typography } from "@heroui/react";
import { FuelSplit } from "@web/app/(main)/(dashboard)/cars/annual/components/fuel-split";
import {
  loadMakeRows,
  periodLabel,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { changeLabel } from "@web/app/(main)/(dashboard)/cars/makes/components/makes-index";
import {
  FuelMixChart,
  type FuelMixPoint,
  type FuelMixSeries,
} from "@web/app/(main)/(dashboard)/components/fuel-mix-chart";
import {
  fuelCaption,
  makesCaption,
  roadCaption,
  signed,
} from "@web/app/(main)/(dashboard)/components/market-copy";
import {
  axisTicks,
  windowEndingAt,
} from "@web/app/(main)/(dashboard)/components/overview-series";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import {
  SectionHead,
  SectionLink,
  SourceNote,
} from "@web/components/shared/overview";
import {
  getMonthlyRegistrationTotals,
  getMonthlyRegistrationTotalsByFuelType,
} from "@web/queries/cars";
import { getDeregistrations } from "@web/queries/deregistrations";
import { getVehiclePopulationByYearAndFuelType } from "@web/queries/vehicle-population";
import { changeRatio } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getLatestMonth } from "@web/utils/dates/months";
import Link from "next/link";

const CHART_MONTHS = 12;
/** Matches the head's query, so both read one cache entry. */
const HISTORY_LIMIT = 24;
const TOP_MAKES = 10;

/**
 * The fuel types Figure 2 stacks, bottom first, keyed by LTA's own names.
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
    color: "var(--chart-sand)",
    key: "petrol",
    label: "Petrol",
    name: "Petrol",
  },
];

/** Shorter names for LTA's deregistration categories. */
const DEREGISTRATION_LABELS: Record<string, string> = {
  "Vehicles Exempted From VQS": "Exempt from VQS",
};

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** Figure 2: new cars by month over the last year, stacked by fuel type. */
export async function FuelMixFigure() {
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

  const shareOf = (point: FuelMixPoint, key: string) =>
    point.total > 0 ? (Number(point[key]) / point.total) * 100 : 0;
  const latest = data[data.length - 1];
  const previous = data.at(-2);
  const ticks = axisTicks(
    data.map((point) =>
      FUEL_SERIES.reduce((sum, { key }) => sum + Number(point[key]), 0),
    ),
    { zero: true },
  );

  return (
    <section
      aria-labelledby="fuel-types-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="fuel-types"
    >
      <SectionHead
        caption={fuelCaption({
          electric: shareOf(latest, "electric"),
          month: months[months.length - 1].month,
          petrol: shareOf(latest, "petrol"),
          previous: previous
            ? {
                electric: shareOf(previous, "electric"),
                month: months[months.length - 2].month,
              }
            : undefined,
          total: latest.total,
        })}
        eyebrow="Figure 2 · Registrations"
        link={{ href: "/cars/fuel-types", label: "All fuel types" }}
        title={
          <span id="fuel-types-heading">
            New cars by fuel type, last {CHART_MONTHS} months
          </span>
        }
      />
      <ul className="flex flex-wrap gap-x-5 gap-y-2 text-muted-strong text-xs">
        {FUEL_SERIES.map(({ color, key, label }) => (
          <li className="inline-flex items-center gap-1.5" key={key}>
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
      <SourceNote>
        Source: LTA via DataMall · New car registrations by month, zero-based.
        Diesel and other fuels are a few cars a month and not shown. Hover or
        tap a month for counts.
      </SourceNote>
    </section>
  );
}

/** Figure 3: the ten largest makes this year, each card opening its page. */
export async function TopMakesFigure() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  if (!latestMonth || rows.length === 0) {
    return null;
  }

  const period = periodLabel(latestMonth, "ytd");

  return (
    <section
      aria-labelledby="top-makes-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="top-makes"
    >
      <SectionHead
        caption={makesCaption(rows, period)}
        eyebrow="Figure 3 · Makes"
        link={{ href: "/cars/makes", label: `All ${rows.length} makes` }}
        title={
          <span id="top-makes-heading">
            Top {TOP_MAKES} makes, {latestMonth.slice(0, 4)} to date
          </span>
        }
      />
      <ul className="grid @3xl:grid-cols-3 @5xl:grid-cols-4 @7xl:grid-cols-5 @md:grid-cols-2 grid-cols-1 gap-2.5">
        {rows.slice(0, TOP_MAKES).map((row) => {
          const peak = Math.max(...row.trend, 1);
          return (
            <li key={row.slug}>
              <Link
                className="flex h-full min-w-0 flex-col gap-2.5 rounded-lg border border-separator bg-surface p-3.5 text-foreground no-underline transition-colors hover:border-border hover:bg-surface-secondary"
                href={`/cars/makes/${row.slug}`}
              >
                <span className="flex min-w-0 items-center gap-2.5">
                  <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="sm" />
                  <span className="truncate font-semibold">{row.make}</span>
                  <span className="ml-auto text-muted text-xs tabular-nums">
                    #{row.rank}
                  </span>
                </span>
                <span className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                  <span className="font-semibold text-xl tabular-nums">
                    {formatCount(row.count)}
                  </span>
                  <span className="text-muted text-sm tabular-nums">
                    {row.share.toFixed(1)}% ·{" "}
                    {changeLabel(row, "ytd", latestMonth)}
                  </span>
                </span>
                {/* The last twelve months, the latest in the darker shade. */}
                <span aria-hidden className="flex h-8 items-end gap-0.5">
                  {row.trend.map((value, index) => (
                    <span
                      className={
                        index === row.trend.length - 1
                          ? "flex-1 rounded-t-xs bg-chart-1"
                          : "flex-1 rounded-t-xs bg-chart-5"
                      }
                      // biome-ignore lint/suspicious/noArrayIndexKey: a month's position is its identity
                      key={index}
                      style={{
                        height: `${Math.max((value / peak) * 100, 2)}%`,
                      }}
                    />
                  ))}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
      <SourceNote>
        Source: LTA via DataMall · New car registrations, {period}; change
        against the same months of {Number(latestMonth.slice(0, 4)) - 1}. Bars
        show the last 12 months, each make on its own scale.
      </SourceNote>
    </section>
  );
}

/**
 * Figure 4: what left the road last month, by category, beside the fuel
 * split of everything still on it at the last year end.
 */
export async function RoadFigure() {
  const [deregistrations, population] = await Promise.all([
    getDeregistrations(),
    getVehiclePopulationByYearAndFuelType(),
  ]);

  const month = deregistrations.at(-1)?.month;
  if (!month) {
    return null;
  }
  const yearEarlier = shiftMonth(month, -12);
  const earlierByCategory = new Map(
    deregistrations
      .filter((row) => row.month === yearEarlier)
      .map((row) => [row.category, row.number ?? 0]),
  );
  const rows = deregistrations
    .filter((row) => row.month === month && (row.number ?? 0) > 0)
    .map((row) => ({
      change: earlierByCategory.has(row.category)
        ? changeRatio(row.number ?? 0, earlierByCategory.get(row.category)) *
          100
        : null,
      count: row.number ?? 0,
      label: DEREGISTRATION_LABELS[row.category] ?? row.category,
    }))
    .sort((left, right) => right.count - left.count);
  const total = rows.reduce((sum, row) => sum + row.count, 0);
  const peak = rows[0]?.count ?? 1;

  const years = [...new Set(population.map((row) => row.year))].sort();
  const year = years.at(-1);
  const previousYear = years.at(-2);
  const totalIn = (target?: string) =>
    population
      .filter((row) => row.year === target)
      .reduce((sum, row) => sum + row.total, 0);
  const onRoad = totalIn(year);
  const previousOnRoad = totalIn(previousYear);
  const previousByFuel = new Map(
    population
      .filter((row) => row.year === previousYear)
      .map((row) => [row.fuelType, row.total]),
  );
  const fuel = population
    .filter((row) => row.year === year && row.total > 0)
    .map((row) => ({
      label: row.fuelType,
      previous: previousByFuel.get(row.fuelType) ?? 0,
      value: row.total,
    }))
    .sort((left, right) => right.value - left.value);
  const largestFuel = fuel[0];

  return (
    <section
      aria-labelledby="on-the-road-heading"
      className="@container flex scroll-mt-24 flex-col gap-6"
      id="on-the-road"
    >
      <SectionHead
        caption={roadCaption({
          deregistered: rows,
          month,
          population:
            year && largestFuel && onRoad > 0
              ? {
                  label: largestFuel.label,
                  share: (largestFuel.value / onRoad) * 100,
                  year,
                }
              : undefined,
        })}
        eyebrow="Figure 4 · Deregistrations and vehicle population"
        title={<span id="on-the-road-heading">Off the road and on it</span>}
      />
      <div className="grid @3xl:grid-cols-2 grid-cols-1 items-start gap-10 @3xl:gap-x-16">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-col gap-0.5">
            <Typography.Heading className="text-base" level={3}>
              Deregistered, {formatMonthLabel(month)}
            </Typography.Heading>
            <Typography.Paragraph
              className="tabular-nums"
              color="muted"
              size="sm"
            >
              {formatCount(total)} vehicles, all types · change on{" "}
              {formatMonthLabel(yearEarlier)}
            </Typography.Paragraph>
          </div>
          <ul className="flex flex-col">
            {rows.map((row, index) => (
              <li
                className="grid grid-cols-3 items-center gap-3 border-separator border-b py-2 text-sm"
                key={row.label}
              >
                <span className="truncate">{row.label}</span>
                <span aria-hidden className="block h-3">
                  <span
                    className={`block h-full rounded-r-xs ${index === 0 ? "bg-chart-1" : "bg-chart-3"}`}
                    style={{ width: `${(row.count / peak) * 100}%` }}
                  />
                </span>
                <span className="text-right text-muted-strong tabular-nums">
                  <span className="font-semibold text-foreground">
                    {formatCount(row.count)}
                  </span>
                  {row.change === null ? "" : ` · ${signed(row.change)}`}
                </span>
              </li>
            ))}
          </ul>
          <SectionLink className="ml-0 self-start" href="/cars/deregistrations">
            All deregistrations
          </SectionLink>
        </div>
        {year && fuel.length > 0 ? (
          <div className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-col gap-0.5">
              <Typography.Heading className="text-base" level={3}>
                On the road, end of {year}
              </Typography.Heading>
              <Typography.Paragraph
                className="tabular-nums"
                color="muted"
                size="sm"
              >
                {formatCount(onRoad)} vehicles
                {previousYear && previousOnRoad > 0
                  ? ` · ${signed(changeRatio(onRoad, previousOnRoad) * 100)} on ${previousYear}`
                  : ""}
              </Typography.Paragraph>
            </div>
            <FuelSplit
              entity={{ electric: [], fuel, name: "Vehicles", series: [] }}
              year={year}
            />
          </div>
        ) : null}
      </div>
      <SourceNote>
        Source: LTA via DataMall (deregistrations, all vehicle types, so not
        directly comparable with car registrations); LTA annual vehicle
        population.
      </SourceNote>
    </section>
  );
}
