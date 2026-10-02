import { CostTrendChip } from "@web/components/shared/cost-trend-chip";
import { render } from "vitest-browser-react";

describe("CostTrendChip", () => {
  it("should render a rise with a leading plus", async () => {
    const screen = await render(<CostTrendChip changeRatio={0.02} />);
    await expect
      .element(screen.getByText("+2.0%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render a fall with a true minus", async () => {
    const screen = await render(<CostTrendChip changeRatio={-0.053} />);
    await expect
      .element(screen.getByText("−5.3%", { exact: true }))
      .toBeInTheDocument();
  });

  it("should render nothing when there is no change", async () => {
    const screen = await render(<CostTrendChip changeRatio={0} />);
    expect(screen.container.textContent).toBe("");
  });

  it("should render as plain grey text without sentiment colour", async () => {
    const screen = await render(<CostTrendChip changeRatio={-0.1} />);
    const element = screen.getByText("−10.0%").element();
    expect(element.className).toContain("text-muted-strong");
    expect(element.className).not.toMatch(/success|warning|danger/);
    expect(element.querySelector("svg")).toBeNull();
  });

  it("should merge a className override", async () => {
    const screen = await render(
      <CostTrendChip changeRatio={0.1} className="text-sm" />,
    );
    const element = screen.getByText("+10.0%").element();
    expect(element.className).toContain("text-sm");
  });
});
