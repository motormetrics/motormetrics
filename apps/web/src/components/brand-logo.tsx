import { cn } from "@heroui/react";
import type { SVGProps } from "react";

/* The brand mark is drawn in fixed colours rather than theme tokens: the
   sheet documents the mark as it must appear, so it must not shift with the
   colour scheme the way the page chrome around it does. */
export const MARK_INK = "#062F5C";
export const MARK_ACCENT = "#0961BB";
export const MARK_ACCENT_ON_DARK = "#8DBBF0";

/* Five bars on a 64-unit square, 8 wide with 4 between them, all standing on
   the same baseline. The first and last are the outer pair. */
const BARS = [
  { x: 4, y: 10, height: 44 },
  { x: 16, y: 24, height: 30 },
  { x: 28, y: 36, height: 18 },
  { x: 40, y: 24, height: 30 },
  { x: 52, y: 10, height: 44 },
];

type LogoMarkProps = Omit<SVGProps<SVGSVGElement>, "viewBox" | "fill"> & {
  size: number;
  outer?: string;
  inner?: string;
};

/**
 * An M drawn as five bars, the way the site draws its charts. The two outer
 * bars are deep blue and the three inner bars take the accent. `outer`/`inner`
 * exist for the on-dark, all-white and "don't" variants.
 */
export function LogoMark({
  size,
  outer = MARK_INK,
  inner = MARK_ACCENT,
  ...props
}: LogoMarkProps) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 64 64"
      width={size}
      {...props}
    >
      {BARS.map(({ x, y, height }, index) => (
        <rect
          fill={index === 0 || index === BARS.length - 1 ? outer : inner}
          height={height}
          key={x}
          rx={4}
          width={8}
          x={x}
          y={y}
        />
      ))}
    </svg>
  );
}

/**
 * The wordmark is the name set in Geist Bold: one word, two capitals, one
 * colour. The colour is fixed for the same reason as the mark; pass
 * `currentColor` where it should follow the text around it. A `text-*` class
 * sets its size.
 */
export function Wordmark({
  className,
  colour = MARK_INK,
}: {
  className?: string;
  colour?: string;
}) {
  return (
    <span
      className={cn("font-bold leading-none tracking-tight", className)}
      style={{ color: colour }}
    >
      MotorMetrics
    </span>
  );
}
