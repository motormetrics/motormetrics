"use client";

import { cn } from "@heroui/react";
import { useState } from "react";

export interface ColumnChartColumn {
  key: string;
  /** Tick under the column. */
  label: string;
  /** Rows in the hover tooltip; omit for a chart with no tooltip. */
  tooltip?: { rows: { label: string; value: string }[]; title: string };
  value: number;
  /** Figure drawn above the column, where the comps carry one. */
  valueLabel?: string;
}

/** Shortest bar still reads as a bar rather than as a sliver. */
const MIN_BAR_PERCENT = 12;
/** Above this many columns the ticks collide, so only every nth is drawn. */
const MAX_TICKS = 12;

/**
 * The hand-rolled column chart every v3 overview draws for a series over time:
 * COE premiums by exercise, deregistrations by month, EV share by month,
 * population by year.
 *
 * A client island only because of the hover state — the series is computed on
 * the server and arrives as props. `onSelect` makes the columns buttons that
 * hand the key back; without it they are inert.
 *
 * `baseline` is `zero` for counts, where the bar heights should be honest,
 * and `trimmed` for premiums, where the interesting movement is a few percent
 * of the total and a zero baseline would flatten it.
 */
export function ColumnChart({
  baseline = "zero",
  className,
  columns,
  height = 260,
  highlightKey,
  onSelect,
}: {
  baseline?: "trimmed" | "zero";
  className?: string;
  columns: ColumnChartColumn[];
  /** Height of the chart in pixels, ticks included. */
  height?: number;
  /** The column drawn in the accent; defaults to the last one. */
  highlightKey?: string;
  onSelect?: (key: string) => void;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const values = columns.map((column) => column.value);
  const ceiling = Math.max(...values, 0);
  const floor = baseline === "trimmed" ? Math.min(...values) * 0.9 : 0;
  const span = ceiling - floor || 1;
  const tickEvery = Math.ceil(columns.length / MAX_TICKS);
  const highlighted = highlightKey ?? columns.at(-1)?.key;

  return (
    <div
      className={cn("flex items-end gap-1.5 sm:gap-3", className)}
      style={{ height: `${height}px` }}
    >
      {columns.map((column, index) => {
        const isHighlighted = column.key === highlighted;
        const isHovered = hovered === column.key;
        // Anchored to the newest column so the last tick is always drawn and
        // the gaps between the survivors stay even.
        const showTick = (columns.length - 1 - index) % tickEvery === 0;
        const barHeight =
          ((column.value - floor) / span) * (100 - MIN_BAR_PERCENT) +
          MIN_BAR_PERCENT;

        return (
          <button
            aria-label={
              column.tooltip
                ? `${column.tooltip.title}: ${column.tooltip.rows.map((row) => `${row.label} ${row.value}`).join(", ")}`
                : `${column.label}: ${column.valueLabel ?? column.value}`
            }
            aria-pressed={onSelect ? isHighlighted : undefined}
            // `min-w-0` because a flex item will not shrink below its content
            // and every column carries a full-width tick label — the hidden
            // ones are `invisible`, not unmounted.
            className={cn(
              "relative flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2",
              onSelect ? "cursor-pointer" : "cursor-default",
            )}
            key={column.key}
            onBlur={() => setHovered(null)}
            onClick={onSelect ? () => onSelect(column.key) : undefined}
            onFocus={() => setHovered(column.key)}
            onMouseEnter={() => setHovered(column.key)}
            onMouseLeave={() => setHovered(null)}
            type="button"
          >
            {column.tooltip && isHovered ? (
              <div className="absolute bottom-full left-1/2 z-30 mb-2.5 flex min-w-[186px] -translate-x-1/2 flex-col gap-2 rounded-[1.125rem] bg-ink-surface px-4 py-3.5 shadow-overlay">
                <span className="font-extrabold text-ink-surface-foreground text-sm">
                  {column.tooltip.title}
                </span>
                {column.tooltip.rows.map((row) => (
                  <div className="flex items-center gap-2" key={row.label}>
                    <span className="font-semibold text-ink-surface-foreground/80 text-sm">
                      {row.label}
                    </span>
                    <span className="ml-auto font-bold text-ink-surface-foreground text-sm tabular-nums">
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>
            ) : null}

            {column.valueLabel ? (
              <span
                className={cn(
                  "font-bold text-xs tabular-nums",
                  isHighlighted ? "text-accent-strong" : "text-muted",
                )}
              >
                {column.valueLabel}
              </span>
            ) : null}

            <span
              className={cn(
                "block w-full max-w-16 rounded-xl transition-[filter]",
                isHovered && "brightness-95",
              )}
              style={{
                background: isHighlighted
                  ? "var(--accent)"
                  : "var(--accent-soft)",
                height: `${barHeight.toFixed(1)}%`,
              }}
            />

            <span
              className={cn(
                "whitespace-nowrap text-xs",
                isHovered || isHighlighted
                  ? "font-extrabold text-accent-strong"
                  : "font-semibold text-muted",
                !showTick && "invisible",
              )}
            >
              {column.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
