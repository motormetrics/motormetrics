import { render } from "@testing-library/react";
import { SitePage } from "./site-page";

describe("SitePage", () => {
  it("should render its children in the shared column", () => {
    const { container, getByText } = render(
      <SitePage>
        <p>About</p>
      </SitePage>,
    );

    expect(getByText("About")).toBeInTheDocument();
    expect(container.querySelector(".gap-16")).toBeInTheDocument();
  });

  it("should merge a caller class name", () => {
    const { container } = render(
      <SitePage className="pb-24">
        <p>Advertise</p>
      </SitePage>,
    );

    expect(container.querySelector(".pb-24")).toBeInTheDocument();
  });
});
