import { MdxLink } from "@web/app/(main)/(site)/blog/components/mdx-components";
import { render } from "vitest-browser-react";

vi.mock("@web/app/(main)/(site)/blog/components/post-chart", () => ({
  PostChart: () => null,
}));

describe("MdxLink", () => {
  it("should mark an external link nofollow and open it in a new tab", async () => {
    const screen = await render(
      <MdxLink href="https://www.lta.gov.sg">LTA</MdxLink>,
    );
    const link = screen.getByRole("link", { name: "LTA" });

    await expect
      .element(link)
      .toHaveAttribute("rel", "noopener noreferrer nofollow");
    await expect.element(link).toHaveAttribute("target", "_blank");
  });

  it("should leave an internal link followed", async () => {
    const screen = await render(<MdxLink href="/coe">COE overview</MdxLink>);
    const link = screen.getByRole("link", { name: "COE overview" });

    await expect.element(link).toHaveAttribute("href", "/coe");
    await expect.element(link).not.toHaveAttribute("rel");
  });
});
