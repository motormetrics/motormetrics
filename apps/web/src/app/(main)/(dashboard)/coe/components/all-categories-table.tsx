"use client";

import { cn } from "@heroui/react";
import { NumberValue } from "@heroui-pro/react";
import { CostTrendChip } from "@web/app/(main)/(dashboard)/components/cost-trend-chip";
import Typography from "@web/components/typography";
import { SurfaceCard } from "@web/components/v2/bento";
import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { CategorySelect } from "./coe-controls";
import type { CategoryKey } from "./search-params";

export interface CategoryRow {
  category: string;
  categoryKey: CategoryKey;
  changeRatio: number;
  description: string;
  premium: number;
  quota: number;
}

type SortKey = "category" | "change" | "premium" | "quota";
type SortDirection = "asc" | "desc";

const COLUMNS: { align: "left" | "right"; key: SortKey; label: string }[] = [
  { align: "left", key: "category", label: "Category" },
  { align: "right", key: "premium", label: "Premium" },
  { align: "right", key: "quota", label: "Quota" },
  { align: "right", key: "change", label: "Change" },
];

const SORT_NAMES: Record<SortKey, string> = {
  category: "category",
  change: "change",
  premium: "premium",
  quota: "quota",
};

/**
 * Fixed numeric columns so every row lines up — each row is its own grid, so
 * `auto` tracks would size independently and stagger. Kept narrow enough that
 * the category name still fits in the two-column layout below `2xl`.
 */
const GRID =
  "grid grid-cols-[minmax(0,1fr)_5.5rem_4rem_4.75rem_1rem] gap-2 2xl:grid-cols-[minmax(0,1fr)_7rem_5rem_5.5rem_1.5rem] 2xl:gap-3";

const compareRows = (
  first: CategoryRow,
  second: CategoryRow,
  key: SortKey,
): number => {
  switch (key) {
    case "category":
      return first.categoryKey.localeCompare(second.categoryKey);
    case "change":
      return first.changeRatio - second.changeRatio;
    case "quota":
      return first.quota - second.quota;
    default:
      return first.premium - second.premium;
  }
};

/**
 * The five-category table. Sorting is local state rather than URL state: every
 * row is already on the client, so re-ordering needs no server round-trip —
 * unlike the category and range controls, which change what is fetched.
 */
export function AllCategoriesTable({
  exercise,
  rows,
  selected,
}: {
  exercise: string;
  rows: CategoryRow[];
  selected: CategoryKey;
}) {
  const [sort, setSort] = useState<{ direction: SortDirection; key: SortKey }>({
    direction: "desc",
    key: "premium",
  });

  const sorted = [...rows].sort((first, second) => {
    const order = compareRows(first, second, sort.key);
    return sort.direction === "asc" ? order : -order;
  });

  const toggleSort = (key: SortKey) =>
    setSort((current) =>
      current.key === key
        ? {
            direction: current.direction === "asc" ? "desc" : "asc",
            key,
          }
        : { direction: key === "category" ? "asc" : "desc", key },
    );

  return (
    <SurfaceCard className="gap-4">
      <div className="flex flex-wrap items-center gap-3.5">
        <div className="flex flex-col">
          <Typography.H3 className="font-bold text-2xl tracking-[-0.02em]">
            All categories
          </Typography.H3>
          <Typography.TextSm className="font-semibold text-muted">
            {exercise} · five categories
          </Typography.TextSm>
        </div>
        <Typography.Caption className="ml-auto whitespace-nowrap font-semibold text-[var(--subtle)]">
          Sorted by {SORT_NAMES[sort.key]},{" "}
          {sort.direction === "asc" ? "ascending" : "descending"}
        </Typography.Caption>
      </div>

      <div className="flex flex-col">
        <div
          className={cn(
            GRID,
            "items-center border-separator border-b px-4 pt-4 pb-3",
          )}
        >
          {COLUMNS.map((column) => {
            const isActive = column.key === sort.key;
            return (
              <button
                aria-label={`Sort by ${SORT_NAMES[column.key]}`}
                aria-pressed={isActive}
                className={cn(
                  "font-bold text-[13px] uppercase tracking-[0.06em]",
                  column.align === "right" ? "text-right" : "text-left",
                  isActive
                    ? "text-[var(--accent-strong)]"
                    : "text-[var(--subtle)]",
                )}
                key={column.key}
                onClick={() => toggleSort(column.key)}
                type="button"
              >
                {column.label}
                {isActive ? (sort.direction === "asc" ? " ↑" : " ↓") : ""}
              </button>
            );
          })}
          <span />
        </div>

        {sorted.map((row) => {
          const isActive = row.categoryKey === selected;
          return (
            <CategorySelect
              category={row.categoryKey}
              className={cn(
                "rounded-[var(--radius)] transition-colors",
                isActive ? "bg-[var(--accent-soft)]" : "hover:bg-background",
              )}
              isActive={isActive}
              key={row.category}
              label={`Show ${row.category}`}
            >
              <div className={cn(GRID, "items-center px-4 py-3.5")}>
                <span className="flex min-w-0 items-center gap-3">
                  <span
                    className={cn(
                      "flex size-[38px] shrink-0 items-center justify-center rounded-full font-extrabold text-[15px]",
                      isActive
                        ? "bg-accent text-[var(--accent-foreground)]"
                        : "bg-[var(--accent-soft)] text-[var(--accent-strong)]",
                    )}
                  >
                    {row.categoryKey}
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="truncate font-bold text-base">
                      {row.category}
                    </span>
                    <span className="truncate font-medium text-[13px] text-muted">
                      {row.description}
                    </span>
                  </span>
                </span>
                <span className="text-right font-extrabold text-base tabular-nums">
                  <NumberValue
                    currency="SGD"
                    locale="en-SG"
                    maximumFractionDigits={0}
                    style="currency"
                    value={row.premium}
                  />
                </span>
                <span className="text-right font-bold text-[15px] text-[var(--muted-strong)] tabular-nums">
                  <NumberValue
                    locale="en-SG"
                    maximumFractionDigits={0}
                    value={row.quota}
                  />
                </span>
                <span className="flex justify-end">
                  <CostTrendChip changeRatio={row.changeRatio} />
                </span>
                <ChevronRight
                  aria-hidden
                  className="size-[18px] justify-self-end text-[var(--subtle)]"
                />
              </div>
            </CategorySelect>
          );
        })}
      </div>

      <Typography.Caption className="px-4 font-medium text-[var(--subtle)]">
        Premiums are the quota premium at the close of the exercise. Select a
        category for its bidding history.
      </Typography.Caption>
    </SurfaceCard>
  );
}
