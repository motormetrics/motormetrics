"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";

export interface TopMakeRow {
  count: number;
  logoUrl: string | null;
  make: string;
  rank: number;
  share: number;
  slug: string;
  /** Change on the same months a year earlier, in percent. */
  yoyChange: number | null;
}

const columns: DataGridColumn<TopMakeRow>[] = [
  {
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
        <MakeAvatar
          className="shrink-0"
          logoUrl={row.logoUrl}
          make={row.make}
          size="sm"
        />
        <Link
          className="truncate font-medium text-foreground no-underline hover:underline"
          href={`/cars/makes/${row.slug}`}
        >
          {row.make}
        </Link>
      </span>
    ),
    header: "Make",
    id: "make",
    isRowHeader: true,
    minWidth: 140,
  },
  {
    align: "end",
    cell: (row) => (
      <NumberValue locale="en-SG" maximumFractionDigits={0} value={row.count} />
    ),
    header: "Registrations",
    id: "count",
    width: 112,
  },
  {
    align: "end",
    cell: (row) => (
      <Typography.Paragraph className="tabular-nums" size="sm">
        {row.share.toFixed(1)}%
      </Typography.Paragraph>
    ),
    header: "Share",
    id: "share",
    width: 100,
  },
  {
    align: "end",
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
    width: 110,
  },
];

/** The leading makes year to date, each linking to its own page. */
export function TopMakesTable({
  label,
  rows,
}: {
  label: string;
  rows: TopMakeRow[];
}) {
  return (
    <DataGrid
      aria-label={label}
      columns={columns}
      data={rows}
      getRowId={(row) => row.slug}
      variant="secondary"
    />
  );
}
