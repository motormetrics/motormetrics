import { Typography } from "@heroui/react";
import {
  ELECTRIC,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SurfaceCard } from "@web/components/shared/bento";
import {
  DonutGauge,
  type DonutSegment,
} from "@web/components/shared/donut-gauge";

/**
 * Fuel types shown individually before the tail is folded into "Others". The
 * skin carries six chart colours, so five named slices leave one for the tail.
 */
const NAMED_SEGMENTS = 5;

const OTHERS = "Others";

/**
 * The focused entity's fuel mix at the selected year end. Labels are LTA's own
 * — "Petrol-Electric" and "Petrol-Electric (Plug-In)" stay apart rather than
 * being folded into a "hybrid" bucket LTA does not publish.
 */
export function PopulationFuelMix({
  entity,
  year,
}: {
  entity: PopulationEntity;
  year: string;
}) {
  const ranked = entity.fuel.filter((row) => row.value > 0);
  const total = ranked.reduce((sum, row) => sum + row.value, 0);
  const electric = ranked.find((row) => row.label === ELECTRIC)?.value ?? 0;

  const segments: DonutSegment[] = ranked
    .slice(0, NAMED_SEGMENTS)
    .map((row, index) => ({
      color: `var(--chart-${index + 1})`,
      label: row.label,
      value: row.value,
    }));

  const tailTotal = ranked
    .slice(NAMED_SEGMENTS)
    .reduce((sum, row) => sum + row.value, 0);

  if (tailTotal > 0) {
    // LTA publishes an "Others" fuel of its own, so the tail joins that slice
    // where it is already named rather than drawing a second one.
    const existing = segments.find((segment) => segment.label === OTHERS);
    if (existing) {
      existing.value += tailTotal;
    } else {
      segments.push({
        color: `var(--chart-${NAMED_SEGMENTS + 1})`,
        label: OTHERS,
        value: tailTotal,
      });
    }
  }

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-1">
        <Typography.Paragraph color="muted" size="sm">
          Fuel mix
        </Typography.Paragraph>
        <Typography.Heading level={3}>
          {entity.name} by fuel type
        </Typography.Heading>
      </div>

      {segments.length > 0 ? (
        <DonutGauge
          caption="electric"
          centre={`${total > 0 ? ((electric / total) * 100).toFixed(1) : "0.0"}%`}
          segments={segments}
          title={`${entity.name} by fuel type, ${year}`}
        />
      ) : (
        <Typography.Paragraph color="muted" size="sm">
          LTA published the {year} count for {entity.name} without a fuel split.
        </Typography.Paragraph>
      )}
    </SurfaceCard>
  );
}
