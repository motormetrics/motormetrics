import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { DimensionStat } from "@web/queries/cars";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { describe, expect, it, vi } from "vitest";
import { DimensionTable } from "./dimension-table";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({
  searchParams: { dimension: "make" },
  onUrlUpdate,
});

const rows: DimensionStat[] = [
  { name: "TOYOTA", count: 600, share: 60, trend: [], yoyChange: 12.5 },
  { name: "BMW", count: 300, share: 30, trend: [], yoyChange: -4.2 },
  { name: "BYD", count: 100, share: 10, trend: [], yoyChange: null },
];

/** 25 makes, so the 10-row collapse threshold is crossed. */
const manyRows: DimensionStat[] = Array.from({ length: 25 }, (_, index) => ({
  name: `MAKE ${String(index + 1).padStart(2, "0")}`,
  count: 1000 - index * 10,
  share: 4,
  trend: [],
  yoyChange: 5,
}));

const renderTable = (rowsToRender: DimensionStat[] = rows) =>
  render(
    <DimensionTable
      dimension="make"
      monthLabel="October 2025"
      rows={rowsToRender}
    />,
    { wrapper },
  );

/**
 * Row order as the reader sees it, header row excluded.
 *
 * A sortable HeroUI table is an ARIA grid, so the name column is the row's
 * `rowheader` and the remaining columns are `gridcell` — there is no `cell`.
 */
const visibleNames = () =>
  screen
    .getAllByRole("row")
    .slice(1)
    .map((row) => within(row).getAllByRole("rowheader")[0].textContent);

const searchBox = () => screen.getByRole("searchbox", { name: "Search makes" });

describe("DimensionTable", () => {
  it("should render every row with its rank, value and share", () => {
    renderTable();

    expect(screen.getByText("Top makes")).toBeVisible();
    expect(
      screen.getByText(/Year to date through October 2025 · 3 rows/),
    ).toBeVisible();

    const row = within(screen.getAllByRole("row")[1]);
    expect(row.getAllByRole("rowheader")[0]).toHaveTextContent("1TOYOTA");

    const cells = row.getAllByRole("gridcell");
    expect(cells[0]).toHaveTextContent("600");
    expect(cells[1]).toHaveTextContent("60.0%");
    expect(cells[2]).toHaveTextContent("+12.5%");
  });

  it("should show a dash where a row has no comparable period", () => {
    renderTable();

    const row = within(screen.getAllByRole("row")[3]);
    expect(row.getByText("No comparable period")).toBeInTheDocument();
  });

  it("should sort by change, keeping rows without one at the bottom", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("columnheader", { name: /Change/ }));

    expect(visibleNames()).toEqual(["2BMW", "1TOYOTA", "3BYD"]);
    expect(screen.getByText(/Sorted by change, ascending/)).toBeVisible();

    await user.click(screen.getByRole("columnheader", { name: /Change/ }));

    expect(visibleNames()).toEqual(["1TOYOTA", "2BMW", "3BYD"]);
  });

  it("should show the make's logo when one is known", () => {
    render(
      <DimensionTable
        dimension="make"
        logoUrlBySlug={{ toyota: "https://cdn.example/toyota.png" }}
        monthLabel="October 2025"
        rows={rows}
      />,
      { wrapper },
    );

    expect(screen.getByRole("img", { name: "TOYOTA logo" })).toBeVisible();
    expect(screen.queryByRole("img", { name: "BMW logo" })).toBeNull();
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

    await user.click(
      screen.getByRole("columnheader", { name: /Registrations/ }),
    );

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

    await user.click(screen.getByRole("columnheader", { name: /^Make/ }));

    expect(visibleNames()).toEqual(["2BMW", "3BYD", "1TOYOTA"]);
  });

  it("should switch dimension through the URL when another tab is pressed", async () => {
    const user = userEvent.setup();
    renderTable();

    const tab = screen.getByRole("button", { name: "Fuel types" });
    expect(tab).toHaveAttribute("aria-pressed", "false");

    await user.click(tab);

    expect(
      onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("dimension"),
    ).toBe("fuelType");
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "dimension",
      value: "fuelType",
    });
  });

  it("should collapse a long list to the first ten rows", () => {
    renderTable(manyRows);

    expect(visibleNames()).toHaveLength(10);
    expect(
      screen.getByText(/Year to date through October 2025 · top 10 of 25/),
    ).toBeVisible();
  });

  it("should link to the dimension's own page rather than expanding", () => {
    renderTable(manyRows);

    expect(
      screen.getByRole("link", { name: /Show all 25 makes/ }),
    ).toHaveAttribute("href", "/cars/makes");
  });

  it("should not offer to expand a list that already fits", () => {
    renderTable();

    expect(screen.queryByRole("link", { name: /Show all/ })).toBeNull();
  });

  it("should show every match when searching, without truncating", async () => {
    const user = userEvent.setup();
    renderTable(manyRows);

    await user.type(searchBox(), "MAKE");

    expect(visibleNames()).toHaveLength(25);
    expect(screen.queryByRole("link", { name: /Show all/ })).toBeNull();
  });
});
