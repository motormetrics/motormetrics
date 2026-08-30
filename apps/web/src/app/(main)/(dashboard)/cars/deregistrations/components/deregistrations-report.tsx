import { Typography } from "@heroui/react";
import type { SelectDeregistration } from "@motormetrics/database";
import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  type DeregistrationSeries,
  DeregistrationsChart,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-chart";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import {
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
import { getDeregistrations } from "@web/queries/deregistrations";
import { getMonthOrLatest } from "@web/utils/dates/months";
import { format, subMonths } from "date-fns";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** How far back the trend chart and the month-by-month table reach. */
const SERIES_MONTHS = 12;

/** How many categories the chart plots and the monthly table columns. */
const CHARTED_CATEGORIES = 6;

/**
 * What LTA's category names mean, for the table's description column. Authored
 * copy keyed by the value exactly as the deregistration feed records it.
 */
const CATEGORY_DESCRIPTIONS: Record<string, string> = {
  "Category A": "Cars up to 1,600cc and 130bhp",
  "Category B": "Cars above 1,600cc or 130bhp",
  "Category C": "Goods vehicles and buses",
  "Category D": "Motorcycles",
  "Vehicles Exempted From VQS": "Vehicles outside the quota system",
  Taxis: "Taxis, which draw on their own quota",
};

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
  return MONTH_LABELS[Number(month.slice(5, 7)) - 1] ?? month;
}

/** The `SERIES_MONTHS` months ending at `month`, oldest first. */
function trailingMonths(month: string): string[] {
  const anchor = new Date(`${month}-01T00:00:00Z`);

  return Array.from({ length: SERIES_MONTHS }, (_, index) =>
    format(subMonths(anchor, SERIES_MONTHS - 1 - index), "yyyy-MM"),
  );
}

function percentageOf(count: number, total: number): number {
  return total > 0 ? (count / total) * 100 : 0;
}

/** `{ month, category, number }` rows totalled per category for one month. */
function totalsForMonth(
  records: SelectDeregistration[],
  month: string,
): Map<string, number> {
  const totals = new Map<string, number>();

  for (const record of records) {
    if (record.month !== month) {
      continue;
    }
    totals.set(
      record.category,
      (totals.get(record.category) ?? 0) + (record.number ?? 0),
    );
  }

  return totals;
}

function sumOf(totals: Map<string, number>): number {
  let sum = 0;
  for (const value of totals.values()) {
    sum += value;
  }
  return sum;
}

