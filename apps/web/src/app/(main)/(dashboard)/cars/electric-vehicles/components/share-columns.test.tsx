import { ShareColumns } from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
import {
  type OnUrlUpdateFunction,
  withNuqsTestingAdapter,
} from "nuqs/adapters/testing";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

const onUrlUpdate = vi.fn<OnUrlUpdateFunction>();
const capture = vi.hoisted(() => vi.fn());

vi.mock("posthog-js", () => ({ default: { capture } }));

const wrapper = withNuqsTestingAdapter({
  searchParams: { month: "2025-10" },
  onUrlUpdate,
});

const columns = [
  { key: "2025-08", label: "Aug", value: 24.1, valueLabel: "24%" },
  { key: "2025-09", label: "Sep", value: 28.4, valueLabel: "28%" },
  { key: "2025-10", label: "Oct", value: 30.4, valueLabel: "30%" },
];

describe("ShareColumns", () => {
  beforeEach(() => {
    onUrlUpdate.mockClear();
    capture.mockClear();
  });

  it("should mark only the selected month as pressed", async () => {
    const screen = await render(
      <ShareColumns columns={columns} selectedMonth="2025-09" />,
      { wrapper },
    );

    await expect
      .element(screen.getByRole("button", { name: "Sep: 28%" }))
      .toHaveAttribute("aria-pressed", "true");
    await expect
      .element(screen.getByRole("button", { name: "Oct: 30%" }))
      .toHaveAttribute("aria-pressed", "false");
  });

  it("should move the page to the month behind the column that was clicked", async () => {
    const screen = await render(
      <ShareColumns columns={columns} selectedMonth="2025-10" />,
      { wrapper },
    );

    await screen.getByRole("button", { name: "Aug: 24%" }).click();

    // nuqs flushes URL updates asynchronously.
    await vi.waitFor(() => expect(onUrlUpdate).toHaveBeenCalledOnce());
    expect(onUrlUpdate.mock.calls[0]?.[0].searchParams.get("month")).toBe(
      "2025-08",
    );
    expect(capture).toHaveBeenCalledWith("dashboard_filter_changed", {
      filter: "month",
      value: "2025-08",
    });
  });
});
