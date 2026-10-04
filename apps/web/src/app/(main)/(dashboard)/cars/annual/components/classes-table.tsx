"use client";

import { ProgressBar, type SortDescriptor, Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import {
  CARS,
  type ClassRank,
  type ClassSortKey,
  compareClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { SectionHead } from "@web/components/shared/overview";
import { type CSSProperties, useState } from "react";

const SORT_LABELS: Record<ClassSortKey, string> = {
  change: "change",
  name: "name",
  population: "population",
};

/**
 * Every vehicle class at the latest year end, sortable on any column, with
 * cars set in bold so the page's subject reads in context. DataGrid sorts the
 * rows itself; the descriptor is mirrored here only to word the caption.
 */
export function ClassesTable({
  previousYear,
  rows,
  year,
}: {
  previousYear: string | null;
  /** Largest first, as `rankClasses` returns them. */
  rows: ClassRank[];
  year: string;
}) {
  const [descriptor, setDescriptor] = useState<SortDescriptor>({
    column: "population",
    direction: "descending",
  });
  // Only the sortable columns can be sorted, and their ids are ClassSortKeys.
  const sortKey = descriptor.column as ClassSortKey;
  const largest = Math.max(...rows.map((row) => row.population), 1);

  const columns: DataGridColumn<ClassRank>[] = [
    {
      allowsSorting: true,
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden
            className="size-3 shrink-0 rounded-full"
            style={{ background: row.colour }}
          />
          <Typography.Paragraph
            truncate
            weight={row.name === CARS ? "bold" : undefined}
          >
            {row.name}
          </Typography.Paragraph>
        </span>
      ),
      header: "Vehicle class",
      id: "name",
      isRowHeader: true,
      minWidth: 180,
      pinned: "start",
      sortFn: (first, second) => compareClasses(first, second, "name"),
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.population}
        />
      ),
      header: "Population",
      id: "population",
      sortFn: (first, second) => compareClasses(first, second, "population"),
      width: 120,
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.name} share of the largest class`}
            className="min-w-0 flex-1"
            size="lg"
            style={{ "--progress-bar-fill": row.colour } as CSSProperties}
            value={(row.population / largest) * 100}
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
        row.change === null ? (
          <Typography.Paragraph color="muted" size="sm">
            —
          </Typography.Paragraph>
        ) : (
          <DeltaChip value={row.change * 100} />
        ),
      header: "Change",
      id: "change",
      sortFn: (first, second) => compareClasses(first, second, "change"),
      width: 100,
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <SectionHead
        caption={`${rows.length} ${rows.length === 1 ? "class" : "classes"} · cars in context`}
        eyebrow={year}
        title="All vehicle classes"
      />

      <DataGrid
        aria-label="Vehicle classes"
        columns={columns}
        contentClassName="min-w-140"
        data={rows}
        defaultSortDescriptor={{
          column: "population",
          direction: "descending",
        }}
        getRowId={(row) => row.name}
        onSortChange={setDescriptor}
        variant="secondary"
      />

      <Typography.Paragraph color="muted" size="sm">
        Population counts are taken at 31 December each year.
        {previousYear === null ? null : ` Change is against ${previousYear}.`}{" "}
        Sorted by {SORT_LABELS[sortKey]}, {descriptor.direction}.
      </Typography.Paragraph>
    </div>
  );
}
