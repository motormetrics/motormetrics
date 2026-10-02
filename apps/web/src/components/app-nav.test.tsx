import { AppNav } from "@web/components/app-nav";
import { SOCIAL_URLS } from "@web/config/socials";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppNav", () => {
  afterEach(async () => {
    navigation.pathname = "/";
    await page.viewport(414, 896);
  });

  it("should mark COE as current on a COE page", async () => {
    await page.viewport(1280, 800);
    navigation.pathname = "/coe/premiums";

    const screen = await render(<AppNav />);
    const coe = screen.getByRole("button", { name: "COE" });

    await expect.element(coe).toBeVisible();
    await expect.element(coe).toHaveAttribute("aria-current", "true");
    await expect
      .element(screen.getByRole("button", { name: "Cars" }))
      .not.toHaveAttribute("aria-current");
  });

  it("should mark Cars as current on an electric vehicles page", async () => {
    await page.viewport(1280, 800);
    navigation.pathname = "/cars/electric-vehicles";

    const screen = await render(<AppNav />);

    await expect
      .element(screen.getByRole("button", { name: "Cars" }))
      .toHaveAttribute("aria-current", "true");
  });

  it("should link Get updates to Telegram", async () => {
    await page.viewport(1280, 800);

    const screen = await render(<AppNav />);

    await expect
      .element(screen.getByRole("link", { name: "Get updates" }))
      .toHaveAttribute("href", SOCIAL_URLS.telegram);
  });

  // The browser suite loads no Tailwind, so the collapse is checked through
  // the container-query classes rather than computed visibility.
  it("should collapse the links behind the menu toggle below a 56rem header", async () => {
    const screen = await render(<AppNav />);
    const header = screen.container.querySelector(".navbar__header");
    const toggle = screen.container.querySelector(".navbar__menu-toggle");
    const content = screen.container.querySelector(".navbar__content");

    expect(header).toHaveClass("@container");
    expect(toggle).toHaveClass("@4xl:hidden");
    expect(content).toHaveClass("hidden", "@4xl:flex");
    await expect
      .element(screen.getByRole("link", { name: "Get updates" }))
      .toBeInTheDocument();
  });
});
