import { render } from "vitest-browser-react";
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

    it("should render chart title and description", async () => {
      // The pointer stays wherever an earlier test left it. Resting over the
      // plot, it opens Recharts' tooltip and changes the snapshot, so park it
      // on a small element at the top of the page before the chart renders.
      const parking = await render(<span>Pointer parking</span>);
      await parking.getByText("Pointer parking").hover();
      await parking.unmount();

      const screen = await render(<TopMakesChart {...defaultProps} />);

      await expect
        .element(screen.getByText("Top Makes - Petrol", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(
          screen.getByText("Most popular brands in this category", {
            exact: true,
          }),
        )
        .toBeInTheDocument();
      expect(screen.container).toMatchSnapshot();
    });

    it("should render custom description when provided", async () => {
      const screen = await render(
        <TopMakesChart {...defaultProps} description="Custom description" />,
      );

      await expect
        .element(screen.getByText("Custom description", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render top 3 ranking chips", async () => {
      const screen = await render(<TopMakesChart {...defaultProps} />);

      // Recharts also renders a hidden measurement span with the label text.
      await expect
        .element(screen.getByText("Toyota", { exact: true }).first())
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("Honda", { exact: true }).first())
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("BMW", { exact: true }).first())
        .toBeInTheDocument();
    });

    it("should render empty state when makes array is empty", async () => {
      const screen = await render(
        <TopMakesChart makes={[]} total={0} title="Petrol" />,
      );

      await expect
        .element(screen.getByText("No make data available", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("No data available", { exact: true }))
        .toBeInTheDocument();
    });

    it("should handle zero total without division error", async () => {
      const props = {
        makes: [{ make: "Toyota", count: 100 }],
        total: 0,
        title: "Test",
      };

      await expect(render(<TopMakesChart {...props} />)).resolves.toBeDefined();
    });
  });

  describe("CategorySummaryCard", () => {
    it("should render total registrations", async () => {
      const screen = await render(
        <CategorySummaryCard total={5000} previousTotal={null} />,
      );

      await expect
        .element(screen.getByText("Total Registrations", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render positive change indicator when current is higher", async () => {
      const screen = await render(
        <CategorySummaryCard total={5500} previousTotal={5000} />,
      );

      await expect
        .element(screen.getByText("+10%", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("vs last month", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render negative change indicator when current is lower", async () => {
      const screen = await render(
        <CategorySummaryCard total={4500} previousTotal={5000} />,
      );

      await expect
        .element(screen.getByText("-10%", { exact: true }))
        .toBeInTheDocument();
    });

    it("should not render comparison when previousTotal is null", async () => {
      const screen = await render(
        <CategorySummaryCard total={5000} previousTotal={null} />,
      );

      await expect
        .element(screen.getByText("vs last month", { exact: true }))
        .not.toBeInTheDocument();
    });

    it("should not render comparison when previousTotal is zero", async () => {
      const screen = await render(
        <CategorySummaryCard total={5000} previousTotal={0} />,
      );

      await expect
        .element(screen.getByText("vs last month", { exact: true }))
        .not.toBeInTheDocument();
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

    it("should render market insights heading", async () => {
      const screen = await render(<CategoryInsightsCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Market Insights", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render formatted month", async () => {
      const screen = await render(<CategoryInsightsCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Jan 2024", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render categories count", async () => {
      const screen = await render(<CategoryInsightsCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Active Categories", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("5", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("Fuel Type types", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render top performer name", async () => {
      const screen = await render(<CategoryInsightsCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Top Performer", { exact: true }))
        .toBeInTheDocument();
      expect(
        screen.getByText("Petrol", { exact: true }).elements().length,
      ).toBeGreaterThan(0);
    });

    it("should render market share percentage", async () => {
      const screen = await render(<CategoryInsightsCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Market Share", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("45.5%", { exact: true }))
        .toBeInTheDocument();
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

    it("should render total registrations card", async () => {
      const screen = await render(<CategoryHeroCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Total Registrations", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("Jan 2024", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render market share card", async () => {
      const screen = await render(<CategoryHeroCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Market Share", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("30%", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("of all registrations", { exact: true }))
        .toBeInTheDocument();
    });

    it("should render category ranking card", async () => {
      const screen = await render(<CategoryHeroCard {...defaultProps} />);

      await expect
        .element(screen.getByText("Category Ranking", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("#1", { exact: true }))
        .toBeInTheDocument();
      await expect
        .element(screen.getByText("of 5 types", { exact: true }))
        .toBeInTheDocument();
    });

    it("should handle zero totalRegistrations without division error", async () => {
      const props = {
        ...defaultProps,
        totalRegistrations: 0,
      };

      const renderResult = render(<CategoryHeroCard {...props} />);
      await expect(renderResult).resolves.toBeDefined();
      const screen = await renderResult;
      await expect
        .element(screen.getByText("0%", { exact: true }))
        .toBeInTheDocument();
    });

    it("should display ranking emoji for top 3 positions", async () => {
      const screen = await render(<CategoryHeroCard {...defaultProps} />);

      await expect
        .element(screen.getByText("🥇", { exact: true }))
        .toBeInTheDocument();

      await screen.rerender(<CategoryHeroCard {...defaultProps} rank={2} />);
      await expect
        .element(screen.getByText("🥈", { exact: true }))
        .toBeInTheDocument();

      await screen.rerender(<CategoryHeroCard {...defaultProps} rank={3} />);
      await expect
        .element(screen.getByText("🥉", { exact: true }))
        .toBeInTheDocument();
    });

    it("should include fuel in category description for fuel types", async () => {
      const screen = await render(
        <CategoryHeroCard {...defaultProps} typeName="Fuel Type A" />,
      );

      await expect
        .element(screen.getByText("of 5 fuel types", { exact: true }))
        .toBeInTheDocument();
    });
  });
});
