import { ClassesTable } from "@web/app/(main)/(dashboard)/cars/annual/components/classes-table";
import type { ClassRank } from "@web/app/(main)/(dashboard)/cars/annual/population-series";
import { describe, expect, it } from "vitest";
import { render } from "vitest-browser-react";

/** Deliberately not largest first, so the default sort is visible. */
const rows: ClassRank[] = [
  {
    change: null,
    colour: "var(--chart-3)",
    name: "Buses",
    population: 20,
    share: 2.7,
  },
  {
    change: 0.02,
    colour: "var(--chart-1)",
    name: "Cars",
    population: 620,
    share: 82.7,
  },
  {
    change: -0.07,
    colour: "var(--chart-2)",
    name: "Taxis",
    population: 110,
    share: 14.7,
  },
];

const renderTable = () =>
  render(<ClassesTable previousYear="2024" rows={rows} year="2025" />);

describe("ClassesTable", () => {
  it("should list the largest population first", async () => {
    const screen = await renderTable();

    const names = screen
      .getByText(/^(Buses|Cars|Taxis)$/)
      .elements()
      .map((element) => element.textContent);
    expect(names).toEqual(["Cars", "Taxis", "Buses"]);
  });

  it("should state the default sort in the caption", async () => {
    const screen = await renderTable();

    await expect
      .element(screen.getByText(/Sorted by population, descending\./))
      .toBeVisible();
  });

  it("should show a dash for a class with no prior year", async () => {
    const screen = await renderTable();

    await expect.element(screen.getByText("—")).toBeInTheDocument();
  });

  it("should render a fall as grey text with a true minus", async () => {
    const screen = await renderTable();

    const fall = screen.getByText("−7.0%");
    await expect.element(fall).toBeInTheDocument();
    await expect.element(fall).toHaveClass("text-muted-strong");
  });
});
