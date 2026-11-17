"use client";

import { Button, SearchField, Typography } from "@heroui/react";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridSortDescriptor,
  NumberValue,
} from "@heroui-pro/react";
import { makesSearchParams } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";
import { useQueryState } from "nuqs";
import { useState } from "react";

export interface MakesTableRow {
  count: number;
  logoUrl: string | null;
  make: string;
  rank: number;
  share: number;
  slug: string;
  /** Change on a year earlier, in percent; `null` when the base is too small. */
  yoyChange: number | null;
}

/**
 * The search over the table. Without `onChange` it is the stand-in the
 * static shell shows until the browser has read `?q=`.
 */
export function MakeSearchField({
  isReadOnly,
  onChange,
  value = "",
}: {
  isReadOnly?: boolean;
  onChange?: (value: string) => void;
  value?: string;
}) {
  return (
    <SearchField
      aria-label="Find a make"
      className="w-full sm:w-64"
      isReadOnly={isReadOnly}
      onChange={onChange}
      value={value}
    >
      <SearchField.Group>
        <SearchField.SearchIcon />
        <SearchField.Input placeholder="Find a make, e.g. Audi" />
        <SearchField.ClearButton />
      </SearchField.Group>
    </SearchField>
  );
}

/**
 * Filters the table as the reader types: a shallow `?q=` update with no
 * round trip.
 */
export function MakeSearch() {
  const [query, setQuery] = useQueryState("q", makesSearchParams.q);

  return (
    <MakeSearchField
      onChange={(value) => setQuery(value || null)}
      value={query}
    />
  );
}

const columns: DataGridColumn<MakesTableRow>[] = [
  {
    allowsSorting: true,
    cell: (row) => (
      <span className="flex min-w-0 items-center gap-2">
        {/* Typography has no numeral prop; tabular-nums keeps the ranks aligned. */}
        <Typography.Paragraph
          className="w-6 shrink-0 tabular-nums"
          color="muted"
          size="sm"
        >
          {row.rank}
        </Typography.Paragraph>
        {/* A phone drops the logo and the share column, and shortens the
            long names, so the change still fits on screen. */}
        <MakeAvatar
          className="shrink-0 max-sm:hidden"
          logoUrl={row.logoUrl}
          make={row.make}
          size="sm"
        />
        <Link
          className="max-w-20 truncate font-medium text-foreground no-underline hover:underline sm:max-w-none"
          href={`/cars/makes/${row.slug}`}
        >
          {row.make}
        </Link>
      </span>
    ),
    header: "Make",
    id: "make",
    isRowHeader: true,
    minWidth: 120,
  },
  {
    align: "end",
    allowsSorting: true,
    cell: (row) => (
      <NumberValue locale="en-SG" maximumFractionDigits={0} value={row.count} />
    ),
    header: (
      <>
        <span className="max-sm:hidden">Registrations</span>
        <span className="sm:hidden">Cars</span>
      </>
    ),
    id: "count",
    width: 112,
  },
  {
    align: "end",
    cell: (row) => (
      <Typography.Paragraph align="end" className="tabular-nums" size="sm">
        {row.share < 0.1 ? "<0.1" : row.share.toFixed(1)}%
      </Typography.Paragraph>
    ),
    cellClassName: "max-sm:hidden",
    header: "Share",
    headerClassName: "max-sm:hidden",
    id: "share",
    width: 88,
  },
  {
    align: "end",
    allowsSorting: true,
    cell: (row) =>
      row.yoyChange === null ? (
        <Typography.Paragraph align="end" color="muted" size="sm">
          <span aria-hidden>—</span>
          <span className="sr-only">No comparable base</span>
        </Typography.Paragraph>
      ) : (
        <DeltaChip value={row.yoyChange} />
      ),
    header: "Change",
    id: "yoyChange",
    width: 80,
  },
];

/** Rows shown before the reader asks for the rest or searches. */
const COLLAPSED_ROWS = 20;

type SortKey = "count" | "make" | "yoyChange";

/** Ascending order for each sortable column. */
const COMPARE: Record<
  SortKey,
  (first: MakesTableRow, second: MakesTableRow) => number
> = {
  count: (first, second) => first.count - second.count,
  make: (first, second) => first.make.localeCompare(second.make, "en-SG"),
  // Makes with no comparable base sort below the rest.
  yoyChange: (first, second) =>
    (first.yoyChange ?? Number.NEGATIVE_INFINITY) -
    (second.yoyChange ?? Number.NEGATIVE_INFINITY),
};

/**
 * Every make with registrations in the period, filtered by `?q=` and opening
 * on the `?sort=` order. Each make links to its own page. The sort is
 * controlled so the list can be cut to its first rows after sorting.
 */
export function MakesTable({
  label,
  rows,
}: {
  label: string;
  rows: MakesTableRow[];
}) {
  const [query] = useQueryState("q", makesSearchParams.q);
  const [sort] = useQueryState("sort", makesSearchParams.sort);
  const [sortDescriptor, setSortDescriptor] = useState<DataGridSortDescriptor>(
    sort === "make"
      ? { column: "make", direction: "ascending" }
      : { column: "count", direction: "descending" },
  );
  const [isExpanded, setIsExpanded] = useState(false);

  const needle = query.trim().toLowerCase();
  const compare = COMPARE[sortDescriptor.column as SortKey] ?? COMPARE.count;
  const sign = sortDescriptor.direction === "ascending" ? 1 : -1;
  const sorted = rows
    .filter(
      (row) =>
        !needle ||
        row.make.toLowerCase().includes(needle) ||
        row.slug.includes(needle),
    )
    .sort((first, second) => sign * compare(first, second));
  // A search is already a narrowing, so its matches are never cut.
  const isCollapsed = !isExpanded && !needle && sorted.length > COLLAPSED_ROWS;

  return (
    <div className="flex flex-col gap-4">
      <DataGrid
        aria-label={label}
        columns={columns}
        data={isCollapsed ? sorted.slice(0, COLLAPSED_ROWS) : sorted}
        getRowId={(row) => row.slug}
        onSortChange={setSortDescriptor}
        renderEmptyState={() =>
          `No make matches “${query}”. Try part of the name, such as “Merc”.`
        }
        sortDescriptor={sortDescriptor}
        variant="secondary"
      />
      {isCollapsed ? (
        <Button
          className="self-center"
          onPress={() => setIsExpanded(true)}
          variant="secondary"
        >
          Show all {sorted.length} makes
        </Button>
      ) : null}
    </div>
  );
}
