import { cn } from "@heroui/react";

/**
 * Signed change for figures where a fall is good news (COE premiums, PQP rates).
 *
 * Rendered as plain grey text with a true minus (U+2212): the Hybrid design
 * leaves the sign to carry the direction, with no colour or arrow.
 */
export function CostTrendChip({
  changeRatio,
  className,
}: {
  changeRatio: number;
  className?: string;
}) {
  if (changeRatio === 0) {
    return null;
  }

  const sign = changeRatio > 0 ? "+" : "−";
  const percentage = Math.abs(changeRatio * 100).toFixed(1);

  return (
    <span className={cn("text-muted-strong tabular-nums", className)}>
      {`${sign}${percentage}%`}
    </span>
  );
}
