"use client";

import { formatCurrency } from "@motormetrics/utils";
import type { ColumnDef } from "@tanstack/react-table";
import type { Pqp } from "@web/types/coe";

const createCategoryColumn = (category: string): ColumnDef<Pqp.TableRow> => ({
  accessorKey: category,
  header: category,
  cell: ({ row }) => formatCurrency(row.getValue<number>(category)),
});

export const columns: ColumnDef<Pqp.TableRow>[] = [
  {
    accessorKey: "month",
    header: "Month",
  },
  ...["Category A", "Category B", "Category C", "Category D"].map(
    createCategoryColumn,
  ),
];
