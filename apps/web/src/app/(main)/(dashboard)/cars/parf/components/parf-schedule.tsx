"use client";

import { Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn } from "@heroui-pro/react";
import { formatCurrency } from "@motormetrics/utils/format-currency";
import {
  AGE_BRACKETS,
  type AgeBracket,
  NEW_CAP,
} from "@web/app/(main)/(dashboard)/cars/parf/components/parf-rates";
import { FigureCard } from "@web/components/shared/figure-card";

const formatPercent = (rate: number) => `${(rate * 100).toFixed(0)}%`;

/**
 * The rate for every age bracket under both schedules, with the rebate the
 * entered ARF earns in each. Selecting a row sets the age in the calculator.
 */
export function ParfSchedule({
  arf,
  bracketKey,
  onSelect,
}: {
  arf: number;
  bracketKey: string;
  onSelect: (key: string) => void;
}) {
  const columns: DataGridColumn<AgeBracket>[] = [
    {
      // The secondary table draws no selected-row tint, so the age in use
      // carries the accent instead.
      cell: (row) => (
        <Typography.Paragraph
          className={row.key === bracketKey ? "text-accent" : undefined}
          size="sm"
          weight={row.key === bracketKey ? "semibold" : "normal"}
        >
          {row.label}
        </Typography.Paragraph>
      ),
      header: "Vehicle age",
      id: "label",
      isRowHeader: true,
      minWidth: 160,
    },
    {
      align: "end",
      cell: (row) => (
        <Typography.Paragraph
          className="text-end tabular-nums"
          color="muted"
          size="sm"
        >
          {formatPercent(row.oldRate)}
        </Typography.Paragraph>
      ),
      header: "Before",
      id: "oldRate",
      width: 80,
    },
    {
      align: "end",
      cell: (row) => (
        <Typography.Paragraph className="text-end tabular-nums" size="sm">
          {formatPercent(row.newRate)}
        </Typography.Paragraph>
      ),
      header: "After",
      id: "newRate",
      width: 80,
    },
    {
      align: "end",
      cell: (row) => (
        <Typography.Paragraph
          className="text-end tabular-nums"
          size="sm"
          weight="semibold"
        >
          {formatCurrency(Math.min(arf * row.newRate, NEW_CAP))}
        </Typography.Paragraph>
      ),
      header: "Your rebate",
      id: "rebate",
      width: 112,
    },
  ];

  return (
    <FigureCard
      description="Budget 2026 rates on the ARF entered; select a row to use that age"
      title="Rebate rates by vehicle age"
    >
      <DataGrid
        aria-label="PARF rebate rates by vehicle age"
        columns={columns}
        data={AGE_BRACKETS}
        getRowId={(row) => row.key}
        onSelectionChange={(keys) => {
          // Replace behaviour keeps one row selected; ignore an empty set.
          if (keys === "all") return;
          const [key] = keys;
          if (key !== undefined) onSelect(String(key));
        }}
        selectedKeys={new Set([bracketKey])}
        selectionBehavior="replace"
        selectionMode="single"
        variant="secondary"
      />
    </FigureCard>
  );
}
