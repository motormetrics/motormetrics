"use client";

import { cn, ProgressBar, Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import { DeltaChip } from "@web/components/shared/delta-chip";
import { parseAsString, useQueryState } from "nuqs";
import posthog from "posthog-js";
import { useTransition } from "react";

export interface FuelTypeRow {
  /** Signed percentage change on the previous month. */
  change: number;
  count: number;
  name: string;
  /** Percentage of the month's registrations. */
  share: number;
  yearToDate: number;
}

/**
 * The month's registrations by fuel type. Each name is a toggle for the
 * page's fuel filter: selecting it narrows the KPIs and chart to that fuel
 * type, and selecting it again clears the filter.
 *
 * Writes the same `fuelType` param as the toolbar menu, with `shallow: false`
 * so the server re-renders the page against it. The name column is pinned,
 * so a phone scrolls the figures sideways rather than losing a column.
 */
export function FuelTypeTable({
  previousMonthName,
  rows,
  year,
}: {
  /** "Feb", for the change column's header. */
  previousMonthName: string;
  rows: FuelTypeRow[];
  year: number;
}) {
  const [isPending, startTransition] = useTransition();
  const [selected, setSelected] = useQueryState(
    "fuelType",
    parseAsString.withOptions({ shallow: false, startTransition }),
  );

  // Bars are scaled to the largest fuel type, so the leader fills its track.
  const leadCount = Math.max(1, ...rows.map((row) => row.count));

  const columns: DataGridColumn<FuelTypeRow>[] = [
    {
      cell: (row) => {
        const isActive = row.name === selected;
        return (
          <button
            aria-pressed={isActive}
            className={cn(
              "block max-w-full cursor-pointer truncate text-left text-sm hover:underline",
              isActive ? "font-bold text-accent" : "font-medium",
            )}
            onClick={() => {
              const next = isActive ? null : row.name;
              posthog.capture("dashboard_filter_changed", {
                filter: "fuel_type",
                value: next,
              });
              setSelected(next);
            }}
            type="button"
          >
            {row.name}
          </button>
        );
      },
      header: "Fuel type",
      id: "name",
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
      header: "Cars",
      id: "count",
      headerClassName: "w-24",
      width: 100,
    },
    {
      cell: (row) => (
        <span className="flex items-center gap-2">
          <ProgressBar
            aria-label={`${row.name} against the largest fuel type`}
            className="min-w-0 flex-1"
            value={(row.count / leadCount) * 100}
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
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.yearToDate}
        />
      ),
      header: `${year} to date`,
      id: "yearToDate",
      headerClassName: "w-28",
      width: 120,
    },
    {
      align: "end",
      cell: (row) => <DeltaChip value={row.change} />,
      header: `vs ${previousMonthName}`,
      id: "change",
      headerClassName: "w-24",
      width: 100,
    },
  ];

  return (
    <DataGrid
      aria-label="Registrations by fuel type"
      className={cn("transition-opacity", isPending && "opacity-60")}
      columns={columns}
      contentClassName="min-w-2xl table-fixed"
      data={rows}
      getRowId={(row) => row.name}
      variant="secondary"
    />
  );
}
