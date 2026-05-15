"use client";

import { Card, Pagination, type SortDescriptor, Table } from "@heroui/react";

import Typography from "@web/components/typography";
import type { EvMakeDetail } from "@web/queries/cars";
import { sortByDescriptor } from "@web/utils/sort";
import { type Key, useCallback, useMemo, useState } from "react";

interface MakeTableProps {
  data: EvMakeDetail[];
  month: string;
}

const columns = [
  { key: "rank", label: "#" },
  { key: "make", label: "Make" },
  { key: "bev", label: "BEV" },
  { key: "phev", label: "PHEV" },
  { key: "hybrid", label: "Hybrid" },
  { key: "total", label: "Total" },
];

const ROWS_PER_PAGE = 20;

export function MakeTable({ data, month }: MakeTableProps) {
  const numberFormatter = new Intl.NumberFormat("en-SG");
  const [page, setPage] = useState(1);
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: "total",
    direction: "descending",
  });

  const rankedData = useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      rank: index + 1,
    }));
  }, [data]);

  const sortedData = useMemo(() => {
    return sortByDescriptor(rankedData, sortDescriptor);
  }, [rankedData, sortDescriptor]);

  const pages = Math.ceil(sortedData.length / ROWS_PER_PAGE);
  const paginatedData = useMemo(() => {
    const start = (page - 1) * ROWS_PER_PAGE;
    return sortedData.slice(start, start + ROWS_PER_PAGE);
  }, [sortedData, page]);

  const renderCell = useCallback(
    (item: (typeof rankedData)[0], columnKey: Key) => {
      switch (columnKey) {
        case "rank":
          return item.rank;
        case "make":
          return item.make;
        case "bev":
          return numberFormatter.format(item.bev);
        case "phev":
          return numberFormatter.format(item.phev);
        case "hybrid":
          return numberFormatter.format(item.hybrid);
        case "total":
          return numberFormatter.format(item.total);
        default:
          return null;
      }
    },
    [numberFormatter],
  );

  return (
    <Card>
      <Card.Header className="flex flex-col items-start gap-2">
        <Typography.H4>EV Registrations by Make</Typography.H4>
        <Typography.TextSm className="text-muted">
          {data.length} makes with EV registrations in {month}
        </Typography.TextSm>
      </Card.Header>
      <Card.Content>
        <Table>
          <Table.ScrollContainer>
            <Table.Content
              aria-label="EV registrations by make"
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
