import { MixTable } from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { percentageChange } from "@web/utils/change-ratio";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/** The make's registrations by fuel type × vehicle type cell, against the same months a year earlier. */
export function MakeBreakdown({
  fuelType,
  make,
  mixRows,
  periodCaption,
  total,
}: {
  fuelType: string | null;
  make: string;
  mixRows: {
    count: number;
    fuelType: string;
    previous: number;
    rank: number;
    vehicleType: string;
  }[];
  periodCaption: string;
  total: number;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${periodCaption} · against the same months a year earlier`}
        eyebrow="Breakdown"
        title="Fuel type and vehicle type"
      />
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
    </section>
  );
}
