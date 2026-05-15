"use client";

import { Pagination, type SortDescriptor, Table } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";

import type { Pqp } from "@web/types/coe";
import { type Key, useCallback, useMemo, useState } from "react";

interface DataTableProps {
  rows: Pqp.TableRow[];
  columns: Pqp.TableColumn[];
  rowsPerPage?: number;
}

export function DataTable({ rows, columns, rowsPerPage = 10 }: DataTableProps) {
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "month",
    direction: "descending",
  });

  const pages = Math.ceil(rows.length / rowsPerPage);
  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    return rows.slice(start, end);
  }, [page, rows, rowsPerPage]);

  const sortedItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const first = a[sortDescriptor.column as keyof typeof a];
      const second = b[sortDescriptor.column as keyof typeof b];

      let cmp: number;

      // Special handling for month column (YYYY-MM format)
      if (sortDescriptor.column === "month") {
        cmp = String(first).localeCompare(String(second));
      } else {
        // For other columns, try numeric comparison first, then string
        const firstNum = parseFloat(String(first));
        const secondNum = parseFloat(String(second));

        if (!Number.isNaN(firstNum) && !Number.isNaN(secondNum)) {
          cmp = firstNum - secondNum;
        } else {
          cmp = String(first).localeCompare(String(second));
        }
      }

      return sortDescriptor.direction === "descending" ? -cmp : cmp;
    });
  }, [sortDescriptor, items]);

  const renderCell = useCallback((row: Pqp.TableRow, columnKey: Key) => {
    const cellValue = row[columnKey as keyof Pqp.TableRow];

    switch (columnKey) {
      case "Category A":
      case "Category B":
      case "Category C":
      case "Category D":
        return (
          <NumberValue
            currency="SGD"
            locale="en-SG"
            maximumFractionDigits={0}
            style="currency"
            value={cellValue as number}
          />
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <Table>
      <Table.ScrollContainer>
        <Table.Content
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
        >
          <Table.Header>
            {columns.map((column, index) => (
              <Table.Column
                key={column.key}
                id={column.key}
                isRowHeader={index === 0}
                allowsSorting={column.sortable}
              >
                {column.label}
              </Table.Column>
            ))}
          </Table.Header>
          <Table.Body>
            {sortedItems.map((item) => (
              <Table.Row key={item.key} id={item.key}>
                {columns.map((column) => (
                  <Table.Cell key={column.key}>
                    {renderCell(item, column.key)}
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Content>
      </Table.ScrollContainer>
      <Table.Footer>
        <div className="flex w-full justify-center">
          <Pagination size="sm">
            <Pagination.Content>
              <Pagination.Item>
                <Pagination.Previous
                  isDisabled={page === 1}
                  onPress={() => setPage((current) => Math.max(current - 1, 1))}
                >
                  <Pagination.PreviousIcon />
                  Prev
                </Pagination.Previous>
              </Pagination.Item>
              {Array.from({ length: pages }, (_, index) => index + 1).map(
                (pageNumber) => (
                  <Pagination.Item key={pageNumber}>
                    <Pagination.Link
                      isActive={pageNumber === page}
                      onPress={() => setPage(pageNumber)}
                    >
                      {pageNumber}
                    </Pagination.Link>
                  </Pagination.Item>
                ),
              )}
              <Pagination.Item>
                <Pagination.Next
                  isDisabled={page === pages}
                  onPress={() =>
                    setPage((current) => Math.min(current + 1, pages))
                  }
                >
                  Next
                  <Pagination.NextIcon />
                </Pagination.Next>
              </Pagination.Item>
            </Pagination.Content>
          </Pagination>
        </div>
      </Table.Footer>
    </Table>
  );
}
