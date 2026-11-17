import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";

/** Years of the electric run-up listed. */
export const FLEET_YEARS = 6;

/**
 * Electric cars on the road at each recent year end, as a ruled list of bars
 * on one zero-based scale, the latest year darker. Renders nothing while the
 * fleet is still at zero.
 */
export function ElectricFleet({
  entity,
  years,
}: {
  entity: PopulationEntity;
  years: string[];
}) {
  if ((entity.electric.at(-1) ?? 0) === 0) {
    return null;
  }

  const rows = years
    .map((year, index) => ({ value: entity.electric[index] ?? 0, year }))
    .slice(-FLEET_YEARS);
  const largest = Math.max(...rows.map((row) => row.value), 1);
  const lastIndex = rows.length - 1;

  return (
    <ul
      aria-label={`Electric ${entity.name.toLowerCase()} on the road at year end`}
      className="flex flex-col"
    >
      {rows.map((row, index) => (
        <li className="flex items-center gap-4 py-2" key={row.year}>
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
  );
}
