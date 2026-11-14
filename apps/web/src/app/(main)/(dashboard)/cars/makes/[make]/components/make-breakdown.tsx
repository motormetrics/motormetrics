import { Skeleton } from "@heroui/react";
import type { MakeSectionProps } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { MixTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { percentageChange } from "@web/utils/change-ratio";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";
import { Suspense } from "react";

async function BreakdownCaption({ report }: Pick<MakeSectionProps, "report">) {
  const { periodCaption } = await report;

  return `${periodCaption} · against the same months a year earlier`;
}

async function BreakdownTable({ make, report }: MakeSectionProps) {
  const { fuelType, mixRows, total } = await report;

  return (
    <>
      <MixTable
        rows={mixRows.map(
          ({ count, fuelType: rowFuelType, previous, rank, vehicleType }) => ({
            change: percentageChange(count, previous),
            count,
            fuelType: rowFuelType,
            rank,
            vehicleType: formatVehicleType(vehicleType),
          }),
        )}
        total={total}
      />
      <SourceNote>
        Share is of {total.toLocaleString("en-SG")}{" "}
        {fuelType ? `${fuelType} ` : ""}
        {make} registrations in the period. Change compares against the same
        months a year earlier.
      </SourceNote>
    </>
  );
}

/**
 * The make's registrations by fuel type × vehicle type cell, against the same
 * months a year earlier. The heading is in the static shell; the caption and
 * the table wait behind their own boundaries.
 */
export function MakeBreakdown({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={" "}>
            <BreakdownCaption report={report} />
          </Suspense>
        }
        eyebrow="Breakdown"
        title="Fuel type and vehicle type"
      />
      <Suspense fallback={<Skeleton className="h-96 w-full" />}>
        <BreakdownTable make={make} report={report} />
      </Suspense>
    </section>
  );
}
