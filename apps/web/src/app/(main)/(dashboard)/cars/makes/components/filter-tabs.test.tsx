import { FilterTabs } from "@web/app/(main)/(dashboard)/cars/makes/components/filter-tabs";
import { render } from "vitest-browser-react";

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

const TABS = [
  { href: "/cars/makes?range=month", id: "month", label: "This month" },
  { href: "/cars/makes", id: "ytd", label: "Year to date" },
  { href: "/cars/makes?range=12m", id: "12m", label: "Last 12 months" },
];

describe("FilterTabs", () => {
  it("should render every option as a link to its own URL", async () => {
    const screen = await render(
      <FilterTabs
        aria-label="Registration period"
        filter="range"
        selectedKey="ytd"
        tabs={TABS}
      />,
    );

    for (const { href, label } of TABS) {
      await expect
        .element(screen.getByRole("tab", { name: label }))
        .toHaveAttribute("href", href);
    }
  });

  it("should select the option the server resolved", async () => {
    const screen = await render(
      <FilterTabs
        aria-label="Registration period"
        filter="range"
        selectedKey="12m"
        tabs={TABS}
      />,
    );

    await expect
      .element(screen.getByRole("tab", { name: "Last 12 months" }))
      .toHaveAttribute("aria-selected", "true");
    await expect
      .element(screen.getByRole("tab", { name: "Year to date" }))
      .toHaveAttribute("aria-selected", "false");
  });
});
