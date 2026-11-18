import { Skeleton } from "@heroui/react";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  type ShareColumn,
  ShareColumns,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

/** Months of history the column chart shows, matching the comp's eight bars. */
export const COLUMN_COUNT = 8;

/** The electric shares of the `COLUMN_COUNT` months to `month`. */
export async function loadShareWindow(month: string) {
  const data = await loadEvMonth(month);
  if (!data) {
    return [];
  }

  const start = Math.max(0, data.index - COLUMN_COUNT + 1);
  return data.shares.slice(start, data.index + 1);
}

async function Columns({ selection }: SelectionProps) {
  const { month } = await selection;
  const [data, trend] = await Promise.all([
    loadEvMonth(month),
    getEvMonthlyTrend(),
  ]);
  if (!data) {
    return null;
  }

  const start = Math.max(0, data.index - COLUMN_COUNT + 1);
  const columns: ShareColumn[] = trend
    .slice(start, data.index + 1)
    .map((point, offset) => {
      const share = data.shares[start + offset] ?? 0;
      const isSelected = point.month === data.point.month;
      return {
        key: point.month,
        label: formatChartMonth(point.month),
        other: isSelected ? 0 : share,
        selected: isSelected ? share : 0,
        share,
        title: formatMonthShortLabel(point.month),
        year:
          offset === 0 || point.month.endsWith("-01")
            ? point.month.slice(0, 4)
            : "",
      };
    });

  return (
    <ShareColumns
      columns={columns}
      ticks={axisTicks(
        columns.map((column) => column.share),
        { zero: true },
      )}
    />
  );
}

/** The electric share of new cars, month by month. */
export function AdoptionByMonth({ selection }: SelectionProps) {
  return (
    <Suspense fallback={<Skeleton className="h-64 w-full" />}>
      <Columns selection={selection} />
    </Suspense>
  );
}
