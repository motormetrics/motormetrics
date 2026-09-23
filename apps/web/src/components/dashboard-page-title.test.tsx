import { render } from "vitest-browser-react";
import { DashboardPageTitle } from "./dashboard-page-title";

describe("DashboardPageTitle", () => {
  it("should render title with badge and subtitle", async () => {
    const screen = await render(
      <DashboardPageTitle
        title="Car Registrations"
        subtitle="Latest monthly overview"
        badge={<span data-testid="badge">New</span>}
      />,
    );

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(
        screen.getByRole("heading", { level: 1, name: "Car Registrations" }),
      )
      .toBeVisible();
    await expect
      .element(screen.getByText("Latest monthly overview"))
      .toBeVisible();
    await expect.element(screen.getByTestId("badge")).toHaveTextContent("New");
  });

  it("should render without optional subtitle and badge", async () => {
    const screen = await render(<DashboardPageTitle title="COE" />);

    await expect
      .element(screen.getByRole("heading", { level: 1, name: "COE" }))
      .toBeVisible();
    await expect.element(screen.getByTestId("badge")).not.toBeInTheDocument();
    await expect
      .element(screen.getByText("Latest monthly overview"))
      .not.toBeInTheDocument();
  });
});
