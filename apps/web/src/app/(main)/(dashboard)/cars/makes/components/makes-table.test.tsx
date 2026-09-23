import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { userEvent } from "vitest/browser";
import { type RenderResult, render } from "vitest-browser-react";
import { MakesTable, type MakesTableRow } from "./makes-table";

const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({ searchParams: {} });

const rows: MakesTableRow[] = [
  {
    count: 800,
    logoUrl: null,
    make: "TOYOTA",
    rank: 1,
    share: 50,
    slug: "toyota",
    yoyChange: 4.1,
  },
  {
    count: 500,
    logoUrl: null,
    make: "BYD",
    rank: 2,
    share: 31.25,
    slug: "byd",
    yoyChange: 22.5,
  },
  {
    count: 300,
    logoUrl: null,
    make: "MAZDA",
    rank: 3,
    share: 18.75,
    slug: "mazda",
    yoyChange: null,
  },
];

/** 25 makes, so the 10-row collapse threshold is crossed. */
const manyRows: MakesTableRow[] = Array.from({ length: 25 }, (_, index) => ({
  count: 1000 - index * 10,
  logoUrl: null,
  make: `MAKE ${String(index + 1).padStart(2, "0")}`,
  rank: index + 1,
  share: 4,
  slug: `make-${index + 1}`,
  yoyChange: 5,
}));

const renderTable = (rowsToRender: MakesTableRow[] = rows) =>
  render(
    <MakesTable fuel={null} rangeLabel="Year to date" rows={rowsToRender} />,
    { wrapper },
  );

const makeNames = (screen: RenderResult) =>
  screen
    .getByRole("link")
    .elements()
    .map((link) => link.getAttribute("href")?.replace("/cars/makes/", ""));

// Rows are real anchors, so a click would navigate the test iframe away.
// Cancelling the default is safe here: React Aria drives `onPress` from pointer
// events, not from the click default action, so the row still reports its
// selection.
const preventNavigation = (event: MouseEvent) => event.preventDefault();

describe("MakesTable", () => {
  beforeEach(() => {
    capture.mockClear();
    document.addEventListener("click", preventNavigation, true);
  });

  afterEach(() => {
    document.removeEventListener("click", preventNavigation, true);
  });

  it("should list every make with a link to its detail page", async () => {
    const screen = await renderTable();

    expect(makeNames(screen)).toEqual(["toyota", "byd", "mazda"]);
  });

  it("should sort by registrations descending by default", async () => {
    const screen = await renderTable();

    await expect
      .element(screen.getByText(/Sorted by registrations, descending/))
      .toBeVisible();
  });

  it("should filter rows by the search query", async () => {
    const screen = await renderTable();

    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search makes" }),
      "yd",
    );

    await expect.poll(() => makeNames(screen)).toEqual(["byd"]);
  });

  it("should show the empty state when nothing matches", async () => {
    const screen = await renderTable();

    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search makes" }),
      "ferrari",
    );

    await expect
      .element(screen.getByText("Nothing matches “ferrari”."))
      .toBeVisible();
    expect(screen.getByRole("link").elements()).toHaveLength(0);
  });

  it("should sort by make name ascending on the first click of that header", async () => {
    const screen = await renderTable();

    await screen.getByRole("button", { name: /Make/ }).click();

    await expect
      .poll(() => makeNames(screen))
      .toEqual(["byd", "mazda", "toyota"]);
  });

  it("should reverse the direction when the active header is clicked again", async () => {
    const screen = await renderTable();

    await screen.getByRole("button", { name: /Registrations/ }).click();

    await expect
      .poll(() => makeNames(screen))
      .toEqual(["mazda", "byd", "toyota"]);
  });

  it("should sink makes without a year-on-year figure when sorting by change", async () => {
    const screen = await renderTable();

    await screen.getByRole("button", { name: /Change/ }).click();

    await expect
      .poll(() => makeNames(screen))
      .toEqual(["byd", "toyota", "mazda"]);
  });

  it("should capture car_make_selected when a row is opened", async () => {
    const screen = await renderTable();

    await screen.getByRole("link").nth(1).click();

    expect(capture).toHaveBeenCalledExactlyOnceWith("car_make_selected", {
      make: "BYD",
      source: "makes_table",
    });
  });

  it("should not capture car_make_selected while the query is being typed", async () => {
    const screen = await renderTable();

    await userEvent.type(
      screen.getByRole("searchbox", { name: "Search makes" }),
      "byd",
    );

    expect(capture).not.toHaveBeenCalled();
  });

  it("should render a dash instead of a delta chip when there is no comparison", async () => {
    const screen = await renderTable();

    const mazdaRow = screen.getByRole("link").nth(2);

    await expect.element(mazdaRow.getByText("—")).toBeVisible();
  });

  it("should collapse a long list to the first ten makes", async () => {
    const screen = await renderTable(manyRows);

    expect(makeNames(screen)).toHaveLength(10);
    await expect
      .element(screen.getByText(/Year to date · top 10 of 25/))
      .toBeVisible();
  });

  it("should reveal the remaining makes when show all is pressed", async () => {
    const screen = await renderTable(manyRows);

    await screen.getByRole("button", { name: "Show all 25 makes" }).click();

    await expect.poll(() => makeNames(screen)).toHaveLength(25);
    await expect
      .element(screen.getByRole("button", { name: "Show fewer" }))
      .toBeVisible();
  });

  it("should mark the active powertrain tab and offer the rest", async () => {
    const screen = await render(
      <MakesTable fuel="Electric" rangeLabel="Year to date" rows={rows} />,
      { wrapper },
    );

    await expect
      .element(screen.getByRole("radio", { name: "Electric" }))
      .toHaveAttribute("aria-checked", "true");
    await expect
      .element(screen.getByRole("radio", { name: "All" }))
      .toHaveAttribute("aria-checked", "false");
  });

  it("should not offer to expand a list that already fits", async () => {
    const screen = await renderTable();

    await expect
      .element(screen.getByRole("button", { name: /Show all/ }))
      .not.toBeInTheDocument();
  });

  it("should withhold the change for a make below the volume threshold", async () => {
    const screen = await renderTable([
      {
        count: 4,
        logoUrl: null,
        make: "ROLLS ROYCE",
        rank: 1,
        share: 0.1,
        slug: "rolls-royce",
        yoyChange: 100,
      },
    ]);

    await expect.element(screen.getByText("+100.0%")).not.toBeInTheDocument();
    await expect
      .element(screen.getByTitle(/Too few registrations/))
      .toBeVisible();
  });
});
