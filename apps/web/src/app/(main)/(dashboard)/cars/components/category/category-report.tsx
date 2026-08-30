import { Typography } from "@heroui/react";
import { formatDateToMonthYear, slugify } from "@motormetrics/utils";
import {
  MeasureTabs,
  PeriodTabs,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-filters";
import {
  type CategorySeries,
  CategoryShareChart,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-share-chart";
import { DeltaChip } from "@web/components/shared/delta-chip";
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
  type CategoryMonthlyPoint,
  getCategoryMonthlySeries,
  getCategoryTotals,
  getElectricShareByVehicleType,
  getTopMakesByCategory,
} from "@web/queries/cars/category-report";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { format, subMonths } from "date-fns";
import Link from "next/link";
import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type SearchParams,
} from "nuqs/server";

/**
 * The parsers live here rather than in a folder-level `search-params.ts` —
 * extracting one for this folder is deliberately deferred. `category-filters.tsx`
 * restates them for the client side.
 */
const loadCategorySearchParams = createLoader({
  measure: parseAsStringLiteral(["share", "volume"] as const).withDefault(
    "share",
  ),
  month: parseAsString,
  period: parseAsStringLiteral(["month", "ytd"] as const).withDefault("month"),
});

export interface CategoryConfig {
  /** Which `cars` column the page reports on. */
  apiDataField: "fuelType" | "vehicleType";
  /**
   * Per-value prose for the table's description column, keyed by the value
   * exactly as LTA records it. Authored copy, not data.
   */
  descriptions: Record<string, string>;
  /** Meta description, with `{month}` substituted at render time. */
  description: string;
  /**
   * Lede under the page title. Taken from the comp, minus its trailing claim
   * about which way share is moving — that reads as fact on the page but would
   * go stale silently, and nothing recomputes it.
   */
  lede: string;
  /** Sidebar notes explaining how LTA classifies this dimension. */
  notes: string[];
  /** Further reading beneath the notes. */
  relatedLinks: { href: string; label: string }[];
  /**
   * The dimension named in running text — "fuel type", "vehicle type". Section
   * headings and column labels are built from it.
   */
  singularLabel: string;
  title: string;
  urlPath: string;
}

/** How far back the trend chart reaches from the selected month. */
const SERIES_MONTHS = 12;

/** How many types the chart plots and the month-by-month table columns. */
const CHARTED_TYPES = 6;

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

/** `2025-10` → `Oct`. The window never spans more than a year. */
function chartLabel(month: string): string {
  const monthNumber = Number(month.slice(5, 7));

  return MONTH_LABELS[monthNumber - 1] ?? month;
}

/** The `SERIES_MONTHS` months ending at `month`, oldest first. */
function trailingMonths(month: string): string[] {
  const anchor = new Date(`${month}-01T00:00:00Z`);

  return Array.from({ length: SERIES_MONTHS }, (_, index) =>
    format(subMonths(anchor, SERIES_MONTHS - 1 - index), "yyyy-MM"),
  );
}

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
  return months.map(
    (month) => `${Number(month.slice(0, 4)) - 1}-${month.slice(5, 7)}`,
  );
}

