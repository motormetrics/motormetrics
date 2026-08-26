import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { type PremiumColumn, PremiumsChart } from "./premiums-chart";

const column = (
  label: string,
  premium: number,
  changeRatio = 0.01,
): PremiumColumn => ({
  changeRatio,
  key: label,
  label,
  premium,
});

const columns = [
  column("Jan 1", 101_500),
  column("Jan 2", 100_200, -0.0128),
  column("Feb 1", 102_800),
  column("Feb 2", 103_500),
];

const renderChart = (data: PremiumColumn[] = columns) =>
  render(
    <PremiumsChart
      category="Category A"
      columns={data}
      periodLabel="Last 12 exercises"
    />,
  );

describe("PremiumsChart", () => {
  it("renders one column per exercise, labelled and described", () => {
    renderChart();

    expect(screen.getAllByRole("button")).toHaveLength(columns.length);
    expect(
      screen.getByRole("button", { name: "Jan 2: $100,200, −1.3%" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Feb 2: $103,500, +1.0%" }),
    ).toBeInTheDocument();
  });

  it("shows the tooltip on hover and hides it again", async () => {
    const user = userEvent.setup();
    renderChart();

    expect(screen.queryByText("Premium")).not.toBeInTheDocument();

    const target = screen.getByRole("button", {
      name: "Feb 1: $102,800, +1.0%",
    });
    await user.hover(target);

    expect(screen.getByText("Feb 1 · Category A")).toBeInTheDocument();
    expect(screen.getByText("$102,800")).toBeInTheDocument();

    await user.unhover(target);
    expect(screen.queryByText("Premium")).not.toBeInTheDocument();
  });

  it("gives the tallest column full height and the shortest the floor", () => {
    const { container } = renderChart();

    const bars = Array.from(
      container.querySelectorAll<HTMLElement>("span[style*='height']"),
    );

    expect(bars).toHaveLength(columns.length);
    expect(bars.at(-1)?.style.height).toBe("100%");
    // Jan 2 is the lowest premium and sits above the 0.9x baseline, so it keeps
    // a visible bar rather than collapsing.
    expect(Number.parseFloat(bars[1].style.height)).toBeGreaterThan(14);
    expect(Number.parseFloat(bars[1].style.height)).toBeLessThan(100);
  });

  it("thins the ticks once the columns outnumber the label budget", () => {
    const many = Array.from({ length: 24 }, (_, index) =>
      column(`Tick ${index}`, 100_000 + index * 100),
    );
    renderChart(many);

    const visibleTicks = Array.from(document.querySelectorAll("span")).filter(
      (node) =>
        node.textContent?.startsWith("Tick ") &&
        !node.className.includes("invisible"),
    );

    expect(visibleTicks).toHaveLength(12);
  });
});
