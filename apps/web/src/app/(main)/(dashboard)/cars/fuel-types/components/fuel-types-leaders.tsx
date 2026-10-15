import { percentageOf } from "@web/app/(main)/(dashboard)/cars/fuel-types/components/fuel-types-shared";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import type { CategoryLeader } from "@web/queries/cars/category-report";

/** The top three makes within each fuel type for the period. */
export function FuelTypesLeaders({
  leaders,
  periodLabel,
}: {
  leaders: CategoryLeader[];
  periodLabel: string;
}) {
  return (
    <section className="flex min-w-0 flex-col gap-4 lg:col-span-4">
      <SectionHead
        caption={`${periodLabel} · top three makes in each`}
        eyebrow="Makes"
        title="Leading makes by fuel type"
      />
      <ul className="flex flex-col">
        {leaders.map(({ makes, name, total: typeTotal }) => (
          <li
            className="flex flex-wrap items-baseline gap-x-4 gap-y-1 border-separator border-b py-3"
            key={name}
          >
            <span className="w-44 shrink-0 font-semibold text-sm max-md:w-auto max-md:flex-1">
              {name}
            </span>
            <span className="min-w-0 flex-1 text-muted-strong text-sm max-md:order-last max-md:basis-full">
              {makes.map(({ make }) => make).join(", ") || "—"}
            </span>
            {makes[0] ? (
              <span className="whitespace-nowrap text-right text-muted text-xs tabular-nums">
                {makes[0].make}{" "}
                {percentageOf(makes[0].count, typeTotal).toFixed(1)}% of {name}
              </span>
            ) : null}
          </li>
        ))}
      </ul>
      <SourceNote>
        Share is of that fuel type's registrations in the period.
      </SourceNote>
    </section>
  );
}
