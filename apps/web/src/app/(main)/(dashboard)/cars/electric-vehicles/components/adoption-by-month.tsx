import { formatDateToMonthYear } from "@motormetrics/utils";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import { ShareColumns } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
import { SectionHead } from "@web/components/shared/overview";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";

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

  if (index < 0) {
    return null;
  }

  const shares = batteryElectricShares(trend, marketShare);
  const start = Math.max(0, index - COLUMN_COUNT + 1);
  const columns = trend.slice(start, index + 1).map((point, offset) => {
    const share = shares[start + offset] ?? 0;
    return {
      key: point.month,
      label: formatDateToMonthYear(point.month).slice(0, 3),
      value: share,
      valueLabel: `${share.toFixed(0)}%`,
    };
  });

  const firstYear = columns.at(0)?.key.slice(0, 4);
  const lastYear = columns.at(-1)?.key.slice(0, 4);
  const period = firstYear === lastYear ? lastYear : `${firstYear}–${lastYear}`;

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`EV share of all new car registrations · ${period}`}
        eyebrow="Adoption"
        title="Share by month"
      />

      <ShareColumns
        columns={columns}
        selectedMonth={trend[index]?.month ?? month}
      />
    </div>
  );
}
