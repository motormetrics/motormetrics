import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { AdoptionColumns } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/adoption-columns";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({
  searchParams: { month: "2025-10" },
  onUrlUpdate,
});

const columns = [
  { month: "2025-08", share: 24.1 },
  { month: "2025-09", share: 28.4 },
  { month: "2025-10", share: 30.4 },
];

describe("AdoptionColumns", () => {
  beforeEach(() => {
    onUrlUpdate.mockClear();
  });

  it("should render one labelled column per month", () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-10" />, {
      wrapper,
    });

    expect(screen.getByRole("button", { name: "Show Aug 2025" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show Sep 2025" })).toBeTruthy();
    expect(screen.getByRole("button", { name: "Show Oct 2025" })).toBeTruthy();
  });

  it("should mark only the selected month as pressed", () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-09" />, {
      wrapper,
    });

    expect(
      screen
        .getByRole("button", { name: "Show Sep 2025" })
        .getAttribute("aria-pressed"),
    ).toBe("true");
    expect(
      screen
        .getByRole("button", { name: "Show Oct 2025" })
        .getAttribute("aria-pressed"),
    ).toBe("false");
  });

  it("should move the page to the month behind the column that was clicked", async () => {
    render(<AdoptionColumns columns={columns} selectedMonth="2025-10" />, {
      wrapper,
    });

    fireEvent.click(screen.getByRole("button", { name: "Show Aug 2025" }));

    // nuqs flushes URL updates asynchronously.
    await waitFor(() => expect(onUrlUpdate).toHaveBeenCalledOnce());
    expect(onUrlUpdate.mock.calls[0]?.[0].searchParams.get("month")).toBe(
      "2025-08",
    );
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "month",
      value: "2025-08",
    });
  });

  it("should scale every column against the tallest share", () => {
    const { container } = render(
      <AdoptionColumns columns={columns} selectedMonth="2025-10" />,
      { wrapper },
    );
    const bars = container.querySelectorAll<HTMLElement>("[data-column-bar]");

    expect(bars).toHaveLength(3);
    expect(bars[2]?.style.height).toBe("100%");
    // Browsers round the serialised percentage, so compare numerically.
    expect(Number.parseFloat(bars[0]?.style.height ?? "")).toBeCloseTo(
      (24.1 / 30.4) * 100,
      3,
    );
  });

  it("should not divide by zero when no month has any share", () => {
    const { container } = render(
      <AdoptionColumns
        columns={[{ month: "2025-10", share: 0 }]}
        selectedMonth="2025-10"
      />,
      { wrapper },
    );
    const bar = container.querySelector<HTMLElement>("[data-column-bar]");

    expect(bar?.style.height).toBe("0%");
  });
});
