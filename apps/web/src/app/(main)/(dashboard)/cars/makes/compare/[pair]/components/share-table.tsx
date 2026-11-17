"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn } from "@heroui-pro/react";
import type { ShareRow } from "@web/app/(main)/(dashboard)/cars/makes/compare/[pair]/components/mix-rows";

/** One make's share, set bold when it is the higher of the two. */
function ShareCell({ isLeader, value }: { isLeader: boolean; value: string }) {
  return (
    <Typography.Paragraph
      align="end"
      className="tabular-nums"
      size="sm"
      weight={isLeader ? "bold" : "normal"}
    >
      {value}
    </Typography.Paragraph>
  );
}

/**
 * Each make's fuel and body type mix as shares of its own year to date, so a
 * small make and a large one read on the same scale. The higher share in each
 * row is bold rather than coloured.
 */
export function ShareTable({
  label,
  nameA,
  nameB,
  rows,
}: {
  label: string;
  nameA: string;
  nameB: string;
  rows: ShareRow[];
}) {
  const columns: DataGridColumn<ShareRow>[] = [
    {
      cell: (row) => (
        <span className="flex min-w-0 flex-col">
          <Typography.Paragraph size="sm" weight="medium">
            {row.label}
          </Typography.Paragraph>
          {row.gloss ? (
            <Typography.Paragraph color="muted" size="xs">
              {row.gloss}
            </Typography.Paragraph>
          ) : null}
        </span>
      ),
      header: "Type",
      id: "label",
      isRowHeader: true,
      minWidth: 120,
    },
    {
      align: "end",
      cell: (row) => <ShareCell isLeader={row.leader === "a"} value={row.a} />,
      header: nameA,
      id: "a",
      minWidth: 72,
    },
    {
      align: "end",
      cell: (row) => <ShareCell isLeader={row.leader === "b"} value={row.b} />,
      header: nameB,
      id: "b",
      minWidth: 72,
    },
  ];

  return (
    <DataGrid
      aria-label={label}
      columns={columns}
      data={rows}
      getRowId={(row) => row.key}
      variant="secondary"
    />
  );
}
