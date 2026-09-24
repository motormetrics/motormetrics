import { DimensionTable } from "@web/app/(main)/(dashboard)/cars/components/dimension-table";
import type { DimensionStat } from "@web/queries/cars";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import type { RenderResult } from "vitest-browser-react";
import { render } from "vitest-browser-react";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

// The browser mocker hands a CommonJS dependency's whole factory result to a
// default import, and it must be an object. Spreading a forwardRef component in
// keeps the mocked module itself a valid React element type.
vi.mock("next/image", async () => {
  const { forwardRef } = await import("react");
  const MockImage = forwardRef<HTMLImageElement, ComponentProps<"img">>(
    ({ alt, ...props }, ref) => (
      // biome-ignore lint/performance/noImgElement: stands in for next/image itself
      <img alt={alt} ref={ref} {...props} />
    ),
  );
  return { ...MockImage, default: MockImage };
});

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
const visibleNames = (screen: RenderResult) =>
  screen
    .getByRole("row")
    .all()
    .slice(1)
    .map((row) => spokenText(row.getByRole("rowheader").first().element()));

/**
 * Text as a screen reader announces it: the avatar's monogram is
 * `aria-hidden`, so it is dropped the way `textContent` would not.
 */
const spokenText = (element: Element) => {
  const clone = element.cloneNode(true) as Element;
  for (const hidden of clone.querySelectorAll("[aria-hidden]")) {
    hidden.remove();
  }
  return clone.textContent;
};

const searchBox = (screen: RenderResult) =>
  screen.getByRole("searchbox", { name: "Search makes" });

describe("DimensionTable", () => {
  it("should render every row with its rank, value and share", async () => {
    const screen = await renderTable();

    await expect.element(screen.getByText("Top makes")).toBeVisible();
    await expect
      .element(screen.getByText(/Year to date through October 2025 · 3 rows/))
      .toBeVisible();

    const row = screen.getByRole("row").nth(1);
    expect(spokenText(row.getByRole("rowheader").first().element())).toBe(
      "1TOYOTA",
    );

    const cells = row.getByRole("gridcell");
    await expect.element(cells.nth(0)).toHaveTextContent("600");
    await expect.element(cells.nth(1)).toHaveTextContent("60.0%");
    await expect.element(cells.nth(2)).toHaveTextContent("+12.5%");
  });

  it("should show a dash where a row has no comparable period", async () => {
    const screen = await renderTable();

    const row = screen.getByRole("row").nth(3);
    await expect
      .element(row.getByText("No comparable period"))
      .toBeInTheDocument();
  });

  it("should sort by change, keeping rows without one at the bottom", async () => {
    const screen = await renderTable();

    await screen.getByRole("columnheader", { name: /Change/ }).click();

    await expect
      .poll(() => visibleNames(screen))
      .toEqual(["2BMW", "1TOYOTA", "3BYD"]);
    await expect
      .element(screen.getByText(/Sorted by change, ascending/))
      .toBeVisible();

    await screen.getByRole("columnheader", { name: /Change/ }).click();

    await expect
      .poll(() => visibleNames(screen))
      .toEqual(["1TOYOTA", "2BMW", "3BYD"]);
  });

  it("should show the make's logo when one is known", async () => {
    const screen = await render(
      <DimensionTable
        dimension="make"
        logoUrlBySlug={{ toyota: "https://cdn.example/toyota.png" }}
        monthLabel="October 2025"
        rows={rows}
      />,
      { wrapper },
    );

    await expect
      .element(screen.getByRole("img", { name: "TOYOTA logo" }))
      .toBeVisible();
    await expect
      .element(screen.getByRole("img", { name: "BMW logo" }))
      .not.toBeInTheDocument();
  });

  it("should filter rows by the search query", async () => {
    const screen = await renderTable();

    await searchBox(screen).fill("bm");

    await expect.poll(() => visibleNames(screen)).toEqual(["2BMW"]);
    await expect
      .element(screen.getByText(/Year to date through October 2025 · 1 row$/))
      .toBeVisible();
  });

  it("should show an empty state naming the query when nothing matches", async () => {
    const screen = await renderTable();

    await searchBox(screen).fill("zzz");

    await expect.poll(() => visibleNames(screen)).toEqual([]);
    await expect
      .element(screen.getByText("Nothing matches “zzz”."))
      .toBeVisible();
  });

  it("should reverse the order when the active column header is clicked", async () => {
    const screen = await renderTable();

    expect(visibleNames(screen)).toEqual(["1TOYOTA", "2BMW", "3BYD"]);

    await screen.getByRole("columnheader", { name: /Registrations/ }).click();

    await expect
      .poll(() => visibleNames(screen))
      .toEqual(["3BYD", "2BMW", "1TOYOTA"]);
    await expect
      .element(screen.getByText(/Sorted by registrations, ascending/))
      .toBeVisible();
    await expect
      .element(screen.getByRole("columnheader", { name: /Registrations/ }))
      .toHaveAttribute("aria-sort", "ascending");
  });

  it("should sort by name when the name column is chosen", async () => {
    const screen = await renderTable();

    await screen.getByRole("columnheader", { name: /^Make/ }).click();

    await expect
      .poll(() => visibleNames(screen))
      .toEqual(["2BMW", "3BYD", "1TOYOTA"]);
  });

  it("should switch dimension through the URL when another tab is pressed", async () => {
    const screen = await renderTable();

    const tab = screen.getByRole("radio", { name: "Fuel types" });
    await expect.element(tab).toHaveAttribute("aria-checked", "false");

    await tab.click();

    await expect
      .poll(() =>
        onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("dimension"),
      )
      .toBe("fuelType");
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "dimension",
      value: "fuelType",
    });
  });

  it("should collapse a long list to the first ten rows", async () => {
    const screen = await renderTable(manyRows);

    expect(visibleNames(screen)).toHaveLength(10);
    await expect
      .element(
        screen.getByText(/Year to date through October 2025 · top 10 of 25/),
      )
      .toBeVisible();
  });

  it("should link to the dimension's own page rather than expanding", async () => {
    const screen = await renderTable(manyRows);

    await expect
      .element(screen.getByRole("link", { name: /Show all 25 makes/ }))
      .toHaveAttribute("href", "/cars/makes");
  });

  it("should not offer to expand a list that already fits", async () => {
    const screen = await renderTable();

    await expect
      .element(screen.getByRole("link", { name: /Show all/ }))
      .not.toBeInTheDocument();
  });

  it("should show every match when searching, without truncating", async () => {
    const screen = await renderTable(manyRows);

    await searchBox(screen).fill("MAKE");

    await expect.poll(() => visibleNames(screen)).toHaveLength(25);
    await expect
      .element(screen.getByRole("link", { name: /Show all/ }))
      .not.toBeInTheDocument();
  });
});
