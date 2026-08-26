import { cn } from "@heroui/react";

/**
 * The ±% pill the v2 comps put next to every headline figure.
 *
 * Sentiment follows the sign directly: a rise is good news for registrations,
 * population and market share, which is what every v2 Overview block measures.
 * For figures where a rise is bad news — COE premiums, PQP rates — use
 * `components/cost-trend-chip.tsx`, which inverts the colour instead.
 *
 * On `soft` the dot is not decoration: green and amber are otherwise the only
 * signal. `inverse` carries one background whatever the sign, so a dot there
 * would encode nothing — the comps omit it, and set the label a size larger.
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
  const isInverse = tone === "inverse";
  const label = `${isUp ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;

  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center whitespace-nowrap rounded-full py-2 font-bold",
        isInverse
          ? "bg-[var(--accent-deep)]/85 px-[15px] text-[15px] text-[var(--accent-foreground)]"
          : cn(
              "gap-2 px-3 text-[13px]",
              isUp
                ? "bg-[var(--success-soft)] text-[var(--success-foreground)]"
                : "bg-[var(--warning-soft)] text-[var(--warning-foreground)]",
            ),
        className,
      )}
    >
      {isInverse ? null : (
        <span
          aria-hidden
          className={cn(
            "size-2 shrink-0 rounded-full",
            isUp ? "bg-[var(--success)]" : "bg-[var(--warning)]",
          )}
        />
      )}
      {label}
    </span>
  );
}
