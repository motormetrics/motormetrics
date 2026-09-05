import { Typography } from "@heroui/react";
import {
  ELECTRIC,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";

const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc length removed from each segment so the rounded caps read as separate. */
const SEGMENT_GAP = 16;

/**
 * Fuel types shown individually before the tail is folded into "Others". The
 * skin carries six chart colours, so five named slices leave one for the tail.
 */
const NAMED_SEGMENTS = 5;

const OTHERS = "Others";

interface Segment {
  color: string;
  label: string;
  value: number;
}

/**
 * The fuel mix at the latest year end: a gapped-segment ring with the legend
 * beside it, as the v3 comp lays it out. `shared/donut-gauge.tsx` stacks its
 * legend underneath, so the ring is composed here instead.
 *
 * Labels are LTA's own — "Petrol-Electric" and "Petrol-Electric (Plug-In)"
 * stay apart rather than being folded into a "hybrid" bucket LTA does not
 * publish.
 */
export function FuelMixRing({
  entity,
  year,
}: {
  entity: PopulationEntity;
  year: string;
}) {
  const ranked = entity.fuel.filter((row) => row.value > 0);
  const total = ranked.reduce((sum, row) => sum + row.value, 0);
  const electric = ranked.find((row) => row.label === ELECTRIC)?.value ?? 0;

  const segments: Segment[] = ranked
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

  let consumed = 0;
  const arcs = segments.map((segment) => {
    const full = (segment.value / (total || 1)) * CIRCUMFERENCE;
    // Floor at 2px so a rounding-to-zero share still shows as a tick rather
    // than vanishing, which would silently drop it from the ring.
    const dash = Math.max(2, full - SEGMENT_GAP);
    const arc = {
      color: segment.color,
      dashArray: `${dash.toFixed(2)} ${(CIRCUMFERENCE - dash).toFixed(2)}`,
      dashOffset: (-(consumed + SEGMENT_GAP / 2)).toFixed(2),
      key: segment.label,
    };
    consumed += full;
    return arc;
  });

  return (
    <div className="flex flex-col gap-2.5">
      <Typography.Paragraph className="font-semibold text-muted-strong text-xl">
        Fuel mix
      </Typography.Paragraph>
      <Typography.Paragraph className="font-medium" color="muted">
        {entity.name} by fuel type
      </Typography.Paragraph>

      {segments.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm">
          LTA published the {year} count for {entity.name} without a fuel split.
        </Typography.Paragraph>
      ) : (
        <div className="mt-2 flex flex-wrap items-center gap-9">
          <div className="relative size-[172px] shrink-0">
            <svg className="block" role="img" viewBox="0 0 190 190">
              <title>{`${entity.name} by fuel type, ${year}`}</title>
              <g transform="rotate(-90 95 95)">
                {arcs.map((arc) => (
                  <circle
                    cx={95}
                    cy={95}
                    fill="none"
                    key={arc.key}
                    r={RADIUS}
                    stroke={arc.color}
                    strokeDasharray={arc.dashArray}
                    strokeDashoffset={arc.dashOffset}
                    strokeLinecap="round"
                    strokeWidth={24}
                  />
                ))}
              </g>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
              <span className="font-extrabold text-[33px] tabular-nums tracking-tight">
                {total > 0 ? ((electric / total) * 100).toFixed(1) : "0.0"}%
              </span>
              <Typography.Paragraph
                className="font-semibold"
                color="muted"
                size="sm"
              >
                electric
              </Typography.Paragraph>
            </div>
          </div>

          <ul className="flex min-w-40 flex-1 flex-col gap-3">
            {segments.map((segment) => (
              <li className="flex items-center gap-2.5" key={segment.label}>
                <span
                  aria-hidden
                  className="size-[11px] shrink-0 rounded-full"
                  style={{ background: segment.color }}
                />
                <Typography.Paragraph className="font-semibold text-foreground/85">
                  {segment.label}
                </Typography.Paragraph>
                <span className="ml-auto font-extrabold text-base tabular-nums">
                  {((segment.value / total) * 100).toFixed(1)}%
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
