"use client";

import { Card, Pagination, type SortDescriptor, Table } from "@heroui/react";

import { useEffectiveYear } from "@web/app/(main)/(explore)/cars/annual/hooks/use-effective-year";
import Typography from "@web/components/typography";
import { sortByDescriptor } from "@web/utils/sort";
import { type Key, useCallback, useMemo, useState } from "react";

interface MakeData {
  year: string;
  make: string;
  total: number;
}

interface MakeBreakdownProps {
  data: MakeData[];
  availableYears: { year: string }[];
}

const columns = [
  { key: "rank", label: "#" },
  { key: "make", label: "Make" },
  { key: "total", label: "Population" },
  { key: "share", label: "Market Share" },
];

const ROWS_PER_PAGE = 20;

export function MakeBreakdown({ data, availableYears }: MakeBreakdownProps) {
  const effectiveYear = useEffectiveYear(
    availableYears.map((item) => Number(item.year)),
  );
  const numberFormatter = new Intl.NumberFormat("en-SG");
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "total" as const,
    direction: "descending" as const,
  });

  const yearData = useMemo(() => {
    const filtered = data
      .filter((item) => Number(item.year) === effectiveYear)
      .sort((a, b) => b.total - a.total);

    const grandTotal = filtered.reduce((sum, item) => sum + item.total, 0);

    return filtered.map((item, index) => ({
      rank: index + 1,
      make: item.make,
      total: item.total,
      share: grandTotal > 0 ? (item.total / grandTotal) * 100 : 0,
    }));
  }, [data, effectiveYear]);

  const sortedData = useMemo(() => {
    return sortByDescriptor(yearData, sortDescriptor);
  }, [yearData, sortDescriptor]);

  const pages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, page]);

  const renderCell = useCallback(
    (item: (typeof yearData)[0], columnKey: Key) => {
      switch (columnKey) {
        case "rank":
          return item.rank;
        case "make":
          return item.make;
        case "total":
          return numberFormatter.format(item.total);
        case "share":
          return `${item.share.toFixed(1)}%`;
        default:
          return null;
      }
    },
    [numberFormatter],
  );

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>All Makes ({effectiveYear})</Typography.H4>
        <Typography.TextSm className="text-muted">
          {yearData.length} makes registered
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label={`Car population by make for ${effectiveYear}`}
              sortDescriptor={sortDescriptor}
              onSortChange={setSortDescriptor}
            >
              <Table.Header>
                {columns.map((column, index) => (
                  <Table.Column
                    key={column.key}
                    id={column.key}
                    isRowHeader={index === 0}
                    allowsSorting={column.key !== "rank"}
                  >
                    {column.label}
                  </Table.Column>
                ))}
              </Table.Header>
              <Table.Body>
                {paginatedData.map((item) => (
                  <Table.Row key={item.make} id={item.make}>
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
            {pages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination size="sm">
                  <Pagination.Content>
                    <Pagination.Item>
                      <Pagination.Previous
                        isDisabled={page === 1}
                        onPress={() =>
                          setPage((current) => Math.max(current - 1, 1))
                        }
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
            ) : null}
          </Table.Footer>
        </Table>
      </Card.Content>
    </Card>
  );
}
