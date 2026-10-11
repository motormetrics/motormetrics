import { Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The page's opening figure: how many cars were on the road at the latest
 * year end, how that moved on the year before, and their share of every
 * vehicle on the road.
 */
export function PopulationHeadline({
  allVehicles,
  entity,
  previousYear,
}: {
  /** Every class summed at the latest year end. */
  allVehicles: number;
  entity: PopulationEntity;
  previousYear: string | null;
}) {
  const total = entity.series.at(-1) ?? 0;
  const previous = entity.series.at(-2) ?? 0;
  const difference = total - previous;
  const sign = difference < 0 ? "−" : "+";

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <span className="font-semibold text-muted text-xs">
        {entity.name} on the road
      </span>
      <span className="font-extrabold text-5xl tabular-nums leading-none tracking-tight md:text-6xl">
        <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
      </span>
      {previousYear !== null && previous > 0 ? (
        <Typography.Paragraph className="text-muted-strong tabular-nums">
          <span className="font-semibold text-foreground">
            {`${sign}${Math.abs((difference / previous) * 100).toFixed(1)}%`}
          </span>{" "}
          ({sign}
          {formatCount(Math.abs(difference))}) vs {previousYear} at{" "}
          {formatCount(previous)}
        </Typography.Paragraph>
      ) : null}
      <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
        {allVehicles > 0
          ? `${((total / allVehicles) * 100).toFixed(1)}% of ${formatCount(allVehicles)} vehicles · `
          : null}
        growth rate capped at 0% since February 2018
      </Typography.Paragraph>
    </div>
  );
}