export async function DeregistrationsReport({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const { month } = await getMonthOrLatest(parsedMonth, "deregistrations");

  const records = await getDeregistrations();
  const seriesMonths = trailingMonths(month);
  const priorMonth = format(
    subMonths(new Date(`${month}-01T00:00:00Z`), 1),
    "yyyy-MM",
  );
  const yearAgoMonth = `${Number(month.slice(0, 4)) - 1}-${month.slice(5, 7)}`;

  const totals = totalsForMonth(records, month);
  const priorTotals = totalsForMonth(records, priorMonth);
  const yearAgoTotals = totalsForMonth(records, yearAgoMonth);

  const rows = [...totals.entries()]
    .map(([category, count]) => ({ category, count }))
    .filter(({ count }) => count > 0)
    .sort((a, b) => b.count - a.count);

  const formattedMonth = formatDateToMonthYear(month);

  if (rows.length === 0) {
    return (
      <Typography.Paragraph>
        No deregistration data available for {formattedMonth}
      </Typography.Paragraph>
    );
  }

  const total = sumOf(totals);
  const priorTotal = sumOf(priorTotals);
  const yearAgoTotal = sumOf(yearAgoTotals);

  // The chart and the month-by-month table plot the same leading categories,
  // so a colour means the same thing in both.
  const chartedCategories = rows.slice(0, CHARTED_CATEGORIES);
  const chartSeries: DeregistrationSeries[] = chartedCategories.map(
    ({ category }, index) => ({
      color: `var(--chart-${index + 1})`,
      key: `category${index}`,
      label: category,
    }),
  );

  const monthlyRows = seriesMonths.map((seriesMonth) => {
    const monthTotals = totalsForMonth(records, seriesMonth);

    return {
      cells: chartedCategories.map(({ category }) => ({
        count: monthTotals.get(category) ?? 0,
      })),
      month: seriesMonth,
      total: sumOf(monthTotals),
    };
  });

  const chartData = monthlyRows.map(({ cells, month: seriesMonth }) => ({
    label: chartLabel(seriesMonth),
    ...Object.fromEntries(
      cells.map(({ count }, index) => [`category${index}`, count]),
    ),
  }));

  return (
    <>
      <ReportHeadline
        delta={
          priorTotal > 0 ? (
            <DeltaChip value={percentageOf(total - priorTotal, priorTotal)} />
          ) : undefined
        }
        label={`Deregistrations · ${formattedMonth}`}
        stats={rows
          .slice(0, 4)
          .map(({ category, count }) => (
            <ReportStat
              key={category}
              label={category}
              note={`${percentageOf(count, total).toFixed(1)}% of the month`}
              value={count.toLocaleString("en-SG")}
            />
          ))}
        sub={
          yearAgoTotal > 0
            ? `${rows.length} categories · ${percentageOf(total - yearAgoTotal, yearAgoTotal) >= 0 ? "up" : "down"} ${Math.abs(percentageOf(total - yearAgoTotal, yearAgoTotal)).toFixed(1)}% on ${formatDateToMonthYear(yearAgoMonth)}`
            : `${rows.length} categories · no figures for ${formatDateToMonthYear(yearAgoMonth)} to compare against`
        }
        value={total.toLocaleString("en-SG")}
      />

      <DeregistrationsChart data={chartData} series={chartSeries} />

      <ReportSection
        caption={`${formattedMonth} · change against ${formatDateToMonthYear(yearAgoMonth)}`}
        title="By category"
      >
        <ReportTable
          columns={[
            { label: "Category" },
            { label: "Description" },
            { align: "end", label: "Deregistrations" },
            { align: "end", label: "Share" },
            { label: "", width: "200px" },
            { align: "end", label: "Vs a year earlier", width: "150px" },
          ]}
        >
          {rows.map(({ category, count }, index) => {
            const share = percentageOf(count, total);
            const yearAgoCount = yearAgoTotals.get(category) ?? 0;

            return (
              <ReportRow key={category}>
                <ReportCell className="font-bold text-base">
                  <span className="flex items-center gap-3">
                    <span
                      className="size-3.5 shrink-0 rounded"
                      style={{
                        backgroundColor: `var(--chart-${(index % CHARTED_CATEGORIES) + 1})`,
                      }}
                    />
                    {category}
                  </span>
                </ReportCell>
                <ReportCell className="font-medium text-muted-strong text-sm">
                  {CATEGORY_DESCRIPTIONS[category] ?? "—"}
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
                  {yearAgoCount > 0 ? (
                    <DeltaText
                      value={percentageOf(count - yearAgoCount, yearAgoCount)}
                    />
                  ) : (
                    <span className="font-semibold text-muted text-sm">—</span>
                  )}
                </ReportCell>
              </ReportRow>
            );
          })}
        </ReportTable>
      </ReportSection>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection
          caption={`${SERIES_MONTHS} months to ${formattedMonth}`}
          title="Month by month"
        >
          <ReportTable
            columns={[
              { label: "Month" },
              { align: "end", label: "Total" },
              ...chartedCategories.map(({ category }) => ({
                align: "end" as const,
                label: category,
              })),
            ]}
          >
            {[...monthlyRows].reverse().map((row) => (
              <ReportRow isActive={row.month === month} key={row.month}>
                <ReportCell className="font-bold text-base">
                  {formatDateToMonthYear(row.month)}
                </ReportCell>
                <ReportCell align="end" className="font-extrabold text-base">
                  <Count value={row.total} />
                </ReportCell>
                {row.cells.map(({ count }, index) => (
                  <ReportCell
                    align="end"
                    className="font-semibold text-muted"
                    key={chartedCategories[index].category}
                  >
                    <Count value={count} />
                  </ReportCell>
                ))}
              </ReportRow>
            ))}
          </ReportTable>
        </ReportSection>

        <ReportNote title="What a deregistration is">
          <Typography.Paragraph>
            A vehicle is deregistered when it is scrapped or exported, which is
            what releases its COE back into the quota. Deregistrations in one
            month therefore set much of the supply bid for in later exercises.
          </Typography.Paragraph>
          <Typography.Paragraph>
            The categories are the COE ones the vehicle held, so a
            deregistration is counted against the quota it returns to rather
            than the body type of the car.
          </Typography.Paragraph>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/coe/results"
          >
            COE bidding results →
          </Link>
          <Link
            className="font-bold text-accent-strong text-base"
            href="/cars/registrations"
          >
            New registrations →
          </Link>
        </ReportNote>
      </div>
    </>
  );
}
