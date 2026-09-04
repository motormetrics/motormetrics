import { cn } from "@heroui/react";
import type { ReactNode } from "react";

/**
 * One labelled proportion bar — the v3 comps' ranked list, used for top makes,
 * quota allocation, the age profile and the year-on-year fleet.
 *
 * The bar is scaled by the caller: `share` is a percentage of whatever the
 * list's largest value is, so a leader always fills its track.
 */
export function BarRow({
  className,
  color = "var(--chart-1)",
  isActive,
  label,
  share,
  value,
}: {
  className?: string;
  /** Any CSS colour; the chart tokens are the usual pick. */
  color?: string;
  /** Emphasises the label the way the comps mark a selected row. */
  isActive?: boolean;
  label: ReactNode;
  /** Width of the fill, 0–100. */
  share: number;
  value: ReactNode;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <div className="flex items-center gap-2.5">
        <span
          className={cn(
            "flex min-w-0 items-center gap-2.5 text-base",
            isActive
              ? "font-extrabold text-accent-strong"
              : "font-semibold text-foreground/85",
          )}
        >
          {label}
        </span>
        <span className="ml-auto shrink-0 font-extrabold text-base tabular-nums">
          {value}
        </span>
      </div>
      <span className="block h-3 overflow-hidden rounded-full bg-surface-secondary">
        <span
          className="block h-full rounded-full"
          style={{
            background: color,
            width: `${Math.min(Math.max(share, 0), 100).toFixed(1)}%`,
          }}
        />
      </span>
    </div>
  );
}
