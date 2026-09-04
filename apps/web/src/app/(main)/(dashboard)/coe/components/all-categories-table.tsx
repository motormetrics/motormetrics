"use client";

import { cn, Typography } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import {
  type CategoryRow,
  DEFAULT_SORT,
  describeSort,
  nextSort,
  type SortKey,
  type SortState,
  sortCategoryRows,
} from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import {
  CategorySelect,
  useCoeCategory,
} from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import { ArrowDown, ArrowUp } from "lucide-react";
import posthog from "posthog-js";
import { useState } from "react";

const COLUMNS: { align: "left" | "right"; key: SortKey; label: string }[] = [
  { align: "left", key: "category", label: "Category" },
  { align: "right", key: "premium", label: "Premium" },
  { align: "right", key: "quota", label: "Quota" },
  { align: "right", key: "change", label: "Change" },
];

/**
 * Fixed figure columns so the rows line up under their headers. The narrowest
 * step exists because the comp's tracks add up to 380px of figures, which is
 * wider than a 320px phone leaves the table once the page gutter is out.
 */
const FIGURE_COLUMN_CLASSES: Record<Exclude<SortKey, "category">, string> = {
  premium: "w-[4.75rem] sm:w-[6.5rem] lg:w-[150px]",
  quota: "w-[3.25rem] sm:w-[4.5rem] lg:w-[120px]",
  change: "w-[4.25rem] sm:w-[5.5rem] lg:w-[110px]",
};

const CELL_CLASS = "px-1 py-3.5 sm:px-2";

/**
 * The five-category table with sortable headers.
 *
 * A client island only for the sort state: the rows arrive from the server in
 * category order and are re-ordered here without another fetch. Clicking a row
 * selects its category through the URL, the same as the circles up top.
 *
 * A real `<table>` rather than the comp's CSS grid: sortable column headers
 * need `aria-sort` on a `columnheader`, which only means something inside a
 * table. `border-separate` is what lets the selected row carry a radius.
 */
export function AllCategoriesTable({
  rows,
  selected,
}: {
  rows: CategoryRow[];
  selected: CategoryKey;
}) {
  const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
  const { setCategory } = useCoeCategory();

  const sorted = sortCategoryRows(rows, sort);

  const selectCategory = (category: CategoryKey) => {
    posthog.capture("dashboard_filter_changed", {
      filter: "category",
      value: category,
    });
    setCategory(category);
  };

  return (
    <div className="flex flex-col gap-4">
      <table className="w-full table-fixed border-separate border-spacing-0 tabular-nums">
        <thead>
          <tr>
            {COLUMNS.map((column) => {
              const isActive = column.key === sort.key;
              const Arrow = sort.direction === "asc" ? ArrowUp : ArrowDown;
              return (
                <th
                  aria-sort={
                    isActive
                      ? sort.direction === "asc"
                        ? "ascending"
                        : "descending"
                      : "none"
                  }
                  className={cn(
                    "border-separator border-b pb-3",
                    CELL_CLASS,
                    column.key !== "category" &&
                      FIGURE_COLUMN_CLASSES[column.key],
                    column.align === "right" ? "text-right" : "text-left",
                  )}
                  key={column.key}
                  scope="col"
                >
                  <button
                    className={cn(
                      "inline-flex cursor-pointer items-center gap-1 font-semibold text-[13px] transition-colors",
                      isActive
                        ? "text-accent-strong"
                        : "text-muted hover:text-muted-strong",
                    )}
                    onClick={() => setSort(nextSort(sort, column.key))}
                    type="button"
                  >
                    {column.label}
                    {isActive ? (
                      <Arrow
                        aria-hidden
                        className="size-3.5"
                        strokeWidth={2.5}
                      />
                    ) : null}
                  </button>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row) => {
            const isActive = row.categoryKey === selected;
            const cellClass = cn(
              CELL_CLASS,
              !isActive && "border-separator border-b",
            );
            return (
              <tr
                className={cn(
                  "cursor-pointer transition-colors",
                  isActive
                    ? "bg-accent-soft-2 [&>td:first-child]:rounded-l-2xl [&>td:last-child]:rounded-r-2xl"
                    : "hover:bg-default",
                )}
                key={row.categoryKey}
                onClick={(event) => {
                  // The category cell is already a button that selects the
                  // row; its click bubbles here, so only the bare cells
                  // need the row-level handler.
                  if ((event.target as HTMLElement).closest("button")) {
                    return;
                  }
                  selectCategory(row.categoryKey);
                }}
              >
                <td className={cellClass}>
                  <CategorySelect
                    category={row.categoryKey}
                    className="flex items-center gap-3.5"
                    isActive={isActive}
                    label={`Show ${row.category}`}
                  >
                    <span
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-full font-extrabold text-base",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "bg-accent-soft text-accent-strong",
                      )}
                    >
                      {row.categoryKey}
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-bold text-base">
                        {row.category}
                      </span>
                      <span className="truncate font-medium text-[13.5px] text-muted">
                        {row.description}
                      </span>
                    </span>
                  </CategorySelect>
                </td>
                <td
                  className={cn(
                    cellClass,
                    "text-right font-extrabold text-sm sm:text-lg",
                  )}
                >
                  <NumberValue
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={row.premium}
                  />
                </td>
                <td
                  className={cn(
                    cellClass,
                    "text-right font-bold text-[15px] text-muted-strong",
                  )}
                >
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.quota}
                  />
                </td>
                <td className={cn(cellClass, "text-right")}>
                  <CostTrendChip changeRatio={row.changeRatio} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <Typography.Paragraph color="muted" size="sm">
        Premiums are the quota premium at the close of the exercise. Sorted by{" "}
        {describeSort(sort)}.
      </Typography.Paragraph>
    </div>
  );
}
