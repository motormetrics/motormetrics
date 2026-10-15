import {
  MonthTable,
  PHONE_COLUMNS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/month-table";
import {
  type MonthlyRow,
  SERIES_MONTHS,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { formatMonthLabel } from "@web/utils/dates/format-month";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/** Each month's share for the charted vehicle types, newest first. */
export function VehicleTypesMonthly({
  month,
  monthlyRows,
  vehicleTypes,
}: {
  month: string;
  /** Oldest first. */
  monthlyRows: MonthlyRow[];
  /** Column order, matching `cells` in each row. */
  vehicleTypes: string[];
}) {
  // Phones keep the leading types only; the source note names the rest.
  const phoneHiddenTypes = vehicleTypes
    .slice(PHONE_COLUMNS)
    .map((name) => formatVehicleType(name));

  return (
    <section className="flex flex-col gap-4">
      <SectionHead
        caption={`${SERIES_MONTHS} months to ${formatMonthLabel(month)}, newest first`}
        eyebrow="Month by month"
        title="Share of each month's registrations"
      />
      <MonthTable
        rows={[...monthlyRows].reverse()}
        selectedMonth={month}
        vehicleTypes={vehicleTypes}
      />
      <SourceNote>
        Share of each month's new car registrations, with the car count beneath
        on wider screens.
        {phoneHiddenTypes.length > 0
          ? ` ${phoneHiddenTypes.join(", ")} and the monthly total are hidden on small screens.`
          : " The monthly total is hidden on small screens."}
      </SourceNote>
    </section>
  );
}
