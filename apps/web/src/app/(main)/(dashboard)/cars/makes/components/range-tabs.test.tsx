import { RangeTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/range-tabs";
import { RANGE_LABELS } from "@web/app/(main)/(dashboard)/cars/makes/search-params";
import { withNuqsTestingAdapter } from "nuqs/adapters/testing";
import posthog from "posthog-js";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("RangeTabs", () => {
  it("should select the current range", async () => {
    const screen = await render(<RangeTabs />, {
      wrapper: withNuqsTestingAdapter({ searchParams: { range: "ytd" } }),
    });

    for (const [range, label] of Object.entries(RANGE_LABELS)) {
      await expect
        .element(screen.getByRole("radio", { name: label }))
        .toHaveAttribute("aria-checked", range === "ytd" ? "true" : "false");
    }
  });

  it("should still run the action when a range is picked", async () => {
    const screen = await render(<RangeTabs />, {
      wrapper: withNuqsTestingAdapter({ searchParams: { range: "ytd" } }),
    });

    await screen.getByRole("radio", { name: "Last 12 months" }).click();

    expect(posthog.capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "range",
      value: "12m",
    });
  });
});
