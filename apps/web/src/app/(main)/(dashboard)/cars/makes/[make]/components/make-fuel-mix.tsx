import { Skeleton } from "@heroui/react";
import type {
  MakeReportData,
  MakeSectionProps,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/make-report";
import { percentage } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/percentage";
import {
  BarHeader,
  BarRow,
} from "@web/app/(main)/(dashboard)/cars/makes/components/bar-row";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { Suspense } from "react";

async function MixCaption({ report }: Pick<MakeSectionProps, "report">) {
  const { periodCaption } = await report;

  return periodCaption;
}

/** One bar per fuel type or vehicle type, against the largest. */
async function MixRows({
  heading,
  mix,
  report,
}: Pick<MakeSectionProps, "report"> & {
  heading: string;
  mix: "fuelMix" | "vehicleMix";
}) {
  const data: MakeReportData = await report;
  const rows = data[mix];
  const leader = rows[0]?.count || 1;

  return (
    <div className="flex flex-col">
      <BarHeader label={heading} trailing="Share" value="Cars" />
      {rows.map((row) => (
        <BarRow
          key={row.name}
          label={
            <span className="flex min-w-0 flex-col">
              <span className="truncate font-semibold">{row.name}</span>
              {"note" in row ? (
                <span className="truncate text-muted text-xs">{row.note}</span>
              ) : null}
            </span>
          }
          percent={(row.count / leader) * 100}
          trailing={percentage(row.count, data.makeTotal)}
          value={row.count.toLocaleString("en-SG")}
        />
      ))}
    </div>
  );
}

/**
 * Every fuel type the make registered in the period. The heading and the note
 * are in the static shell; the caption and the rows wait behind their own
 * boundaries.
 */
export function MakeFuelMix({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4" id="make-fuel-types">
      <SectionHead
        caption={
          // A non-breaking space holds the caption's line until it arrives.
          <Suspense fallback={" "}>
            <MixCaption report={report} />
          </Suspense>
        }
        title="By fuel type"
      />
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <MixRows heading="Fuel type" mix="fuelMix" report={report} />
      </Suspense>
      <SourceNote>
        Share of every {make} registered in the period: all fuel types, whatever
        the fuel type filter is set to.
      </SourceNote>
    </section>
  );
}

/** Every vehicle type the make registered in the period, as `MakeFuelMix`. */
export function MakeVehicleMix({ make, report }: MakeSectionProps) {
  return (
    <section className="flex min-w-0 flex-col gap-4" id="make-vehicle-types">
      <SectionHead
        caption={
          <Suspense fallback={" "}>
            <MixCaption report={report} />
          </Suspense>
        }
        title="By vehicle type"
      />
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <MixRows heading="Vehicle type" mix="vehicleMix" report={report} />
      </Suspense>
      <SourceNote>
        Share of every {make} registered in the period: all fuel types, whatever
        the fuel type filter is set to.
      </SourceNote>
    </section>
  );
}
