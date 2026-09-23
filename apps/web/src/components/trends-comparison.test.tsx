import { TrendsComparison } from "@web/components/trends-comparison";
import { NuqsTestingAdapter } from "nuqs/adapters/testing";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

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
  it("should render TrendsComparison content when open", async () => {
    const handleChange = vi.fn();
    const screen = await render(
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

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(page.getByText("Trends Comparison"))
      .toBeInTheDocument();
  });

  it("should render loading state when comparison data is unavailable", async () => {
    const handleChange = vi.fn();
    await render(
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

    await expect
      .element(page.getByText("Loading comparison data…"))
      .toBeInTheDocument();
  });
});
