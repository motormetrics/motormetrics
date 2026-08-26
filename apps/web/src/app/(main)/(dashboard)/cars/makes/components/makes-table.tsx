"use client";

import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import Typography from "@web/components/typography";
import { SurfaceCard } from "@web/components/v2/bento";
import { DeltaChip } from "@web/components/v2/delta-chip";
import { Car, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { type ReactNode, useMemo, useState } from "react";
import { MakeAvatar } from "./make-avatar";
import type { MakeRow } from "./make-rows";

/** The trend series only feeds the hero sparkline, so it never crosses over. */
export type MakesTableRow = Omit<MakeRow, "trend">;

/**
 * Rows shown before the reader asks for the rest. Higher than the Cars
 * overview's preview, since browsing makes is the whole point of this page,
 * but still short of the full tail of marques on a handful of registrations.
 */
const COLLAPSED_ROWS = 20;

/**
 * Below this many registrations the year-over-year percentage is withheld.
 *
 * The arithmetic is right but the figure is not informative: two cars becoming
 * four is a true +100%, and in the same chip as a real movement it invites the
 * eye to read the loudest number as the biggest story.
 */
const MIN_COUNT_FOR_CHANGE = 20;

type SortKey = "count" | "make" | "yoyChange";
type SortDirection = "asc" | "desc";

const COLUMNS: {
  align: "left" | "right";
  key: SortKey | null;
  label: string;
}[] = [
  { align: "left", key: "make", label: "Make" },
  { align: "right", key: "count", label: "Registrations" },
  { align: "left", key: null, label: "Share" },
  { align: "right", key: "yoyChange", label: "Change" },
];

const SORT_LABELS: Record<SortKey, string> = {
  count: "registrations",
  make: "name",
  yoyChange: "change",
};

const GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_84px_92px_18px] items-center gap-3 sm:grid-cols-[minmax(0,1fr)_100px_minmax(90px,1fr)_96px_18px]";

/**
 * Keeps the funnel that used to be fed by the makes-page search autocomplete.
 *
 * The event name and its `make` property are deliberately unchanged from the
 * combo box this table replaced — it measures "user picked a make on the makes
 * page", and renaming it would split the existing PostHog series in two. It
 * fires on navigation, not on typing: the search box above is a local filter,
 * and capturing keystrokes would flood the funnel and change what it means.
 */
function trackMakeSelected(make: string) {
  posthog.capture("car_make_searched", { make });
}

function compareRows(a: MakesTableRow, b: MakesTableRow, key: SortKey): number {
  if (key === "make") {
    return a.make.localeCompare(b.make);
  }
  if (key === "yoyChange") {
    // A make with no prior year to compare against sorts as the lowest value
    // rather than pretending to be a 0% change.
    const left = a.yoyChange ?? Number.NEGATIVE_INFINITY;
    const right = b.yoyChange ?? Number.NEGATIVE_INFINITY;
    if (left === right) {
      return 0;
    }
    return left < right ? -1 : 1;
  }
  return a.count - b.count;
}

/**
 * The "All makes" table.
 *
 * Search and column sort are view-only, so they live in local state here and
 * never touch the URL — only the range and fuel tabs, which change what the
 * server has to aggregate, do that.
 */
