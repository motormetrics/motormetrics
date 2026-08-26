import { Chip, cn } from "@heroui/react";

/**
 * The signed-change pill that sits next to a headline figure.
 *
 * Sentiment follows the sign directly: a rise is good news for registrations,
 * population and market share. For figures where a rise is bad news — COE
 * premiums, PQP rates — use `(dashboard)/components/cost-trend-chip.tsx`,
 * which inverts the colour instead.
 *
 * Built on HeroUI's Chip: `variant="soft"` with `color="success" | "warning"`
 * resolves to the `--success-soft` / `--success-soft-foreground` token pair, so
 * the tint and its text stay in step with the theme rather than being restated
 * as opacity modifiers.
 *
 * On `soft` the dot is not decoration — green and amber are otherwise the only
 * signal. `inverse` and `on-dark` sit on the ink panel and the gradient hero,
 * where the status tints have nothing to read against, so they carry a single
 * fill whatever the sign; a dot there would encode nothing, and is dropped.
 */
export function DeltaChip({
  className,
  tone = "soft",
  unit = "%",
  value,
}: {
  className?: string;
  /** `soft` on light cards; `inverse` on the gradient hero; `on-dark` on ink panels. */
  tone?: "soft" | "inverse" | "on-dark";
  /** `%` for a relative change, `pp` for a share movement in percentage points. */
  unit?: "%" | "pp";
  /** Signed change, already in the unit being displayed. */
  value: number;
}) {
  const isUp = value >= 0;
  const label = `${isUp ? "+" : "−"}${Math.abs(value).toFixed(1)}${unit}`;

  if (tone !== "soft") {
    return (
      <Chip
        className={cn(
          "rounded-full font-bold tabular-nums",
          tone === "inverse"
            ? "bg-ink-surface text-ink-surface-foreground"
            : "bg-accent-on-dark/20 text-accent-on-dark",
          className,
        )}
        size="lg"
        variant="soft"
      >
        <Chip.Label>{label}</Chip.Label>
      </Chip>
    );
  }

  return (
    <Chip
      className={cn("gap-1.5 rounded-full font-bold tabular-nums", className)}
      color={isUp ? "success" : "warning"}
      size="lg"
      variant="soft"
    >
      <span
        aria-hidden
        className={cn(
          "size-2 shrink-0 rounded-full",
          isUp ? "bg-success" : "bg-warning",
        )}
      />
      <Chip.Label>{label}</Chip.Label>
    </Chip>
  );
}
