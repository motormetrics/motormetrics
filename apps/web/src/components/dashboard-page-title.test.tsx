import { render, screen } from "@testing-library/react";
import { DashboardPageTitle } from "./dashboard-page-title";

describe("DashboardPageTitle", () => {
  it("should render title with badge and subtitle", () => {
    const { container } = render(
      <DashboardPageTitle
        title="Car Registrations"
        subtitle="Latest monthly overview"
        badge={<span data-testid="badge">New</span>}
      />,
    );

    expect(container).toMatchSnapshot();
    expect(
      screen.getByRole("heading", { level: 1, name: "Car Registrations" }),
    ).toBeVisible();
    expect(screen.getByText("Latest monthly overview")).toBeVisible();
    expect(screen.getByTestId("badge")).toHaveTextContent("New");
  });

  it("should render without optional subtitle and badge", () => {
    render(<DashboardPageTitle title="COE" />);

    expect(
      screen.getByRole("heading", { level: 1, name: "COE" }),
    ).toBeVisible();
    expect(screen.queryByTestId("badge")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Latest monthly overview"),
    ).not.toBeInTheDocument();
  });
});
