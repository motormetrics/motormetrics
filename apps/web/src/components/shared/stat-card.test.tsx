import type { RegistrationStat } from "@web/types/cars";
import { render } from "vitest-browser-react";
import { StatCard } from "./stat-card";

vi.mock(
  "@web/app/(main)/(dashboard)/cars/registrations/bar-chart-by-type",
  () => ({
    BarChartByType: ({ data }: { data: RegistrationStat[] }) => (
      <div data-testid="bar-chart">
        {data.map((item) => (
          <div key={item.name}>
            {item.name}: {item.count}
          </div>
        ))}
      </div>
    ),
  }),
);

vi.mock("@web/config", () => ({
  FUEL_TYPE: {
    OTHERS: "Others",
  },
}));

describe("StatCard", () => {
  const mockData: RegistrationStat[] = [
    { name: "Petrol", count: 1000 },
    { name: "Electric", count: 500 },
  ];

  const defaultProps = {
    title: "Test Title",
    description: "Test Description",
    data: mockData,
    total: 1500,
  };

  it("should render with required props", async () => {
    const screen = await render(<StatCard {...defaultProps} />);

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Test Title")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Test Description"))
      .toBeInTheDocument();
    await expect.element(screen.getByTestId("bar-chart")).toBeInTheDocument();
  });

  it("should render with empty data", async () => {
    const screen = await render(<StatCard {...defaultProps} data={[]} />);
    await expect.element(screen.getByText("Test Title")).toBeInTheDocument();
  });

  it("should render with hero variant", async () => {
    const screen = await render(<StatCard {...defaultProps} variant="hero" />);

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Test Title")).toBeInTheDocument();
  });
});
