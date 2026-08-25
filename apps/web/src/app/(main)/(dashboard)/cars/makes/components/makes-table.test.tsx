import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { MakesTable, type MakesTableRow } from "./makes-table";

const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

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

const renderTable = () =>
  render(<MakesTable fuelTabs={null} rangeLabel="Year to date" rows={rows} />);

const makeNames = () =>
  screen
    .getAllByRole("link")
    .map((link) => link.getAttribute("href")?.replace("/cars/makes/", ""));

// Rows are real anchors, so a click makes jsdom try to navigate and log an
// unhandled "Not implemented: navigation" error. Cancelling the default is safe
// here: React Aria drives `onPress` from pointer events, not from the click
// default action, so the row still reports its selection.
const preventNavigation = (event: MouseEvent) => event.preventDefault();

describe("MakesTable", () => {
  beforeEach(() => {
    capture.mockClear();
    document.addEventListener("click", preventNavigation, true);
  });

  afterEach(() => {
    document.removeEventListener("click", preventNavigation, true);
  });

  it("lists every make with a link to its detail page", () => {
    renderTable();

    expect(makeNames()).toEqual(["toyota", "byd", "mazda"]);
  });

  it("sorts by registrations descending by default", () => {
    renderTable();

    expect(
      screen.getByText(/Sorted by registrations, descending/),
    ).toBeVisible();
  });

  it("filters rows by the search query", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(
      screen.getByRole("textbox", { name: "Search makes" }),
      "yd",
    );

    expect(makeNames()).toEqual(["byd"]);
  });

  it("shows the empty state when nothing matches", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(
      screen.getByRole("textbox", { name: "Search makes" }),
      "ferrari",
    );

    expect(screen.getByText("Nothing matches “ferrari”.")).toBeVisible();
    expect(screen.queryAllByRole("link")).toHaveLength(0);
  });

  it("sorts by make name ascending on the first click of that header", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: /Make/ }));

    expect(makeNames()).toEqual(["byd", "mazda", "toyota"]);
  });

  it("reverses the direction when the active header is clicked again", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: /Registrations/ }));

    expect(makeNames()).toEqual(["mazda", "byd", "toyota"]);
  });

  it("sinks makes without a year-on-year figure when sorting by change", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getByRole("button", { name: /Change/ }));

    expect(makeNames()).toEqual(["byd", "toyota", "mazda"]);
  });

  it("captures car_make_searched when a row is opened", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.click(screen.getAllByRole("link")[1]);

    expect(capture).toHaveBeenCalledExactlyOnceWith("car_make_searched", {
      make: "BYD",
    });
  });

  it("does not capture car_make_searched while the query is being typed", async () => {
    const user = userEvent.setup();
    renderTable();

    await user.type(
      screen.getByRole("textbox", { name: "Search makes" }),
      "byd",
    );

    expect(capture).not.toHaveBeenCalled();
  });

  it("renders a dash instead of a delta chip when there is no comparison", () => {
    renderTable();

    const mazdaRow = screen.getAllByRole("link")[2];

    expect(within(mazdaRow).getByText("—")).toBeVisible();
  });
});
