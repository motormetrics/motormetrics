"use client";

import { cn } from "@heroui/react";
import { SurfaceCard } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { useState } from "react";

export interface PremiumColumn {
  /** Signed change against the preceding exercise, as a ratio. */
  changeRatio: number;
  key: string;
  /** Short exercise tick, e.g. "Apr 2". */
  label: string;
  premium: number;
}

/** Shortest bar still reads as a bar rather than as a sliver. */
const MIN_BAR_PERCENT = 14;
/** Baseline sits below the smallest premium so movement stays legible. */
const BASELINE_FACTOR = 0.9;
/** Above this many columns the ticks collide, so only every nth is drawn. */
const MAX_TICKS = 12;

const formatMoney = (value: number) =>
  `$${Math.round(value).toLocaleString("en-SG")}`;

const formatChange = (ratio: number) =>
  `${ratio >= 0 ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * Hand-rolled column chart with a hover tooltip — a view-only island over the
 * series the server already fetched, so no query runs on the client.
 */
export function PremiumsChart({
  category,
  columns,
  periodLabel,
}: {
  category: string;
  columns: PremiumColumn[];
  periodLabel: string;
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const premiums = columns.map((column) => column.premium);
  const baseline = Math.min(...premiums) * BASELINE_FACTOR;
  const ceiling = Math.max(...premiums);
  const span = ceiling - baseline || 1;
  const tickEvery = Math.ceil(columns.length / MAX_TICKS);

  return (
    <SurfaceCard className="gap-7">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex flex-col">
          <Typography.H3 className="font-bold text-2xl tracking-[-0.02em]">
            Premiums by exercise
          </Typography.H3>
          <Typography.TextSm className="font-semibold text-muted">
            {category} · hover a column for the premium
          </Typography.TextSm>
        </div>
        <span className="ml-auto whitespace-nowrap rounded-full bg-[var(--accent-soft)] px-3.5 py-[7px] font-bold text-[13px] text-[var(--accent-strong)]">
          {periodLabel}
        </span>
      </div>

      <div className="flex h-[300px] items-end gap-3">
        {columns.map((column, index) => {
          const isLatest = index === columns.length - 1;
          const isHovered = hovered === column.key;
          // Anchored to the newest exercise so the last column is always
          // labelled and the gaps stay even.
          const showTick = (columns.length - 1 - index) % tickEvery === 0;

          return (
            <button
              aria-label={`${column.label}: ${formatMoney(column.premium)}, ${formatChange(column.changeRatio)}`}
              className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end gap-2.5"
              key={column.key}
              onBlur={() => setHovered(null)}
              onFocus={() => setHovered(column.key)}
              onMouseEnter={() => setHovered(column.key)}
              onMouseLeave={() => setHovered(null)}
              type="button"
            >
              {isHovered ? (
                <div className="absolute bottom-full left-1/2 z-30 mb-2.5 flex min-w-[190px] -translate-x-1/2 flex-col gap-2 rounded-[1.125rem] bg-[var(--ink-surface)] px-4 py-3.5 shadow-overlay">
                  <span className="font-extrabold text-[var(--accent-foreground)] text-sm">
                    {column.label} · {category}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-[var(--accent-foreground)]/80">
                      Premium
                    </span>
                    <span className="ml-auto font-bold text-[13px] text-[var(--accent-foreground)] tabular-nums">
                      {formatMoney(column.premium)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[13px] text-[var(--accent-foreground)]/80">
                      Change
                    </span>
                    <span className="ml-auto font-bold text-[13px] text-[var(--accent-foreground)] tabular-nums">
                      {formatChange(column.changeRatio)}
                    </span>
                  </div>
                </div>
              ) : null}

              <span
                className={cn(
                  "block w-full max-w-[52px] rounded-t-2xl rounded-b-md transition-[filter]",
                  isHovered && "brightness-[1.08]",
                )}
                style={{
                  background: isLatest ? "var(--accent)" : "var(--chart-5)",
                  height: `${((column.premium - baseline) / span) * (100 - MIN_BAR_PERCENT) + MIN_BAR_PERCENT}%`,
                }}
              />
              <span
                className={cn(
                  "whitespace-nowrap text-[12.5px]",
                  isHovered
                    ? "font-extrabold text-foreground"
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
    </SurfaceCard>
  );
}
