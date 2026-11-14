import { Skeleton, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { percentageChange } from "@web/utils/change-ratio";
import { Suspense } from "react";

type ReportProps = Pick<MakeSectionProps, "report">;

/** "Electric " ahead of the make in the label, when a fuel type is selected. */
async function HeadlineFuelType({ report }: ReportProps) {
  const { fuelType } = await report;

  return fuelType ? `${fuelType} ` : null;
}

async function HeadlineTotal({ report }: ReportProps) {
  const { total } = await report;

  return <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />;
}

async function HeadlineChange({ report }: ReportProps) {
  const { previousTotal, total } = await report;

  return (
    <DeltaChip
      className="font-semibold text-foreground"
      value={percentageChange(total, previousTotal)}
    />
  );
}

/** "Year to date · 5.1% of all registrations", under the change. */
async function HeadlineShare({ make, report }: MakeSectionProps) {
  const { fuelType, makeTotal, marketTotal, rangeLabel, total } = await report;

  return fuelType
    ? `${rangeLabel} · ${percentage(total, makeTotal)} of ${make} registrations`
    : `${rangeLabel} · ${percentage(total, marketTotal)} of all registrations`;
}

async function HeadlineStats({ report }: ReportProps) {
  const { stats } = await report;

  return stats.map((stat) => (
    <div
      className="flex min-w-0 flex-col gap-1 border-separator border-b py-3.5 pr-4 even:border-l even:pl-4"
      key={stat.label}
    >
      <span className="truncate font-semibold text-muted text-xs">
        {stat.label}
      </span>
      <span className="font-semibold text-xl tabular-nums tracking-tight md:text-2xl">
        {stat.value}
      </span>
      <span className="truncate text-muted text-xs">{stat.note}</span>
    </div>
  ));
}

/**
 * The make's registrations for the period, with the two-by-two stat grid
 * beside them. The label and the wording are in the static shell; each figure
 * waits behind its own boundary.
 */
export function MakeHeadline({ make, report }: MakeSectionProps) {
  return (
    <div className="grid grid-cols-1 items-end gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="flex min-w-0 flex-col gap-3">
        <span className="font-semibold text-muted text-xs">
          <Suspense fallback={null}>
            <HeadlineFuelType report={report} />
          </Suspense>
          {make} registrations
        </span>
        <div className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
          <Suspense fallback={<Skeleton className="h-12 w-40 md:h-14" />}>
            <HeadlineTotal report={report} />
          </Suspense>
        </div>
        <Typography.Paragraph color="muted">
          <Suspense fallback={null}>
            <HeadlineChange report={report} />
          </Suspense>{" "}
          against the same period a year earlier
        </Typography.Paragraph>
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {/* A non-breaking space holds the line until the share arrives. */}
          <Suspense fallback={" "}>
            <HeadlineShare make={make} report={report} />
          </Suspense>
        </Typography.Paragraph>
      </div>
      <div className="grid grid-cols-2 border-border border-t">
        <Suspense fallback={<Skeleton className="col-span-2 h-48 w-full" />}>
          <HeadlineStats report={report} />
        </Suspense>
      </div>
    </div>
  );
}
