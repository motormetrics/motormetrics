import { render } from "vitest-browser-react";
import { DashboardPageMeta } from "./dashboard-page-meta";

vi.mock("@web/components/shared/last-updated", () => ({
  LastUpdated: ({ lastUpdated }: { lastUpdated: number }) => (
    <span data-testid="last-updated">{lastUpdated}</span>
  ),
}));

describe("DashboardPageMeta", () => {
  it("should render last updated and custom content", async () => {
    const screen = await render(
      <DashboardPageMeta lastUpdated={1704067200000}>
        <button type="button">Compare</button>
      </DashboardPageMeta>,
    );

    expect(screen.container).toMatchSnapshot();
    await expect
      .element(screen.getByTestId("last-updated"))
      .toHaveTextContent("1704067200000");
    await expect
      .element(screen.getByRole("button", { name: "Compare", exact: true }))
      .toBeVisible();
  });

  it("should hide last updated when value is null or zero", async () => {
    const screen = await render(<DashboardPageMeta lastUpdated={null} />);
    await expect
      .element(screen.getByTestId("last-updated"))
      .not.toBeInTheDocument();

    await screen.rerender(<DashboardPageMeta lastUpdated={0} />);
    await expect
      .element(screen.getByTestId("last-updated"))
      .not.toBeInTheDocument();
  });
});
