"use client";

import { ProgressBar, Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";

export interface CategoryRow {
  category: string;
  /** Chart-colour custom property, shared with the trend chart's legend. */
  color: string;
  count: number;
  description: string;
  /** Percentage of the month's total. */
  share: number;
  /** Percentage change on the same month a year earlier; null without one. */
  yearAgoChange: number | null;
}

/**
 * The month's categories, largest first, each with the swatch the chart
 * above uses and what the category covers under its name. The category
 * column is pinned, so a phone scrolls the figures sideways.
 */
export function CategoryTable({
  rows,
  yearAgoLabel,
}: {
  rows: CategoryRow[];
  /** "2025", heading the change column. */
  yearAgoLabel: string;
}) {
  const largest = Math.max(1, ...rows.map(({ count }) => count));

  const columns: DataGridColumn<CategoryRow>[] = [
    {
      cell: (row) => (
        <span className="flex min-w-0 items-center gap-2">
          <span
            aria-hidden
            className="size-2.5 shrink-0 rounded-xs"
            style={{ backgroundColor: row.color }}
          />
          <span className="flex min-w-0 flex-col">
            <Typography.Paragraph size="sm" truncate weight="medium">
              {row.category}
            </Typography.Paragraph>
            <Typography.Paragraph color="muted" size="xs" truncate>
              {row.description}
            </Typography.Paragraph>
          </span>
        </span>
      ),
      header: "Category",
      id: "category",
      isRowHeader: true,
      width: 192,
      pinned: "start",
    },
    {
      align: "end",
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.count}
        />
      ),
      header: "Vehicles",
      id: "count",
      headerClassName: "w-28",
      width: 110,
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.category} against the largest category`}
            className="min-w-0 flex-1"
            value={(row.count / largest) * 100}
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
      cell: (row) =>
        row.yearAgoChange === null ? (
          <Typography.Paragraph color="muted" size="sm">
            <span aria-hidden>—</span>
            <span className="sr-only">No comparable month</span>
          </Typography.Paragraph>
        ) : (
          <DeltaChip value={row.yearAgoChange} />
        ),
      header: `vs ${yearAgoLabel}`,
      id: "yearAgoChange",
      headerClassName: "w-28",
      width: 110,
    },
  ];

  return (
    <DataGrid
      aria-label="Deregistrations by category"
      columns={columns}
      contentClassName="min-w-xl table-fixed"
      data={rows}
      getRowId={(row) => row.category}
    />
  );
}
