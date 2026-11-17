"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import type { PQPCategoryKey } from "@web/app/(main)/(dashboard)/coe/pqp/search-params";
import { DeltaChip } from "@web/components/shared/delta-chip";

export interface PQPMonthRow {
  key: string;
  /** "November 2026". */
  month: string;
  /** The term-scaled rate and its change on the month before, in percent. */
  rates: Partial<
    Record<PQPCategoryKey, { change: number | null; rate: number }>
  >;
}

function NoValue({ label }: { label: string }) {
  return (
    <Typography.Paragraph color="muted" size="sm">
      <span aria-hidden>—</span>
      <span className="sr-only">{label}</span>
    </Typography.Paragraph>
  );
}

/**
 * Every published month, latest first, with each category's rate at the
 * selected term and its change on the month before. The month column is
 * pinned, so a phone scrolls the figures sideways.
 */
export function PQPMonthsTable({
  categories,
  rows,
}: {
  categories: readonly PQPCategoryKey[];
  rows: PQPMonthRow[];
}) {
  const columns: DataGridColumn<PQPMonthRow>[] = [
    {
      cell: (row) => (
        <Typography.Paragraph
          className="whitespace-nowrap"
          size="sm"
          weight="semibold"
        >
          {row.month}
        </Typography.Paragraph>
      ),
      header: "Month",
      id: "month",
      isRowHeader: true,
      minWidth: 136,
      pinned: "start",
    },
    ...categories.flatMap((key): DataGridColumn<PQPMonthRow>[] => [
      {
        align: "end",
        cell: (row) => {
          const figure = row.rates[key];
          return figure ? (
            <NumberValue
              className="tabular-nums"
              currency="SGD"
              locale="en-SG"
              maximumFractionDigits={0}
              style="currency"
              value={figure.rate}
            />
          ) : (
            <NoValue label="Not published" />
          );
        },
        header: `Cat ${key}`,
        id: key,
        minWidth: 104,
      },
      {
        align: "end",
        cell: (row) => {
          const change = row.rates[key]?.change;
          return change === null || change === undefined ? (
            <NoValue label="No earlier month" />
          ) : (
            <DeltaChip className="text-sm" value={change} />
          );
        },
        header: "Change",
        id: `${key}-change`,
        minWidth: 88,
      },
    ]),
  ];

  return (
    <DataGrid
      aria-label="Published PQP by month"
      columns={columns}
      contentClassName="min-w-120"
      data={rows}
      getRowId={(row) => row.key}
      scrollContainerClassName="max-h-96 overflow-y-auto"
    />
  );
}
