import { NumberValue } from "@heroui-pro/react";
import {
  changeRatio,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Headline } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";

/**
 * The page's opening figure: how many cars were on the road at the latest
 * year end, how that moved on the year before, and the run of years beneath.
 */
export function PopulationHeadline({
  entity,
  previousYear,
  year,
  years,
}: {
  entity: PopulationEntity;
  previousYear: string | null;
  year: string;
  years: string[];
}) {
  const total = entity.series.at(-1) ?? 0;
  const change = changeRatio(entity.series);
  const firstYear = years[0];

  return (
    <div className="flex flex-col gap-2.5">
      <Headline
        caption={
          <>
            registered at 31 December {year}
            {change === null || previousYear === null ? null : (
              <>
                {" · "}
                {change < 0 ? "down" : "up"} on {previousYear}
              </>
            )}
            {" · "}growth rate capped at 0% since February 2018
          </>
        }
        delta={change === null ? null : <DeltaChip value={change * 100} />}
        label={`${entity.name} on the road`}
        value={
          <NumberValue locale="en-SG" maximumFractionDigits={0} value={total} />
        }
      />
      <SparklineChart
        className="mt-2"
        title={`${entity.name} population from ${firstYear} to ${year}`}
        values={entity.series}
      />
      {years.length > 1 ? (
        <div className="flex justify-between font-semibold text-muted text-xs">
          <span>{firstYear}</span>
          <span>{year}</span>
        </div>
      ) : null}
    </div>
  );
}
