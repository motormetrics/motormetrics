import { NumberValue } from "@heroui-pro/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { BarRow } from "@web/components/shared/bar-row";
import { SectionHead } from "@web/components/shared/overview";

/** Years of the electric run-up listed under the headline figure. */
const FLEET_YEARS = 4;

/**
 * How much of the car population is electric at the latest year end, and how
 * quickly it got there. Renders nothing while the fleet is still at zero.
 */
export function ElectricFleet({
  entity,
  years,
}: {
  entity: PopulationEntity;
  years: string[];
}) {
  const electric = entity.electric.at(-1) ?? 0;
  if (electric === 0) {
    return null;
  }

  const population = entity.series.at(-1) ?? 0;
  const rows = years
    .map((year, index) => ({ value: entity.electric[index] ?? 0, year }))
    .slice(-FLEET_YEARS);
  const largest = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`Electric ${entity.name.toLowerCase()} on the road at year end`}
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="Electric fleet"
      />

      <div className="flex flex-wrap items-center gap-3.5">
        <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight lg:text-[52px]">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={electric}
          />
        </span>
        {population > 0 ? (
          <span className="inline-flex items-center rounded-full bg-accent-soft px-3.5 py-2 font-bold text-accent-strong text-sm">
            {((electric / population) * 100).toFixed(1)}% of{" "}
            {entity.name.toLowerCase()}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-3.5">
        {rows.map((row, index) => (
          <BarRow
            color={
              index === rows.length - 1 ? "var(--chart-1)" : "var(--chart-5)"
            }
            key={row.year}
            label={row.year}
            share={(row.value / largest) * 100}
            value={
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={row.value}
              />
            }
          />
        ))}
      </div>
    </div>
  );
}
