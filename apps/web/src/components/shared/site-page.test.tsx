import { SitePage } from "@web/components/shared/site-page";
import { render } from "vitest-browser-react";

describe("SitePage", () => {
  it("should render its children in the shared column", async () => {
    const screen = await render(
      <SitePage>
        <p>About</p>
      </SitePage>,
    );

    await expect.element(screen.getByText("About")).toBeInTheDocument();
    expect(screen.container.querySelector(".gap-16")).toBeInTheDocument();
  });

  it("should merge a caller class name", async () => {
    const screen = await render(
      <SitePage className="pb-24">
        <p>Advertise</p>
      </SitePage>,
    );

    expect(screen.container.querySelector(".pb-24")).toBeInTheDocument();
  });
});
