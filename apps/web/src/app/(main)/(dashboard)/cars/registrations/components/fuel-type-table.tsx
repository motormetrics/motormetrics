"use client";

import { cn, ProgressBar } from "@heroui/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type CSSProperties, useTransition } from "react";

export interface FuelTypeRow {
  /** Signed percentage change on the previous month. */
  change: number;
  count: number;
  name: string;
  /** Percentage of the month's registrations. */
  share: number;
  yearToDate: number;
}

const ROW = "flex items-center gap-4 px-2 max-md:gap-2 max-md:px-0.5";
const NAME_CELL = "min-w-0 flex-1 truncate";
const CARS_CELL = "w-24 shrink-0 text-right max-md:w-16";
const SHARE_CELL =
  "flex w-40 shrink-0 items-center justify-end gap-2.5 max-md:w-14 xl:w-56";
const YEAR_CELL = "w-24 shrink-0 text-right max-md:hidden";
const CHANGE_CELL = "w-24 shrink-0 text-right max-md:w-16";

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/**
 * The month's registrations by fuel type as a ruled table. Each row is a
 * toggle for the page's fuel filter, as the comp has it: selecting a row
 * narrows the headline and chart to that fuel type, and selecting it again
 * clears the filter.
 *
 * Writes the same `fuelType` param as the tabs, with `shallow: false` so the
 * server re-renders the page against it.
 */
export function FuelTypeTable({
  previousMonthName,
  rows,
  year,
}: {
  /** "Feb", for the change column's header. */
  previousMonthName: string;
  rows: FuelTypeRow[];
  year: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  // Bars are scaled to the largest fuel type, so the leader fills its track.
  const leadCount = Math.max(1, ...rows.map((row) => row.count));

  return (
    <div className={cn("flex flex-col", isPending && "opacity-70")}>
      <div
        className={cn(
          ROW,
          "border-border border-b pb-2 font-semibold text-muted text-xs",
        )}
      >
        <span className={NAME_CELL}>Fuel type</span>
        <span className={CARS_CELL}>Cars</span>
        <span className={cn(SHARE_CELL, "block text-right")}>Share</span>
        <span className={YEAR_CELL}>{year} to date</span>
        <span className={CHANGE_CELL}>vs {previousMonthName}</span>
      </div>
      {rows.map((row, index) => {
        const isActive = row.name === selected;
        return (
          // A div row rather than a button: the share bar is a block-level
          // progress bar, which a button cannot contain. The name is the
          // button, stretched over the row so the whole row stays clickable.
          <div
            className={cn(
              ROW,
              "relative border-separator border-b py-2.5 transition-colors hover:bg-surface-secondary",
              isActive && "bg-accent-soft",
            )}
            key={row.name}
          >
            <button
              aria-pressed={isActive}
              className={cn(
                NAME_CELL,
                "cursor-pointer text-left text-sm outline-none after:absolute after:inset-0 focus-visible:after:ring-2 focus-visible:after:ring-focus",
                isActive
                  ? "font-bold text-accent-strong"
                  : "font-medium text-foreground",
              )}
              onClick={() => {
                const next = isActive ? null : row.name;
                posthog.capture("dashboard_filter_changed", {
                  filter: "fuel_type",
                  value: next,
                });
                setSelected(next);
              }}
              type="button"
            >
              {row.name}
            </button>
            <span
              className={cn(CARS_CELL, "font-semibold text-sm tabular-nums")}
            >
              {formatCount(row.count)}
            </span>
            <span className={SHARE_CELL}>
              <ProgressBar
                aria-label={`${row.name} against the largest fuel type`}
                className="min-w-0 flex-1 max-md:hidden"
                style={
                  {
                    "--progress-bar-fill":
                      index === 0 ? "var(--chart-1)" : "var(--chart-3)",
                  } as CSSProperties
                }
                value={(row.count / leadCount) * 100}
              >
                <ProgressBar.Track>
                  <ProgressBar.Fill />
                </ProgressBar.Track>
              </ProgressBar>
              <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                {row.share.toFixed(1)}%
              </span>
            </span>
            <span
              className={cn(
                YEAR_CELL,
                "text-muted-strong text-sm tabular-nums",
              )}
            >
              {formatCount(row.yearToDate)}
            </span>
            <DeltaChip
              className={cn(CHANGE_CELL, "text-sm")}
              value={row.change}
            />
          </div>
        );
      })}
    </div>
  );
}
