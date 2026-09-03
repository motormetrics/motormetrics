import { render, screen } from "@testing-library/react";
import { ComingSoon } from "@web/components/coming-soon";

describe("ComingSoon", () => {
  it("should render ComingSoon label", () => {
    const { container } = render(
      <ComingSoon>
        <span>Trends</span>
      </ComingSoon>,
    );

    expect(container).toMatchSnapshot();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });
});
