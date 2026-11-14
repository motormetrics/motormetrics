import { Skeleton } from "@heroui/react";
import { SelectedMonthName } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-head";
import {
  loadEvMonth,
  type SelectionProps,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-report";
import {
  type ShareColumn,
  ShareColumns,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
import { SubHead } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/sub-head";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SourceNote } from "@web/components/shared/overview";
import { getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

/** Months of history the column chart shows, matching the comp's eight bars. */
const COLUMN_COUNT = 8;

/** The battery-electric shares of the `COLUMN_COUNT` months to `month`. */
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

/** One half of Figure 3: the battery-electric share, month by month. */
export function AdoptionByMonth({ selection }: SelectionProps) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <SubHead
        sub={
          <>
            EV share of all new car registrations · {COLUMN_COUNT} months to{" "}
            <Suspense fallback=" ">
              <SelectedMonthName selection={selection} />
            </Suspense>
          </>
        }
        title="Share by month"
      />
      <Suspense fallback={<Skeleton className="h-64 w-full" />}>
        <Columns selection={selection} />
      </Suspense>
      <SourceNote>
        Battery-electric share of each month&apos;s new car registrations.
        Y-axis starts at zero.
      </SourceNote>
    </div>
  );
}
