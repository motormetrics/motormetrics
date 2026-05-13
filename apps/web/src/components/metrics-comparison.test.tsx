import { render, screen } from "@testing-library/react";
import { MetricsComparison } from "@web/components/metrics-comparison";

describe("MetricsComparison", () => {
  it("should indicate positive growth", () => {
    render(<MetricsComparison current={110} previousMonth={100} />);
    expect(screen.getByText("vs last month")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });

  it("should indicate negative growth", () => {
    render(<MetricsComparison current={90} previousMonth={100} />);
    expect(screen.getByText("vs last month")).toBeInTheDocument();
    expect(screen.getByText("10%")).toBeInTheDocument();
  });
});
