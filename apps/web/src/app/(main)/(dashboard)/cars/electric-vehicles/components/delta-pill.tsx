import { cn } from "@heroui/react";

/**
 * Delta pill for the two cases `components/shared/delta-chip.tsx` cannot cover.
 *
 * `DeltaChip` hard-codes a `%` suffix, and a market share moving from 29.5% to
 * 30.4% has risen 0.9 percentage points, not 0.9% — labelling that `%` would be
 * wrong. Its `inverse` tone also paints an accent-deep pill, where the ink
 * surfaces on this page carry the accent-on-dark pill the hero and
 * `components/ev-momentum.tsx` use.
 *
 * Everything else mirrors `DeltaChip`, including the dot that keeps colour from
 * being the only signal. Prefer `DeltaChip` for a plain percentage change on a
 * light card.
 */
export function DeltaPill({
  className,
  tone = "soft",
  unit = "pp",
  value,
}: {
  className?: string;
  /** `soft` on light cards; `on-dark` on the ink hero and rail panel. */
  tone?: "soft" | "on-dark";
  /** `pp` for a share movement, `%` for a relative change. */
  unit?: "pp" | "%";
  /** Signed change, already in the unit being displayed. */
  value: number;
}) {
  const isUp = value >= 0;
  const label = `${isUp ? "+" : "−"}${Math.abs(value).toFixed(1)}${unit}`;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-bold text-[13px] tabular-nums",
        tone === "on-dark"
          ? "bg-[var(--accent-on-dark)]/20 text-[var(--accent-on-dark)]"
          : isUp
            ? "bg-[var(--success-soft)] text-[var(--success-foreground)]"
            : "bg-[var(--warning-soft)] text-[var(--warning-foreground)]",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "size-2 shrink-0 rounded-full",
          tone === "on-dark"
            ? "bg-[var(--accent-on-dark)]"
            : isUp
              ? "bg-[var(--success)]"
              : "bg-[var(--warning)]",
        )}
      />
      {label}
    </span>
  );
}
