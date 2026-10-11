import {
  batteryElectricShares,
  resolveMonthIndex,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/ev-series";
import {
  EvShareChart,
  type EvSharePoint,
} from "@web/app/(main)/(dashboard)/components/ev-share-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { getEvMarketShare, getEvMonthlyTrend } from "@web/queries/cars";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { getLatestMonth } from "@web/utils/dates/months";

const CHART_MONTHS = 12;

/**
 * Battery-electric share of new car registrations over the last 12 months.
 * Hybrids are left out, the same framing as the EV page this links to.
 */
export async function EvShare() {
  const [month, trend, marketShare] = await Promise.all([
    getLatestMonth("cars"),
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
  const start = Math.max(0, index - CHART_MONTHS + 1);
  const data: EvSharePoint[] = trend
    .slice(start, index + 1)
    .map((point, offset) => {
      const position = start + offset;
      const share = Number((shares[position] ?? 0).toFixed(1));
      const previous =
        position > 0 ? Number((shares[position - 1] ?? 0).toFixed(1)) : null;
      return {
        change:
          offset > 0 && previous !== null
            ? Number((share - previous).toFixed(1))
            : undefined,
        label: formatChartMonth(point.month),
        share,
        title: formatMonthLabel(point.month),
        year:
          offset === 0 || point.month.endsWith("-01")
            ? point.month.slice(0, 4)
            : "",
      };
    });
  const ticks = axisTicks(
    data.map((point) => point.share),
    { zero: false },
  );
  const step = ticks.length > 1 ? ticks[1] - ticks[0] : undefined;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption="Battery-electric share of monthly registrations"
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="EV share of new cars"
      />
      <EvShareChart data={data} ticks={ticks} />
      <SourceNote>
        Source: LTA via DataMall · Y-axis does not start at zero
        {step ? `; gridlines every ${step} pts.` : "."}
      </SourceNote>
    </section>
  );
}
