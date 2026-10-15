import {
  type MonthlyRow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-shared";
import { MonthTable } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/month-table";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatMonthLabel } from "@web/utils/dates/format-month";

/** Each month's share for the charted fuel types, newest first. */
export function FuelTypesMonthly({
  fuelTypes,
  month,
  monthlyRows,
  omittedMonthlyMax,
  omittedTypes,
}: {
  /** Column order, matching `cells` in each row. */
  fuelTypes: string[];
  month: string;
  /** Oldest first. */
  monthlyRows: MonthlyRow[];
  omittedMonthlyMax: number;
  omittedTypes: string[];
}) {
  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${SERIES_MONTHS} months to ${formatMonthLabel(month)}`}
        eyebrow="Month by month"
        title="Share of each month's registrations"
      />
      <MonthTable
        fuelTypes={fuelTypes}
        rows={[...monthlyRows].reverse()}
        selectedMonth={month}
      />
      <SourceNote>
        Share of all new car registrations in each month, with the number of
        cars.
        {omittedTypes.length > 0
          ? ` ${omittedTypes.join(", ")} ${omittedTypes.length === 1 ? "is" : "are"} not shown: no more than ${omittedMonthlyMax.toLocaleString("en-SG")} ${omittedMonthlyMax === 1 ? "car was" : "cars were"} registered in any of these months.`
          : null}
      </SourceNote>
    </section>
  );
}