export function MakesTable({
  fuelTabs,
  rangeLabel,
  rows,
}: {
  fuelTabs: ReactNode;
  rangeLabel: string;
  rows: MakesTableRow[];
}) {
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("count");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) => row.make.toLowerCase().includes(needle))
      : rows;

    return [...filtered].sort((a, b) => {
      const order = compareRows(a, b, sortKey);
      return sortDirection === "asc" ? order : -order;
    });
  }, [query, rows, sortDirection, sortKey]);

  // A search is already a narrowing, so matches are never truncated on top of
  // it — collapsing only applies to the unfiltered list.
  const isSearching = query.trim().length > 0;
  const isTruncated =
    !isExpanded && !isSearching && visibleRows.length > COLLAPSED_ROWS;
  const displayedRows = isTruncated
    ? visibleRows.slice(0, COLLAPSED_ROWS)
    : visibleRows;

  const toggleSort = (key: SortKey) => {
    if (key === sortKey) {
      setSortDirection((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortKey(key);
    setSortDirection(key === "make" ? "asc" : "desc");
  };

  return (
    <SurfaceCard className="gap-0">
      <div className="flex flex-wrap items-center gap-3.5">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-[var(--accent)] text-[var(--accent-foreground)]">
          <Car className="size-5.5" />
        </span>
        <div className="flex flex-col">
          <Typography.H3 className="font-bold tracking-[-0.02em]">
            All makes
          </Typography.H3>
          <Typography.Caption className="font-semibold text-[var(--muted)]">
            {rangeLabel} ·{" "}
            {isTruncated
              ? `top ${displayedRows.length} of ${visibleRows.length}`
              : `${visibleRows.length} ${visibleRows.length === 1 ? "make" : "makes"}`}
          </Typography.Caption>
        </div>
        <span className="ml-auto whitespace-nowrap font-semibold text-[13.5px] text-[var(--subtle)]">
          Sorted by {SORT_LABELS[sortKey]},{" "}
          {sortDirection === "asc" ? "ascending" : "descending"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="flex min-w-56 flex-1 items-center gap-2.5 rounded-full bg-background px-5 py-3 text-[var(--subtle)]">
          <Search aria-hidden className="size-4.5 shrink-0" />
          <input
            aria-label="Search makes"
            className="w-full border-none bg-transparent font-semibold text-[15px] text-foreground outline-none placeholder:text-[var(--subtle)]"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${rows.length} makes …`}
            type="text"
            value={query}
          />
        </span>
        {fuelTabs}
      </div>

      <div
        className={cn(
          GRID_CLASS,
          "mt-3.5 border-[var(--border)] border-b px-4.5 pt-4 pb-3",
        )}
      >
        {COLUMNS.map((column) => {
          const isActive = column.key !== null && column.key === sortKey;
          const className = cn(
            "font-bold text-[13px] uppercase tracking-[0.06em]",
            column.align === "right" ? "text-right" : "text-left",
            column.label === "Share" && "hidden sm:block",
            isActive ? "text-[var(--accent-strong)]" : "text-[var(--subtle)]",
          );

          if (column.key === null) {
            return (
              <span className={className} key={column.label}>
                {column.label}
              </span>
            );
          }

          const sortKeyForColumn = column.key;
          return (
            <button
              className={cn(className, "cursor-pointer")}
              key={column.label}
              onClick={() => toggleSort(sortKeyForColumn)}
              type="button"
            >
              {column.label}
              {isActive ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
            </button>
          );
        })}
        <span />
      </div>

      <div className="flex flex-col">
        {displayedRows.map((row) => (
          <Link
            className={cn(
              GRID_CLASS,
              "rounded-[var(--radius)] px-4.5 py-4 no-underline transition-colors hover:bg-background",
            )}
            href={`/cars/makes/${row.slug}`}
            key={row.make}
            onClick={() => trackMakeSelected(row.make)}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex size-7.5 shrink-0 items-center justify-center rounded-full font-extrabold text-[13px]",
                  row.rank <= 3
                    ? "bg-[var(--accent-soft)] text-[var(--accent-strong)]"
                    : "bg-default text-[var(--muted)]",
                )}
              >
                {row.rank}
              </span>
              <MakeAvatar logoUrl={row.logoUrl} make={row.make} size={26} />
              <span className="truncate font-bold text-base text-foreground">
                {row.make}
              </span>
            </span>

            <span className="text-right font-extrabold text-base text-foreground tabular-nums">
              <NumberValue
                locale="en-SG"
                maximumFractionDigits={0}
                value={row.count}
              />
            </span>

            <span className="hidden items-center gap-2.5 sm:flex">
              <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-default">
                <span
                  className="block h-full rounded-full"
                  style={{
                    backgroundColor: `var(--chart-${Math.min(6, row.rank)})`,
                    width: `${Math.max(2, row.share).toFixed(1)}%`,
                  }}
                />
              </span>
              <span className="w-11 text-right font-bold text-[13.5px] text-[var(--muted-strong)] tabular-nums">
                {row.share.toFixed(1)}%
              </span>
            </span>

            {row.yoyChange === null || row.count < MIN_COUNT_FOR_CHANGE ? (
              <span
                className="text-right font-semibold text-[var(--subtle)] text-sm"
                title={
                  row.yoyChange === null
                    ? "No registrations in the same period a year earlier"
                    : `Too few registrations for a meaningful year-on-year change (under ${MIN_COUNT_FOR_CHANGE})`
                }
              >
                —
              </span>
            ) : (
              <DeltaChip
                className="justify-self-end"
                ratio={row.yoyChange / 100}
              />
            )}

            <ChevronRight
              aria-hidden
              className="size-4.5 justify-self-end text-[var(--subtle)]"
            />
          </Link>
        ))}

        {visibleRows.length === 0 ? (
          <span className="px-4.5 py-9 font-semibold text-[15px] text-[var(--subtle)]">
            Nothing matches “{query}”.
          </span>
        ) : null}
      </div>

      {!isSearching && visibleRows.length > COLLAPSED_ROWS ? (
        <button
          aria-expanded={isExpanded}
          className="mt-3 cursor-[var(--cursor-interactive)] self-center rounded-full bg-default px-6 py-3 font-bold text-[var(--muted-strong)] text-sm transition-colors hover:text-foreground"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "Show fewer" : `Show all ${visibleRows.length} makes`}
        </button>
      ) : null}

      <Typography.Caption className="mt-3 px-4.5 font-medium text-[var(--subtle)]">
        Change compares against the same period a year earlier, and is withheld
        below {MIN_COUNT_FOR_CHANGE} registrations. Select a row to open the
        make.
      </Typography.Caption>
    </SurfaceCard>
  );
}
