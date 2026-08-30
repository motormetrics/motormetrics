"use client";

import { cn, Typography } from "@heroui/react";
import {
  changeRatio,
  type DimensionLabels,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SurfaceCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { TABLE_HEADER_CLASS } from "@web/components/shared/report-table";
import { useMemo, useState } from "react";

type SortKey = "name" | "population" | "change";
type SortDirection = "asc" | "desc";

/** Shared padding and hover wash for every body cell. */
const CELL_CLASS = "px-4 py-4 align-middle";

/** Ranks past this share the last chart colour rather than wrapping around. */
const CHART_COLOURS = 6;

/**
 * Rows shown before the reader asks for the rest. Vehicle types fit in full;
 * makes run to dozens whose tail is a few dozen cars each.
 */
const COLLAPSED_ROWS = 10;

const numberFormatter = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

const SORT_LABELS: Record<SortKey, string> = {
  change: "change",
  name: "name",
  population: "population",
};

interface PopulationRank {
  change: number | null;
  colour: string;
  name: string;
  population: number;
  share: number;
}

/**
 * Every vehicle type or make at the selected year end, sorted on any column
 * and selectable: picking a row focuses the hero, the fuel mix and the chart
 * on it, the way the comp's class tabs do.
 *
 * A real `<table>` rather than the comp's CSS grid, because sortable headers
 * need `aria-sort` on a `columnheader` and overriding a table's `display`
 * strips those semantics in most browsers.
 */
export function PopulationTable({
  entities,
  focus,
  labels,
  onSelect,
  previousYear,
  year,
}: {
  entities: PopulationEntity[];
  /** Name of the focused row, or null for every entity summed. */
  focus: string | null;
  labels: DimensionLabels;
  onSelect: (name: string | null) => void;
  previousYear: string | null;
  year: string;
}) {
  const [sortKey, setSortKey] = useState<SortKey>("population");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isExpanded, setIsExpanded] = useState(false);

  const ranked = useMemo<PopulationRank[]>(() => {
    const populations = entities.map((entity) => entity.series.at(-1) ?? 0);
    const total = populations.reduce((sum, value) => sum + value, 0) || 1;

    return entities.map((entity, index) => ({
      change: changeRatio(entity.series),
      // Rank comes from the incoming order, which is already largest first, so
      // a row keeps its colour when the table is re-sorted.
      colour: `var(--chart-${Math.min(CHART_COLOURS, index + 1)})`,
      name: entity.name,
      population: populations[index],
      share: (populations[index] / total) * 100,
    }));
  }, [entities]);

  const largest = Math.max(...ranked.map((row) => row.population), 1);

  const sorted = useMemo(() => {
    const sign = sortDirection === "asc" ? 1 : -1;
    return ranked.slice().sort((first, second) => {
      if (sortKey === "name") {
        return sign * first.name.localeCompare(second.name, "en-SG");
      }
      if (sortKey === "change") {
        return sign * ((first.change ?? 0) - (second.change ?? 0));
      }
      return sign * (first.population - second.population);
    });
  }, [ranked, sortDirection, sortKey]);

  const isTruncated = !isExpanded && sorted.length > COLLAPSED_ROWS;
  const displayed = isTruncated ? sorted.slice(0, COLLAPSED_ROWS) : sorted;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  const headers: {
    align: "left" | "right";
    key: SortKey | "share";
    label: string;
    /** Omitted on the name column, which takes whatever is left over. */
    width?: string;
  }[] = [
    { align: "left", key: "name", label: labels.column },
    { align: "right", key: "population", label: "Population", width: "w-28" },
    { align: "left", key: "share", label: "Share", width: "w-[11rem]" },
    { align: "right", key: "change", label: "Change", width: "w-28" },
  ];

  return (
    <SurfaceCard className="gap-5">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex flex-col">
          <Typography.Heading level={3}>{labels.title}</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm">
            {year} · {sorted.length} {labels.plural}
          </Typography.Paragraph>
        </div>
        <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
          Sorted by {SORT_LABELS[sortKey]},{" "}
          {sortDirection === "asc" ? "ascending" : "descending"}
        </span>
      </div>

      <table className="w-full table-fixed border-separate border-spacing-0">
        <caption className="sr-only">
          {labels.title}, {year}
        </caption>
        <thead>
          <tr>
            {headers.map((header) => {
              const alignment =
                header.align === "right" ? "text-right" : "text-left";
              const cellClass = cn(
                "border-border border-b px-4 pt-4 pb-3",
                header.width,
                alignment,
              );

              if (header.key === "share") {
                return (
                  <th
                    className={cn(cellClass, TABLE_HEADER_CLASS, "text-muted")}
                    key={header.key}
                    scope="col"
                  >
                    {header.label}
                  </th>
                );
              }

              const columnKey = header.key;
              const isActive = columnKey === sortKey;
              return (
                <th
                  aria-sort={
                    isActive
                      ? sortDirection === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cellClass}
                  key={columnKey}
                  scope="col"
                >
                  <button
                    className={cn(
                      TABLE_HEADER_CLASS,
                      "cursor-pointer",
                      isActive ? "text-accent-strong" : "text-muted",
                    )}
                    onClick={() => toggleSort(columnKey)}
                    type="button"
                  >
                    {header.label}
                    {isActive ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {displayed.map((row) => {
            const isFocused = row.name === focus;
            // Backgrounds sit on the cells rather than the row so the focused
            // wash keeps the rounded ends the comp draws.
            const cellTone = isFocused
              ? "bg-accent-soft-2 group-hover:bg-accent-soft-2"
              : "group-hover:bg-background";
            return (
              <tr className="group" key={row.name}>
                <td className={cn(CELL_CLASS, cellTone, "rounded-l-field")}>
                  <button
                    aria-pressed={isFocused}
                    className="flex min-w-0 cursor-pointer items-center gap-3 text-left"
                    onClick={() => onSelect(isFocused ? null : row.name)}
                    type="button"
                  >
                    <span
                      aria-hidden
                      className="size-3.5 shrink-0 rounded-full"
                      style={{ background: row.colour }}
                    />
                    <span className="truncate font-bold text-base">
                      {row.name}
                    </span>
                  </button>
                </td>
                <td
                  className={cn(
                    CELL_CLASS,
                    cellTone,
                    "text-right font-extrabold text-base tabular-nums",
                  )}
                >
                  {numberFormatter.format(row.population)}
                </td>
                <td className={cn(CELL_CLASS, cellTone)}>
                  <span className="flex items-center gap-2.5">
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-default">
                      <span
                        className="block h-full rounded-full"
                        style={{
                          background: row.colour,
                          width: `${((row.population / largest) * 100).toFixed(1)}%`,
                        }}
                      />
                    </span>
                    <span className="w-11 text-right font-bold text-muted text-sm tabular-nums">
                      {row.share.toFixed(1)}%
                    </span>
                  </span>
                </td>
                <td
                  className={cn(
                    CELL_CLASS,
                    cellTone,
                    "rounded-r-field text-right",
                  )}
                >
                  {row.change === null ? (
                    <span className="font-semibold text-muted text-sm">—</span>
                  ) : (
                    <DeltaChip value={row.change * 100} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {isTruncated ? (
        <button
          className="cursor-pointer self-center rounded-full bg-default px-6 py-3 font-bold text-muted text-sm transition-colors hover:text-foreground"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          Show all {sorted.length} {labels.plural}
        </button>
      ) : null}

      <Typography.Paragraph color="muted" size="sm" className="px-4">
        Population counts are taken at 31 December each year.
        {previousYear === null ? null : ` Change is against ${previousYear}.`}
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
