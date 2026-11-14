import type { SelectDeregistration } from "@motormetrics/database/schema";
import {
  type MonthlyRow,
  yearOnYear,
} from "@web/app/(main)/(dashboard)/cars/deregistrations/components/summary";
import { loadSearchParams } from "@web/app/(main)/(dashboard)/cars/deregistrations/search-params";
import { getDeregistrations } from "@web/queries/deregistrations";
import { shiftMonth, trailingMonths } from "@web/utils/dates/month-arithmetic";
import { getMonthOrLatest } from "@web/utils/dates/months";
import type { SearchParams } from "nuqs/server";

/** How far back the trend chart and the month-by-month table reach. */
export const SERIES_MONTHS = 12;

/**
 * LTA's categories in the comp's order, with what each name means for the
 * table's description column, the colour the chart and tables share, and the
 * shorter label the legend uses. Authored copy keyed by the value exactly as
 * the deregistration feed records it.
 *
 * Taxis and exempt vehicles take neutral tones rather than more slate steps,
 * as in the comp, so the four COE categories read as the main series.
 */
export const CATEGORIES = [
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

/**
 * Every figure the page draws for the selected month. The page starts it once
 * and hands the promise to each part, which awaits it behind its own boundary,
 * so the headings and labels around them stay in the static shell.
 */
export async function loadDeregistrationsReport(
  searchParams: Promise<SearchParams>,
) {
  const { month: parsedMonth } = await loadSearchParams(searchParams);
  const [{ month }, records] = await Promise.all([
    getMonthOrLatest(parsedMonth, "deregistrations"),
    getDeregistrations(),
  ]);
  const priorMonth = shiftMonth(month, -1);
  const yearAgoMonth = shiftMonth(month, -12);

  const totals = totalsForMonth(records, month);
  const yearAgoTotals = totalsForMonth(records, yearAgoMonth);
  const total = sumOf(totals);
  const yearAgoTotal = sumOf(yearAgoTotals);

  // Largest first, each with the comp's label, colour and description.
  const categories = [...totals.entries()]
    .filter(([, count]) => count > 0)
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => {
      const details = CATEGORIES.find(({ name }) => name === category);
      const yearAgoCount = yearAgoTotals.get(category) ?? 0;

      return {
        category,
        color: details?.color ?? "var(--chart-6)",
        count,
        description: details?.description ?? "—",
        label: details?.label ?? category,
        share: percentageOf(count, total),
        yearAgoChange:
          yearAgoCount > 0
            ? percentageOf(count - yearAgoCount, yearAgoCount)
            : null,
      };
    });

  // Oldest first; the chart, the range bar and the table share it.
  const monthlyRows: MonthlyRow[] = trailingMonths(month, SERIES_MONTHS).map(
    (seriesMonth) => {
      const monthTotals = totalsForMonth(records, seriesMonth);

      return {
        counts: CATEGORIES.map(({ name }) => monthTotals.get(name) ?? 0),
        month: seriesMonth,
        total: sumOf(monthTotals),
      };
    },
  );

  return {
    categories,
    change: yearOnYear(total, yearAgoTotal),
    month,
    monthlyRows,
    priorMonth,
    priorTotal: sumOf(totalsForMonth(records, priorMonth)),
    total,
    totals,
    yearAgoMonth,
  };
}

export type DeregistrationsReportData = Awaited<
  ReturnType<typeof loadDeregistrationsReport>
>;

/** What every part of the page that shows figures takes. */
export interface ReportProps {
  /** Not awaited by the section itself, only by the parts of it that wait. */
  report: Promise<DeregistrationsReportData>;
}
