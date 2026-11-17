"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";

/** One fuel type × vehicle type cell of the make's registrations. */
export interface MixRow {
  /** Percentage change against the same months a year earlier. */
  change: number | null;
  count: number;
  fuelType: string;
  /** Share of the make's registrations in the period, in percent. */
  share: number;
  /** Already formatted for display, e.g. "Hatchback". */
  vehicleType: string;
}

const columns: DataGridColumn<MixRow>[] = [
  {
    allowsSorting: true,
    // One cell for both, the vehicle type over its fuel type, so the table
    // fits a phone.
    cell: (row) => (
      <span className="flex min-w-0 flex-col">
        <Typography.Paragraph size="sm" weight="medium">
          {row.vehicleType}
        </Typography.Paragraph>
        <Typography.Paragraph color="muted" size="xs">
          {row.fuelType}
        </Typography.Paragraph>
      </span>
    ),
    header: "Vehicle and fuel type",
    id: "type",
    isRowHeader: true,
    minWidth: 128,
    sortFn: (first, second) =>
      first.vehicleType.localeCompare(second.vehicleType, "en-SG") ||
      first.fuelType.localeCompare(second.fuelType, "en-SG"),
  },
  {
    align: "end",
    allowsSorting: true,
    cell: (row) => (
      <NumberValue locale="en-SG" maximumFractionDigits={0} value={row.count} />
    ),
    header: (
      <>
        <span className="max-sm:hidden">Registrations</span>
        <span className="sm:hidden">Cars</span>
      </>
    ),
    id: "count",
    sortFn: (first, second) => first.count - second.count,
    width: 128,
  },
  {
    align: "end",
    cell: (row) => (
      <Typography.Paragraph align="end" className="tabular-nums" size="sm">
        {row.share < 0.1 ? "<0.1" : row.share.toFixed(1)}%
      </Typography.Paragraph>
    ),
    // A phone drops the share, which restates the registrations.
    cellClassName: "max-sm:hidden",
    header: "Share",
    headerClassName: "max-sm:hidden",
    id: "share",
    width: 88,
  },
  {
    align: "end",
    allowsSorting: true,
    cell: (row) =>
      row.change === null ? (
        <Typography.Paragraph align="end" color="muted" size="sm">
          <span aria-hidden>—</span>
          <span className="sr-only">None a year earlier</span>
        </Typography.Paragraph>
      ) : (
        <DeltaChip value={row.change} />
      ),
    header: "Change",
    id: "change",
    sortFn: (first, second) =>
      (first.change ?? Number.NEGATIVE_INFINITY) -
      (second.change ?? Number.NEGATIVE_INFINITY),
    width: 104,
  },
];

/** The make's registrations by fuel type and vehicle type, largest first. */
export function MixTable({ label, rows }: { label: string; rows: MixRow[] }) {
  return (
    <DataGrid
      aria-label={label}
      columns={columns}
      data={rows}
      defaultSortDescriptor={{ column: "count", direction: "descending" }}
      getRowId={(row) => `${row.fuelType}|${row.vehicleType}`}
      renderEmptyState={() =>
        "No registrations for this fuel type in the period."
      }
      variant="secondary"
    />
  );
}
