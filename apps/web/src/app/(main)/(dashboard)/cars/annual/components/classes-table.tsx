"use client";

import { Button, cn, ProgressBar, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  CARS,
  type ClassRank,
  type ClassSortKey,
  type SortDirection,
  sortClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead } from "@web/components/shared/overview";
import { useMemo, useState } from "react";

const COLUMNS: {
  align: "left" | "right";
  key: ClassSortKey | null;
  label: string;
}[] = [
  { align: "left", key: "name", label: "Vehicle class" },
  { align: "right", key: "population", label: "Population" },
  { align: "left", key: null, label: "Share" },
  { align: "right", key: "change", label: "Change" },
];

const SORT_LABELS: Record<ClassSortKey, string> = {
  change: "change",
  name: "name",
  population: "population",
};

/**
 * Below `sm` the share bar is dropped and the remaining columns tighten, the
 * way the makes table does: the class name is what pays for the bar, and on a
 * phone it would truncate to nothing beside it.
 */
const GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_88px_64px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_140px_minmax(120px,220px)_110px] sm:gap-4";

/**
 * The change figure as bare coloured text, for the phone column where the
 * chip would overrun the population figure beside it.
 */
function ChangeText({ value }: { value: number }) {
  return (
    <span
      className={cn(
        "text-right font-bold text-xs tabular-nums",
        value >= 0
          ? "text-success-soft-foreground"
          : "text-warning-soft-foreground",
      )}
    >
      {value >= 0 ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

/**
 * Every vehicle class at the latest year end, sortable on any column, with
 * cars tinted so the page's subject reads in context. Sort is view-only, so
 * it lives in local state and never touches the URL.
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
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const sorted = useMemo(
    () => sortClasses(rows, sortKey, sortDirection),
    [rows, sortDirection, sortKey],
  );
  const largest = Math.max(...rows.map((row) => row.population), 1);

  const toggleSort = (key: ClassSortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`${rows.length} ${rows.length === 1 ? "class" : "classes"} · cars in context`}
        eyebrow={year}
        title="All vehicle classes"
      />

      <div className="flex flex-col">
        <div className={cn(GRID_CLASS, "border-separator border-b px-2 pb-3")}>
          {COLUMNS.map((column) => {
            const isActive = column.key !== null && column.key === sortKey;
            const className = cn(
              "font-semibold text-[13px]",
              column.align === "right" ? "text-right" : "text-left",
              column.label === "Share" && "hidden sm:block",
              isActive ? "text-accent-strong" : "text-muted",
            );

            if (column.key === null) {
              return (
                <Typography.Paragraph
                  className={className}
                  color="muted"
                  key={column.label}
                  size="xs"
                >
                  {column.label}
                </Typography.Paragraph>
              );
            }

            const sortKeyForColumn = column.key;
            return (
              <Button
                className={cn(
                  className,
                  "h-auto justify-start gap-0 rounded-none bg-transparent p-0 hover:bg-transparent data-[pressed=true]:scale-100",
                  column.align === "right" && "justify-end",
                )}
                key={column.label}
                onPress={() => toggleSort(sortKeyForColumn)}
                variant="ghost"
              >
                {column.label}
                {isActive ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
              </Button>
            );
          })}
        </div>

        {sorted.map((row) => {
          const isCars = row.name === CARS;
          return (
            <div
              className={cn(
                GRID_CLASS,
                "border-separator border-b px-2 py-[15px]",
                isCars && "rounded-[14px] bg-accent-soft-2",
              )}
              key={row.name}
            >
              <span className="flex min-w-0 items-center gap-3">
                <span
                  aria-hidden
                  className="size-3 shrink-0 rounded-full"
                  style={{ background: row.colour }}
                />
                <span
                  className={cn(
                    "truncate text-base",
                    isCars
                      ? "font-extrabold text-accent-strong"
                      : "font-semibold text-foreground/85",
                  )}
                >
                  {row.name}
                </span>
              </span>

              <span className="text-right font-extrabold text-base tabular-nums">
                <NumberValue
                  locale="en-SG"
                  maximumFractionDigits={0}
                  value={row.population}
                />
              </span>

              <span className="hidden items-center gap-2.5 sm:flex">
                <ProgressBar
                  aria-label={`${row.name} share of the largest class`}
                  className="min-w-0 flex-1"
                  value={(row.population / largest) * 100}
                >
                  <ProgressBar.Track className="h-2.5 rounded-full bg-surface-secondary">
                    <ProgressBar.Fill
                      className="rounded-full"
                      style={{ background: row.colour }}
                    />
                  </ProgressBar.Track>
                </ProgressBar>
                <span className="w-11 text-right font-bold text-[13.5px] text-muted-strong tabular-nums">
                  {row.share.toFixed(1)}%
                </span>
              </span>

              {row.change === null ? (
                <Typography.Paragraph
                  className="text-right font-semibold"
                  color="muted"
                  size="sm"
                >
                  —
                </Typography.Paragraph>
              ) : (
                <>
                  <span className="text-right sm:hidden">
                    <ChangeText value={row.change * 100} />
                  </span>
                  <DeltaChip
                    className="hidden justify-self-end sm:flex"
                    value={row.change * 100}
                  />
                </>
              )}
            </div>
          );
        })}
      </div>

      <Typography.Paragraph color="muted" size="sm">
        Population counts are taken at 31 December each year.
        {previousYear === null ? null : ` Change is against ${previousYear}.`}{" "}
        Sorted by {SORT_LABELS[sortKey]},{" "}
        {sortDirection === "asc" ? "ascending" : "descending"}.
      </Typography.Paragraph>
    </div>
  );
}
