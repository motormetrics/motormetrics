import { Table, Typography } from "@heroui/react";
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
import { LegendItem } from "@web/components/shared/legend-item";
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
 * The fuel types the monthly chart stacks, bottom first, keyed by LTA's own names.
 * Diesel and the rarer fuels are a handful of cars a month and are left out.
 */
const FUEL_SERIES: (FuelMixSeries & { name: string; swatch: string })[] = [
  {
    color: "var(--chart-1)",
    key: "electric",
    swatch: "bg-chart-1",
    label: "Electric",
    name: "Electric",
  },
  {
    color: "var(--chart-3)",
    key: "hybrid",
    swatch: "bg-chart-3",
    label: "Petrol-Electric",
    name: "Petrol-Electric",
  },
  {
    color: "var(--chart-4)",
    key: "plugIn",
    swatch: "bg-chart-4",
    label: "Petrol-Electric (Plug-In)",
    name: "Petrol-Electric (Plug-In)",
  },
  {
    color: "var(--chart-2)",
    key: "petrol",
    swatch: "bg-chart-2",
    label: "Petrol",
    name: "Petrol",
  },
];

/** Shorter names for LTA's deregistration categories. */
const DEREGISTRATION_LABELS: Record<string, string> = {
  "Vehicles Exempted From VQS": "Exempt from VQS",
};

/** The muted period that follows a section title. */
const PERIOD = "font-normal text-muted";

const formatCount = (value: number) => value.toLocaleString("en-SG");

/** New cars by month over the last year, stacked by fuel type. */
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
        link={{ href: "/cars", label: "New registrations" }}
        title={
          <span id="fuel-types-heading">
            New cars by month{" "}
            <span className={PERIOD}>
              {formatMonthLabel(months[0].month)} to{" "}
              {formatMonthLabel(months[months.length - 1].month)}, by fuel type
            </span>
          </span>
        }
      />
      <ul className="flex flex-wrap gap-x-4 gap-y-2">
        {FUEL_SERIES.map(({ key, label, swatch }) => (
          <li key={key}>
            <LegendItem className={swatch} label={label} />
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

/**
 * The ten largest makes this year as ranked rows: registrations, a bar
 * against the leader and the change on last year. Each make opens its page.
 */
export async function TopMakesFigure() {
  const { latestMonth, rows } = await loadMakeRows("ytd", null);
  if (!latestMonth || rows.length === 0) {
    return null;
  }

  const period = periodLabel(latestMonth, "ytd");
  const lastYear = Number(latestMonth.slice(0, 4)) - 1;
  const leaders = rows.slice(0, TOP_MAKES);
  const peak = Math.max(...leaders.map((row) => row.count), 1);

  return (
    <section
      aria-labelledby="top-makes-heading"
      className="flex scroll-mt-24 flex-col gap-6"
      id="top-makes"
    >
      <SectionHead
        caption={makesCaption(rows, period)}
        link={{ href: "/cars/makes", label: `All ${rows.length} makes` }}
        title={
          <span id="top-makes-heading">
            Leading makes <span className={PERIOD}>{period}</span>
          </span>
        }
      />
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`Leading makes, ${period}`}
            className="tabular-nums"
          >
            <Table.Header>
              <Table.Column isRowHeader>Make</Table.Column>
              <Table.Column className="w-1/2 max-md:hidden">
                <span className="sr-only">Against the leading make</span>
              </Table.Column>
              <Table.Column className="text-right">Cars</Table.Column>
              <Table.Column className="text-right">On {lastYear}</Table.Column>
            </Table.Header>
            <Table.Body>
              {leaders.map((row) => (
                <Table.Row id={row.slug} key={row.slug}>
                  <Table.Cell>
                    <Link
                      className="flex min-w-0 items-center gap-2 font-semibold text-foreground no-underline hover:underline"
                      href={`/cars/makes/${row.slug}`}
                    >
                      <MakeAvatar
                        logoUrl={row.logoUrl}
                        make={row.make}
                        size="sm"
                      />
                      {row.make}
                    </Link>
                  </Table.Cell>
                  <Table.Cell className="w-1/2 max-md:hidden">
                    <span aria-hidden className="block h-2">
                      <span
                        className="block h-full rounded-r-xs bg-chart-1"
                        style={{ width: `${(row.count / peak) * 100}%` }}
                      />
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right font-semibold">
                    {formatCount(row.count)}
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {changeLabel(row, "ytd", latestMonth).replace(
                      ` on ${lastYear}`,
                      "",
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>
      <SourceNote>
        Source: LTA via DataMall · New car registrations, {period}; change
        against the same months of {lastYear}. Bars are drawn against the
        leading make.
      </SourceNote>
    </section>
  );
}

/**
 * What left the road last month, by category, beside the fuel
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
        title={<span id="on-the-road-heading">Off the road and on it</span>}
      />
      <div className="grid @3xl:grid-cols-2 grid-cols-1 items-start gap-8 @3xl:gap-x-16">
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex flex-col gap-1">
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
                className="grid grid-cols-3 items-center gap-4 py-2 text-sm"
                key={row.label}
              >
                <span className="truncate">{row.label}</span>
                <span aria-hidden className="block h-3">
                  <span
                    className={`block h-full rounded-r-xs ${index === 0 ? "bg-chart-1" : "bg-chart-3"}`}
                    style={{ width: `${(row.count / peak) * 100}%` }}
                  />
                </span>
                <span className="text-right text-foreground tabular-nums">
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
          <div className="flex min-w-0 flex-col gap-4">
            <div className="flex flex-col gap-1">
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
