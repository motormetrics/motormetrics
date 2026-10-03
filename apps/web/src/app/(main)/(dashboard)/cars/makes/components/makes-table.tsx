"use client";

import { Button, ProgressBar, SearchField, Typography } from "@heroui/react";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridSortDescriptor,
  NumberValue,
} from "@heroui-pro/react";
import { FuelTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/fuel-tabs";
import type { MakeRow } from "@web/app/(main)/(dashboard)/cars/makes/components/make-rows";
import {
  type FuelFilter,
  type SortKey,
  sortMakeRows,
  sortSearchParams,
} from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import Link from "next/link";
import { useQueryStates } from "nuqs";
import posthog from "posthog-js";
import { type CSSProperties, useMemo, useState } from "react";

/** The trend series only feeds the headline sparkline, so it never crosses over. */
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

const SORT_LABELS: Record<SortKey, string> = {
  count: "registrations",
  make: "name",
  yoyChange: "change",
};

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
  posthog.capture("car_make_selected", { make, source: "makes_table" });
}

/**
 * The "All makes" section: heading, powertrain tabs, search and the sortable
 * table.
 *
 * The column sort lives in the URL as `?sort=…&dir=…`, so a sorted view can be
 * shared, but it is written shallowly: re-sorting happens here, on rows the
 * client already holds, and needs no server round trip. It replaces the
 * history entry rather than pushing one, so the back button leaves the page
 * instead of stepping through every sort. The search is local state only.
 *
 * The heading lives in here rather than in the server parent because its
 * caption counts the rows the search leaves visible.
 */
