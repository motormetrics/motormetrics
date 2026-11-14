import { cn, Skeleton } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { percentageChange } from "@web/utils/change-ratio";
import { Suspense } from "react";

type ReportProps = Pick<MakeSectionProps, "report">;

async function MonthlyCaption({ report }: ReportProps) {
  const { month, seriesRange } = await report;

  return `${periodLabel(month, seriesRange)}, newest first`;
}

/** " Electric" after the make in the note, when a fuel type is selected. */
async function MonthlyFuelType({ report }: ReportProps) {
  const { fuelType } = await report;

  return fuelType ? ` ${fuelType}` : null;
}

/** One row per month, newest first, the selected month shaded. */
async function MonthlyRows({ report }: ReportProps) {
  const { month, series } = await report;

  return series
    .map((entry, index) => ({
      ...entry,
      previous: index > 0 ? series[index - 1].count : null,
    }))
    .reverse()
    .map(({ count, market, month: seriesMonth, previous, share }) => (
      <div
        className={cn(
          "flex items-center gap-2 border-separator border-b py-2 text-sm tabular-nums md:gap-3",
          seriesMonth === month && "bg-surface-secondary",
        )}
        key={seriesMonth}
      >
        <span className="min-w-0 flex-1 truncate font-medium">
          {formatDateToMonthYear(seriesMonth)}
        </span>
        <span className="w-12 text-right font-semibold md:w-16">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={count} />
        </span>
        <span className="w-12 text-right text-muted md:w-16">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={market}
          />
        </span>
        <span className="w-12 text-right text-muted md:w-16">
          {share.toFixed(1)}%
        </span>
        {previous === null ? (
          <span className="w-14 text-right text-muted md:w-24">—</span>
        ) : (
          <DeltaChip
            className="w-14 text-right md:w-24"
            value={percentageChange(count, previous)}
          />
        )}
      </div>
    ));
}

/**
 * The make against the whole market month by month. The heading, the column
 * heads and the note are in the static shell; the caption and the rows wait
 * behind their own boundaries.
 */
export function MakeMonthlyTable({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-6">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={"\u00a0"}>
            <MonthlyCaption report={report} />
          </Suspense>
        }
        eyebrow="Month by month"
        title={`${make} against the whole market`}
      />
      <div className="flex flex-col">
        <div className="flex items-center gap-2 border-border border-b pb-2 font-semibold text-muted text-xs md:gap-3">
          <span className="min-w-0 flex-1">Month</span>
          <span className="w-12 truncate text-right md:w-16">{make}</span>
          <span className="w-12 text-right md:w-16">
            <span className="max-md:hidden">All cars</span>
            <span className="md:hidden">All</span>
          </span>
          <span className="w-12 text-right md:w-16">Share</span>
          <span className="w-14 text-right md:w-24">
            <span className="max-md:hidden">vs last month</span>
            <span className="md:hidden">vs prev</span>
          </span>
        </div>
        <Suspense fallback={<Skeleton className="h-96 w-full" />}>
          <MonthlyRows report={report} />
        </Suspense>
      </div>
      <SourceNote>
        Share is {make}
        <Suspense fallback={null}>
          <MonthlyFuelType report={report} />
        </Suspense>{" "}
        registrations as a share of all new cars that month.
      </SourceNote>
    </section>
  );
}
