import { MonthTable } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/month-table";
import { periodRange } from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/period";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeMonthlyPoint } from "@web/queries/cars/type-detail";

/** The vehicle type against the whole market, month by month, newest first. */
export function VehicleTypeMonthly({
  displayName,
  month,
  series,
}: {
  displayName: string;
  month: string;
  series: TypeMonthlyPoint[];
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-6">
      <SectionHead
        caption={`${periodRange("12m", month)}, newest first`}
        eyebrow="Month by month"
        title={`${displayName} against the whole market`}
      />
      <MonthTable
        rows={[...series].reverse()}
        selectedMonth={month}
        vehicleType={displayName}
      />
      <SourceNote>
        Share is {displayName} registrations as a share of all new cars that
        month.
      </SourceNote>
    </section>
  );
}
