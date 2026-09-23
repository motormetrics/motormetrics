import { render } from "vitest-browser-react";
import { DashboardPageHeader } from "./dashboard-page-header";

describe("DashboardPageHeader", () => {
  it("should render title and meta content", async () => {
    const screen = await render(
      <DashboardPageHeader
        title={<h1>Overview</h1>}
        meta={<span data-testid="meta">Last updated</span>}
      />,
    );

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByRole("heading", { name: "Overview" }))
      .toBeVisible();
    await expect
      .element(screen.getByTestId("meta"))
      .toHaveTextContent("Last updated");
  });

  it("should merge custom className", async () => {
    const screen = await render(
      <DashboardPageHeader
        className="custom-class"
        title={<span>Cars</span>}
      />,
    );

    expect(screen.container.firstElementChild).toHaveClass("custom-class");
  });
});
