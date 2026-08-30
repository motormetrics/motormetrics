"use client";

import type { SortDescriptor } from "@heroui/react";
import { cn, ScrollShadow, Table, Typography } from "@heroui/react";
import { Segment } from "@heroui-pro/react";
import {
  CAR_DIMENSIONS,
  DIMENSION_LABELS,
} from "@web/app/(main)/(dashboard)/cars/components/dimensions";
import { SurfaceCard } from "@web/components/shared/bento";
import type { CarDimension, DimensionStat } from "@web/queries/cars";
import { ArrowRight, Car, Search } from "lucide-react";
import Link from "next/link";
import { parseAsStringLiteral, useQueryState } from "nuqs";
import { useMemo, useState, useTransition } from "react";

type SortKey = "name" | "count";
type SortDirection = "asc" | "desc";

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

const numberFormatter = new Intl.NumberFormat("en-SG", {
  maximumFractionDigits: 0,
});

const SORT_LABELS: Record<SortKey, string> = {
  name: "name",
  count: "registrations",
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
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
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

  return (
    <SurfaceCard className="gap-5">
      <div className="flex flex-wrap items-center gap-4">
        <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-accent text-accent-foreground">
          <Car aria-hidden className="size-5" />
        </span>
        <div className="flex flex-col">
          <Typography.Heading level={3}>{labels.title}</Typography.Heading>
          <Typography.Paragraph color="muted" size="sm">
            Year to date through {monthLabel} ·{" "}
            {isTruncated
              ? `top ${displayed.length} of ${visible.length}`
              : `${visible.length} ${visible.length === 1 ? "row" : "rows"}`}
          </Typography.Paragraph>
        </div>
        {/* The three labels run to 307px side by side, wider than a small
            phone leaves this card, and a segmented track cannot wrap — so it
            scrolls within its own width instead of stretching the page. */}
        <ScrollShadow
          className="ml-auto max-w-full"
          hideScrollBar
          orientation="horizontal"
          size={24}
        >
          <Segment
            aria-label="Dimension"
            onSelectionChange={(key) => {
              setQuery("");
              setSortDescriptor({ column: "count", direction: "descending" });
              setDimension(key as CarDimension);
            }}
            selectedKey={dimension}
          >
            {CAR_DIMENSIONS.map((option) => (
              <Segment.Item id={option} key={option}>
                {DIMENSION_LABELS[option].tab}
              </Segment.Item>
            ))}
          </Segment>
        </ScrollShadow>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex min-w-56 flex-1 items-center gap-2.5 rounded-full bg-background px-5 py-3 text-muted">
          <Search aria-hidden className="size-4 shrink-0" />
          <span className="sr-only">{labels.searchLabel}</span>
          <input
            className="w-full border-none bg-transparent font-semibold text-foreground text-sm outline-none placeholder:text-muted"
            onChange={(event) => setQuery(event.target.value)}
            placeholder={`${labels.searchLabel} …`}
            type="search"
            value={query}
          />
        </label>
        <span className="whitespace-nowrap font-semibold text-muted text-sm">
          Sorted by {SORT_LABELS[sortDescriptor.column as SortKey]},{" "}
          {sortDescriptor.direction === "ascending"
            ? "ascending"
            : "descending"}
        </span>
      </div>

      <Table
        className={cn("transition-opacity", isPending && "opacity-60")}
        variant="secondary"
      >
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`${labels.title}, year to date through ${monthLabel}`}
            className="min-w-[26rem]"
            onSortChange={setSortDescriptor}
            sortDescriptor={sortDescriptor}
          >
            <Table.Header>
              <Table.Column allowsSorting id="name" isRowHeader>
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    {labels.column}
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column allowsSorting id="count">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Registrations
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              {/* `share` is derived from `count`, so sorting on it would only
                  duplicate the registrations column. */}
              <Table.Column id="share">Share</Table.Column>
            </Table.Header>
            <Table.Body>
              {displayed.map((row) => (
                <Table.Row id={row.name} key={row.name}>
                  <Table.Cell>
                    <span className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex size-8 shrink-0 items-center justify-center rounded-full font-extrabold text-xs",
                          row.rank <= PODIUM
                            ? "bg-accent/15 text-accent-strong"
                            : "bg-default text-muted",
                        )}
                      >
                        {row.rank}
                      </span>
                      <span className="truncate font-bold text-base">
                        {row.name}
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right font-extrabold text-base tabular-nums">
                    {numberFormatter.format(row.count)}
                  </Table.Cell>
                  <Table.Cell>
                    <span className="flex items-center gap-2.5">
                      <span className="h-2.5 w-16 shrink-0 overflow-hidden rounded-full bg-default sm:w-24">
                        <span
                          className="block h-full rounded-full"
                          style={{
                            background: `var(--chart-${Math.min(CHART_COLOURS, row.rank)})`,
                            width: `${((row.count / largestCount) * 100).toFixed(1)}%`,
                          }}
                        />
                      </span>
                      <span className="w-11 text-right font-bold text-muted text-sm tabular-nums">
                        {row.share.toFixed(1)}%
                      </span>
                    </span>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {visible.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm" className="px-4 py-9">
          Nothing matches “{query}”.
        </Typography.Paragraph>
      ) : null}

      {isTruncated ? (
        <Link
          className="flex items-center justify-center gap-2 self-center rounded-full bg-default px-6 py-3 font-bold text-muted text-sm transition-colors hover:text-foreground"
          href={labels.href}
        >
          Show all {visible.length} {labels.tab.toLowerCase()}
          <ArrowRight aria-hidden className="size-4 shrink-0" />
        </Link>
      ) : null}
    </SurfaceCard>
  );
}
