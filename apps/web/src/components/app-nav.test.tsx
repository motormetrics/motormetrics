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

  it("should split the Cars menu into sections with separators between them", async () => {
    await page.viewport(1280, 800);

    const screen = await render(<AppNav />);
    await screen.getByRole("button", { name: "Cars" }).click();

    const menu = screen.getByRole("menu");
    await expect.element(menu).toBeVisible();
    for (const header of ["Electric", "Vehicle data", "Tools"]) {
      await expect
        .element(menu.getByText(header, { exact: true }))
        .toBeVisible();
    }
    expect(menu.getByRole("separator").elements()).toHaveLength(2);
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

  it("should open a sheet of every group with the current row marked", async () => {
    navigation.pathname = "/coe/premiums";

    const screen = await render(<AppNav />);
    await screen
      .getByRole("button", { name: "Toggle navigation menu" })
      .click();

    for (const header of [
      "Explore",
      "Electric",
      "Vehicle data",
      "Tools",
      "COE data",
      "More",
    ]) {
      // "More" also labels the desktop dropdown trigger; the sheet's eyebrow
      // comes after it in the DOM.
      await expect
        .element(screen.getByText(header, { exact: true }).last())
        .toBeVisible();
    }
    await expect
      .element(screen.getByRole("link", { name: "Premiums by category" }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(screen.getByRole("link", { name: "COE", exact: true }))
      .toHaveAttribute("aria-current", "page");
    await expect
      .element(screen.getByRole("link", { name: "COE overview" }))
      .not.toHaveAttribute("aria-current");
    expect(
      screen.getByRole("link", { name: "Get updates" }).elements(),
    ).toHaveLength(1);
  });
});
