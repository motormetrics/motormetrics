import { Typography } from "@heroui/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { slugify } from "@motormetrics/utils/slugify";
import { MeasureTabs } from "@web/app/(main)/(dashboard)/cars/components/category/category-filters";
import {
  type CategorySeries,
  CategoryShareChart,
} from "@web/app/(main)/(dashboard)/cars/components/category/category-share-chart";
import { PeriodTabs } from "@web/app/(main)/(dashboard)/cars/components/category/period-tabs";
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
import { FUEL_TYPE_LINKS } from "@web/config";
import {
  type CategoryMonthlyPoint,
  getCategoryMonthlySeries,
  getCategoryTotals,
  getTopMakesByCategory,
} from "@web/queries/cars/category-report";
import { formatChartMonth } from "@web/utils/dates/format-month";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import Link from "next/link";
import {
  createLoader,
  parseAsString,
  parseAsStringLiteral,
  type SearchParams,
} from "nuqs/server";

/**
 * The fuel-type half of `cars/components/category/category-report.tsx`,
 * split off so this page can follow its own comp while `/cars/vehicle-types`
 * keeps the shared report.
 */
const PERIODS = ["month", "ytd"] as const;

const PERIOD_LABELS: Record<(typeof PERIODS)[number], string> = {
  month: "This month",
  ytd: "Year to date",
};

const PERIOD_OPTIONS = PERIODS.map((key) => ({
  key,
  label: PERIOD_LABELS[key],
}));

const loadFuelTypesSearchParams = createLoader({
  measure: parseAsStringLiteral(["share", "volume"] as const).withDefault(
    "share",
  ),
  month: parseAsString,
  period: parseAsStringLiteral(PERIODS).withDefault("month"),
});

/**
 * The table's description column is authored copy, not data. Reusing the
 * navigation descriptions keeps one wording per fuel type across the site;
 * `Others` has no navigation entry because it has no detail page worth linking.
 */
const DESCRIPTIONS: Record<string, string> = {
  ...Object.fromEntries(
    FUEL_TYPE_LINKS.filter(({ description }) => description).map(
      ({ description, label }) => [label, description as string],
    ),
  ),
  Others: "Fuel types LTA does not report separately",
};

const URL_PATH = "/cars/fuel-types";

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

  const formattedMonth = formatDateToMonthYear(month);
  const periodLabel =
    period === "ytd" ? `${year} year to date` : formattedMonth;

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
    label: name,
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
      <ReportFilterBar
        label="Period"
        trailing={<MeasureTabs />}
        trailingLabel="Measure"
      >
        <PeriodTabs defaultKey="month" options={PERIOD_OPTIONS} />
      </ReportFilterBar>

      <ReportHeadline
        delta={<DeltaChip unit="pp" value={leaderShare - leaderPriorShare} />}
        label={`${leader.name} share of registrations`}
        stats={rows
          .slice(0, 4)
          .map(({ count, name }) => (
            <ReportStat
              key={name}
              label={name}
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
        title="All fuel types"
      >
        <ReportTable
          columns={[
            { label: "Fuel type" },
            { label: "Description" },
            {
              align: "end",
              label: period === "ytd" ? "Year to date" : "Registrations",
            },
            { align: "end", label: "Share" },
            { label: "", width: "200px" },
            { align: "end", label: `Vs ${year - 1}`, width: "120px" },
          ]}
        >
          {rows.map(({ count, name }, index) => {
            const share = percentageOf(count, total);
            const priorShare = percentageOf(
              priorByName.get(name) ?? 0,
              priorTotal,
            );

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
                      href={`${URL_PATH}/${slugify(name)}`}
                    >
                      {name}
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
              label: name,
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
        <ReportSection caption={periodLabel} title="Leading makes by fuel type">
          <div className="flex flex-col">
            {leaders.map(({ makes, name, total: typeTotal }) => (
              <div
                className="flex flex-wrap items-baseline gap-5 border-border border-b py-4"
                key={name}
              >
                <span className="w-[150px] shrink-0 font-bold text-base">
                  {name}
                </span>
                <span className="font-semibold text-base text-muted-strong">
                  {makes.map(({ make }) => make).join(", ") || "—"}
                </span>
                {makes[0] ? (
                  <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
                    {makes[0].make}{" "}
                    {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of{" "}
                    {name}
                  </span>
                ) : null}
              </div>
            ))}
          </div>
        </ReportSection>

        <ReportNote title="How LTA classifies fuel types">
          <Typography.Paragraph>
            LTA records the fuel type at registration, and reports plug-in
            hybrids separately from the hybrids that only charge themselves.
            Only battery-electric cars count as Electric.
          </Typography.Paragraph>
          <Typography.Paragraph>
            Figures here are new registrations, not the fleet on the road — the
            population mix shifts far more slowly.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/fuel-types/electric"
          >
            Electric in detail →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/vehicle-types"
          >
            Vehicle types →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
