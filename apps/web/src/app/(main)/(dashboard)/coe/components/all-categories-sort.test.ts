import { describe, expect, it } from "vitest";
import {
  type CategoryRow,
  DEFAULT_SORT,
  describeSort,
  nextSort,
  sortCategoryRows,
} from "./all-categories-sort";

const row = (
  categoryKey: CategoryRow["categoryKey"],
  premium: number,
  quota: number,
  changeRatio: number,
): CategoryRow => ({
  category: `Category ${categoryKey}`,
  categoryKey,
  changeRatio,
  description: "",
  premium,
  quota,
});

const rows = [
  row("A", 96_000, 1_200, 0.02),
  row("B", 118_000, 900, -0.01),
  row("C", 72_000, 400, 0.03),
  row("D", 9_500, 500, 0),
  row("E", 120_000, 300, 0.04),
];

const keys = (sorted: CategoryRow[]) => sorted.map((item) => item.categoryKey);

describe("sortCategoryRows", () => {
  it("should open on the highest premium first", () => {
    expect(keys(sortCategoryRows(rows, DEFAULT_SORT))).toEqual([
      "E",
      "B",
      "A",
      "C",
      "D",
    ]);
  });

  it("should sort by quota ascending", () => {
    expect(
      keys(sortCategoryRows(rows, { direction: "asc", key: "quota" })),
    ).toEqual(["E", "C", "D", "B", "A"]);
  });

  it("should sort by change and keep the input untouched", () => {
    const sorted = sortCategoryRows(rows, { direction: "desc", key: "change" });
    expect(keys(sorted)).toEqual(["E", "C", "A", "D", "B"]);
    expect(keys(rows)).toEqual(["A", "B", "C", "D", "E"]);
  });

  it("should fall back to category order on a tie", () => {
    const tied = [row("B", 100, 1, 0), row("A", 100, 1, 0)];
    expect(
      keys(sortCategoryRows(tied, { direction: "desc", key: "premium" })),
    ).toEqual(["A", "B"]);
  });
});

describe("nextSort", () => {
  it("should flip the direction of the active column", () => {
    expect(nextSort(DEFAULT_SORT, "premium")).toEqual({
      direction: "asc",
      key: "premium",
    });
  });

  it("should start a figure column descending and the category ascending", () => {
    expect(nextSort(DEFAULT_SORT, "quota")).toEqual({
      direction: "desc",
      key: "quota",
    });
    expect(nextSort(DEFAULT_SORT, "category")).toEqual({
      direction: "asc",
      key: "category",
    });
  });
});

describe("describeSort", () => {
  it("should name the column and direction for the footnote", () => {
    expect(describeSort(DEFAULT_SORT)).toBe("premium, descending");
    expect(describeSort({ direction: "asc", key: "category" })).toBe(
      "category, ascending",
    );
  });
});