function percentageOf(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

function sumCounts(rows: { count: number }[]): number {
  return rows.reduce((total, { count }) => total + count, 0);
}

export async function CategoryReport({
  config,
  searchParams,
}: {
  config: CategoryConfig;
  searchParams: Promise<SearchParams>;
}) {
  const {
    measure,
    month: parsedMonth,
    period,
  } = await loadCategorySearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "cars");

  const year = Number(month.slice(0, 4));
  const periodMonths = period === "ytd" ? yearToDateMonths(month) : [month];
  const priorMonths = shiftedBackAYear(periodMonths);
  const seriesMonths = trailingMonths(month);

  const [totals, priorTotals, series, leaders, electricShares] =
    await Promise.all([
      getCategoryTotals(config.apiDataField, periodMonths),
      getCategoryTotals(config.apiDataField, priorMonths),
      getCategoryMonthlySeries(config.apiDataField, seriesMonths),
      getTopMakesByCategory(config.apiDataField, periodMonths),
      config.apiDataField === "vehicleType"
        ? getElectricShareByVehicleType(periodMonths)
        : Promise.resolve([]),
    ]);

  const formattedMonth = formatDateToMonthYear(month);
  const periodLabel =
    period === "ytd" ? `${year} year to date` : formattedMonth;

  const displayName = (name: string) =>
    config.apiDataField === "vehicleType" ? formatVehicleType(name) : name;

  const rows = totals.filter(({ count }) => count > 0);

  if (rows.length === 0) {
    return (
      <Typography.Paragraph>
        No {config.title.toLowerCase()} data available for {periodLabel}
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

  const leader = rows[0];
  const leaderShare = percentageOf(leader.count, total);
  const leaderPriorShare = percentageOf(
    priorByName.get(leader.name) ?? 0,
    priorTotal,
  );

  // The chart and the month-by-month table plot the same leading types, so a
  // colour means the same thing in both. Rows past the sixth reuse the ramp —
  // they are not plotted, so nothing is mistaken for a charted line.
  const chartedTypes = rows.slice(0, CHARTED_TYPES);
  const chartSeries: CategorySeries[] = chartedTypes.map(({ name }, index) => ({
    color: `var(--chart-${index + 1})`,
    key: `type${index}`,
    label: displayName(name),
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
    label: chartLabel(seriesMonth),
    ...Object.fromEntries(
      cells.map(({ count, share }, index) => [
        `type${index}`,
        measure === "share" ? Number(share.toFixed(1)) : count,
      ]),
    ),
  }));

  return (
    <>
      <ReportFilterBar
        label="Period"
        trailing={<MeasureTabs />}
        trailingLabel="Measure"
      >
        <PeriodTabs />
      </ReportFilterBar>

      <ReportHeadline
        delta={<DeltaChip unit="pp" value={leaderShare - leaderPriorShare} />}
        label={`${displayName(leader.name)} share of registrations`}
        stats={rows
          .slice(0, 4)
          .map(({ count, name }) => (
            <ReportStat
              key={name}
              label={displayName(name)}
              note={`${count.toLocaleString("en-SG")} cars`}
              value={`${percentageOf(count, total).toFixed(1)}%`}
            />
          ))}
        sub={`${leader.count.toLocaleString("en-SG")} of ${total.toLocaleString("en-SG")} cars · ${periodLabel} · change against ${year - 1}`}
        value={`${leaderShare.toFixed(1)}%`}
      />

      <CategoryShareChart
        data={chartData}
        measure={measure}
        series={chartSeries}
      />

      <ReportSection
        caption={`${periodLabel} · ${rows.length} recorded by LTA`}
        title={`All ${config.title.toLowerCase()}`}
      >
        <ReportTable
          columns={[
            { label: config.singularLabel },
            { label: "Description" },
            {
              align: "end",
              label: period === "ytd" ? "Year to date" : "Registrations",
            },
            { align: "end", label: "Share" },
            { label: "", width: "200px" },
            ...(config.apiDataField === "vehicleType"
              ? [{ align: "end" as const, label: "Electric" }]
              : []),
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
                        backgroundColor: `var(--chart-${(index % CHARTED_TYPES) + 1})`,
                      }}
                    />
                    <Link
                      className="text-foreground hover:text-accent-strong"
                      href={`${config.urlPath}/${slugify(name)}`}
                    >
                      {displayName(name)}
                    </Link>
                  </span>
                </ReportCell>
                <ReportCell className="font-medium text-muted-strong text-sm">
                  {config.descriptions[name] ?? "—"}
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
                {config.apiDataField === "vehicleType" ? (
                  <ReportCell align="end" className="font-semibold text-muted">
                    {electricShare === undefined
                      ? "—"
                      : `${electricShare.toFixed(1)}%`}
                  </ReportCell>
                ) : null}
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
              label: displayName(name),
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
          title={`Leading makes by ${config.singularLabel.toLowerCase()}`}
        >
          <div className="flex flex-col">
            {leaders.map(({ makes, name, total: typeTotal }) => (
              <div
                className="flex flex-wrap items-baseline gap-5 border-border border-b py-4"
                key={name}
              >
                <span className="w-[150px] shrink-0 font-bold text-base">
                  {displayName(name)}
                </span>
                <span className="font-semibold text-base text-muted-strong">
                  {makes.map(({ make }) => make).join(", ") || "—"}
                </span>
                {makes[0] ? (
                  <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
                    {makes[0].make}{" "}
                    {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of{" "}
                    {displayName(name)}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportNote title="How LTA classifies {config.singularLabel.toLowerCase()}s">
          {config.notes.map((note) => (
            <Typography.Paragraph key={note}>{note}</Typography.Paragraph>
          ))}
          {config.relatedLinks.map(({ href, label }) => (
            <Link
              className="font-bold text-accent-strong text-base"
              href={href}
              key={href}
            >
              {label} →
            </Link>
          ))}
        </ReportNote>
      </div>
    </>
  );
}
