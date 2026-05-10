"use client";

import { Button, Chip } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import { formatOrdinal } from "@motormetrics/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { COEResult } from "@web/types";
import { ArrowUpDown } from "lucide-react";

export const columns: ColumnDef<COEResult>[] = [
  {
    accessorKey: "month",
    header: ({ column }) => (
      <Button
        variant="tertiary"
        onPress={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Month
        <ArrowUpDown className="size-4" />
      </Button>
    ),
  },
  {
    accessorKey: "vehicleClass",
    header: "Category",
    cell: ({ row }) => row.getValue<string>("vehicleClass"),
  },
  {
    accessorKey: "premium",
    header: "Quota Premium (S$)",
    cell: ({ row }) => (
      <NumberValue
        currency="SGD"
        locale="en-SG"
        maximumFractionDigits={0}
        style="currency"
        value={row.getValue<number>("premium")}
      />
    ),
  },
  {
    accessorKey: "biddingNo",
    header: "Bidding Round",
    cell: ({ row }) =>
      `${formatOrdinal(row.getValue<number>("biddingNo"))} Round`,
  },
  {
    accessorKey: "quota",
    header: "Quota",
    cell: ({ row }) => (
      <NumberValue
        locale="en-SG"
        maximumFractionDigits={0}
        value={row.getValue<number>("quota")}
      />
    ),
  },
  {
    id: "demand",
    header: "Demand",
    cell: ({ row }) => {
      const quota = row.original.quota;
      const bidsReceived = row.original.bidsReceived;
      const ratio = quota > 0 ? bidsReceived / quota : 0;
      const isHigh = ratio > 1.5;

      return (
        <Chip
          size="sm"
          variant="primary"
          color={isHigh ? "warning" : "default"}
        >
          <NumberValue maximumFractionDigits={1} value={ratio}>
            <NumberValue.Suffix>x</NumberValue.Suffix>
          </NumberValue>
        </Chip>
      );
    },
  },
  {
    id: "successRate",
    header: "Success Rate",
    cell: ({ row }) => {
      const quota = row.original.quota;
      const bidsSuccess = row.original.bidsSuccess;
      const rate = quota > 0 ? bidsSuccess / quota : 0;

      return (
        <NumberValue maximumFractionDigits={1} style="percent" value={rate} />
      );
    },
  },
];
