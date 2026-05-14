import { render, screen } from "@testing-library/react";
import { CategoryHeroCard } from "./category-hero-card";
import { CategoryInsightsCard } from "./category-insights-card";
import { CategorySummaryCard } from "./category-summary-card";
import { TopMakesChart } from "./top-makes-chart";

describe("Cars Category Charts", () => {
  describe("TopMakesChart", () => {
    const defaultProps = {
      makes: [
        { make: "Toyota", count: 500 },
        { make: "Honda", count: 400 },
        { make: "BMW", count: 300 },
      ],
      total: 1200,
      title: "Petrol",
    };

    it("should render chart title and description", () => {
      render(<TopMakesChart {...defaultProps} />);

      expect(screen.getByText("Top Makes - Petrol")).toBeInTheDocument();
      expect(
        screen.getByText("Most popular brands in this category"),
      ).toBeInTheDocument();
      expect(document.body.firstChild).toMatchSnapshot();
    });

    it("should render custom description when provided", () => {
      render(
        <TopMakesChart {...defaultProps} description="Custom description" />,
      );

      expect(screen.getByText("Custom description")).toBeInTheDocument();
    });

    it("should render top 3 ranking chips", () => {
      render(<TopMakesChart {...defaultProps} />);

      expect(screen.getByText("Toyota")).toBeInTheDocument();
      expect(screen.getByText("Honda")).toBeInTheDocument();
      expect(screen.getByText("BMW")).toBeInTheDocument();
    });

    it("should render empty state when makes array is empty", () => {
      render(<TopMakesChart makes={[]} total={0} title="Petrol" />);

      expect(screen.getByText("No make data available")).toBeInTheDocument();
      expect(screen.getByText("No data available")).toBeInTheDocument();
    });

    it("should handle zero total without division error", () => {
      const props = {
        makes: [{ make: "Toyota", count: 100 }],
        total: 0,
        title: "Test",
      };

      expect(() => render(<TopMakesChart {...props} />)).not.toThrow();
    });
  });

  describe("CategorySummaryCard", () => {
    it("should render total registrations", () => {
      render(<CategorySummaryCard total={5000} previousTotal={null} />);

      expect(screen.getByText("Total Registrations")).toBeInTheDocument();
    });

    it("should render positive change indicator when current is higher", () => {
      render(<CategorySummaryCard total={5500} previousTotal={5000} />);

      expect(screen.getByText("+10%")).toBeInTheDocument();
      expect(screen.getByText("vs last month")).toBeInTheDocument();
    });

    it("should render negative change indicator when current is lower", () => {
      render(<CategorySummaryCard total={4500} previousTotal={5000} />);

      expect(screen.getByText("-10%")).toBeInTheDocument();
    });

    it("should not render comparison when previousTotal is null", () => {
      render(<CategorySummaryCard total={5000} previousTotal={null} />);

      expect(screen.queryByText("vs last month")).not.toBeInTheDocument();
    });

    it("should not render comparison when previousTotal is zero", () => {
      render(<CategorySummaryCard total={5000} previousTotal={0} />);

      expect(screen.queryByText("vs last month")).not.toBeInTheDocument();
    });
  });

  describe("CategoryInsightsCard", () => {
    const defaultProps = {
      categoriesCount: 5,
      topPerformer: {
        name: "Petrol",
        percentage: 45.5,
      },
      month: "2024-01",
      title: "Fuel Type",
    };

    it("should render market insights heading", () => {
      render(<CategoryInsightsCard {...defaultProps} />);

      expect(screen.getByText("Market Insights")).toBeInTheDocument();
    });

    it("should render formatted month", () => {
      render(<CategoryInsightsCard {...defaultProps} />);

      expect(screen.getByText("Jan 2024")).toBeInTheDocument();
    });

    it("should render categories count", () => {
      render(<CategoryInsightsCard {...defaultProps} />);

      expect(screen.getByText("Active Categories")).toBeInTheDocument();
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("Fuel Type types")).toBeInTheDocument();
    });

    it("should render top performer name", () => {
      render(<CategoryInsightsCard {...defaultProps} />);

      expect(screen.getByText("Top Performer")).toBeInTheDocument();
      expect(screen.getAllByText("Petrol").length).toBeGreaterThan(0);
    });

    it("should render market share percentage", () => {
      render(<CategoryInsightsCard {...defaultProps} />);

      expect(screen.getByText("Market Share")).toBeInTheDocument();
      expect(screen.getByText("45.5%")).toBeInTheDocument();
    });
  });

  describe("CategoryHeroCard", () => {
    const defaultProps = {
      typeName: "Petrol",
      count: 1500,
      totalRegistrations: 5000,
      month: "2024-01",
      rank: 1,
      totalCategories: 5,
    };

    it("should render total registrations card", () => {
      render(<CategoryHeroCard {...defaultProps} />);

      expect(screen.getByText("Total Registrations")).toBeInTheDocument();
      expect(screen.getByText("Jan 2024")).toBeInTheDocument();
    });

    it("should render market share card", () => {
      render(<CategoryHeroCard {...defaultProps} />);

      expect(screen.getByText("Market Share")).toBeInTheDocument();
      expect(screen.getByText("30%")).toBeInTheDocument();
      expect(screen.getByText("of all registrations")).toBeInTheDocument();
    });

    it("should render category ranking card", () => {
      render(<CategoryHeroCard {...defaultProps} />);

      expect(screen.getByText("Category Ranking")).toBeInTheDocument();
      expect(screen.getByText("#1")).toBeInTheDocument();
      expect(screen.getByText("of 5 types")).toBeInTheDocument();
    });

    it("should handle zero totalRegistrations without division error", () => {
      const props = {
        ...defaultProps,
        totalRegistrations: 0,
      };

      expect(() => render(<CategoryHeroCard {...props} />)).not.toThrow();
      expect(screen.getByText("0%")).toBeInTheDocument();
    });

    it("should display ranking emoji for top 3 positions", () => {
      const { rerender } = render(<CategoryHeroCard {...defaultProps} />);

      expect(screen.getByText("🥇")).toBeInTheDocument();

      rerender(<CategoryHeroCard {...defaultProps} rank={2} />);
      expect(screen.getByText("🥈")).toBeInTheDocument();

      rerender(<CategoryHeroCard {...defaultProps} rank={3} />);
      expect(screen.getByText("🥉")).toBeInTheDocument();
    });

    it("should include fuel in category description for fuel types", () => {
      render(<CategoryHeroCard {...defaultProps} typeName="Fuel Type A" />);

      expect(screen.getByText("of 5 fuel types")).toBeInTheDocument();
    });
  });
});
