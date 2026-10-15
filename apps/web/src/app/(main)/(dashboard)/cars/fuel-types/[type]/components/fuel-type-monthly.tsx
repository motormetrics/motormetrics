import { MonthTable } from "@web/app/(main)/(dashboard)/cars/fuel-types/[type]/components/month-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { TypeMonthlyPoint } from "@web/queries/cars/type-detail";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** The fuel type against the whole market, month by month, newest first. */
export function FuelTypeMonthly({
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
        caption={`${series.length} months to ${formatMonthLabel(month)}`}
        eyebrow="Month by month"
        title={`${value} against the whole market`}
      />
      <MonthTable
        fuelType={value}
        rows={[...series].reverse()}
        selectedMonth={month}
      />
      <SourceNote>
        Share is {value} registrations as a share of all new cars that month;
        bars run from 0 to 100%. Change is in {value} registrations against the
        previous month.
      </SourceNote>
    </section>
  );
}
