import { AdoptionColumns } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-columns";
import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import Typography from "@web/components/typography";
import { SurfaceCard } from "@web/components/v2/bento";
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
  const columns = trend.slice(start, index + 1).map((point, offset) => ({
    month: point.month,
    share: shares[start + offset] ?? 0,
  }));

  return (
    <SurfaceCard className="gap-4 p-7">
      <div className="flex flex-col gap-1">
        <Typography.Text className="font-semibold text-[var(--muted-strong)]">
          Adoption
        </Typography.Text>
        <Typography.H3 className="font-bold tracking-[-0.02em]">
          Share by month
        </Typography.H3>
      </div>

      <AdoptionColumns
        columns={columns}
        selectedMonth={trend[index]?.month ?? month}
      />

      <Typography.Caption className="text-[var(--subtle)]">
        Battery-electric share of all new car registrations
      </Typography.Caption>
    </SurfaceCard>
  );
}
