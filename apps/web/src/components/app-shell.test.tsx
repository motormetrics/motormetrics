import { AppShell } from "@web/components/app-shell";
import { SOCIAL_URLS } from "@web/config/socials";
import { vi } from "vitest";
import { page } from "vitest/browser";
import { render } from "vitest-browser-react";

const navigation = vi.hoisted(() => ({ pathname: "/" }));

vi.mock("next/navigation", () => ({
  usePathname: () => navigation.pathname,
  useRouter: () => ({ push: vi.fn() }),
}));

describe("AppShell", () => {
  beforeEach(async () => {
    await page.viewport(1280, 800);
  });

  afterEach(() => {
    navigation.pathname = "/";
  });

  it("should mark the matching sidebar row as the current page", async () => {
    navigation.pathname = "/coe/pqp";

    const screen = await render(<AppShell>Page</AppShell>);

    await expect
      .element(screen.getByRole("row", { name: "PQP rates" }))
      .toHaveAttribute("data-current", "true");
    await expect
      .element(screen.getByRole("row", { name: "Latest results" }))
      .not.toHaveAttribute("data-current", "true");
  });

  it("should mark the deepest match, not its section overview", async () => {
    navigation.pathname = "/cars/makes/bmw";

    const screen = await render(<AppShell>Page</AppShell>);

    await expect
      .element(screen.getByRole("row", { name: "Makes" }))
      .toHaveAttribute("data-current", "true");
    await expect
      .element(screen.getByRole("row", { name: "Cars overview" }))
      .not.toHaveAttribute("data-current", "true");
  });

  it("should link Get updates to Telegram", async () => {
    const screen = await render(<AppShell>Page</AppShell>);

    await expect
      .element(screen.getByRole("link", { name: "Get updates" }))
      .toHaveAttribute("href", SOCIAL_URLS.telegram);
  });
});
