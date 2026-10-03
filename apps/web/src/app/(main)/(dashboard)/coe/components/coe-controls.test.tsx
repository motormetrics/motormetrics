import {
  CategorySelect,
  CategoryTabs,
  RangeTabs,
} from "@web/app/(main)/(dashboard)/coe/components/coe-controls";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({ onUrlUpdate });

beforeEach(() => {
  onUrlUpdate.mockClear();
  capture.mockClear();
});

describe("CategoryTabs", () => {
  it("should render the five categories with the selected one pressed", async () => {
    const screen = await render(<CategoryTabs selected="C" />, { wrapper });

    const items = screen.getByRole("radio");
    expect(items.all()).toHaveLength(5);
    expect(items.all().map((item) => item.element().textContent)).toEqual([
      "Cat A",
      "Cat B",
      "Cat C",
      "Cat D",
      "Cat E",
    ]);
    await expect
      .element(screen.getByRole("radio", { name: "Cat C" }))
      .toBeChecked();
  });

  it("should write the category to the URL and capture the change", async () => {
    const screen = await render(<CategoryTabs selected="A" />, { wrapper });

    await screen.getByRole("radio", { name: "Cat B" }).click();

    await expect
      .poll(() =>
        onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("category"),
      )
      .toBe("B");
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "category",
      value: "B",
    });
  });
});

describe("RangeTabs", () => {
  it("should label each range by its number of exercises", async () => {
    const screen = await render(<RangeTabs />, { wrapper });

    expect(
      screen
        .getByRole("radio")
        .all()
        .map((item) => item.element().textContent),
    ).toEqual(["6 exercises", "12 exercises", "24 exercises"]);
    await expect
      .element(screen.getByRole("radio", { name: "12 exercises" }))
      .toBeChecked();
  });

  it("should write the range to the URL and capture the change", async () => {
    const screen = await render(<RangeTabs />, { wrapper });

    await screen.getByRole("radio", { name: "24 exercises" }).click();

    await expect
      .poll(() => onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("range"))
      .toBe("24");
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "range",
      value: "24",
    });
  });
});

describe("CategorySelect", () => {
  it("should render a pressed ghost button that selects its category", async () => {
    const screen = await render(
      <CategorySelect category="D" isActive label="Select Category D">
        <span>Category D</span>
      </CategorySelect>,
      { wrapper },
    );

    const button = screen.getByRole("button", { name: "Select Category D" });
    await expect.element(button).toHaveAttribute("aria-pressed", "true");
    await expect.element(button).toHaveClass("button--ghost");

    await button.click();

    await expect
      .poll(() =>
        onUrlUpdate.mock.calls.at(-1)?.[0].searchParams.get("category"),
      )
      .toBe("D");
  });
});
