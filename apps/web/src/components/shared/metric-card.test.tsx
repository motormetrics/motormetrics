import { MetricCard } from "@web/components/shared/metric-card";
import { render } from "vitest-browser-react";

describe("MetricCard", () => {
  it("should combine metric value and comparison", async () => {
    const screen = await render(
      <MetricCard
        title="COE Premiums"
        value={50000}
        current={50000}
        previousMonth={45000}
      />,
    );

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("COE Premiums")).toBeInTheDocument();
    await expect.element(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("should render with hero variant", async () => {
    const screen = await render(
      <MetricCard
        title="Total Registrations"
        value={10000}
        current={10000}
        previousMonth={9000}
        variant="hero"
      />,
    );

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByText("Total Registrations"))
      .toBeInTheDocument();
  });
});
