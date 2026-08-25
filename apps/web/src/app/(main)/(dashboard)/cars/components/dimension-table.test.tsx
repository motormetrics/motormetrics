import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DimensionStat } from "@web/queries/cars";
import { describe, expect, it, vi } from "vitest";
import { DimensionTable } from "./dimension-table";

const setDimension = vi.fn();

vi.mock("nuqs", () => ({
  parseAsStringLiteral: () => ({
    withDefault: () => ({ withOptions: () => ({}) }),
  }),
  useQueryState: () => ["make", setDimension],
}));

const rows: DimensionStat[] = [
  { name: "TOYOTA", count: 600, share: 60, trend: [], yoyChange: 12.5 },
  { name: "BMW", count: 300, share: 30, trend: [], yoyChange: -4.2 },
  { name: "BYD", count: 100, share: 10, trend: [], yoyChange: null },
];

const renderTable = () =>
  render(
    <DimensionTable dimension="make" monthLabel="October 2025" rows={rows} />,
  );

/** Row order as the reader sees it, header row excluded. */
const visibleNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("cell")[0].textContent);

const searchBox = () => screen.getByRole("searchbox", { name: "Search makes" });

describe("DimensionTable", () => {
  it("should render every row with its rank, value, share and change", () => {
    renderTable();

    expect(screen.getByText("Top makes")).toBeVisible();
    expect(
      screen.getByText(/Year to date through October 2025 · 3 rows/),
    ).toBeVisible();

    const cells = within(screen.getAllByRole("row")[1]).getAllByRole("cell");
    expect(cells[0]).toHaveTextContent("1TOYOTA");
    expect(cells[1]).toHaveTextContent("600");
    expect(cells[2]).toHaveTextContent("60.0%");
    expect(cells[3]).toHaveTextContent("+12.5%");
  });

  it("should label a value with no comparable prior period as new", () => {
    renderTable();

    expect(screen.getByText("New")).toBeVisible();
  });

  it("should filter rows by the search query", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(searchBox(), "bm");

    expect(visibleNames()).toEqual(["2BMW"]);
    expect(
      screen.getByText(/Year to date through October 2025 · 1 row$/),
    ).toBeVisible();
  });

  it("should show an empty state naming the query when nothing matches", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(searchBox(), "zzz");

    expect(visibleNames()).toEqual([]);
    expect(screen.getByText("Nothing matches “zzz”.")).toBeVisible();
  });

  it("should reverse the order when the active column header is clicked", async () => {
    const user = userEvent.setup();
    renderTable();

    expect(visibleNames()).toEqual(["1TOYOTA", "2BMW", "3BYD"]);

    await user.click(screen.getByRole("button", { name: /Registrations/ }));

    expect(visibleNames()).toEqual(["3BYD", "2BMW", "1TOYOTA"]);
    expect(
      screen.getByText(/Sorted by registrations, ascending/),
    ).toBeVisible();
    expect(
      screen.getByRole("columnheader", { name: /Registrations/ }),
    ).toHaveAttribute("aria-sort", "ascending");
  });

  it("should sort by name when the name column is chosen", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(
      within(screen.getByRole("columnheader", { name: /^Make/ })).getByRole(
        "button",
      ),
    );

    expect(visibleNames()).toEqual(["2BMW", "3BYD", "1TOYOTA"]);
  });

  it("should sort a value with no prior period last on change", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: /^Change/ }));

    expect(visibleNames()).toEqual(["1TOYOTA", "2BMW", "3BYD"]);
  });

  it("should switch dimension through the URL when another tab is pressed", async () => {
    const user = userEvent.setup();
    renderTable();

    const tab = screen.getByRole("button", { name: "Fuel types" });
    expect(tab).toHaveAttribute("aria-pressed", "false");

    await user.click(tab);

    expect(setDimension).toHaveBeenCalledWith("fuelType");
  });
});
