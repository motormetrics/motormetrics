import {
  periodRange,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/registrations-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeMonthlyPoint } from "@web/queries/cars/type-detail";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";

/** The vehicle type's registrations by month, the selected month highlighted. */
export function VehicleTypeTrend({
  displayName,
  month,
  series,
}: {
  displayName: string;
  month: string;
  series: TypeMonthlyPoint[];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodRange("12m", month)} · hover or tap a bar for its value`}
        eyebrow="Trend"
        title={`${displayName} registrations by month`}
      />
      <RegistrationsChart
        data={series.map(({ count, month: seriesMonth, total }, index) => {
          const isSelected = seriesMonth === month;
          return {
            count,
            earlier: isSelected ? 0 : count,
            label: formatChartMonth(seriesMonth),
            latest: isSelected ? count : 0,
            market: total,
            title: formatMonthLabel(seriesMonth),
            year:
              index === 0 || seriesMonth.endsWith("-01")
                ? seriesMonth.slice(0, 4)
                : "",
          };
        })}
        ticks={axisTicks(
          series.map(({ count }) => count),
          { zero: true },
        )}
        vehicleType={displayName}
      />
      <SourceNote>
        New {displayName} registrations, all makes and fuel types. The chart
        covers the {SERIES_MONTHS} months to the selected month whatever the
        period switch is set to. Y-axis starts at zero.
      </SourceNote>
    </section>
  );
}
