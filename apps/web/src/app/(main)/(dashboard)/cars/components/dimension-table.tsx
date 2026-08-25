"use client";

import { cn } from "@heroui/react";
import {
  CAR_DIMENSIONS,
  DIMENSION_LABELS,
} from "@web/app/(main)/(dashboard)/cars/components/dimensions";
import Typography from "@web/components/typography";
import { SurfaceCard } from "@web/components/v2/bento";
import { DeltaChip } from "@web/components/v2/delta-chip";
import type { CarDimension, DimensionStat } from "@web/queries/cars";
import { Car, Search } from "lucide-react";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState, useTransition } from "react";

type SortKey = "name" | "count" | "yoyChange";
type SortDirection = "asc" | "desc";

/** Shared padding and hover wash for every body cell. */
const CELL_CLASS = "px-4 py-4 align-middle group-hover:bg-background";

/** Ranks past this share the last chart colour rather than wrapping around. */
const CHART_COLOURS = 6;

/** Ranks up to this are picked out in the accent rather than the neutral. */
const PODIUM = 3;

/**
 * Rows shown before the reader asks for the rest. The full list runs to every
 * make on record, whose tail is dozens of marques on one or two registrations —
 * a long scroll that buries the makes actually carrying the market.
 */
const COLLAPSED_ROWS = 10;

/**
 * Below this many registrations the year-over-year percentage is suppressed.
 *
 * The arithmetic is correct but the figure is not informative: two cars
 * becoming four is a true +100%, and rendering it in the same chip as a real
 * movement invites the eye to read the loudest number as the biggest story.
 */
const MIN_COUNT_FOR_CHANGE = 20;

const numberFormatter = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

const SORT_LABELS: Record<SortKey, string> = {
  name: "name",
  count: "registrations",
  yoyChange: "change",
};

interface RankedStat extends DimensionStat {
  rank: number;
}

function compareStats(
  first: RankedStat,
  second: RankedStat,
  sortKey: SortKey,
  sortDirection: SortDirection,
) {
  const sign = sortDirection === "asc" ? 1 : -1;

  if (sortKey === "name") {
    return sign * first.name.localeCompare(second.name, "en-SG");
  }

  if (sortKey === "yoyChange") {
    // A value with no comparable prior period sorts last in either direction,
    // rather than being read as a change of zero.
    if (first.yoyChange === null || second.yoyChange === null) {
      return (
        (first.yoyChange === null ? 1 : 0) - (second.yoyChange === null ? 1 : 0)
      );
    }
    return sign * (first.yoyChange - second.yoyChange);
  }

  return sign * (first.count - second.count);
}

/**
 * The Cars overview dimension table: tabs that swap the data set through the
 * URL, and a search box plus sortable headers that only reorder what has
 * already been fetched.
 *
 * A real `<table>` rather than the comp's CSS grid: sortable column headers
 * need `aria-sort` on a `columnheader`, and overriding a table's `display` to
 * lay it out as a grid strips those semantics in most browsers.
 */
