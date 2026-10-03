"use client";

import type { SortDescriptor } from "@heroui/react";
import { cn, Table } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  type CategoryRow,
  DEFAULT_SORT,
  describeSort,
  type SortKey,
  type SortState,
  sortCategoryRows,
} from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import {
  CategorySelect,
  useCoeCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { SourceNote } from "@web/components/shared/overview";
import { SparklineChart } from "@web/components/shared/sparkline-chart";
import { ArrowUp } from "lucide-react";
import { useState } from "react";

type ColumnKey = SortKey | "bids" | "ratio" | "trend";

/**
 * Bids and Bids/COE are read across, not ranked, so they do not sort; nor
 * does the sparkline, which is a shape rather than a figure.
 */
const COLUMNS: {
  align: "left" | "right";
  key: ColumnKey;
  label: string;
  sortable: boolean;
}[] = [
  { align: "left", key: "category", label: "Category", sortable: true },
  { align: "right", key: "premium", label: "Premium", sortable: true },
  { align: "right", key: "change", label: "Change", sortable: true },
  { align: "right", key: "quota", label: "Quota", sortable: true },
  { align: "right", key: "bids", label: "Bids", sortable: false },
  { align: "right", key: "ratio", label: "Bids/COE", sortable: false },
  { align: "right", key: "trend", label: "Last 24 exercises", sortable: false },
];

/**
 * Fixed figure columns so the rows line up under their headers. The narrowest
 * step exists because the comp's tracks add up to 380px of figures, which is
 * wider than a 320px phone leaves the table once the page gutter is out.
 * Below 720px the demand columns drop out for the meta line under the name;
 * the sparklines only appear above 1100px, where the figures leave room.
 */
const FIGURE_COLUMN_CLASSES: Record<Exclude<ColumnKey, "category">, string> = {
  premium: "w-[4.75rem] sm:w-[6.5rem] lg:w-[130px]",
  quota: "w-[4.5rem] max-[720px]:hidden lg:w-[90px]",
  bids: "w-[4.5rem] max-[720px]:hidden lg:w-[90px]",
  ratio: "w-[4.5rem] max-[720px]:hidden lg:w-[90px]",
  change: "w-[4.25rem] sm:w-[5.5rem] lg:w-[110px]",
  trend: "hidden w-[150px] min-[1101px]:table-cell",
};

const formatCount = (value: number): string => value.toLocaleString("en-SG");

/** "1.26×"; a dash when the quota is missing rather than dividing by zero. */
const bidsPerCoe = (row: CategoryRow): string =>
  row.quota > 0 ? `${(row.bidsReceived / row.quota).toFixed(2)}×` : "—";

/**
 * Narrower than HeroUI's px-4: at 320px its padding eats most of the fixed
 * figure columns and the premiums clip. The row rule comes from HeroUI.
 */
const CELL_CLASS = "px-1 sm:px-3";

const DEMAND_CELL_CLASS =
  "text-right text-[14.5px] text-muted-strong max-[720px]:hidden";

/**
 * The five-category table with sortable headers.
 *
 * A client island only for the sort state: the rows arrive from the server in
 * category order and are re-ordered here without another fetch. Clicking a row
 * selects its category through the URL, the same as the circles up top.
 *
 * A real table rather than the comp's CSS grid: sortable column headers
 * need `aria-sort` on a `columnheader`, which only means something inside a
 * table. The header, row rules and row hover are HeroUI's secondary variant.
 * The selected row is marked by a tint and a 3px accent rule on its leading
 * edge, drawn on the first cell so it does not depend on row shadows.
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

  const sorted = sortCategoryRows(rows, sort);

  const sortDescriptor: SortDescriptor = {
    column: sort.key,
    direction: sort.direction === "asc" ? "ascending" : "descending",
  };

  return (
    <div className="flex flex-col gap-2.5">
      <Table variant="secondary">
        <Table.ScrollContainer>
          <Table.Content
            aria-label="COE categories"
            className="table-fixed tabular-nums"
            onRowAction={(key) => selectCategory(key as CategoryKey)}
            onSortChange={(descriptor) =>
              setSort({
                direction:
                  descriptor.direction === "ascending" ? "asc" : "desc",
                key: descriptor.column as SortKey,
              })
            }
            sortDescriptor={sortDescriptor}
          >
            <Table.Header>
              {COLUMNS.map((column) => (
                <Table.Column
                  allowsSorting={column.sortable}
                  className={cn(
                    CELL_CLASS,
                    column.key !== "category" &&
                      FIGURE_COLUMN_CLASSES[column.key],
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                  id={column.key}
                  isRowHeader={column.key === "category"}
                  key={column.key}
                >
                  {({ sortDirection }) =>
                    column.sortable ? (
                      <Table.SortableColumnHeader
                        className={cn(
                          "inline-flex items-center gap-1",
                          column.align === "right" && "justify-end",
                        )}
                        indicator={
                          <ArrowUp
                            aria-hidden
                            className="size-3.5"
                            strokeWidth={2.5}
                          />
                        }
                        sortDirection={sortDirection}
                      >
                        {column.label}
                      </Table.SortableColumnHeader>
                    ) : (
                      column.label
                    )
                  }
                </Table.Column>
              ))}
            </Table.Header>
            <Table.Body>
              {sorted.map((row) => {
                const isActive = row.categoryKey === selected;
                return (
                  // No selectionMode here, and HeroUI's own selected style
                  // (bg-surface/10) is all but invisible, so the active
                  // category keeps its tint and leading accent rule.
                  <Table.Row
                    className={cn(
                      "cursor-pointer",
                      isActive &&
                        "bg-accent-soft-2 [&>td:first-child]:shadow-[inset_3px_0_0_var(--accent)]",
                    )}
                    id={row.categoryKey}
                    key={row.categoryKey}
                  >
                    <Table.Cell className={CELL_CLASS}>
                      <CategorySelect
                        category={row.categoryKey}
                        className="flex min-w-0 flex-col items-start gap-0.5"
                        isActive={isActive}
                        label={`Show ${row.category}`}
                      >
                        <span className="flex min-w-0 items-baseline gap-x-3 max-[720px]:flex-col">
                          <span
                            className={cn(
                              "whitespace-nowrap text-[15px]",
                              isActive
                                ? "font-bold text-accent-strong"
                                : "font-semibold text-foreground",
                            )}
                          >
                            {row.category}
                          </span>
                          <span className="min-w-0 max-w-full truncate text-[13.5px] text-muted">
                            {row.description}
                          </span>
                        </span>
                        <span className="truncate text-[12.5px] text-muted tabular-nums min-[720px]:hidden">
                          {formatCount(row.quota)} quota ·{" "}
                          {formatCount(row.bidsReceived)} bids ·{" "}
                          {bidsPerCoe(row)}
                        </span>
                      </CategorySelect>
                    </Table.Cell>
                    <Table.Cell
                      className={cn(
                        CELL_CLASS,
                        "text-right font-semibold text-sm sm:text-[17px]",
                      )}
                    >
                      <NumberValue
                        currency="SGD"
                        locale="en-SG"
                        maximumFractionDigits={0}
                        style="currency"
                        value={row.premium}
                      />
                    </Table.Cell>
                    <Table.Cell
                      className={cn(CELL_CLASS, "text-right text-sm")}
                    >
                      <CostTrendChip changeRatio={row.changeRatio} />
                    </Table.Cell>
                    <Table.Cell className={cn(CELL_CLASS, DEMAND_CELL_CLASS)}>
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={row.quota}
                      />
                    </Table.Cell>
                    <Table.Cell className={cn(CELL_CLASS, DEMAND_CELL_CLASS)}>
                      <NumberValue
                        locale="en-SG"
                        maximumFractionDigits={0}
                        value={row.bidsReceived}
                      />
                    </Table.Cell>
                    <Table.Cell className={cn(CELL_CLASS, DEMAND_CELL_CLASS)}>
                      {bidsPerCoe(row)}
                    </Table.Cell>
                    <Table.Cell
                      className={cn(CELL_CLASS, FIGURE_COLUMN_CLASSES.trend)}
                    >
                      <SparklineChart
                        color={isActive ? "var(--chart-1)" : "var(--chart-4)"}
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
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table.Content>
        </Table.ScrollContainer>
      </Table>

      <SourceNote className="px-1 sm:px-3">
        Quota premium at the close of each exercise. Change is against the
        previous exercise. Select a row to chart it. Sorted by{" "}
        {describeSort(sort)}.
      </SourceNote>
    </div>
  );
}
