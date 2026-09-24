import type { CategoryRow } from "@web/app/(main)/(dashboard)/coe/components/all-categories-sort";
import { AllCategoriesTable } from "@web/app/(main)/(dashboard)/coe/components/all-categories-table";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("@web/app/(main)/(dashboard)/coe/components/coe-controls", () => ({
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
  useCoeCategory: () => ({ selectCategory: vi.fn() }),
}));

vi.mock("posthog-js", () => ({ default: { capture: vi.fn() } }));

/** Deliberately not in premium order, so the default sort is visible. */
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

type TableScreen = Awaited<ReturnType<typeof renderTable>>;

const rowLabels = (screen: TableScreen) =>
  screen
    .getByRole("button", { name: /^Show / })
    .elements()
    .map((row) => row.getAttribute("aria-label"));

const renderTable = () =>
  render(<AllCategoriesTable rows={rows} selected="A" />);

describe("AllCategoriesTable", () => {
  it("should open on the highest premium first", async () => {
    const screen = await renderTable();

    expect(rowLabels(screen)).toEqual([
      "Show Category E",
      "Show Category B",
      "Show Category A",
      "Show Category C",
      "Show Category D",
    ]);
    await expect
      .element(screen.getByRole("columnheader", { name: "Premium" }))
      .toHaveAttribute("aria-sort", "descending");
    await expect
      .element(screen.getByText(/Sorted by premium, descending/))
      .toBeVisible();
  });

  it("should re-sort when a header is pressed", async () => {
    const screen = await renderTable();

    await screen.getByRole("columnheader", { name: "Category" }).click();

    await expect
      .element(screen.getByRole("columnheader", { name: "Category" }))
      .toHaveAttribute("aria-sort", "ascending");
    expect(rowLabels(screen)).toEqual([
      "Show Category A",
      "Show Category B",
      "Show Category C",
      "Show Category D",
      "Show Category E",
    ]);
    await expect
      .element(screen.getByText(/Sorted by category, ascending/))
      .toBeVisible();
  });
});