export function DimensionTable({
  dimension,
  monthLabel,
  rows,
}: {
  dimension: CarDimension;
  monthLabel: string;
  rows: DimensionStat[];
}) {
  const [isPending, startTransition] = useTransition();
  const [, setDimension] = useQueryState(
    "dimension",
    parseAsStringLiteral(CAR_DIMENSIONS)
      .withDefault("make")
      .withOptions({ shallow: false, startTransition }),
  );
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isExpanded, setIsExpanded] = useState(false);

  const labels = DIMENSION_LABELS[dimension];

  // Rank comes from the unfiltered order so a row keeps its standing when the
  // list is searched or re-sorted.
  const ranked = useMemo<RankedStat[]>(
    () =>
      rows
        .slice()
        .sort((first, second) => second.count - first.count)
        .map((row, index) => ({ ...row, rank: index + 1 })),
    [rows],
  );

  const largestCount = ranked[0]?.count ?? 1;

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return ranked
      .filter((row) => !needle || row.name.toLowerCase().includes(needle))
      .sort((first, second) =>
        compareStats(first, second, sortKey, sortDirection),
      );
  }, [ranked, query, sortDirection, sortKey]);

  // A search is already a narrowing, so matches are never truncated on top of
  // it — collapsing only applies to the unfiltered list.
  const isSearching = query.trim().length > 0;
  const isTruncated =
    !isExpanded && !isSearching && visible.length > COLLAPSED_ROWS;
  const displayed = isTruncated ? visible.slice(0, COLLAPSED_ROWS) : visible;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "name" ? "asc" : "desc");
  };

  // `share` is derived from `count`, so sorting on it would only duplicate the
  // registrations column — it is a header, not a control.
  const headers: {
    align: "left" | "right";
    key: SortKey | "share";
    label: string;
    /** Omitted on the name column, which takes whatever is left over. */
    width?: string;
  }[] = [
    { align: "left", key: "name", label: labels.column },
    {
      align: "right",
      key: "count",
      label: "Registrations",
      width: "w-[5.5rem]",
    },
    { align: "left", key: "share", label: "Share", width: "w-[9rem]" },
    { align: "right", key: "yoyChange", label: "Change", width: "w-[6.5rem]" },
  ];

  const headerClass = "font-bold text-xs uppercase tracking-[0.06em]";

  return (
    <SurfaceCard className="gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Car aria-hidden className="size-5" />
        </span>
        <div className="flex flex-col">
          <Typography.H3 className="font-bold tracking-[-0.02em]">
            {labels.title}
          </Typography.H3>
          <Typography.TextSm className="font-semibold text-muted">
            Year to date through {monthLabel} ·{" "}
            {isTruncated
              ? `top ${displayed.length} of ${visible.length}`
              : `${visible.length} ${visible.length === 1 ? "row" : "rows"}`}
          </Typography.TextSm>
        </div>
        <div className="ml-auto flex gap-1.5 rounded-full bg-default p-1.5">
          {CAR_DIMENSIONS.map((option) => {
            const isActive = option === dimension;
            return (
              <button
                aria-pressed={isActive}
                className={cn(
                  "cursor-[var(--cursor-interactive)] whitespace-nowrap rounded-full px-4 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-surface font-extrabold text-foreground shadow-surface"
                    : "font-semibold text-[var(--muted-strong)] hover:text-foreground",
                )}
                key={option}
                onClick={() => {
                  setQuery("");
                  setSortKey("count");
                  setSortDirection("desc");
                  setIsExpanded(false);
                  setDimension(option);
                }}
                type="button"
              >
                {DIMENSION_LABELS[option].tab}
              </button>
            );
          })}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-2.5 rounded-full bg-background px-5 py-3 text-[var(--subtle)]">
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">{labels.searchLabel}</span>
          <input
            className="w-full border-none bg-transparent font-semibold text-foreground text-sm outline-none placeholder:text-[var(--subtle)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${labels.searchLabel} …`}
            type="search"
            value={query}
          />
        </label>
        <span className="whitespace-nowrap font-semibold text-[13.5px] text-[var(--subtle)]">
          Sorted by {SORT_LABELS[sortKey]},{" "}
          {sortDirection === "asc" ? "ascending" : "descending"}
        </span>
      </div>

      <table
        className={cn(
          "w-full table-fixed border-separate border-spacing-0 transition-opacity",
          isPending && "opacity-60",
        )}
      >
        <caption className="sr-only">
          {labels.title}, year to date through {monthLabel}
        </caption>
        <thead>
          <tr>
            {headers.map((header) => {
              const alignment =
                header.align === "right" ? "text-right" : "text-left";
              const cellClass = cn(
                "border-[var(--border)] border-b px-4 pt-4 pb-3",
                header.width,
                alignment,
              );

              if (header.key === "share") {
                return (
                  <th
                    className={cn(
                      cellClass,
                      headerClass,
                      "text-[var(--subtle)]",
                    )}
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
                      headerClass,
                      "cursor-[var(--cursor-interactive)]",
                      isActive
                        ? "text-[var(--accent-strong)]"
                        : "text-[var(--subtle)]",
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
          {displayed.map((row) => (
            <tr className="group" key={row.name}>
              <td className={cn(CELL_CLASS, "rounded-l-[var(--radius)]")}>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "inline-flex size-8 shrink-0 items-center justify-center rounded-full font-extrabold text-xs",
                      row.rank <= PODIUM
                        ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                        : "bg-default text-muted",
                    )}
                  >
                    {row.rank}
                  </span>
                  <span className="truncate font-bold text-base">
                    {row.name}
                  </span>
                </span>
              </td>
              <td
                className={cn(
                  CELL_CLASS,
                  "text-right font-extrabold text-base tabular-nums",
                )}
              >
                {numberFormatter.format(row.count)}
              </td>
              <td className={CELL_CLASS}>
                <span className="flex items-center gap-2.5">
                  <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-default">
                    <span
                      className="block h-full rounded-full"
                      style={{
                        background: `var(--chart-${Math.min(CHART_COLOURS, row.rank)})`,
                        width: `${((row.count / largestCount) * 100).toFixed(1)}%`,
                      }}
                    />
                  </span>
                  <span className="w-11 text-right font-bold text-[13.5px] text-[var(--muted-strong)] tabular-nums">
                    {row.share.toFixed(1)}%
                  </span>
                </span>
              </td>
              <td className={cn(CELL_CLASS, "rounded-r-[var(--radius)]")}>
                <span className="flex justify-end">
                  {row.count < MIN_COUNT_FOR_CHANGE ? (
                    <span
                      className="font-bold text-[var(--subtle)] text-sm"
                      title={`Too few registrations for a meaningful year-on-year change (under ${MIN_COUNT_FOR_CHANGE})`}
                    >
                      —
                    </span>
                  ) : row.yoyChange === null ? (
                    <span className="rounded-full bg-default px-3 py-2 font-bold text-[13px] text-muted">
                      New
                    </span>
                  ) : (
                    <DeltaChip ratio={row.yoyChange / 100} />
                  )}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {visible.length === 0 ? (
        <Typography.TextSm className="px-4 py-9 font-semibold text-[var(--subtle)]">
          Nothing matches “{query}”.
        </Typography.TextSm>
      ) : null}

      {!isSearching && visible.length > COLLAPSED_ROWS ? (
        <button
          aria-expanded={isExpanded}
          className="cursor-[var(--cursor-interactive)] self-center rounded-full bg-default px-6 py-3 font-bold text-[var(--muted-strong)] text-sm transition-colors hover:text-foreground"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded
            ? "Show fewer"
            : `Show all ${visible.length} ${labels.tab.toLowerCase()}`}
        </button>
      ) : null}

      <Typography.Caption className="px-4 font-medium text-[var(--subtle)]">
        Change compares against the same period a year earlier, and is withheld
        below {MIN_COUNT_FOR_CHANGE} registrations.
      </Typography.Caption>
    </SurfaceCard>
  );
}
