import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  type ShareColumn,
  ShareColumns,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthName,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";

/** Months of history the column chart shows, matching the comp's eight bars. */
const COLUMN_COUNT = 8;

export async function AdoptionByMonth({ month }: { month: string }) {
  const [trend, marketShare] = await Promise.all([
    getEvMonthlyTrend(),
    getEvMarketShare(),
  ]);

  const index = resolveMonthIndex(
    trend.map((point) => point.month),
    month,
  );
  const selectedMonth = trend[index]?.month;

  if (!selectedMonth) {
    return null;
  }

  const shares = batteryElectricShares(trend, marketShare);
  const start = Math.max(0, index - COLUMN_COUNT + 1);
  const columns: ShareColumn[] = trend
    .slice(start, index + 1)
    .map((point, offset) => {
      const share = shares[start + offset] ?? 0;
      const isSelected = point.month === selectedMonth;
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
  const ticks = axisTicks(
    columns.map((column) => column.share),
    { zero: true },
  );

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`EV share of all new car registrations · ${columns.length} months to ${formatMonthName(selectedMonth)}`}
        eyebrow="Adoption"
        title="Share by month"
      />

      <ShareColumns columns={columns} ticks={ticks} />

      <SourceNote>
        Battery-electric share of each month&apos;s new car registrations.
        Y-axis starts at zero.
      </SourceNote>
    </section>
  );
}
