"use client";

import { Pagination } from "@heroui/pagination";
import { Select, SelectItem } from "@heroui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { useMemo, useState } from "react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  ariaLabel?: string;
}

const pageSizes = [10, 20, 30, 40, 50];

export function DataTable<TData, TValue>({
  columns,
  data,
  ariaLabel = "Data table",
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: { sorting, columnFilters, columnVisibility },
  });

  const rows = table.getRowModel().rows;
  const filteredRowCount = table.getFilteredRowModel().rows.length;
  const pageCount = table.getPageCount();
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageSize = table.getState().pagination.pageSize;
  const hasPagination = pageCount > 1;

  const bottomContent = useMemo(
    () => (
      <div className="flex flex-col items-center gap-4 px-2 py-2 lg:flex-row lg:justify-between">
        <div className="flex-1 text-default-500 text-sm">
          {filteredRowCount} rows fetched.
        </div>
        <div className="flex flex-col items-center gap-4 lg:flex-row">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm">Rows per page</span>
            <Select
              aria-label="Rows per page"
              className="w-24"
              selectedKeys={[String(pageSize)]}
              size="sm"
              onSelectionChange={(keys) => {
                const selected = Array.from(keys)[0];
                if (selected) {
                  table.setPageSize(Number(selected));
                }
              }}
            >
              {pageSizes.map((size) => (
                <SelectItem key={String(size)}>{size}</SelectItem>
              ))}
            </Select>
          </div>
          {hasPagination ? (
            <Pagination
              isCompact
              showControls
              page={currentPage}
              total={pageCount}
              onChange={(page) => table.setPageIndex(page - 1)}
            />
          ) : (
            <span className="text-default-500 text-sm">Page 1 of 1</span>
          )}
        </div>
      </div>
    ),
    [currentPage, filteredRowCount, hasPagination, pageCount, pageSize, table],
  );

  return (
    <Table
      aria-label={ariaLabel}
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
    >
      <TableHeader>
        {table
          .getHeaderGroups()[0]
          ?.headers.map((header) => (
            <TableColumn key={header.id}>
              {header.isPlaceholder
                ? null
                : flexRender(
                    header.column.columnDef.header,
                    header.getContext(),
                  )}
            </TableColumn>
          )) ?? []}
      </TableHeader>
      <TableBody emptyContent="No results.">
        {rows.map((row) => (
          <TableRow key={row.id}>
            {row.getVisibleCells().map((cell) => (
              <TableCell key={cell.id}>
                {flexRender(cell.column.columnDef.cell, cell.getContext())}
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
