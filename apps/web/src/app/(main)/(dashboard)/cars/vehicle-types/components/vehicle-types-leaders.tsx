import { percentageOf } from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/vehicle-types-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { CategoryLeader } from "@web/queries/cars/category-report";
import { formatVehicleType } from "@web/utils/formatting/format-vehicle-type";

/** The top three makes within each vehicle type for the period. */
export function VehicleTypesLeaders({
  leaders,
  periodLabel,
}: {
  leaders: CategoryLeader[];
  periodLabel: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-4">
      <SectionHead
        caption={`${periodLabel} · top three makes in each type`}
        eyebrow="Makes"
        title="Leading makes by vehicle type"
      />
      <ul className="flex flex-col">
        {leaders.map(({ makes, name, total: typeTotal }) => (
          <li
            className="flex items-baseline gap-4 border-separator border-b py-3 max-md:flex-col max-md:gap-0.5"
            key={name}
          >
            <span className="w-40 shrink-0 font-semibold text-sm">
              {formatVehicleType(name)}
            </span>
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="text-sm">
                {makes.map(({ make }) => make).join(", ") || "—"}
              </span>
              {makes[0] ? (
                <span className="text-subtle text-xs tabular-nums">
                  {makes[0].make}{" "}
                  {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of{" "}
                  {formatVehicleType(name)}
                </span>
              ) : null}
            </span>
          </li>
        ))}
      </ul>
      <SourceNote>
        Share is the leading make's share of that vehicle type's registrations.
      </SourceNote>
    </section>
  );
}
