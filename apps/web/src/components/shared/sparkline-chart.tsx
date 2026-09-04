import { cn } from "@heroui/react";
import { sparkline } from "@web/components/shared/sparkline";

/**
 * The accent sparkline the v3 comps draw under every headline figure: a soft
 * area, a 3.5px line and a hollow marker on the latest point.
 *
 * Drawn with `preserveAspectRatio="none"` so the chart fills whatever width
 * the column gives it, as the comps do; `vectorEffect` keeps the stroke from
 * stretching with it. Renders nothing for a series too short to draw.
 */
export function SparklineChart({
  className,
  height = 150,
  title,
  values,
  width = 520,
}: {
  className?: string;
  height?: number;
  /** Accessible name for the chart. */
  title: string;
  values: number[];
  width?: number;
}) {
  const spark = sparkline(values, width, height, 10);

  if (!spark) {
    return null;
  }

  return (
    <svg
      className={cn("w-full overflow-visible", className)}
      preserveAspectRatio="none"
      role="img"
      style={{ height: `${height}px` }}
      viewBox={`0 0 ${width} ${height}`}
    >
      <title>{title}</title>
      <path d={spark.area} fill="var(--accent)" opacity={0.1} />
      <path
        d={spark.line}
        fill="none"
        stroke="var(--accent)"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={3.5}
        vectorEffect="non-scaling-stroke"
      />
      <circle
        cx={spark.lastX}
        cy={spark.lastY}
        fill="var(--background)"
        r={6.5}
        stroke="var(--accent)"
        strokeWidth={3.5}
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
