import { cn } from "@heroui/react";

/**
 * The signed change that sits next to a headline figure.
 *
 * Rendered as plain grey text with a true minus (U+2212), matching
 * `shared/cost-trend-chip.tsx`: the Hybrid design leaves the sign to carry the
 * direction, with no colour, pill or arrow.
 */
export function DeltaChip({
  className,
  unit = "%",
  value,
}: {
  className?: string;
  /** `%` for a relative change, `pp` for a share movement in percentage points. */
  unit?: "%" | "pp";
  /** Signed change, already in the unit being displayed. */
  value: number;
}) {
  const sign = value >= 0 ? "+" : "−";

  return (
    <span className={cn("text-muted-strong tabular-nums", className)}>
      {`${sign}${Math.abs(value).toFixed(1)}${unit}`}
    </span>
  );
}
