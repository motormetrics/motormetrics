import { Typography } from "@heroui/react";
import type { SelectDeregistration } from "@motormetrics/database/schema";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { CategoryTable } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/category-table";
import {
  type DeregistrationSeries,
  DeregistrationsChart,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-chart";
import { DeregistrationsHeadline } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/deregistrations-headline";
import { stackedPoints } from "@web/app/(main)/(dashboard)/cars/deregistrations/components/stacked-points";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import {
  Hairline,
  SectionHead,
  SourceNote,
} from "@web/components/shared/overview";
import { ReportNote, ReportSection } from "@web/components/shared/report";
import {
  Count,
  ReportCell,
  ReportRow,
  ReportTable,
} from "@web/components/shared/report-table";
import { getDeregistrations } from "@web/queries/deregistrations";
import {
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import Link from "next/link";
import type { SearchParams } from "nuqs/server";

/** How far back the trend chart and the month-by-month table reach. */
const SERIES_MONTHS = 12;

/**
 * LTA's categories in the comp's order, with what each name means for the
 * table's description column, the colour the chart and tables share, and the
 * shorter label the legend uses. Authored copy keyed by the value exactly as
 * the deregistration feed records it.
 *
 * Taxis and exempt vehicles take neutral tones rather than more slate steps,
 * as in the comp, so the four COE categories read as the main series.
 */
const CATEGORIES = [
  {
    color: "var(--chart-1)",
    description: "Cars up to 1,600cc and 130bhp",
    label: "Category A",
    name: "Category A",
  },
  {
    color: "var(--chart-3)",
    description: "Cars above 1,600cc or 130bhp",
    label: "Category B",
    name: "Category B",
  },
  {
    color: "var(--chart-5)",
    description: "Goods vehicles and buses",
    label: "Category C",
    name: "Category C",
  },
  {
    color: "var(--chart-sand)",
    description: "Motorcycles",
    label: "Category D",
    name: "Category D",
  },
  {
    color: "var(--subtle)",
    description: "Taxis, which draw on their own quota",
    label: "Taxis",
    name: "Taxis",
  },
  {
    color: "var(--border)",
    description: "Vehicles outside the quota system",
    label: "Exempt from VQS",
    name: "Vehicles Exempted From VQS",
  },
];

/** The four COE categories the headline sets beside the month's total. */
const HEADLINE_CATEGORIES = CATEGORIES.slice(0, 4);

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
  const [{ month }, records] = await Promise.all([
    getMonthOrLatest(parsedMonth, "deregistrations"),
    getDeregistrations(),
  ]);
  const seriesMonths = trailingMonths(month, SERIES_MONTHS);
  const priorMonth = shiftMonth(month, -1);
  const yearAgoMonth = shiftMonth(month, -12);

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

  // The chart and the month-by-month table share the category order and
  // colours, so a colour means the same thing in both.
  const chartSeries: DeregistrationSeries[] = CATEGORIES.map(
    ({ color, label }) => ({ color, label }),
  );

  const monthlyRows = seriesMonths.map((seriesMonth) => {
    const monthTotals = totalsForMonth(records, seriesMonth);

    return {
      counts: CATEGORIES.map(({ name }) => monthTotals.get(name) ?? 0),
      month: seriesMonth,
      total: sumOf(monthTotals),
    };
  });

  return (
    <>
      <DeregistrationsHeadline
        label={`Vehicles deregistered in ${formatMonthLabel(month)}`}
        previousMonth={priorMonth}
        previousValue={priorTotal}
        stats={HEADLINE_CATEGORIES.map(({ name }) => {
          const count = totals.get(name) ?? 0;
          return {
            label: name,
            note: `${percentageOf(count, total).toFixed(1)}% of the month`,
            value: count,
          };
        })}
        sub={
          yearAgoTotal > 0
            ? `${rows.length} categories · ${percentageOf(total - yearAgoTotal, yearAgoTotal) >= 0 ? "up" : "down"} ${Math.abs(percentageOf(total - yearAgoTotal, yearAgoTotal)).toFixed(1)}% on ${formatMonthShortLabel(yearAgoMonth)}`
            : `${rows.length} categories · no figures for ${formatMonthShortLabel(yearAgoMonth)} to compare against`
        }
        value={total}
      />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${SERIES_MONTHS} months to ${formatMonthShortLabel(month)} · stacked by category · hover or tap a column`}
          eyebrow="Trend"
          title="Deregistrations by month"
        />
        <DeregistrationsChart
          data={stackedPoints(monthlyRows, month)}
          series={chartSeries}
          ticks={axisTicks(
            monthlyRows.map(({ total: monthTotal }) => monthTotal),
            { zero: true },
          )}
        />
        <SourceNote>
          All vehicle types, counted against the COE category each vehicle held.{" "}
          {formatMonthShortLabel(month)} is highlighted.
        </SourceNote>
      </section>

      <Hairline />

      <section className="flex flex-col gap-4">
        <SectionHead
          caption={`${formatMonthLabel(month)} · change against ${formatMonthLabel(yearAgoMonth)}`}
          eyebrow="Deregistrations"
          title="By category"
        />
        <CategoryTable
          rows={rows.map(({ category, count }) => {
            const yearAgoCount = yearAgoTotals.get(category) ?? 0;
            const details = CATEGORIES.find(({ name }) => name === category);

            return {
              category,
              color: details?.color ?? "var(--chart-6)",
              count,
              description: details?.description ?? "—",
              share: percentageOf(count, total),
              yearAgoChange:
                yearAgoCount > 0
                  ? percentageOf(count - yearAgoCount, yearAgoCount)
                  : null,
            };
          })}
          yearAgoLabel={yearAgoMonth.slice(0, 4)}
        />
        <SourceNote>
          Share is of {total.toLocaleString("en-SG")} deregistrations in{" "}
          {formatMonthLabel(month)}. Change is against the same month a year
          earlier; colour is not used for direction.
        </SourceNote>
      </section>

      <div className="grid grid-cols-1 gap-14 lg:grid-cols-[1fr_380px]">
        <ReportSection
          caption={`${SERIES_MONTHS} months to ${formattedMonth}`}
          title="Month by month"
        >
          <ReportTable
            columns={[
              { label: "Month" },
              { align: "end", label: "Total" },
              ...CATEGORIES.map(({ label }) => ({
                align: "end" as const,
                label,
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
                {row.counts.map((count, index) => (
                  <ReportCell
                    align="end"
                    className="font-semibold text-muted"
                    key={CATEGORIES[index].name}
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
