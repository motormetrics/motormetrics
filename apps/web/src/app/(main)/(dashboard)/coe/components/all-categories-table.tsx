"use client";

import { type Selection, Typography } from "@heroui/react";
import { DataGrid, type DataGridColumn, NumberValue } from "@heroui-pro/react";
import {
  type CategoryRow,
  DEFAULT_SORT,
  describeSort,
  nextSort,
  type SortKey,
  type SortState,
  sortCategoryRows,
} from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import { useCoeCategory } from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SourceNote } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { useState } from "react";

/** "1.26×"; a dash when the quota is missing rather than dividing by zero. */
const bidsPerCoe = (row: CategoryRow): string =>
  row.quota > 0 ? `${(row.bidsReceived / row.quota).toFixed(2)}×` : "—";

/**
 * The five-category table with sortable headers.
 *
 * A client island only for the sort state: the rows arrive from the server in
 * category order and are re-ordered here without another fetch, so the sort is
 * controlled. Selecting a row selects its category through the URL, the same
 * as the circles up top. The category column is pinned and the rest scroll
 * sideways on narrow screens.
 */
export function AllCategoriesTable({
  rows,
  selected,
}: {
  rows: CategoryRow[];
  selected: CategoryKey;
}) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const { selectCategory } = useCoeCategory();

  const handleSelectionChange = (keys: Selection) => {
    // Single selection; pressing the selected row again would empty it, so
    // only a newly picked category goes to the URL.
    if (keys === "all") return;
    const [key] = keys;
    if (key !== undefined && key !== selected) {
      selectCategory(key as CategoryKey);
    }
  };

  /*
   * Bids and Bids/COE are read across, not ranked, so they do not sort; nor
   * does the sparkline, which is a shape rather than a figure.
   */
  const columns: DataGridColumn<CategoryRow>[] = [
    {
      allowsSorting: true,
      cell: (row) => (
        <span className="flex min-w-0 flex-col">
          <Typography.Paragraph truncate weight="semibold">
            {row.category}
          </Typography.Paragraph>
          <Typography.Paragraph color="muted" size="sm" truncate>
            {row.description}
          </Typography.Paragraph>
        </span>
      ),
      header: "Category",
      id: "category",
      isRowHeader: true,
      minWidth: 200,
      pinned: "start",
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) => (
        <NumberValue
          currency="SGD"
          locale="en-SG"
          maximumFractionDigits={0}
          style="currency"
          value={row.premium}
        />
      ),
      header: "Premium",
      id: "premium",
      width: 130,
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) => <CostTrendChip changeRatio={row.changeRatio} />,
      header: "Change",
      id: "change",
      width: 110,
    },
    {
      align: "end",
      allowsSorting: true,
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.quota}
        />
      ),
      header: "Quota",
      id: "quota",
      width: 90,
    },
    {
      align: "end",
      cell: (row) => (
        <NumberValue
          locale="en-SG"
          maximumFractionDigits={0}
          value={row.bidsReceived}
        />
      ),
      header: "Bids",
      id: "bids",
      width: 90,
    },
    {
      align: "end",
      cell: bidsPerCoe,
      header: "Bids/COE",
      id: "ratio",
      width: 90,
    },
    {
      cell: (row) => (
        <SparklineChart
          color={
            row.categoryKey === selected ? "var(--chart-1)" : "var(--chart-4)"
          }
          data={row.series}
          endDot
          fillOpacity={0}
          format={{ currency: "SGD", style: "currency" }}
          height={30}
          margin={{ bottom: 3, left: 0, right: 3, top: 3 }}
          name="Premium"
          strokeWidth={1.5}
          title={`${row.category} premiums over the last ${row.series.length} exercises`}
        />
      ),
      header: "Last 24 exercises",
      id: "trend",
      width: 150,
    },
  ];

  return (
    <div className="flex flex-col gap-2.5">
      {/* min-w-4xl holds the columns' widths so narrow screens scroll sideways. */}
      <DataGrid
        aria-label="COE categories"
        columns={columns}
        contentClassName="min-w-4xl tabular-nums"
        data={sortCategoryRows(rows, sort)}
        getRowId={(row) => row.categoryKey}
        onSelectionChange={handleSelectionChange}
        onSortChange={(descriptor) =>
          setSort(nextSort(sort, descriptor.column as SortKey))
        }
        selectedKeys={new Set([selected])}
        selectionMode="single"
        sortDescriptor={{
          column: sort.key,
          direction: sort.direction === "asc" ? "ascending" : "descending",
        }}
        variant="secondary"
      />

      <SourceNote>
        Quota premium at the close of each exercise. Change is against the
        previous exercise. Select a row to chart it. Sorted by{" "}
        {describeSort(sort)}.
      </SourceNote>
    </div>
  );
}
