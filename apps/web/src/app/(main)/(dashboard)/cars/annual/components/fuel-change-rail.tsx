import { NumberValue } from "@heroui-pro/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import Typography from "@web/components/typography";

/** Fuel types listed before the rail runs longer than the column beside it. */
const RAIL_ROWS = 6;

/**
 * The rail's opening block: how each fuel type of the focused entity moved
 * over the year, against the donut's snapshot of where it stands now.
 */
export function FuelChangeRail({
  entity,
  previousYear,
}: {
  entity: PopulationEntity;
  previousYear: string | null;
}) {
  const rows = entity.fuel.filter((row) => row.value > 0).slice(0, RAIL_ROWS);
  if (rows.length === 0) {
    return null;
  }

  const largest = Math.max(...rows.map((row) => row.value), 1);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-1">
        <Typography.TextSm>Year on year</Typography.TextSm>
        <Typography.H3>Fuel type change</Typography.H3>
      </div>

      <ul className="flex flex-col gap-2">
        {rows.map((row, index) => {
          const change =
            previousYear === null || row.previous === 0
              ? null
              : (row.value - row.previous) / row.previous;

          return (
            <li
              className="flex flex-col gap-1 rounded-[1.375rem] bg-surface px-[18px] py-[15px]"
              key={row.label}
            >
              <div className="flex items-center gap-2.5">
                <span className="truncate font-bold text-base">
                  {row.label}
                </span>
                {change === null ? null : (
                  <span className="shrink-0 font-bold text-muted text-sm tabular-nums">
                    {change >= 0 ? "+" : "−"}
                    {Math.abs(change * 100).toFixed(1)}%
                  </span>
                )}
                <span className="ml-auto font-extrabold text-base tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.value}
                  />
                </span>
              </div>
              <span className="block h-2 overflow-hidden rounded-full bg-default">
                <span
                  className="block h-full rounded-full"
                  style={{
                    background: `var(--chart-${index + 1})`,
                    width: `${((row.value / largest) * 100).toFixed(1)}%`,
                  }}
                />
              </span>
            </li>
          );
        })}
      </ul>

      {previousYear === null ? null : (
        <Typography.Caption>Change on {previousYear}</Typography.Caption>
      )}
    </div>
  );
}
