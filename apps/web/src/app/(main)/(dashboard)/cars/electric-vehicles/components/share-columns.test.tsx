import {
  type ShareColumn,
  ShareColumns,
} from "@web/app/(main)/(dashboard)/cars/electric-vehicles/components/share-columns";
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

const column = (key: string, share: number, isSelected: boolean) => ({
  key,
  label: key.slice(5),
  other: isSelected ? 0 : share,
  selected: isSelected ? share : 0,
  share,
  title: key,
  year: "",
});

const columns: ShareColumn[] = [
  column("2025-08", 24.1, false),
  column("2025-09", 28.4, false),
  column("2025-10", 30.4, true),
];

describe("ShareColumns", () => {
  beforeEach(() => {
    onUrlUpdate.mockClear();
    capture.mockClear();
  });

  it("should draw the selected month in the darker series", async () => {
    const screen = await render(
      <ShareColumns columns={columns} ticks={[0, 10, 20, 30, 40]} />,
      { wrapper },
    );

    await vi.waitFor(() =>
      expect(
        screen.container.querySelectorAll(
          '.recharts-bar-rectangle path[fill="var(--chart-1)"]',
        ),
      ).toHaveLength(1),
    );
  });

  it("should move the page to the month behind the column that was clicked", async () => {
    const screen = await render(
      <ShareColumns columns={columns} ticks={[0, 10, 20, 30, 40]} />,
      { wrapper },
    );

    const firstColumn = await vi.waitFor(() => {
      const bar = screen.container.querySelector(
        '.recharts-bar-rectangle path[fill="var(--chart-5)"]',
      );
      expect(bar).not.toBeNull();
      return bar as SVGPathElement;
    });
    firstColumn.dispatchEvent(new MouseEvent("click", { bubbles: true }));

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
