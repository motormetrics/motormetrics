import { render, screen } from "@testing-library/react";
import { ComingSoon } from "@web/components/coming-soon";

describe("ComingSoon", () => {
  it("should render ComingSoon label", () => {
    render(
      <ComingSoon>
        <span>Trends</span>
      </ComingSoon>,
    );

    expect(document.body.firstChild).toMatchSnapshot();
    expect(screen.getByText("Coming Soon")).toBeInTheDocument();
  });
});
