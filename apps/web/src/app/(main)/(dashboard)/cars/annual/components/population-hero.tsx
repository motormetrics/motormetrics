import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  changeRatio,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { HeroCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { sparkline } from "@web/components/shared/sparkline";

/**
 * The gradient hero: how many of the focused vehicle type or make were on the
 * road at the selected year end, and how that moved on the year before.
 */
export function PopulationHero({
  entity,
  noun,
  previousYear,
  year,
  years,
}: {
  entity: PopulationEntity;
  /** What the figure counts — "vehicles" or "cars". */
  noun: string;
  previousYear: string | null;
  year: string;
  years: string[];
}) {
  const total = entity.series.at(-1) ?? 0;
  const change = changeRatio(entity.series);
  const spark = sparkline(entity.series, 380, 90);

  return (
    <HeroCard>
      <span className="w-fit rounded-full bg-accent-foreground/20 px-4 py-2 font-bold text-sm">
        {entity.name} · {year}
      </span>

      <div className="flex flex-wrap items-center gap-4">
        <span className="font-extrabold text-6xl tabular-nums tracking-tight">
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
        </span>
        {change === null ? null : (
          <DeltaChip tone="inverse" value={change * 100} />
        )}
      </div>

      <Typography.Paragraph className="text-accent-foreground/85">
        registered {noun}
        {change === null || previousYear === null ? null : (
          <>
            {" · "}
            {change < 0 ? "down" : "up"} on {previousYear}
          </>
        )}
      </Typography.Paragraph>

      {spark ? (
        <svg
          className="h-[90px] w-full overflow-visible"
          role="img"
          viewBox="0 0 380 90"
        >
          <title>{`${entity.name} population from ${years[0]} to ${year}`}</title>
          <path d={spark.area} fill="currentColor" opacity={0.16} />
          <path
            d={spark.line}
            fill="none"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={3.5}
          />
          <circle
            cx={spark.lastX}
            cy={spark.lastY}
            fill="var(--accent)"
            r={6}
            stroke="currentColor"
            strokeWidth={3.5}
          />
        </svg>
      ) : null}

      <div className="flex items-center gap-4 rounded-field bg-foreground/70 px-6 py-5">
        <div className="flex min-w-0 flex-col gap-0.5">
          <Typography.Paragraph
            color="muted"
            className="text-accent-foreground"
          >
            Growth capped at 0%
          </Typography.Paragraph>
          <Typography.Paragraph
            color="muted"
            size="xs"
            className="text-accent-foreground/70"
          >
            LTA has held the vehicle growth rate for cars and motorcycles at 0%
            since February 2018
          </Typography.Paragraph>
        </div>
      </div>
    </HeroCard>
  );
}
