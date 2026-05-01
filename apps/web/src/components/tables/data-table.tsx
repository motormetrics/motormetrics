"use client";

import { Label, ListBox, Pagination, Select, Table } from "@heroui/react";

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
              className="w-24"
              value={String(pageSize)}
              onChange={(selected) => table.setPageSize(Number(selected))}
            >
              <Label className="sr-only">Rows per page</Label>
              <Select.Trigger>
                <Select.Value />
                <Select.Indicator />
              </Select.Trigger>
              <Select.Popover>
                <ListBox>
                  {pageSizes.map((size) => (
                    <ListBox.Item
                      key={size}
                      id={String(size)}
                      textValue={String(size)}
                    >
                      {size}
                      <ListBox.ItemIndicator />
                    </ListBox.Item>
                  ))}
                </ListBox>
              </Select.Popover>
            </Select>
          </div>
          {hasPagination ? (
            <Pagination size="sm">
              <Pagination.Content>
                <Pagination.Item>
                  <Pagination.Previous
                    isDisabled={!table.getCanPreviousPage()}
                    onPress={() => table.previousPage()}
                  >
                    <Pagination.PreviousIcon />
                    Prev
                  </Pagination.Previous>
                </Pagination.Item>
                {Array.from({ length: pageCount }, (_, index) => index + 1).map(
                  (page) => (
                    <Pagination.Item key={page}>
                      <Pagination.Link
                        isActive={page === currentPage}
                        onPress={() => table.setPageIndex(page - 1)}
                      >
                        {page}
                      </Pagination.Link>
                    </Pagination.Item>
                  ),
                )}
                <Pagination.Item>
                  <Pagination.Next
                    isDisabled={!table.getCanNextPage()}
                    onPress={() => table.nextPage()}
                  >
                    Next
                    <Pagination.NextIcon />
                  </Pagination.Next>
                </Pagination.Item>
              </Pagination.Content>
            </Pagination>
          ) : (
            <span className="text-default-500 text-sm">Page 1 of 1</span>
          )}
        </div>
      </div>
    ),
    [currentPage, filteredRowCount, hasPagination, pageCount, pageSize, table],
  );

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content aria-label={ariaLabel}>
          <Table.Header>
            {table.getHeaderGroups()[0]?.headers.map((header, index) => (
              <Table.Column
                key={header.id}
                id={header.id}
                isRowHeader={index === 0}
              >
                {header.isPlaceholder
                  ? null
                  : flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
              </Table.Column>
            )) ?? []}
          </Table.Header>
          <Table.Body renderEmptyState={() => <span>No results.</span>}>
            {rows.map((row) => (
              <Table.Row key={row.id} id={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <Table.Cell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>{bottomContent}</Table.Footer>
    </Table>
  );
}
