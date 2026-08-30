"use client";

import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { SurfaceCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { Car, ChevronRight, Search } from "lucide-react";
import Link from "next/link";
import posthog from "posthog-js";
import { useMemo, useState } from "react";
import { MakeAvatar } from "./make-avatar";
import type { MakeRow } from "./make-rows";

/** The trend series only feeds the hero sparkline, so it never crosses over. */
export type MakesTableRow = Omit<MakeRow, "trend">;

/**
 * Rows shown before the reader asks for the rest — the leading makes, well
 * short of the long tail of marques on a handful of registrations. "Show all"
 * expands to the full list.
 */
const COLLAPSED_ROWS = 10;

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
  /** Shown below `sm`, where the full word is wider than its column. */
  shortLabel?: string;
}[] = [
  { align: "left", key: "make", label: "Make" },
  { align: "right", key: "count", label: "Registrations", shortLabel: "Regs" },
  { align: "left", key: null, label: "Share" },
  { align: "right", key: "yoyChange", label: "Change", shortLabel: "YoY" },
];

/** The label pair a header cell renders, one per breakpoint. */
function ColumnLabel({
  label,
  shortLabel,
}: {
  label: string;
  shortLabel?: string;
}) {
  if (!shortLabel) {
    return <>{label}</>;
  }

  return (
    <>
      <span className="sm:hidden">{shortLabel}</span>
      <span className="hidden sm:inline">{label}</span>
    </>
  );
}

const SORT_LABELS: Record<SortKey, string> = {
  count: "registrations",
  make: "name",
  yoyChange: "change",
};

/**
 * Below `sm` the share bar and the chevron are dropped and the remaining
 * columns tighten, because the first column is what pays for them: at the
 * desktop widths it was left with about 90px, all of which the rank badge and
 * the logo took, and every make name truncated to nothing.
 */
const GRID_CLASS =
  "grid grid-cols-[minmax(0,1fr)_56px_52px] items-center gap-2 sm:grid-cols-[minmax(0,1fr)_100px_minmax(90px,1fr)_96px_18px] sm:gap-3";

/**
 * Keeps the funnel that used to be fed by the makes-page search autocomplete.
 *
 * The event name and its `make` property are deliberately unchanged from the
 * combo box this table replaced — it measures "user picked a make on the makes
 * page", and renaming it would split the existing PostHog series in two. It
 * fires on navigation, not on typing: the search box above is a local filter,
 * and capturing keystrokes would flood the funnel and change what it means.
 */
/**
 * The change figure as bare coloured text.
 *
 * `DeltaChip` is 86px of pill against a 52px column on a phone, and it was
 * overrunning the registrations figure beside it. The chip returns from `sm`,
 * where the row has the width for it.
 */
function ChangeText({
  className,
  value,
}: {
  className?: string;
  value: number;
}) {
  return (
    <span
      className={cn(
        "text-right font-bold text-xs tabular-nums",
        value >= 0
          ? "text-success-soft-foreground"
          : "text-warning-soft-foreground",
        className,
      )}
    >
      {value >= 0 ? "+" : "−"}
      {Math.abs(value).toFixed(1)}%
    </span>
  );
}

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
 * never touch the URL — only the range tabs, which change what the server has
 * to aggregate, do that.
 */
