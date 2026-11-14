import { ProgressBar } from "@heroui/react";

/**
 * Direction D's "range" hero bar: where the latest figure sits between the
 * low and the high of a window, with the three labelled underneath. Drawn
 * with HeroUI's ProgressBar, as the homepage's MarketLead does; the comp's
 * dot on the fill's end has no ProgressBar part, so the fill's edge marks it.
 *
 * The electric vehicles page uses it too.
 */
export function RangeBar({
  ariaLabel,
  high,
  highLabel,
  low,
  lowLabel,
  value,
  where,
}: {
  ariaLabel: string;
  high: number;
  highLabel: string;
  low: number;
  lowLabel: string;
  value: number;
  /** "Highest in 12 months", "3.2% below the high". */
  where: string;
}) {
  return (
    <ProgressBar
      aria-label={ariaLabel}
      className="max-w-xl gap-2"
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
