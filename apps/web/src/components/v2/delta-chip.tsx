import { cn } from "@heroui/react";

/**
 * The ±% pill the v2 comps put next to every headline figure.
 *
 * Sentiment follows the sign directly: a rise is good news for registrations,
 * population and market share, which is what every v2 Overview block measures.
 * For figures where a rise is bad news — COE premiums, PQP rates — use
 * `components/cost-trend-chip.tsx`, which inverts the colour instead.
 *
 * The dot is not decoration: colour alone would be the only signal otherwise.
 */
export function DeltaChip({
  className,
  ratio,
  tone = "soft",
}: {
  className?: string;
  /** Signed change as a ratio, e.g. `0.041` for +4.1%. */
  ratio: number;
  /** `soft` on light cards; `inverse` on the gradient and ink panels. */
  tone?: "soft" | "inverse";
}) {
  const isUp = ratio >= 0;
  const label = `${isUp ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-3 py-2 font-bold text-[13px]",
        tone === "inverse"
          ? "bg-[var(--accent-deep)]/85 text-[var(--accent-foreground)]"
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
          tone === "inverse"
            ? "bg-[var(--accent-foreground)]"
            : isUp
              ? "bg-[var(--success)]"
              : "bg-[var(--warning)]",
        )}
      />
      {label}
    </span>
  );
}
