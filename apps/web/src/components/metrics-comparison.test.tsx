import { MetricsComparison } from "@web/components/metrics-comparison";
import { render } from "vitest-browser-react";

describe("MetricsComparison", () => {
  it("should indicate positive growth", async () => {
    const screen = await render(
      <MetricsComparison current={110} previousMonth={100} />,
    );
    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("vs last month")).toBeInTheDocument();
    await expect.element(screen.getByText("10%")).toBeInTheDocument();
  });

  it("should indicate negative growth", async () => {
    const screen = await render(
      <MetricsComparison current={90} previousMonth={100} />,
    );
    await expect.element(screen.getByText("vs last month")).toBeInTheDocument();
    await expect.element(screen.getByText("10%")).toBeInTheDocument();
  });
});
