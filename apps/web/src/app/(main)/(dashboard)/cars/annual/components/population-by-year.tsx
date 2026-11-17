import { PopulationChart } from "@web/app/(main)/(dashboard)/cars/annual/components/population-chart";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";

/**
 * Every year end on record as a line. The series is computed on the server
 * and the chart is only a client island for its hover tooltip.
 */
export function PopulationByYear({
  entity,
  years,
}: {
  entity: PopulationEntity;
  years: string[];
}) {
  const data = years.map((year, index) => {
    const population = entity.series[index] ?? 0;
    const previous = entity.series[index - 1];
    return {
      change:
        previous === undefined || previous === 0
          ? undefined
          : (population - previous) / previous,
      population,
      year,
    };
  });

  return (
    <PopulationChart
      data={data}
      ticks={axisTicks(entity.series, { zero: false })}
    />
  );
}
