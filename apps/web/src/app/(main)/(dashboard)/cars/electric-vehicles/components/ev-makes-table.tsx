"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import { MakeAvatar } from "@web/components/shared/make-avatar";
import Link from "next/link";

export interface EvMakeRow {
  count: number;
  logoUrl: string | null;
  make: string;
  rank: number;
  /** Share of the year's battery-electric registrations, in percent. */
  share: number;
  slug: string;
}

const columns: DataGridColumn<EvMakeRow>[] = [
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
      <Typography.Paragraph className="text-end tabular-nums" size="sm">
        {row.share.toFixed(1)}%
      </Typography.Paragraph>
    ),
    header: "Share",
    id: "share",
    width: 100,
  },
];

/** The leading battery-electric makes, each linking to its own page. */
export function EvMakesTable({
  label,
  rows,
}: {
  label: string;
  rows: EvMakeRow[];
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
