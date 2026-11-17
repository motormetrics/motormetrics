"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/coe-exercise-utils";

export interface ResultsRow {
  /** "1st" or "2nd". */
  bidding: string;
  key: string;
  /** "Nov 2026". */
  month: string;
  /** Closing premium per category; absent where the category did not run. */
  premiums: Partial<Record<CategoryKey, number>>;
}

const CATEGORY_KEYS: CategoryKey[] = ["A", "B", "C", "D", "E"];

const columns: DataGridColumn<ResultsRow>[] = [
  {
    cell: (row) => (
      <span className="flex items-baseline gap-2 whitespace-nowrap">
        <Typography.Paragraph size="sm" weight="semibold">
          {row.month}
        </Typography.Paragraph>
        <Typography.Paragraph color="muted" size="sm">
          {row.bidding}
        </Typography.Paragraph>
      </span>
    ),
    header: "Exercise",
    id: "exercise",
    isRowHeader: true,
    minWidth: 120,
    pinned: "start",
  },
  ...CATEGORY_KEYS.map(
    (key): DataGridColumn<ResultsRow> => ({
      align: "end",
      cell: (row) => {
        const premium = row.premiums[key];
        return premium === undefined ? (
          <Typography.Paragraph color="muted" size="sm">
            <span aria-hidden>—</span>
            <span className="sr-only">No result</span>
          </Typography.Paragraph>
        ) : (
          <NumberValue
            className="tabular-nums"
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={premium}
          />
        );
      },
      header: `Cat ${key}`,
      id: key,
      minWidth: 96,
    }),
  ),
];

/**
 * Every exercise in the period, latest first, with each category's closing
 * premium. The exercise column is pinned, so a phone scrolls the categories
 * sideways, and a long period scrolls inside the card.
 */
export function ResultsTable({ rows }: { rows: ResultsRow[] }) {
  return (
    <DataGrid
      aria-label="COE closing premium by exercise"
      columns={columns}
      contentClassName="min-w-140"
      data={rows}
      getRowId={(row) => row.key}
      scrollContainerClassName="max-h-96 overflow-y-auto"
    />
  );
}
