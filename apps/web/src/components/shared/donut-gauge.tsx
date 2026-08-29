import type { ReactNode } from "react";

const RADIUS = 74;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
/** Arc length removed from each segment so the rounded caps read as separate. */
const SEGMENT_GAP = 16;

export interface DonutSegment {
  color: string;
  label: string;
  value: number;
}

/**
 * The gapped-segment donut the v2 comps use for every part-to-whole breakdown
 * (fuel mix, market concentration, population by fuel).
 *
 * Segments are drawn as dash offsets on a single circle rather than as arc
 * paths, which is what keeps the rounded caps consistent at any share — an arc
 * path would need its own end-cap geometry per segment.
 */
export function DonutGauge({
  caption,
  centre,
  segments,
  title,
}: {
  /** Small label under the centre figure. */
  caption: string;
  /** Headline figure in the middle of the ring. */
  centre: ReactNode;
  segments: DonutSegment[];
  /** Accessible name for the chart. */
  title: string;
}) {
  const total = segments.reduce((sum, item) => sum + item.value, 0) || 1;

  let consumed = 0;
  const arcs = segments.map((segment) => {
    const full = (segment.value / total) * CIRCUMFERENCE;
    // Floor at 2px so a rounding-to-zero share still shows as a tick rather
    // than vanishing, which would silently drop it from the ring.
    const dash = Math.max(2, full - SEGMENT_GAP);
    const arc = {
      color: segment.color,
      dashArray: `${dash.toFixed(2)} ${(CIRCUMFERENCE - dash).toFixed(2)}`,
      key: segment.label,
      dashOffset: (-(consumed + SEGMENT_GAP / 2)).toFixed(2),
    };
    consumed += full;
    return arc;
  });

  return (
    <div className="flex flex-col gap-4">
      <div className="relative mx-auto mt-3 size-[172px]">
        <svg className="block" role="img" viewBox="0 0 190 190">
          <title>{title}</title>
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
          <span className="font-extrabold text-3xl tabular-nums tracking-tight">
            {centre}
          </span>
          <span className="font-semibold text-muted text-sm">{caption}</span>
        </div>
      </div>

      <ul className="flex flex-col gap-[9px]">
        {segments.map((segment) => (
          <li className="flex items-center gap-2.5" key={segment.label}>
            <span
              aria-hidden
              className="size-[11px] shrink-0 rounded-full"
              style={{ background: segment.color }}
            />
            <span className="font-semibold text-base text-foreground/85">
              {segment.label}
            </span>
            <span className="ml-auto font-bold text-base tabular-nums">
              {((segment.value / total) * 100).toFixed(1)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
