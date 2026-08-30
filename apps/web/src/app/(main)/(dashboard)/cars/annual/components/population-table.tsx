"use client";

import type { SortDescriptor } from "@heroui/react";

import { cn, Table, Typography } from "@heroui/react";
import {
  changeRatio,
  type DimensionLabels,
  type PopulationEntity,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { SurfaceCard } from "@web/components/shared/bento";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { useMemo, useState } from "react";

type SortKey = "name" | "population" | "change";

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
 * strips those semantics in most browsers. HeroUI's `Table` supplies both that
 * and the `ScrollContainer` the columns need on a phone — laid out in full the
 * four columns want ~450px, which is wider than the viewport.
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
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "population",
    direction: "descending",
  });
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
    const sortKey = sortDescriptor.column as SortKey;
    const sign = sortDescriptor.direction === "ascending" ? 1 : -1;

    return ranked.slice().sort((first, second) => {
      if (sortKey === "name") {
        return sign * first.name.localeCompare(second.name, "en-SG");
      }
      if (sortKey === "change") {
        return sign * ((first.change ?? 0) - (second.change ?? 0));
      }
      return sign * (first.population - second.population);
    });
  }, [ranked, sortDescriptor]);

  const isTruncated = !isExpanded && sorted.length > COLLAPSED_ROWS;
  const displayed = isTruncated ? sorted.slice(0, COLLAPSED_ROWS) : sorted;

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
          Sorted by {SORT_LABELS[sortDescriptor.column as SortKey]},{" "}
          {sortDescriptor.direction === "ascending"
            ? "ascending"
            : "descending"}
        </span>
      </div>

      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label={`${labels.title}, ${year}`}
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
              <Table.Column allowsSorting id="population">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Population
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
              <Table.Column id="share">Share</Table.Column>
              <Table.Column allowsSorting id="change">
                {({ sortDirection }) => (
                  <Table.SortableColumnHeader sortDirection={sortDirection}>
                    Change
                  </Table.SortableColumnHeader>
                )}
              </Table.Column>
            </Table.Header>
            <Table.Body>
              {displayed.map((row) => {
                const isFocused = row.name === focus;
                return (
                  <Table.Row
                    className={cn(isFocused && "bg-accent-soft-2")}
                    id={row.name}
                    key={row.name}
                  >
                    <Table.Cell>
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
                    </Table.Cell>
                    <Table.Cell className="text-right font-extrabold text-base tabular-nums">
                      {numberFormatter.format(row.population)}
                    </Table.Cell>
                    <Table.Cell>
                      <span className="flex items-center gap-2.5">
                        <span className="h-2.5 w-16 shrink-0 overflow-hidden rounded-full bg-default sm:w-24">
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
                    </Table.Cell>
                    <Table.Cell className="text-right">
                      {row.change === null ? (
                        <span className="font-semibold text-muted text-sm">
                          —
                        </span>
                      ) : (
                        <DeltaChip value={row.change * 100} />
                      )}
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      {isTruncated ? (
        <button
          className="cursor-pointer self-center rounded-full bg-default px-6 py-3 font-bold text-muted text-sm transition-colors hover:text-foreground"
          onClick={() => setIsExpanded(true)}
          type="button"
        >
          Show all {sorted.length} {labels.plural}
        </button>
      ) : null}

      <Typography.Paragraph className="px-4" color="muted" size="sm">
        Population counts are taken at 31 December each year.
        {previousYear === null ? null : ` Change is against ${previousYear}.`}
      </Typography.Paragraph>
    </SurfaceCard>
  );
}
