"use client";

import { Card, CardBody, CardHeader } from "@heroui/card";
import { Pagination } from "@heroui/pagination";
import {
  type SortDescriptor,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";
import { cn } from "@heroui/theme";
import { CARD_PADDING, RADIUS } from "@motormetrics/theme/spacing";
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
    <Card className={cn(RADIUS.card, CARD_PADDING.standard)}>
      <CardHeader className="flex flex-col items-start gap-2">
        <Typography.H4>All Makes ({effectiveYear})</Typography.H4>
        <Typography.TextSm className="text-default-500">
          {yearData.length} makes registered
        </Typography.TextSm>
      </CardHeader>
      <CardBody>
        <Table
          aria-label={`Car population by make for ${effectiveYear}`}
          sortDescriptor={sortDescriptor}
          onSortChange={setSortDescriptor}
          bottomContent={
            pages > 1 ? (
              <div className="flex w-full justify-center">
                <Pagination
                  isCompact
                  showControls
                  showShadow
                  page={page}
                  total={pages}
                  onChange={setPage}
                />
              </div>
            ) : null
          }
          bottomContentPlacement="outside"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                allowsSorting={column.key !== "rank"}
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody items={paginatedData}>
            {(item) => (
              <TableRow key={item.make}>
                {(columnKey) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </CardBody>
    </Card>
  );
}
