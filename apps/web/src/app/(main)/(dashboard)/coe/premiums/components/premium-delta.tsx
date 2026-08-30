import { cn } from "@heroui/react";

/**
 * Signed change on a premium, as plain coloured text rather than a pill — the
 * comps reserve the pill for the headline and use bare text inside tables.
 *
 * The sentiment is inverted against `DeltaText` in `shared/report-table.tsx`: a
 * rising COE premium is bad news for a buyer, so a rise is drawn in the caution
 * tone and a fall in the positive one. Everything else about the two is the
 * same, which is why this lives beside the pages that need it rather than in
 * `components/shared`.
 *
 * `/coe/results` imports this too — the two COE report pages share the reading,
 * so they share the component.
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

  const isUp = ratio > 0;

  return (
    <span
      className={cn(
        "font-bold text-base tabular-nums",
        isUp ? "text-warning-soft-foreground" : "text-success-soft-foreground",
        className,
      )}
    >
      {isUp ? "+" : "−"}
      {Math.abs(ratio * 100).toFixed(1)}%
    </span>
  );
}