export function MakesTable({
  rangeLabel,
  rows,
}: {
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
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Car className="size-5.5" />
        </span>
        <div className="flex flex-col">
          <Typography.Heading level={3}>All makes</Typography.Heading>
          <Typography.Paragraph color="muted" size="xs">
            {rangeLabel} ·{" "}
            {isTruncated
              ? `top ${displayedRows.length} of ${visibleRows.length}`
              : `${visibleRows.length} ${visibleRows.length === 1 ? "make" : "makes"}`}
          </Typography.Paragraph>
        </div>
        <span className="ml-auto whitespace-nowrap font-semibold text-muted text-sm">
          Sorted by {SORT_LABELS[sortKey]},{" "}
          {sortDirection === "asc" ? "ascending" : "descending"}
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        <span className="flex min-w-56 flex-1 items-center gap-2.5 rounded-full bg-background px-5 py-3 text-muted">
          <Search aria-hidden className="size-4.5 shrink-0" />
          <input
            aria-label="Search makes"
            className="w-full border-none bg-transparent font-semibold text-foreground text-sm outline-none placeholder:text-muted"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`Search ${rows.length} makes …`}
            type="text"
            value={query}
          />
        </span>
      </div>

      <div
        className={cn(
          GRID_CLASS,
          "mt-3.5 items-end border-border border-b px-4.5 pt-4 pb-3",
        )}
      >
        {COLUMNS.map((column) => {
          const isActive = column.key !== null && column.key === sortKey;
          const className = cn(
            "font-bold text-xs uppercase tracking-wider",
            column.align === "right" ? "text-right" : "text-left",
            column.label === "Share" && "hidden sm:block",
            isActive ? "text-accent-strong" : "text-muted",
          );

          if (column.key === null) {
            return (
              <span className={className} key={column.label}>
                <ColumnLabel
                  label={column.label}
                  shortLabel={column.shortLabel}
                />
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
              <ColumnLabel
                label={column.label}
                shortLabel={column.shortLabel}
              />
              {isActive ? (sortDirection === "asc" ? " ↑" : " ↓") : ""}
            </button>
          );
        })}
        <span className="hidden sm:block" />
      </div>

      <div className="flex flex-col">
        {displayedRows.map((row) => (
          <Link
            className={cn(
              GRID_CLASS,
              "rounded-field px-4.5 py-4 no-underline transition-colors hover:bg-background",
            )}
            href={`/cars/makes/${row.slug}`}
            key={row.make}
            onClick={() => trackMakeSelected(row.make)}
          >
            <span className="flex min-w-0 items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex size-6 shrink-0 items-center justify-center rounded-full font-extrabold text-xs sm:size-7.5 sm:text-sm",
                  row.rank <= 3
                    ? "bg-accent/15 text-accent-strong"
                    : "bg-default text-muted",
                )}
              >
                {row.rank}
              </span>
              <span className="hidden shrink-0 sm:block">
                <MakeAvatar logoUrl={row.logoUrl} make={row.make} size={26} />
              </span>
              <span className="truncate font-bold text-foreground text-sm sm:text-base">
                {row.make}
              </span>
            </span>

            <span className="text-right font-extrabold text-foreground text-sm tabular-nums sm:text-base">
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
              <span className="w-11 text-right font-bold text-muted text-sm tabular-nums">
                {row.share.toFixed(1)}%
              </span>
            </span>

            {row.yoyChange === null || row.count < MIN_COUNT_FOR_CHANGE ? (
              <span
                className="text-right font-semibold text-muted text-sm"
                title={
                  row.yoyChange === null
                    ? "No registrations in the same period a year earlier"
                    : `Too few registrations for a meaningful year-on-year change (under ${MIN_COUNT_FOR_CHANGE})`
                }
              >
                —
              </span>
            ) : (
              <>
                <ChangeText className="sm:hidden" value={row.yoyChange} />
                <DeltaChip
                  className="hidden justify-self-end sm:flex"
                  value={row.yoyChange}
                />
              </>
            )}

            <ChevronRight
              aria-hidden
              className="hidden size-4.5 justify-self-end text-muted sm:block"
            />
          </Link>
        ))}

        {visibleRows.length === 0 ? (
          <span className="px-4.5 py-9 font-semibold text-muted text-sm">
            Nothing matches “{query}”.
          </span>
        ) : null}
      </div>

      {!isSearching && visibleRows.length > COLLAPSED_ROWS ? (
        <button
          aria-expanded={isExpanded}
          className="mt-3 cursor-pointer self-center rounded-full bg-default px-6 py-3 font-bold text-muted text-sm transition-colors hover:text-foreground"
          onClick={() => setIsExpanded((current) => !current)}
          type="button"
        >
          {isExpanded ? "Show fewer" : `Show all ${visibleRows.length} makes`}
        </button>
      ) : null}

      <Typography.Paragraph color="muted" size="xs" className="mt-3 px-4.5">
        Change compares against the same period a year earlier, and is withheld
        below {MIN_COUNT_FOR_CHANGE} registrations. Select a row to open the
        make.
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
