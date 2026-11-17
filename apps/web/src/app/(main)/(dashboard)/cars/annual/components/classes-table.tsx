"use client";

import { cn, ProgressBar, Typography } from "@heroui/react";
import {
  DataGrid,
  type DataGridColumn,
  type DataGridSortDescriptor,
  NumberValue,
} from "@heroui-pro/react";
import {
  CARS,
  type ClassRank,
  type ClassSortKey,
  sortClasses,
} from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { useMemo, useState } from "react";

/**
 * Every vehicle class at the latest year end, sortable on the class, vehicles
 * and change columns, with cars marked so the page's subject reads in
 * context. The class column is pinned, so a phone scrolls the figures
 * sideways rather than losing a column.
 */
export function ClassesTable({
  previousYear,
  rows,
}: {
  previousYear: string | null;
  /** Largest first, as `rankClasses` returns them. */
  rows: ClassRank[];
}) {
  const [sortDescriptor, setSortDescriptor] = useState<DataGridSortDescriptor>({
    column: "population",
    direction: "descending",
  });
  const largest = Math.max(...rows.map((row) => row.population), 1);

  const sorted = useMemo(
    () =>
      sortClasses(
        rows,
        sortDescriptor.column as ClassSortKey,
        sortDescriptor.direction,
      ),
    [rows, sortDescriptor],
  );

  const columns: DataGridColumn<ClassRank>[] = [
    {
      allowsSorting: true,
      cell: (row) => (
        <Typography.Paragraph
          className={cn(row.name === CARS && "text-accent")}
          size="sm"
          truncate
          weight={row.name === CARS ? "bold" : "medium"}
        >
          {row.name}
        </Typography.Paragraph>
      ),
      header: "Vehicle class",
      id: "name",
      isRowHeader: true,
      width: 192,
      pinned: "start",
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
      header: "Vehicles",
      id: "population",
      headerClassName: "w-32",
      width: 120,
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.name} against the largest class`}
            className="min-w-0 flex-1"
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
      headerClassName: "w-48",
      minWidth: 180,
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) =>
        row.change === null ? (
          <Typography.Paragraph color="muted" size="sm">
            <span aria-hidden>—</span>
            <span className="sr-only">No prior year</span>
          </Typography.Paragraph>
        ) : (
          <DeltaChip value={row.change * 100} />
        ),
      header: previousYear === null ? "Change" : `vs ${previousYear}`,
      id: "change",
      headerClassName: "w-28",
      width: 110,
    },
  ];

  return (
    <DataGrid
      aria-label="Vehicle classes"
      columns={columns}
      contentClassName="min-w-xl table-fixed"
      data={sorted}
      getRowId={(row) => row.name}
      onSortChange={(next) =>
        // A figure column starts largest first; only the name starts A to Z.
        setSortDescriptor(
          next.column !== sortDescriptor.column && next.column !== "name"
            ? { column: next.column, direction: "descending" }
            : next,
        )
      }
      sortDescriptor={sortDescriptor}
    />
  );
}
