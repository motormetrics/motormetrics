import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { formatDateToMonthYear } from "@motormetrics/utils/format-date-to-month-year";
import { periodLabel } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/period";
import type { Range } from "@web/app/(main)/(dashboard)/cars/makes/[make]/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { percentageChange } from "@web/utils/change-ratio";

/** The make against the whole market month by month, newest first, the selected month shaded. */
export function MakeMonthlyTable({
  fuelType,
  make,
  month,
  series,
  seriesRange,
}: {
  fuelType: string | null;
  make: string;
  month: string;
  series: { count: number; market: number; month: string; share: number }[];
  seriesRange: Range;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-6">
      <SectionHead
        caption={`${periodLabel(month, seriesRange)}, newest first`}
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
        {series
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
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={count}
                />
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
          ))}
      </div>
      <SourceNote>
        Share is {make}
        {fuelType ? ` ${fuelType}` : ""} registrations as a share of all new
        cars that month.
      </SourceNote>
    </section>
  );
}
