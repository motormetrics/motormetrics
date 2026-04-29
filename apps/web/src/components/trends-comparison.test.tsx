import { render, screen } from "@testing-library/react";
import { TrendsComparison } from "@web/components/trends-comparison";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { vi } from "vitest";

const mockMonths = ["2024-01", "2023-12", "2023-11"];

const mockComparisonData = {
  monthA: {
    month: "2024-01",
    total: 100,
    fuelType: [{ name: "Petrol", count: 60 }],
    vehicleType: [{ name: "Saloon", count: 80 }],
  },
  monthB: {
    month: "2023-12",
    total: 90,
    fuelType: [{ name: "Petrol", count: 50 }],
    vehicleType: [{ name: "Saloon", count: 70 }],
  },
};

describe("TrendsComparison", () => {
  it("should render TrendsComparison content when open", () => {
    const handleChange = vi.fn();
    render(
      <NuqsTestingAdapter>
        <TrendsComparison
          isOpen
          onOpenChange={handleChange}
          currentMonth="2024-01"
          months={mockMonths}
          comparisonData={mockComparisonData}
        />
      </NuqsTestingAdapter>,
    );

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Trends Comparison")).toBeInTheDocument();
  });

  it("should render loading state when comparison data is unavailable", () => {
    const handleChange = vi.fn();
    render(
      <NuqsTestingAdapter>
        <TrendsComparison
          isOpen
          onOpenChange={handleChange}
          currentMonth="2024-01"
          months={mockMonths}
          comparisonData={false}
        />
      </NuqsTestingAdapter>,
    );

    expect(screen.getByText("Loading comparison data…")).toBeInTheDocument();
  });
});
