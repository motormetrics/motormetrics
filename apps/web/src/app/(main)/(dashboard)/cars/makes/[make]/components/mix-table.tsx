"use client";

import { cn } from "@heroui/react";
import {
  defaultMixDirection,
  type MixRow,
  type MixSortDirection,
  type MixSortKey,
  sortMixRows,
} from "@web/app/(main)/(dashboard)/cars/makes/[make]/components/mix-rows";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { useState } from "react";

/** Cell widths shared by the header and every row, so the columns line up. */
const CELL = {
  change: "w-16 shrink-0 text-right md:w-24",
  count: "w-12 shrink-0 text-right md:w-24",
  fuelType: "min-w-0 flex-1",
  rank: "w-5 shrink-0 md:w-7",
  share: "flex w-44 shrink-0 items-center gap-2.5 max-md:hidden",
  vehicleType: "min-w-0 flex-1",
} as const;

const SORTABLE: {
  className: string;
  key: MixSortKey;
  label: string;
  short: string;
}[] = [
  {
    className: CELL.fuelType,
    key: "fuelType",
    label: "Fuel type",
    short: "Fuel",
  },
  {
    className: CELL.vehicleType,
    key: "vehicleType",
    label: "Vehicle type",
    short: "Type",
  },
  {
    className: CELL.count,
    key: "count",
    label: "Registrations",
    short: "Regs",
  },
];

/**
 * The fuel type × vehicle type table as a ruled list. The rows render from
 * server data; only the sort is client state, as in the comp, so it stays out
 * of the URL.
 */
export function MixTable({ rows, total }: { rows: MixRow[]; total: number }) {
  const [sortKey, setSortKey] = useState<MixSortKey>("count");
  const [direction, setDirection] = useState<MixSortDirection>("desc");
  const leader = rows[0]?.count || 1;

  const sortBy = (key: MixSortKey) => {
    if (key === sortKey) {
      setDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setDirection(defaultMixDirection(key));
  };

  const header = (key: MixSortKey, label: string, short: string) => {
    const isActive = key === sortKey;
    return (
      <button
        className={cn(
          "cursor-pointer truncate font-semibold",
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
    <div className="flex flex-col">
      <div className="flex items-center gap-2 border-border border-b px-0.5 pb-2 text-muted text-xs md:gap-3.5 md:px-2">
        <span className={cn(CELL.rank, "font-semibold")}>#</span>
        {SORTABLE.map(({ className, key, label, short }) => (
          <span className={className} key={key}>
            {header(key, label, short)}
          </span>
        ))}
        <span className={cn(CELL.share, "font-semibold")}>Share</span>
        <span className={CELL.change}>
          {header("change", "vs year earlier", "Change")}
        </span>
      </div>
      {sortMixRows(rows, sortKey, direction).map((row) => (
        <div
          className="flex items-center gap-2 border-separator border-b px-0.5 py-2.5 transition-colors hover:bg-surface-secondary md:gap-3.5 md:px-2"
          key={`${row.fuelType}|${row.vehicleType}`}
        >
          <span
            className={cn(
              CELL.rank,
              "text-sm tabular-nums",
              row.rank <= 3 ? "font-semibold text-accent-strong" : "text-muted",
            )}
          >
            {String(row.rank).padStart(2, "0")}
          </span>
          <span className={cn(CELL.fuelType, "truncate text-sm")}>
            {row.fuelType}
          </span>
          <span
            className={cn(CELL.vehicleType, "truncate font-medium text-sm")}
          >
            {row.vehicleType}
          </span>
          <span
            className={cn(CELL.count, "font-semibold text-sm tabular-nums")}
          >
            {row.count.toLocaleString("en-SG")}
          </span>
          <span className={CELL.share}>
            <span className="block h-2.5 min-w-0 flex-1 bg-surface-secondary">
              <span
                className="block h-full rounded-r-xs"
                style={{
                  background:
                    row.rank === 1 ? "var(--chart-1)" : "var(--chart-3)",
                  width: `${((row.count / leader) * 100).toFixed(1)}%`,
                }}
              />
            </span>
            <span className="w-12 text-right text-muted text-sm tabular-nums">
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
          No registrations for this fuel type in the period.
        </span>
      ) : null}
    </div>
  );
}
