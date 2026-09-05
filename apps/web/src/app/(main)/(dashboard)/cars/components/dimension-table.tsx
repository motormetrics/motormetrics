"use client";

import type { SortDescriptor } from "@heroui/react";
import {
  cn,
  ProgressBar,
  SearchField,
  Table,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@heroui/react";
import { slugify } from "@motormetrics/utils";
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
import { useMemo, useState, useTransition } from "react";

type SortKey = "name" | "count" | "yoyChange";
type SortDirection = "asc" | "desc";

/** Ranks past this share the last chart colour rather than wrapping around. */
const CHART_COLOURS = 6;

/**
 * 26rem is wider than this table gets on a phone, which left the
 * registrations column cut mid-figure and the share column off screen. Below
 * `sm` the floor comes off and the share column is dropped, which is what
 * makes the remaining columns fit without scrolling.
 */
const TABLE_MIN_WIDTH_CLASS = "min-w-0 sm:min-w-[26rem]";

/** The share column restates the count, so it is the one to drop on a phone. */
const SHARE_COLUMN_CLASS = "hidden sm:table-cell";

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
 * A real `<table>` rather than the comp's CSS grid: sortable column headers
 * need `aria-sort` on a `columnheader`, and overriding a table's `display` to
 * lay it out as a grid strips those semantics in most browsers.
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

  const searchHint =
    dimension === "make"
      ? `Search ${rows.length} makes …`
      : `${labels.searchLabel} …`;

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
        size="lg"
        title={labels.title}
        trailing={
          <ToggleButtonGroup
            aria-label="Dimension"
            className="flex min-w-0 flex-wrap gap-2"
            disallowEmptySelection
            isDetached
            onSelectionChange={(keys) => {
              const [option] = [...keys];
              if (option === undefined) {
                return;
              }
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
            selectedKeys={[dimension]}
            selectionMode="single"
          >
            {CAR_DIMENSIONS.map((option) => (
              <ToggleButton
                className="h-auto whitespace-nowrap rounded-full bg-default px-[18px] py-2.5 font-semibold text-foreground/75 text-sm transition-colors hover:bg-accent-soft data-[selected=true]:bg-accent data-[selected=true]:font-extrabold data-[selected=true]:text-accent-foreground"
                id={option}
                key={option}
              >
                {DIMENSION_LABELS[option].tab}
              </ToggleButton>
            ))}
          </ToggleButtonGroup>
        }
      />

      <div className="flex flex-wrap items-center gap-4">
        <SearchField
          aria-label={labels.searchLabel}
          className="w-full max-w-[340px]"
          onChange={setQuery}
          value={query}
        >
          <SearchField.Group className="h-auto gap-2.5 rounded-full border-0 bg-surface px-5 py-3 text-muted shadow-none">
            <SearchField.SearchIcon className="ml-0 size-[18px] text-muted" />
            <SearchField.Input
              className="px-0 font-semibold text-[15px] text-foreground placeholder:text-muted"
              placeholder={searchHint}
            />
            <SearchField.ClearButton className="mr-0" />
          </SearchField.Group>
        </SearchField>
        <Typography.Paragraph
          className="ml-auto whitespace-nowrap font-semibold"
          color="muted"
          size="sm"
        >
          Sorted by {SORT_LABELS[sortDescriptor.column as SortKey]},{" "}
          {sortDescriptor.direction === "ascending"
            ? "ascending"
            : "descending"}
        </Typography.Paragraph>
      </div>

      <Table
        className={cn("transition-opacity", isPending && "opacity-60")}
        variant="secondary"
      >
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`${labels.title}, year to date through ${monthLabel}`}
            className={TABLE_MIN_WIDTH_CLASS}
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
                    {/* The full word holds this column at 112px, which is the
                        last 19px standing between the table and a phone. */}
                    <span className="sm:hidden">Regs</span>
                    <span className="hidden sm:inline">Registrations</span>
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              {/* `share` is derived from `count`, so sorting on it would only
                  duplicate the registrations column. */}
              <Table.Column className={SHARE_COLUMN_CLASS} id="share">
                Share
              </Table.Column>
              <Table.Column allowsSorting id="yoyChange">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Change
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {displayed.map((row) => (
                <Table.Row id={row.name} key={row.name}>
                  <Table.Cell>
                    <div className="flex min-w-0 items-center gap-3">
                      <span
                        className={cn(
                          "w-6 shrink-0 text-[15px] tabular-nums",
                          row.rank <= PODIUM
                            ? "font-extrabold text-accent-strong"
                            : "font-bold text-muted",
                        )}
                      >
                        {row.rank}
                      </span>
                      <MakeAvatar
                        logoUrl={
                          dimension === "make"
                            ? (logoUrlBySlug[slugify(row.name)] ?? null)
                            : null
                        }
                        make={row.name}
                        size={28}
                      />
                      <Typography.Paragraph
                        className="font-semibold text-foreground/85"
                        truncate
                      >
                        {row.name}
                      </Typography.Paragraph>
                    </div>
                  </Table.Cell>
                  <Table.Cell className="text-right font-extrabold text-base tabular-nums">
                    {numberFormatter.format(row.count)}
                  </Table.Cell>
                  <Table.Cell className={SHARE_COLUMN_CLASS}>
                    <span className="flex items-center gap-2.5">
                      <ProgressBar
                        aria-label={`${row.name} share of the largest`}
                        className="w-24 shrink-0 lg:w-40"
                        value={(row.count / largestCount) * 100}
                      >
                        <ProgressBar.Track className="h-2.5 rounded-full bg-surface-secondary">
                          <ProgressBar.Fill
                            className="rounded-full"
                            style={{
                              background: `var(--chart-${Math.min(CHART_COLOURS, row.rank)})`,
                            }}
                          />
                        </ProgressBar.Track>
                      </ProgressBar>
                      <span className="w-11 text-right font-bold text-muted-strong text-sm tabular-nums">
                        {row.share.toFixed(1)}%
                      </span>
                    </span>
                  </Table.Cell>
                  <Table.Cell className="text-right">
                    {row.yoyChange === null ? (
                      <Typography.Paragraph
                        className="font-semibold"
                        color="muted"
                        size="sm"
                      >
                        <span aria-hidden>—</span>
                        <span className="sr-only">No comparable period</span>
                      </Typography.Paragraph>
                    ) : (
                      <DeltaChip value={row.yoyChange} />
                    )}
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {visible.length === 0 ? (
        <Typography.Paragraph color="muted" size="sm" className="px-2 py-9">
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
    </div>
  );
}
