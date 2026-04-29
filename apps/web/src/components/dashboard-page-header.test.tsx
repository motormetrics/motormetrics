import { render, screen } from "@testing-library/react";
import { DashboardPageHeader } from "./dashboard-page-header";

describe("DashboardPageHeader", () => {
  it("should render title and meta content", () => {
    const { container } = render(
      <DashboardPageHeader
        title={<h1>Overview</h1>}
        meta={<span data-testid="meta">Last updated</span>}
      />,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByRole("heading", { name: "Overview" })).toBeVisible();
    expect(screen.getByTestId("meta")).toHaveTextContent("Last updated");
  });

  it("should merge custom className", () => {
    const { container } = render(
      <DashboardPageHeader
        className="custom-class"
        title={<span>Cars</span>}
      />,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
