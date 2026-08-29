import { NumberValue } from "@heroui-pro/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { InkPanel } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { Zap } from "lucide-react";

/** Years of the electric run-up listed under the headline figure. */
const PANEL_YEARS = 4;

/**
 * The rail's closing ink panel: how much of the focused entity's population is
 * electric, and how quickly it got there.
 */
export function ElectricFleetPanel({
  entity,
  noun,
  years,
}: {
  entity: PopulationEntity;
  /** What the figures count — "vehicles" or "cars". */
  noun: string;
  years: string[];
}) {
  const electric = entity.electric.at(-1) ?? 0;
  if (electric === 0) {
    return null;
  }

  const population = entity.series.at(-1) ?? 0;
  const rows = years
    .map((year, index) => ({ value: entity.electric[index] ?? 0, year }))
    .slice(-PANEL_YEARS);
  const largest = Math.max(...rows.map((row) => row.value), 1);

  return (
    <InkPanel>
      <div className="flex items-center gap-2.5">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-accent-on-dark/20 text-accent-on-dark">
          <Zap aria-hidden className="size-5" />
        </span>
        <Typography.TextSm className="font-semibold text-accent-foreground/85">
          Electric fleet
        </Typography.TextSm>
      </div>

      <span className="font-extrabold text-5xl text-accent-on-dark tabular-nums tracking-[-0.03em]">
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={electric}
        />
      </span>

      <Typography.TextSm className="font-medium text-accent-foreground/60">
        electric {noun} on the road
        {population > 0
          ? ` · ${((electric / population) * 100).toFixed(1)}% of ${entity.name}`
          : null}
      </Typography.TextSm>

      <ul className="mt-2 flex flex-col gap-3">
        {rows.map((row, index) => (
          <li className="flex flex-col gap-1.5" key={row.year}>
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[14.5px] text-accent-foreground/85">
                {row.year}
              </span>
              <span className="ml-auto font-bold text-[14.5px] text-accent-foreground tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={row.value}
                />
              </span>
            </div>
            <span className="block h-2 overflow-hidden rounded-full bg-accent-foreground/10">
              <span
                className="block h-full rounded-full bg-accent-on-dark"
                style={{
                  opacity: index === rows.length - 1 ? 1 : 0.45,
                  width: `${((row.value / largest) * 100).toFixed(1)}%`,
                }}
              />
            </span>
          </li>
        ))}
      </ul>
    </InkPanel>
  );
}
