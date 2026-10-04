"use client";

import { cn, ProgressBar, SearchField, Typography } from "@heroui/react";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridSortDescriptor,
  NumberValue,
  Segment,
} from "@heroui-pro/react";
import { slugify } from "@motormetrics/utils/slugify";
import {
  CAR_DIMENSIONS,
  DIMENSION_LABELS,
} from "@web/app/(main)/(dashboard)/cars/components/dimensions";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import { SectionHead } from "@web/components/shared/overview";
import type { CarDimension, DimensionStat } from "@web/queries/cars";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { type CSSProperties, useMemo, useState, useTransition } from "react";

type SortKey = "name" | "count" | "yoyChange";
type SortDirection = "asc" | "desc";

/** Ranks past this share the last chart colour rather than wrapping around. */
const CHART_COLOURS = 6;

/**
 * Rows shown before the reader asks for the rest. The full list runs to every
 * make on record, whose tail is dozens of marques on one or two registrations —
 * a long scroll that buries the makes actually carrying the market.
 */
const COLLAPSED_ROWS = 10;

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
    // A make with no comparable period sorts to the bottom either way, so the
    // measurable rows stay together at the top of the list.
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
 * The Cars overview dimension table: pill tabs that swap the data set through
 * the URL, and a search box plus sortable headers that only reorder what has
 * already been fetched.
 *
 * The sort is controlled, and so applied here, because the list is collapsed
 * to its first rows after sorting. The name column is pinned, so a phone
 * scrolls the figures sideways rather than losing a column.
 */
export function DimensionTable({
  dimension,
  logoUrlBySlug = {},
  monthLabel,
  rows,
}: {
  dimension: CarDimension;
  /** Make logos keyed by `slugify(make)`; empty for the other dimensions. */
  logoUrlBySlug?: Record<string, string>;
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
  const [sortDescriptor, setSortDescriptor] = useState<DataGridSortDescriptor>({
    column: "count",
    direction: "descending",
  });

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
    const sortKey = sortDescriptor.column as SortKey;
    const sortDirection: SortDirection =
      sortDescriptor.direction === "ascending" ? "asc" : "desc";

    return ranked
      .filter((row) => !needle || row.name.toLowerCase().includes(needle))
      .sort((first, second) =>
        compareStats(first, second, sortKey, sortDirection),
      );
  }, [ranked, query, sortDescriptor]);

  // A search is already a narrowing, so matches are never truncated on top of
  // it — collapsing only applies to the unfiltered list.
  const isSearching = query.trim().length > 0;
  const isTruncated = !isSearching && visible.length > COLLAPSED_ROWS;
  const displayed = isTruncated ? visible.slice(0, COLLAPSED_ROWS) : visible;

  const searchHint =
    dimension === "make"
      ? `Search ${rows.length} makes …`
      : `${labels.searchLabel} …`;

  const columns: DataGridColumn<RankedStat>[] = [
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
            logoUrl={
              dimension === "make"
                ? (logoUrlBySlug[slugify(row.name)] ?? null)
                : null
            }
            make={row.name}
            size="sm"
          />
          <Typography.Paragraph truncate>{row.name}</Typography.Paragraph>
        </span>
      ),
      header: labels.column,
      id: "name",
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
      // `share` is derived from `count`, so sorting on it would only duplicate
      // the registrations column.
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.name} share of the largest`}
            className="min-w-0 flex-1"
            size="lg"
            style={
              {
                "--progress-bar-fill": `var(--chart-${Math.min(CHART_COLOURS, row.rank)})`,
              } as CSSProperties
            }
            value={(row.count / largestCount) * 100}
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
        row.yoyChange === null ? (
          <Typography.Paragraph color="muted" size="sm">
            <span aria-hidden>—</span>
            <span className="sr-only">No comparable period</span>
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
        caption={
          <>
            Year to date through {monthLabel} ·{" "}
            {isTruncated
              ? `top ${displayed.length} of ${visible.length}`
              : `${visible.length} ${visible.length === 1 ? "row" : "rows"}`}
          </>
        }
        eyebrow="Registrations"
        title={labels.title}
        trailing={
          // Segment is a non-wrapping inline-flex, so a row wider than a phone
          // (the three dimension tabs, about 296px) scrolls sideways inside
          // this wrapper instead of pushing the page wider.
          <div className="max-w-full overflow-x-auto">
            <Segment
              aria-label="Dimension"
              onSelectionChange={(option) => {
                posthog.capture("dashboard_filter_changed", {
                  filter: "dimension",
                  value: option,
                });
                setQuery("");
                setSortDescriptor({
                  column: "count",
                  direction: "descending",
                });
                setDimension(option as CarDimension);
              }}
              selectedKey={dimension}
              size="md"
              variant="ghost"
            >
              {CAR_DIMENSIONS.map((option) => (
                <Segment.Item id={option} key={option}>
                  {DIMENSION_LABELS[option].tab}
                </Segment.Item>
              ))}
            </Segment>
          </div>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchField
          aria-label={labels.searchLabel}
          className="w-full max-w-xs"
          onChange={setQuery}
          value={query}
        >
          <SearchField.Group>
            <SearchField.SearchIcon />
            <SearchField.Input placeholder={searchHint} />
            <SearchField.ClearButton />
          </SearchField.Group>
        </SearchField>
        <Typography.Paragraph
          className="ml-auto whitespace-nowrap"
          weight="semibold"
          color="muted"
          size="sm"
        >
          Sorted by {SORT_LABELS[sortDescriptor.column as SortKey]},{" "}
          {sortDescriptor.direction === "ascending"
            ? "ascending"
            : "descending"}
        </Typography.Paragraph>
      </div>

      <DataGrid
        aria-label={`${labels.title}, year to date through ${monthLabel}`}
        // Dims the stale rows while the next dimension loads.
        className={cn("transition-opacity", isPending && "opacity-60")}
        columns={columns}
        contentClassName="min-w-140"
        data={displayed}
        getRowId={(row) => row.name}
        onSortChange={setSortDescriptor}
        renderEmptyState={() => `Nothing matches “${query}”.`}
        sortDescriptor={sortDescriptor}
        variant="secondary"
      />

      {isTruncated ? (
        <Link
          className="flex items-center justify-center gap-2 self-center rounded-full bg-default px-6 py-3 font-bold text-muted text-sm transition-colors hover:text-foreground"
          href={labels.href}
        >
          Show all {visible.length} {labels.tab.toLowerCase()}
          <ArrowRight aria-hidden className="size-4 shrink-0" />
        </Link>
      ) : null}
    </div>
  );
}
