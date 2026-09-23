import { ComingSoon } from "@web/components/coming-soon";
import { render } from "vitest-browser-react";

describe("ComingSoon", () => {
  it("should render ComingSoon label", async () => {
    const screen = await render(
      <ComingSoon>
        <span>Trends</span>
      </ComingSoon>,
    );

    expect(screen.container).toMatchSnapshot();
    await expect.element(screen.getByText("Coming Soon")).toBeInTheDocument();
  });
});
