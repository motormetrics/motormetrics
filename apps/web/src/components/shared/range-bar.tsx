import { cn, ProgressBar } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * Direction D's "range" hero bar: where the latest figure sits between the
 * low and the high of a window, with the three labelled underneath. Drawn
 * with HeroUI's ProgressBar; the comp's dot on the fill's end has no
 * ProgressBar part, so the fill's edge marks it.
 *
 * Holds no state, so it renders from server and client components alike.
 */
export function RangeBar({
  ariaLabel,
  className,
  high,
  highLabel,
  low,
  lowLabel,
  value,
  where,
}: {
  ariaLabel: string;
  className?: string;
  high: number;
  highLabel: string;
  low: number;
  lowLabel: string;
  value: number;
  /** "Highest in 12 months", "3.2% below the high". */
  where: ReactNode;
}) {
  return (
    <ProgressBar
      aria-label={ariaLabel}
      className={cn("max-w-xl gap-2", className)}
      maxValue={high > low ? high : low + 1}
      minValue={low}
      size="sm"
      value={value}
    >
      <ProgressBar.Track className="col-span-full">
        <ProgressBar.Fill />
      </ProgressBar.Track>
      <span className="col-span-full flex justify-between gap-3 text-muted text-xs tabular-nums">
        <span>{lowLabel}</span>
        <span className="font-semibold text-foreground">{where}</span>
        <span>{highLabel}</span>
      </span>
    </ProgressBar>
  );
}