export function MakesTable({
  fuel,
  rangeLabel,
  rows,
}: {
  fuel: FuelFilter | null;
  rangeLabel: string;
  rows: MakesTableRow[];
}) {
  const [query, setQuery] = useState("");
  const [{ dir, sort }, setSortParams] = useQueryStates(sortSearchParams, {
    history: "replace",
    shallow: true,
  });
  const descriptor = useMemo<DataGridSortDescriptor>(
    () => ({
      column: sort,
      direction: dir === "asc" ? "ascending" : "descending",
    }),
    [dir, sort],
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const visibleRows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = needle
      ? rows.filter((row) => row.make.toLowerCase().includes(needle))
      : rows;

    return sortMakeRows(filtered, sort, dir);
  }, [dir, query, rows, sort]);

  // A search is already a narrowing, so matches are never truncated on top of
  // it — collapsing only applies to the unfiltered list.
  const isSearching = query.trim().length > 0;
  const isTruncated =
    !isExpanded && !isSearching && visibleRows.length > COLLAPSED_ROWS;
  const displayedRows = isTruncated
    ? visibleRows.slice(0, COLLAPSED_ROWS)
    : visibleRows;

  // Bars are scaled to the leader, as the comp does, so the top row always
  // fills its track whatever its share of the whole. The leader is looked up
  // rather than read off `rows[0]`, because the server hands the rows over
  // already in the URL's sort, which need not be by registrations.
  const leadCount = Math.max(1, ...rows.map((row) => row.count));

  // The grid hands back React Aria's next descriptor, which starts every new
  // column ascending. Only Make reads naturally that way, so a fresh column
  // takes its own first direction here and only a repeat press flips it.
  const handleSortChange = ({ column, direction }: DataGridSortDescriptor) => {
    const key = column as SortKey;
    if (key === sort) {
      setSortParams({ dir: direction === "ascending" ? "asc" : "desc" });
      return;
    }
    setSortParams({ sort: key, dir: key === "make" ? "asc" : "desc" });
  };

  const columns: DataGridColumn<MakesTableRow>[] = [
    {
      allowsSorting: true,
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-3">
          {/* Typography has no numeral prop; tabular-nums keeps the ranks aligned. */}
          <Typography.Paragraph
            className="w-6 shrink-0 tabular-nums"
            color="muted"
            size="sm"
          >
            {row.rank}
          </Typography.Paragraph>
          <MakeAvatar
            className="shrink-0"
            logoUrl={row.logoUrl}
            make={row.make}
            size="sm"
          />
          {/* The row can no longer be an anchor, so the name carries the link. */}
          <Link
            className="min-w-0"
            href={`/cars/makes/${row.slug}`}
            onClick={() => trackMakeSelected(row.make)}
          >
            <Typography.Paragraph truncate>{row.make}</Typography.Paragraph>
          </Link>
        </span>
      ),
      header: "Make",
      id: "make",
      isRowHeader: true,
      minWidth: 180,
      pinned: "start",
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.count}
        />
      ),
      header: "Registrations",
      id: "count",
      width: 130,
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.make} share of the leader`}
            className="min-w-0 flex-1"
            size="lg"
            style={
              {
                "--progress-bar-fill": `var(--chart-${Math.min(6, row.rank)})`,
              } as CSSProperties
            }
            value={Math.max(2, (row.count / leadCount) * 100)}
          >
            <ProgressBar.Track>
              <ProgressBar.Fill />
            </ProgressBar.Track>
          </ProgressBar>
          {/* Typography has no numeral prop; tabular-nums keeps the shares aligned. */}
          <Typography.Paragraph
            align="end"
            className="w-12 shrink-0 tabular-nums"
            color="muted"
            size="sm"
          >
            {row.share.toFixed(1)}%
          </Typography.Paragraph>
        </span>
      ),
      header: "Share",
      id: "share",
      minWidth: 180,
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) =>
        row.yoyChange === null || row.count < MIN_COUNT_FOR_CHANGE ? (
          <Typography.Paragraph
            color="muted"
            size="sm"
            title={
              row.yoyChange === null
                ? "No registrations in the same period a year earlier"
                : `Too few registrations for a meaningful year-on-year change (under ${MIN_COUNT_FOR_CHANGE})`
            }
          >
            —
          </Typography.Paragraph>
        ) : (
          <DeltaChip value={row.yoyChange} />
        ),
      header: "Change",
      id: "yoyChange",
      width: 100,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`${rangeLabel} · ${
          isTruncated
            ? `top ${displayedRows.length} of ${visibleRows.length}`
            : `${visibleRows.length} ${visibleRows.length === 1 ? "make" : "makes"}`
        }`}
        eyebrow="Registrations"
        title="All makes"
        trailing={<FuelTabs fuel={fuel} />}
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchField
          aria-label="Search makes"
          className="w-full max-w-xs"
          onChange={setQuery}
          value={query}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={`Search ${rows.length} makes …`} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Typography.Paragraph
          className="whitespace-nowrap text-[13.5px] sm:ml-auto"
          weight="semibold"
          color="muted"
          size="sm"
        >
          Sorted by {SORT_LABELS[descriptor.column as SortKey]},{" "}
          {descriptor.direction}
        </Typography.Paragraph>
      </div>

      <DataGrid
        aria-label="Makes"
        columns={columns}
        contentClassName="min-w-140"
        data={displayedRows}
        getRowId={(row) => row.slug}
        onSortChange={handleSortChange}
        renderEmptyState={() => `Nothing matches “${query}”.`}
        sortDescriptor={descriptor}
        variant="secondary"
      />

      {!isSearching && visibleRows.length > COLLAPSED_ROWS ? (
        <Button
          aria-expanded={isExpanded}
          className="self-center"
          onPress={() => setIsExpanded((current) => !current)}
          variant="ghost"
        >
          {isExpanded ? "Show fewer" : `Show all ${visibleRows.length} makes`}
        </Button>
      ) : null}

      <Typography.Paragraph
        className="text-[13.5px]"
        weight="medium"
        color="muted"
        size="sm"
      >
        Change compares against the same period a year earlier, and is withheld
        below {MIN_COUNT_FOR_CHANGE} registrations. Select a make to open it.
      </Typography.Paragraph>
    </div>
  );
}
