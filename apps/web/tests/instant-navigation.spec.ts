import { instant } from "@next/playwright";
import { expect, test } from "@playwright/test";

const KNOWN_BLOG_SLUG =
  "electric-vehicles-dominate-singapore-car-market-march-2026";

test.describe("Instant Navigations", () => {
  test.describe.configure({ mode: "serial" });
  test.setTimeout(90_000);

  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem(
        "motormetrics:notification-prompt-dismissed",
        "true",
      );
    });
  });

  test("should show car registrations shell instantly from home", async ({
    page,
  }) => {
    // Start at home, then open cars hub which exposes the registrations Link.
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible({ timeout: 60_000 });

    await page.goto("/cars", { waitUntil: "domcontentloaded" });
    await expect(
      page.locator('a[href="/cars/registrations"]').first(),
    ).toBeVisible({ timeout: 60_000 });

    await instant(page, async () => {
      await page.click('a[href="/cars/registrations"]');
      await expect(
        page.getByRole("heading", { level: 1, name: "Car Registrations" }),
      ).toBeVisible();
    });
  });

  test("should show COE results shell instantly from home", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await expect(
      page.getByRole("heading", { level: 1, name: "Overview" }),
    ).toBeVisible({ timeout: 60_000 });

    await page.goto("/coe", { waitUntil: "domcontentloaded" });
    await expect(page.locator('a[href="/coe/results"]').first()).toBeVisible({
      timeout: 60_000,
    });

    await instant(page, async () => {
      await page.click('a[href="/coe/results"]');
      await expect(
        page.getByRole("heading", { level: 1, name: "COE Results" }),
      ).toBeVisible();
    });
  });

  test("should show blog post shell instantly from blog list", async ({
    page,
  }) => {
    await page.goto("/blog", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
      timeout: 60_000,
    });

    const postLink = page.locator(`a[href="/blog/${KNOWN_BLOG_SLUG}"]`).first();
    const fallbackLink = page
      .locator('a[href^="/blog/"]')
      .filter({ hasNotText: "Back" })
      .first();
    const link = (await postLink.count()) > 0 ? postLink : fallbackLink;
    await expect(link).toBeVisible({ timeout: 60_000 });

    await instant(page, async () => {
      await link.click();
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
    });
  });
});
