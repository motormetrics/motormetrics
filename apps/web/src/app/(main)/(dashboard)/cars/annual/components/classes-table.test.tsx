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

const rowNames = (screen: Awaited<ReturnType<typeof renderTable>>) =>
  screen
    .getByText(/^(Buses|Cars|Taxis)$/)
    .elements()
    .map((element) => element.textContent);

describe("ClassesTable", () => {
  it("should list the largest population first", async () => {
    const screen = await renderTable();

    expect(rowNames(screen)).toEqual(["Cars", "Taxis", "Buses"]);
  });

  it("should mark the population column as sorted descending", async () => {
    const screen = await renderTable();

    await expect
      .element(screen.getByRole("columnheader", { name: "Population" }))
      .toHaveAttribute("aria-sort", "descending");
  });

  it("should sort names ascending when the class header is clicked", async () => {
    const screen = await renderTable();

    const header = screen.getByRole("columnheader", { name: "Vehicle class" });
    await header.click();

    await expect.element(header).toHaveAttribute("aria-sort", "ascending");
    expect(rowNames(screen)).toEqual(["Buses", "Cars", "Taxis"]);
    await expect
      .element(screen.getByText(/Sorted by name, ascending\./))
      .toBeVisible();
  });

  it("should flip population to ascending on a second click", async () => {
    const screen = await renderTable();

    const header = screen.getByRole("columnheader", { name: "Population" });
    await header.click();

    await expect.element(header).toHaveAttribute("aria-sort", "ascending");
    expect(rowNames(screen)).toEqual(["Buses", "Taxis", "Cars"]);
    await expect
      .element(screen.getByText(/Sorted by population, ascending\./))
      .toBeVisible();
  });

  it("should sort change descending on its first click", async () => {
    const screen = await renderTable();

    const header = screen.getByRole("columnheader", { name: "Change" });
    await header.click();

    await expect.element(header).toHaveAttribute("aria-sort", "descending");
    expect(rowNames(screen)).toEqual(["Cars", "Taxis", "Buses"]);
    await expect
      .element(screen.getByText(/Sorted by change, descending\./))
      .toBeVisible();
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
