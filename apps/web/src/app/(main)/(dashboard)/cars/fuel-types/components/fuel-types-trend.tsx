import {
  type FuelSeries,
  type FuelTrendPoint,
  FuelTypesChart,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-chart";
import { MeasureSegment } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-filters";
import {
  type MonthlyRow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-shared";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";

/** The charted fuel types over the trailing year, as share or volume. */
export function FuelTypesTrend({
  chartSeries,
  measure,
  month,
  monthlyRows,
}: {
  chartSeries: FuelSeries[];
  measure: "share" | "volume";
  month: string;
  /** Oldest first. */
  monthlyRows: MonthlyRow[];
}) {
  const chartData: FuelTrendPoint[] = monthlyRows.map(
    ({ cells, month: seriesMonth, total: monthTotal }, index) => ({
      label: formatChartMonth(seriesMonth),
      title: formatMonthShortLabel(seriesMonth),
      total: monthTotal,
      year:
        index === 0 || seriesMonth.endsWith("-01")
          ? seriesMonth.slice(0, 4)
          : "",
      ...Object.fromEntries(
        cells.map(({ count, share }, index) => [
          `type${index}`,
          measure === "share" ? Number(share.toFixed(1)) : count,
        ]),
      ),
    }),
  );
  const chartTicks = axisTicks(
    chartData.flatMap((point) =>
      chartSeries.map(({ key }) => Number(point[key])),
    ),
    { zero: true },
  );
  const gridStep = (chartTicks[1] ?? 0) - (chartTicks[0] ?? 0);

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${SERIES_MONTHS} months to ${formatMonthLabel(month)} · hover or tap for values`}
        eyebrow="Trend"
        title={
          measure === "share"
            ? "Share of registrations by fuel type"
            : "Registrations by fuel type"
        }
        trailing={<MeasureSegment />}
      />
      <FuelTypesChart
        data={chartData}
        measure={measure}
        series={chartSeries}
        ticks={chartTicks}
      />
      <SourceNote>
        Source: LTA via DataMall ·{" "}
        {measure === "share"
          ? "Share of each month's new car registrations"
          : "New car registrations each month"}{" "}
        · Y-axis starts at zero; gridlines every{" "}
        {measure === "share"
          ? `${gridStep} pts`
          : `${gridStep.toLocaleString("en-SG")} cars`}
        .
      </SourceNote>
    </section>
  );
}
