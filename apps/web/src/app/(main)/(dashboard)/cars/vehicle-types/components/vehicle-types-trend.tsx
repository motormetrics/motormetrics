import {
  type VehicleSeries,
  type VehicleTrendPoint,
  VehicleTypesChart,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-chart";
import { MeasureSegment } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-filters";
import {
  type MonthlyRow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-shared";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
  formatMonthShortLabel,
} from "@web/utils/dates/format-month";

/** The charted vehicle types over the trailing year, as share or volume. */
export function VehicleTypesTrend({
  chartSeries,
  measure,
  month,
  monthlyRows,
}: {
  chartSeries: VehicleSeries[];
  measure: "share" | "volume";
  month: string;
  /** Oldest first. */
  monthlyRows: MonthlyRow[];
}) {
  const chartData: VehicleTrendPoint[] = monthlyRows.map(
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
        caption={`${formatMonthLabel(monthlyRows[0].month)} to ${formatMonthLabel(month)} · hover or tap for each month`}
        eyebrow="Trend"
        title={
          measure === "share"
            ? "Share of registrations by vehicle type"
            : "Registrations by vehicle type"
        }
        trailing={<MeasureSegment />}
      />
      <VehicleTypesChart
        data={chartData}
        measure={measure}
        series={chartSeries}
        ticks={chartTicks}
      />
      <SourceNote>
        {measure === "share"
          ? "Share of each month's new car registrations"
          : "New car registrations by month"}
        . Y-axis starts at zero; gridlines every{" "}
        {measure === "share"
          ? `${gridStep} points`
          : `${gridStep.toLocaleString("en-SG")} cars`}
        . The trend covers {SERIES_MONTHS} months whatever the period switch is
        set to.
      </SourceNote>
    </section>
  );
}
