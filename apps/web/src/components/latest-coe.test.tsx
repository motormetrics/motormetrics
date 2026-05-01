import { render, screen } from "@testing-library/react";
import type { CoeMonthlyPremium } from "@web/queries/coe";
import type { COECategory, COEResult } from "@web/types";
import type React from "react";
import { LatestCoePremium } from "./coe/latest-coe-premium";

vi.mock("@web/components/animated-number", () => ({
  AnimatedNumber: ({ value }: { value: number }) => <span>{value}</span>,
}));

vi.mock("@heroui-pro/react", () => {
  const AreaChart = ({ children }: { children: React.ReactNode }) => (
    <div data-testid="sparkline">{children}</div>
  );
  AreaChart.Area = ({ stroke }: { stroke: string }) => (
    <div data-testid="sparkline-area" data-colour={stroke} />
  );

  return { AreaChart };
});

describe("LatestCoe", () => {
  const mockResults: COEResult[] = [
    {
      month: "2024-01",
      biddingNo: 1,
      vehicleClass: "Category A",
      quota: 100,
      bidsSuccess: 90,
      bidsReceived: 120,
      premium: 95000,
    },
    {
      month: "2024-01",
      biddingNo: 1,
      vehicleClass: "Category B",
      quota: 80,
      bidsSuccess: 75,
      bidsReceived: 100,
      premium: 105000,
    },
  ];

  it("should render all COE results", () => {
    render(<LatestCoePremium results={mockResults} />);

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Category A")).toBeInTheDocument();
    expect(screen.getByText("Category B")).toBeInTheDocument();
    expect(screen.getByText("95000")).toBeInTheDocument();
    expect(screen.getByText("105000")).toBeInTheDocument();
  });

  it("should render with empty results", () => {
    const { container } = render(<LatestCoePremium results={[]} />);

    expect(container).toBeEmptyDOMElement();
  });

  it("should render sparklines when trends data is provided", () => {
    const mockTrends: Record<COECategory, CoeMonthlyPremium[]> = {
      "Category A": [
        { month: "2024-01", premium: 90000, biddingNo: 1 },
        { month: "2024-02", premium: 95000, biddingNo: 1 },
      ],
      "Category B": [
        { month: "2024-01", premium: 100000, biddingNo: 1 },
        { month: "2024-02", premium: 105000, biddingNo: 1 },
      ],
      "Category C": [],
      "Category D": [],
      "Category E": [],
    };

    render(<LatestCoePremium results={mockResults} trends={mockTrends} />);

    const sparklines = screen.getAllByTestId("sparkline");
    expect(sparklines).toHaveLength(2);
  });

  it("should not render sparklines when trends data is not provided", () => {
    render(<LatestCoePremium results={mockResults} />);

    const sparklines = screen.queryAllByTestId("sparkline");
    expect(sparklines).toHaveLength(0);
  });

  it("should use danger colour when premium trend goes up", () => {
    const trends: Record<COECategory, CoeMonthlyPremium[]> = {
      "Category A": [
        { month: "2024-01", premium: 90000, biddingNo: 1 },
        { month: "2024-02", premium: 95000, biddingNo: 1 },
      ],
      "Category B": [],
      "Category C": [],
      "Category D": [],
      "Category E": [],
    };

    render(<LatestCoePremium results={[mockResults[0]]} trends={trends} />);

    expect(screen.getByTestId("sparkline-area")).toHaveAttribute(
      "data-colour",
      "var(--danger)",
    );
  });

  it("should use success colour when premium trend goes down", () => {
    const trends: Record<COECategory, CoeMonthlyPremium[]> = {
      "Category A": [
        { month: "2024-01", premium: 95000, biddingNo: 1 },
        { month: "2024-02", premium: 90000, biddingNo: 1 },
      ],
      "Category B": [],
      "Category C": [],
      "Category D": [],
      "Category E": [],
    };

    render(<LatestCoePremium results={[mockResults[0]]} trends={trends} />);

    expect(screen.getByTestId("sparkline-area")).toHaveAttribute(
      "data-colour",
      "var(--success)",
    );
  });

  it("should use warning colour when premium trend is neutral", () => {
    const trends: Record<COECategory, CoeMonthlyPremium[]> = {
      "Category A": [
        { month: "2024-01", premium: 90000, biddingNo: 1 },
        { month: "2024-02", premium: 90000, biddingNo: 1 },
      ],
      "Category B": [],
      "Category C": [],
      "Category D": [],
      "Category E": [],
    };

    render(<LatestCoePremium results={[mockResults[0]]} trends={trends} />);

    expect(screen.getByTestId("sparkline-area")).toHaveAttribute(
      "data-colour",
      "var(--warning)",
    );
  });

  it("should use primary colour when there is only one premium point", () => {
    const trends: Record<COECategory, CoeMonthlyPremium[]> = {
      "Category A": [{ month: "2024-01", premium: 90000, biddingNo: 1 }],
      "Category B": [],
      "Category C": [],
      "Category D": [],
      "Category E": [],
    };

    render(<LatestCoePremium results={[mockResults[0]]} trends={trends} />);

    expect(screen.getByTestId("sparkline-area")).toHaveAttribute(
      "data-colour",
      "var(--accent)",
    );
  });
});
