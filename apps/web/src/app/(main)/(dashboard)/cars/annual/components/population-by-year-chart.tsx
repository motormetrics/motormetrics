"use client";

import { cn } from "@heroui/react";
import type { PopulationEntity } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SurfaceCard } from "@web/components/shared/bento";
import Typography from "@web/components/typography";
import { useState } from "react";

/** Shortest column still reads as a column rather than as a sliver. */
const MIN_BAR_PERCENT = 12;

/** Baseline sits below the smallest year so movement stays legible. */
const BASELINE_FACTOR = 0.94;

const numberFormatter = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

const formatChange = (ratio: number | null) =>
  ratio === null
    ? "—"
    : `${ratio >= 0 ? "+" : "−"}${Math.abs(ratio * 100).toFixed(1)}%`;

/**
 * Hand-rolled column chart with a hover tooltip, matching the COE overview's:
 * a view-only island over the series the server already fetched, so nothing is
 * queried on the client and the columns need no axis to be read.
 */
export function PopulationByYearChart({
  entity,
  years,
}: {
  entity: PopulationEntity;
  years: string[];
}) {
  const [hovered, setHovered] = useState<string | null>(null);

  const baseline = Math.min(...entity.series) * BASELINE_FACTOR;
  const ceiling = Math.max(...entity.series);
  const span = ceiling - baseline || 1;

  return (
    <SurfaceCard className="gap-7">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex flex-col">
          <Typography.H3>Population by year</Typography.H3>
          <Typography.TextSm>
            {entity.name} · hover a column for detail
          </Typography.TextSm>
        </div>
      </div>

      <div className="flex h-[300px] items-end gap-3.5">
        {years.map((year, index) => {
          const value = entity.series[index] ?? 0;
          const previous = entity.series[index - 1];
          const change =
            previous === undefined || previous === 0
              ? null
              : (value - previous) / previous;
          const isLatest = index === years.length - 1;
          const isHovered = hovered === year;

          return (
            <button
              aria-label={`${year}: ${numberFormatter.format(value)}, ${formatChange(change)}`}
              className="relative flex h-full flex-1 cursor-default flex-col items-center justify-end gap-2.5"
              key={year}
              onBlur={() => setHovered(null)}
              onFocus={() => setHovered(year)}
              onMouseEnter={() => setHovered(year)}
              onMouseLeave={() => setHovered(null)}
              type="button"
            >
              {isHovered ? (
                <div className="absolute bottom-full left-1/2 z-30 mb-2.5 flex min-w-[186px] -translate-x-1/2 flex-col gap-2 rounded-[1.125rem] bg-foreground px-4 py-3.5 shadow-overlay">
                  <span className="font-extrabold text-accent-foreground text-sm">
                    {year} · {entity.name}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-accent-foreground/80 text-sm">
                      Population
                    </span>
                    <span className="ml-auto font-bold text-accent-foreground text-sm tabular-nums">
                      {numberFormatter.format(value)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-accent-foreground/80 text-sm">
                      Change
                    </span>
                    <span className="ml-auto font-bold text-accent-foreground text-sm tabular-nums">
                      {formatChange(change)}
                    </span>
                  </div>
                </div>
              ) : null}

              <span
                className={cn(
                  "block w-full max-w-12 rounded-t-2xl rounded-b-md transition-[filter]",
                  isHovered && "brightness-[1.08]",
                )}
                style={{
                  background: isLatest ? "var(--accent)" : "var(--accent-soft)",
                  height: `${((value - baseline) / span) * (100 - MIN_BAR_PERCENT) + MIN_BAR_PERCENT}%`,
                }}
              />
              <span
                className={cn(
                  "text-sm",
                  isHovered
                    ? "font-extrabold text-foreground"
                    : "font-semibold text-muted",
                )}
              >
                {year.slice(2)}
              </span>
            </button>
          );
        })}
      </div>
    </SurfaceCard>
  );
}
