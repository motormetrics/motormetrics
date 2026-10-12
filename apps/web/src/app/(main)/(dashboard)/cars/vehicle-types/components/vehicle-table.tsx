"use client";

import { cn } from "@heroui/react";
import { slugify } from "@motormetrics/utils/slugify";
import {
  type SortDirection,
  sortVehicleRows,
  type VehicleRow,
  type VehicleSortKey,
} from "@web/app/(main)/(dashboard)/cars/vehicle-types/components/sort-vehicle-rows";
import { DeltaChip } from "@web/components/shared/delta-chip";
import Link from "next/link";
import { useState } from "react";

/** Column widths on the fixed table layout; name and description share the rest. */
const CELL = {
  change: "w-20 max-md:w-14",
  count: "w-28 max-md:w-14 max-xl:w-24",
  electric: "w-20 max-md:w-12",
  share: "w-44 max-md:w-14 max-xl:w-32",
};

/**
 * Every vehicle type in the period as a ruled list, sortable on the name,
 * count, electric and change columns. A fixed-layout table with preset column
 * widths, so the description drops out below `lg` and the share bar on
 * phones, where the headings shorten, as the comp does.
 */
export function VehicleTable({
  countLabel,
  rows,
  yearAgoLabel,
}: {
  /** "Registrations" for a month, "Year to date" for the year so far. */
  countLabel: string;
  /** Largest first. */
  rows: VehicleRow[];
  /** "2025", heading the change column. */
  yearAgoLabel: string;
}) {
  const [sortKey, setSortKey] = useState<VehicleSortKey>("count");
  const [direction, setDirection] = useState<SortDirection>("descending");
  const largest = Math.max(...rows.map(({ share }) => share), 1);

  const sortBy = (key: VehicleSortKey) => {
    if (key === sortKey) {
      setDirection(direction === "ascending" ? "descending" : "ascending");
      return;
    }
    setSortKey(key);
    // Only name starts ascending; a figure column starts largest first.
    setDirection(key === "label" ? "ascending" : "descending");
  };

  const header = (
    key: VehicleSortKey,
    label: string,
    shortLabel: string,
    className?: string,
  ) => {
    const isSorted = key === sortKey;
    return (
      <th
        aria-sort={isSorted ? direction : "none"}
        className={cn("px-2 pb-2 font-normal max-md:px-0.5", className)}
        scope="col"
      >
        <button
          className={cn(
            "block w-full cursor-pointer whitespace-nowrap font-semibold text-xs",
            key === "label" ? "text-left" : "text-right",
            isSorted ? "text-accent-strong" : "text-muted",
          )}
          onClick={() => sortBy(key)}
          type="button"
        >
          <span className="max-md:hidden">{label}</span>
          <span className="md:hidden">{shortLabel}</span>
          {isSorted ? (
            <span aria-hidden>{direction === "ascending" ? " ↑" : " ↓"}</span>
          ) : null}
        </button>
      </th>
    );
  };

  return (
    <table aria-label="Vehicle types" className="w-full table-fixed">
      <thead>
        <tr className="border-border border-b *:align-bottom">
          {header("label", "Vehicle type", "Type")}
          <th
            className="px-2 pb-2 text-left font-semibold text-muted text-xs max-lg:hidden"
            scope="col"
          >
            Description
          </th>
          {header("count", countLabel, "Cars", CELL.count)}
          <th
            className={cn(
              CELL.share,
              "px-2 pb-2 text-right font-semibold text-muted text-xs max-md:px-0.5",
            )}
            scope="col"
          >
            Share
          </th>
          {header("electric", "Electric", "EV", CELL.electric)}
          {header(
            "change",
            `vs ${yearAgoLabel}`,
            `vs ${yearAgoLabel}`,
            CELL.change,
          )}
        </tr>
      </thead>
      <tbody>
        {sortVehicleRows(rows, sortKey, direction).map((row) => (
          <tr
            className="border-separator border-b *:px-2 *:py-2.5 hover:bg-surface-secondary max-md:*:px-0.5"
            key={row.name}
          >
            <th className="text-left font-medium text-sm" scope="row">
              <span className="flex min-w-0 items-center gap-2.5">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-sm"
                  style={{ backgroundColor: row.color }}
                />
                <Link
                  className="truncate text-foreground hover:text-accent-strong"
                  href={`/cars/vehicle-types/${slugify(row.name)}`}
                >
                  {row.label}
                </Link>
              </span>
            </th>
            <td className="truncate text-muted text-sm max-lg:hidden">
              {row.description}
            </td>
            <td className="text-right font-semibold text-sm tabular-nums">
              {row.count.toLocaleString("en-SG")}
            </td>
            <td>
              <span className="flex items-center gap-2.5">
                <span className="h-2.5 min-w-0 flex-1 rounded-r-sm bg-surface-secondary max-md:hidden">
                  <span
                    className="block h-full rounded-r-sm"
                    style={{
                      backgroundColor:
                        row.share === largest
                          ? "var(--chart-1)"
                          : "var(--chart-3)",
                      width: `${(row.share / largest) * 100}%`,
                    }}
                  />
                </span>
                <span className="ml-auto w-12 shrink-0 text-right text-muted-strong text-xs tabular-nums">
                  {row.share.toFixed(1)}%
                </span>
              </span>
            </td>
            <td className="text-right text-muted-strong text-sm tabular-nums">
              {row.electric === null ? "—" : `${row.electric.toFixed(1)}%`}
            </td>
            <td className="text-right text-sm">
              <DeltaChip unit="pp" value={row.change} />
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
