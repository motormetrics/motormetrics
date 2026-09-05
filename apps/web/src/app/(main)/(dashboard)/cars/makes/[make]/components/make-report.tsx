import { Chip, Typography } from "@heroui/react";
import { formatDateToMonthYear, slugify } from "@motormetrics/utils";
import {
  FuelTypeTabs,
  PeriodTabs,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/filters";
import { MakeChart } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-chart";
import {
  loadSearchParams,
  RANGE_LABELS,
  type Range,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import {
  buildLogoMap,
  shiftMonth,
} from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { EmptyState } from "@web/components/shared/empty-state";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import {
  ReportFilterBar,
  ReportHeadline,
  ReportNote,
  ReportSection,
  ReportStat,
} from "@web/components/shared/report";
import {
  Count,
  DeltaText,
  ReportCell,
  ReportRow,
  ReportTable,
  ShareBar,
} from "@web/components/shared/report-table";
import {
  getMakeCrossTab,
  getMakeTotalsInRange,
  getMarketMonthlyTotals,
} from "@web/queries/cars/makes/period-totals";
import { getAllCarLogos } from "@web/queries/logos";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

/** How many makes the peer list shows, the current one always among them. */
const PEER_COUNT = 5;

/** Percentage change, guarding the division so an absent base reads as flat. */
function percentageChange(current: number, previous: number): number {
  if (!previous) {
    return 0;
  }

  return ((current - previous) / previous) * 100;
}

/** `2025-10` → `Oct`, or `Oct '24` once the window spans more than a year. */
function chartLabel(month: string, showYear: boolean): string {
  const [year, monthNumber] = month.split("-");
  const label = MONTH_LABELS[Number(monthNumber) - 1] ?? month;

  return showYear ? `${label} '${year.slice(2)}` : label;
}

/** The `YYYY-MM` window a period covers, anchored on the selected month. */
function periodWindow(
  month: string,
  range: Range,
): { end: string; start: string } {
  if (range === "month") {
    return { end: month, start: month };
  }

  if (range === "12m") {
    return { end: month, start: shiftMonth(month, -11) };
  }

  return { end: month, start: `${month.slice(0, 4)}-01` };
}

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
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const { end, start } = periodWindow(month, range);
  const previousStart = shiftMonth(start, -12);
  const previousEnd = shiftMonth(end, -12);

  // A single-month period still draws its trailing year: one column and one
  // table row say nothing about direction, which is what both are there for.
  const seriesStart = start === end ? shiftMonth(end, -11) : start;
  const seriesMonths = monthsBetween(seriesStart, end);

  const [crossTab, makeTotals, marketMonthly, logoResult] = await Promise.all([
    getMakeCrossTab(make),
    getMakeTotalsInRange(start, end),
    getMarketMonthlyTotals(seriesStart, end),
    getAllCarLogos(),
  ]);

  if (crossTab.length === 0) {
    return <EmptyState />;
  }

  const logoUrlBySlug = buildLogoMap(
    "logos" in logoResult ? logoResult.logos : [],
  );

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
  const mixLeader = mixRows[0]?.count ?? 0;

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
  const showYear = seriesMonths.length > 12;
  const shareLeader = Math.max(...series.map((entry) => entry.share), 0);

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

  const rangeLabel = RANGE_LABELS[range];
  const periodCaption =
    range === "month"
      ? formatDateToMonthYear(month)
      : `${formatDateToMonthYear(start)} – ${formatDateToMonthYear(end)}`;

  return (
    <>
      <ReportFilterBar
        label="Period"
        trailing={<FuelTypeTabs fuelTypes={fuelTypeOptions} />}
        trailingLabel="Fuel type"
      >
        <PeriodTabs />
      </ReportFilterBar>

      <ReportHeadline
        delta={<DeltaChip value={percentageChange(total, previousTotal)} />}
        label={`${fuelType ? `${fuelType} ` : ""}${make} registrations`}
        stats={
          <>
            <ReportStat
              label="Share of market"
              note={periodCaption}
              value={percentage(total, marketTotal)}
            />
            <ReportStat
              label="Rank"
              note={
                fuelType
                  ? "overall, all fuel types"
                  : `of ${makeTotals.length} makes`
              }
              value={rank > 0 ? `#${rank}` : "—"}
            />
            {topFuel ? (
              <ReportStat
                label={`${topFuel.name} share`}
                note={`of ${make} registrations`}
                value={percentage(topFuel.count, makeTotal)}
              />
            ) : null}
            {topVehicle ? (
              <ReportStat
                label={`${formatVehicleType(topVehicle.name)} share`}
                note="most common vehicle type"
                value={percentage(topVehicle.count, makeTotal)}
              />
            ) : null}
          </>
        }
        sub={
          fuelType
            ? `${rangeLabel} · ${percentage(total, makeTotal)} of ${make} registrations`
            : `${rangeLabel} · ${percentage(total, marketTotal)} of all registrations`
        }
        value={<Count value={total} />}
      />

      <MakeChart
        data={series.map(({ count, month: seriesMonth }) => ({
          label: chartLabel(seriesMonth, showYear),
          total: count,
        }))}
      />

      <ReportSection
        caption={`${periodCaption} · against the same months a year earlier`}
        title="Fuel type and vehicle type"
      >
        <ReportTable
          columns={[
            { label: "#", width: "60px" },
            { label: "Fuel type" },
            { label: "Vehicle type" },
            { align: "end", label: "Registrations" },
            { align: "end", label: "Share" },
            { label: "", width: "220px" },
            { align: "end", label: "Vs year earlier", width: "140px" },
          ]}
        >
          {mixRows.map(
            ({
              count,
              fuelType: rowFuelType,
              previous,
              rank: rowRank,
              vehicleType,
            }) => (
              <ReportRow key={`${rowFuelType}|${vehicleType}`}>
                <ReportCell className="font-bold text-muted text-sm">
                  {String(rowRank).padStart(2, "0")}
                </ReportCell>
                <ReportCell>
                  <Chip className="whitespace-nowrap rounded-full bg-surface-secondary px-3 py-1.5 font-bold text-muted-strong text-sm">
                    <Chip.Label className="px-0">{rowFuelType}</Chip.Label>
                  </Chip>
                </ReportCell>
                <ReportCell className="font-bold text-base">
                  {formatVehicleType(vehicleType)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  <Count value={count} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  {percentage(count, total)}
                </ReportCell>
                <ReportCell>
                  <ShareBar
                    isLeader={rowRank === 1}
                    share={(count / (mixLeader || 1)) * 100}
                  />
                </ReportCell>
                <ReportCell align="end">
                  <DeltaText value={percentageChange(count, previous)} />
                </ReportCell>
              </ReportRow>
            ),
          )}
        </ReportTable>
      </ReportSection>

      <ReportSection
        caption={`${make} against the whole market`}
        title="Month by month"
      >
        <ReportTable
          columns={[
            { label: "Month" },
            { align: "end", label: make },
            { align: "end", label: "All cars" },
            { align: "end", label: "Share" },
            { label: "", width: "280px" },
            { align: "end", label: "Vs last month", width: "140px" },
          ]}
        >
          {series
            .map((entry, index) => ({
              ...entry,
              previous: index > 0 ? series[index - 1].count : null,
            }))
            .reverse()
            .map(({ count, market, month: seriesMonth, previous, share }) => (
              <ReportRow isActive={seriesMonth === month} key={seriesMonth}>
                <ReportCell className="font-bold text-base">
                  {formatDateToMonthYear(seriesMonth)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-lg">
                  <Count value={count} />
                </ReportCell>
                <ReportCell align="end" className="font-semibold text-muted">
                  <Count value={market} />
                </ReportCell>
                <ReportCell
                  align="end"
                  className="font-bold text-accent-strong"
                >
                  {share.toFixed(1)}%
                </ReportCell>
                <ReportCell>
                  <ShareBar share={(share / (shareLeader || 1)) * 100} />
                </ReportCell>
                <ReportCell align="end">
                  {previous === null ? (
                    <span className="font-bold text-muted">—</span>
                  ) : (
                    <DeltaText value={percentageChange(count, previous)} />
                  )}
                </ReportCell>
              </ReportRow>
            ))}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <div className="flex flex-col gap-10">
          <ReportSection caption={periodCaption} title="Against other makes">
            <div className="flex flex-col">
              {peers.map(({ count, make: peerMake }) => {
                const isCurrent = peerMake === make;
                const slug = slugify(peerMake);
                return (
                  <div
                    className="flex items-center gap-5 border-border border-b py-3.5"
                    key={peerMake}
                  >
                    <MakeAvatar
                      logoUrl={logoUrlBySlug[slug] ?? null}
                      make={peerMake}
                      size={30}
                    />
                    <Link
                      className={
                        isCurrent
                          ? "w-[10.625rem] shrink-0 font-extrabold text-accent-strong"
                          : "w-[10.625rem] shrink-0 font-semibold hover:text-accent-strong"
                      }
                      href={`/cars/makes/${slug}`}
                    >
                      {peerMake}
                    </Link>
                    <div className="flex-1">
                      <ShareBar
                        isLeader={isCurrent}
                        share={(count / (peerLeader || 1)) * 100}
                      />
                    </div>
                    <span className="w-[4.5rem] text-right font-extrabold tabular-nums">
                      <Count value={count} />
                    </span>
                  </div>
                );
              })}
            </div>
          </ReportSection>

          <ReportSection
            caption={`share of every ${make} registered`}
            title="Fuel type mix"
          >
            <div className="flex flex-col">
              {fuelTotals.map(({ count, name }) => {
                const leading = tally(
                  windowRows.filter((row) => row.fuelType === name),
                  (row) => row.vehicleType,
                  (row) => row.count,
                )
                  .slice(0, 2)
                  .map(({ name: vehicleType }) =>
                    formatVehicleType(vehicleType),
                  );

                return (
                  <div
                    className="flex flex-wrap items-baseline gap-5 border-border border-b py-3.5"
                    key={name}
                  >
                    <span className="w-[8.125rem] shrink-0 font-bold">
                      {name}
                    </span>
                    <Typography.Paragraph color="muted" size="sm">
                      {leading.length > 1
                        ? `${leading.join(" and ")} carry the volume`
                        : `all of it ${leading[0]}`}
                    </Typography.Paragraph>
                    <span className="ml-auto font-extrabold tabular-nums">
                      {percentage(count, makeTotal)}
                    </span>
                  </div>
                );
              })}
            </div>
          </ReportSection>
        </div>

        <ReportNote title="Reading a make page">
          <Typography.Paragraph>
            Registrations are counted by make as recorded at registration, so
            rebadged and parallel-imported cars appear under the same name as
            authorised-dealer stock.
          </Typography.Paragraph>
          <Typography.Paragraph>
            LTA reports registrations by make, fuel type and vehicle type — not
            by model, so there are no model-level figures anywhere on the site.
          </Typography.Paragraph>
          <Link className="font-bold text-accent-strong" href="/cars/makes">
            All makes →
          </Link>
          <Link
            className="font-bold text-accent-strong"
            href="/cars/fuel-types"
          >
            Fuel types →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
