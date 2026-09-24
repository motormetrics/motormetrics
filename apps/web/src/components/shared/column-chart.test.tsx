import { ColumnChart } from "@web/components/shared/column-chart";
import { userEvent } from "vitest/browser";
import { render } from "vitest-browser-react";

const columns = [
  { key: "2024-08", label: "Aug", value: 4460 },
  { key: "2024-09", label: "Sep", value: 4180 },
  {
    key: "2024-10",
    label: "Oct",
    tooltip: {
      rows: [{ label: "Premium", value: "$4,640" }],
      title: "Oct · Cat A",
    },
    value: 4640,
    valueLabel: "4,640",
  },
];

describe("ColumnChart", () => {
  it("should draw one column per point with the last highlighted", async () => {
    const screen = await render(<ColumnChart columns={columns} />);
    const buttons = screen.getByRole("button");
    expect(buttons.elements()).toHaveLength(3);
    await expect.element(buttons.nth(2)).toMatchTextContent("4,640");
  });

  it("should show the tooltip on hover", async () => {
    const screen = await render(<ColumnChart columns={columns} />);
    expect(screen.getByText("Oct · Cat A").query()).toBeNull();
    await screen.getByRole("button").nth(2).hover();
    await expect.element(screen.getByText("Oct · Cat A")).toBeInTheDocument();
    await expect.element(screen.getByText("$4,640")).toBeInTheDocument();
  });

  it("should hand the key back on select", async () => {
    const onSelect = vi.fn();
    const screen = await render(
      <ColumnChart
        columns={columns}
        highlightKey="2024-09"
        onSelect={onSelect}
      />,
    );
    // The pointer is left wherever the previous test put it. Without the app's
    // stylesheet the tooltip renders in flow, so a column opening under the
    // resting pointer reflows the row mid-click; park the pointer first.
    await userEvent.unhover(screen.container);
    await screen.getByRole("button").nth(0).click();
    expect(onSelect).toHaveBeenCalledWith("2024-08");
    await expect
      .element(screen.getByRole("button").nth(1))
      .toHaveAttribute("aria-pressed", "true");
  });
});
