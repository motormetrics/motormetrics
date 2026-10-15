import { cn, Typography } from "@heroui/react";
import { buttonVariants } from "@heroui/styles";
import { EmptyState, NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import {
  FuelTypeTabs,
  PeriodTabs,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/filters";
import { GoBackButton } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/go-back-button";
import { MixTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-table";
import {
  periodLabel,
  periodWindow,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { summariseMake } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/summary";
import {
  loadSearchParams,
  RANGE_LABELS,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getCarLogoMap } from "@web/queries/logos";
import { percentageChange } from "@web/utils/change-ratio";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { FileQuestion, Home } from "lucide-react";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** How many makes the peer list shows, the current one always among them. */
const PEER_COUNT = 5;

function monthsBetween(start: string, end: string): string[] {
  const months: string[] = [];
  for (let month = start; month <= end; month = shiftMonth(month, 1)) {
    months.push(month);
  }

  return months;
}

function sumBy<T>(rows: T[], value: (row: T) => number): number {
  return rows.reduce((total, row) => total + value(row), 0);
}

/** Total by key, highest first — the shape every breakdown on this page wants. */
function tally<T>(
  rows: T[],
  key: (row: T) => string,
  value: (row: T) => number,
): { count: number; name: string }[] {
  const totals = new Map<string, number>();
  for (const row of rows) {
    const name = key(row);
    totals.set(name, (totals.get(name) ?? 0) + value(row));
  }

  return [...totals]
    .map(([name, count]) => ({ count, name }))
    .sort((a, b) => b.count - a.count);
}

function percentage(part: number, whole: number): string {
  return `${((part / (whole || 1)) * 100).toFixed(1)}%`;
}

export async function MakeReport({
  make,
  searchParams,
}: {
  make: string;
  searchParams: Promise<SearchParams>;
}) {
  const {
    fuelType,
    month: parsedMonth,
    range,
  } = await loadSearchParams(searchParams);
  const [{ month }, crossTab, logoUrlBySlug] = await Promise.all([
    getMonthOrLatest(parsedMonth, "cars"),
    getMakeCrossTab(make),
    getCarLogoMap(),
  ]);

  const { end, start } = periodWindow(month, range);
  const previousStart = shiftMonth(start, -12);
  const previousEnd = shiftMonth(end, -12);

  // A single-month period still draws its trailing year: one column and one
  // table row say nothing about direction, which is what both are there for.
  const seriesStart = start === end ? shiftMonth(end, -11) : start;
  const seriesMonths = monthsBetween(seriesStart, end);

  const [makeTotals, marketMonthly] = await Promise.all([
    getMakeTotalsInRange(start, end),
    getMarketMonthlyTotals(seriesStart, end),
  ]);

  if (crossTab.length === 0) {
    return (
      <EmptyState className="rounded-3xl bg-default/50" size="lg">
        <EmptyState.Header>
          <EmptyState.Media variant="icon">
            <FileQuestion />
          </EmptyState.Media>
          <EmptyState.Title>No Data Available</EmptyState.Title>
          <EmptyState.Description className="max-w-sm">
            The requested data could not be found. Please try a different
            selection.
          </EmptyState.Description>
        </EmptyState.Header>
        <EmptyState.Content className="flex-row gap-4">
          <Link className={buttonVariants({ variant: "outline" })} href="/">
            <Home className="size-4" />
            Go Home
          </Link>
          <GoBackButton />
        </EmptyState.Content>
      </EmptyState>
    );
  }

  const matchesFuel = (row: { fuelType: string }) =>
    !fuelType || row.fuelType === fuelType;
  const inWindow = (row: { month: string }) =>
    row.month >= start && row.month <= end;

  /** The window, every fuel type — what the mix cells and share cells divide by. */
  const windowRows = crossTab.filter(inWindow);
  const selectedRows = windowRows.filter(matchesFuel);
  const previousRows = crossTab.filter(
    (row) =>
      row.month >= previousStart &&
      row.month <= previousEnd &&
      matchesFuel(row),
  );

  const total = sumBy(selectedRows, (row) => row.count);
  const previousTotal = sumBy(previousRows, (row) => row.count);
  const makeTotal = sumBy(windowRows, (row) => row.count);

  const fuelTotals = tally(
    windowRows,
    (row) => row.fuelType,
    (row) => row.count,
  );
  const vehicleTotals = tally(
    windowRows,
    (row) => row.vehicleType,
    (row) => row.count,
  );
  const topFuel = fuelTotals[0];
  const topVehicle = vehicleTotals[0];

  // Only the fuel types this make actually registers in the period are offered,
  // plus whichever one is selected, so a filter can always be undone.
  const fuelTypeOptions = fuelTotals.map(({ name }) => name);
  if (fuelType && !fuelTypeOptions.includes(fuelType)) {
    fuelTypeOptions.push(fuelType);
  }

  // The mix table: one row per fuel type × vehicle type cell, read against the
  // same window a year earlier.
  const previousByCell = new Map<string, number>();
  for (const row of previousRows) {
    const key = `${row.fuelType}|${row.vehicleType}`;
    previousByCell.set(key, (previousByCell.get(key) ?? 0) + row.count);
  }
  const mixRows = tally(
    selectedRows,
    (row) => `${row.fuelType}|${row.vehicleType}`,
    (row) => row.count,
  ).map(({ count, name }, index) => {
    const [rowFuelType, vehicleType] = name.split("|");
    return {
      count,
      fuelType: rowFuelType,
      previous: previousByCell.get(name) ?? 0,
      rank: index + 1,
      vehicleType,
    };
  });

  const makeByMonth = new Map<string, number>();
  for (const row of crossTab) {
    if (matchesFuel(row)) {
      makeByMonth.set(row.month, (makeByMonth.get(row.month) ?? 0) + row.count);
    }
  }
  const marketByMonth = new Map(
    marketMonthly.map(({ month: seriesMonth, total: marketTotal }) => [
      seriesMonth,
      marketTotal,
    ]),
  );
  const series = seriesMonths.map((seriesMonth) => {
    const count = makeByMonth.get(seriesMonth) ?? 0;
    const market = marketByMonth.get(seriesMonth) ?? 0;
    return {
      count,
      market,
      month: seriesMonth,
      share: (count / (market || 1)) * 100,
    };
  });

  const marketTotal = sumBy(
    monthsBetween(start, end),
    (windowMonth) => marketByMonth.get(windowMonth) ?? 0,
  );

  const rank = makeTotals.findIndex((entry) => entry.make === make) + 1;
  const peers = makeTotals.slice(0, PEER_COUNT);
  if (rank > PEER_COUNT) {
    peers.splice(PEER_COUNT - 1, 1, makeTotals[rank - 1]);
  }
  const peerLeader = peers[0]?.count ?? 0;

  // The summary line reads the selected month across every fuel type, whatever
  // the switch is set to; the rank is the year to date's, so only on that range.
  const countWhere = (match: (row: { month: string }) => boolean) =>
    sumBy(crossTab.filter(match), (row) => row.count);
  const summary = summariseMake({
    count: countWhere((row) => row.month === month),
    make,
    marketCount: marketByMonth.get(month) ?? 0,
    month,
    previousCount: countWhere((row) => row.month === shiftMonth(month, -1)),
    rank: range === "ytd" && rank > 0 ? rank : undefined,
    yearToDate: countWhere(
      (row) => row.month >= `${month.slice(0, 4)}-01` && row.month <= month,
    ),
  });

  const rangeLabel = RANGE_LABELS[range];
  const periodCaption =
    range === "month"
      ? formatDateToMonthYear(month)
      : `${formatDateToMonthYear(start)} – ${formatDateToMonthYear(end)}`;

  // Every fuel type the make registered in the period, whatever the switch
  // is set to, each with the two vehicle types that carry its volume.
  const fuelMix = fuelTotals.map(({ count, name }, index) => {
    const leading = tally(
      windowRows.filter((row) => row.fuelType === name),
      (row) => row.vehicleType,
      (row) => row.count,
    )
      .slice(0, 2)
      .map(({ name: vehicleType }) => formatVehicleType(vehicleType));

    return {
      color: `var(--chart-${(index % 6) + 1})`,
      count,
      name,
      note:
        leading.length > 1
          ? `${leading.join(" and ")} carry the volume`
          : `All of it ${leading[0]}`,
    };
  });

  // The comp's two-by-two grid beside the headline; the mix cells drop out
  // when the make registered nothing in the period.
  const stats = [
    {
      label: "Share of market",
      note: periodCaption,
      value: percentage(total, marketTotal),
    },
    {
      label: "Rank",
      note: fuelType
        ? "overall, all fuel types"
        : `of ${makeTotals.length} makes`,
      value: rank > 0 ? `#${rank}` : "—",
    },
    ...(topFuel
      ? [
          {
            label: `${topFuel.name} share`,
            note: `of ${make} registrations`,
            value: percentage(topFuel.count, makeTotal),
          },
        ]
      : []),
    ...(topVehicle
      ? [
          {
            label: `${formatVehicleType(topVehicle.name)} share`,
            note: "most common vehicle type",
            value: percentage(topVehicle.count, makeTotal),
          },
        ]
      : []),
  ];
  // The chart runs over the year to date, or the trailing year when the
  // period is a single month.
  const seriesRange = range === "ytd" && start !== end ? "ytd" : "12m";

  return (
    <>
      {/* The comp rules the switches off from the head, each under its own
          label; on phones they stack. */}
      <div className="flex flex-col gap-3.5 border-border border-y py-3.5 md:flex-row md:flex-wrap md:items-end md:gap-6">
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold text-muted text-xs">Period</span>
          <PeriodTabs />
        </div>
        <div className="flex min-w-0 flex-col gap-1.5">
          <span className="font-semibold text-muted text-xs">Fuel type</span>
          <FuelTypeTabs fuelTypes={fuelTypeOptions} />
        </div>
      </div>

      <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
        <div className="flex min-w-0 flex-col gap-3">
          <span className="font-semibold text-muted text-xs">
            {fuelType ? `${fuelType} ` : ""}
            {make} registrations
          </span>
          <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
            <NumberValue
              locale="en-SG"
              maximumFractionDigits={0}
              value={total}
            />
          </span>
          <Typography.Paragraph color="muted">
            <DeltaChip
              className="font-semibold text-foreground"
              value={percentageChange(total, previousTotal)}
            />{" "}
            against the same period a year earlier
          </Typography.Paragraph>
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {fuelType
              ? `${rangeLabel} · ${percentage(total, makeTotal)} of ${make} registrations`
              : `${rangeLabel} · ${percentage(total, marketTotal)} of all registrations`}
          </Typography.Paragraph>
        </div>
        <div className="grid grid-cols-2 border-border border-t">
          {stats.map((stat) => (
            <div
              className="flex min-w-0 flex-col gap-1 border-separator border-b py-3.5 pr-4 even:border-l even:pl-4"
              key={stat.label}
            >
              <span className="truncate font-semibold text-muted text-xs">
                {stat.label}
              </span>
              <span className="font-semibold text-xl tabular-nums tracking-tight md:text-2xl">
                {stat.value}
              </span>
              <span className="truncate text-muted text-xs">{stat.note}</span>
            </div>
          ))}
        </div>
      </div>

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${periodLabel(month, seriesRange)} · hover or tap a bar for its value`}
          eyebrow="Trend"
          title={`${make}${fuelType ? ` ${fuelType}` : ""} registrations by month`}
        />
        <TwoShadeTrendChart
          data={series.map(({ count, month: seriesMonth }, index) => {
            const isSelected = seriesMonth === month;
            return {
              count,
              earlier: isSelected ? 0 : count,
              label: formatChartMonth(seriesMonth),
              latest: isSelected ? count : 0,
              title: formatMonthLabel(seriesMonth),
              year:
                index === 0 || seriesMonth.endsWith("-01")
                  ? seriesMonth.slice(0, 4)
                  : "",
            };
          })}
          height={220}
          maxBarSize={40}
          thinTicks
          ticks={axisTicks(
            series.map(({ count }) => count),
            { zero: true },
          )}
          tooltipLabel="Registrations"
        />
        <SourceNote>
          New car registrations, {make}
          {fuelType ? `, ${fuelType} only.` : ", all fuel types."}
        </SourceNote>
        {summary ? (
          <Typography.Paragraph
            className="tabular-nums"
            color="muted"
            size="sm"
          >
            {summary}
          </Typography.Paragraph>
        ) : null}
      </section>

      <Hairline />

      <section className="flex min-w-0 flex-col gap-4">
        <SectionHead
          caption={`${periodCaption} · against the same months a year earlier`}
          eyebrow="Breakdown"
          title="Fuel type and vehicle type"
        />
        <MixTable
          rows={mixRows.map(
            ({
              count,
              fuelType: rowFuelType,
              previous,
              rank,
              vehicleType,
            }) => ({
              change: percentageChange(count, previous),
              count,
              fuelType: rowFuelType,
              rank,
              vehicleType: formatVehicleType(vehicleType),
            }),
          )}
          total={total}
        />
        <SourceNote>
          Share is of {total.toLocaleString("en-SG")}{" "}
          {fuelType ? `${fuelType} ` : ""}
          {make} registrations in the period. Change compares against the same
          months a year earlier.
        </SourceNote>
      </section>

      <Hairline />

      <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-11 lg:gap-14">
        <section className="flex min-w-0 flex-col gap-4 lg:col-span-6">
          <SectionHead
            caption={`${periodLabel(month, seriesRange)}, newest first`}
            eyebrow="Month by month"
            title={`${make} against the whole market`}
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-2 border-border border-b pb-2 font-semibold text-muted text-xs md:gap-3">
              <span className="min-w-0 flex-1">Month</span>
              <span className="w-12 truncate text-right md:w-16">{make}</span>
              <span className="w-12 text-right md:w-16">
                <span className="max-md:hidden">All cars</span>
                <span className="md:hidden">All</span>
              </span>
              <span className="w-12 text-right md:w-16">Share</span>
              <span className="w-14 text-right md:w-24">
                <span className="max-md:hidden">vs last month</span>
                <span className="md:hidden">vs prev</span>
              </span>
            </div>
            {series
              .map((entry, index) => ({
                ...entry,
                previous: index > 0 ? series[index - 1].count : null,
              }))
              .reverse()
              .map(({ count, market, month: seriesMonth, previous, share }) => (
                <div
                  className={cn(
                    "flex items-center gap-2 border-separator border-b py-2 text-sm tabular-nums md:gap-3",
                    seriesMonth === month && "bg-surface-secondary",
                  )}
                  key={seriesMonth}
                >
                  <span className="min-w-0 flex-1 truncate font-medium">
                    {formatDateToMonthYear(seriesMonth)}
                  </span>
                  <span className="w-12 text-right font-semibold md:w-16">
                    <NumberValue
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={count}
                    />
                  </span>
                  <span className="w-12 text-right text-muted md:w-16">
                    <NumberValue
                      locale="en-SG"
                      maximumFractionDigits={0}
                      value={market}
                    />
                  </span>
                  <span className="w-12 text-right text-muted md:w-16">
                    {share.toFixed(1)}%
                  </span>
                  {previous === null ? (
                    <span className="w-14 text-right text-muted md:w-24">
                      —
                    </span>
                  ) : (
                    <DeltaChip
                      className="w-14 text-right md:w-24"
                      value={percentageChange(count, previous)}
                    />
                  )}
                </div>
              ))}
          </div>
          <SourceNote>
            Share is {make}
            {fuelType ? ` ${fuelType}` : ""} registrations as a share of all new
            cars that month.
          </SourceNote>
        </section>

        <div className="flex min-w-0 flex-col gap-10 lg:col-span-5">
          <section className="flex min-w-0 flex-col gap-4">
            <SectionHead
              caption={`${periodCaption} · all fuel types`}
              eyebrow="Peers"
              link={{ href: "/cars/makes", label: "All makes" }}
              title="Against other makes"
            />
            <div className="flex flex-col">
              {peers.map(({ count, make: peerMake }) => {
                const isCurrent = peerMake === make;
                const slug = slugify(peerMake);
                return (
                  <div
                    className="flex items-center gap-3 border-separator border-b py-2"
                    key={peerMake}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5 md:w-36 md:flex-none">
                      <MakeAvatar
                        logoUrl={logoUrlBySlug[slug] ?? null}
                        make={peerMake}
                        size="sm"
                      />
                      <Link
                        className={cn(
                          "truncate text-sm no-underline",
                          isCurrent
                            ? "font-semibold text-accent-strong"
                            : "font-medium text-foreground hover:text-accent-strong",
                        )}
                        href={`/cars/makes/${slug}`}
                      >
                        {peerMake}
                      </Link>
                    </span>
                    <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                      <span
                        className="block h-full rounded-r-xs"
                        style={{
                          background: isCurrent
                            ? "var(--chart-1)"
                            : "var(--chart-5)",
                          width: `${((count / (peerLeader || 1)) * 100).toFixed(1)}%`,
                        }}
                      />
                    </span>
                    <span className="w-16 text-right font-semibold text-sm tabular-nums">
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={count}
                      />
                    </span>
                  </div>
                );
              })}
            </div>
            <SourceNote>
              The largest makes by registrations in the period, always including{" "}
              {make}.
            </SourceNote>
          </section>

          <section className="flex min-w-0 flex-col gap-4">
            <SectionHead
              caption={`Share of every ${make} registered · ${periodCaption}`}
              eyebrow="Mix"
              title="Fuel type mix"
            />
            <div
              aria-label={`Share of ${make} registrations by fuel type`}
              className="flex h-4 gap-0.5"
              role="img"
            >
              {fuelMix.map(({ color, count, name }) => (
                <span
                  className="block h-full"
                  key={name}
                  style={{
                    background: color,
                    width: `${((count / (makeTotal || 1)) * 100).toFixed(2)}%`,
                  }}
                />
              ))}
            </div>
            <ul className="flex flex-col">
              {fuelMix.map(({ color, count, name, note }) => (
                <li
                  className="flex items-center gap-2.5 border-separator border-b py-2"
                  key={name}
                >
                  <span
                    aria-hidden
                    className="size-3 shrink-0 rounded-xs"
                    style={{ background: color }}
                  />
                  <span className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate text-sm">{name}</span>
                    <span className="truncate text-muted text-xs">{note}</span>
                  </span>
                  <span className="font-semibold text-sm tabular-nums">
                    {percentage(count, makeTotal)}
                  </span>
                </li>
              ))}
            </ul>
            <SourceNote>
              All fuel types, whatever the fuel type switch is set to.
            </SourceNote>
          </section>
        </div>
      </div>
    </>
  );
}
