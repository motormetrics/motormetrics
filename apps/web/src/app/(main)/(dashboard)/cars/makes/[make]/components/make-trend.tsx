import { Typography } from "@heroui/react";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import type { Range } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";

/** The make's registrations by month, the selected month darker, with the summary line under it. */
export function MakeTrend({
  fuelType,
  make,
  month,
  series,
  seriesRange,
  summary,
}: {
  fuelType: string | null;
  make: string;
  month: string;
  series: { count: number; month: string }[];
  seriesRange: Range;
  summary: string | undefined;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodLabel(month, seriesRange)} · hover or tap a bar for its value`}
        eyebrow="Trend"
        title={`${make}${fuelType ? ` ${fuelType}` : ""} registrations by month`}
      />
      <TwoShadeTrendChart
        data={series.map(({ count, month: seriesMonth }, index) => {
          const isSelected = seriesMonth === month;
          return {
            count,
            earlier: isSelected ? 0 : count,
            label: formatChartMonth(seriesMonth),
            latest: isSelected ? count : 0,
            title: formatMonthLabel(seriesMonth),
            year:
              index === 0 || seriesMonth.endsWith("-01")
                ? seriesMonth.slice(0, 4)
                : "",
          };
        })}
        height={220}
        maxBarSize={40}
        thinTicks
        ticks={axisTicks(
          series.map(({ count }) => count),
          { zero: true },
        )}
        tooltipLabel="Registrations"
      />
      <SourceNote>
        New car registrations, {make}
        {fuelType ? `, ${fuelType} only.` : ", all fuel types."}
      </SourceNote>
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
    </section>
  );
}
