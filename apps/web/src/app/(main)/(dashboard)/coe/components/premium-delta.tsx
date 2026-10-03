import { cn } from "@heroui/react";

/**
 * Signed change on a premium, as plain grey text with a true minus (U+2212).
 * The Hybrid design leaves the sign to carry the direction, with no colour or
 * arrow, matching `CostTrendChip` in the headline.
 *
 * `/coe/results` and `/coe/pqp` import this too — the COE report pages share
 * the reading, so they share the component.
 */
export function PremiumDelta({
  className,
  ratio,
}: {
  className?: string;
  /** Signed change as a ratio, or `null` when there is nothing to compare to. */
  ratio: number | null;
}) {
  if (ratio === null) {
    return (
      <span className={cn("font-bold text-base text-muted", className)}>—</span>
    );
  }

  if (ratio === 0) {
    return (
      <span
        className={cn("font-bold text-base text-muted tabular-nums", className)}
      >
        0.0%
      </span>
    );
  }

  const sign = ratio > 0 ? "+" : "−";
  const percentage = Math.abs(ratio * 100).toFixed(1);

  return (
    <span
      className={cn(
        "font-bold text-base text-muted-strong tabular-nums",
        className,
      )}
    >
      {`${sign}${percentage}%`}
    </span>
  );
}
