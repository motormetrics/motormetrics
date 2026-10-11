import { NumberValue } from "@heroui-pro/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

/** Years of the electric run-up listed under the headline figure. */
const FLEET_YEARS = 4;

/**
 * How much of the car population is electric at the latest year end, and how
 * quickly it got there, as a ruled list of bars on one zero-based scale.
 * Renders nothing while the fleet is still at zero.
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
  const name = entity.name.toLowerCase();
  const rows = years
    .map((year, index) => ({ value: entity.electric[index] ?? 0, year }))
    .slice(-FLEET_YEARS);
  const largest = Math.max(...rows.map((row) => row.value), 1);
  const lastIndex = rows.length - 1;

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`Electric ${name} on the road at year end`}
        eyebrow="Electric vehicles"
        link={{ href: "/cars/electric-vehicles", label: "All electric data" }}
        title="Electric fleet"
      />

      <div className="flex items-baseline gap-3">
        <span className="font-semibold text-3xl tabular-nums tracking-tight">
          <NumberValue
            locale="en-SG"
            maximumFractionDigits={0}
            value={electric}
          />
        </span>
        {population > 0 ? (
          <span className="text-muted-strong text-sm tabular-nums">
            {((electric / population) * 100).toFixed(1)}% of {name}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col">
        <div className="flex items-end gap-3 border-border border-b pb-2 font-semibold text-muted text-xs">
          <span className="w-12">Year</span>
          <span className="min-w-0 flex-1" />
          <span className="w-16 text-right">{entity.name}</span>
        </div>
        <ul className="flex flex-col">
          {rows.map((row, index) => (
            <li
              className="flex items-center gap-3 border-separator border-b py-2.5"
              key={row.year}
            >
              <span
                className={
                  index === lastIndex
                    ? "w-12 font-semibold text-sm tabular-nums"
                    : "w-12 text-muted text-sm tabular-nums"
                }
              >
                {row.year}
              </span>
              <span className="h-2.5 min-w-0 flex-1 rounded-r-sm bg-surface-secondary">
                <span
                  className="block h-full rounded-r-sm"
                  style={{
                    backgroundColor:
                      index === lastIndex ? "var(--chart-1)" : "var(--chart-5)",
                    width: `${(row.value / largest) * 100}%`,
                  }}
                />
              </span>
              <span className="w-16 text-right font-semibold text-sm tabular-nums">
                {row.value.toLocaleString("en-SG")}
              </span>
            </li>
          ))}
        </ul>
      </div>

      <SourceNote>
        Electric {name} on the road at 31 December, {rows[0]?.year} to{" "}
        {rows[lastIndex]?.year}. Bars share one zero-based scale.
      </SourceNote>
    </section>
  );
}
