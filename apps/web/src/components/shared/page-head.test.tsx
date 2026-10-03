import { PageHead } from "@web/components/shared/page-head";
import { createElement } from "react";
import { describe, expect, it, vi } from "vitest";
import { render } from "vitest-browser-react";

vi.mock("next/navigation", () => ({
  usePathname: () => "/coe",
}));

vi.mock("posthog-js", () => ({
  default: { capture: vi.fn() },
}));

describe("PageHead", () => {
  it("should render the title as the page heading", async () => {
    const screen = await render(
      createElement(PageHead, { title: "Latest COE results" }),
    );

    await expect
      .element(
        screen.getByRole("heading", { level: 1, name: "Latest COE results" }),
      )
      .toBeInTheDocument();
  });

  it("should render the eyebrow and sub when passed", async () => {
    const screen = await render(
      createElement(PageHead, {
        eyebrow: "Certificate of Entitlement",
        sub: "Source: LTA via DataMall",
        title: "Latest COE results",
      }),
    );

    await expect
      .element(screen.getByText("Certificate of Entitlement"))
      .toBeInTheDocument();
    await expect
      .element(screen.getByText("Source: LTA via DataMall"))
      .toBeInTheDocument();
  });

  it("should omit the eyebrow and sub when not passed", async () => {
    const screen = await render(
      createElement(PageHead, { title: "Latest COE results" }),
    );

    await expect
      .element(screen.getByText("Certificate of Entitlement"))
      .not.toBeInTheDocument();
    await expect
      .element(screen.getByText("Source: LTA via DataMall"))
      .not.toBeInTheDocument();
  });
});
