import { Typography } from "@heroui/react";
import { PopulationChart } from "@web/app/(main)/(dashboard)/cars/annual/components/population-chart";
import {
  type PopulationEntity,
  summarisePopulation,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { axisTicks } from "@web/app/(main)/(dashboard)/components/overview-series";
import { SectionHead, SourceNote } from "@web/components/shared/overview";

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
  const ticks = axisTicks(entity.series, { zero: false });
  const step = (ticks[1] ?? 0) - (ticks[0] ?? 0);
  const name = entity.name.toLowerCase();
  const summary = summarisePopulation(entity, years);

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${years[0]} to ${years.at(-1)} · at 31 December each year · hover or tap for values`}
        eyebrow="Trend"
        title={`${entity.name} on the road by year`}
      />
      <PopulationChart data={data} ticks={ticks} />
      {summary ? (
        <Typography.Paragraph className="tabular-nums" color="muted" size="sm">
          {summary}
        </Typography.Paragraph>
      ) : null}
      <SourceNote>
        Source: LTA via DataMall · {entity.name} registered at 31 December ·
        Y-axis does not start at zero
        {step > 0
          ? `; gridlines every ${step.toLocaleString("en-SG")} ${name}`
          : ""}
        .
      </SourceNote>
    </section>
  );
}
