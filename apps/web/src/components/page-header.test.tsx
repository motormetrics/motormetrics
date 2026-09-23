import { PageHeader } from "@web/components/page-header";
import { render } from "vitest-browser-react";

describe("PageHeader", () => {
  it("should render title, subtitle, last updated, and children", async () => {
    const screen = await render(
      <PageHeader
        title="COE Trends"
        subtitle="Latest insights"
        lastUpdated={1704067200000}
      >
        <span data-testid="extra-actions">Actions</span>
      </PageHeader>,
    );

    await expect.element(screen.getByText("COE Trends")).toBeInTheDocument();
    await expect
      .element(screen.getByText("Latest insights"))
      .toBeInTheDocument();
    await expect.element(screen.getByText(/Last updated/)).toBeInTheDocument();
    await expect
      .element(screen.getByTestId("extra-actions"))
      .toBeInTheDocument();
  });

  it("should render without optional props", async () => {
    const screen = await render(<PageHeader title="Simple Header" />);

    await expect.element(screen.getByText("Simple Header")).toBeInTheDocument();
  });
});
