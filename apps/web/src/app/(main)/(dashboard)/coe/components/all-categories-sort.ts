import type { CategoryKey } from "@web/app/(main)/(dashboard)/coe/components/search-params";

export interface CategoryRow {
  category: string;
  categoryKey: CategoryKey;
  changeRatio: number;
  description: string;
  premium: number;
  quota: number;
}

export const SORT_KEYS = ["category", "premium", "quota", "change"] as const;
export type SortKey = (typeof SORT_KEYS)[number];
export type SortDirection = "asc" | "desc";

export interface SortState {
  direction: SortDirection;
  key: SortKey;
}

/** The comp opens on the dearest category first. */
export const DEFAULT_SORT: SortState = { direction: "desc", key: "premium" };

/**
 * Clicking the active header flips its direction; clicking another header
 * starts it on its natural direction — A to E for the category, largest
 * first for every figure.
 */
export function nextSort(current: SortState, key: SortKey): SortState {
  if (current.key === key) {
    return {
      direction: current.direction === "asc" ? "desc" : "asc",
      key,
    };
  }
  return { direction: key === "category" ? "asc" : "desc", key };
}

const sortValue = (row: CategoryRow, key: SortKey): number | string => {
  switch (key) {
    case "category":
      return row.categoryKey;
    case "premium":
      return row.premium;
    case "quota":
      return row.quota;
    case "change":
      return row.changeRatio;
  }
};

/** A sorted copy of the rows; the input is left in category order. */
export function sortCategoryRows(
  rows: CategoryRow[],
  sort: SortState,
): CategoryRow[] {
  const sign = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((first, second) => {
    const left = sortValue(first, sort.key);
    const right = sortValue(second, sort.key);
    if (left === right) {
      return first.categoryKey.localeCompare(second.categoryKey);
    }
    return (left < right ? -1 : 1) * sign;
  });
}

/** "premium, descending" — the footnote under the table. */
export const describeSort = (sort: SortState): string =>
  `${sort.key}, ${sort.direction === "asc" ? "ascending" : "descending"}`;
