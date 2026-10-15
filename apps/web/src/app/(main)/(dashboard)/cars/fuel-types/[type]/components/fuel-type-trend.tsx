import { RegistrationsChart } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/registrations-chart";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeMonthlyPoint } from "@web/queries/cars/type-detail";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";

/** The fuel type's registrations by month, the selected month highlighted. */
export function FuelTypeTrend({
  month,
  series,
  value,
}: {
  month: string;
  series: TypeMonthlyPoint[];
  value: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${series.length} months to ${formatMonthLabel(month)} · hover or tap a bar for its value`}
        eyebrow="Trend"
        title={`${value} registrations by month`}
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
        fuelType={value}
        ticks={axisTicks(
          series.map(({ count }) => count),
          { zero: true },
        )}
      />
      <SourceNote>
        {value} new car registrations each month. Y-axis starts at zero.
      </SourceNote>
    </section>
  );
}
