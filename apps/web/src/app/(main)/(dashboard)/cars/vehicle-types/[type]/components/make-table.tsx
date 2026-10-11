"use client";

import { cn } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import {
  defaultMakeDirection,
  type MakeRow,
  type MakeSortDirection,
  type MakeSortKey,
  sortMakeRows,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/[type]/components/make-rows";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useState } from "react";

/** Cell widths shared by the header and every row, so the columns line up. */
const CELL = {
  change: "w-16 shrink-0 text-right md:w-28",
  count: "w-14 shrink-0 text-right md:w-28",
  make: "min-w-0 flex-1",
  rank: "w-5 shrink-0 md:w-7",
  share: "flex w-12 shrink-0 items-center justify-end gap-2.5 md:w-52",
} as const;

const ROW = "flex items-center gap-2 px-0.5 md:gap-4 md:px-2";

const SORT_LABELS: Record<MakeSortKey, string> = {
  change: "change",
  count: "registrations",
  make: "make",
};

/**
 * The vehicle type's leading makes as a ruled list, sortable on make, registrations and
 * change. The rows render from server data; only the sort is client state, as
 * in the comp, so it stays out of the URL. Phones drop the share bar and keep
 * the percentage.
 */
export function MakeTable({
  rows,
  total,
  vehicleType,
}: {
  /** Largest first. */
  rows: MakeRow[];
  /** Every registration of the vehicle type in the period, for the share. */
  total: number;
  vehicleType: string;
}) {
  const [sortKey, setSortKey] = useState<MakeSortKey>("count");
  const [direction, setDirection] = useState<MakeSortDirection>("desc");
  const leader = rows[0]?.count || 1;

  const sortBy = (key: MakeSortKey) => {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(defaultMakeDirection(key));
  };

  const header = (key: MakeSortKey, label: string, short = label) => {
    const isActive = key === sortKey;
    return (
      <button
        className={cn(
          "max-w-full cursor-pointer truncate font-semibold",
          isActive && "text-accent-strong",
        )}
        onClick={() => sortBy(key)}
        type="button"
      >
        <span className="max-md:hidden">{label}</span>
        <span className="md:hidden">{short}</span>
        {isActive ? (direction === "asc" ? " ↑" : " ↓") : null}
      </button>
    );
  };

  return (
    <div className="flex flex-col gap-2">
      <span className="text-muted text-xs max-md:hidden md:self-end">
        Sorted by {SORT_LABELS[sortKey]},{" "}
        {direction === "asc" ? "ascending" : "descending"} · select a column
        heading to sort
      </span>
      <div className="flex flex-col">
        <div
          className={cn(
            ROW,
            "items-end border-border border-b pb-2 text-muted text-xs",
          )}
        >
          <span className={cn(CELL.rank, "font-semibold")}>#</span>
          <span className={CELL.make}>{header("make", "Make")}</span>
          <span className={CELL.count}>
            {header("count", "Registrations", "Regs")}
          </span>
          <span className={cn(CELL.share, "font-semibold")}>
            <span className="max-md:hidden">Share of type</span>
            <span className="md:hidden">Share</span>
          </span>
          <span className={CELL.change}>
            {header("change", "vs a year earlier", "Change")}
          </span>
        </div>
        {sortMakeRows(rows, sortKey, direction).map((row) => (
          <div
            className={cn(
              ROW,
              "border-separator border-b py-2.5 transition-colors hover:bg-surface-secondary",
            )}
            key={row.make}
          >
            <span
              className={cn(
                CELL.rank,
                "text-sm tabular-nums",
                row.rank <= 3
                  ? "font-semibold text-accent-strong"
                  : "text-muted",
              )}
            >
              {String(row.rank).padStart(2, "0")}
            </span>
            <span className={cn(CELL.make, "flex items-center gap-2.5")}>
              <MakeAvatar logoUrl={row.logoUrl} make={row.make} size="sm" />
              <Link
                className="truncate font-medium text-foreground text-sm hover:text-accent-strong"
                href={`/cars/makes/${slugify(row.make)}`}
              >
                {row.make}
              </Link>
            </span>
            <span
              className={cn(CELL.count, "font-semibold text-sm tabular-nums")}
            >
              {row.count.toLocaleString("en-SG")}
            </span>
            <span className={CELL.share}>
              <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary max-md:hidden">
                <span
                  className="block h-full rounded-r-xs"
                  style={{
                    background:
                      row.rank === 1 ? "var(--chart-1)" : "var(--chart-3)",
                    width: `${((row.count / leader) * 100).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-12 shrink-0 text-right text-muted-strong text-sm tabular-nums">
                {((row.count / (total || 1)) * 100).toFixed(1)}%
              </span>
            </span>
            <DeltaChip
              className={cn(CELL.change, "text-sm")}
              value={row.change}
            />
          </div>
        ))}
        {rows.length === 0 ? (
          <span className="px-2 py-6 text-muted text-sm">
            No {vehicleType} registrations in the period.
          </span>
        ) : null}
      </div>
    </div>
  );
}
