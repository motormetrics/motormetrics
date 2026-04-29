import { render, screen } from "@testing-library/react";
import { DashboardPageMeta } from "./dashboard-page-meta";

vi.mock("@web/components/shared/last-updated", () => ({
  LastUpdated: ({ lastUpdated }: { lastUpdated: number }) => (
    <span data-testid="last-updated">{lastUpdated}</span>
  ),
}));

describe("DashboardPageMeta", () => {
  it("should render last updated and custom content", () => {
    const { container } = render(
      <DashboardPageMeta lastUpdated={1704067200000}>
        <button type="button">Compare</button>
      </DashboardPageMeta>,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByTestId("last-updated")).toHaveTextContent(
      "1704067200000",
    );
    expect(screen.getByRole("button", { name: "Compare" })).toBeVisible();
  });

  it("should hide last updated when value is null or zero", () => {
    const { rerender } = render(<DashboardPageMeta lastUpdated={null} />);
    expect(screen.queryByTestId("last-updated")).not.toBeInTheDocument();

    rerender(<DashboardPageMeta lastUpdated={0} />);
    expect(screen.queryByTestId("last-updated")).not.toBeInTheDocument();
  });
});
