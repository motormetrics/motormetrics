import { Skeleton, Typography } from "@heroui/react";
import { TwoShadeTrendChart } from "@web/app/(main)/(dashboard)/cars/components/two-shade-trend-chart";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import {
  formatChartMonth,
  formatMonthLabel,
} from "@web/utils/dates/format-month";
import { Suspense } from "react";

type ReportProps = Pick<MakeSectionProps, "report">;

/** " Electric" after the make in the title, when a fuel type is selected. */
async function TrendFuelType({ report }: ReportProps) {
  const { fuelType } = await report;

  return fuelType ? ` ${fuelType}` : null;
}

async function TrendCaption({ report }: ReportProps) {
  const { month, seriesRange } = await report;

  return `${periodLabel(month, seriesRange)} · hover or tap a bar for its value`;
}

/** The chart, the selected month darker, with its note and the summary line. */
async function TrendFigure({ make, report }: MakeSectionProps) {
  const { fuelType, month, series, summary } = await report;

  return (
    <>
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
    </>
  );
}

/**
 * The make's registrations by month. The heading is in the static shell; the
 * caption and the chart follow the period and fuel type, so each waits behind
 * its own boundary.
 */
export function MakeTrend({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={" "}>
            <TrendCaption report={report} />
          </Suspense>
        }
        eyebrow="Trend"
        title={
          <>
            {make}
            <Suspense fallback={null}>
              <TrendFuelType report={report} />
            </Suspense>{" "}
            registrations by month
          </>
        }
      />
      <Suspense fallback={<Skeleton className="h-72 w-full" />}>
        <TrendFigure make={make} report={report} />
      </Suspense>
    </section>
  );
}
