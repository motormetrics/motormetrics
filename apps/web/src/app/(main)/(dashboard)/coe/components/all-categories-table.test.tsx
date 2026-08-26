import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AllCategoriesTable, type CategoryRow } from "./all-categories-table";

vi.mock("./coe-controls", () => ({
  CategorySelect: ({
    children,
    label,
  }: {
    children: React.ReactNode;
    label: string;
  }) => (
    <button aria-label={label} type="button">
      {children}
    </button>
  ),
}));

/** Deliberately not in premium order, so any re-sorting would be visible. */
const rows: CategoryRow[] = [
  {
    category: "Category A",
    categoryKey: "A",
    changeRatio: 0.02,
    description: "Cars up to 1,600cc and 130bhp",
    premium: 96_000,
    quota: 1_200,
  },
  {
    category: "Category B",
    categoryKey: "B",
    changeRatio: -0.01,
    description: "Cars above 1,600cc or 130bhp",
    premium: 118_000,
    quota: 900,
  },
  {
    category: "Category C",
    categoryKey: "C",
    changeRatio: 0.03,
    description: "Goods vehicles and buses",
    premium: 72_000,
    quota: 400,
  },
  {
    category: "Category D",
    categoryKey: "D",
    changeRatio: 0,
    description: "Motorcycles",
    premium: 9_500,
    quota: 500,
  },
  {
    category: "Category E",
    categoryKey: "E",
    changeRatio: 0.04,
    description: "Open category",
    premium: 120_000,
    quota: 300,
  },
];

const renderTable = () =>
  render(
    <AllCategoriesTable
      exercise="October 2025 · first bidding"
      rows={rows}
      selected="A"
    />,
  );

describe("AllCategoriesTable", () => {
  it("should list the categories from A to E regardless of premium", () => {
    renderTable();

    expect(
      screen
        .getAllByRole("button")
        .map((row) => row.getAttribute("aria-label")),
    ).toEqual([
      "Show Category A",
      "Show Category B",
      "Show Category C",
      "Show Category D",
      "Show Category E",
    ]);
  });

  it("should render the column headings as labels rather than sort controls", () => {
    renderTable();

    for (const heading of ["Category", "Premium", "Quota", "Change"]) {
      expect(screen.getByText(heading)).toBeVisible();
    }

    expect(screen.queryByRole("button", { name: /Sort by/ })).toBeNull();
  });
});
