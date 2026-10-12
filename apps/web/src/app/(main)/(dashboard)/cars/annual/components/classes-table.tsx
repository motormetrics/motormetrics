"use client";

import { cn } from "@heroui/react";
import {
  CARS,
  type ClassRank,
  type ClassSortKey,
  type SortDirection,
  sortClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead, SourceNote } from "@web/components/shared/overview";
import { useState } from "react";

const SORT_LABELS: Record<ClassSortKey, string> = {
  change: "change",
  name: "name",
  population: "vehicles",
};

/** Column widths on the fixed table layout; the class column takes the rest. */
const CELL = {
  change: "w-20 max-md:w-16",
  population: "w-28 max-md:w-20",
  share: "w-44 max-md:w-16 max-lg:w-32",
};

/**
 * Every vehicle class at the latest year end as a ruled list, sortable on
 * the class, vehicles and change columns, with cars highlighted so the page's
 * subject reads in context. A fixed-layout table with preset column widths,
 * so the share bar can drop out on phones as the comp does.
 */
export function ClassesTable({
  previousYear,
  rows,
  year,
}: {
  previousYear: string | null;
  /** Largest first, as `rankClasses` returns them. */
  rows: ClassRank[];
  year: string;
}) {
  const [sortKey, setSortKey] = useState<ClassSortKey>("population");
  const [direction, setDirection] = useState<SortDirection>("descending");
  const largest = Math.max(...rows.map((row) => row.population), 1);
  const total = rows.reduce((sum, row) => sum + row.population, 0);

  const sortBy = (key: ClassSortKey) => {
    if (key === sortKey) {
      setDirection(direction === "ascending" ? "descending" : "ascending");
      return;
    }
    setSortKey(key);
    // Only name starts ascending; a figure column starts largest first.
    setDirection(key === "name" ? "ascending" : "descending");
  };

  const header = (key: ClassSortKey, label: string, className?: string) => {
    const isSorted = key === sortKey;
    return (
      <th
        aria-sort={isSorted ? direction : "none"}
        className={cn("px-2 pb-2 font-normal max-md:px-1", className)}
        scope="col"
      >
        <button
          className={cn(
            "block w-full cursor-pointer whitespace-nowrap font-semibold text-xs",
            key === "name" ? "text-left" : "text-right",
            isSorted ? "text-accent-strong" : "text-muted",
          )}
          onClick={() => sortBy(key)}
          type="button"
        >
          {label}
          {isSorted ? (
            <span aria-hidden>{direction === "ascending" ? " ↑" : " ↓"}</span>
          ) : null}
        </button>
      </th>
    );
  };

  return (
    <section className="flex min-w-0 flex-col gap-4">
      <SectionHead
        caption={`${rows.length} ${rows.length === 1 ? "class" : "classes"} · ${total.toLocaleString("en-SG")} vehicles · select a heading to sort`}
        eyebrow={year}
        title="All vehicle classes"
      />

      <table aria-label="Vehicle classes" className="w-full table-fixed">
        <thead>
          <tr className="border-border border-b *:align-bottom">
            {header("name", "Vehicle class")}
            {header("population", "Vehicles", CELL.population)}
            <th
              className={cn(
                CELL.share,
                "px-2 pb-2 text-right font-semibold text-muted text-xs max-md:px-1",
              )}
              scope="col"
            >
              Share
            </th>
            {header(
              "change",
              previousYear === null ? "Change" : `vs ${previousYear}`,
              CELL.change,
            )}
          </tr>
        </thead>
        <tbody>
          {sortClasses(rows, sortKey, direction).map((row) => {
            const isCars = row.name === CARS;
            return (
              <tr
                className={cn(
                  "border-separator border-b *:px-2 *:py-2.5 max-md:*:px-1",
                  isCars ? "bg-accent-soft" : "hover:bg-surface-secondary",
                )}
                key={row.name}
              >
                <th
                  className={cn(
                    "truncate text-left text-sm",
                    isCars
                      ? "border-l-2 border-l-accent font-bold text-accent-strong"
                      : "font-medium",
                  )}
                  scope="row"
                >
                  {row.name}
                </th>
                <td className="text-right font-semibold text-sm tabular-nums">
                  {row.population.toLocaleString("en-SG")}
                </td>
                <td>
                  <span className="flex items-center gap-2.5">
                    <span className="h-2.5 min-w-0 flex-1 rounded-r-sm bg-surface-secondary max-md:hidden">
                      <span
                        className="block h-full rounded-r-sm"
                        style={{
                          backgroundColor: isCars
                            ? "var(--chart-1)"
                            : "var(--chart-3)",
                          width: `${(row.population / largest) * 100}%`,
                        }}
                      />
                    </span>
                    <span className="ml-auto w-12 shrink-0 text-right text-muted-strong text-xs tabular-nums">
                      {row.share.toFixed(1)}%
                    </span>
                  </span>
                </td>
                <td className="text-right text-sm">
                  {row.change === null ? (
                    <span className="text-muted">—</span>
                  ) : (
                    <DeltaChip value={row.change * 100} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <SourceNote>
        Population at 31 December {year}.
        {previousYear === null
          ? null
          : ` Change is against ${previousYear}; colour is not used for direction.`}{" "}
        Sorted by {SORT_LABELS[sortKey]}, {direction}.
      </SourceNote>
    </section>
  );
}
