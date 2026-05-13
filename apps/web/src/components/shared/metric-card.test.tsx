import { render, screen } from "@testing-library/react";
import { MetricCard } from "@web/components/shared/metric-card";

describe("MetricCard", () => {
  it("should combine metric value and comparison", () => {
    render(
      <MetricCard
        title="COE Premiums"
        value={50000}
        current={50000}
        previousMonth={45000}
      />,
    );

    expect(screen.getByText("COE Premiums")).toBeInTheDocument();
    expect(screen.getByText("50,000")).toBeInTheDocument();
    expect(screen.getByText("vs last month")).toBeInTheDocument();
  });

  it("should render with hero variant", () => {
    render(
      <MetricCard
        title="Total Registrations"
        value={10000}
        current={10000}
        previousMonth={9000}
        variant="hero"
      />,
    );

    expect(screen.getByText("Total Registrations")).toBeInTheDocument();
    expect(screen.getByText("10,000")).toBeInTheDocument();
  });
});
